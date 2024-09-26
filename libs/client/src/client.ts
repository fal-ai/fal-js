import { Config, createConfig } from "./config";
import { createQueueClient, QueueClient, QueueSubscribeOptions } from "./queue";
import { createRealtimeClient, RealtimeClient } from "./realtime";
import { buildUrl, dispatchRequest } from "./request";
import { createStorageClient, StorageClient } from "./storage";
import { createStreamingClient, StreamingClient } from "./streaming";
import { RunOptions } from "./types";

export interface FalClient {
  readonly queue: QueueClient;

  readonly realtime: RealtimeClient;

  readonly storage: StorageClient;

  readonly streaming: StreamingClient;

  /**
   * Runs a fal serverless function identified by its `id`.
   *
   * @param id the registered function revision id or alias.
   * @returns the remote function output
   */
  run<Input, Output>(id: string, options: RunOptions<Input>): Promise<Output>;

  /**
   * Subscribes to updates for a specific request in the queue.
   *
   * @param endpointId - The ID of the function web endpoint.
   * @param options - Options to configure how the request is run and how updates are received.
   * @returns A promise that resolves to the result of the request once it's completed.
   */
  subscribe<Input, Output>(
    endpointId: string,
    options: RunOptions<Input> & QueueSubscribeOptions,
  ): Promise<Output>;

  stream: StreamingClient["stream"];
}

export const createFalClient = (userConfig: Config = {}): FalClient => {
  const config = createConfig(userConfig);
  const storage = createStorageClient({ config });
  const queue = createQueueClient({ config, storage });
  const streaming = createStreamingClient({ config, storage });
  const realtime = createRealtimeClient({ config });
  return {
    queue,
    realtime,
    storage,
    streaming,
    stream: streaming.stream,
    async run<Input, Output>(
      id: string,
      options: RunOptions<Input> = {},
    ): Promise<Output> {
      const input = options.input
        ? await storage.transformInput(options.input)
        : undefined;
      return dispatchRequest<Input, Output>({
        method: options.method,
        targetUrl: buildUrl(id, options),
        input: input as Input,
        config,
      });
    },
    async subscribe<Input, Output>(
      endpointId: string,
      options: RunOptions<Input> & QueueSubscribeOptions = {},
    ): Promise<Output> {
      const { request_id: requestId } = await queue.submit(endpointId, options);
      if (options.onEnqueue) {
        options.onEnqueue(requestId);
      }
      await queue.subscribeToStatus(endpointId, { requestId, ...options });
      return queue.result(endpointId, { requestId });
    },
  };
};
