/**
 * A request configuration object.
 *
 * **Note:** This is a simplified version of the `RequestConfig` type from the
 * `fetch` API. It contains only the properties that are relevant for the
 * `fal-serverless` client. It also works around the fact that the `fetch` API
 * `Request` does not support mutability, its clone method has critical limitations
 * to our use case.
 */
export type RequestConfig = {
  url: string;
  headers?: Record<string, string | string[]>;
};

export type RequestMiddleware = (
  request: RequestConfig
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
  return (config) =>
    middlewares.reduce(
      (configPromise, middleware) =>
        configPromise.then((req) => middleware(req)),
      Promise.resolve(config)
    );
}
