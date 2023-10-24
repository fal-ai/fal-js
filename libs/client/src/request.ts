import { getConfig } from './config';
import { getUserAgent, isBrowser } from './runtime';

export async function dispatchRequest<Input, Output>(
  method: string,
  targetUrl: string,
  input: Input
): Promise<Output> {
  const {
    credentials: credentialsValue,
    requestMiddleware,
    responseHandler,
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
  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    mode: 'cors',
    body:
      method.toLowerCase() !== 'get' && input
        ? JSON.stringify(input)
        : undefined,
  });
  return await responseHandler(response);
}
