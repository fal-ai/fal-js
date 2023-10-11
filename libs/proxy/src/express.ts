import type { RequestHandler } from 'express';
import { DEFAULT_PROXY_ROUTE, handleRequest } from './index';

/**
 * The default Express route for the fal.ai client proxy.
 */
export const route = DEFAULT_PROXY_ROUTE;

/**
 * The Express route handler for the fal.ai client proxy.
 *
 * @param request The Express request object.
 * @param response The Express response object.
 * @param next The Express next function.
 */
export const handler: RequestHandler = async (request, response, next) => {
  await handleRequest({
    id: 'express',
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
  next();
};
