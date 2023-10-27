import formidable, { type File } from 'formidable';
import { type IncomingMessage } from 'http';

export const TARGET_URL_HEADER = 'x-fal-target-url';

export const DEFAULT_PROXY_ROUTE = '/api/_fal/proxy';

const FAL_KEY = process.env.FAL_KEY || process.env.NEXT_PUBLIC_FAL_KEY;
const FAL_KEY_ID = process.env.FAL_KEY_ID || process.env.NEXT_PUBLIC_FAL_KEY_ID;
const FAL_KEY_SECRET =
  process.env.FAL_KEY_SECRET || process.env.NEXT_PUBLIC_FAL_KEY_SECRET;

/**
 * The proxy behavior that is passed to the proxy handler. This is a subset of
 * request objects that are used by different frameworks, like Express and NextJS.
 */
export interface ProxyBehavior<ResponseType> {
  id: string;
  method: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  respondWith(status: number, data: string | any): ResponseType;
  getHeaders(): Record<string, string | string[] | undefined>;
  getHeader(name: string): string | string[] | undefined;
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

function getFalKey(): string | undefined {
  if (FAL_KEY) {
    return FAL_KEY;
  }
  if (FAL_KEY_ID && FAL_KEY_SECRET) {
    return `${FAL_KEY_ID}:${FAL_KEY_SECRET}`;
  }
  return undefined;
}

export async function handleFileUpload<ResponseType>(request: IncomingMessage) {
  const form = formidable({
    multiples: false,
  });
  const parseForm = new Promise<File>((resolve, reject) => {
    form.parse(request, (error, _, files) => {
      if (error) {
        reject(error);
      }
      const firstFile = Object.values(files)[0];
      const file = firstFile[0];
      resolve(file);
    });
  });
}

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
  if (targetUrl.indexOf('fal.ai') === -1) {
    return behavior.respondWith(412, `Invalid ${TARGET_URL_HEADER} header`);
  }

  const falKey = getFalKey();
  if (!falKey) {
    return behavior.respondWith(401, 'Missing fal.ai credentials');
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

  if (res.headers.get('content-type').includes('application/json')) {
    const data = await res.json();
    return behavior.respondWith(res.status, data);
  }
  const data = await res.text();
  return behavior.respondWith(res.status, data);
}
