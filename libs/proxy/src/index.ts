import { applyProxyConfig, ProxyConfig } from "./config";
import { HeaderValue, ProxyBehavior } from "./types";
import { singleHeaderValue } from "./utils";

export const TARGET_URL_HEADER = "x-fal-target-url";

export const DEFAULT_PROXY_ROUTE = "/api/fal/proxy";

const FAL_KEY = process.env.FAL_KEY;
const FAL_KEY_ID = process.env.FAL_KEY_ID;
const FAL_KEY_SECRET = process.env.FAL_KEY_SECRET;

const FAL_REST_API_URL = "https://rest.alpha.fal.ai";

const FAL_ALLOWED_URLS = [
  /(queue\.|^)fal\.(run|dev)\/.*$/,
  new RegExp(
    `${FAL_REST_API_URL}/storage/upload/initiate\\?storage_type=fal-cdn-v3`,
  ),
  new RegExp(
    `${FAL_REST_API_URL}/storage/upload/complete-multipart\\?storage_type=fal-cdn-v3`,
  ),
];

export function isAllowedUrl(url: string): boolean {
  return FAL_ALLOWED_URLS.some((allowedUrl) => allowedUrl.test(url));
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

const EXCLUDED_HEADERS = ["content-length", "content-encoding"];

/**
 * A request handler that proxies the request to the fal API
 * endpoint. This is useful so client-side calls to the fal endpoint
 * can be made without CORS issues and the correct credentials can be added
 * effortlessly.
 *
 * @param behavior the request proxy behavior.
 * @returns Promise<any> the promise that will be resolved once the request is done.
 */
export async function handleRequest<ResponseType>(
  behavior: ProxyBehavior<ResponseType>,
  config: Partial<ProxyConfig> = {},
) {
  const targetUrl = singleHeaderValue(behavior.getHeader(TARGET_URL_HEADER));
  if (!targetUrl) {
    return behavior.respondWith(400, "Invalid request");
  }

  // TODO: implement allowed endpoints check. The logic is tricky here because the target URL might be any queue URL, so
  // we have to check the existing patterns to be able to match just the endpoint part.

  const urlHost = new URL(targetUrl).host;
  if (!isAllowedUrl(urlHost)) {
    return behavior.respondWith(400, "Invalid request");
  }
  const resolvedConfig = applyProxyConfig(config);

  const isAuthenticated =
    (await resolvedConfig.isAuthenticated?.(behavior)) ?? false;
  if (!isAuthenticated && !resolvedConfig.allowUnauthorizedRequests) {
    return behavior.respondWith(401, "Unauthorized");
  }

  const authorization =
    (await resolvedConfig.resolveFalAuth?.(behavior)) ??
    (await behavior.resolveApiKey());
  if (!authorization) {
    return behavior.respondWith(401, "Unauthorized");
  }

  // pass over headers prefixed with x-fal-*
  const headers: Record<string, HeaderValue> = {};
  Object.keys(behavior.getHeaders()).forEach((key) => {
    if (key.toLowerCase().startsWith("x-fal-")) {
      headers[key.toLowerCase()] = behavior.getHeader(key);
    }
  });

  const proxyUserAgent = `@fal-ai/server-proxy/${behavior.id}`;
  const userAgent = singleHeaderValue(behavior.getHeader("user-agent"));
  const res = await fetch(targetUrl, {
    method: behavior.method,
    headers: {
      ...headers,
      authorization,
      accept: "application/json",
      "content-type": "application/json",
      "user-agent": userAgent,
      "x-fal-client-proxy": proxyUserAgent,
    } as HeadersInit,
    body:
      behavior.method?.toUpperCase() === "GET"
        ? undefined
        : await behavior.getRequestBody(),
  });

  // copy headers from fal to the proxied response
  res.headers.forEach((value, key) => {
    if (!EXCLUDED_HEADERS.includes(key.toLowerCase())) {
      behavior.sendHeader(key, value);
    }
  });

  return behavior.sendResponse(res);
}

export function fromHeaders(
  headers: Headers,
): Record<string, string | string[]> {
  // TODO once Header.entries() is available, use that instead
  // Object.fromEntries(headers.entries());
  const result: Record<string, string | string[]> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

export const responsePassthrough = (res: Response) => Promise.resolve(res);

export const resolveApiKeyFromEnv = () => Promise.resolve(getFalKey());
