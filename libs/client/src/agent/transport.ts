import type { RequiredConfig } from "../config";
import { dispatchRequest } from "../request";
import { defaultResponseHandler } from "../response";
import { calculateBackoffDelay, isRetryableError } from "../retry";
import { AgentProtocolError, AgentRequestError } from "./errors";
import type { AgentRequestOptions } from "./types";

export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw (
      signal.reason ??
      new DOMException("Agent observation aborted", "AbortError")
    );
  }
}

export function pause(ms: number, signal?: AbortSignal): Promise<void> {
  throwIfAborted(signal);
  return new Promise((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      reject(signal?.reason ?? new DOMException("Aborted", "AbortError"));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", abort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", abort, { once: true });
  });
}

/** One local deadline across submit, reconnects, and polling. */
export function observation(options: AgentRequestOptions) {
  if (
    options.timeoutMs !== undefined &&
    (!Number.isFinite(options.timeoutMs) || options.timeoutMs <= 0)
  ) {
    throw new TypeError("timeoutMs must be a positive finite number");
  }
  const controller = new AbortController();
  const abort = () => controller.abort(options.signal?.reason);
  if (options.signal?.aborted) abort();
  else options.signal?.addEventListener("abort", abort, { once: true });
  const timer =
    options.timeoutMs === undefined
      ? undefined
      : setTimeout(
          () =>
            controller.abort(
              new DOMException("Agent observation timed out", "TimeoutError"),
            ),
          options.timeoutMs,
        );
  return {
    signal: controller.signal,
    close() {
      clearTimeout(timer);
      options.signal?.removeEventListener("abort", abort);
      controller.abort();
    },
  };
}

export function mutationKey(options: AgentRequestOptions): string {
  if (options.idempotencyKey !== undefined) {
    if (
      !options.idempotencyKey.trim() ||
      /[\r\n]/.test(options.idempotencyKey)
    ) {
      throw new TypeError(
        "idempotencyKey must be a nonempty single-line string",
      );
    }
    return options.idempotencyKey;
  }
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  // Nonsecret idempotency tokens also work on Node 18 without global Web Crypto.
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export function segment(id: string): string {
  if (!id || id === "." || id === "..")
    throw new TypeError("A resource ID is required");
  return encodeURIComponent(id);
}

export function createAgentTransport(config: RequiredConfig) {
  return async function request<T>(
    method: string,
    path: string,
    input: unknown,
    options: AgentRequestOptions = {},
    responseId?: string,
    stream = false,
    retry = true,
  ): Promise<T> {
    const base = config.agent?.baseUrl;
    if (!base)
      throw new Error(
        "Agent is experimental: configure agent.baseUrl for a compatible backend",
      );
    const url = new URL(base);
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      throw new TypeError(
        "agent.baseUrl must be an HTTP(S) base URL without credentials, query, or fragment",
      );
    }
    // The stream observer owns its deadline and must keep the fetch signal
    // alive until the body is consumed. JSON requests own a local scope.
    const scope = stream
      ? {
          signal: options.signal,
          close() {
            /* caller owns stream lifetime */
          },
        }
      : observation(options);
    try {
      for (let attempt = 0; ; attempt++) {
        throwIfAborted(scope.signal);
        try {
          return await dispatchRequest<unknown, T>({
            method,
            targetUrl: `${base.replace(/\/$/, "")}${path}`,
            input,
            config,
            headers: {
              Accept: stream ? "text/event-stream" : "application/json",
              ...(options.idempotencyKey
                ? { "Idempotency-Key": options.idempotencyKey }
                : {}),
            },
            options: {
              signal: scope.signal,
              // Own backoff here so local abort also interrupts retry delays.
              retry: { maxRetries: 0 },
              responseHandler: stream
                ? async (response) => {
                    if (!response.ok) await defaultResponseHandler(response);
                    if (
                      !response.headers
                        .get("content-type")
                        ?.includes("text/event-stream") ||
                      !response.body
                    ) {
                      throw new AgentProtocolError(
                        "Agent stream requires an SSE response body",
                      );
                    }
                    return response;
                  }
                : defaultResponseHandler,
            },
          });
        } catch (error) {
          if (
            !retry ||
            scope.signal?.aborted ||
            attempt >= config.retry.maxRetries ||
            !isRetryableError(error, config.retry.retryableStatusCodes)
          )
            throw error;
          await pause(
            calculateBackoffDelay(
              attempt,
              config.retry.baseDelay,
              config.retry.maxDelay,
              config.retry.backoffMultiplier,
              config.retry.enableJitter,
            ),
            scope.signal,
          );
        }
      }
    } catch (error) {
      throw new AgentRequestError(error, {
        responseId,
        idempotencyKey: options.idempotencyKey,
      });
    } finally {
      // A streaming body is read by the caller, which owns its AbortSignal.
      // Do not abort the fetch after receiving its headers.
      scope.close();
    }
  };
}
