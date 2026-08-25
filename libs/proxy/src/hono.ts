import { Context } from "hono";
import { type StatusCode } from "hono/utils/http-status";
import { ProxyConfig, resolveProxyConfig } from "./config";
import {
  fromHeaders,
  handleRequest,
  HeaderValue,
  resolveApiKeyFromEnv,
  responsePassthrough,
} from "./index";
import {
  assertUtf8ParsedBody,
  DEFAULT_MAX_REQUEST_BODY_BYTES,
  isJsonContentType,
  readWebRequestBody,
  RequestBodyTooLargeError,
} from "./utils";

/**
 * @deprecated Use `Partial<ProxyConfig>` instead.
 */
export type FalHonoProxyOptions = Partial<ProxyConfig> & {
  /**
   * A function to resolve the API key used by the proxy.
   * By default, it uses the `FAL_KEY` environment variable.
   *
   * @deprecated Use `resolveFalAuth` in `ProxyConfig` instead.
   */
  resolveApiKey?: () => Promise<string | undefined>;
};

type RouteHandler = (context: Context) => Promise<Response>;

/**
 * Creates a route handler that proxies requests to the fal API.
 *
 * This is a drop-in handler for Hono applications so that the client can be called
 * directly from the client-side code while keeping API keys safe.
 *
 * @param config the proxy configuration options.
 * @returns a Hono route handler function.
 */
export function createRouteHandler({
  resolveApiKey = resolveApiKeyFromEnv,
  ...config
}: FalHonoProxyOptions = {}): RouteHandler {
  const resolvedConfig = resolveProxyConfig(config);
  const maxRequestBodyBytes =
    resolvedConfig.maxRequestBodyBytes ?? DEFAULT_MAX_REQUEST_BODY_BYTES;
  const routeHandler: RouteHandler = async (context) => {
    const responseHeaders: Record<string, HeaderValue> = {};
    const response = await handleRequest(
      {
        id: "hono",
        method: context.req.method,
        respondWith: (status, data) => {
          return context.json(data, status as StatusCode, responseHeaders);
        },
        // The INCOMING request's headers — `responseHeaders` is the outgoing accumulator that
        // `sendHeader` fills, and enumerating it here would make the proxy forward nothing.
        getHeaders: () => fromHeaders(context.req.raw.headers),
        getHeader: (name) => context.req.header(name),
        sendHeader: (name, value) => (responseHeaders[name] = value),
        getRequestBody: async () => {
          const rawRequest = context.req.raw;
          const bodyCacheKeys = Object.keys(context.req.bodyCache);
          const firstBodyCacheKey = bodyCacheKeys[0];
          const contentType = context.req.header("content-type") ?? "";
          const mediaType = contentType.split(";", 1)[0].trim().toLowerCase();
          const hasByteFaithfulCache =
            firstBodyCacheKey === "arrayBuffer" || firstBodyCacheKey === "blob";

          // parseBody() can cache `{}` for media types it ignores without touching the stream.
          // Prefer the original stream whenever it is still available, regardless of cache keys.
          if (!rawRequest.bodyUsed && !rawRequest.body?.locked) {
            return readWebRequestBody(rawRequest, maxRequestBodyBytes);
          }

          // Hono derives every later representation from the FIRST cached one. A later
          // arrayBuffer/blob key therefore does not establish byte fidelity if text(), json(),
          // or formData() consumed the stream first. Only a byte representation that was itself
          // first in the cache can contain the original request bytes.
          if (hasByteFaithfulCache) {
            return readWebRequestBody(
              {
                arrayBuffer: () => context.req.arrayBuffer(),
                headers: rawRequest.headers,
              },
              maxRequestBodyBytes,
            );
          }

          if (mediaType.startsWith("multipart/") && bodyCacheKeys.length > 0) {
            // Hono recreates arrayBuffer() from the first cached representation. Recreating it
            // from FormData chooses a NEW multipart boundary while this proxy forwards the old
            // content-type header, so the upstream cannot parse it.
            throw new Error(
              "The fal proxy cannot forward a multipart body that Hono middleware already " +
                "consumed without caching its original bytes. Cache c.req.arrayBuffer() or " +
                "c.req.blob() before any decoded representation, or exclude the proxy route " +
                "from that middleware.",
            );
          }

          if (
            mediaType === "application/x-www-form-urlencoded" &&
            "formData" in context.req.bodyCache
          ) {
            assertUtf8ParsedBody(contentType);
            const formData = await context.req.bodyCache.formData;
            const params = new URLSearchParams();
            formData.forEach((value, key) => {
              if (typeof value !== "string") {
                throw new Error(
                  "The fal proxy cannot encode a file as application/x-www-form-urlencoded.",
                );
              }
              params.append(key, value);
            });
            const body = params.toString();
            if (
              new TextEncoder().encode(body).byteLength > maxRequestBodyBytes
            ) {
              throw new RequestBodyTooLargeError(maxRequestBodyBytes);
            }
            return body;
          }

          const hasJsonCache = "json" in context.req.bodyCache;
          const hasTextCache = "text" in context.req.bodyCache;
          if (
            bodyCacheKeys.length > 0 &&
            ((hasJsonCache && isJsonContentType(contentType)) ||
              (hasTextCache &&
                (mediaType.startsWith("text/") ||
                  isJsonContentType(contentType))))
          ) {
            assertUtf8ParsedBody(contentType);
            return readWebRequestBody(
              {
                arrayBuffer: () => context.req.arrayBuffer(),
                headers: rawRequest.headers,
              },
              maxRequestBodyBytes,
            );
          }

          if (bodyCacheKeys.length === 0) {
            throw new Error(
              "The request body was consumed before the fal proxy ran without a reusable Hono " +
                "body cache. Exclude body-consuming middleware from the proxy route.",
            );
          }
          throw new Error(
            `The fal proxy cannot faithfully reconstruct a cached ${mediaType || "untyped"} ` +
              "Hono request body. Cache c.req.arrayBuffer() or c.req.blob() before any decoded " +
              "representation, or exclude the proxy route from body-parsing middleware.",
          );
        },
        sendResponse: responsePassthrough,
        resolveApiKey,
      },
      resolvedConfig,
    );
    return response;
  };

  return routeHandler;
}
