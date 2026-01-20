/**
 * Minimum allowed request timeout in seconds.
 * Matches the Python client's MIN_REQUEST_TIMEOUT_SECONDS.
 */
export const MIN_REQUEST_TIMEOUT_SECONDS = 1;

/**
 * Header name for server-side request timeout.
 */
export const REQUEST_TIMEOUT_HEADER = "x-fal-request-timeout";

/**
 * Header name for timeout type (user vs infrastructure).
 */
export const REQUEST_TIMEOUT_TYPE_HEADER = "x-fal-request-timeout-type";

/**
 * Header name for queue priority.
 */
export const QUEUE_PRIORITY_HEADER = "x-fal-queue-priority";

/**
 * Header name for runner hint.
 */
export const RUNNER_HINT_HEADER = "x-fal-runner-hint";

/**
 * Validates the timeout and returns the header value as a string.
 * Throws an error if the timeout is invalid.
 *
 * @param timeout - The timeout value in seconds (must be > MIN_REQUEST_TIMEOUT_SECONDS)
 * @returns The timeout as a string suitable for the header value
 * @throws Error if timeout is not a valid number or is <= MIN_REQUEST_TIMEOUT_SECONDS
 */
export function validateTimeoutHeader(timeout: number): string {
  if (typeof timeout !== "number" || isNaN(timeout)) {
    throw new Error(`Timeout must be a number, got ${timeout}`);
  }

  if (timeout <= MIN_REQUEST_TIMEOUT_SECONDS) {
    throw new Error(
      `Timeout must be greater than ${MIN_REQUEST_TIMEOUT_SECONDS} seconds`,
    );
  }

  return timeout.toString();
}

/**
 * Creates headers object with the timeout header if timeout is provided.
 * Returns an empty object if timeout is undefined.
 *
 * @param timeout - Optional timeout value in seconds
 * @returns Headers object with REQUEST_TIMEOUT_HEADER if timeout is provided
 */
export function buildTimeoutHeaders(
  timeout?: number,
): Record<string, string> | {} {
  if (timeout === undefined) {
    return {};
  }

  return {
    [REQUEST_TIMEOUT_HEADER]: validateTimeoutHeader(timeout),
  };
}
