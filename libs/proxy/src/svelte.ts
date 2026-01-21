import { type RequestHandler } from "@sveltejs/kit";
import { ProxyConfig } from "./config";
import { fromHeaders, handleRequest, resolveApiKeyFromEnv } from "./index";

type RequestHandlerParams = Partial<ProxyConfig> & {
  /**
   * The credentials to use for the request. Usually comes from `$env/static/private`
   *
   * @deprecated Use `resolveFalAuth` in `ProxyConfig` instead.
   */
  credentials?: string | undefined;
};

/**
 * Creates the SvelteKit request handler for the fal.ai client proxy on App Router apps.
 * The passed credentials will be used to authenticate the request, if not provided the
 * environment variable `FAL_KEY` will be used.
 *
 * @param params the request handler parameters.
 * @returns the SvelteKit request handler.
 */
export const createRequestHandler = ({
  credentials,
  ...config
}: RequestHandlerParams = {}) => {
  const resolveApiKey = credentials
    ? () => Promise.resolve(credentials)
    : resolveApiKeyFromEnv;

  const handler: RequestHandler = async ({ request }) => {
    const responseHeaders = new Headers({
      "Content-Type": "application/json",
    });
    return await handleRequest(
      {
        id: "svelte-app-router",
        method: request.method,
        getRequestBody: async () => request.text(),
        getHeaders: () => fromHeaders(request.headers),
        getHeader: (name) => request.headers.get(name),
        sendHeader: (name, value) => (responseHeaders[name] = value),
        resolveApiKey,
        respondWith: (status, data) =>
          new Response(JSON.stringify(data), {
            status,
            headers: responseHeaders,
          }),
        sendResponse: async (res) => {
          return new Response(res.body, res);
        },
      },
      config,
    );
  };
  return {
    requestHandler: handler,
    GET: handler,
    POST: handler,
    PUT: handler,
  };
};
