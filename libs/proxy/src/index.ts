export const TARGET_URL_HEADER = 'x-fal-target-url';

export const DEFAULT_PROXY_ROUTE = '/api/_fal/proxy';

const FAL_KEY = process.env.FAL_KEY || process.env.NEXT_PUBLIC_FAL_KEY;
const FAL_KEY_ID = process.env.FAL_KEY_ID || process.env.NEXT_PUBLIC_FAL_KEY_ID;
const FAL_KEY_SECRET =
  process.env.FAL_KEY_SECRET || process.env.NEXT_PUBLIC_FAL_KEY_SECRET;

export interface ProxyBehavior {
  id: string;
  method: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  respondWith(status: number, data: string | any): void;
  getHeaders(): Record<string, string | string[] | undefined>;
  getHeader(name: string): string | string[] | undefined;
  removeHeader(name: string): void;
  sendHeader(name: string, value: string): void;
  getBody(): string | undefined;
}

/**
 * Utility to get a header value as `string` from a Headers object.
 *
 * @private
 * @param request the header value.
 * @returns the header value as `string` or `undefined` if the header is not set.
 */
function singleHeaderValue(
  value: string | string[] | undefined
): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

/**
 * Clean up headers that should not be forwarded to the proxy.
 * @param behavior The proxy implementation.
 */
function cleanUpHeaders(behavior: ProxyBehavior) {
  behavior.removeHeader('origin');
  behavior.removeHeader('referer');
  behavior.removeHeader(TARGET_URL_HEADER);
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
export const handleRequest = async (behavior: ProxyBehavior) => {
  const targetUrl = singleHeaderValue(behavior.getHeader(TARGET_URL_HEADER));
  if (!targetUrl) {
    behavior.respondWith(400, `Missing the ${TARGET_URL_HEADER} header`);
    return;
  }
  if (targetUrl.indexOf('fal.ai') === -1) {
    behavior.respondWith(412, `Invalid ${TARGET_URL_HEADER} header`);
    return;
  }

  cleanUpHeaders(behavior);

  const falKey = getFalKey();
  if (!falKey) {
    behavior.respondWith(401, 'Missing fal.ai credentials');
    return;
  }

  // pass over headers prefixed with x-fal-*
  const headers: Record<string, string | string[] | undefined> = {};
  Object.keys(behavior.getHeaders()).forEach((key) => {
    if (key.toLowerCase().startsWith('x-fal-')) {
      headers[key.toLowerCase()] = behavior.getHeader(key);
    }
  });

  const res = await fetch(targetUrl, {
    method: behavior.method,
    headers: {
      ...headers,
      authorization:
        singleHeaderValue(behavior.getHeader('authorization')) ??
        `Key ${falKey}`,
      accept: 'application/json',
      'content-type': 'application/json',
      'x-fal-client-proxy': `@fal-ai/serverless-proxy/${behavior.id}`,
    },
    body:
      behavior.method?.toUpperCase() === 'GET' ? undefined : behavior.getBody(),
  });

  // copy headers from res to response
  res.headers.forEach((value, key) => {
    behavior.sendHeader(key, value);
  });

  if (res.headers.get('content-type') === 'application/json') {
    const data = await res.json();
    behavior.respondWith(res.status, data);
    return;
  }
  const data = await res.text();
  behavior.respondWith(res.status, data);
};
