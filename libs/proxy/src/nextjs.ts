import { NextResponse, type NextRequest } from 'next/server';
import type { NextApiHandler } from 'next/types';
import {
  DEFAULT_PROXY_ROUTE,
  fromHeaders,
  handleRequest,
  responsePassthrough,
} from './index';

/**
 * The default Next API route for the fal.ai client proxy.
 */
export const PROXY_ROUTE = DEFAULT_PROXY_ROUTE;

/**
 * The Next API route handler for the fal.ai client proxy.
 * Use it with the /pages router in Next.js.
 *
 * Note: the page routers proxy doesn't support streaming responses.
 *
 * @param request the Next API request object.
 * @param response the Next API response object.
 * @returns a promise that resolves when the request is handled.
 */
export const handler: NextApiHandler = async (request, response) => {
  return handleRequest({
    id: 'nextjs-page-router',
    method: request.method || 'POST',
    getRequestBody: async () => JSON.stringify(request.body),
    getHeaders: () => request.headers,
    getHeader: (name) => request.headers[name],
    sendHeader: (name, value) => response.setHeader(name, value),
    respondWith: (status, data) => response.status(status).json(data),
    sendResponse: async (res) => {
      if (res.headers.get('content-type')?.includes('application/json')) {
        return response.status(res.status).json(await res.json());
      }
      return response.status(res.status).send(await res.text());
    },
  });
};

/**
 * The Next API route handler for the fal.ai client proxy on App Router apps.
 *
 * @param request the Next API request object.
 * @returns a promise that resolves when the request is handled.
 */
async function routeHandler(request: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const responseHeaders: Record<string, any> = {};

  // check if response if from a streaming request

  return await handleRequest({
    id: 'nextjs-app-router',
    method: request.method,
    getRequestBody: async () => request.text(),
    getHeaders: () => fromHeaders(request.headers),
    getHeader: (name) => request.headers.get(name),
    sendHeader: (name, value) => (responseHeaders[name] = value),
    respondWith: (status, data) =>
      NextResponse.json(data, {
        status,
        headers: responseHeaders,
      }),
    sendResponse: responsePassthrough,
  });
}

export const route = {
  handler: routeHandler,
  GET: routeHandler,
  POST: routeHandler,
  PUT: routeHandler,
};
