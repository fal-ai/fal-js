export const TARGET_URL_HEADER = 'x-fal-target-url';

export const DEFAULT_PROXY_ROUTE = '/api/fal/proxy';

const FAL_KEY = process.env.FAL_KEY;
const FAL_KEY_ID = process.env.FAL_KEY_ID;
const FAL_KEY_SECRET = process.env.FAL_KEY_SECRET;

export type HeaderValue = string | string[] | undefined | null;

const FAL_URL_REG_EXP = /(\.|^)fal\.(run|ai)$/;

/**
 * The proxy behavior that is passed to the proxy handler. This is a subset of
 * request objects that are used by different frameworks, like Express and NextJS.
 */
export interface ProxyBehavior<ResponseType> {
  id: string;
  method: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  respondWith(status: number, data: string | any): ResponseType;
  getHeaders(): Record<string, HeaderValue>;
  getHeader(name: string): HeaderValue;
  sendHeader(name: string, value: string): void;
  getBody(): Promise<string | undefined>;
  resolveApiKey?: () => Promise<string | undefined>;
}

/**
 * Utility to get a header value as `string` from a Headers object.
 *
 * @private
 * @param request the header value.
 * @returns the header value as `string` or `undefined` if the header is not set.
 */
function singleHeaderValue(value: HeaderValue): string | undefined {
  if (!value) {
    return undefined;
  }
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
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

const EXCLUDED_HEADERS = ['content-length', 'content-encoding'];

/**
 * A request handler that proxies the request to the fal-serverless
 * endpoint. This is useful so client-side calls to the fal-serverless endpoint
 * can be made without CORS issues and the correct credentials can be added
 * effortlessly.
 *
 * @param behavior the request proxy behavior.
 * @returns Promise<any> the promise that will be resolved once the request is done.
 */
export async function handleRequest<ResponseType>(
  behavior: ProxyBehavior<ResponseType>
) {
  const targetUrl = singleHeaderValue(behavior.getHeader(TARGET_URL_HEADER));
  if (!targetUrl) {
    return behavior.respondWith(400, `Missing the ${TARGET_URL_HEADER} header`);
  }

  const urlHost = new URL(targetUrl).host;
  if (!FAL_URL_REG_EXP.test(urlHost)) {
    return behavior.respondWith(412, `Invalid ${TARGET_URL_HEADER} header`);
  }

  const falKey = behavior.resolveApiKey
    ? await behavior.resolveApiKey()
    : getFalKey();
  if (!falKey) {
    return behavior.respondWith(401, 'Missing fal.ai credentials');
  }

  // pass over headers prefixed with x-fal-*
  const headers: Record<string, HeaderValue> = {};
  Object.keys(behavior.getHeaders()).forEach((key) => {
    if (key.toLowerCase().startsWith('x-fal-')) {
      headers[key.toLowerCase()] = behavior.getHeader(key);
    }
  });

  const proxyUserAgent = `@fal-ai/serverless-proxy/${behavior.id}`;
  const userAgent = singleHeaderValue(behavior.getHeader('user-agent'));
  const res = await fetch(targetUrl, {
    method: behavior.method,
    headers: {
      ...headers,
      authorization:
        singleHeaderValue(behavior.getHeader('authorization')) ??
        `Key ${falKey}`,
      accept: 'application/json',
      'content-type': 'application/json',
      'user-agent': userAgent,
      'x-fal-client-proxy': proxyUserAgent,
    } as HeadersInit,
    body:
      behavior.method?.toUpperCase() === 'GET'
        ? undefined
        : await behavior.getBody(),
  });

  // copy headers from fal to the proxied response
  res.headers.forEach((value, key) => {
    if (!EXCLUDED_HEADERS.includes(key.toLowerCase())) {
      behavior.sendHeader(key, value);
    }
  });

  if (res.headers.get('content-type')?.includes('application/json')) {
    const data = await res.json();
    return behavior.respondWith(res.status, data);
  }
  const data = await res.text();
  return behavior.respondWith(res.status, data);
}
