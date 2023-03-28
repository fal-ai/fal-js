import fetch from 'cross-fetch';
import { getConfig } from './config';
import { getUserAgent, isBrowser } from './runtime';

/**
 * An event contract for progress updates from the server function.
 */
export interface ProgressEvent<T> {
  readonly progress: number;
  readonly partialData: T | undefined;
}

/**
 * Represents a result of a remote Koldstart function call.
 *
 * The contract allows developers to not only get the function
 * result, but also track its progress and logs through event
 * listeners.
 *
 * This flexibility enables developers to define complex / long-running functions
 * but also simple ones with an unified developer experience.
 */
export interface FunctionExecution<T> {
  /**
   * Listens to `progress` events.
   *
   * @param event of type `progress`
   * @param handler the callback to handle in-progress data.
   */
  on(event: 'progress', handler: (info: ProgressEvent<T>) => void): void;

  /**
   * Listens to `cancel` events.
   *
   * @param event of type `cancel`.
   * @param handler the callback to handle the cancellation signal.
   */
  on(event: 'cancel', handler: () => void): void;

  /**
   * Listens to logging events.
   *
   * @param event of type `log`
   * @param handler the callback to handle the forwarded `log`
   */
  on(event: 'log', handler: (log: string) => void): void;

  /**
   * Signals to the server that the execution should be cancelled.
   * Once the server cancels the execution sucessfully, the `cancel`
   * event will be fired.
   *
   * @see #on(event:)
   */
  cancel(): Promise<void>;

  /**
   * Async function that represents the final result of the function call.
   *
   * ```ts
   * const image = await execution.result();
   * ```
   *
   * @returns Promise<T> the final result.
   * @throws in case the backing remote function raises an error.
   */
  result(): Promise<T>;
}

type RunOptions<Input> = {
  readonly input?: Input;
  readonly method?: 'get' | 'post' | 'put' | 'delete';
};

export interface FunctionReference<Input, Output> {
  run(options: RunOptions<Input>): Promise<Output>;
}

/**
 * Gets a reference to a fal serverless function.
 * TODO: expand the documentation with implementation details and example.
 *
 * @param id
 * @returns
 */
export function resolveFunction<Id extends string, Input, Output>(
  id: Id
): FunctionReference<Input, Output> {
  const { credentials, host } = getConfig();
  const ref = {
    async run(options) {
      const method = (options.method ?? 'post').toLowerCase();
      const params =
        method === 'get'
          ? new URLSearchParams(options.input ?? {}).toString()
          : '';
      const userAgent = isBrowser ? {} : { 'User-Agent': getUserAgent() };
      const response = await fetch(
        `${host}/trigger/${credentials.userId}/${id}${params}`,
        {
          method,
          headers: {
            'X-Koldstart-Key-Id': credentials.keyId,
            'X-Koldstart-Key-Secret': credentials.keySecret,
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...userAgent,
          },
          mode: 'cors',
          body:
            method !== 'get' && options.input
              ? JSON.stringify(options.input)
              : null,
        }
      );
      return await response.json();
    },
  } satisfies FunctionReference<Input, Output>;
  return ref;
}
