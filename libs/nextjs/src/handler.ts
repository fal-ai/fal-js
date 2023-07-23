import { createProxyMiddleware } from 'http-proxy-middleware';
import type { NextApiHandler, NextApiRequest, PageConfig } from 'next';
import { TARGET_URL_HEADER } from './config';

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
function getHeader(request: NextApiRequest, key: string): string | undefined {
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
function cleanUpHeaders(request: NextApiRequest) {
  delete request.headers['origin'];
  delete request.headers['referer'];
  // delete request.headers['transfer-encoding'];
  delete request.headers[TARGET_URL_HEADER];
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
export const handler: NextApiHandler = async (request, response) => {
  const targetUrl = getHeader(request, TARGET_URL_HEADER);
  if (!targetUrl) {
    response.status(400).send(`Missing the ${TARGET_URL_HEADER} header`);
    return;
  }
  cleanUpHeaders(request);

  const authHeader =
    FAL_KEY_ID && FAL_KEY_SECRET
      ? { authorization: `Basic ${FAL_KEY_ID}:${FAL_KEY_SECRET}` }
      : {};
  const proxyHandler = createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/api/_fal/proxy': '',
    },
    headers: {
      ...authHeader,
      'x-fal-client-proxy': '@fal-ai/serverless-nextjs',
    },
  });
  return new Promise((resolve, reject) => {
    // According to the Next.js recipe https://github.com/chimurai/http-proxy-middleware/blob/master/recipes/servers.md#nextjs
    // the proxy middleware should be called with the `req` and `res` objects from Next.js
    // However the types are not compatible, so we need to cast them to `any`

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    proxyHandler(request as any, response as any, (result: unknown) => {
      if (result instanceof Error) {
        reject(result);
      }
      resolve(result);
    });
  });
};

export const config: PageConfig = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
