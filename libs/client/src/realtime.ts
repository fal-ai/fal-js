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
  disposed: boolean;
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
) {
  if (!connectionCache.has(key)) {
    const service = interpret(connectionStateMachine, onChange);
    connectionCache.set(key, {
      service,
      throttledSend:
        throttleInterval > 0
          ? throttle(
              (event: Event) => {
                if (!connectionCache.get(key)?.disposed) {
                  return service.send(event);
                }
              },
              throttleInterval,
              true,
            )
          : service.send,
      callbacks,
      disposed: false,
    });
  }
  const cached = connectionCache.get(key) as ConnectionStateMachine;
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
};

function handleRealtimeMessage({
  data,
  decodeMessage,
  onResult,
  onError,
  send,
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
    .then(handleDecoded)
    .catch((error) => {
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
      );

      const send = (input: Input & Partial<WithRequestId>) => {
        if (stateMachine.disposed) return;
        // Use throttled send to avoid sending too many messages
        stateMachine.throttledSend({
          type: "send",
          message: encodeMessageFn(input),
        });
      };

      const close = () => {
        if (stateMachine.disposed) return;
        stateMachine.disposed = true;
        tokenRefreshGeneration++;
        clearTimeout(tokenRefreshTimer);
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
    let closed = false;
    let cleanupPromise: Promise<void> | undefined;
    let session: RealtimeSession | undefined;
    let sessionClosePromise: Promise<void> | undefined;
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
      if (!session) return Promise.resolve();
      if (!sessionClosePromise) {
        const openedSession = session;
        sessionClosePromise = Promise.resolve().then(() =>
          openedSession.close(),
        );
      }
      return sessionClosePromise;
    };

    const cleanup = (): Promise<void> => {
      if (cleanupPromise) return cleanupPromise;
      closed = true;
      setState("closed");
      controller.abort();
      externalSignal?.removeEventListener("abort", abort);
      // Defer the work by one microtask so cleanupPromise is assigned before an
      // extension close hook can re-enter cleanup through context.close().
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
        }
      });
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
      try {
        onMedia?.(stream);
      } catch {
        // A caller's media handler must never be able to fail a session.
      }
    };
    const onData = (options as { onData?: (raw: string) => void })?.onData;
    const data = (raw: string) => {
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

    try {
      session = await extension.open(
        {
          endpointId,
          signal: controller.signal,
          run: <Input, Output>(
            id: string,
            runOptions: RunOptions<Input>,
          ): Promise<Result<Output>> => {
            if (/^[a-z][a-z\d+.-]*:/i.test(id) || id.startsWith("//")) {
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
              id,
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
            return doFetch(targetUrl, {
              ...init,
              method,
              signal: init.signal ?? controller.signal,
              headers: {
                ...(credentials ? { Authorization: `Key ${credentials}` } : {}),
                "Content-Type": "application/json",
                ...(headers ?? {}),
              },
            });
          },
          gatherIce: (pc, iceOptions) =>
            gatherIceCandidates(pc, {
              ...iceOptions,
              signal: controller.signal,
              onProgress: (result) =>
                diagnostic({
                  kind: "progress",
                  phase: "ice-gathering",
                  detail: { ...result },
                }),
            }),
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
          close: cleanup,
        },
        options,
      );
      if (controller.signal.aborted) {
        await closeSession();
        await cleanup();
        await Promise.all(lateCleanups);
        throw controller.signal.reason ?? new Error("Realtime open aborted");
      }
      setState("live");
      return new Proxy(session, {
        get(target, property, receiver) {
          if (property === "close") return cleanup;
          if (property === "state") return state;
          const value = Reflect.get(target, property, receiver);
          return typeof value === "function" ? value.bind(target) : value;
        },
      });
    } catch (error) {
      // Before cleanup, so a caller watching state sees "failed" rather than only "closed" — the two
      // mean different things and a status UI should be able to tell them apart.
      setState("failed");
      await cleanup();
      throw error;
    }
  }

  realtimeClient.open = open as RealtimeClient["open"];
  return realtimeClient;
}
