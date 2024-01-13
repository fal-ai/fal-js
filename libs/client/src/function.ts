import { dispatchRequest } from './request';
import { storageImpl } from './storage';
import { EnqueueResult, QueueStatus } from './types';
import { ensureAppIdFormat, isUUIDv4, isValidUrl } from './utils';

/**
 * The function input and other configuration when running
 * the function, such as the HTTP method to use.
 */
type RunOptions<Input> = {
  /**
   * The path to the function, if any. Defaults to ``.
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

  /**
   * If `true`, the function will automatically upload any files
   * (i.e. instances of `Blob`) or data:uri in the input.
   *
   * You can disable this behavior by setting it to `false`, which
   * is useful in cases where you want to upload the files yourself
   * or use small data:uri in the input.
   */
  readonly autoUpload?: boolean;
};

type ExtraOptions = {
  /**
   * If `true`, the function will use the queue to run the function
   * asynchronously and return the result in a separate call. This
   * influences how the URL is built.
   */
  readonly subdomain?: string;
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
  options: RunOptions<Input> & ExtraOptions = {}
): string {
  const method = (options.method ?? 'post').toLowerCase();
  const path = (options.path ?? '').replace(/^\//, '').replace(/\/{2,}/, '/');
  const input = options.input;
  const params =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    method === 'get' && input ? new URLSearchParams(input as any) : undefined;
  const queryParams = params ? `?${params.toString()}` : '';
  const parts = id.split('/');

  // if a fal url is passed, just use it
  if (isValidUrl(id)) {
    const url = id.endsWith('/') ? id : `${id}/`;
    return `${url}${path}${queryParams}`;
  }

  // TODO remove this after some time, fal.run should be preferred
  if (parts.length === 2 && isUUIDv4(parts[1])) {
    const host = 'gateway.shark.fal.ai';
    return `https://${host}/trigger/${id}/${path}${queryParams}`;
  }

  const appId = ensureAppIdFormat(id);
  const subdomain = options.subdomain ? `${options.subdomain}.` : '';
  const url = `https://${subdomain}fal.run/${appId}/${path}`;
  return `${url.replace(/\/$/, '')}${queryParams}`;
}

export async function send<Input, Output>(
  id: string,
  options: RunOptions<Input> & ExtraOptions = {}
): Promise<Output> {
  const input =
    options.input && options.autoUpload !== false
      ? await storageImpl.transformInput(options.input)
      : options.input;
  return dispatchRequest<Input, Output>(
    options.method ?? 'post',
    buildUrl(id, options),
    input as Input
  );
}

/**
 * Runs a fal serverless function identified by its `id`.
 *
 * @param id the registered function revision id or alias.
 * @returns the remote function output
 */
export async function run<Input, Output>(
  id: string,
  options: RunOptions<Input> = {}
): Promise<Output> {
  return send(id, options);
}

/**
 * Subscribes to updates for a specific request in the queue.
 *
 * @param id - The ID or URL of the function web endpoint.
 * @param options - Options to configure how the request is run and how updates are received.
 * @returns A promise that resolves to the result of the request once it's completed.
 */
export async function subscribe<Input, Output>(
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
        const requestStatus = await queue.status(id, {
          requestId,
          logs: options.logs ?? false,
        });
        if (options.onQueueUpdate) {
          options.onQueueUpdate(requestStatus);
        }
        if (requestStatus.status === 'COMPLETED') {
          clearTimeout(timeoutId);
          try {
            const result = await queue.result<Output>(id, { requestId });
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
    poll().catch(reject);
  });
}

/**
 * Options for subscribing to the request queue.
 */
type QueueSubscribeOptions = {
  /**
   * The interval (in milliseconds) at which to poll for updates.
   * If not provided, a default value of `1000` will be used.
   */
  pollInterval?: number;

  /**
   * Callback function that is called when a request is enqueued.
   * @param requestId - The unique identifier for the enqueued request.
   */
  onEnqueue?: (requestId: string) => void;

  /**
   * Callback function that is called when the status of the queue changes.
   * @param status - The current status of the queue.
   */
  onQueueUpdate?: (status: QueueStatus) => void;

  /**
   * If `true`, the response will include the logs for the request.
   * Defaults to `false`.
   */
  logs?: boolean;
};

/**
 * Options for submitting a request to the queue.
 */
type SubmitOptions<Input> = RunOptions<Input> & {
  /**
   * The URL to send a webhook notification to when the request is completed.
   * @see WebHookResponse
   */
  webhookUrl?: string;
};

type BaseQueueOptions = {
  /**
   * The unique identifier for the enqueued request.
   */
  requestId: string;
};

type QueueStatusOptions = BaseQueueOptions & {
  /**
   * If `true`, the response will include the logs for the request.
   * Defaults to `false`.
   */
  logs?: boolean;
};

/**
 * Represents a request queue with methods for submitting requests,
 * checking their status, retrieving results, and subscribing to updates.
 */
interface Queue {
  /**
   * Submits a request to the queue.
   *
   * @param id - The ID or URL of the function web endpoint.
   * @param options - Options to configure how the request is run.
   * @returns A promise that resolves to the result of enqueuing the request.
   */
  submit<Input>(
    id: string,
    options: SubmitOptions<Input>
  ): Promise<EnqueueResult>;

  /**
   * Retrieves the status of a specific request in the queue.
   *
   * @param id - The ID or URL of the function web endpoint.
   * @param options - Options to configure how the request is run.
   * @returns A promise that resolves to the status of the request.
   */
  status(id: string, options: QueueStatusOptions): Promise<QueueStatus>;

  /**
   * Retrieves the result of a specific request from the queue.
   *
   * @param id - The ID or URL of the function web endpoint.
   * @param options - Options to configure how the request is run.
   * @returns A promise that resolves to the result of the request.
   */
  result<Output>(id: string, options: BaseQueueOptions): Promise<Output>;

  /**
   * @deprecated Use `fal.subscribe` instead.
   */
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
    options: SubmitOptions<Input>
  ): Promise<EnqueueResult> {
    const { webhookUrl, path = '', ...runOptions } = options;
    const query = webhookUrl
      ? '?' + new URLSearchParams({ fal_webhook: webhookUrl }).toString()
      : '';
    return send(id, {
      ...runOptions,
      subdomain: 'queue',
      method: 'post',
      path: path + query,
    });
  },
  async status(
    id: string,
    { requestId, logs = false }: QueueStatusOptions
  ): Promise<QueueStatus> {
    return send(id, {
      subdomain: 'queue',
      method: 'get',
      path: `/requests/${requestId}/status`,
      input: {
        logs: logs ? '1' : '0',
      },
    });
  },
  async result<Output>(
    id: string,
    { requestId }: BaseQueueOptions
  ): Promise<Output> {
    return send(id, {
      subdomain: 'queue',
      method: 'get',
      path: `/requests/${requestId}`,
    });
  },
  subscribe,
};
