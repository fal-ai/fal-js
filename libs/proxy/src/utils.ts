import { HeaderValue, ProxyRequestBody } from "./types";

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

/**
 * Read a Fetch-API request's payload as raw bytes.
 *
 * Bytes rather than `text()`: a multipart body (a `FormData` upload) is binary, and decoding it
 * through UTF-8 corrupts its file parts before they reach fal.
 *
 * @private
 */
export async function readWebRequestBody(request: {
  arrayBuffer(): Promise<ArrayBuffer>;
}): Promise<ProxyRequestBody> {
  const body = await request.arrayBuffer();
  return body.byteLength > 0 ? body : undefined;
}

/**
 * Turn a framework-parsed request body (Express, Next.js pages router) back into a forwardable
 * payload. Raw bytes and strings pass through unchanged — re-stringifying is only for bodies the
 * framework already parsed into an object.
 *
 * @private
 */
export function serializeParsedBody(body: unknown): ProxyRequestBody {
  if (body === undefined || body === null) {
    return undefined;
  }
  if (typeof body === "string" || body instanceof Uint8Array) {
    return body;
  }
  return JSON.stringify(body);
}
