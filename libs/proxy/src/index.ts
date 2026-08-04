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

/**
 * Extracts the URL without the scheme for validation purposes.
 * @param targetUrl the full URL including scheme.
 * @returns the URL without the scheme (host + path + query).
 */
function getUrlWithoutScheme(targetUrl: string): string {
  const url = new URL(targetUrl);
  return `${url.host}${url.pathname}${url.search}`;
}

/**
 * fal service hosts that serve no customer app, and therefore have no app id to match.
 *
 * Kept as an explicit set so adding one is a deliberate act. A host belongs here only if every path
 * on it is fal's own — `wma.fal.run` is signalling, with paths like `session` and `session/heartbeat`.
 */
const FAL_SERVICE_HOSTS = new Set(["wma.fal.run"]);

/** Is this fal's own service infrastructure, carrying no customer app? */
function isFalServiceHost(targetUrl: string): boolean {
  return FAL_SERVICE_HOSTS.has(new URL(targetUrl).host);
}

/**
 * Hosts that are fal's own infrastructure rather than a customer's app.
 *
 * `allowedEndpoints` restricts WHICH OF YOUR APPS may be called, so applying it to fal's own service
 * hosts is a category error: those paths are not app identifiers and can never match an app pattern.
 *
 * This used to test `*.fal.ai` only, which produced an accident rather than a policy. The storage
 * upload endpoints escaped the endpoint check for free because they sit on `rest.fal.ai`, while the
 * WMA signalling bridge did not, because it sits on `wma.fal.run` — same category of thing, opposite
 * treatment, decided entirely by which domain it happened to be on.
 *
 * The consequence was that filling in `allowedEndpoints` broke an unrelated request. A customer
 * listing their two app ids — the more restrictive, more careful configuration — found bridge calls
 * rejected, because `getEndpoint()` reduces `https://wma.fal.run/session` to `"session"`, which
 * matches no app id. Leaving `allowedEndpoints` empty worked, so being specific was punished.
 *
 * @param targetUrl the full URL including scheme.
 * @returns true when the host is fal's own service infrastructure.
 */
function isFalInfrastructure(targetUrl: string): boolean {
  const { host } = new URL(targetUrl);
  // Enumerated, NOT a suffix rule on `.fal.run`. `fal.run` and `queue.fal.run` serve customer apps,
  // and `getEndpoint()` on those yields an app id — which is exactly what `allowedEndpoints` is for.
  // Exempting the whole domain would leave that option restricting nothing on its main path, so the
  // widening has to name the service hosts rather than the domain they happen to share.
  return (
    host === "fal.ai" ||
    host.endsWith(".fal.ai") ||
    FAL_SERVICE_HOSTS.has(host)
  );
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
    // Names the missing header. This one is purely about request SHAPE — no configuration is being
    // disclosed by saying so, and a caller who forgot a header should be told which.
    return behavior.respondWith(
      400,
      `Invalid request: missing ${TARGET_URL_HEADER} header`,
    );
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

  const urlToValidate = getUrlWithoutScheme(targetUrl);
  // fal's own SERVICE hosts skip the URL allowlist entirely, rather than merely appearing in its
  // defaults. Supplying `allowedUrlPatterns` REPLACES the defaults, so a default entry only helps
  // callers who never narrow the list — and narrowing it is the careful thing to do. Anyone scoping
  // the proxy to their two apps would lose signalling and have no way to know why, which is the
  // failure this whole change exists to remove.
  //
  // Deliberately the enumerated service set and NOT `.fal.ai`: fal.ai is not allowed by default today
  // and this must not quietly start permitting it. Service hosts carry no customer-app authority —
  // `wma.fal.run` only signals — so allowing them is equivalent to allowing realtime sessions at all.
  if (
    !isFalServiceHost(targetUrl) &&
    !isAllowedUrl(urlToValidate, resolvedConfig.allowedUrlPatterns)
  ) {
    // Names the OPTION, never its contents. Which check rejected you is something a blocked caller
    // can already infer; the configured patterns would hand them a map of what this proxy may reach.
    return behavior.respondWith(
      400,
      "Invalid request: target URL is not permitted by allowedUrlPatterns",
    );
  }

  // Check allowed endpoints for POST requests only, skip for *.fal.ai domains
  if (behavior.method?.toUpperCase() === "POST" && !isFalInfrastructure(targetUrl)) {
    const endpoint = getEndpoint(targetUrl);
    if (!isAllowedEndpoint(endpoint, resolvedConfig.allowedEndpoints ?? [])) {
      // The one that cost a debugging round while all three said the same thing: the URL was
      // allowlisted and the PATH was not, which is a different option and a different fix.
      return behavior.respondWith(
        400,
        "Invalid request: target path is not permitted by allowedEndpoints",
      );
    }
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
