import { ProxyBehavior } from "./types";
import { singleHeaderValue } from "./utils";

/**
 * Proxy configuration options.
 */
export interface ProxyConfig {
  /**
   * Currently for backwards compatibility an empty array means all endpoints are allowed.
   * In the future the behavior might change to disallow all endpoints by default and require
   * explicitly allowing endpoints.
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
      "Allowing unathenticated requests. Make sure you protect your proxy endpoint or handle unauthenticated users appropriately.",
    );
  }
  return resolvedConfig;
}
