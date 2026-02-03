import picomatch from "picomatch";
import { ProxyBehavior } from "./types";
import { singleHeaderValue } from "./utils";

/**
 * The fal REST API URL used for storage operations.
 */
export const FAL_REST_API_URL = "rest.alpha.fal.ai";

/**
 * The default allowed URL patterns. Only `fal.run` and `queue.fal.run` are allowed by default.
 * You can add patterns like `fal.ai/**` or `fal.dev/**` if needed for your use case.
 *
 * Note: Uses picomatch glob syntax. The `?` character is escaped with `\\?` for literal matching.
 */
export const DEFAULT_ALLOWED_URL_PATTERNS = [
  "fal.run/**",
  "queue.fal.run/**",
  // Storage upload endpoints (exact matches, ? is escaped for literal match)
  `${FAL_REST_API_URL}/storage/upload/initiate\\?storage_type=fal-cdn-v3`,
  `${FAL_REST_API_URL}/storage/upload/complete-multipart\\?storage_type=fal-cdn-v3`,
];

/**
 * Creates a matcher function for URL patterns using picomatch.
 * Supports glob patterns like `*` (single segment) and `**` (any path).
 *
 * @param patterns the URL patterns to match against.
 * @returns a function that checks if a URL matches any of the patterns.
 */
export function createUrlMatcher(patterns: string[]): (url: string) => boolean {
  return picomatch(patterns, { dot: true });
}

/**
 * Proxy configuration options.
 */
export interface ProxyConfig {
  /**
   * URL patterns (glob-style) that are allowed to be proxied.
   * Supports `*` (matches any characters except `/`) and `**` (matches any characters including `/`).
   *
   * By default only `fal.run/**` and `queue.fal.run/**` are allowed.
   * You can add patterns like `fal.ai/**` or `fal.dev/**` if needed for your use case.
   *
   * @example
   * ```ts
   * allowedUrlPatterns: ["fal.run/**", "queue.fal.run/**", "fal.ai/my-app/**"]
   * ```
   *
   * @default ["fal.run/**", "queue.fal.run/**"]
   */
  allowedUrlPatterns?: string[];

  /**
   * Endpoint patterns (glob-style) that are allowed to be called via POST requests.
   * The endpoint is the path portion of the URL without the leading slash.
   *
   * For example, for `https://fal.run/fal-ai/flux/dev`, the endpoint is `fal-ai/flux/dev`.
   *
   * Supports `*` (matches any characters except `/`) and `**` (matches any characters including `/`).
   *
   * Currently for backwards compatibility an empty array means all endpoints are allowed.
   * In the future the behavior might change to disallow all endpoints by default and require
   * explicitly allowing endpoints.
   *
   * @example
   * ```ts
   * // Allow only specific endpoints
   * allowedEndpoints: ["fal-ai/flux/**", "fal-ai/fast-sdxl"]
   * ```
   *
   * @default [] (all endpoints allowed)
   */
  allowedEndpoints?: string[] | undefined;

  /**
   * Whether to allow requests without an authorization header. Currently for backwards compatibility
   * this is set to `true` by default. In the future the behavior might change to disallow unauthorized
   * requests by default and require explicitly allowing unauthorized requests.
   */
  allowUnauthorizedRequests?: boolean;

  /**
   * A function to check if the request is authenticated. This is implemented by the app owner
   * to inform the proxy whether the request is authenticated or not.
   *
   * @param behavior the proxy behavior.
   * @returns whether the request is authenticated.
   *
   * @see isAuthorizationHeaderPresent
   */
  isAuthenticated?: (behavior: ProxyBehavior<unknown>) => Promise<boolean>;

  /**
   * A function to resolve the authorization header value. By default it uses the `FAL_KEY` environment variable.
   * You can use this to use a different authorization mechanism, for example a custom token based authentication.
   *
   * @returns the authorization header value.
   */
  resolveFalAuth?: (
    behavior: ProxyBehavior<unknown>,
  ) => Promise<string | undefined>;
}

export async function useEnvironmentFalKey(): Promise<string | undefined> {
  return `Key ${process.env.FAL_KEY}`;
}

export async function fallbackToFalKey(
  behavior: ProxyBehavior<unknown>,
): Promise<string | undefined> {
  return (
    singleHeaderValue(behavior.getHeader("authorization")) ??
    (await useEnvironmentFalKey())
  );
}

export async function isAuthorizationHeaderPresent(
  behavior: ProxyBehavior<unknown>,
): Promise<boolean> {
  return behavior.getHeader("authorization") !== null;
}

export const DEFAULT_PROXY_CONFIG: ProxyConfig = {
  allowedUrlPatterns: DEFAULT_ALLOWED_URL_PATTERNS,
  allowedEndpoints: [],
  allowUnauthorizedRequests: true,
  isAuthenticated: isAuthorizationHeaderPresent,
  resolveFalAuth: fallbackToFalKey,
};

/**
 * Merges the default proxy configuration with the provided configuration.
 *
 * @param config the proxy configuration to apply.
 * @returns the resolved proxy configuration.
 */
export function applyProxyConfig(config: Partial<ProxyConfig>): ProxyConfig {
  const resolvedConfig = {
    ...DEFAULT_PROXY_CONFIG,
    ...config,
  };
  if (
    !Array.isArray(resolvedConfig.allowedEndpoints) ||
    resolvedConfig.allowedEndpoints.length === 0
  ) {
    console.warn(
      "No allowed endpoints specified, all endpoints will be allowed. This is not recommended for production use cases.",
    );
  }
  if (resolvedConfig.allowUnauthorizedRequests) {
    console.warn(
      "Allowing unauthenticated requests. Make sure you protect your proxy endpoint or handle unauthenticated users appropriately.",
    );
  }
  return resolvedConfig;
}

/**
 * Resolves the proxy configuration once. Use this at handler creation time
 * to avoid logging warnings on every request.
 *
 * @param config the proxy configuration to apply.
 * @returns the resolved proxy configuration.
 */
export function resolveProxyConfig(config: Partial<ProxyConfig>): ProxyConfig {
  return applyProxyConfig(config);
}
