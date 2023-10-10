import type { NextApiHandler } from 'next/types';
import { DEFAULT_PROXY_ROUTE, handleRequest } from './index';

/**
 * The default Next API route for the fal.ai client proxy.
 */
export const PROXY_ROUTE = DEFAULT_PROXY_ROUTE;

/**
 * The Next API route handler for the fal.ai client proxy.
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
        ? response.status(status).json({ details: data })
        : response.status(status).json(data),
    getHeaders: () => request.headers,
    getHeader: (name) => request.headers[name],
    sendHeader: (name, value) => response.setHeader(name, value),
    getBody: () => JSON.stringify(request.body),
  });
};
