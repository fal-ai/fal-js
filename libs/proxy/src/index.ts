import {
  applyProxyConfig,
  createUrlMatcher,
  DEFAULT_ALLOWED_URL_PATTERNS,
  type ProxyConfig,
} from "./config";
import type { HeaderValue, ProxyBehavior, ProxyRequestBody } from "./types";
import { singleHeaderValue } from "./utils";

export {
  createUrlMatcher,
  DEFAULT_ALLOWED_URL_PATTERNS,
  resolveProxyConfig,
  type ProxyConfig,
} from "./config";
export {
  type HeaderValue,
  type ProxyBehavior,
  type ProxyRequestBody,
} from "./types";

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
const WMA_APP_SCOPED_PATHS = new Set(["/ice", "/session"]);

/** Is this fal's own service infrastructure, carrying no customer app? */
function isFalServiceHost(targetUrl: string): boolean {
  const url = new URL(targetUrl);
  return url.protocol === "https:" && FAL_SERVICE_HOSTS.has(url.host);
}

function isWmaAppScopedRoute(targetUrl: string): boolean {
  const url = new URL(targetUrl);
  if (!isFalServiceHost(targetUrl)) return false;
  let path: string;
  try {
    // URL.pathname keeps percent escapes intact, while the upstream router decodes them. Apply the
    // same normalization before deciding whether the route carries app authority in its JSON body.
    path = decodeURIComponent(url.pathname).replace(/\/{2,}/g, "/");
  } catch {
    // A malformed escape must not turn a potentially app-scoped service route into an exemption.
    return true;
  }
  path = path.replace(/\/+$/, "") || "/";
  return WMA_APP_SCOPED_PATHS.has(path);
}

function appIdFromRequestBody(body: string | undefined): string | undefined {
  if (!body) return undefined;
  try {
    const value = JSON.parse(body) as { app_id?: unknown };
    return typeof value.app_id === "string" ? value.app_id : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Hosts that are fal's own infrastructure rather than a customer's app.
 *
 * `allowedEndpoints` restricts WHICH OF YOUR APPS may be called, so applying it to fal's own service
 * hosts is a category error: those paths are not app identifiers and can never match an app pattern.
 *
 * `fal.ai` subdomains and the explicitly enumerated service hosts share this treatment regardless of
 * their DNS suffix. `wma.fal.run/session`, for example, is signalling infrastructure; reducing its
 * path to `"session"` and comparing it with customer app ids would reject every valid bridge call.
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
    host === "fal.ai" || host.endsWith(".fal.ai") || isFalServiceHost(targetUrl)
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

// Request headers the proxy owns or that must not travel: credentials meant for the proxy host
// (`authorization`, `cookie`), hop-by-hop headers the upstream fetch manages itself, and headers
// derived from the incoming connection. Everything else passes through, so an extension header or
// a non-JSON `accept` behaves the same through the proxy as with a direct fetch.
const EXCLUDED_REQUEST_HEADERS = new Set([
  "authorization",
  "cookie",
  "host",
  "content-length",
  "content-encoding",
  "connection",
  "transfer-encoding",
  "keep-alive",
  "upgrade",
  "te",
  "trailer",
  "expect",
  "accept-encoding",
  "proxy-authorization",
]);

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
  let requestBody: ProxyRequestBody;
  let requestBodyRead = false;
  const readRequestBody = async () => {
    if (!requestBodyRead) {
      requestBody = await behavior.getRequestBody();
      requestBodyRead = true;
    }
    return requestBody;
  };
  // The forwarded body stays raw bytes — decoding a multipart payload corrupts its file parts.
  // Only the WMA app-id extraction needs text, and those routes carry JSON.
  const readRequestBodyText = async (): Promise<string | undefined> => {
    const body = await readRequestBody();
    if (typeof body === "string") {
      return body;
    }
    if (body === undefined) {
      return undefined;
    }
    return new TextDecoder().decode(body);
  };

  const urlToValidate = getUrlWithoutScheme(targetUrl);
  // fal's own SERVICE hosts skip the URL allowlist entirely, and are deliberately absent from
  // DEFAULT_ALLOWED_URL_PATTERNS: this short-circuit runs first, so a default entry could never be
  // the thing that admits them. Supplying `allowedUrlPatterns` REPLACES the defaults, so an entry
  // there would only help callers who never narrow the list — and narrowing it is the careful thing
  // to do. Anyone scoping the proxy to their two apps would lose signalling and have no way to know
  // why, which is the failure this exists to remove.
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

  // App-serving POST paths carry the app id in the URL. WMA's app-scoped infrastructure routes
  // carry it in JSON instead, so both must enforce the same endpoint policy.
  const allowedEndpoints = resolvedConfig.allowedEndpoints ?? [];
  const restrictEndpoints =
    behavior.method?.toUpperCase() === "POST" && allowedEndpoints.length > 0;
  const wmaAppScoped = restrictEndpoints && isWmaAppScopedRoute(targetUrl);
  let isAuthenticated: boolean | undefined;
  if (wmaAppScoped) {
    isAuthenticated =
      (await resolvedConfig.isAuthenticated?.(behavior)) ?? false;
    if (!isAuthenticated && !resolvedConfig.allowUnauthorizedRequests) {
      return behavior.respondWith(401, "Unauthorized");
    }
  }

  if (restrictEndpoints) {
    const endpoint = wmaAppScoped
      ? appIdFromRequestBody(await readRequestBodyText())
      : isFalInfrastructure(targetUrl)
        ? undefined
        : getEndpoint(targetUrl);
    if (
      (wmaAppScoped && endpoint === undefined) ||
      (endpoint !== undefined && !isAllowedEndpoint(endpoint, allowedEndpoints))
    ) {
      // The URL is allowlisted and the path is not, which is a different option and a different fix.
      return behavior.respondWith(
        400,
        "Invalid request: target path is not permitted by allowedEndpoints",
      );
    }
  }

  isAuthenticated ??=
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

  // Pass request headers through, minus the ones the proxy owns. A realtime extension's
  // provider-specific header or `accept: text/event-stream` must survive the documented proxy
  // path, or the same code silently changes protocol depending on how the client is configured.
  // The proxy-owned values are applied after the spread, so a caller cannot override them.
  const headers: Record<string, HeaderValue> = {};
  Object.keys(behavior.getHeaders()).forEach((key) => {
    const name = key.toLowerCase();
    if (!EXCLUDED_REQUEST_HEADERS.has(name)) {
      headers[name] = behavior.getHeader(key);
    }
  });

  const proxyUserAgent = `@fal-ai/server-proxy/${behavior.id}`;
  const userAgent = singleHeaderValue(behavior.getHeader("user-agent"));
  const accept =
    singleHeaderValue(behavior.getHeader("accept")) ?? "application/json";
  // The incoming content-type already passes through the header loop above; a request that
  // omitted it must stay without one, matching direct-fetch semantics for raw binary bodies —
  // defaulting to JSON would make upstream endpoints parse valid bytes as JSON.
  const res = await fetch(targetUrl, {
    method: behavior.method,
    headers: {
      ...headers,
      authorization,
      accept,
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
