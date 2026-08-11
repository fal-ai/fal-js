import {
  withMiddleware,
  withProxy,
  type ProxyRuntimeGate,
  type RequestMiddleware,
} from "./middleware";
import type { ResponseHandler } from "./response";
import { defaultResponseHandler } from "./response";
import { DEFAULT_RETRY_OPTIONS, type RetryOptions } from "./retry";
import { isBrowser } from "./runtime";

export type CredentialsResolver = () => string | undefined;

/**
 * Full configuration for the proxy middleware. Use this object form of
 * `proxyUrl` to control when the proxy applies in non-browser runtimes.
 */
export type ProxyUrlConfig = {
  /**
   * The URL of the proxy server. The proxy server should forward the
   * requests to the fal api.
   */
  url: string;
  /**
   * When the proxy middleware should apply. Defaults to `"browser"`.
   * @see ProxyRuntimeGate
   */
  when?: ProxyRuntimeGate;
};

type FetchType = typeof fetch;

export function resolveDefaultFetch(): FetchType {
  if (typeof fetch === "undefined") {
    throw new Error(
      "Your environment does not support fetch. Please provide your own fetch implementation.",
    );
  }
  return fetch;
}

export type Config = {
  /**
   * The credentials to use for the fal client. When using the
   * client in the browser, it's recommended to use a proxy server to avoid
   * exposing the credentials in the client's environment.
   *
   * By default it tries to use the `FAL_KEY` environment variable, when
   * `process.env` is defined.
   *
   * @see https://fal.ai/docs/model-endpoints/server-side
   * @see #suppressLocalCredentialsWarning
   */
  credentials?: undefined | string | CredentialsResolver;
  /**
   * Suppresses the warning when the fal credentials are exposed in the
   * browser's environment. Make sure you understand the security implications
   * before enabling this option.
   */
  suppressLocalCredentialsWarning?: boolean;
  /**
   * The proxy server to use for the client requests. The proxy server should
   * forward the requests to the fal api.
   *
   * Pass a `string` for the common browser-only case — the middleware rewrites
   * requests to this URL when a DOM `window` is available and does nothing
   * otherwise (the default, recommended for standard web apps).
   *
   * Pass a {@link ProxyUrlConfig} object to opt into non-browser runtimes
   * (Electron, server, edge/worker, Bun, etc.) via the `when` gate.
   *
   * @example Browser-only (unchanged behavior):
   * ```ts
   * fal.config({ proxyUrl: "/api/fal/proxy" });
   * ```
   *
   * @example Always apply, regardless of runtime:
   * ```ts
   * fal.config({
   *   proxyUrl: { url: "/api/fal/proxy", when: "always" },
   * });
   * ```
   *
   * @example Custom predicate (e.g. Electron renderer only):
   * ```ts
   * fal.config({
   *   proxyUrl: {
   *     url: "/api/fal/proxy",
   *     when: ({ isBrowser }) => isBrowser || process.type === "renderer",
   *   },
   * });
   * ```
   */
  proxyUrl?: string | ProxyUrlConfig;
  /**
   * The request middleware to use for the client requests. By default it
   * doesn't apply any middleware.
   */
  requestMiddleware?: RequestMiddleware;
  /**
   * The response handler to use for the client requests. By default it uses
   * a built-in response handler that returns the JSON response.
   */
  responseHandler?: ResponseHandler<any>;
  /**
   * The fetch implementation to use for the client requests. By default it uses
   * the global `fetch` function.
   */
  fetch?: FetchType;
  /**
   * Retry configuration for handling transient errors like rate limiting and server errors.
   * When not specified, a default retry configuration is used.
   */
  retry?: Partial<RetryOptions>;
};

export type RequiredConfig = Required<Config>;

/**
 * Checks if the required FAL environment variables are set.
 *
 * @returns `true` if the required environment variables are set,
 * `false` otherwise.
 */
function hasEnvVariables(): boolean {
  return (
    typeof process !== "undefined" &&
    process.env &&
    (typeof process.env.FAL_KEY !== "undefined" ||
      (typeof process.env.FAL_KEY_ID !== "undefined" &&
        typeof process.env.FAL_KEY_SECRET !== "undefined"))
  );
}

export const credentialsFromEnv: CredentialsResolver = () => {
  if (!hasEnvVariables()) {
    return undefined;
  }

  if (typeof process.env.FAL_KEY !== "undefined") {
    return process.env.FAL_KEY;
  }

  return process.env.FAL_KEY_ID
    ? `${process.env.FAL_KEY_ID}:${process.env.FAL_KEY_SECRET}`
    : undefined;
};

const DEFAULT_CONFIG: Partial<Config> = {
  credentials: credentialsFromEnv,
  suppressLocalCredentialsWarning: false,
  requestMiddleware: (request) => Promise.resolve(request),
  responseHandler: defaultResponseHandler,
  retry: DEFAULT_RETRY_OPTIONS,
};

/**
 * Configures the fal client.
 *
 * @param config the new configuration.
 */
export function createConfig(config: Config): RequiredConfig {
  let configuration = {
    ...DEFAULT_CONFIG,
    ...config,
    fetch: config.fetch ?? resolveDefaultFetch(),
    // Merge retry configuration with defaults
    retry: {
      ...DEFAULT_RETRY_OPTIONS,
      ...(config.retry || {}),
    },
  } as RequiredConfig;
  if (config.proxyUrl) {
    const proxy =
      typeof config.proxyUrl === "string"
        ? { url: config.proxyUrl }
        : config.proxyUrl;
    configuration = {
      ...configuration,
      requestMiddleware: withMiddleware(
        configuration.requestMiddleware,
        withProxy({ targetUrl: proxy.url, when: proxy.when }),
      ),
    };
  }
  const { credentials: resolveCredentials, suppressLocalCredentialsWarning } =
    configuration;
  const credentials =
    typeof resolveCredentials === "function"
      ? resolveCredentials()
      : resolveCredentials;
  if (isBrowser() && credentials && !suppressLocalCredentialsWarning) {
    console.warn(
      "The fal credentials are exposed in the browser's environment. " +
        "That's not recommended for production use cases.",
    );
  }
  return configuration;
}

/**
 * @returns the URL of the fal REST api endpoint.
 */
export function getRestApiUrl(): string {
  return "https://rest.fal.ai";
}
