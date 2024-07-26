import { type RequestHandler } from '@sveltejs/kit';
import { fromHeaders, handleRequest, responsePassthrough } from './index';

type RequestHandlerParams = {
  /**
   * The credentials to use for the request. Usually comes from `$env/static/private`
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
}: RequestHandlerParams = {}) => {
  const handler: RequestHandler = async ({ request }) => {
    const FAL_KEY = credentials || process.env.FAL_KEY || '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const responseHeaders: Record<string, any> = {
      'Content-Type': 'application/json',
    };
    return await handleRequest({
      id: 'svelte-app-router',
      method: request.method,
      getRequestBody: async () => request.text(),
      getHeaders: () => fromHeaders(request.headers),
      getHeader: (name) => request.headers.get(name),
      sendHeader: (name, value) => (responseHeaders[name] = value),
      resolveApiKey: () => Promise.resolve(FAL_KEY),
      respondWith: (status, data) =>
        new Response(JSON.stringify(data), {
          status,
          headers: responseHeaders,
        }),
      sendResponse: responsePassthrough,
    });
  };
  return {
    requestHandler: handler,
    GET: handler,
    POST: handler,
    PUT: handler,
  };
};
