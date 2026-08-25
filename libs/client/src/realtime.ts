/* eslint-disable @typescript-eslint/no-explicit-any */
import { encode } from "@msgpack/msgpack";
import {
  ContextFunction,
  InterpretOnChangeFunction,
  Service,
  createMachine,
  guard,
  immediate,
  interpret,
  reduce,
  state,
  transition,
} from "robot3";
import {
  TOKEN_EXPIRATION_SECONDS,
  getTemporaryAuthToken,
  type TokenProvider,
} from "./auth";
import { RequiredConfig } from "./config";
import type {
  AnyRealtimeExtension,
  ManagedRealtimeSession,
  RealtimeDiagnostic,
  RealtimeExtensionOptions,
  RealtimeExtensionSession,
  RealtimeOpenOptions,
  RealtimeSession,
  RealtimeState,
} from "./realtime/extension";
import { gatherIceCandidates } from "./realtime/ice";
import {
  DEFAULT_THROTTLE_INTERVAL,
  WebSocketErrorCodes,
  buildRealtimeUrl,
  decodeRealtimeMessage,
  encodeRealtimeMessage,
  isFalErrorResult,
  isSuccessfulResult,
  isUnauthorizedError,
  realtimeTokenScope,
  type WithRequestId,
} from "./realtime/protocol";
import { ApiError } from "./response";
import { isBrowser } from "./runtime";
import type { EndpointType, InputType, OutputType } from "./types/client";
import type { Result, RunOptions } from "./types/common";
import { isReact, throttle } from "./utils";

const FAL_SERVICE_HOSTS = new Set(["wma.fal.run"]);

function assertFalInfrastructureUrl(rawUrl: string): void {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("Realtime infrastructure fetch requires an absolute URL.");
  }

  const host = url.host.toLowerCase();
  const isFalInfrastructure =
    url.protocol === "https:" &&
    (host === "fal.ai" ||
      host.endsWith(".fal.ai") ||
      FAL_SERVICE_HOSTS.has(host));
  if (!isFalInfrastructure) {
    throw new Error(
      "Realtime infrastructure fetch is restricted to fal-operated HTTPS hosts.",
    );
  }
}

// Define the context
interface Context {
  token?: string;
  enqueuedMessage?: any;
  websocket?: WebSocket;
  error?: Error;
}

const initialState: ContextFunction<Context> = () => ({
  enqueuedMessage: undefined,
});

type SendEvent = { type: "send"; message: any };
type AuthenticatedEvent = { type: "authenticated"; token: string };
type InitiateAuthEvent = { type: "initiateAuth" };
type UnauthorizedEvent = { type: "unauthorized"; error: Error };
type ConnectedEvent = { type: "connected"; websocket: WebSocket };
type ConnectionClosedEvent = {
  type: "connectionClosed";
  code: number;
  reason: string;
};

type Event =
  | SendEvent
  | AuthenticatedEvent
  | InitiateAuthEvent
  | UnauthorizedEvent
  | ConnectedEvent
  | ConnectionClosedEvent;

function hasToken(context: Context): boolean {
  return context.token !== undefined;
}

function noToken(context: Context): boolean {
  return !hasToken(context);
}

function enqueueMessage(context: Context, event: SendEvent): Context {
  return {
    ...context,
    enqueuedMessage: event.message,
  };
}

function closeConnection(context: Context): Context {
  if (context.websocket && context.websocket.readyState === WebSocket.OPEN) {
    context.websocket.close();
  }
  return {
    ...context,
    websocket: undefined,
  };
}

function sendMessage(context: Context, event: SendEvent): Context {
  if (context.websocket && context.websocket.readyState === WebSocket.OPEN) {
    if (event.message instanceof Uint8Array) {
      context.websocket.send(event.message);
    } else if (typeof event.message === "string") {
      context.websocket.send(event.message);
    } else {
      context.websocket.send(encode(event.message));
    }

    return {
      ...context,
      enqueuedMessage: undefined,
    };
  }
  return {
    ...context,
    enqueuedMessage: event.message,
  };
}

function expireToken(context: Context): Context {
  return {
    ...context,
    token: undefined,
  };
}

function setToken(context: Context, event: AuthenticatedEvent): Context {
  return {
    ...context,
    token: event.token,
  };
}

function connectionEstablished(
  context: Context,
  event: ConnectedEvent,
): Context {
  return {
    ...context,
    websocket: event.websocket,
  };
}

// State machine
const connectionStateMachine = createMachine(
  "idle",
  {
    idle: state(
      transition("send", "connecting", reduce(enqueueMessage)),
      transition("close", "idle", reduce(closeConnection)),
    ),
    connecting: state(
      transition("connecting", "connecting"),
      transition("connected", "active", reduce(connectionEstablished)),
      transition("connectionClosed", "idle", reduce(closeConnection)),
      transition("send", "connecting", reduce(enqueueMessage)),
      transition("close", "idle", reduce(closeConnection)),
      immediate("authRequired", guard(noToken)),
    ),
    authRequired: state(
      transition("initiateAuth", "authInProgress"),
      transition("send", "authRequired", reduce(enqueueMessage)),
      transition("close", "idle", reduce(closeConnection)),
    ),
    authInProgress: state(
      transition("authenticated", "connecting", reduce(setToken)),
      transition(
        "unauthorized",
        "idle",
        reduce(expireToken),
        reduce(closeConnection),
      ),
      transition("send", "authInProgress", reduce(enqueueMessage)),
      transition("close", "idle", reduce(closeConnection)),
    ),
    active: state(
      transition("send", "active", reduce(sendMessage)),
      transition("authenticated", "active", reduce(setToken)),
      transition("unauthorized", "idle", reduce(expireToken)),
      transition(
        "connectionClosed",
        "idle",
        reduce(expireToken),
        reduce(closeConnection),
      ),
      transition("close", "idle", reduce(expireToken), reduce(closeConnection)),
    ),
  },
  initialState,
);

/**
 * A connection object that allows you to `send` request payloads to a
 * realtime endpoint.
 */
export interface RealtimeConnection<Input> {
  send(input: Input & Partial<WithRequestId>): void;

  close(): void;
}

/**
 * Options for connecting to the realtime endpoint.
 */
export interface RealtimeConnectionHandler<Output> {
  /**
   * The connection key. This is used to reuse the same connection
   * across multiple calls to `connect`. This is particularly useful in
   * contexts where the connection is established as part of a component
   * lifecycle (e.g. React) and the component is re-rendered multiple times.
   */
  connectionKey?: string;

  /**
   * If `true`, the connection will only be established on the client side.
   * This is useful for frameworks that reuse code for both server-side
   * rendering and client-side rendering (e.g. Next.js).
   *
   * This is set to `true` by default when running on React in the server.
   * Otherwise, it is set to `false`.
   *
   * Note that more SSR frameworks might be automatically detected
   * in the future. In the meantime, you can set this to `true` when needed.
   */
  clientOnly?: boolean;

  /**
   * The throttle duration in milliseconds. This is used to throttle the
   * calls to the `send` function. Realtime apps usually react to user
   * input, which can be very frequent (e.g. fast typing or mouse/drag movements).
   *
   * The default value is `128` milliseconds.
   */
  throttleInterval?: number;

  /**
   * Configures the maximum amount of frames to store in memory before starting to drop
   * old ones for in favor of the newer ones. It must be between `1` and `60`.
   *
   * The recommended is `2`. The default is `undefined` so it can be determined
   * by the app (normally is set to the recommended setting).
   */
  maxBuffering?: number;

  /**
   * Optional path to append after the app id. Defaults to `/realtime`.
   */
  path?: string;

  /**
   * Optional encoder for outgoing messages. Defaults to msgpack.
   * Should return either a `Uint8Array` (binary) or string (text frame).
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  encodeMessage?: (input: any) => Uint8Array | string;

  /**
   * Optional decoder for incoming messages. Defaults to msgpack with JSON
   * support for string payloads.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  decodeMessage?: (data: any) => Promise<any> | any;

  /**
   * Callback function that is called when a result is received.
   * @param result - The result of the request.
   */
  onResult(result: Output & WithRequestId): void;

  /**
   * Callback function that is called when an error occurs.
   * @param error - The error that occurred.
   */
  onError?(error: ApiError<any>): void;

  /**
   * A custom token provider function. When provided, this function will be
   * used to fetch authentication tokens instead of the default internal
   * token fetching mechanism.
   *
   * This is useful when you want to fetch tokens through your own backend proxy.
   * If not provided, the default `getTemporaryAuthToken` will be used.
   */
  tokenProvider?: TokenProvider;

  /**
   * The token expiration time in seconds. This is used to determine when to
   * refresh the token. The token will be refreshed at 90% of this value.
   *
   * Only relevant when using a custom `tokenProvider`. If a custom `tokenProvider`
   * is used without specifying this value, automatic token refresh will be disabled.
   */
  tokenExpirationSeconds?: number;
}

export interface RealtimeClient {
  /**
   * Connect to the realtime endpoint. The default implementation uses
   * WebSockets to connect to fal function endpoints that support WSS.
   *
   * @param app the app alias or identifier.
   * @param handler the connection handler.
   */
  connect<Input = any, Output = any>(
    app: string,
    handler: RealtimeConnectionHandler<Output>,
  ): RealtimeConnection<Input>;

  /**
   * Open a model-specific realtime session with an explicitly supplied
   * extension. This form preserves the extension's options and session types.
   *
   * @experimental The `fal.realtime.open()` extension API is experimental and may change in a minor release.
   */
  open<Extension extends AnyRealtimeExtension>(
    extension: Extension,
    options: RealtimeExtensionOptions<Extension> & RealtimeOpenOptions,
  ): Promise<ManagedRealtimeSession<RealtimeExtensionSession<Extension>>>;
}

type ConnectionStateMachine = {
  service: Service<typeof connectionStateMachine>;
  throttledSend: (
    event: Event,
    payload?: any,
  ) => void | Promise<void> | undefined;
  callbacks: RealtimeConnectionCallback;
  dispose: () => void;
  disposed: boolean;
  handleId: symbol;
};

type ConnectionOnChange = InterpretOnChangeFunction<
  typeof connectionStateMachine
>;

type RealtimeConnectionCallback = Pick<
  RealtimeConnectionHandler<any>,
  "onResult" | "onError" | "decodeMessage"
>;

const connectionCache = new Map<string, ConnectionStateMachine>();
function reuseInterpreter(
  key: string,
  throttleInterval: number,
  onChange: ConnectionOnChange,
  callbacks: RealtimeConnectionCallback,
  dispose: () => void,
  handleId: symbol,
) {
  if (!connectionCache.has(key)) {
    const service = interpret(connectionStateMachine, onChange);
    const guardedSend = (event: Event) => {
      if (connectionCache.get(key) === cached && !cached.disposed) {
        return service.send(event);
      }
    };
    const cached: ConnectionStateMachine = {
      service,
      throttledSend:
        throttleInterval > 0
          ? throttle(guardedSend, throttleInterval, true)
          : service.send,
      callbacks,
      dispose,
      disposed: false,
      handleId,
    };
    connectionCache.set(key, cached);
  }
  const cached = connectionCache.get(key) as ConnectionStateMachine;
  cached.handleId = handleId;
  cached.callbacks = callbacks;
  cached.disposed = false;
  return cached;
}

const noop = () => {
  /* No-op */
};

/**
 * A no-op connection that does not send any message.
 * Useful on the frameworks that reuse code for both ssr and csr (e.g. Next)
 * so the call when doing ssr has no side-effects.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NoOpConnection: RealtimeConnection<any> = {
  send: noop,
  close: noop,
};

type RealtimeClientDependencies = {
  config: RequiredConfig;
  getClient?: () => {
    run<Id extends EndpointType>(
      endpointId: Id,
      options: RunOptions<InputType<Id>>,
    ): Promise<Result<OutputType<Id>>>;
  };
};

type HandleRealtimeMessageParams = {
  data: any;
  decodeMessage: RealtimeConnectionCallback["decodeMessage"];
  onResult: RealtimeConnectionCallback["onResult"];
  onError: NonNullable<RealtimeConnectionCallback["onError"]> | typeof noop;
  send: ConnectionStateMachine["service"]["send"];
  isCurrent: () => boolean;
};

function handleRealtimeMessage({
  data,
  decodeMessage,
  onResult,
  onError,
  send,
  isCurrent,
}: HandleRealtimeMessageParams) {
  const handleDecoded = (decoded: any) => {
    // Drop messages that are not related to the actual result.
    // In the future, we might want to handle other types of messages.
    // TODO: specify the fal ws protocol format
    if (isUnauthorizedError(decoded)) {
      send({
        type: "unauthorized",
        error: new Error("Unauthorized"),
      });
      return;
    }
    if (isSuccessfulResult(decoded)) {
      onResult(decoded);
      return;
    }
    if (isFalErrorResult(decoded)) {
      if (decoded.error === "TIMEOUT") {
        // Timeout error messages just indicate that the connection hasn't
        // received an incoming message for a while. We don't need to
        // handle them as errors.
        return;
      }
      onError(
        new ApiError({
          message: `${decoded.error}: ${decoded.reason}`,
          // TODO better error status code
          status: 400,
          body: decoded,
        }),
      );
      return;
    }
  };

  Promise.resolve(decodeMessage ? decodeMessage(data) : data)
    .then((decoded) => {
      if (isCurrent()) handleDecoded(decoded);
    })
    .catch((error) => {
      if (!isCurrent()) return;
      onError(
        new ApiError({
          message:
            (error as Error)?.message ?? "Failed to decode realtime message",
          status: 400,
        }),
      );
    });
}

export function createRealtimeClient({
  config,
  getClient,
}: RealtimeClientDependencies): RealtimeClient {
  const realtimeClient: RealtimeClient = {
    connect<Input, Output>(
      app: string,
      handler: RealtimeConnectionHandler<Output>,
    ): RealtimeConnection<Input> {
      const {
        // if running on React in the server, set clientOnly to true by default
        clientOnly = isReact() && !isBrowser(),
        connectionKey = crypto.randomUUID(),
        maxBuffering,
        path,
        throttleInterval = DEFAULT_THROTTLE_INTERVAL,
        encodeMessage: encodeMessageOverride,
        decodeMessage: decodeMessageOverride,
        tokenProvider,
        tokenExpirationSeconds,
      } = handler;
      if (clientOnly && !isBrowser()) {
        return NoOpConnection;
      }

      const encodeMessageFn =
        encodeMessageOverride ?? ((input: any) => encodeRealtimeMessage(input));
      const decodeMessageFn =
        decodeMessageOverride ?? ((data: any) => decodeRealtimeMessage(data));

      let previousState: string | undefined;
      let latestEnqueuedMessage: any;
      let tokenRefreshTimer: ReturnType<typeof setTimeout> | undefined;
      let tokenRefreshGeneration = 0;

      // Although the state machine is cached so we don't open multiple connections,
      // we still need to update the callbacks so we can call the correct references
      // when the state machine is reused. This is needed because the callbacks
      // are passed as part of the handler object, which can be different across
      // different calls to `connect`.
      const callbacks: RealtimeConnectionCallback = {
        decodeMessage: decodeMessageFn,
        onError: handler.onError,
        onResult: handler.onResult,
      };
      const handleId = Symbol(connectionKey);
      const dispose = () => {
        tokenRefreshGeneration++;
        clearTimeout(tokenRefreshTimer);
        tokenRefreshTimer = undefined;
      };
      const getCallbacks = () => connectionCache.get(connectionKey)?.callbacks;
      const stateMachine = reuseInterpreter(
        connectionKey,
        throttleInterval,
        ({ context, machine, send }) => {
          const { enqueuedMessage, token, websocket } = context;
          latestEnqueuedMessage = enqueuedMessage;
          if (
            machine.current === "active" &&
            enqueuedMessage &&
            websocket?.readyState === WebSocket.OPEN
          ) {
            send({ type: "send", message: enqueuedMessage });
          }
          if (
            machine.current === "authRequired" &&
            token === undefined &&
            previousState !== machine.current
          ) {
            send({ type: "initiateAuth" });
            tokenRefreshGeneration++;
            const generation = tokenRefreshGeneration;
            // Use custom tokenProvider if provided, otherwise use default
            const scope = realtimeTokenScope(app, path);
            const fetchToken = tokenProvider
              ? () => tokenProvider(scope)
              : () => {
                  console.warn(
                    "[fal.realtime] Using the default token provider is deprecated. " +
                      "Please provide a `tokenProvider` function to `fal.realtime.connect()`. " +
                      "See https://docs.fal.ai/model-apis/client#client-side-usage-with-token-provider for more information.",
                  );
                  return getTemporaryAuthToken(app, config);
                };

            const effectiveExpiration = tokenProvider
              ? tokenExpirationSeconds
              : TOKEN_EXPIRATION_SECONDS;

            const scheduleTokenRefresh =
              effectiveExpiration !== undefined
                ? () => {
                    if (stateMachine.disposed) return;
                    clearTimeout(tokenRefreshTimer);
                    const refreshMs = Math.round(
                      effectiveExpiration * 0.9 * 1000,
                    );
                    tokenRefreshTimer = setTimeout(() => {
                      if (
                        stateMachine.disposed ||
                        generation !== tokenRefreshGeneration
                      ) {
                        return;
                      }
                      fetchToken()
                        .then((newToken) => {
                          if (
                            stateMachine.disposed ||
                            generation !== tokenRefreshGeneration
                          ) {
                            return;
                          }
                          queueMicrotask(() => {
                            if (!stateMachine.disposed) {
                              send({ type: "authenticated", token: newToken });
                            }
                          });
                          scheduleTokenRefresh();
                        })
                        .catch(() => {
                          if (
                            stateMachine.disposed ||
                            generation !== tokenRefreshGeneration
                          ) {
                            return;
                          }
                          const retryMs = Math.round(
                            effectiveExpiration * 0.05 * 1000,
                          );
                          tokenRefreshTimer = setTimeout(() => {
                            scheduleTokenRefresh();
                          }, retryMs);
                        });
                    }, refreshMs);
                  }
                : noop;

            fetchToken()
              .then((token) => {
                if (stateMachine.disposed) return;
                queueMicrotask(() => {
                  if (!stateMachine.disposed) {
                    send({ type: "authenticated", token });
                  }
                });
                scheduleTokenRefresh();
              })
              .catch((error) => {
                if (stateMachine.disposed) return;
                const { onError = noop } = getCallbacks() ?? {};
                queueMicrotask(() => {
                  if (!stateMachine.disposed) {
                    send({ type: "unauthorized", error });
                  }
                });
                try {
                  onError(
                    error instanceof ApiError
                      ? error
                      : new ApiError({
                          message:
                            error instanceof Error
                              ? error.message
                              : String(error),
                          status: 401,
                          body: error,
                        }),
                  );
                } catch {
                  // A caller's callback must not strand the state machine in authInProgress.
                }
              });
          }
          if (
            machine.current === "connecting" &&
            previousState !== machine.current &&
            token !== undefined
          ) {
            const ws = new WebSocket(
              buildRealtimeUrl(app, { token, maxBuffering, path }),
            );
            ws.onopen = () => {
              if (stateMachine.disposed) {
                ws.close();
                return;
              }
              send({ type: "connected", websocket: ws });
              const queued =
                stateMachine.service.context?.enqueuedMessage ??
                latestEnqueuedMessage;
              if (queued) {
                ws.send(encodeMessageFn(queued));
                stateMachine.service.context = {
                  ...stateMachine.service.context,
                  enqueuedMessage: undefined,
                };
              }
            };
            ws.onclose = (event) => {
              if (stateMachine.disposed) return;
              if (event.code !== WebSocketErrorCodes.NORMAL_CLOSURE) {
                const { onError = noop } = getCallbacks() ?? {};
                onError(
                  new ApiError({
                    message: `Error closing the connection: ${event.reason}`,
                    status: event.code,
                  }),
                );
              }
              send({ type: "connectionClosed", code: event.code });
            };
            ws.onerror = () => {
              if (stateMachine.disposed) return;
              // TODO specify error protocol for identified errors
              const { onError = noop } = getCallbacks() ?? {};
              onError(new ApiError({ message: "Unknown error", status: 500 }));
            };
            ws.onmessage = (event) => {
              const callbacks = getCallbacks();
              if (!callbacks || stateMachine.disposed) return;
              const {
                decodeMessage = decodeMessageFn,
                onResult,
                onError = noop,
              } = callbacks;

              handleRealtimeMessage({
                data: event.data,
                decodeMessage,
                onResult,
                onError,
                send,
                isCurrent: () => {
                  const current = connectionCache.get(connectionKey);
                  return (
                    current === stateMachine &&
                    !stateMachine.disposed &&
                    current.callbacks === callbacks &&
                    stateMachine.service.context.websocket === ws
                  );
                },
              });
            };
          }
          if (previousState === "active" && machine.current !== "active") {
            clearTimeout(tokenRefreshTimer);
            tokenRefreshTimer = undefined;
          }
          previousState = machine.current;
        },
        callbacks,
        dispose,
        handleId,
      );

      let handleClosed = false;
      const send = (input: Input & Partial<WithRequestId>) => {
        if (
          handleClosed ||
          stateMachine.disposed ||
          stateMachine.handleId !== handleId
        ) {
          return;
        }
        // Use throttled send to avoid sending too many messages
        stateMachine.throttledSend({
          type: "send",
          message: encodeMessageFn(input),
        });
      };

      const close = () => {
        if (handleClosed) return;
        handleClosed = true;
        // Reusing a connection key transfers ownership to the newest handle. A stale
        // render must not close it, and a discarded stale handle must not keep it alive.
        if (stateMachine.handleId !== handleId) return;
        if (stateMachine.disposed) return;
        stateMachine.disposed = true;
        stateMachine.dispose();
        stateMachine.service.send({ type: "close" });
        connectionCache.delete(connectionKey);
      };

      return {
        send,
        close,
      };
    },
    open: undefined as unknown as RealtimeClient["open"],
  };

  async function open(
    extension: AnyRealtimeExtension,
    options: unknown,
  ): Promise<RealtimeSession> {
    const rawOptionEndpointId =
      typeof options === "object" && options !== null && "endpointId" in options
        ? (options as { endpointId: unknown }).endpointId
        : undefined;
    const optionEndpointId =
      rawOptionEndpointId == null ? undefined : String(rawOptionEndpointId);
    const endpointId = optionEndpointId ?? extension.defaultEndpoint ?? "";

    if (!endpointId) {
      throw new Error(
        `Realtime extension "${extension.id}" requires an endpointId option when opened explicitly.`,
      );
    }
    // Extensions that own no closed set of endpoints omit this entirely; see RealtimeExtension.
    if (extension.supports?.(endpointId) === false) {
      throw new Error(
        `Realtime extension "${extension.id}" does not support "${endpointId}".`,
      );
    }

    const externalSignal = (options as { abortSignal?: AbortSignal })
      ?.abortSignal;
    const controller = new AbortController();
    const cleanups: Array<() => void | Promise<void>> = [];
    const lateCleanups: Array<Promise<void>> = [];
    // A running late cleanup may register another one, so a single Promise.all over a snapshot of
    // the array can resolve while that nested registration is still pending. Drain in rounds until
    // a round adds nothing new, so an awaited close() really means every registration finished.
    const drainLateCleanups = async (): Promise<void> => {
      let drained = 0;
      while (drained < lateCleanups.length) {
        const snapshot = lateCleanups.length;
        await Promise.all(lateCleanups.slice(drained, snapshot));
        drained = snapshot;
      }
    };
    let closed = false;
    let cleanupPromise: Promise<void> | undefined;
    let session: RealtimeSession | undefined;
    let extensionClose: (() => void | Promise<void>) | undefined;
    let sessionClosePromise: Promise<void> | undefined;
    let sessionCloseInProgress = false;
    // Owned by the kernel, not the extension. The kernel is the only thing that knows about abort,
    // failed opens and idempotent close, so it is the only thing that can report those honestly —
    // and an extension's own state field cannot then contradict it.
    let state: RealtimeState = "opening";
    const onState = (options as { onState?: (next: RealtimeState) => void })
      ?.onState;
    // "failed" and "closed" are both TERMINAL, and failure latches over the teardown that follows it.
    // Without that, `fail()` was self-defeating: it set "failed" and then immediately called
    // cleanup(), which set "closed" — so the distinction it exists to draw survived only in the
    // instant between two synchronous calls, and anything rendering from the latest value (a status
    // pill, `session.state`) showed a died session as a clean disconnect.
    const setState = (next: RealtimeState) => {
      if (state === next || state === "closed" || state === "failed") return;
      state = next;
      try {
        onState?.(next);
      } catch {
        // A caller's callback must never be able to fail a session.
      }
    };

    const closeSession = (): Promise<void> => {
      if (!extensionClose) return Promise.resolve();
      if (!sessionClosePromise) {
        const closeExtension = extensionClose;
        sessionClosePromise = Promise.resolve().then(async () => {
          sessionCloseInProgress = true;
          try {
            await closeExtension();
          } finally {
            sessionCloseInProgress = false;
          }
        });
      }
      return sessionClosePromise;
    };

    const cleanup = (): Promise<void> => {
      if (cleanupPromise) return cleanupPromise;
      closed = true;
      setState("closed");
      cleanupPromise = Promise.resolve().then(async () => {
        try {
          await closeSession();
        } catch {
          // Teardown is best-effort; a broken extension close hook must not leak rejection.
        } finally {
          for (const release of cleanups.reverse()) {
            try {
              await release();
            } catch {
              // Teardown is best-effort; one failed release must not prevent the
              // remaining resources from being closed.
            }
          }
          await drainLateCleanups();
        }
      });
      // abort listeners run synchronously and may re-enter through context.close()
      // or context.fail(), so publish the shared teardown promise first.
      controller.abort();
      externalSignal?.removeEventListener("abort", abort);
      return cleanupPromise;
    };
    const abort = () => {
      controller.abort(externalSignal?.reason);
      void cleanup();
    };
    // Dropped when the caller did not ask, so an extension can report unconditionally rather than
    // guarding every call site.
    const onDiagnostic = (
      options as { onDiagnostic?: (event: RealtimeDiagnostic) => void }
    )?.onDiagnostic;
    const diagnostic = (event: RealtimeDiagnostic) => {
      try {
        onDiagnostic?.(event);
      } catch {
        // A caller's reporting callback must never be able to fail a session.
      }
    };
    // Same swallow-and-continue rule as diagnostics, and for a sharper reason: these fire from inside
    // `pc.ontrack` and `channel.onmessage`, where a throw lands in a browser event handler that no
    // caller can catch. An application whose render throws must not take the session with it.
    const onMedia = (options as { onMedia?: (stream: MediaStream) => void })
      ?.onMedia;
    const media = (stream: MediaStream) => {
      if (closed) return;
      try {
        onMedia?.(stream);
      } catch {
        // A caller's media handler must never be able to fail a session.
      }
    };
    const onData = (options as { onData?: (raw: string) => void })?.onData;
    const data = (raw: string) => {
      if (closed) return;
      try {
        onData?.(raw);
      } catch {
        // Nor a caller's message handler — one unparseable payload is not a dead session.
      }
    };
    if (externalSignal?.aborted) {
      controller.abort(externalSignal.reason);
      throw (
        externalSignal.reason ??
        new DOMException("Realtime open aborted", "AbortError")
      );
    } else {
      externalSignal?.addEventListener("abort", abort, { once: true });
    }

    // A request-local signal an extension hands to context.fetch() or context.gatherIce() must not
    // displace the managed session signal: either one aborts the work. Hand-rolled rather than
    // AbortSignal.any() to keep the runtime floor unchanged.
    //
    // The session signal carries ONE listener for all requests, driving a set of active
    // combinations — never one listener per request, because a session sending heartbeats every few
    // seconds would otherwise accumulate listeners for its whole lifetime. Each combination leaves
    // the set when it aborts or its request completes; the set itself is released with the session.
    const activeRequestCombos = new Set<AbortController>();
    let sessionComboHookInstalled = false;
    const withSessionSignal = (
      requestSignal: AbortSignal | null | undefined,
    ): { signal: AbortSignal; dispose: () => void } => {
      if (!requestSignal || requestSignal === controller.signal) {
        return { signal: controller.signal, dispose: () => undefined };
      }
      const combined = new AbortController();
      if (controller.signal.aborted) {
        combined.abort(controller.signal.reason);
        return { signal: combined.signal, dispose: () => undefined };
      }
      if (requestSignal.aborted) {
        combined.abort(requestSignal.reason);
        return { signal: combined.signal, dispose: () => undefined };
      }
      const abortFromRequest = () => {
        activeRequestCombos.delete(combined);
        combined.abort(requestSignal.reason);
      };
      if (!sessionComboHookInstalled) {
        sessionComboHookInstalled = true;
        controller.signal.addEventListener(
          "abort",
          () => {
            for (const combo of activeRequestCombos) {
              combo.abort(controller.signal.reason);
            }
            activeRequestCombos.clear();
          },
          { once: true },
        );
      }
      activeRequestCombos.add(combined);
      requestSignal.addEventListener("abort", abortFromRequest, {
        once: true,
      });
      return {
        signal: combined.signal,
        dispose: () => {
          activeRequestCombos.delete(combined);
          requestSignal.removeEventListener("abort", abortFromRequest);
        },
      };
    };

    // Dispose a request's signal combination once its response body has actually been consumed —
    // fetch() resolves at headers, and the signal must keep covering body reads until then. The
    // body-reading methods are patched per instance; a caller streaming `response.body` directly
    // keeps its combination until it aborts or the session closes, which the set above bounds.
    const disposeWhenBodyConsumed = (
      response: Response,
      dispose: () => void,
    ) => {
      if (!response.body) {
        dispose();
        return;
      }
      let disposed = false;
      const settle = () => {
        if (!disposed) {
          disposed = true;
          dispose();
        }
      };
      for (const method of [
        "arrayBuffer",
        "blob",
        "bytes",
        "formData",
        "json",
        "text",
      ] as const) {
        const original = (response as Response & Record<string, unknown>)[
          method
        ];
        if (typeof original !== "function") continue;
        Object.defineProperty(response, method, {
          configurable: true,
          writable: true,
          value: function patched(this: Response, ...args: unknown[]) {
            return (original as (...a: unknown[]) => Promise<unknown>)
              .apply(this, args)
              .finally(settle);
          },
        });
      }
    };

    try {
      session = await extension.open(
        {
          endpointId,
          signal: controller.signal,
          run: <Input, Output>(
            id: string,
            runOptions: RunOptions<Input>,
          ): Promise<Result<Output>> => {
            const normalizedId = id.trim();
            if (
              /^[a-z][a-z\d+.-]*:/i.test(normalizedId) ||
              normalizedId.startsWith("//")
            ) {
              throw new Error(
                "Realtime extension run() requires an app endpoint id, not an absolute URL.",
              );
            }
            if (!getClient) {
              throw new Error(
                "This realtime client was created without fal request access.",
              );
            }
            return getClient().run(
              normalizedId,
              runOptions as RunOptions<Record<string, any>>,
            ) as Promise<Result<Output>>;
          },
          connect: realtimeClient.connect,
          // Credentials, request middleware and proxy come from the parent client, so a proxied
          // application stays proxied and the extension never sees a key. Raw `Response` rather than
          // a parsed result: this reaches infrastructure that does not speak fal's result envelope.
          fetch: async (url: string, init: RequestInit = {}) => {
            // Validate the extension-controlled destination before middleware may rewrite it to an
            // application-controlled proxy. Otherwise an extension could send the parent API key to
            // an arbitrary host merely by naming it here.
            assertFalInfrastructureUrl(url);
            // Destructure before invocation: native fetch validates its receiver, so calling it as a
            // method of the config object can throw "Illegal invocation".
            const { fetch: doFetch, credentials: credentialsValue } = config;
            const credentials =
              typeof credentialsValue === "function"
                ? credentialsValue()
                : credentialsValue;
            let requestHeaders: Record<string, string> | undefined;
            if (init.headers !== undefined) {
              const normalized: Record<string, string> = {};
              new Headers(init.headers).forEach((value, key) => {
                normalized[key] = value;
              });
              requestHeaders = normalized;
            }
            const {
              method,
              url: targetUrl,
              headers,
            } = await config.requestMiddleware({
              method: (init.method ?? "POST").toUpperCase(),
              url,
              headers: requestHeaders,
            });
            const finalHeaders = new Headers();
            if (credentials) {
              finalHeaders.set("Authorization", `Key ${credentials}`);
            }
            for (const [name, value] of Object.entries(headers ?? {})) {
              finalHeaders.set(
                name,
                Array.isArray(value) ? value.join(", ") : value,
              );
            }
            const { signal, dispose } = withSessionSignal(init.signal);
            try {
              const response = await doFetch(targetUrl, {
                ...init,
                method,
                signal,
                headers: finalHeaders,
              });
              // The Response outlives this call: callers read the body afterwards, and a fetch
              // signal also cancels those reads. Disposing here would sever the combination just
              // when a stalled body needs it — keep it until the body is consumed or a side aborts.
              disposeWhenBodyConsumed(response, dispose);
              return response;
            } catch (error) {
              dispose();
              throw error;
            }
          },
          gatherIce: async (pc, iceOptions) => {
            const { signal, dispose } = withSessionSignal(iceOptions?.signal);
            try {
              return await gatherIceCandidates(pc, {
                ...iceOptions,
                signal,
                onProgress: (result) =>
                  diagnostic({
                    kind: "progress",
                    phase: "ice-gathering",
                    detail: { ...result },
                  }),
              });
            } finally {
              dispose();
            }
          },
          diagnostic,
          media,
          data,
          fail: async (
            message: string,
            observed?: Record<string, number | string>,
          ) => {
            diagnostic({ kind: "failure", message, observed });
            // Before cleanup: cleanup sets "closed", and a caller watching transitions needs to see
            // that this session died rather than ended.
            setState("failed");
            await cleanup();
          },
          addCleanup: (release) => {
            if (closed) {
              const lateCleanup = Promise.resolve()
                .then(release)
                .catch(() => {
                  // Late registration follows the same best-effort rule as normal teardown.
                });
              lateCleanups.push(lateCleanup);
            } else {
              cleanups.push(release);
            }
          },
          close: () => (sessionCloseInProgress ? Promise.resolve() : cleanup()),
        },
        options,
      );
      extensionClose = session.close.bind(session);
      // Raw class methods are bound to the original instance for private fields.
      // Route an internal this.close() through managed teardown when possible.
      Reflect.set(session, "close", cleanup, session);
      if (controller.signal.aborted) {
        try {
          await closeSession();
        } catch {
          // Preserve the caller's abort reason when a late session close hook is broken.
        }
        await cleanup();
        await drainLateCleanups();
        throw controller.signal.reason ?? new Error("Realtime open aborted");
      }
      setState("live");
      const proxyTarget = Object.create(
        Object.getPrototypeOf(session),
      ) as RealtimeSession;
      const boundMethods = new Map<
        PropertyKey,
        { source: unknown; bound: unknown }
      >();
      // What the `get` trap serves for a property, shared with the traps that mirror properties
      // onto the neutral target: once the target is non-extensible, the language requires a
      // non-configurable, non-writable target value and the trap result to be the SAME value, so
      // both sides must resolve through one function.
      const resolveProperty = (property: PropertyKey, value: unknown) => {
        if (property === "close") return cleanup;
        if (property === "state") return state;
        if (typeof value !== "function") return value;
        const cached = boundMethods.get(property);
        if (cached?.source === value) return cached.bound;
        // Class methods must always observe the original instance. In particular, a Proxy cannot
        // satisfy private-field brand checks, and a frozen instance cannot have its raw `close`
        // hook replaced. Extensions end themselves through context.close(); the session's own
        // close method is the resource hook the kernel invokes during managed teardown.
        const bound = value.bind(session);
        boundMethods.set(property, { source: value, bound });
        return bound;
      };
      const mirrorOntoTarget = (
        property: PropertyKey,
        descriptor: PropertyDescriptor,
      ) =>
        Reflect.defineProperty(
          proxyTarget,
          property,
          "value" in descriptor
            ? {
                ...descriptor,
                value: resolveProperty(property, descriptor.value),
              }
            : descriptor,
        );
      return new Proxy(proxyTarget, {
        get(_target, property) {
          if (property === "state") {
            const pinned = Reflect.getOwnPropertyDescriptor(
              proxyTarget,
              property,
            );
            // A caller that froze the session pinned `state` at its frozen value; the invariant for
            // a non-configurable, non-writable data property forbids reporting anything newer.
            if (
              pinned &&
              !pinned.configurable &&
              pinned.writable === false &&
              "value" in pinned
            ) {
              return pinned.value;
            }
            return state;
          }
          return resolveProperty(
            property,
            Reflect.get(session, property, session),
          );
        },
        set(_target, property, value) {
          const updated = Reflect.set(session, property, value, session);
          const targetDescriptor = Reflect.getOwnPropertyDescriptor(
            proxyTarget,
            property,
          );
          if (
            updated &&
            targetDescriptor &&
            !targetDescriptor.configurable &&
            "value" in targetDescriptor &&
            targetDescriptor.writable
          ) {
            Reflect.set(proxyTarget, property, value, proxyTarget);
          }
          return updated;
        },
        defineProperty(_target, property, descriptor) {
          if (!Reflect.defineProperty(session, property, descriptor)) {
            return false;
          }
          // A non-configurable property must also exist on the neutral target or the Proxy would
          // violate the language's invariants. Configurable properties can remain source-only —
          // unless the target is already non-extensible, where its key set must track the session's.
          return descriptor.configurable === false ||
            !Reflect.isExtensible(proxyTarget)
            ? mirrorOntoTarget(property, descriptor)
            : true;
        },
        deleteProperty(_target, property) {
          boundMethods.delete(property);
          if (!Reflect.deleteProperty(session, property)) {
            return false;
          }
          // Keep the neutral target's key set in step with the session's, or a delete after
          // `Object.preventExtensions()` would leave `ownKeys` reporting fewer keys than the
          // non-extensible target owns.
          return Reflect.deleteProperty(proxyTarget, property);
        },
        preventExtensions() {
          // `Object.freeze()`, `Object.seal()`, and `Object.preventExtensions()` all land here
          // first. Once the target is non-extensible the language requires `ownKeys` to report
          // exactly the target's own keys, so mirror every session key onto the target — with the
          // same values the `get` trap serves — and make the session non-extensible too so no new
          // key can appear later on one side only.
          if (!Reflect.preventExtensions(session)) {
            return false;
          }
          for (const property of Reflect.ownKeys(session)) {
            if (!Reflect.getOwnPropertyDescriptor(proxyTarget, property)) {
              const descriptor = Reflect.getOwnPropertyDescriptor(
                session,
                property,
              );
              if (descriptor) {
                mirrorOntoTarget(property, descriptor);
              }
            }
          }
          return Reflect.preventExtensions(proxyTarget);
        },
        has(_target, property) {
          return (
            property === "close" ||
            property === "state" ||
            Reflect.has(session, property)
          );
        },
        ownKeys() {
          return Reflect.ownKeys(session);
        },
        getOwnPropertyDescriptor(_target, property) {
          const targetDescriptor = Reflect.getOwnPropertyDescriptor(
            proxyTarget,
            property,
          );
          if (targetDescriptor && !targetDescriptor.configurable) {
            return targetDescriptor;
          }
          const descriptor = Reflect.getOwnPropertyDescriptor(
            session,
            property,
          );
          return descriptor ? { ...descriptor, configurable: true } : undefined;
        },
      });
    } catch (error) {
      // Before cleanup, so a caller watching state sees "failed" rather than only "closed" — the two
      // mean different things and a status UI should be able to tell them apart.
      setState("failed");
      await cleanup();
      await drainLateCleanups();
      throw error;
    }
  }

  realtimeClient.open = open as RealtimeClient["open"];
  return realtimeClient;
}
