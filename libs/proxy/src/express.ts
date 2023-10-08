import type { RequestHandler } from 'express';
import { DEFAULT_PROXY_ROUTE, handleRequest } from './index';

export const route = DEFAULT_PROXY_ROUTE;

export const handler: RequestHandler = async (request, response, next) => {
  handleRequest(request, response);
  next();
};
