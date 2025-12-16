import { Context } from "hono";
import { type ContentfulStatusCode } from "hono/utils/http-status";
import {
  handleRequest,
  HeaderValue,
  resolveApiKeyFromEnv,
  responsePassthrough,
} from "./index";

export type FalHonoProxyOptions = {
  /**
   * A function to resolve the API key used by the proxy.
   * By default, it uses the `FAL_KEY` environment variable.
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
 * @param param the proxy options.
 * @returns a Hono route handler function.
 */
export function createRouteHandler({
  resolveApiKey = resolveApiKeyFromEnv,
}: FalHonoProxyOptions): RouteHandler {
  const routeHandler: RouteHandler = async (context) => {
    const responseHeaders: Record<string, HeaderValue> = {};
    const response = await handleRequest({
      id: "hono",
      method: context.req.method,
      respondWith: (status, data) => {
        return context.json(
          data,
          status as ContentfulStatusCode,
          responseHeaders,
        );
      },
      getHeaders: () => responseHeaders,
      getHeader: (name) => context.req.header(name),
      sendHeader: (name, value) => (responseHeaders[name] = value),
      getRequestBody: async () => JSON.stringify(await context.req.json()),
      sendResponse: responsePassthrough,
      resolveApiKey,
    });
    return response;
  };

  return routeHandler;
}
