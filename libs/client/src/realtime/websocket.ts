/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TokenProvider } from "../auth";
import { ApiError } from "../response";
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

const MAX_PACED_MESSAGES = 64;

const WEBSOCKET_HANDSHAKE_TIMEOUT_MS = 15_000;

function abortReason(signal: AbortSignal): unknown {
  return (
    signal.reason ??
    new DOMException("Realtime authentication aborted", "AbortError")
  );
}

function raceWithAbort<T>(
  promise: Promise<T>,
  signal: AbortSignal,
): Promise<T> {
  if (signal.aborted) return Promise.reject(abortReason(signal));
  return new Promise<T>((resolve, reject) => {
    const cleanup = () => signal.removeEventListener("abort", onAbort);
    const onAbort = () => {
      cleanup();
      reject(abortReason(signal));
    };
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (value) => {
        cleanup();
        resolve(value);
      },
      (error) => {
        cleanup();
        reject(error);
      },
    );
    if (signal.aborted) onAbort();
  });
}

/** @experimental The `fal.realtime.open()` extension API is experimental and may change in a minor release. */
export interface WebsocketOptions<Output = any> {
  /**
   * Mints the short-lived token the socket authenticates with.
   *
   * Required, where `connect()` makes it optional and falls back to minting from the client's
   * long-lived credentials. That fallback already warns that it is deprecated and points here, and it
   * needs the parent config, which an extension is deliberately not given. The eager API therefore
   * requires the supported short-lived-token path explicitly.
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
   * which produce far more input than a model can consume. Paced FIFO: the first input goes
   * immediately and later ones drain in order at this rate — nothing in the middle is dropped,
   * unlike a throttle — bounded at 64 pending with oldest-first eviction and a warning.
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

/** @experimental The `fal.realtime.open()` extension API is experimental and may change in a minor release. */
export interface WebsocketRealtimeSession<Input = any> extends RealtimeSession {
  /**
   * Queue one input. Paced FIFO — every message is delivered, in order, at the configured rate;
   * nothing is coalesced or dropped short of the queue bound. A no-op once the session is no
   * longer live — a dead socket is a dead session here, and `state` is where that is visible.
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
 * `open()` starts negotiation eagerly the moment it returns, so none of that has anything to do.
 * Pre-live sends ride the kernel's bounded queue and flush in order at "live"; a failed handshake
 * reaches `onError` once, immediately (and rejects `ready` for callers who hold it), rather than
 * arriving as a callback that may never fire; and `state` says `"live"` only when the transport
 * agrees.
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
 * Both APIs intentionally coexist: `connect()` is synchronous and lazy; `open(websocket())` is
 * asynchronous and eager.
 *
 * @experimental The `fal.realtime.open()` extension API is experimental and may change in a minor release.
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
      context.signal.throwIfAborted();
      const token = await raceWithAbort(
        tokenProvider(realtimeTokenScope(context.endpointId, path)),
        context.signal,
      );

      context.diagnostic({ kind: "progress", phase: "connecting" });
      context.signal.throwIfAborted();
      const ws = new WebSocket(
        buildRealtimeUrl(context.endpointId, { token, maxBuffering, path }),
      );
      // Browsers default binaryType to "blob", whose decode is async (blob.arrayBuffer());
      // ArrayBuffer frames decode synchronously, which both avoids that extra latency and
      // removes the widest source of decode-time variance between neighboring frames.
      ws.binaryType = "arraybuffer";
      context.addCleanup(() => {
        if (
          ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING
        ) {
          ws.close(WebSocketErrorCodes.NORMAL_CLOSURE);
        }
      });

      await new Promise<void>((resolve, reject) => {
        let settled = false;
        const settle = (finish: () => void) => {
          if (settled) return;
          settled = true;
          clearTimeout(handshakeTimeout);
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
        const handshakeTimeout = setTimeout(
          () =>
            settle(() =>
              reject(
                new ApiError({
                  message: `Timed out opening a realtime connection to ${context.endpointId}`,
                  status: 504,
                }),
              ),
            ),
          WEBSOCKET_HANDSHAKE_TIMEOUT_MS,
        );
        // A caller can abort synchronously from the "connecting" diagnostic, before the listener
        // above exists — and an AbortSignal does not replay its event. Without this recheck (after
        // `handshakeTimeout` exists, because settle clears it), the open waits out the handshake
        // timeout and reports it instead of the caller's abort reason.
        if (context.signal.aborted) {
          onAbort();
        }
      });

      // Decodes are SERIALIZED on one chain: each onmessage used to start an independent async
      // decode, so a fast-decoding later frame (a short text frame) could overtake an earlier
      // binary frame still awaiting its decode — out-of-order onResult delivery. The chain keeps
      // wire order; a failed decode is contained per-link so the chain never sticks rejected.
      let decodeChain: Promise<void> = Promise.resolve();
      // Bounded like the send-side pacer: each chain link retains its frame until decoded, so a
      // custom async decoder slower than frame arrival would otherwise grow memory without limit.
      // Overflow drops the NEWEST frame with a warning — order stays intact for what's kept.
      let pendingDecodes = 0;
      let warnedDecodeBacklog = false;
      ws.onmessage = (event) => {
        if (pendingDecodes >= MAX_PACED_MESSAGES) {
          if (!warnedDecodeBacklog) {
            warnedDecodeBacklog = true;
            context.diagnostic({
              kind: "warning",
              message:
                "Inbound frames are decoding slower than they arrive; the newest are being dropped.",
            });
          }
          return;
        }
        pendingDecodes++;
        decodeChain = decodeChain
          .then(() => decodeMessage(event.data))
          .then((decoded) => {
            if (context.signal.aborted) return;
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
            if (context.signal.aborted) return;
            context.diagnostic({
              kind: "warning",
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to decode a realtime message",
            });
          })
          .finally(() => {
            pendingDecodes--;
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
      // A paced FIFO rather than a leading+trailing throttle: the throttle keeps only the last
      // pending call, so the kernel's pre-live queue flush — a synchronous burst of distinct
      // messages — would deliver the first and last and silently drop everything between, the
      // exact single-slot data loss connect() is criticized for. Pacing preserves every message
      // in order at the same wire rate. Bounded like the kernel queue; overflow drops the oldest
      // with one warning. Zero disables pacing, as in `connect()`.
      let send: (input: Input & Partial<WithRequestId>) => void = write;
      if (throttleInterval > 0) {
        const pending: Array<Input & Partial<WithRequestId>> = [];
        let lastSentAt = 0;
        let drainTimer: ReturnType<typeof setTimeout> | undefined;
        let warnedOverflow = false;
        context.addCleanup(() => {
          if (drainTimer !== undefined) clearTimeout(drainTimer);
          pending.length = 0;
        });
        const drain = () => {
          drainTimer = undefined;
          const next = pending.shift();
          if (next === undefined) return;
          lastSentAt = Date.now();
          // The drain runs inside a timer with no caller to observe a throw: an encoding failure
          // (a circular object handed to the msgpack encoder, say) becomes a diagnostic and the
          // remaining queue keeps draining, instead of an uncaught error that strands it.
          try {
            write(next);
          } catch {
            context.diagnostic({
              kind: "warning",
              message: "A paced message could not be encoded and was dropped.",
            });
          }
          if (pending.length > 0) {
            drainTimer = setTimeout(drain, throttleInterval);
          }
        };
        send = (input) => {
          const now = Date.now();
          if (pending.length === 0 && now - lastSentAt >= throttleInterval) {
            // Contained exactly like the drain path: the same unencodable message must not
            // throw into the app's input handler on an empty queue yet quietly warn five
            // milliseconds later with one message queued. The pacing slot is only consumed
            // when something actually went out.
            try {
              write(input);
              lastSentAt = now;
            } catch {
              context.diagnostic({
                kind: "warning",
                message:
                  "A paced message could not be encoded and was dropped.",
              });
            }
            return;
          }
          if (pending.length >= MAX_PACED_MESSAGES) {
            pending.shift();
            if (!warnedOverflow) {
              warnedOverflow = true;
              context.diagnostic({
                kind: "warning",
                message: `More than ${MAX_PACED_MESSAGES} messages are waiting for the send pacer; the oldest are being dropped.`,
              });
            }
          }
          pending.push(input);
          if (drainTimer === undefined) {
            drainTimer = setTimeout(
              drain,
              Math.max(0, throttleInterval - (now - lastSentAt)),
            );
          }
        };
      }

      return {
        send,
        close: () => ws.close(WebSocketErrorCodes.NORMAL_CLOSURE),
      };
    },
  });
}
