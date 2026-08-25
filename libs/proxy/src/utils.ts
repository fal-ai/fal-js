import { HeaderValue } from "./types";

/**
 * Utility to get a header value as `string` from a Headers object.
 *
 * @private
 * @param request the header value.
 * @returns the header value as `string` or `undefined` if the header is not set.
 */
export function singleHeaderValue(value: HeaderValue): string | undefined {
  if (!value) {
    return undefined;
  }
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}
