import { getConfig, getRestApiUrl } from './config';
import { dispatchRequest } from './request';
import { ApiError } from './response';
import { debounce } from './utils';

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
   */
  clientOnly?: boolean;

  /**
   * The debounce duration in milliseconds. This is used to debounce the
   * calls to the `send` function. Realtime apps usually react to user
   * input, which can be very frequesnt (e.g. fast typing or mouse/drag movements).
   *
   * The default value is `16` milliseconds.
   */
  debounceDuration?: number;

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

function builRealtimeUrl(app: string): string {
  const { host } = getConfig();
  return `wss://${app}.${host}/ws`;
}

/**
 * Get a token to connect to the realtime endpoint.
 */
async function getToken(app: string): Promise<string> {
  return await dispatchRequest<any, string>(
    'POST',
    `https://${getRestApiUrl()}/tokens`,
    {
      allowed_apps: [app],
      token_expiration: 60,
    }
  );
}

/**
 * See https://www.rfc-editor.org/rfc/rfc6455.html#section-7.4.1
 */
const WebSocketErrorCodes = {
  NORMAL_CLOSURE: 1000,
  GOING_AWAY: 1001,
};

const connections = new Map<string, WebSocket>();

async function getConnection(app: string, key: string): Promise<WebSocket> {
  const url = builRealtimeUrl(app);
  // const token = await getToken(app);
  const token = '***';

  if (connections.has(key)) {
    return connections.get(key) as WebSocket;
  }
  const ws = new WebSocket(url);
  connections.set(key, ws);
  return ws;
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
      clientOnly = false,
      connectionKey = crypto.randomUUID(),
      debounceDuration = 16,
      onError = noop,
      onResult,
    } = handler;
    if (clientOnly && typeof window === 'undefined') {
      return NoOpConnection;
    }

    const enqueueMessages: Input[] = [];

    let ws: WebSocket | null = null;
    const _send = (input: Input) => {
      const requestId = crypto.randomUUID();
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            request_id: requestId,
            ...input,
          })
        );
      } else {
        enqueueMessages.push(input);
        connect();
      }
    };
    const send =
      debounceDuration > 0 ? debounce(_send, debounceDuration) : _send;

    const connect = () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        return;
      }
      getConnection(app, connectionKey)
        .then((connection) => {
          ws = connection;
          ws.onopen = () => {
            if (enqueueMessages.length > 0) {
              enqueueMessages.forEach((input) => send(input));
              enqueueMessages.length = 0;
            }
          };
          ws.onclose = (event) => {
            connections.delete(connectionKey);
            if (event.code !== WebSocketErrorCodes.NORMAL_CLOSURE) {
              console.log('ws onclose');
              onError(
                new ApiError({
                  message: 'Error closing the connection',
                  status: 0,
                })
              );
            }
          };
          ws.onerror = (event) => {
            console.log('ws onerror');
            console.error(event);
            onError(new ApiError({ message: 'error', status: 0 }));
          };
          ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // Drop messages that are not related to the actual result.
            // In the future, we might want to handle other types of messages.
            if (data.status !== 'error' && data.type !== 'x-fal-message') {
              onResult(data);
            }
          };
        })
        .catch((error) => {
          console.log('ws connection error');
          console.error(error);
          onError(
            new ApiError({ message: 'Error opening connection', status: 0 })
          );
        });
    };

    return {
      send,
      close() {
        if (ws && ws.readyState === WebSocket.CLOSED) {
          ws.close(
            WebSocketErrorCodes.GOING_AWAY,
            'Client manually closed the connection.'
          );
        }
      },
    };
  },
};
