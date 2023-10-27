import type { NextApiHandler } from 'next/types';
import { type NextRequest, NextResponse } from 'next/server';
import { DEFAULT_PROXY_ROUTE, handleRequest } from './index';

/**
 * The default Next API route for the fal.ai client proxy.
 */
export const PROXY_ROUTE = DEFAULT_PROXY_ROUTE;

/**
 * The Next API route handler for the fal.ai client proxy.
 * Use it with the /pages router in Next.js.
 *
 * @param request the Next API request object.
 * @param response the Next API response object.
 * @returns a promise that resolves when the request is handled.
 */
export const handler: NextApiHandler = async (request, response) => {
  return handleRequest({
    id: 'nextjs',
    method: request.method,
    respondWith: (status, data) =>
      typeof data === 'string'
        ? response.status(status).json({ detail: data })
        : response.status(status).json(data),
    getHeaders: () => request.headers,
    getHeader: (name) => request.headers[name],
    sendHeader: (name, value) => response.setHeader(name, value),
    getBody: () => JSON.stringify(request.body),
  });
};

function fromHeaders(headers: Headers): Record<string, string | string[]> {
  // TODO once Header.entries() is available, use that instead
  // Object.fromEntries(headers.entries());
  const result: Record<string, string | string[]> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/**
 *
 * @param request
 * @returns
 */
async function routeHandler(request: NextRequest) {
  const responseHeaders = {};
  return handleRequest({
    id: 'nextjs-router',
    method: request.method,
    respondWith: (status, data) =>
      NextResponse.json(typeof data === 'string' ? { detail: data } : data, {
        status,
        headers: responseHeaders,
      }),
    getHeaders: () => fromHeaders(request.headers),
    getHeader: (name) => request.headers.get(name),
    sendHeader: (name, value) => (responseHeaders[name] = value),
    getBody: () => JSON.stringify(request.body),
  });
}

export const route = {
  handler: routeHandler,
  GET: routeHandler,
  POST: routeHandler,
  PUT: routeHandler,
  DELETE: routeHandler,
  OPTION: routeHandler,
};
