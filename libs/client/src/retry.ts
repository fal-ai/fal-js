import { ApiError } from "./response";
import { sleep } from "./utils";

export type RetryOptions = {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableStatusCodes: number[];
  enableJitter: boolean;
};

/**
 * Base retryable status codes for most requests
 */
export const DEFAULT_RETRYABLE_STATUS_CODES = [429, 502, 503, 504];

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  retryableStatusCodes: DEFAULT_RETRYABLE_STATUS_CODES,
  enableJitter: true,
};

/**
 * Network/transport-level error codes that indicate transient failures worth
 * retrying. Node's `fetch` (undici) wraps the underlying SystemError inside a
 * `TypeError("fetch failed")` and exposes the original via `.cause`; other
 * fetch implementations such as `node-fetch` set `.code` directly on the error.
 */
const RETRYABLE_NETWORK_ERROR_CODES = new Set([
  "ECONNABORTED",
  "ECONNREFUSED",
  "ECONNRESET",
  "EAI_AGAIN",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "ENOTFOUND",
  "EPIPE",
  "ETIMEDOUT",
  "UND_ERR_BODY_TIMEOUT",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_SOCKET",
]);

/**
 * Returns true for transient transport-level failures (connection resets,
 * DNS hiccups, socket timeouts, etc.). Mirrors the Python client's behavior
 * of retrying `httpx.TransportError` and `httpx.TimeoutException`.
 */
export function isRetryableNetworkError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  // User-initiated cancellation must not be retried.
  if ((error as { name?: string }).name === "AbortError") {
    return false;
  }

  const seen = new Set<unknown>();
  let current: any = error;
  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    const code = (current as { code?: unknown }).code;
    if (typeof code === "string" && RETRYABLE_NETWORK_ERROR_CODES.has(code)) {
      return true;
    }
    current = (current as { cause?: unknown }).cause;
  }

  // Generic Node `fetch` failure (`TypeError: fetch failed`) without a
  // recognised `.code` — still a transport-layer problem, treat it as
  // retryable like httpx.TransportError does.
  if (
    error instanceof TypeError &&
    typeof (error as { message?: unknown }).message === "string" &&
    /fetch failed/i.test((error as { message: string }).message)
  ) {
    return true;
  }

  return false;
}

/**
 * Determines if an error is retryable based on the status code or, for
 * non-HTTP failures, on the underlying transport error. User-specified
 * timeouts (504 with X-Fal-Request-Timeout-Type: user) are NOT retryable.
 */
export function isRetryableError(
  error: any,
  retryableStatusCodes: number[],
): boolean {
  if (error instanceof ApiError) {
    // User-specified timeouts should NOT be retried
    if (error.isUserTimeout) {
      return false;
    }
    return retryableStatusCodes.includes(error.status);
  }
  return isRetryableNetworkError(error);
}

/**
 * Calculates the backoff delay for a given attempt using exponential backoff
 */
export function calculateBackoffDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  backoffMultiplier: number,
  enableJitter: boolean,
): number {
  const exponentialDelay = Math.min(
    baseDelay * Math.pow(backoffMultiplier, attempt),
    maxDelay,
  );

  if (enableJitter) {
    // Add ±25% jitter to prevent thundering herd
    const jitter = 0.25 * exponentialDelay * (Math.random() * 2 - 1);
    return Math.max(0, exponentialDelay + jitter);
  }

  return exponentialDelay;
}

/**
 * Retry metrics for tracking retry attempts
 */
export interface RetryMetrics {
  totalAttempts: number;
  totalDelay: number;
  lastError?: any;
}

/**
 * Executes an operation with retry logic and returns both result and metrics
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions,
  onRetry?: (attempt: number, error: any, delay: number) => void,
): Promise<{ result: T; metrics: RetryMetrics }> {
  const metrics: RetryMetrics = {
    totalAttempts: 0,
    totalDelay: 0,
  };

  let lastError: any;

  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    metrics.totalAttempts++;

    try {
      const result = await operation();
      return { result, metrics };
    } catch (error) {
      lastError = error;
      metrics.lastError = error;

      if (
        attempt === options.maxRetries ||
        !isRetryableError(error, options.retryableStatusCodes)
      ) {
        throw error;
      }

      const delay = calculateBackoffDelay(
        attempt,
        options.baseDelay,
        options.maxDelay,
        options.backoffMultiplier,
        options.enableJitter,
      );

      metrics.totalDelay += delay;

      if (onRetry) {
        onRetry(attempt + 1, error, delay);
      }

      await sleep(delay);
    }
  }

  throw lastError;
}
