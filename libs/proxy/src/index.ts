import {
  applyProxyConfig,
  createUrlMatcher,
  DEFAULT_ALLOWED_URL_PATTERNS,
  type ProxyConfig,
} from "./config";
import type { HeaderValue, ProxyBehavior, ProxyRequestBody } from "./types";
import {
  isParserProducedByteBody,
  RequestBodyTooLargeError,
  singleHeaderValue,
} from "./utils";

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
// Compiled matchers are memoized by the pattern array's identity and contents: a resolved config
// normally carries the same unchanged array on every request, but callers may mutate it in place.
const matcherCache = new WeakMap<
  string[],
  { signature: string; matcher: (url: string) => boolean }
>();
function cachedMatcher(patterns: string[]): (url: string) => boolean {
  const signature = JSON.stringify(patterns);
  let cached = matcherCache.get(patterns);
  if (!cached || cached.signature !== signature) {
    cached = { signature, matcher: createUrlMatcher(patterns) };
    matcherCache.set(patterns, cached);
  }
  return cached.matcher;
}

export function isAllowedUrl(url: string, patterns?: string[]): boolean {
  if (patterns) {
    return cachedMatcher(patterns)(url);
  }
  return defaultUrlMatcher(url);
}

/**
 * Routes fal's service hosts are permitted to forward, DEFAULT-DENY: a path absent from both sets
 * is rejected, so a route added upstream can never silently escape endpoint policy before this
 * list learns about it. App-scoped routes carry the app identity in their JSON body and enforce
 * `allowedEndpoints` against it; session-scoped routes act on an already-negotiated session and
 * carry no app authority.
 */
const SERVICE_APP_SCOPED_PATHS = new Set(["/ice", "/session"]);
const SERVICE_SESSION_SCOPED_PATHS = new Set(["/session/heartbeat"]);

/**
 * The service-relative path, normalized the way the upstream router sees it (percent escapes
 * decoded, duplicate slashes collapsed, trailing slashes stripped). `undefined` for malformed
 * escapes — which never match a known route, failing closed.
 */
function normalizeServicePath(url: URL): string | undefined {
  let path: string;
  try {
    path = decodeURIComponent(url.pathname).replace(/\/{2,}/g, "/");
  } catch {
    return undefined;
  }
  return path.replace(/\/+$/, "") || "/";
}

function countJsonKeys(body: string, key: string): number {
  let count = 0;
  for (let index = 0; index < body.length; index++) {
    if (body[index] !== '"') continue;
    const start = index;
    for (index++; index < body.length; index++) {
      if (body[index] === "\\") {
        // Skip the escaped character so an escaped quote cannot look like a string boundary.
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
          // The full JSON parse below rejects malformed strings. This scan only decides whether
          // a syntactically decodable key appears more than once.
        }
      }
      break;
    }
  }
  return count;
}

function appIdFromRequestBody(body: string | undefined): string | undefined {
  if (!body) return undefined;
  // Fail closed on duplicate keys: JSON parsers disagree about which duplicate wins, and this
  // value gates allowedEndpoints — the proxy's verdict must not depend on its parser agreeing
  // with the upstream's. Decode every object-key token so escaped spellings such as
  // `app_\u0069d` count too. Nested keys are deliberately included; that can only reject more.
  if (countJsonKeys(body, "app_id") > 1) return undefined;
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
function isFalInfrastructure(url: URL, serviceHosts: Set<string>): boolean {
  // Enumerated, NOT a suffix rule on `.fal.run`. `fal.run` and `queue.fal.run` serve customer apps,
  // and `getEndpoint()` on those yields an app id — which is exactly what `allowedEndpoints` is for.
  // Exempting the whole domain would leave that option restricting nothing on its main path, so the
  // widening has to name the service hosts rather than the domain they happen to share.
  const host = url.host.toLowerCase();
  return (
    host === "fal.ai" ||
    host.endsWith(".fal.ai") ||
    (url.protocol === "https:" && serviceHosts.has(host))
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
  return cachedMatcher(patterns)(endpoint);
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

// Request headers that are never forwarded, even when explicitly listed in
// `forwardRequestHeaders`: credentials addressed to the proxy host and hop-by-hop headers the
// upstream fetch manages itself.
// `content-encoding` is deliberately NOT here: it is end-to-end metadata for the raw-bytes body
// path, and an operator who names it in `forwardRequestHeaders` is labeling compressed bytes the
// proxy forwards unchanged. It still never travels by default.
const NEVER_FORWARDED_REQUEST_HEADERS = new Set([
  "authorization",
  "cookie",
  "host",
  "content-length",
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
  // One cached promise, so the read-once guarantee is unrepresentable to break — a flag-plus-value
  // pair invites a concurrent double read of an already-consumed stream.
  let requestBodyPromise: Promise<ProxyRequestBody> | undefined;
  const readRequestBody = () =>
    (requestBodyPromise ??= behavior.getRequestBody());
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

  // ONE parse for the whole request, and the single choke point for malformed target URLs —
  // a throwing `new URL` inside a helper would otherwise surface as a 500 from whichever check
  // happened to run first.
  let url: URL;
  try {
    url = new URL(targetUrl);
  } catch {
    return behavior.respondWith(
      400,
      `Invalid request: ${TARGET_URL_HEADER} is not a valid absolute URL`,
    );
  }
  const serviceHosts = new Set(
    (resolvedConfig.serviceHosts ?? ["wma.fal.run"]).map((host) =>
      host.toLowerCase(),
    ),
  );
  const isServiceHost =
    url.protocol === "https:" && serviceHosts.has(url.host.toLowerCase());

  // fal's own SERVICE hosts skip the URL allowlist, and are deliberately absent from
  // DEFAULT_ALLOWED_URL_PATTERNS: supplying `allowedUrlPatterns` REPLACES the defaults, so an entry
  // there would only help callers who never narrow the list — and narrowing it is the careful thing
  // to do. Anyone scoping the proxy to their two apps would lose signalling and have no way to know
  // why. Operators who want them refused entirely set `serviceHosts: []`.
  if (
    !isServiceHost &&
    !isAllowedUrl(
      `${url.host}${url.pathname}${url.search}`,
      resolvedConfig.allowedUrlPatterns,
    )
  ) {
    // Names the OPTION, never its contents. Which check rejected you is something a blocked caller
    // can already infer; the configured patterns would hand them a map of what this proxy may reach.
    return behavior.respondWith(
      400,
      "Invalid request: target URL is not permitted by allowedUrlPatterns",
    );
  }

  // Authentication FIRST, once: an unauthenticated caller learns nothing about endpoint policy,
  // and the check cannot diverge between the service and app paths.
  const isAuthenticated =
    (await resolvedConfig.isAuthenticated?.(behavior)) ?? false;
  if (!isAuthenticated && !resolvedConfig.allowUnauthorizedRequests) {
    return behavior.respondWith(401, "Unauthorized");
  }

  // Service hosts are DEFAULT-DENY by shape: fal's signalling legs are all POST to a known route,
  // so anything else — another method, an unknown or unnormalizable path — is refused rather than
  // forwarded with credentials. A route added upstream must be added here deliberately.
  let serviceAppScoped = false;
  if (isServiceHost) {
    if (behavior.method?.toUpperCase() !== "POST") {
      return behavior.respondWith(
        400,
        "Invalid request: fal service hosts only accept POST",
      );
    }
    const servicePath = normalizeServicePath(url);
    serviceAppScoped =
      servicePath !== undefined && SERVICE_APP_SCOPED_PATHS.has(servicePath);
    if (
      !serviceAppScoped &&
      (servicePath === undefined ||
        !SERVICE_SESSION_SCOPED_PATHS.has(servicePath))
    ) {
      return behavior.respondWith(
        400,
        "Invalid request: unknown fal service route",
      );
    }
  }

  // App-serving POST paths carry the app id in the URL. The service hosts' app-scoped routes
  // carry it in JSON instead, so both enforce the same endpoint policy.
  const allowedEndpoints = resolvedConfig.allowedEndpoints ?? [];
  const restrictEndpoints =
    behavior.method?.toUpperCase() === "POST" && allowedEndpoints.length > 0;
  if (restrictEndpoints) {
    let endpoint: string | undefined;
    if (isServiceHost) {
      if (serviceAppScoped) {
        try {
          endpoint = appIdFromRequestBody(await readRequestBodyText());
        } catch (error) {
          if (error instanceof RequestBodyTooLargeError) {
            return behavior.respondWith(error.status, error.message);
          }
          throw error;
        }
      }
    } else if (!isFalInfrastructure(url, serviceHosts)) {
      endpoint = getEndpoint(targetUrl);
    }
    if (
      (isServiceHost && serviceAppScoped && endpoint === undefined) ||
      (endpoint !== undefined && !isAllowedEndpoint(endpoint, allowedEndpoints))
    ) {
      // The URL is allowlisted and the path is not, which is a different option and a different fix.
      return behavior.respondWith(
        400,
        "Invalid request: target path is not permitted by allowedEndpoints",
      );
    }
  }

  const authorization =
    (await resolvedConfig.resolveFalAuth?.(behavior)) ??
    (await behavior.resolveApiKey?.());
  if (!authorization) {
    return behavior.respondWith(401, "Unauthorized");
  }

  // Forward an ALLOWLIST, never a pass-through: applications authenticate their own proxy route
  // with custom headers (session tokens, API keys, CSRF tokens) that no denylist can enumerate,
  // and forwarding them would leak user credentials to the upstream on every call. `x-fal-*`
  // always travels; `accept` and `content-type` shape the request; anything else — say a realtime
  // extension's provider-specific header — is forwarded only when the operator names it in
  // `forwardRequestHeaders`. The proxy-owned values are applied after the spread, so a caller
  // cannot override them.
  const forwarded = new Set(
    (resolvedConfig.forwardRequestHeaders ?? []).map((name) =>
      name.toLowerCase(),
    ),
  );
  const headers: Record<string, HeaderValue> = {};
  Object.keys(behavior.getHeaders()).forEach((key) => {
    const name = key.toLowerCase();
    if (NEVER_FORWARDED_REQUEST_HEADERS.has(name)) {
      return;
    }
    if (name.startsWith("x-fal-") || forwarded.has(name)) {
      headers[name] = behavior.getHeader(key);
    }
  });

  const proxyUserAgent = `@fal-ai/server-proxy/${behavior.id}`;
  const userAgent = singleHeaderValue(behavior.getHeader("user-agent"));
  const accept =
    singleHeaderValue(behavior.getHeader("accept")) ?? "application/json";
  let body: ProxyRequestBody;
  try {
    body =
      behavior.method?.toUpperCase() === "GET"
        ? undefined
        : await readRequestBody();
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return behavior.respondWith(error.status, error.message);
    }
    throw error;
  }
  // The incoming content-type is forwarded when present. When absent, string bodies keep the
  // historical application/json default (bare `fetch(proxy, { body: JSON.stringify(x) })` callers
  // relied on the old rewrite, and browsers would otherwise label them text/plain) — while raw
  // binary bodies stay label-free, matching direct-fetch semantics.
  const incomingContentType = singleHeaderValue(
    behavior.getHeader("content-type"),
  );
  const contentType =
    incomingContentType ??
    (typeof body === "string" ? "application/json" : undefined);
  // An explicitly forwarded content-encoding only describes bytes read from the RAW STREAM.
  // Parser output no longer matches it: parsers inflate compressed requests before parsing, so
  // both a re-serialized string and a parser-produced buffer (express.raw's default inflation)
  // are already identity-encoded, and forwarding the original label would make the upstream try
  // to decompress plain bytes.
  if (
    (typeof body === "string" || isParserProducedByteBody(body)) &&
    "content-encoding" in headers
  ) {
    delete headers["content-encoding"];
  }
  const res = await fetch(targetUrl, {
    method: behavior.method,
    headers: {
      ...headers,
      authorization,
      accept,
      ...(contentType !== undefined ? { "content-type": contentType } : {}),
      "user-agent": userAgent,
      "x-fal-client-proxy": proxyUserAgent,
    } as HeadersInit,
    body,
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
