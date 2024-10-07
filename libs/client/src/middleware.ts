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

export type RequestProxyConfig = {
  targetUrl: string;
};

export const TARGET_URL_HEADER = "x-fal-target-url";

export function withProxy(config: RequestProxyConfig): RequestMiddleware {
  const passthrough = (requestConfig: RequestConfig) =>
    Promise.resolve(requestConfig);
  // when running on the server, we don't need to proxy the request
  if (typeof window === "undefined") {
    return passthrough;
  }
  // if x-fal-target-url is already set, we skip it
  return (requestConfig) =>
    requestConfig.headers && TARGET_URL_HEADER in requestConfig
      ? passthrough(requestConfig)
      : Promise.resolve({
          ...requestConfig,
          url: config.targetUrl,
          headers: {
            ...(requestConfig.headers || {}),
            [TARGET_URL_HEADER]: requestConfig.url,
          },
        });
}
