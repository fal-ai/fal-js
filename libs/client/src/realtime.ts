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
   * Returns the managed session SYNCHRONOUSLY, in state `"opening"`, while negotiation starts
   * eagerly behind it — the caller holds a usable handle immediately, `send()` queues until the
   * session is live, and failures arrive through `onError` and `onState("failed")`. Await
   * `session.ready` for the promise-style call site; misconfiguration (no endpoint, an endpoint
   * the extension rejects) still throws synchronously.
   *
   * @experimental The `fal.realtime.open()` extension API is experimental and may change in a minor release.
   */
  open<Extension extends AnyRealtimeExtension>(
    extension: Extension,
    options: RealtimeExtensionOptions<Extension> & RealtimeOpenOptions,
  ): ManagedRealtimeSession<RealtimeExtensionSession<Extension>>;
}

type ConnectionStateMachine = {
  service: Service<typeof connectionStateMachine>;
  throttledSend: (
    event: Event,
    senderId?: symbol,
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
    // A trailing throttled send replays the args it was scheduled with, which can be after the
    // connection key transferred to a newer handle — the send() gate ran too early to see that.
    // The scheduling handle's id therefore travels with the event and is re-checked at fire time.
    const guardedSend = (event: Event, senderId?: symbol) => {
      if (
        connectionCache.get(key) === cached &&
        !cached.disposed &&
        (senderId === undefined || cached.handleId === senderId)
      ) {
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
            // Explicit undefined check: the message is already encoded, and a custom encoder can
            // legitimately produce "" (an empty heartbeat frame) — truthiness would strand it.
            enqueuedMessage !== undefined &&
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
              // The queued value was encoded by send() already — re-encoding would double-encode
              // custom string framings — and "" is a legitimate encoded frame, so the gate is an
              // explicit undefined check rather than truthiness.
              if (queued !== undefined) {
                ws.send(queued);
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
        stateMachine.throttledSend(
          {
            type: "send",
            message: encodeMessageFn(input),
          },
          handleId,
        );
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

  function open(
    extension: AnyRealtimeExtension,
    options: unknown,
  ): RealtimeSession {
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
      cleanupPromise = Promise.resolve().then(async () => {
        try {
          await closeSession();
        } catch {
          // Teardown is best-effort; a broken extension close hook must not leak rejection.
        } finally {
          // splice() consumes the list, so any reentrant call that slips past the memo can never
          // run a release twice, and reverse() no longer mutates a shared array.
          for (const release of cleanups.splice(0).reverse()) {
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
      // EVERY synchronous callback fired below can re-enter cleanup() — onState("closed") through
      // a caller that closes on seeing "closed", abort listeners through context.close() or
      // context.fail() — so the shared teardown promise is published before any of them run.
      setState("closed");
      controller.abort();
      externalSignal?.removeEventListener("abort", abort);
      return cleanupPromise;
    };
    const abort = () => {
      controller.abort(externalSignal?.reason);
      void cleanup();
    };
    // What the CALLER's close() returns. A close during negotiation must not report done while the
    // extension can still hand back a resource-bearing session — the opening task observes the
    // abort and tears any late session down, so completion includes the task. The task itself only
    // ever awaits cleanup(), never this wrapper, so an extension that closes or fails from inside
    // its own open() cannot deadlock against it.
    // Assigned once, after the handle exists — publicClose only reads it through a closure, which
    // prefer-const cannot see past.
    // eslint-disable-next-line prefer-const
    let openTaskPromise: Promise<void> | undefined;
    let publicClosePromise: Promise<void> | undefined;
    const publicClose = (): Promise<void> => {
      // Memoized so every concurrent close awaits the same teardown, the same identity guarantee
      // cleanup() itself makes.
      if (!publicClosePromise) {
        const teardown = cleanup();
        publicClosePromise = openTaskPromise
          ? teardown.then(() => openTaskPromise)
          : teardown;
      }
      return publicClosePromise;
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
      // Not a synchronous throw: an already-aborted signal is a legitimate race (a component
      // unmounting mid-render), not a programmer error. The opening task observes the aborted
      // controller before calling the extension and fails the handle through the normal channels.
      controller.abort(externalSignal.reason);
    } else {
      externalSignal?.addEventListener("abort", abort, { once: true });
    }

    // The failure channel for the synchronous handle: there is no returned promise whose
    // rejection could carry a terminal error, so it is delivered once through onError — and
    // through `ready` for callers who chose the awaited style.
    const onError = (options as { onError?: (error: unknown) => void })
      ?.onError;
    let errorReported = false;
    const reportError = (error: unknown) => {
      if (errorReported) return;
      errorReported = true;
      try {
        onError?.(error);
      } catch {
        // A caller's error handler must never be able to fail teardown.
      }
    };
    let resolveReady!: (value: RealtimeSession) => void;
    let rejectReady!: (error: unknown) => void;
    const ready = new Promise<RealtimeSession>((resolve, reject) => {
      resolveReady = resolve;
      rejectReady = reject;
    });
    // A caller may consume the session entirely through callbacks; an ignored `ready` must not
    // surface a failed open as an unhandled rejection.
    ready.catch(() => undefined);

    // The handle is usable the moment open() returns: sends while "opening" are queued, bounded,
    // and flushed in order the instant the session is live. Oldest-first eviction, because for a
    // realtime input stream the newest message is the one that still matters. After a terminal
    // state sends are dropped, mirroring what the extensions do with a dead transport.
    const MAX_QUEUED_SENDS = 64;
    const queuedSends: unknown[][] = [];
    let warnedQueueOverflow = false;
    const queuedSend = (...args: unknown[]) => {
      if (state !== "opening") return;
      if (queuedSends.length >= MAX_QUEUED_SENDS) {
        queuedSends.shift();
        if (!warnedQueueOverflow) {
          warnedQueueOverflow = true;
          diagnostic({
            kind: "warning",
            message: `More than ${MAX_QUEUED_SENDS} messages were queued before the session became live; the oldest are being dropped.`,
          });
        }
      }
      queuedSends.push(args);
    };
    const flushQueuedSends = () => {
      if (queuedSends.length === 0 || !session) return;
      const pending = queuedSends.splice(0);
      const send = Reflect.get(session, "send", session) as unknown;
      if (typeof send !== "function") {
        diagnostic({
          kind: "warning",
          message: `The extension session has no send(); ${pending.length} queued message(s) were dropped.`,
        });
        return;
      }
      for (const args of pending) {
        try {
          const result = (send as (...sendArgs: unknown[]) => unknown).apply(
            session,
            args,
          );
          // A value-returning send has no call site left to observe it — the caller's send was
          // fire-and-forget by contract — so an async delivery failure becomes a diagnostic
          // rather than an unhandled rejection.
          void Promise.resolve(result).catch(() =>
            diagnostic({
              kind: "warning",
              message:
                "A queued message could not be delivered to the session.",
            }),
          );
        } catch {
          diagnostic({
            kind: "warning",
            message: "A queued message could not be delivered to the session.",
          });
        }
      }
    };

    // A request-local signal an extension hands to context.fetch() or context.gatherIce() must not
    // displace the managed session signal: either one aborts the work. Hand-rolled rather than
    // AbortSignal.any() to keep the runtime floor unchanged.
    //
    // The session signal carries ONE listener for all requests, driving a set of active
    // combinations — never one listener per request, because a session sending heartbeats every few
    // seconds would otherwise accumulate listeners for its whole lifetime. Each combination leaves
    // the set when it aborts or its request completes; the set itself is released with the session.
    const activeRequestCombos = new Set<{
      combined: AbortController;
      detach: () => void;
    }>();
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
        activeRequestCombos.delete(entry);
        combined.abort(requestSignal.reason);
      };
      // The entry carries its own detach so the session-abort sweep can remove the listener from
      // the REQUEST signal too — a long-lived request signal outliving the session must not keep
      // retaining the combined controller through a listener nobody will ever fire.
      const entry = {
        combined,
        detach: () =>
          requestSignal.removeEventListener("abort", abortFromRequest),
      };
      if (!sessionComboHookInstalled) {
        sessionComboHookInstalled = true;
        controller.signal.addEventListener(
          "abort",
          () => {
            for (const combo of activeRequestCombos) {
              combo.detach();
              combo.combined.abort(controller.signal.reason);
            }
            activeRequestCombos.clear();
          },
          { once: true },
        );
      }
      activeRequestCombos.add(entry);
      requestSignal.addEventListener("abort", abortFromRequest, {
        once: true,
      });
      return {
        signal: combined.signal,
        dispose: () => {
          activeRequestCombos.delete(entry);
          entry.detach();
        },
      };
    };

    // Dispose a request's signal combination once its response body has actually been consumed —
    // fetch() resolves at headers, and the signal must keep covering body reads until then. The
    // body-reading methods are patched per instance, and `body` itself is served through a
    // monitored stream so direct consumers (getReader, pipeTo, async iteration) also release the
    // combination at end-of-stream or cancellation.
    const disposeWhenBodyConsumed = (
      response: Response,
      dispose: () => void,
    ) => {
      const originalBody = response.body;
      if (!originalBody) {
        dispose();
        return;
      }
      // clone() tees the response internally and RE-POINTS the original's body at a fresh branch,
      // so a stream captured before the clone is stale and locked afterwards. The prototype getter
      // — reachable even after the instance property below shadows it — always reads the current
      // branch, keeping the original consumable after cloning, exactly like a native response.
      const nativeBodyGetter = (() => {
        let proto = Object.getPrototypeOf(response) as object | null;
        while (proto) {
          const descriptor = Object.getOwnPropertyDescriptor(proto, "body");
          if (descriptor?.get) return descriptor.get;
          proto = Object.getPrototypeOf(proto);
        }
        return undefined;
      })();
      const currentNativeBody = (): ReadableStream<Uint8Array> =>
        (nativeBodyGetter?.call(response) as ReadableStream<Uint8Array>) ??
        originalBody;
      let disposed = false;
      const settle = () => {
        if (!disposed) {
          disposed = true;
          dispose();
        }
      };
      // Clones share the combination: clone() tees the underlying source, so fully consuming
      // EITHER branch means the network stream finished, and the other branch replays from the
      // buffer where the signal no longer matters. Recursive, so clones of clones participate.
      const originalClone = response.clone.bind(response);
      Object.defineProperty(response, "clone", {
        configurable: true,
        writable: true,
        value: () => {
          const cloned = originalClone();
          disposeWhenBodyConsumed(cloned, settle);
          return cloned;
        },
      });
      // The native reader is acquired only when the monitored stream is actually READ — merely
      // accessing `response.body` must not lock the response, or the common "inspect body, then
      // call json()" pattern would throw. highWaterMark 0 stops the wrapper from prefetching,
      // which would otherwise acquire the reader at construction.
      let monitored: ReadableStream<Uint8Array> | undefined;
      let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
      const acquireReader = () => {
        if (!reader) {
          reader = currentNativeBody().getReader();
          // Covers end-of-stream, stream error, and reader-side cancellation alike.
          void reader.closed.then(settle, settle);
        }
        return reader;
      };
      Object.defineProperty(response, "body", {
        configurable: true,
        enumerable: true,
        get: () => {
          if (!monitored) {
            // type "bytes", because native fetch bodies are byte streams and a BYOB reader that
            // works on a raw Response must keep working here — context.fetch() promises a raw
            // Response. The cast is only for older TS libs that lack the byte-source overload.
            monitored = new ReadableStream(
              {
                type: "bytes",
                pull: async (
                  streamController: ReadableByteStreamController,
                ) => {
                  const { done, value } = await acquireReader().read();
                  if (done) {
                    streamController.close();
                    // A pending BYOB request must be answered after close or the reader hangs.
                    streamController.byobRequest?.respond(0);
                    settle();
                    return;
                  }
                  // A byte controller rejects empty chunks; skipping resolves this pull and the
                  // stream simply pulls again.
                  if (value && value.byteLength > 0) {
                    streamController.enqueue(value);
                  }
                },
                cancel: async (reason: unknown) => {
                  settle();
                  await (reader
                    ? reader.cancel(reason)
                    : currentNativeBody().cancel(reason));
                },
              } as UnderlyingDefaultSource<Uint8Array>,
              { highWaterMark: 0 },
            ) as ReadableStream<Uint8Array>;
          }
          return monitored;
        },
      });
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

    // The handle exists before the session does. The neutral target starts bare and adopts the
    // session's prototype when it arrives; every trap treats "no session yet" as "the facade has
    // no members yet", while the kernel members — state, close, ready, and the queueing send —
    // work from the first tick.
    const proxyTarget = Object.create(null) as RealtimeSession;
    const boundMethods = new Map<
      PropertyKey,
      { source: unknown; bound: unknown }
    >();
    // What the `get` trap serves for a property, shared with the traps that mirror properties
    // onto the neutral target: once the target is non-extensible, the language requires a
    // non-configurable, non-writable target value and the trap result to be the SAME value, so
    // both sides must resolve through one function.
    const resolveProperty = (property: PropertyKey, value: unknown) => {
      if (property === "close") return publicClose;
      if (property === "state") return state;
      if (property === "ready") return ready;
      // The handle must NEVER be thenable, whatever the extension's session declares: resolving
      // `ready` with it, `await handle`, and Promise.all() all probe `then` and would assimilate
      // the handle into an unrelated promise instead of treating it as a value. A session's own
      // `then` stays reachable only inside the extension.
      if (property === "then") return undefined;
      if (typeof value !== "function") return value;
      const cached = boundMethods.get(property);
      if (cached?.source === value) return cached.bound;
      // Class methods must always observe the original instance. In particular, a Proxy cannot
      // satisfy private-field brand checks, and a frozen instance cannot have its raw `close`
      // hook replaced. Extensions end themselves through context.close(); the session's own
      // close method is the resource hook the kernel invokes during managed teardown.
      const bound = value.bind(session);
      // send is fire-and-forget by contract (the handle types it void), so a live send whose
      // extension implementation rejects asynchronously has no call site left to observe it —
      // consume and report the failure instead of leaking an unhandled rejection, exactly as the
      // pre-live queue flush does. Synchronous throws still propagate to the caller.
      const resolved =
        property === "send"
          ? (...args: unknown[]) => {
              const result = (bound as (...sendArgs: unknown[]) => unknown)(
                ...args,
              );
              if (
                result &&
                typeof (result as { then?: unknown }).then === "function"
              ) {
                void Promise.resolve(result).catch(() =>
                  diagnostic({
                    kind: "warning",
                    message: "A message could not be delivered to the session.",
                  }),
                );
              }
              return result;
            }
          : bound;
      boundMethods.set(property, { source: value, bound: resolved });
      return resolved;
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
    const handle = new Proxy(proxyTarget, {
      get(_target, property) {
        // A pinned target property — non-configurable, non-writable data — MUST report its exact
        // pinned value, whatever the property: the frozen `state` snapshot, a bound method pinned
        // by freeze, or a caller-defined non-configurable function the defineProperty trap
        // mirrored verbatim. The invariant forbids reporting anything else.
        const pinned = Reflect.getOwnPropertyDescriptor(proxyTarget, property);
        if (
          pinned &&
          !pinned.configurable &&
          pinned.writable === false &&
          "value" in pinned
        ) {
          return pinned.value;
        }
        if (property === "state") return state;
        if (property === "ready") return ready;
        if (property === "close") return publicClose;
        if (!session) {
          // `send` queues while opening so the handle is usable immediately; the rest of the
          // extension's facade materializes with the session. Note `then` also lands here as
          // undefined, so `await open(...)` passes the handle through instead of hanging on it.
          return property === "send" ? queuedSend : undefined;
        }
        return resolveProperty(
          property,
          Reflect.get(session, property, session),
        );
      },
      set(_target, property, value) {
        if (!session) return false;
        const updated = Reflect.set(session, property, value, session);
        const targetDescriptor = Reflect.getOwnPropertyDescriptor(
          proxyTarget,
          property,
        );
        // EVERY mirrored writable data property tracks the session's value, not only the
        // non-configurable ones: after Object.preventExtensions() the mirrors are still
        // configurable, and a later Object.freeze() would otherwise pin a stale target value
        // while the get trap serves the session's newer one — an invariant violation that throws
        // on read. The mirrored value resolves like the get trap's (functions stay bound).
        if (
          updated &&
          targetDescriptor &&
          "value" in targetDescriptor &&
          targetDescriptor.writable
        ) {
          Reflect.set(
            proxyTarget,
            property,
            resolveProperty(property, value),
            proxyTarget,
          );
        }
        return updated;
      },
      defineProperty(_target, property, descriptor) {
        if (!session) return false;
        if (!Reflect.defineProperty(session, property, descriptor)) {
          return false;
        }
        // A non-configurable property must also exist on the neutral target or the Proxy would
        // violate the language's invariants. Configurable properties can remain source-only —
        // unless the target is already non-extensible, where its key set must track the session's.
        //
        // A PINNED definition (non-configurable, non-writable, with a value) mirrors the caller's
        // exact value rather than the get-trap resolution: the language validates the trap's
        // success against the descriptor the caller supplied with SameValue, so storing a bound
        // variant would throw after both objects were already mutated. The get trap serves the
        // pinned target value verbatim, keeping the two invariants consistent.
        if (
          descriptor.configurable === false &&
          descriptor.writable === false &&
          "value" in descriptor
        ) {
          return Reflect.defineProperty(proxyTarget, property, descriptor);
        }
        return descriptor.configurable === false ||
          !Reflect.isExtensible(proxyTarget)
          ? mirrorOntoTarget(property, descriptor)
          : true;
      },
      deleteProperty(_target, property) {
        if (!session) return false;
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
        // key can appear later on one side only. Freezing a handle that is still opening locks
        // the facade empty; the kernel members keep working because they are trap-served.
        if (session) {
          if (!Reflect.preventExtensions(session)) {
            return false;
          }
          for (const property of Reflect.ownKeys(session)) {
            // Refresh EXISTING mirrors too, not only missing ones: a bound extension method
            // mutates the raw session without passing the set trap, so a freeze after an earlier
            // preventExtensions would otherwise pin a stale mirrored value while get serves the
            // session's newer one — an invariant violation that throws on read. Object.freeze
            // re-enters this trap before it pins descriptors, which is what makes this the right
            // moment to synchronize. Already-pinned (non-configurable) mirrors stay untouched.
            const existing = Reflect.getOwnPropertyDescriptor(
              proxyTarget,
              property,
            );
            // Sealed mirrors are non-configurable but still WRITABLE, and redefining a
            // non-configurable writable data property's value is legal — so a seal-then-mutate-
            // then-freeze sequence refreshes too. Only fully pinned (non-writable) mirrors stay.
            if (
              !existing ||
              existing.configurable ||
              ("value" in existing && existing.writable === true)
            ) {
              const descriptor = Reflect.getOwnPropertyDescriptor(
                session,
                property,
              );
              if (descriptor) {
                mirrorOntoTarget(property, descriptor);
              }
            }
          }
        }
        return Reflect.preventExtensions(proxyTarget);
      },
      has(_target, property) {
        // Once the target is non-extensible the language forbids reporting any property the
        // target does not own — including the kernel names, which are trap-served rather than own
        // properties. Freezing during "opening" locks the facade empty; the kernel members keep
        // working through `get`, which has no such invariant for non-own properties.
        if (!Reflect.isExtensible(proxyTarget)) {
          return Reflect.has(proxyTarget, property);
        }
        if (
          property === "close" ||
          property === "state" ||
          property === "ready"
        ) {
          return true;
        }
        return session ? Reflect.has(session, property) : false;
      },
      ownKeys() {
        // Before the session exists — and once the target is non-extensible, when the language
        // requires exact agreement — the neutral target is the source of truth.
        if (!session || !Reflect.isExtensible(proxyTarget)) {
          return Reflect.ownKeys(proxyTarget);
        }
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
        // A target locked while the facade was still empty (frozen during "opening") must not
        // report session descriptors that arrived later: a non-extensible target cannot gain
        // reported own properties, and violating that throws at the access site.
        if (!session || !Reflect.isExtensible(proxyTarget)) {
          return targetDescriptor;
        }
        const descriptor = Reflect.getOwnPropertyDescriptor(session, property);
        return descriptor ? { ...descriptor, configurable: true } : undefined;
      },
    }) as RealtimeSession;

    const openTask = async (): Promise<void> => {
      try {
        if (controller.signal.aborted) {
          throw (
            controller.signal.reason ??
            new DOMException("Realtime open aborted", "AbortError")
          );
        }
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
                // Native fetch defaults to GET; context.fetch takes RequestInit and must not
                // surprise an extension hitting a read-only endpoint without naming a method.
                method: (init.method ?? "GET").toUpperCase(),
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
              // A failure reported after managed teardown began is stale: the caller already
              // closed, the lifecycle correctly reads "closed", and surfacing the report would
              // render a failure for a session the user ended — the same suppression rule the
              // media and data channels apply. An extension's in-flight work observing its own
              // teardown lands here.
              if (closed) return;
              diagnostic({ kind: "failure", message, observed });
              // Before cleanup: cleanup sets "closed", and a caller watching transitions needs to see
              // that this session died rather than ended.
              setState("failed");
              const failure = new Error(message);
              reportError(failure);
              // No-ops once the session went live; before that, a caller awaiting `ready` must not
              // wait out a negotiation the extension has already declared dead.
              rejectReady(failure);
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
            close: () =>
              sessionCloseInProgress ? Promise.resolve() : cleanup(),
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
        // The extension facade appears on the handle the moment the session exists: the neutral
        // target adopts the session's prototype (unless the caller already made the handle
        // non-extensible), queued sends flush in order, and only then does state report "live" —
        // so an onState("live") callback that sends immediately cannot jump the queue.
        if (Reflect.isExtensible(proxyTarget)) {
          Object.setPrototypeOf(proxyTarget, Object.getPrototypeOf(session));
        }
        flushQueuedSends();
        // A queued send can synchronously end the session — an extension send that calls
        // context.close(), or app code aborting the caller's signal. The state latch already
        // refuses "live" after a terminal state; ready must reject through the normal
        // cancellation/failure path rather than resolve a session that never went live.
        if (
          controller.signal.aborted ||
          state === "failed" ||
          state === "closed"
        ) {
          throw (
            controller.signal.reason ??
            new Error("Realtime session ended while delivering queued sends")
          );
        }
        setState("live");
        resolveReady(handle);
      } catch (error) {
        const wasTerminal = state === "failed" || state === "closed";
        // A cancellation the caller initiated — close(), an aborted abortSignal, or a signal
        // aborted before open() — is an orderly ending, not a failure: cleanup reports it as
        // "closed" and it must not reach onError, or a callback-driven UI would render a failure
        // for its own disconnect button. Everything else moves to "failed" BEFORE cleanup, so a
        // caller watching state sees that this session died rather than ended.
        const cancelled = controller.signal.aborted && state !== "failed";
        if (!cancelled) {
          setState("failed");
        }
        await cleanup();
        await drainLateCleanups();
        if (state === "failed") {
          if (!wasTerminal) {
            // The synchronous shape has no returned promise whose rejection could carry this, so
            // the failure that was previously a rejection is also a reportable diagnostic —
            // unless the extension already reported it through context.fail().
            diagnostic({
              kind: "failure",
              message: error instanceof Error ? error.message : String(error),
            });
          }
          reportError(error);
        }
        // Rejects either way: a caller awaiting `ready` must not wait forever on a session that
        // will never become live, whether it failed or was cancelled.
        rejectReady(error);
      }
    };
    openTaskPromise = openTask();
    return handle;
  }

  realtimeClient.open = open as RealtimeClient["open"];
  return realtimeClient;
}
