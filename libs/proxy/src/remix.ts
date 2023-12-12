import { fromHeaders, handleRequest } from './index';
import type {
  ActionFunctionArgs,
  ActionFunction,
  LoaderFunctionArgs,
  LoaderFunction,
  json as jsonFunction,
} from '@remix-run/node';

export type FalRemixProxy = {
  action: ActionFunction;
  loader: LoaderFunction;
};

export type FalRemixProxyOptions = {
  json: typeof jsonFunction;
};

export function createProxy({ json }: FalRemixProxyOptions): FalRemixProxy {
  const proxy = async ({
    request,
  }: ActionFunctionArgs | LoaderFunctionArgs) => {
    const responseHeaders = new Headers();
    return handleRequest({
      id: 'remix',
      method: request.method,
      respondWith: (status, data) =>
        json(data, { status, headers: responseHeaders }),
      getHeaders: () => fromHeaders(request.headers),
      getHeader: (name) => request.headers.get(name),
      sendHeader: (name, value) => responseHeaders.set(name, value),
      getBody: async () => JSON.stringify(await request.json()),
    });
  };
  return {
    action: proxy,
    loader: proxy,
  };
}
