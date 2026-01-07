import { getTemporaryAuthToken, TOKEN_EXPIRATION_SECONDS } from "./auth";
import { RequiredConfig } from "./config";
import { ApiError } from "./response";
import { isBrowser } from "./runtime";
import { ensureEndpointIdFormat, isReact } from "./utils";

const DEFAULT_OPEN_TIMEOUT_MS = 90_000;
const MAX_BUFFERING_RANGE = { min: 1, max: 60 };

export type WebSocketConnectOptions = {
  /**
   * Optional path to append after the app id, e.g. `/custom`.
   */
  path?: string;
  /**
   * max_buffering query param, validated between 1-60 (inclusive).
   */
  maxBuffering?: number;
  /**
   * When true on SSR frameworks, returns a no-op connection.
   */
  clientOnly?: boolean;
  /**
   * Milliseconds to wait for the socket to open before rejecting.
   */
  openTimeoutMs?: number;
  /**
   * Override token expiration in seconds.
   */
  tokenExpirationSeconds?: number;
};

export type WebSocketConnection = {
  /**
   * Underlying WebSocket when available. Undefined in no-op/SSR mode.
   */
  raw?: WebSocket;
  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void;
  close(code?: number, reason?: string): void;
  /**
   * Safe helper to access the raw WebSocket only when present.
   */
  withRaw<R>(fn: (ws: WebSocket) => R): R | undefined;
};

export interface WebSocketClient {
  connect(
    app: string,
    options?: WebSocketConnectOptions,
  ): Promise<WebSocketConnection>;
}

const noop = () => {
  /* no-op */
};

const noopWithRaw: WebSocketConnection["withRaw"] = () => undefined;

const NoOpWebSocketConnection: WebSocketConnection = {
  send: noop,
  close: noop,
  withRaw: noopWithRaw,
};

function validateMaxBuffering(value: number | undefined) {
  if (value === undefined) {
    return;
  }
  const { min, max } = MAX_BUFFERING_RANGE;
  if (value < min || value > max) {
    throw new Error(
      `The \`maxBuffering\` must be between ${min} and ${max} (inclusive)`,
    );
  }
}

function buildWebSocketUrl(
  app: string,
  token: string,
  path?: string,
  maxBuffering?: number,
): string {
  validateMaxBuffering(maxBuffering);
  const queryParams = new URLSearchParams({
    fal_jwt_token: token,
  });
  if (maxBuffering !== undefined) {
    queryParams.set("max_buffering", maxBuffering.toFixed(0));
  }
  const appId = ensureEndpointIdFormat(app);
  const normalizedPath = path ? `/${path.replace(/^\/+/, "")}` : "";
  return `wss://fal.run/${appId}${normalizedPath}?${queryParams.toString()}`;
}

type WebSocketClientDependencies = {
  config: RequiredConfig;
};

function openWebSocket(
  url: string,
  openTimeoutMs: number,
): Promise<WebSocketConnection> {
  return new Promise((resolve, reject) => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const ws = new WebSocket(url);

    const cleanup = () => {
      ws.removeEventListener("open", handleOpen);
      ws.removeEventListener("error", handleError);
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
    };

    const handleOpen = () => {
      cleanup();
      resolve({
        raw: ws,
        send: (data) => ws.send(data),
        close: (code?: number, reason?: string) => ws.close(code, reason),
        withRaw: (fn) => fn(ws),
      });
    };

    const handleError = (event: Event) => {
      cleanup();
      reject(
        new ApiError({
          message: "Error opening the websocket connection",
          status: 500,
        }),
      );
    };

    ws.addEventListener("open", handleOpen, { once: true });
    ws.addEventListener("error", handleError, { once: true });

    if (openTimeoutMs > 0) {
      timeoutId = setTimeout(() => {
        cleanup();
        ws.close();
        reject(
          new ApiError({
            message: "Timed out while opening the websocket connection",
            status: 408,
          }),
        );
      }, openTimeoutMs);
    }
  });
}

export function createWebSocketClient({
  config,
}: WebSocketClientDependencies): WebSocketClient {
  return {
    async connect(
      app: string,
      options: WebSocketConnectOptions = {},
    ): Promise<WebSocketConnection> {
      const {
        path,
        maxBuffering,
        openTimeoutMs = DEFAULT_OPEN_TIMEOUT_MS,
        clientOnly = isReact() && !isBrowser(),
        tokenExpirationSeconds = TOKEN_EXPIRATION_SECONDS,
      } = options;

      if (clientOnly && !isBrowser()) {
        return NoOpWebSocketConnection;
      }

      const token = await getTemporaryAuthToken(
        app,
        config,
        tokenExpirationSeconds,
      );

      const url = buildWebSocketUrl(app, token, path, maxBuffering);
      return openWebSocket(url, openTimeoutMs);
    },
  };
}
