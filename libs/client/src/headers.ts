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
export function buildTimeoutHeaders(timeout?: number): Record<string, string> {
  if (timeout === undefined) {
    return {};
  }

  return {
    [REQUEST_TIMEOUT_HEADER]: validateTimeoutHeader(timeout),
  };
}

/**
 * Header name for request tags.
 */
export const TAGS_HEADER = "x-fal-tags";

/**
 * Maximum number of tag pairs allowed in a single request.
 */
export const MAX_TAG_PAIRS = 10;

/**
 * Maximum length of a tag key, in characters.
 */
export const MAX_TAG_KEY_LENGTH = 64;

/**
 * Maximum length of a tag value, in characters.
 */
export const MAX_TAG_VALUE_LENGTH = 256;

/**
 * Maximum size of all key and value bytes combined, in bytes.
 */
export const MAX_TAGS_SIZE_BYTES = 1024;

/**
 * Tag keys are lowercased and restricted to `[a-z0-9._-]`.
 */
const TAG_KEY_PATTERN = /^[a-z0-9._-]+$/;

/**
 * Tag values are printable ASCII, excluding `,` (the pair separator).
 */
const TAG_VALUE_PATTERN = /^[\x20-\x2b\x2d-\x7e]*$/;

/**
 * Keys under this prefix are reserved for fal and cannot be set by callers.
 */
const RESERVED_TAG_KEY_PREFIX = "fal.";

/**
 * Validates the tags and serializes them into the packed `X-Fal-Tags` header
 * value, i.e. a comma-separated list of `key=value` pairs.
 *
 * Keys and values are trimmed and keys lowercased, matching what the server
 * stores; limits apply to that normalized form. Duplicate keys are last-wins.
 *
 * Throws an error if the tags don't match the limits enforced by the server.
 *
 * @param tags - The tag key/value pairs
 * @returns The packed header value
 * @throws Error if any pair is invalid or the limits are exceeded
 */
export function validateTagsHeader(tags: Record<string, string>): string {
  const entries = Object.entries(tags);
  if (entries.length > MAX_TAG_PAIRS) {
    throw new Error(
      `Tags must contain at most ${MAX_TAG_PAIRS} pairs, got ${entries.length}`,
    );
  }

  const pairs = new Map<string, string>();
  // Keys and values are ASCII-only once validated, so length is the byte size.
  let size = 0;
  for (const [rawKey, rawValue] of entries) {
    const key = rawKey.trim().toLowerCase();
    const value = typeof rawValue === "string" ? rawValue.trim() : rawValue;
    if (!TAG_KEY_PATTERN.test(key)) {
      throw new Error(
        `Tag key "${rawKey}" must match ${TAG_KEY_PATTERN} once lowercased`,
      );
    }
    if (key.length > MAX_TAG_KEY_LENGTH) {
      throw new Error(
        `Tag key "${rawKey}" must be at most ${MAX_TAG_KEY_LENGTH} characters`,
      );
    }
    if (key.startsWith(RESERVED_TAG_KEY_PREFIX)) {
      throw new Error(
        `Tag key "${rawKey}" uses the reserved "${RESERVED_TAG_KEY_PREFIX}" prefix`,
      );
    }
    if (typeof value !== "string" || !TAG_VALUE_PATTERN.test(value)) {
      throw new Error(
        `Tag value for "${rawKey}" must be printable ASCII without commas`,
      );
    }
    if (value.length > MAX_TAG_VALUE_LENGTH) {
      throw new Error(
        `Tag value for "${rawKey}" must be at most ${MAX_TAG_VALUE_LENGTH} characters`,
      );
    }
    size += key.length + value.length;
    pairs.set(key, value);
  }

  if (size > MAX_TAGS_SIZE_BYTES) {
    throw new Error(
      `Tags must be at most ${MAX_TAGS_SIZE_BYTES} bytes, got ${size}`,
    );
  }

  return Array.from(pairs, ([key, value]) => `${key}=${value}`).join(",");
}

/**
 * Creates headers object with the packed tags header if tags are provided.
 * Returns an empty object if tags are undefined or empty.
 *
 * @param tags - Optional tag key/value pairs
 * @returns Headers object with TAGS_HEADER if tags are provided
 */
export function buildTagsHeaders(
  tags?: Record<string, string>,
): Record<string, string> {
  if (tags === undefined || Object.keys(tags).length === 0) {
    return {};
  }

  return {
    [TAGS_HEADER]: validateTagsHeader(tags),
  };
}
