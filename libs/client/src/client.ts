import { Config, createConfig } from "./config";
import { createQueueClient, QueueClient, QueueSubscribeOptions } from "./queue";
import { createRealtimeClient, RealtimeClient } from "./realtime";
import { buildUrl, dispatchRequest } from "./request";
import { resultResponseHandler } from "./response";
import { createStorageClient, StorageClient } from "./storage";
import { createStreamingClient, StreamingClient } from "./streaming";
import { Result, RunOptions } from "./types";

/**
 * The main client type, it provides access to simple API model usage,
 * as well as access to the `queue` and `storage` APIs.
 *
 * @see createFalClient
 */
export interface FalClient {
  /**
   * The queue client to interact with the queue API.
   */
  readonly queue: QueueClient;

  /**
   * The realtime client to interact with the realtime API
   * and receive updates in real-time.
   * @see #RealtimeClient
   * @see #RealtimeClient.connect
   */
  readonly realtime: RealtimeClient;

  /**
   * The storage client to interact with the storage API.
   */
  readonly storage: StorageClient;

  /**
   * The streaming client to interact with the streaming API.
   * @see #stream
   */
  readonly streaming: StreamingClient;

  /**
   * Runs a fal serverless function identified by its `id`.
   *
   * @param id the registered function revision id or alias.
   * @returns the remote function output
   */
  run<Output = any, Input = Record<string, any>>(
    id: string,
    options: RunOptions<Input>,
  ): Promise<Result<Output>>;

  /**
   * Subscribes to updates for a specific request in the queue.
   *
   * @param endpointId - The ID of the function web endpoint.
   * @param options - Options to configure how the request is run and how updates are received.
   * @returns A promise that resolves to the result of the request once it's completed.
   */
  subscribe<Output = any, Input = Record<string, any>>(
    endpointId: string,
    options: RunOptions<Input> & QueueSubscribeOptions,
  ): Promise<Result<Output>>;

  /**
   * Calls a fal app that supports streaming and provides a streaming-capable
   * object as a result, that can be used to get partial results through either
   * `AsyncIterator` or through an event listener.
   *
   * @param endpointId the endpoint id, e.g. `fal-ai/llavav15-13b`.
   * @param options the request options, including the input payload.
   * @returns the `FalStream` instance.
   */
  stream: StreamingClient["stream"];
}

/**
 * Creates a new reference of the `FalClient`.
 * @param userConfig Optional configuration to override the default settings.
 * @returns a new instance of the `FalClient`.
 */
export function createFalClient(userConfig: Config = {}): FalClient {
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
    async run<Output, Input>(
      id: string,
      options: RunOptions<Input> = {},
    ): Promise<Result<Output>> {
      const input = options.input
        ? await storage.transformInput(options.input)
        : undefined;
      return dispatchRequest<Input, Result<Output>>({
        method: options.method,
        targetUrl: buildUrl(id, options),
        input: input as Input,
        config: {
          ...config,
          responseHandler: resultResponseHandler,
        },
      });
    },
    async subscribe<Output, Input>(
      endpointId: string,
      options: RunOptions<Input> & QueueSubscribeOptions = {},
    ): Promise<Result<Output>> {
      const { request_id: requestId } = await queue.submit(endpointId, options);
      if (options.onEnqueue) {
        options.onEnqueue(requestId);
      }
      await queue.subscribeToStatus(endpointId, { requestId, ...options });
      return queue.result(endpointId, { requestId });
    },
  };
}
