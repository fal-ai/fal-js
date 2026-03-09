/* eslint-disable @typescript-eslint/no-explicit-any */
import { decode, encode } from "@msgpack/msgpack";
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
  type TokenProvider,
  getTemporaryAuthToken,
} from "./auth";
import { RequiredConfig } from "./config";
import { ApiError } from "./response";
import { isBrowser } from "./runtime";
import {
  ensureEndpointIdFormat,
  isReact,
  resolveEndpointPath,
  throttle,
} from "./utils";

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
      transition("expireToken", "idle", reduce(expireToken)),
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
    failed: state(
      transition("send", "failed"),
      transition("close", "idle", reduce(closeConnection)),
    ),
  },
  initialState,
);

type WithRequestId = {
  request_id: string;
};

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
   * The throtle duration in milliseconds. This is used to throtle the
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
}

type RealtimeUrlParams = {
  token: string;
  maxBuffering?: number;
  path?: string;
};

function buildRealtimeUrl(
  app: string,
  { token, maxBuffering, path }: RealtimeUrlParams,
): string {
  if (maxBuffering !== undefined && (maxBuffering < 1 || maxBuffering > 60)) {
    throw new Error("The `maxBuffering` must be between 1 and 60 (inclusive)");
  }
  const queryParams = new URLSearchParams({
    fal_jwt_token: token,
  });
  if (maxBuffering !== undefined) {
    queryParams.set("max_buffering", maxBuffering.toFixed(0));
  }
  const appId = ensureEndpointIdFormat(app);
  const resolvedPath = resolveEndpointPath(app, path, "/realtime") ?? "";
  return `wss://fal.run/${appId}${resolvedPath}?${queryParams.toString()}`;
}

const DEFAULT_THROTTLE_INTERVAL = 128;

function isUnauthorizedError(message: any): boolean {
  // TODO we need better protocol definition with error codes
  return message["status"] === "error" && message["error"] === "Unauthorized";
}

/**
 * See https://www.rfc-editor.org/rfc/rfc6455.html#section-7.4.1
 */
const WebSocketErrorCodes = {
  NORMAL_CLOSURE: 1000,
  GOING_AWAY: 1001,
};

type ConnectionStateMachine = Service<typeof connectionStateMachine> & {
  throttledSend: (
    event: Event,
    payload?: any,
  ) => void | Promise<void> | undefined;
};

type ConnectionOnChange = InterpretOnChangeFunction<
  typeof connectionStateMachine
>;

type RealtimeConnectionCallback = Pick<
  RealtimeConnectionHandler<any>,
  "onResult" | "onError" | "decodeMessage"
>;

const connectionCache = new Map<string, ConnectionStateMachine>();
const connectionCallbacks = new Map<string, RealtimeConnectionCallback>();
function reuseInterpreter(
  key: string,
  throttleInterval: number,
  onChange: ConnectionOnChange,
) {
  if (!connectionCache.has(key)) {
    const machine = interpret(connectionStateMachine, onChange);
    connectionCache.set(key, {
      ...machine,
      throttledSend:
        throttleInterval > 0
          ? throttle(machine.send, throttleInterval, true)
          : machine.send,
    });
  }
  return connectionCache.get(key) as ConnectionStateMachine;
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

function isSuccessfulResult(data: any): boolean {
  return (
    data.status !== "error" &&
    data.type !== "x-fal-message" &&
    !isFalErrorResult(data)
  );
}

type FalErrorResult = {
  type: "x-fal-error";
  error: string;
  reason: string;
};

function isFalErrorResult(data: any): data is FalErrorResult {
  return data.type === "x-fal-error";
}

type RealtimeClientDependencies = {
  config: RequiredConfig;
};

async function decodeRealtimeMessage(data: any): Promise<any> {
  if (typeof data === "string") {
    return JSON.parse(data);
  }

  const toUint8Array = async (
    value: ArrayBuffer | Uint8Array | Blob,
  ): Promise<Uint8Array> => {
    if (value instanceof Uint8Array) {
      return value;
    }
    if (value instanceof Blob) {
      return new Uint8Array(await value.arrayBuffer());
    }
    return new Uint8Array(value);
  };

  if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
    return decode(await toUint8Array(data));
  }
  if (data instanceof Blob) {
    return decode(await toUint8Array(data));
  }

  return data;
}

function encodeRealtimeMessage(input: any): Uint8Array | string {
  if (input instanceof Uint8Array) {
    return input;
  }
  if (typeof input === "string") {
    return encode(input);
  }
  return encode(input);
}

type HandleRealtimeMessageParams = {
  data: any;
  decodeMessage: RealtimeConnectionCallback["decodeMessage"];
  onResult: RealtimeConnectionCallback["onResult"];
  onError: NonNullable<RealtimeConnectionCallback["onError"]> | typeof noop;
  send: ConnectionStateMachine["send"];
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
}: RealtimeClientDependencies): RealtimeClient {
  return {
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
      connectionCallbacks.set(connectionKey, {
        decodeMessage: decodeMessageFn,
        onError: handler.onError,
        onResult: handler.onResult,
      });
      const getCallbacks = () =>
        connectionCallbacks.get(connectionKey) as RealtimeConnectionCallback;
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
            const appId = ensureEndpointIdFormat(app);
            const resolvedPath =
              resolveEndpointPath(app, path, "/realtime") ?? "";
            const fetchToken = tokenProvider
              ? () => tokenProvider(`${appId}${resolvedPath}`)
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
                    clearTimeout(tokenRefreshTimer);
                    const refreshMs = Math.round(
                      effectiveExpiration * 0.9 * 1000,
                    );
                    tokenRefreshTimer = setTimeout(() => {
                      if (generation !== tokenRefreshGeneration) {
                        return;
                      }
                      fetchToken()
                        .then((newToken) => {
                          if (generation !== tokenRefreshGeneration) {
                            return;
                          }
                          queueMicrotask(() => {
                            send({ type: "authenticated", token: newToken });
                          });
                          scheduleTokenRefresh();
                        })
                        .catch(() => {
                          if (generation !== tokenRefreshGeneration) {
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
                queueMicrotask(() => {
                  send({ type: "authenticated", token });
                });
                scheduleTokenRefresh();
              })
              .catch((error) => {
                queueMicrotask(() => {
                  send({ type: "unauthorized", error });
                });
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
              send({ type: "connected", websocket: ws });
              const queued =
                (stateMachine as any).context?.enqueuedMessage ??
                latestEnqueuedMessage;
              if (queued) {
                ws.send(encodeMessageFn(queued));
                (stateMachine as any).context = {
                  ...(stateMachine as any).context,
                  enqueuedMessage: undefined,
                };
              }
            };
            ws.onclose = (event) => {
              if (event.code !== WebSocketErrorCodes.NORMAL_CLOSURE) {
                const { onError = noop } = getCallbacks();
                onError(
                  new ApiError({
                    message: `Error closing the connection: ${event.reason}`,
                    status: event.code,
                  }),
                );
              }
              send({ type: "connectionClosed", code: event.code });
            };
            ws.onerror = (event) => {
              // TODO specify error protocol for identified errors
              const { onError = noop } = getCallbacks();
              onError(new ApiError({ message: "Unknown error", status: 500 }));
            };
            ws.onmessage = (event) => {
              const {
                decodeMessage = decodeMessageFn,
                onResult,
                onError = noop,
              } = getCallbacks();

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
      );

      const send = (input: Input & Partial<WithRequestId>) => {
        // Use throttled send to avoid sending too many messages
        stateMachine.throttledSend({
          type: "send",
          message: encodeMessageFn(input),
        });
      };

      const close = () => {
        stateMachine.send({ type: "close" });
      };

      return {
        send,
        close,
      };
    },
  };
}
