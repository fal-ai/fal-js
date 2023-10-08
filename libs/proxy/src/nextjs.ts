import type { NextApiHandler } from 'next/types';
import { DEFAULT_PROXY_ROUTE, handleRequest } from './index';

export const PROXY_ROUTE = DEFAULT_PROXY_ROUTE;

/**
 *
 * @param request
 * @param response
 * @returns
 */
export const handler: NextApiHandler = async (request, response) => {
  // TODO: right now we know the handleRequest function is relies on
  // properties that are common to both NextApiRequest and Request
  // but we should make sure that is the case by creating our own
  // interface as a contract for the minimal request/response properties
  // that handleRequest needs.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return handleRequest(request as any, response as any);
};
