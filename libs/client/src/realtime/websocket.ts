/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TokenProvider } from "../auth";
import { ApiError } from "../response";
import { throttle } from "../utils";
import { defineRealtimeExtension, type RealtimeSession } from "./extension";
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
} from "./protocol";

export interface WebsocketOptions<Output = any> {
  /** The endpoint to open, when the extension was not constructed with one. */
  endpointId?: string;

  /**
   * Mints the short-lived token the socket authenticates with.
   *
   * Required, where `connect()` makes it optional and falls back to minting from the client's
   * long-lived credentials. That fallback already warns that it is deprecated and points here, and it
   * needs the parent config, which an extension is deliberately not given — a new surface should not
   * be the thing that keeps a deprecated path alive.
   */
  tokenProvider: TokenProvider;

  /** Appended after the app id. Defaults to `/realtime`. */
  path?: string;

  /**
   * Frames the server keeps buffered before dropping old ones for new. Between 1 and 60; the app
   * decides when left unset.
   */
  maxBuffering?: number;

  /**
   * Minimum gap between sends, in milliseconds. Realtime apps react to typing and pointer movement,
   * which produce far more input than a model can consume. Leading-edge with a trailing call, so the
   * first input goes immediately and the last one is never the one that gets dropped.
   */
  throttleInterval?: number;

  /** Outgoing framing. Defaults to msgpack. */
  encodeMessage?: (input: any) => Uint8Array | string;

  /** Incoming framing. Defaults to msgpack, with JSON for text frames. */
  decodeMessage?: (data: any) => Promise<any> | any;

  /**
   * One inference result.
   *
   * Not routed through the kernel's `onData`, which is deliberately a raw string because a transport
   * cannot know a model's schema. This protocol does: results arrive msgpack-framed and are decoded
   * before anything else looks at them, so handing back a re-serialized string would discard the one
   * thing this transport knows that the others do not.
   */
  onResult(result: Output & WithRequestId): void;
}

export interface WebsocketRealtimeSession<Input = any> extends RealtimeSession {
  /**
   * Queue one input. Throttled, and a no-op once the session is no longer live — a dead socket is a
   * dead session here, and `state` is where that is visible.
   */
  send(input: Input & Partial<WithRequestId>): void;
}

/**
 * fal's own realtime inference protocol — msgpack over a fal WebSocket — behind `open()`.
 *
 * The same wire protocol as {@link RealtimeClient.connect}, through the same functions in
 * `./protocol`, and the reason it is worth having twice is WHEN the socket opens. `connect()` is
 * lazy: it returns synchronously, opens on the first `send()`, and buffers anything sent before the
 * socket is up. That laziness is where its five-state machine, its single-slot buffer, and its
 * connection cache all come from.
 *
 * `open()` awaits negotiation, so none of that has anything to do. A caller holds no `send` until
 * there is a socket to send on, which deletes the buffer; a failed handshake is a rejected promise
 * at the call site rather than a callback that may never fire; and `state` says `"live"` only when
 * the transport agrees.
 *
 * What is deliberately NOT carried over:
 *
 * - **Implicit reconnect.** `connect()` reconnects on the next `send()` after any failure, which
 *   falls out of its transitions rather than having been designed. Here a dead socket surfaces as
 *   `state: "failed"` and the application reopens, because an application that can see the failure
 *   can say something true about it instead of appearing to work while dropping every send.
 * - **Token refresh.** `connect()` refreshes at 90% of expiry, but nothing sends a token over an
 *   already-open socket and every exit from its active state discards the fetched value, so the
 *   refreshed token reaches nothing. Whether that is dead code or a missing feature turns on whether
 *   the server enforces expiry mid-connection, which is not answerable from the client;
 *   reimplementing the timer here would copy a mechanism with no demonstrated effect.
 *
 * `connect()` keeps its signature and its behaviour. This is an additional door onto one protocol,
 * not a replacement.
 */
export function websocket<Input = any, Output = any>(endpointId?: string) {
  return defineRealtimeExtension<
    WebsocketOptions<Output>,
    WebsocketRealtimeSession<Input>
  >({
    id: "fal/websocket",
    defaultEndpoint: endpointId,
    // No `supports`: any fal endpoint could plausibly expose a realtime path, and an extension with
    // no closed set to check should state no constraint rather than assert one it cannot back up.
    async open(context, options) {
      const {
        tokenProvider,
        path,
        maxBuffering,
        throttleInterval = DEFAULT_THROTTLE_INTERVAL,
        encodeMessage = encodeRealtimeMessage,
        decodeMessage = decodeRealtimeMessage,
        onResult,
      } = options;

      context.diagnostic({ kind: "progress", phase: "authenticating" });
      const token = await tokenProvider(
        realtimeTokenScope(context.endpointId, path),
      );
      context.signal.throwIfAborted();

      context.diagnostic({ kind: "progress", phase: "connecting" });
      const ws = new WebSocket(
        buildRealtimeUrl(context.endpointId, { token, maxBuffering, path }),
      );
      context.addCleanup(() => {
        if (
          ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING
        ) {
          ws.close(WebSocketErrorCodes.NORMAL_CLOSURE);
        }
      });

      await new Promise<void>((resolve, reject) => {
        const settle = (finish: () => void) => {
          ws.onopen = null;
          ws.onerror = null;
          ws.onclose = null;
          context.signal.removeEventListener("abort", onAbort);
          finish();
        };
        // A handshake that never completes is the case `connect()` cannot report at all: it has no
        // promise to reject and no state to enter, so a wrong key or a missing endpoint looks
        // exactly like a model that has not answered yet.
        function onAbort() {
          settle(() => reject(context.signal.reason));
        }
        ws.onopen = () => settle(resolve);
        ws.onerror = () =>
          settle(() =>
            reject(
              new ApiError({
                message: `Could not open a realtime connection to ${context.endpointId}`,
                status: 500,
              }),
            ),
          );
        // Some browsers report a rejected handshake only as a close.
        ws.onclose = (event) =>
          settle(() =>
            reject(
              new ApiError({
                message: `Realtime connection to ${context.endpointId} closed during negotiation: ${
                  event.reason || `code ${event.code}`
                }`,
                status: event.code,
              }),
            ),
          );
        context.signal.addEventListener("abort", onAbort, { once: true });
      });

      ws.onmessage = (event) => {
        void Promise.resolve(decodeMessage(event.data))
          .then((decoded) => {
            if (isUnauthorizedError(decoded)) {
              void context.fail("realtime connection is unauthorized");
              return;
            }
            if (isSuccessfulResult(decoded)) {
              onResult(decoded);
              return;
            }
            if (isFalErrorResult(decoded)) {
              // TIMEOUT means only that nothing has arrived for a while. The connection is fine.
              if (decoded.error === "TIMEOUT") return;
              context.diagnostic({
                kind: "failure",
                message: `${decoded.error}: ${decoded.reason}`,
              });
            }
          })
          .catch((error: unknown) => {
            context.diagnostic({
              kind: "warning",
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to decode a realtime message",
            });
          });
      };

      // A clean close and a dead transport are the two cases a status UI most needs to tell apart,
      // and `connect()` reported both through the same callback.
      ws.onclose = (event) => {
        if (event.code === WebSocketErrorCodes.NORMAL_CLOSURE) {
          void context.close();
          return;
        }
        void context.fail(
          `Realtime connection closed: ${event.reason || "no reason given"}`,
          { code: event.code },
        );
      };

      const write = (input: Input & Partial<WithRequestId>) => {
        if (ws.readyState !== WebSocket.OPEN) return;
        ws.send(encodeMessage(input));
      };
      // Zero disables it, as in `connect()`, for callers whose inputs are already paced.
      const send =
        throttleInterval > 0 ? throttle(write, throttleInterval, true) : write;

      return {
        send,
        close: () => ws.close(WebSocketErrorCodes.NORMAL_CLOSURE),
      };
    },
  });
}
