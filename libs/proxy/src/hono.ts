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
import { assertUtf8ParsedBody, readWebRequestBody } from "./utils";

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
          const bodyCacheKeys = Object.keys(context.req.bodyCache);
          const contentType = context.req.header("content-type") ?? "";
          const hasByteFaithfulCache =
            "arrayBuffer" in context.req.bodyCache ||
            "blob" in context.req.bodyCache;
          if (
            contentType.toLowerCase().startsWith("multipart/") &&
            bodyCacheKeys.length > 0 &&
            !hasByteFaithfulCache
          ) {
            // Hono recreates arrayBuffer() from the first cached representation. Recreating it
            // from FormData chooses a NEW multipart boundary while this proxy forwards the old
            // content-type header, so the upstream cannot parse it.
            throw new Error(
              "The fal proxy cannot forward a multipart body that Hono middleware already " +
                "consumed without caching its original bytes. Cache c.req.arrayBuffer() or " +
                "c.req.blob(), or exclude the proxy route from that middleware.",
            );
          }
          if (bodyCacheKeys.length > 0 && !hasByteFaithfulCache) {
            // Hono rebuilds bytes from cached text/JSON as UTF-8. That is faithful only when the
            // incoming parsed representation was UTF-8 too; otherwise preserving the old charset
            // header would make the upstream decode different content.
            assertUtf8ParsedBody(contentType);
          }
          if (context.req.raw.bodyUsed && bodyCacheKeys.length === 0) {
            throw new Error(
              "The request body was consumed before the fal proxy ran without a reusable Hono " +
                "body cache. Exclude body-consuming middleware from the proxy route.",
            );
          }

          // An untouched raw request can be streamed and capped before the full allocation.
          // If middleware used Hono's cache, its cache-aware accessor is the only replayable copy.
          const request =
            bodyCacheKeys.length === 0
              ? context.req.raw
              : {
                  arrayBuffer: () => context.req.arrayBuffer(),
                  headers: context.req.raw.headers,
                };
          return readWebRequestBody(
            request,
            resolvedConfig.maxRequestBodyBytes,
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
