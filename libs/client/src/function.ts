import { getConfig } from './config';
import { getUserAgent, isBrowser } from './runtime';
import { EnqueueResult, QueueStatus } from './types';
import { isUUIDv4, isValidUrl } from './utils';

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
  readonly method?: 'get' | 'post' | 'put' | 'delete' | string;
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
  const path = (options.path ?? '').replace(/^\//, '').replace(/\/{2,}/, '/');
  const params =
    method === 'get' ? new URLSearchParams(options.input ?? {}) : undefined;
  // TODO: change to params.size once it's officially supported
  const queryParams = params && params['size'] ? `?${params.toString()}` : '';
  const parts = id.split('/');

  // if a fal.ai url is passed, just use it
  if (isValidUrl(id)) {
    const url = id.endsWith('/') ? id : `${id}/`;
    return `${url}${path}${queryParams}`;
  }

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
  const userAgent = isBrowser() ? {} : { 'User-Agent': getUserAgent() };
  const { keyId, keySecret } =
    typeof credentials === 'function' ? credentials() : credentials;

  const { url, headers } = await requestMiddleware({
    url: buildUrl(id, options),
  });
  const authHeader =
    keyId && keySecret ? { Authorization: `Key ${keyId}:${keySecret}` } : {};
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
    mode: 'same-origin',
    credentials: 'same-origin',
    body:
      method !== 'get' && options.input
        ? JSON.stringify(options.input)
        : undefined,
  });
  return await responseHandler(response);
}

type QueueSubscribeOptions = {
  pollInterval?: number;
  onEnqueue?: (requestId: string) => void;
  onQueueUpdate?: (status: QueueStatus) => void;
};

interface Queue {
  submit<Input>(id: string, options: RunOptions<Input>): Promise<EnqueueResult>;
  status(id: string, requestId: string): Promise<QueueStatus>;
  result<Output>(id: string, requestId: string): Promise<Output>;
  subscribe<Input, Output>(
    id: string,
    options: RunOptions<Input> & QueueSubscribeOptions
  ): Promise<Output>;
}

/**
 * The fal run queue module. It allows to submit a function to the queue and get its result
 * on a separate call. This is useful for long running functions that can be executed
 * asynchronously and not .
 */
export const queue: Queue = {
  async submit<Input>(
    id: string,
    options: RunOptions<Input>
  ): Promise<EnqueueResult> {
    return run(id, { ...options, method: 'post', path: '/fal/queue/submit/' });
  },
  async status(id: string, requestId: string): Promise<QueueStatus> {
    return run(id, {
      method: 'get',
      path: `/fal/queue/requests/${requestId}/status`,
    });
  },
  async result<Output>(id: string, requestId: string): Promise<Output> {
    return run(id, {
      method: 'get',
      path: `/fal/queue/requests/${requestId}/response`,
    });
  },
  async subscribe<Input, Output>(
    id: string,
    options: RunOptions<Input> & QueueSubscribeOptions = {}
  ): Promise<Output> {
    const { request_id: requestId } = await queue.submit(id, options);
    if (options.onEnqueue) {
      options.onEnqueue(requestId);
    }
    return new Promise<Output>((resolve, reject) => {
      let timeoutId: ReturnType<typeof setTimeout>;
      const pollInterval = options.pollInterval ?? 1000;
      const poll = async () => {
        try {
          const requestStatus = await queue.status(id, requestId);
          if (options.onQueueUpdate) {
            options.onQueueUpdate(requestStatus);
          }
          if (requestStatus.status === 'COMPLETED') {
            clearTimeout(timeoutId);
            try {
              const result = await queue.result<Output>(id, requestId);
              resolve(result);
            } catch (error) {
              reject(error);
            }
            return;
          }
          timeoutId = setTimeout(poll, pollInterval);
        } catch (error) {
          clearTimeout(timeoutId);
          reject(error);
        }
      };
      timeoutId = setTimeout(poll, pollInterval);
    });
  },
};
