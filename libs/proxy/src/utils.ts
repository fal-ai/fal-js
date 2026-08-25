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
 * JSON by media type: `application/json` itself plus structured-suffix types
 * (`application/ld+json`, `application/hal+json`, …), which carry JSON payloads under RFC 6839.
 *
 * @private
 */
export function isJsonContentType(contentType: HeaderValue): boolean {
  const declared = singleHeaderValue(contentType)?.toLowerCase() ?? "";
  // Exact media type only, parameters aside: a prefix match would also capture non-document
  // types like application/json-seq (RFC 7464 record-separated sequences), whose payloads must
  // not be treated as a single JSON value.
  const mediaType = declared.split(";", 1)[0].trim();
  return (
    mediaType === "application/json" ||
    /^application\/[^\s/;]+\+json$/.test(mediaType)
  );
}

// Provenance brand for byte bodies. Body-parser middleware inflates compressed requests before
// handing bytes to the route (express.raw's default `inflate: true`), so a parser-produced
// Uint8Array/Buffer no longer matches the request's declared content-encoding — while bytes read
// from the unconsumed stream still do. A WeakSet brand lets handleRequest strip the header for
// the former without widening the public ProxyRequestBody type.
const parserProducedByteBodies = new WeakSet<object>();

/**
 * Whether a byte body came out of a body parser (already inflated) rather than the raw request
 * stream. String bodies are always parser output and never need this check.
 *
 * @private
 */
export function isParserProducedByteBody(body: ProxyRequestBody): boolean {
  return (
    typeof body === "object" &&
    body !== null &&
    parserProducedByteBodies.has(body)
  );
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
  if (body === undefined) {
    return undefined;
  }
  const declared = singleHeaderValue(contentType)?.toLowerCase() ?? "";
  const jsonDeclared = isJsonContentType(declared);
  if (body === null) {
    // Only `undefined` means "the parser had nothing". A parsed JSON body can legitimately BE
    // null, and treating it as absent would fall back to an already-consumed stream and forward
    // no body at all. Outside JSON, null still reads as absent.
    return jsonDeclared ? "null" : undefined;
  }
  if (typeof body === "string") {
    if (jsonDeclared) {
      // A string under a JSON content type has NO decidable provenance here: raw text
      // (express.text on a JSON route) and a parser-produced top-level string value
      // (express.json({ strict: false })) are indistinguishable whether the string parses —
      // `{"a":1}` could be an object's raw text or the string value "{\"a\":1}" — or does not —
      // `not json` could be a malformed raw request (which must stay an upstream error) or a
      // legitimate parsed string value. Forwarding either guess silently rewrites the request,
      // so every case fails loudly. Adapters that KNOW their parser (Next's pages router
      // re-encodes parsed values itself) never reach this branch; Express routes should feed
      // the proxy raw bytes (no parser or express.raw) or strict-parsed objects.
      throw new Error(
        "The fal proxy cannot tell whether this JSON-typed string body is raw request text or " +
          "a parser-produced value — text/lenient JSON parsers make them indistinguishable. " +
          "Exclude the proxy route from text and lenient JSON parsing (use express.raw, no " +
          "parser, or strict JSON objects) so the payload reaches the proxy unambiguously.",
      );
    }
    return body;
  }
  if (body instanceof Uint8Array || body instanceof ArrayBuffer) {
    // Parser output, not stream bytes: express.raw() inflated any compressed request before
    // producing this buffer, so brand it for the content-encoding strip in handleRequest.
    parserProducedByteBodies.add(body);
    return body;
  }
  if (declared.startsWith("multipart/")) {
    // A parsed OBJECT under a multipart content type means a multipart parser (multer,
    // formidable, …) consumed the stream: the original bytes and boundary framing are gone, and
    // JSON-encoding the text fields while forwarding the multipart header would hand the upstream
    // an unparseable request — with any file parts silently dropped. Nothing faithful can be
    // reconstructed, so fail loudly.
    throw new Error(
      "The fal proxy cannot forward a multipart body that a parser (multer, formidable, …) has " +
        "already consumed — the original bytes are gone. Exclude the proxy route from the " +
        "multipart parser so the raw request stream reaches the proxy.",
    );
  }
  if (declared.startsWith("application/x-www-form-urlencoded")) {
    // Entry by entry rather than the URLSearchParams record constructor: parsers represent a
    // repeated field (`tag=a&tag=b`) as an array and a bracketed field (`user[name]=alice`, from
    // extended urlencoded parsing) as a nested object. The record form would stringify those to
    // one comma-joined value or "[object Object]", changing the request's semantics upstream.
    const params = new URLSearchParams();
    const append = (key: string, value: unknown) => {
      if (value === undefined || value === null) {
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((entry, index) => {
          // Structured entries keep their index (`users[0][name]=alice`), or two objects would
          // collapse into one on reparse; scalar arrays stay repeated keys (`tag=a&tag=b`),
          // matching how the parser produced them.
          if (entry !== null && typeof entry === "object") {
            append(`${key}[${index}]`, entry);
          } else {
            append(key, entry);
          }
        });
        return;
      }
      if (typeof value === "object") {
        for (const [nestedKey, nestedValue] of Object.entries(
          value as Record<string, unknown>,
        )) {
          append(`${key}[${nestedKey}]`, nestedValue);
        }
        return;
      }
      params.append(key, String(value));
    };
    for (const [key, value] of Object.entries(
      body as Record<string, unknown>,
    )) {
      append(key, value);
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
