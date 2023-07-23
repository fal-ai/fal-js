import fetch, { Request } from 'cross-fetch';
import { getConfig } from './config';
import { getUserAgent, isBrowser } from './runtime';
import { isUUIDv4 } from './utils';

/**
 * The function input and other configuration when running
 * the function, such as the HTTP method to use.
 */
type RunOptions<Input> = {
  /**
   * The path to the function, if any. Defaults to `/`.
   */
  readonly path?: string;

  /**
   * The function input. It will be submitted either as query params
   * or the body payload, depending on the `method`.
   */
  readonly input?: Input;

  /**
   * The HTTP method, defaults to `post`;
   */
  readonly method?: 'get' | 'post' | 'put' | 'delete';
};

/**
 * Builds the final url to run the function based on its `id` or alias and
 * a the options from `RunOptions<Input>`.
 *
 * @private
 * @param id the function id or alias
 * @param options the run options
 * @returns the final url to run the function
 */
export function buildUrl<Input>(
  id: string,
  options: RunOptions<Input> = {}
): string {
  const { host } = getConfig();
  const method = (options.method ?? 'post').toLowerCase();
  const path = options.path ?? '';
  const params =
    method === 'get' ? new URLSearchParams(options.input ?? {}) : undefined;
  let queryParams = '';
  if (params) {
    queryParams = `?${params.toString()}`;
  }
  const parts = id.split('/');
  if (parts.length === 2 && isUUIDv4(parts[1])) {
    return `https://${host}/trigger/${id}/${path}${queryParams}`;
  }
  return `https://${id}.${host}/${path}${queryParams}`;
}

/**
 * Runs a fal serverless function identified by its `id`.
 * TODO: expand documentation and provide examples
 *
 * @param id the registered function revision id or alias.
 * @returns the remote function output
 */
export async function run<Input, Output>(
  id: string,
  options: RunOptions<Input> = {}
): Promise<Output> {
  const { credentials, requestMiddleware, responseHandler } = getConfig();
  const method = (options.method ?? 'post').toLowerCase();
  const userAgent = isBrowser ? {} : { 'User-Agent': getUserAgent() };
  const { keyId, keySecret } =
    typeof credentials === 'function' ? credentials() : credentials;

  const { url, headers } = await requestMiddleware({
    url: buildUrl(id, options),
  });
  const authHeader =
    keyId && keySecret ? { Authorization: `Basic ${keyId}:${keySecret}` } : {};
  const request = new Request(url, {
    method,
    headers: {
      ...authHeader,
      'Content-Type': 'application/json',
      ...userAgent,
      ...(headers ?? {}),
    },
    mode: 'cors',
    body:
      method !== 'get' && options.input
        ? JSON.stringify(options.input)
        : undefined,
  });
  const response = await fetch(request);
  return responseHandler(response);
}
