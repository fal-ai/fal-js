import { NextResponse, type NextRequest } from "next/server";
import type { NextApiHandler } from "next/types";
import { ProxyConfig, resolveProxyConfig } from "./config";
import {
  DEFAULT_PROXY_ROUTE,
  fromHeaders,
  handleRequest,
  responsePassthrough,
} from "./index";
import {
  readUnconsumedRequestBody,
  readWebRequestBody,
  serializeParsedBody,
} from "./utils";

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
        getRequestBody: async () => {
          // Next's DEFAULT bodyParser drains every request and stringifies unknown content types
          // through UTF-8 — so a multipart or binary body reaching this adapter as a string is
          // already corrupted (invalid sequences replaced), and the original bytes are gone.
          // Forwarding it under an intact multipart boundary would hand the upstream garbage that
          // parses as a valid request; failing loudly is the only honest option.
          const contentType = (
            request.headers["content-type"] ?? ""
          ).toLowerCase();
          const losslesslyParsed =
            contentType.startsWith("application/json") ||
            // Structured-suffix JSON types (application/ld+json, …) are UTF-8 text; decoding
            // them as a string loses nothing.
            /^application\/[^;\s]*\+json/.test(contentType) ||
            contentType.startsWith("application/x-www-form-urlencoded") ||
            contentType.startsWith("text/");
          // No content type is NOT an exemption: Next text-decodes those bodies too, and binary
          // bytes posted without a label would be forwarded corrupted (and then labeled JSON by
          // the string default). Only a genuinely empty body is safe to pass.
          if (
            typeof request.body === "string" &&
            request.body !== "" &&
            !losslesslyParsed
          ) {
            throw new Error(
              `The fal proxy cannot forward a ${contentType || "untyped"} body that Next's default bodyParser ` +
                "already decoded as text — the bytes are irreversibly corrupted. Disable body " +
                "parsing for this route (export const config = { api: { bodyParser: false } }) " +
                "so the proxy can forward the raw request stream.",
            );
          }
          const parsed = serializeParsedBody(
            request.body,
            request.headers["content-type"],
          );
          // With bodyParser disabled the body is unset and the stream unread — forward raw bytes.
          return parsed !== undefined
            ? parsed
            : readUnconsumedRequestBody(request);
        },
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

// Lazy initialization for deprecated handler
let _pageRouterHandler: NextApiHandler | null = null;

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
export const handler: NextApiHandler = (request, response) => {
  if (!_pageRouterHandler) {
    _pageRouterHandler = createPageRouterHandler();
  }
  return _pageRouterHandler(request, response);
};

type RouteHandler = (request: NextRequest) => Promise<Response>;

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
  const handler = async (request: NextRequest) => {
    const responseHeaders = new Headers();
    return await handleRequest(
      {
        id: "nextjs-app-router",
        method: request.method,
        getRequestBody: async () => readWebRequestBody(request),
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
  return {
    GET: handler,
    POST: handler,
    PUT: handler,
    // The full RequestInit method surface: context.fetch() forwards whatever method the extension
    // names, and a documented adapter answering 405 for PATCH/DELETE would make the proxy path
    // behave differently from a direct fetch.
    PATCH: handler,
    DELETE: handler,
    HEAD: handler,
    OPTIONS: handler,
  };
};

// Lazy initialization for deprecated route
let _routeHandler: {
  GET: RouteHandler;
  POST: RouteHandler;
  PUT: RouteHandler;
  PATCH: RouteHandler;
  DELETE: RouteHandler;
  HEAD: RouteHandler;
  OPTIONS: RouteHandler;
} | null = null;

function getRouteHandler() {
  if (!_routeHandler) {
    _routeHandler = createRouteHandler();
  }
  return _routeHandler;
}

/**
 * @deprecated Use `createRouteHandler` instead.
 */
export const route = {
  get GET() {
    return getRouteHandler().GET;
  },
  get POST() {
    return getRouteHandler().POST;
  },
  get PUT() {
    return getRouteHandler().PUT;
  },
  // The same full method surface as createRouteHandler(): a proxied context.fetch() may use any
  // RequestInit method, and the deprecated export must not answer 405 where the new one forwards.
  get PATCH() {
    return getRouteHandler().PATCH;
  },
  get DELETE() {
    return getRouteHandler().DELETE;
  },
  get HEAD() {
    return getRouteHandler().HEAD;
  },
  get OPTIONS() {
    return getRouteHandler().OPTIONS;
  },
};
