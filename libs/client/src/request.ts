import { getConfig } from './config';
import { ResponseHandler } from './response';
import { getUserAgent, isBrowser } from './runtime';

const isCloudflareWorkers =
  typeof navigator !== 'undefined' &&
  navigator?.userAgent === 'Cloudflare-Workers';

type RequestOptions = {
  responseHandler?: ResponseHandler<any>;
};

export async function dispatchRequest<Input, Output>(
  method: string,
  targetUrl: string,
  input: Input,
  options: RequestOptions & RequestInit = {}
): Promise<Output> {
  const {
    credentials: credentialsValue,
    requestMiddleware,
    responseHandler,
    fetch,
  } = getConfig();
  const userAgent = isBrowser() ? {} : { 'User-Agent': getUserAgent() };
  const credentials =
    typeof credentialsValue === 'function'
      ? credentialsValue()
      : credentialsValue;

  const { url, headers } = await requestMiddleware({
    url: targetUrl,
  });
  const authHeader = credentials ? { Authorization: `Key ${credentials}` } : {};
  if (typeof window !== 'undefined' && credentials) {
    console.warn(
      "The fal credentials are exposed in the browser's environment. " +
        "That's not recommended for production use cases."
    );
  }
  const requestHeaders = {
    ...authHeader,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...userAgent,
    ...(headers ?? {}),
  } as HeadersInit;

  const { responseHandler: customResponseHandler, ...requestInit } = options;
  const response = await fetch(url, {
    ...requestInit,
    method,
    headers: {
      ...requestHeaders,
      ...(requestInit.headers ?? {}),
    },
    ...(!isCloudflareWorkers && { mode: 'cors' }),
    body:
      method.toLowerCase() !== 'get' && input
        ? JSON.stringify(input)
        : undefined,
  });
  const handleResponse = customResponseHandler ?? responseHandler;
  return await handleResponse(response);
}
