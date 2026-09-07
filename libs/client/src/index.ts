import { createFalClient, type FalClient } from "./client";
import { Config } from "./config";
import { StreamOptions } from "./streaming";
import { EndpointType, InputType } from "./types/client";
import { RunOptions } from "./types/common";

export type { TokenProvider } from "./auth";
export { createFalClient, type FalClient } from "./client";
export type { ProxyUrlConfig } from "./config";
export { withMiddleware, withProxy } from "./middleware";
export type {
  ProxyRuntimeEnv,
  ProxyRuntimeGate,
  RequestMiddleware,
  RequestProxyConfig,
} from "./middleware";
export type { QueueClient } from "./queue";
export type { RealtimeClient } from "./realtime";
export { ApiError, ValidationError } from "./response";
export type { ResponseHandler } from "./response";
export { isRetryableError } from "./retry";
export type { RetryOptions } from "./retry";
export type {
  StorageACL,
  StorageACLRule,
  StorageClient,
  StorageSettings,
} from "./storage";
export type { FalStream, StreamingClient } from "./streaming";
export type { OutputType } from "./types/client";
export * from "./types/common";
export type {
  QueueStatus,
  ValidationErrorInfo,
  WebHookResponse,
} from "./types/common";
export { parseEndpointId } from "./utils";

/**
 * The registry of known fal endpoints, mapping an endpoint id to its input and
 * output types.
 *
 * This interface is intentionally empty. The client ships no endpoint types of
 * its own, which keeps it small. Install
 * [`@fal-ai/types`](https://www.npmjs.com/package/@fal-ai/types) and import it
 * once anywhere in your project to populate it:
 *
 * ```ts
 * import "@fal-ai/types";
 * ```
 *
 * With the registry populated, {@link FalClient.run}, {@link FalClient.subscribe}
 * and {@link FalClient.stream} type their input and result per endpoint, and
 * endpoint ids autocomplete. Without it, endpoint ids accept any string and the
 * input and output fall back to `Record<string, any>` and `any`.
 *
 * Two constraints keep this working, both load-bearing:
 *
 * 1. It must stay an `interface`. Declaration merging, which is how
 *    `@fal-ai/types` extends it, does not apply to type aliases.
 * 2. It must be declared here in the entry point, not re-exported from another
 *    module. An augmentation of `"@fal-ai/client"` can only merge with a
 *    declaration that lives in the module the specifier resolves to.
 *
 * @see https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EndpointTypeMap {}

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
      currentInstance = createFalClient(config);
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
    run<Id extends EndpointType>(id: Id, options: RunOptions<InputType<Id>>) {
      return currentInstance.run<Id>(id, options);
    },
    subscribe<Id extends EndpointType>(
      endpointId: Id,
      options: RunOptions<InputType<Id>>,
    ) {
      return currentInstance.subscribe<Id>(endpointId, options);
    },
    stream<Id extends EndpointType>(
      endpointId: Id,
      options: StreamOptions<InputType<Id>>,
    ) {
      return currentInstance.stream<Id>(endpointId, options);
    },
  } satisfies SingletonFalClient;
})();
