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
 * payload. Raw bytes and strings pass through unchanged — re-encoding is only for bodies the
 * framework already parsed into an object, and it must match the request's declared content type:
 * the proxy forwards that header verbatim, so serializing a parsed form body as JSON would send
 * JSON bytes labeled `application/x-www-form-urlencoded` to the upstream.
 *
 * @private
 */
export function serializeParsedBody(
  body: unknown,
  contentType?: HeaderValue,
): ProxyRequestBody {
  if (body === undefined || body === null) {
    return undefined;
  }
  if (
    typeof body === "string" ||
    body instanceof Uint8Array ||
    body instanceof ArrayBuffer
  ) {
    return body;
  }
  const declared = singleHeaderValue(contentType)?.toLowerCase() ?? "";
  if (declared.startsWith("application/x-www-form-urlencoded")) {
    // Entry by entry rather than the URLSearchParams record constructor: parsers represent a
    // repeated field (`tag=a&tag=b`) as an array, and the record form would stringify it into one
    // comma-joined value, changing the request's semantics upstream.
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(
      body as Record<string, unknown>,
    )) {
      if (Array.isArray(value)) {
        for (const entry of value) {
          params.append(key, String(entry));
        }
      } else if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    }
    return params.toString();
  }
  return JSON.stringify(body);
}

/**
 * Read the raw bytes of a request stream the framework's body parser did not consume.
 *
 * `express.json()` and Next's pages-router parser only handle the content types they are
 * configured for; a multipart or binary request leaves `request.body` unset and the stream
 * unread. Forwarding "no body" while preserving the multipart content type and boundary would
 * hand the upstream an unparseable request, so the adapter falls back to the raw stream.
 *
 * @private
 */
export async function readUnconsumedRequestBody(
  stream: AsyncIterable<unknown>,
): Promise<ProxyRequestBody> {
  const chunks: Uint8Array[] = [];
  let total = 0;
  for await (const chunk of stream) {
    const bytes =
      typeof chunk === "string"
        ? new TextEncoder().encode(chunk)
        : (chunk as Uint8Array);
    chunks.push(bytes);
    total += bytes.byteLength;
  }
  if (total === 0) {
    return undefined;
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}
