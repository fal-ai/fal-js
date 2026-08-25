import type { RequestHandler } from "express";
import { ProxyConfig, resolveProxyConfig } from "./config";
import { DEFAULT_PROXY_ROUTE, handleRequest } from "./index";
import { readUnconsumedRequestBody, serializeParsedBody } from "./utils";

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
  const resolvedConfig = resolveProxyConfig(config);
  return async (request, response, next) => {
    // Express 4 does not route a rejected async handler to error middleware; without this
    // try/catch a deliberate proxy throw (a parser-consumed multipart body, say) becomes an
    // unhandled rejection with the request left open.
    try {
      await handleRequest(
        {
          id: "express",
          method: request.method,
          getRequestBody: async () => {
            // The STREAM decides which side to trust, not req.body: body-parser stamps
            // `req.body = {}` on EVERY request before its content-type check, so a defined body
            // does not mean the request was parsed. A still-readable stream means nothing
            // consumed it — forward those raw bytes (the multipart and binary path, even with a
            // global express.json()). Parser output is trusted only once something actually
            // read the stream, which is also what makes serializeParsedBody's multipart error
            // truthful: at that point a multipart parser really did consume the bytes.
            if (request.readable) {
              return readUnconsumedRequestBody(request);
            }
            return serializeParsedBody(
              request.body,
              request.headers["content-type"],
            );
          },
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
        resolvedConfig,
      );
      next();
    } catch (error) {
      next(error);
    }
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
