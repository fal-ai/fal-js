import type { RequestHandler } from "express";
import { ProxyConfig } from "./config";
import { DEFAULT_PROXY_ROUTE, handleRequest } from "./index";

/**
 * The default Express route for the fal.ai client proxy.
 */
export const route = DEFAULT_PROXY_ROUTE;

/**
 * Creates a request handler that proxies requests to the fal API.
 *
 * This is a drop-in handler for Express applications so that the client can be called
 * directly from the client-side code while keeping API keys safe.
 *
 * @param config the proxy configuration options.
 * @returns an Express request handler function.
 */
export const createHandler = (
  config: Partial<ProxyConfig> = {},
): RequestHandler => {
  return async (request, response, next) => {
    await handleRequest(
      {
        id: "express",
        method: request.method,
        getRequestBody: async () => JSON.stringify(request.body),
        getHeaders: () => request.headers,
        getHeader: (name) => request.headers[name],
        sendHeader: (name, value) => response.setHeader(name, value),
        respondWith: (status, data) => response.status(status).json(data),
        sendResponse: async (res) => {
          if (res.body instanceof ReadableStream) {
            const reader = res.body.getReader();
            const stream = async () => {
              const { done, value } = await reader.read();
              if (done) {
                response.end();
                return response;
              }
              response.write(value);
              return await stream();
            };

            return await stream().catch((error) => {
              if (!response.headersSent) {
                response.status(500).send(error.message);
              } else {
                response.end();
              }
            });
          }
          if (res.headers.get("content-type")?.includes("application/json")) {
            return response.status(res.status).json(await res.json());
          }
          return response.status(res.status).send(await res.text());
        },
      },
      config,
    );
    next();
  };
};

/**
 * The Express route handler for the fal.ai client proxy.
 *
 * @param request The Express request object.
 * @param response The Express response object.
 * @param next The Express next function.
 *
 * @deprecated Use `createHandler` instead.
 */
export const handler: RequestHandler = createHandler();
