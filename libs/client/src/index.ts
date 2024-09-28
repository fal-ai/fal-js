import { createFalClient, type FalClient } from "./client";
import { Config, createConfig } from "./config";
import { StreamOptions } from "./streaming";
import { RunOptions } from "./types";

export { createFalClient, type FalClient } from "./client";
export { withMiddleware, withProxy } from "./middleware";
export type { RequestMiddleware } from "./middleware";
export type { QueueClient } from "./queue";
export type { RealtimeClient } from "./realtime";
export { ApiError, ValidationError } from "./response";
export type { ResponseHandler } from "./response";
export type { StorageClient } from "./storage";
export type { StreamingClient } from "./streaming";
export * from "./types";
export type {
  QueueStatus,
  ValidationErrorInfo,
  WebHookResponse,
} from "./types";
export { parseEndpointId } from "./utils";

type SingletonFalClient = {
  config(config: Config): void;
} & FalClient;

/**
 * Creates a singleton instance of the client. This is useful as a compatibility
 * layer for existing code that uses the clients version prior to 1.0.0.
 */
export const fal: SingletonFalClient = (function createSingletonFalClient() {
  let currentInstance: FalClient = createFalClient();
  return {
    config(config: Config) {
      console.log(config.requestMiddleware);
      currentInstance = createFalClient(createConfig(config));
    },
    get queue() {
      return currentInstance.queue;
    },
    get realtime() {
      return currentInstance.realtime;
    },
    get storage() {
      return currentInstance.storage;
    },
    get streaming() {
      return currentInstance.streaming;
    },
    run<Output, Input>(id: string, options: RunOptions<Input>) {
      return currentInstance.run<Output, Input>(id, options);
    },
    subscribe<Output, Input>(endpointId: string, options: RunOptions<Input>) {
      return currentInstance.subscribe<Output, Input>(endpointId, options);
    },
    stream<Output, Input>(endpointId: string, options: StreamOptions<Input>) {
      return currentInstance.stream<Output, Input>(endpointId, options);
    },
  } satisfies SingletonFalClient;
})();
