import fetch from 'cross-fetch';

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
  readonly input: Input;
};

export interface FunctionReference<Input, Output> {
  run(options: RunOptions<Input>): FunctionExecution<Output>;
}

export function koldstart<Id extends string, Input, Output>(
  id: Id
): FunctionReference<Input, Output> {
  const ref = {
    run(options) {
      // fetch()
      throw 'TODO: implement me';
    },
  } satisfies FunctionReference<Input, Output>;
  return ref;
}
