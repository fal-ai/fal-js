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
 * Determines if an error is retryable based on the status code
 */
export function isRetryableError(
  error: any,
  retryableStatusCodes: number[],
): boolean {
  return (
    error instanceof ApiError && retryableStatusCodes.includes(error.status)
  );
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
