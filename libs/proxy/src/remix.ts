import type {
  ActionFunction,
  ActionFunctionArgs,
  LoaderFunction,
  LoaderFunctionArgs,
  json as jsonFunction,
} from "@remix-run/node";
import {
  fromHeaders,
  handleRequest,
  resolveApiKeyFromEnv,
  responsePassthrough,
} from "./index";

export type FalRemixProxy = {
  action: ActionFunction;
  loader: LoaderFunction;
};

export type FalRemixProxyOptions = {
  /**
   * The reference to the `json` function from the Remix runtime.
   * e.g. `import { json } from "@remix-run/node";`
   */
  json: typeof jsonFunction;
  /**
   * A function to resolve the API key used by the proxy.
   * By default, it uses the `FAL_KEY` environment variable.
   */
  resolveApiKey?: () => Promise<string | undefined>;
};

export function createProxy({
  json,
  resolveApiKey = resolveApiKeyFromEnv,
}: FalRemixProxyOptions): FalRemixProxy {
  const proxy = async ({
    request,
  }: ActionFunctionArgs | LoaderFunctionArgs) => {
    const responseHeaders = new Headers();
    return handleRequest({
      id: "remix",
      method: request.method,
      respondWith: (status, data) =>
        json(data, { status, headers: responseHeaders }),
      getHeaders: () => fromHeaders(request.headers),
      getHeader: (name) => request.headers.get(name),
      sendHeader: (name, value) => responseHeaders.set(name, value),
      getRequestBody: async () => JSON.stringify(await request.json()),
      sendResponse: responsePassthrough,
      resolveApiKey,
    });
  };
  return {
    action: proxy,
    loader: proxy,
  };
}
