import { Context } from "hono";
import { type StatusCode } from "hono/utils/http-status";
import { ProxyConfig, resolveProxyConfig } from "./config";
import {
  handleRequest,
  HeaderValue,
  resolveApiKeyFromEnv,
  responsePassthrough,
} from "./index";

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
        getHeaders: () => responseHeaders,
        getHeader: (name) => context.req.header(name),
        sendHeader: (name, value) => (responseHeaders[name] = value),
        getRequestBody: async () => JSON.stringify(await context.req.json()),
        sendResponse: responsePassthrough,
        resolveApiKey,
      },
      resolvedConfig,
    );
    return response;
  };

  return routeHandler;
}
