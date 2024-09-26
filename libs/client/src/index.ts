import { createFalClient, type FalClient } from "./client";
import { Config, createConfig, type RequiredConfig } from "./config";
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
  let currentConfig: RequiredConfig = createConfig({});
  let currentInstance: FalClient = createFalClient(currentConfig);
  return {
    config(config: Config) {
      currentConfig = createConfig(config);
      currentInstance = createFalClient(currentConfig);
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
    run<Input, Output>(id: string, options: RunOptions<Input>) {
      return currentInstance.run<Input, Output>(id, options);
    },
    subscribe<Input, Output>(endpointId: string, options: RunOptions<Input>) {
      return currentInstance.subscribe<Input, Output>(endpointId, options);
    },
    stream<Input, Output>(endpointId, options) {
      return currentInstance.stream<Input, Output>(endpointId, options);
    },
  } satisfies SingletonFalClient;
})();
