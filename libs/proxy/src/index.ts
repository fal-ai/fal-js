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
  resolveProxyConfig,
  type ProxyConfig,
} from "./config";
export { type HeaderValue, type ProxyBehavior } from "./types";

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

// Only these WMA bridge routes may use the service-host allowlist bypass. App-scoped routes carry
// the fal app identity in JSON; the heartbeat acts only on an already-authorized session.
const SERVICE_APP_SCOPED_PATHS = new Set(["/ice", "/session"]);
const SERVICE_SESSION_SCOPED_PATHS = new Set(["/session/heartbeat"]);

function normalizeServicePath(url: URL): string | undefined {
  try {
    const path = decodeURIComponent(url.pathname).replace(/\/{2,}/g, "/");
    return path.replace(/\/+$/, "") || "/";
  } catch {
    return undefined;
  }
}

function countJsonKeys(body: string, key: string): number {
  let count = 0;
  for (let index = 0; index < body.length; index++) {
    if (body[index] !== '"') continue;
    const start = index;
    for (index++; index < body.length; index++) {
      if (body[index] === "\\") {
        index++;
        continue;
      }
      if (body[index] !== '"') continue;

      let next = index + 1;
      while (/\s/.test(body[next] ?? "")) next++;
      if (body[next] === ":") {
        try {
          if (JSON.parse(body.slice(start, index + 1)) === key) count++;
        } catch {
          // The full parse below rejects malformed JSON. This scan only detects duplicate keys.
        }
      }
      break;
    }
  }
  return count;
}

function appIdFromRequestBody(body: string | undefined): string | undefined {
  if (!body || countJsonKeys(body, "app_id") > 1) return undefined;
  try {
    const value = JSON.parse(body) as { app_id?: unknown };
    return typeof value.app_id === "string" ? value.app_id : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Checks if the URL is on the fal.ai domain or any of its subdomains.
 * @param targetUrl the full URL including scheme.
 * @returns true if the URL is on *.fal.ai domain.
 */
function isFalAiDomain(targetUrl: string): boolean {
  const url = new URL(targetUrl);
  return url.host === "fal.ai" || url.host.endsWith(".fal.ai");
}

/**
 * Extracts the endpoint from a URL (path without leading slash).
 * @param targetUrl the full URL including scheme.
 * @returns the endpoint (path without leading slash).
 */
export function getEndpoint(targetUrl: string): string {
  const url = new URL(targetUrl);
  // Remove leading slash from pathname
  return url.pathname.replace(/^\//, "");
}

/**
 * Checks if an endpoint matches any of the allowed endpoint patterns.
 *
 * @param endpoint the endpoint to check (path without leading slash).
 * @param patterns the allowed endpoint patterns (glob-style).
 * @returns whether the endpoint is allowed.
 */
export function isAllowedEndpoint(
  endpoint: string,
  patterns: string[],
): boolean {
  // Empty array means all endpoints are allowed (backwards compatibility)
  if (patterns.length === 0) {
    return true;
  }
  return createUrlMatcher(patterns)(endpoint);
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

  let requestBodyPromise: Promise<string | undefined> | undefined;
  const readRequestBody = () =>
    (requestBodyPromise ??= behavior.getRequestBody());
  const behaviorWithCachedBody: ProxyBehavior<ResponseType> = {
    id: behavior.id,
    method: behavior.method,
    respondWith: (status, data) => behavior.respondWith(status, data),
    sendResponse: (response) => behavior.sendResponse(response),
    getHeaders: () => behavior.getHeaders(),
    getHeader: (name) => behavior.getHeader(name),
    sendHeader: (name, value) => behavior.sendHeader(name, value),
    getRequestBody: readRequestBody,
    resolveApiKey: behavior.resolveApiKey?.bind(behavior),
  };
  let authenticationPromise: Promise<boolean> | undefined;
  const authenticate = () =>
    (authenticationPromise ??= (async () =>
      (await resolvedConfig.isAuthenticated?.(behaviorWithCachedBody)) ??
      false)());

  const target = new URL(targetUrl);
  const serviceHosts = new Set(
    (resolvedConfig.serviceHosts ?? ["wma.fal.run"]).map((host) =>
      host.toLowerCase(),
    ),
  );
  const isServiceHost =
    target.protocol === "https:" && serviceHosts.has(target.host.toLowerCase());

  const urlToValidate = `${target.host}${target.pathname}${target.search}`;
  if (
    !isServiceHost &&
    !isAllowedUrl(urlToValidate, resolvedConfig.allowedUrlPatterns)
  ) {
    return behavior.respondWith(400, "Invalid request");
  }

  const method = behavior.method?.toUpperCase();
  if (isServiceHost) {
    if (method !== "POST") {
      return behavior.respondWith(400, "Invalid request");
    }
    const path = normalizeServicePath(target);
    const isAppScoped =
      path !== undefined && SERVICE_APP_SCOPED_PATHS.has(path);
    if (
      !isAppScoped &&
      (path === undefined || !SERVICE_SESSION_SCOPED_PATHS.has(path))
    ) {
      return behavior.respondWith(400, "Invalid request");
    }

    const allowedEndpoints = resolvedConfig.allowedEndpoints ?? [];
    if (isAppScoped && allowedEndpoints.length > 0) {
      const isAuthenticated = await authenticate();
      if (!isAuthenticated && !resolvedConfig.allowUnauthorizedRequests) {
        return behavior.respondWith(401, "Unauthorized");
      }
      const appId = appIdFromRequestBody(await readRequestBody());
      if (!appId || !isAllowedEndpoint(appId, allowedEndpoints)) {
        return behavior.respondWith(400, "Invalid request");
      }
    }
  } else if (method === "POST" && !isFalAiDomain(targetUrl)) {
    // Normal app-serving URLs keep the existing path-based endpoint check.
    const endpoint = getEndpoint(targetUrl);
    if (!isAllowedEndpoint(endpoint, resolvedConfig.allowedEndpoints ?? [])) {
      return behavior.respondWith(400, "Invalid request");
    }
  }

  const isAuthenticated = await authenticate();
  if (!isAuthenticated && !resolvedConfig.allowUnauthorizedRequests) {
    return behavior.respondWith(401, "Unauthorized");
  }

  const authorization =
    (await resolvedConfig.resolveFalAuth?.(behaviorWithCachedBody)) ??
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
        : await readRequestBody(),
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
