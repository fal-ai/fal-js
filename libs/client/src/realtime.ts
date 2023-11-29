import {
  createMachine,
  state,
  transition,
  interpret,
  reduce,
  ContextFunction,
  guard,
  immediate,
  Service,
  InterpretOnChangeFunction,
} from 'robot3';
import { getConfig, getRestApiUrl } from './config';
import { dispatchRequest } from './request';
import { ApiError } from './response';
import { isBrowser } from './runtime';
import { isReact, throttle } from './utils';

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
    context.websocket.send(JSON.stringify(event.message));
    return {
      ...context,
      enqueuedMessage: undefined,
    };
  }
  return enqueueMessage(context, event);
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
        'failed',
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

/**
 * A connection object that allows you to `send` request payloads to a
 * realtime endpoint.
 */
export interface RealtimeConnection<Input> {
  send(input: Input): void;

  close(): void;
}

type ResultWithRequestId = {
  request_id: string;
};

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
   * input, which can be very frequesnt (e.g. fast typing or mouse/drag movements).
   *
   * The default value is `64` milliseconds.
   */
  throttleInterval?: number;

  /**
   * Callback function that is called when a result is received.
   * @param result - The result of the request.
   */
  onResult(result: Output & ResultWithRequestId): void;

  /**
   * Callback function that is called when an error occurs.
   * @param error - The error that occurred.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  connect<Input = any, Output = any>(
    app: string,
    handler: RealtimeConnectionHandler<Output>
  ): RealtimeConnection<Input>;
}

function buildRealtimeUrl(app: string): string {
  const { host } = getConfig();
  return `wss://${app}.${host}/ws`;
}

const TOKEN_EXPIRATION_SECONDS = 120;

/**
 * Get a token to connect to the realtime endpoint.
 */
async function getToken(app: string): Promise<string> {
  const [_, ...appAlias] = app.split('-');
  const token: string | object = await dispatchRequest<any, string>(
    'POST',
    `https://${getRestApiUrl()}/tokens/`,
    {
      allowed_apps: [appAlias.join('-')],
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

type ConnectionStateMachine = Service<typeof connectionStateMachine>;

type ConnectionOnChange = InterpretOnChangeFunction<
  typeof connectionStateMachine
>;

const connections = new Map<string, ConnectionStateMachine>();
function reuseInterpreter(key: string, onChange: ConnectionOnChange) {
  if (!connections.has(key)) {
    connections.set(key, interpret(connectionStateMachine, onChange));
  }
  return connections.get(key) as ConnectionStateMachine;
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
      connectionKey = crypto.randomUUID(),
      throttleInterval = 64,
      onError = noop,
      onResult,
    } = handler;
    if (clientOnly && !isBrowser()) {
      return NoOpConnection;
    }

    let previousState: string | undefined;
    const stateMachine = reuseInterpreter(
      connectionKey,
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
        if (machine.current === 'connecting' && token !== undefined) {
          const ws = new WebSocket(
            `${buildRealtimeUrl(app)}?fal_jwt_token=${token}`
          );
          ws.onopen = () => {
            send({ type: 'connected', websocket: ws });
          };
          ws.onclose = (event) => {
            if (event.code !== WebSocketErrorCodes.NORMAL_CLOSURE) {
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
            onError(new ApiError({ message: 'Unknown error', status: 500 }));
          };
          ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // Drop messages that are not related to the actual result.
            // In the future, we might want to handle other types of messages.
            // TODO: specify the fal ws protocol format
            if (isUnauthorizedError(data)) {
              send({ type: 'unauthorized', error: new Error('Unauthorized') });
              return;
            }
            if (data.status !== 'error' && data.type !== 'x-fal-message') {
              onResult(data);
            }
          };
        }
        previousState = machine.current;
      }
    );

    const sendMessage = (input: Input) => {
      stateMachine.send({ type: 'send', message: input });
    };
    const send =
      throttleInterval > 0
        ? throttle(sendMessage, throttleInterval)
        : sendMessage;

    const close = () => {
      stateMachine.send({ type: 'close' });
    };

    return {
      send,
      close,
    };
  },
};
