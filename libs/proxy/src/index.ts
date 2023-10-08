import type { Request, Response } from 'express';

export const TARGET_URL_HEADER = 'x-fal-target-url';

export const DEFAULT_PROXY_ROUTE = '/api/_fal/proxy';

const FAL_KEY = process.env.FAL_KEY || process.env.NEXT_PUBLIC_FAL_KEY;
const FAL_KEY_ID = process.env.FAL_KEY_ID || process.env.NEXT_PUBLIC_FAL_KEY_ID;
const FAL_KEY_SECRET =
  process.env.FAL_KEY_SECRET || process.env.NEXT_PUBLIC_FAL_KEY_SECRET;

/**
 * Utility to get a header value as `string` from a Headers object.
 *
 * @private
 * @param request the Next request object.
 * @param key the header key.
 * @returns the header value as `string` or `undefined` if the header is not set.
 */
function getHeader(request: Request, key: string): string | undefined {
  const headerValue = request.headers[key.toLowerCase()];
  if (Array.isArray(headerValue)) {
    return headerValue[0];
  }
  return headerValue;
}

/**
 * Clean up headers that should not be forwarded to the proxy.
 * @param request the Next request object.
 */
function cleanUpHeaders(request: Request) {
  delete request.headers['origin'];
  delete request.headers['referer'];
  delete request.headers[TARGET_URL_HEADER];
}

function getFalKey(): string | undefined {
  if (FAL_KEY) {
    return FAL_KEY;
  }
  if (FAL_KEY_ID && FAL_KEY_SECRET) {
    return `${FAL_KEY_ID}:${FAL_KEY_SECRET}`;
  }
  return undefined;
}

/**
 * A Next request handler that proxies the request to the fal-serverless
 * endpoint. This is useful so client-side calls to the fal-serverless endpoint
 * can be made without CORS issues and the correct credentials can be added
 * effortlessly.
 *
 * @param request the Next request object.
 * @param response the Next response object.
 * @returns Promise<any> the promise that will be resolved once the request is done.
 */
export const handleRequest = async (request: Request, response: Response) => {
  const targetUrl = getHeader(request, TARGET_URL_HEADER);
  if (!targetUrl) {
    response.status(400).send(`Missing the ${TARGET_URL_HEADER} header`);
    return;
  }
  if (targetUrl.indexOf('fal.ai') === -1) {
    response.status(412).send(`Invalid ${TARGET_URL_HEADER} header`);
    return;
  }

  cleanUpHeaders(request);

  const falKey = getFalKey();
  if (!falKey) {
    response.status(401).send('Missing fal.ai credentials');
    return;
  }

  // pass over headers prefixed with x-fal-*
  const headers: Record<string, string | string[] | undefined> = {};
  Object.keys(request.headers).forEach((key) => {
    if (key.toLowerCase().startsWith('x-fal-')) {
      headers[key.toLowerCase()] = request.headers[key];
    }
  });

  const res = await fetch(targetUrl, {
    method: request.method,
    headers: {
      ...headers,
      authorization: getHeader(request, 'authorization') ?? `Key ${falKey}`,
      accept: 'application/json',
      'content-type': 'application/json',
      'x-fal-client-proxy': '@fal-ai/serverless-nextjs',
    },
    body:
      request.method?.toUpperCase() === 'GET'
        ? undefined
        : JSON.stringify(request.body),
  });

  // copy headers from res to response
  res.headers.forEach((value, key) => {
    response.setHeader(key, value);
  });

  if (res.headers.get('content-type') === 'application/json') {
    const data = await res.json();
    response.status(res.status).json(data);
    return;
  }
  const data = await res.text();
  response.status(res.status).send(data);
};
