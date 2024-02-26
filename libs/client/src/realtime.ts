/* eslint-disable @typescript-eslint/no-explicit-any */
import { decode, encode } from '@msgpack/msgpack';
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
} from 'robot3';
import uuid from 'uuid-random';
import { getRestApiUrl } from './config';
import { dispatchRequest } from './request';
import { ApiError } from './response';
import { isBrowser } from './runtime';
import { ensureAppIdFormat, isReact, throttle } from './utils';

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

type SendEvent = { type: 'send'; message: any };
type AuthenticatedEvent = { type: 'authenticated'; token: string };
type InitiateAuthEvent = { type: 'initiateAuth' };
type UnauthorizedEvent = { type: 'unauthorized'; error: Error };
type ConnectedEvent = { type: 'connected'; websocket: WebSocket };
type ConnectionClosedEvent = {
  type: 'connectionClosed';
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
    } else if (shouldSendBinary(event.message)) {
      context.websocket.send(encode(event.message));
    } else {
      context.websocket.send(JSON.stringify(event.message));
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
  event: ConnectedEvent
): Context {
  return {
    ...context,
    websocket: event.websocket,
  };
}

// State machine
const connectionStateMachine = createMachine(
  'idle',
  {
    idle: state(
      transition('send', 'connecting', reduce(enqueueMessage)),
      transition('expireToken', 'idle', reduce(expireToken))
    ),
    connecting: state(
      transition('connecting', 'connecting'),
      transition('connected', 'active', reduce(connectionEstablished)),
      transition('connectionClosed', 'idle', reduce(closeConnection)),
      transition('send', 'connecting', reduce(enqueueMessage)),

      immediate('authRequired', guard(noToken))
    ),
    authRequired: state(
      transition('initiateAuth', 'authInProgress'),
      transition('send', 'authRequired', reduce(enqueueMessage))
    ),
    authInProgress: state(
      transition('authenticated', 'connecting', reduce(setToken)),
      transition(
        'unauthorized',
        'idle',
        reduce(expireToken),
        reduce(closeConnection)
      ),
      transition('send', 'authInProgress', reduce(enqueueMessage))
    ),
    active: state(
      transition('send', 'active', reduce(sendMessage)),
      transition('unauthorized', 'idle', reduce(expireToken)),
      transition('connectionClosed', 'idle', reduce(closeConnection))
    ),
    failed: state(transition('send', 'failed')),
  },
  initialState
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
   * Callback function that is called when a result is received.
   * @param result - The result of the request.
   */
  onResult(result: Output & WithRequestId): void;

  /**
   * Callback function that is called when an error occurs.
   * @param error - The error that occurred.
   */
  onError?(error: ApiError<any>): void;
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
    handler: RealtimeConnectionHandler<Output>
  ): RealtimeConnection<Input>;
}

type RealtimeUrlParams = {
  token: string;
  maxBuffering?: number;
};

// This is a list of apps deployed before formal realtime support. Their URLs follow
// a different pattern and will be kept here until we fully sunset them.
const LEGACY_APPS = [
  'lcm-sd15-i2i',
  'lcm',
  'sdxl-turbo-realtime',
  'sd-turbo-real-time-high-fps-msgpack-a10g',
  'lcm-plexed-sd15-i2i',
  'sd-turbo-real-time-high-fps-msgpack',
];

function buildRealtimeUrl(
  app: string,
  { token, maxBuffering }: RealtimeUrlParams
): string {
  if (maxBuffering !== undefined && (maxBuffering < 1 || maxBuffering > 60)) {
    throw new Error('The `maxBuffering` must be between 1 and 60 (inclusive)');
  }
  const queryParams = new URLSearchParams({
    fal_jwt_token: token,
  });
  if (maxBuffering !== undefined) {
    queryParams.set('max_buffering', maxBuffering.toFixed(0));
  }
  const appId = ensureAppIdFormat(app);
  const [, appAlias] = ensureAppIdFormat(app).split('/');
  const suffix =
    LEGACY_APPS.includes(appAlias) || !app.includes('/') ? 'ws' : 'realtime';
  return `wss://fal.run/${appId}/${suffix}?${queryParams.toString()}`;
}

const TOKEN_EXPIRATION_SECONDS = 120;
const DEFAULT_THROTTLE_INTERVAL = 128;

function shouldSendBinary(message: any): boolean {
  return Object.values(message).some(
    (value) =>
      value instanceof Blob ||
      value instanceof ArrayBuffer ||
      value instanceof Uint8Array
  );
}

/**
 * Get a token to connect to the realtime endpoint.
 */
async function getToken(app: string): Promise<string> {
  const [, appAlias] = ensureAppIdFormat(app).split('/');
  const token: string | object = await dispatchRequest<any, string>(
    'POST',
    `${getRestApiUrl()}/tokens/`,
    {
      allowed_apps: [appAlias],
      token_expiration: TOKEN_EXPIRATION_SECONDS,
    }
  );
  // keep this in case the response was wrapped (old versions of the proxy do that)
  // should be safe to remove in the future
  if (typeof token !== 'string' && token['detail']) {
    return token['detail'];
  }
  return token;
}

function isUnauthorizedError(message: any): boolean {
  // TODO we need better protocol definition with error codes
  return message['status'] === 'error' && message['error'] === 'Unauthorized';
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
    payload?: any
  ) => void | Promise<void> | undefined;
};

type ConnectionOnChange = InterpretOnChangeFunction<
  typeof connectionStateMachine
>;

type RealtimeConnectionCallback = Pick<
  RealtimeConnectionHandler<any>,
  'onResult' | 'onError'
>;

const connectionCache = new Map<string, ConnectionStateMachine>();
const connectionCallbacks = new Map<string, RealtimeConnectionCallback>();
function reuseInterpreter(
  key: string,
  throttleInterval: number,
  onChange: ConnectionOnChange
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
    data.status !== 'error' &&
    data.type !== 'x-fal-message' &&
    !isFalErrorResult(data)
  );
}

type FalErrorResult = {
  type: 'x-fal-error';
  error: string;
  reason: string;
};

function isFalErrorResult(data: any): data is FalErrorResult {
  return data.type === 'x-fal-error';
}

/**
 * The default implementation of the realtime client.
 */
export const realtimeImpl: RealtimeClient = {
  connect<Input, Output>(
    app: string,
    handler: RealtimeConnectionHandler<Output>
  ): RealtimeConnection<Input> {
    const {
      // if running on React in the server, set clientOnly to true by default
      clientOnly = isReact() && !isBrowser(),
      connectionKey = uuid(),
      maxBuffering,
      throttleInterval = DEFAULT_THROTTLE_INTERVAL,
    } = handler;
    if (clientOnly && !isBrowser()) {
      return NoOpConnection;
    }

    let previousState: string | undefined;

    // Although the state machine is cached so we don't open multiple connections,
    // we still need to update the callbacks so we can call the correct references
    // when the state machine is reused. This is needed because the callbacks
    // are passed as part of the handler object, which can be different across
    // different calls to `connect`.
    connectionCallbacks.set(connectionKey, {
      onError: handler.onError,
      onResult: handler.onResult,
    });
    const getCallbacks = () =>
      connectionCallbacks.get(connectionKey) as RealtimeConnectionCallback;
    const stateMachine = reuseInterpreter(
      connectionKey,
      throttleInterval,
      ({ context, machine, send }) => {
        const { enqueuedMessage, token } = context;
        if (machine.current === 'active' && enqueuedMessage) {
          send({ type: 'send', message: enqueuedMessage });
        }
        if (
          machine.current === 'authRequired' &&
          token === undefined &&
          previousState !== machine.current
        ) {
          send({ type: 'initiateAuth' });
          getToken(app)
            .then((token) => {
              send({ type: 'authenticated', token });
              const tokenExpirationTimeout = Math.round(
                TOKEN_EXPIRATION_SECONDS * 0.9 * 1000
              );
              setTimeout(() => {
                send({ type: 'expireToken' });
              }, tokenExpirationTimeout);
            })
            .catch((error) => {
              send({ type: 'unauthorized', error });
            });
        }
        if (
          machine.current === 'connecting' &&
          previousState !== machine.current &&
          token !== undefined
        ) {
          const ws = new WebSocket(
            buildRealtimeUrl(app, { token, maxBuffering })
          );
          ws.onopen = () => {
            send({ type: 'connected', websocket: ws });
          };
          ws.onclose = (event) => {
            if (event.code !== WebSocketErrorCodes.NORMAL_CLOSURE) {
              const { onError = noop } = getCallbacks();
              onError(
                new ApiError({
                  message: `Error closing the connection: ${event.reason}`,
                  status: event.code,
                })
              );
            }
            send({ type: 'connectionClosed', code: event.code });
          };
          ws.onerror = (event) => {
            // TODO specify error protocol for identified errors
            const { onError = noop } = getCallbacks();
            onError(new ApiError({ message: 'Unknown error', status: 500 }));
          };
          ws.onmessage = (event) => {
            const { onResult } = getCallbacks();

            // Handle binary messages as msgpack messages
            if (event.data instanceof ArrayBuffer) {
              const result = decode(new Uint8Array(event.data));
              onResult(result);
              return;
            }
            if (event.data instanceof Uint8Array) {
              const result = decode(event.data);
              onResult(result);
              return;
            }
            if (event.data instanceof Blob) {
              event.data.arrayBuffer().then((buffer) => {
                const result = decode(new Uint8Array(buffer));
                onResult(result);
              });
              return;
            }

            // Otherwise handle strings as plain JSON messages
            const data = JSON.parse(event.data);

            // Drop messages that are not related to the actual result.
            // In the future, we might want to handle other types of messages.
            // TODO: specify the fal ws protocol format
            if (isUnauthorizedError(data)) {
              send({ type: 'unauthorized', error: new Error('Unauthorized') });
              return;
            }
            if (isSuccessfulResult(data)) {
              onResult(data);
              return;
            }
            if (isFalErrorResult(data)) {
              if (data.error === 'TIMEOUT') {
                // Timeout error messages just indicate that the connection hasn't
                // received an incoming message for a while. We don't need to
                // handle them as errors.
                return;
              }
              const { onError = noop } = getCallbacks();
              onError(
                new ApiError({
                  message: `${data.error}: ${data.reason}`,
                  // TODO better error status code
                  status: 400,
                  body: data,
                })
              );
              return;
            }
          };
        }
        previousState = machine.current;
      }
    );

    const send = (input: Input & Partial<WithRequestId>) => {
      // Use throttled send to avoid sending too many messages

      const message =
        input instanceof Uint8Array
          ? input
          : {
              ...input,
              request_id: input['request_id'] ?? uuid(),
            };

      stateMachine.throttledSend({
        type: 'send',
        message,
      });
    };

    const close = () => {
      stateMachine.send({ type: 'close' });
    };

    return {
      send,
      close,
    };
  },
};
