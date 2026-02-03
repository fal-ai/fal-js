import {
  applyProxyConfig,
  createUrlMatcher,
  DEFAULT_ALLOWED_URL_PATTERNS,
  type ProxyConfig,
} from "./config";
import type { HeaderValue, ProxyBehavior } from "./types";
import { singleHeaderValue } from "./utils";

export {
  createUrlMatcher,
  DEFAULT_ALLOWED_URL_PATTERNS,
  ProxyConfig,
  resolveProxyConfig,
} from "./config";
export { HeaderValue, ProxyBehavior } from "./types";

export const TARGET_URL_HEADER = "x-fal-target-url";

export const DEFAULT_PROXY_ROUTE = "/api/fal/proxy";

const FAL_KEY = process.env.FAL_KEY;
const FAL_KEY_ID = process.env.FAL_KEY_ID;
const FAL_KEY_SECRET = process.env.FAL_KEY_SECRET;

// Default matcher using the default allowed URL patterns
const defaultUrlMatcher = createUrlMatcher(DEFAULT_ALLOWED_URL_PATTERNS);

/**
 * Checks if a URL matches any of the allowed URL patterns.
 *
 * @param url the URL to check (without scheme, e.g., "fal.run/path").
 * @param patterns the allowed URL patterns (glob-style). If not provided, uses default patterns.
 * @returns whether the URL is allowed.
 */
export function isAllowedUrl(url: string, patterns?: string[]): boolean {
  if (patterns) {
    return createUrlMatcher(patterns)(url);
  }
  return defaultUrlMatcher(url);
}

/**
 * Extracts the URL without the scheme for validation purposes.
 * @param targetUrl the full URL including scheme.
 * @returns the URL without the scheme (host + path + query).
 */
function getUrlWithoutScheme(targetUrl: string): string {
  const url = new URL(targetUrl);
  return `${url.host}${url.pathname}${url.search}`;
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
 * @param config the proxy configuration. Can be a partial config (will be resolved internally)
 *               or a pre-resolved config from `resolveProxyConfig` to avoid per-request warnings.
 * @returns Promise<any> the promise that will be resolved once the request is done.
 */
export async function handleRequest<ResponseType>(
  behavior: ProxyBehavior<ResponseType>,
  config: Partial<ProxyConfig> | ProxyConfig = {},
) {
  const targetUrl = singleHeaderValue(behavior.getHeader(TARGET_URL_HEADER));
  if (!targetUrl) {
    return behavior.respondWith(400, "Invalid request");
  }

  // Check if config is already resolved (has all required fields with non-undefined values)
  const isResolved =
    config.isAuthenticated !== undefined &&
    config.resolveFalAuth !== undefined &&
    config.allowUnauthorizedRequests !== undefined &&
    config.allowedUrlPatterns !== undefined;
  const resolvedConfig = isResolved
    ? (config as ProxyConfig)
    : applyProxyConfig(config);

  // TODO: implement allowed endpoints check. The logic is tricky here because the target URL might be any queue URL, so
  // we have to check the existing patterns to be able to match just the endpoint part.

  const urlToValidate = getUrlWithoutScheme(targetUrl);
  if (!isAllowedUrl(urlToValidate, resolvedConfig.allowedUrlPatterns)) {
    return behavior.respondWith(400, "Invalid request");
  }

  const isAuthenticated =
    (await resolvedConfig.isAuthenticated?.(behavior)) ?? false;
  if (!isAuthenticated && !resolvedConfig.allowUnauthorizedRequests) {
    return behavior.respondWith(401, "Unauthorized");
  }

  const authorization =
    (await resolvedConfig.resolveFalAuth?.(behavior)) ??
    (await behavior.resolveApiKey?.());
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
