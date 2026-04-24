/**
 * A request configuration object.
 *
 * **Note:** This is a simplified version of the `RequestConfig` type from the
 * `fetch` API. It contains only the properties that are relevant for the
 * fal client. It also works around the fact that the `fetch` API `Request`
 * does not support mutability, its clone method has critical limitations
 * to our use case.
 */
export type RequestConfig = {
  url: string;
  method: string;
  headers?: Record<string, string | string[]>;
};

export type RequestMiddleware = (
  request: RequestConfig,
) => Promise<RequestConfig>;

/**
 * Setup a execution chain of middleware functions.
 *
 * @param middlewares one or more middleware functions.
 * @returns a middleware function that executes the given middlewares in order.
 */
export function withMiddleware(
  ...middlewares: RequestMiddleware[]
): RequestMiddleware {
  const isDefined = (middleware: RequestMiddleware): boolean =>
    typeof middleware === "function";

  return async (config: RequestConfig) => {
    let currentConfig = { ...config };
    for (const middleware of middlewares.filter(isDefined)) {
      currentConfig = await middleware(currentConfig);
    }
    return currentConfig;
  };
}

/**
 * Runtime information passed to a user-provided {@link ProxyRuntimeGate}
 * predicate so it can decide whether the proxy middleware should apply.
 */
export type ProxyRuntimeEnv = {
  isBrowser: boolean;
};

/**
 * Controls when the proxy middleware applies:
 * - `"browser"` — only when a DOM `window` is available (default).
 * - `"always"` — in every runtime (Node, Electron, Bun, workers, etc.).
 * - A predicate receiving {@link ProxyRuntimeEnv} — full control per call.
 */
export type ProxyRuntimeGate =
  | "browser"
  | "always"
  | ((env: ProxyRuntimeEnv) => boolean);

export type RequestProxyConfig = {
  targetUrl: string;
  when?: ProxyRuntimeGate;
};

export const TARGET_URL_HEADER = "x-fal-target-url";

function shouldProxy(when: ProxyRuntimeGate | undefined): boolean {
  const env: ProxyRuntimeEnv = {
    isBrowser:
      typeof window !== "undefined" && typeof window.document !== "undefined",
  };
  if (typeof when === "function") {
    return when(env);
  }
  if (when === "always") {
    return true;
  }
  return env.isBrowser;
}

export function withProxy(config: RequestProxyConfig): RequestMiddleware {
  return (requestConfig) => {
    // if x-fal-target-url is already set, we skip it to keep the middleware
    // re-entrant (e.g. when composed with other proxy-like middlewares)
    if (requestConfig.headers && TARGET_URL_HEADER in requestConfig.headers) {
      return Promise.resolve(requestConfig);
    }
    if (!shouldProxy(config.when)) {
      return Promise.resolve(requestConfig);
    }
    return Promise.resolve({
      ...requestConfig,
      url: config.targetUrl,
      headers: {
        ...(requestConfig.headers || {}),
        [TARGET_URL_HEADER]: requestConfig.url,
      },
    });
  };
}
