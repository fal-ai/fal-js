import { NextResponse, type NextRequest } from "next/server";
import type { NextApiHandler } from "next/types";
import { ProxyConfig, resolveProxyConfig } from "./config";
import {
  DEFAULT_PROXY_ROUTE,
  fromHeaders,
  handleRequest,
  responsePassthrough,
} from "./index";

/**
 * The default Next API route for the fal.ai client proxy.
 */
export const PROXY_ROUTE = DEFAULT_PROXY_ROUTE;

/**
 * Creates a page router handler that proxies requests to the fal API.
 *
 * This is a drop-in handler for Next.js applications so that the client can be called
 * directly from the client-side code while keeping API keys safe.
 *
 * @param config the proxy options.
 * @returns a Next.js page router handler function.
 */
export const createPageRouterHandler = (config: Partial<ProxyConfig> = {}) => {
  const resolvedConfig = resolveProxyConfig(config);
  const handler: NextApiHandler = async (request, response) => {
    return handleRequest(
      {
        id: "nextjs-page-router",
        method: request.method || "POST",
        getRequestBody: async () => JSON.stringify(request.body),
        getHeaders: () => request.headers,
        getHeader: (name) => request.headers[name],
        sendHeader: (name, value) => response.setHeader(name, value),
        respondWith: (status, data) => response.status(status).json(data),
        sendResponse: async (res) => {
          if (res.headers.get("content-type")?.includes("application/json")) {
            return response.status(res.status).json(await res.json());
          }
          return response.status(res.status).send(await res.text());
        },
      },
      resolvedConfig,
    );
  };
  return handler;
};

/**
 * The Next API route handler for the fal.ai client proxy.
 * Use it with the /pages router in Next.js.
 *
 * Note: the page routers proxy doesn't support streaming responses.
 *
 * @param request the Next API request object.
 * @param response the Next API response object.
 * @returns a promise that resolves when the request is handled.
 *
 * @deprecated Use `createPageRouterHandler` instead.
 */
export const handler: NextApiHandler = createPageRouterHandler();

/**
 * Creates a route handler that proxies requests to the fal API.
 *
 * This is a drop-in handler for Next.js applications so that the client can be called
 * directly from the client-side code while keeping API keys safe.
 *
 * Note: you should protect this route with your application's authentication mechanism
 * otherwise your proxy might be vulnerable to unauthorized access.
 *
 * @param config the proxy options.
 * @returns a Next.js route handler function.
 */
export const createRouteHandler = (config: Partial<ProxyConfig> = {}) => {
  const resolvedConfig = resolveProxyConfig(config);
  return async (request: NextRequest) => {
    const responseHeaders = new Headers();
    return await handleRequest(
      {
        id: "nextjs-app-router",
        method: request.method,
        getRequestBody: async () => request.text(),
        getHeaders: () => fromHeaders(request.headers),
        getHeader: (name) => request.headers.get(name),
        sendHeader: (name, value) => responseHeaders.set(name, value),
        respondWith: (status, data) =>
          NextResponse.json(data, {
            status,
            headers: responseHeaders,
          }),
        sendResponse: responsePassthrough,
      },
      resolvedConfig,
    );
  };
};

/**
 * The Next API route handler for the fal.ai client proxy on App Router apps.
 *
 * @param request the Next API request object.
 * @returns a promise that resolves when the request is handled.
 */
const routeHandler = createRouteHandler();

/**
 * @deprecated Use `createRouteHandler` instead.
 */
export const route = {
  handler: routeHandler,
  GET: routeHandler,
  POST: routeHandler,
  PUT: routeHandler,
};
