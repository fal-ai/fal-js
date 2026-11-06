import { RequiredConfig } from "./config";
import {
  buildTagsHeaders,
  buildTimeoutHeaders,
  QUEUE_PRIORITY_HEADER,
  RUNNER_HINT_HEADER,
} from "./headers";
import { buildUrl, dispatchRequest } from "./request";
import { resultResponseHandler } from "./response";
import { DEFAULT_RETRYABLE_STATUS_CODES, RetryOptions } from "./retry";
import { buildObjectLifecycleHeaders, StorageClient } from "./storage";
import { FalStream, StreamingConnectionMode } from "./streaming";
import { EndpointType, InputType, OutputType } from "./types/client";
import {
  CompletedQueueStatus,
  InQueueQueueStatus,
  QueueStatus,
  RequestLog,
  Result,
  RunOptions,
} from "./types/common";
import { parseEndpointId } from "./utils";

export type QueuePriority = "low" | "normal";
export type QueueStatusSubscriptionOptions = QueueStatusOptions &
  QueueModeOptions &
  Omit<QueueCommonSubscribeOptions, "onEnqueue" | "webhookUrl">;

type TimeoutId = ReturnType<typeof setTimeout> | undefined;

/**
 * Exponential backoff between queue status checks. All times are in milliseconds.
 * The delay starts at `initial` and grows by `multiplier` after each unfinished
 * check, capped at `maximum`. Each delay is varied by ±`jitter` and capped again.
 * Requires `0 < initial <= maximum < Infinity`, `multiplier >= 1` and `0 <= jitter <= 1`.
 */
export type PollBackoff = {
  initial?: number;
  multiplier?: number;
  maximum?: number;
  /** Fraction of random variation applied to each delay, e.g. `0.2` for ±20%. */
  jitter?: number;
};

const DEFAULT_POLL_BACKOFF: Required<PollBackoff> = {
  initial: 250,
  multiplier: 1.05,
  maximum: 10_000,
  jitter: 0.2,
};

export function resolvePollBackoff(
  backoff: PollBackoff | undefined,
): Required<PollBackoff> {
  // Per-field `??` so an explicitly undefined field still takes the default.
  const resolved = {
    initial: backoff?.initial ?? DEFAULT_POLL_BACKOFF.initial,
    multiplier: backoff?.multiplier ?? DEFAULT_POLL_BACKOFF.multiplier,
    maximum: backoff?.maximum ?? DEFAULT_POLL_BACKOFF.maximum,
    jitter: backoff?.jitter ?? DEFAULT_POLL_BACKOFF.jitter,
  };
  if (
    !(
      resolved.initial > 0 &&
      resolved.initial <= resolved.maximum &&
      Number.isFinite(resolved.maximum)
    )
  ) {
    throw new Error("pollBackoff requires 0 < initial <= maximum < Infinity");
  }
  if (!(resolved.multiplier >= 1)) {
    throw new Error("pollBackoff requires multiplier >= 1");
  }
  if (!(resolved.jitter >= 0 && resolved.jitter <= 1)) {
    throw new Error("pollBackoff requires 0 <= jitter <= 1");
  }
  return resolved;
}

export function* pollDelays(
  backoff: Required<PollBackoff>,
): Generator<number, never> {
  let base = backoff.initial;
  while (true) {
    const factor = 1 - backoff.jitter + Math.random() * 2 * backoff.jitter;
    yield Math.min(backoff.maximum, base * factor);
    base = Math.min(backoff.maximum, base * backoff.multiplier);
  }
}

type QueueModeOptions =
  | {
      mode?: "polling";
      /**
       * Fixed delay (in milliseconds) between status checks. If not provided,
       * the delay follows `pollBackoff`.
       *
       * This value is ignored if `mode` is set to `streaming`.
       */
      pollInterval?: number;
      /**
       * Exponential backoff between status checks. Defaults to an initial
       * delay of 250ms, growing by 1.05x per check with ±20% jitter, up to 10s.
       * Resets when the status changes.
       * Ignored when `pollInterval` is set or `mode` is `streaming`.
       */
      pollBackoff?: PollBackoff;
    }
  | {
      mode: "streaming";

      /**
       * The connection mode to use for streaming updates. It defaults to `server`.
       * Set to `client` if your server proxy doesn't support streaming.
       */
      connectionMode?: StreamingConnectionMode;
    };

type QueueCommonSubscribeOptions = {
  /**
   * The mode to use for subscribing to updates. It defaults to `polling`.
   * You can also use client-side streaming by setting it to `streaming`.
   *
   * **Note:** Streaming is currently experimental and once stable, it will
   * be the default mode.
   *
   * @see pollInterval, pollBackoff
   */
  mode?: "polling" | "streaming";

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

  /**
   * The timeout (in milliseconds) for the request. If the request is not
   * completed within this time, the subscription will be cancelled.
   *
   * Keep in mind that although the client resolves the function on a timeout,
   * and will try to cancel the request on the server, the server might not be
   * able to cancel the request if it's already running.
   *
   * Note: currently, the timeout is not enforced and the default is `undefined`.
   * This behavior might change in the future.
   */
  timeout?: number;

  /**
   * Server-side request timeout in seconds. Limits total time spent waiting
   * before processing starts (includes queue wait, retries, and routing).
   * Does not apply once the application begins processing.
   *
   * This will be sent as the `x-fal-request-start-timeout` header.
   */
  startTimeout?: number;

  /**
   * The URL to send a webhook notification to when the request is completed.
   * @see WebHookResponse
   */
  webhookUrl?: string;

  /**
   * The priority of the request. It defaults to `normal`.
   * This will be sent as the `x-fal-queue-priority` header.
   *
   * @see QueuePriority
   */
  priority?: QueuePriority;

  /**
   * Additional HTTP headers to include in the submit request.
   * Note: `priority`, `hint`, `startTimeout`, `tags`, and `objectLifecycle` will override the following headers:
   *  - `x-fal-queue-priority`
   *  - `x-fal-runner-hint`
   *  - `x-fal-request-start-timeout`
   *  - `x-fal-tags`
   *  - `x-fal-object-lifecycle-preference`
   */
  headers?: Record<string, string>;
};

/**
 * Options for subscribing to the request queue.
 */
export type QueueSubscribeOptions = QueueCommonSubscribeOptions &
  QueueModeOptions;

/**
 * Options for submitting a request to the queue.
 */
export type SubmitOptions<Input> = RunOptions<Input> & {
  /**
   * The URL to send a webhook notification to when the request is completed.
   * @see WebHookResponse
   */
  webhookUrl?: string;

  /**
   * The priority of the request. It defaults to `normal`.
   * This will be sent as the `x-fal-queue-priority` header.
   *
   * @see QueuePriority
   */
  priority?: QueuePriority;

  /**
   * A hint for the runner to use when processing the request.
   * This will be sent as the `x-fal-runner-hint` header.
   */
  hint?: string;

  /**
   * Server-side request timeout in seconds. Limits total time spent waiting
   * before processing starts (includes queue wait, retries, and routing).
   * Does not apply once the application begins processing.
   *
   * This will be sent as the `x-fal-request-start-timeout` header.
   */
  startTimeout?: number;

  /**
   * Additional HTTP headers to include in the submit request.
   *
   * Note: `priority`, `hint`, `startTimeout`, `tags`, and `objectLifecycle` will override the following headers:
   *  - `x-fal-queue-priority`
   *  - `x-fal-runner-hint`
   *  - `x-fal-request-start-timeout`
   *  - `x-fal-tags`
   *  - `x-fal-object-lifecycle-preference`
   */
  headers?: Record<string, string>;
};

type BaseQueueOptions = {
  /**
   * The unique identifier for the enqueued request.
   */
  requestId: string;

  /**
   * The signal to abort the request.
   */
  abortSignal?: AbortSignal;
};

export type QueueStatusOptions = BaseQueueOptions & {
  /**
   * If `true`, the response will include the logs for the request.
   * Defaults to `false`.
   */
  logs?: boolean;
};

export type QueueStatusStreamOptions = QueueStatusOptions & {
  /**
   * The connection mode to use for streaming updates. It defaults to `server`.
   * Set to `client` if your server proxy doesn't support streaming.
   */
  connectionMode?: StreamingConnectionMode;
};

// Queue operations benefit from more aggressive retry policies
const QUEUE_RETRY_CONFIG: Partial<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 60000,
  retryableStatusCodes: DEFAULT_RETRYABLE_STATUS_CODES,
};

// Status checking can be retried more aggressively since it's read-only
const QUEUE_STATUS_RETRY_CONFIG: Partial<RetryOptions> = {
  maxRetries: 5,
  baseDelay: 1000,
  maxDelay: 30000,
  retryableStatusCodes: [...DEFAULT_RETRYABLE_STATUS_CODES, 500],
};

/**
 * Represents a request queue with methods for submitting requests,
 * checking their status, retrieving results, and subscribing to updates.
 */
export interface QueueClient {
  /**
   * Submits a request to the queue.
   *
   * @param endpointId - The ID of the function web endpoint.
   * @param options - Options to configure how the request is run.
   * @returns A promise that resolves to the result of enqueuing the request.
   */
  submit<Id extends EndpointType>(
    endpointId: Id,
    options: SubmitOptions<InputType<Id>>,
  ): Promise<InQueueQueueStatus>;

  /**
   * Retrieves the status of a specific request in the queue.
   *
   * @param endpointId - The ID of the function web endpoint.
   * @param options - Options to configure how the request is run.
   * @returns A promise that resolves to the status of the request.
   */
  status(endpointId: string, options: QueueStatusOptions): Promise<QueueStatus>;

  /**
   * Subscribes to updates for a specific request in the queue using HTTP streaming events.
   *
   * @param endpointId - The ID of the function web endpoint.
   * @param options - Options to configure how the request is run and how updates are received.
   * @returns The streaming object that can be used to listen for updates.
   */
  streamStatus(
    endpointId: string,
    options: QueueStatusStreamOptions,
  ): Promise<FalStream<unknown, QueueStatus>>;

  /**
   * Subscribes to updates for a specific request in the queue using polling or streaming.
   * See `options.mode` for more details.
   *
   * @param endpointId - The ID of the function web endpoint.
   * @param options - Options to configure how the request is run and how updates are received.
   * @returns A promise that resolves to the final status of the request.
   */
  subscribeToStatus(
    endpointId: string,
    options: QueueStatusSubscriptionOptions,
  ): Promise<CompletedQueueStatus>;

  /**
   * Retrieves the result of a specific request from the queue.
   *
   * @param endpointId - The ID of the function web endpoint.
   * @param options - Options to configure how the request is run.
   * @returns A promise that resolves to the result of the request.
   */
  result<Id extends EndpointType>(
    endpointId: Id,
    options: BaseQueueOptions,
  ): Promise<Result<OutputType<Id>>>;

  /**
   * Cancels a request in the queue.
   *
   * @param endpointId - The ID of the function web endpoint.
   * @param options - Options to configure how the request
   * is run and how updates are received.
   * @returns A promise that resolves once the request is cancelled.
   * @throws {Error} If the request cannot be cancelled.
   */
  cancel(endpointId: string, options: BaseQueueOptions): Promise<void>;
}

type QueueClientDependencies = {
  config: RequiredConfig;
  storage: StorageClient;
};

export const createQueueClient = ({
  config,
  storage,
}: QueueClientDependencies): QueueClient => {
  const ref: QueueClient = {
    async submit<Input>(
      endpointId: string,
      options: SubmitOptions<Input>,
    ): Promise<InQueueQueueStatus> {
      const {
        webhookUrl,
        priority,
        hint,
        startTimeout,
        tags,
        headers,
        storageSettings,
        ...runOptions
      } = options;
      const input = options.input
        ? await storage.transformInput(options.input)
        : undefined;
      const extraHeaders = Object.fromEntries(
        Object.entries(headers ?? {}).map(([key, value]) => [
          key.toLowerCase(),
          value,
        ]),
      );
      return dispatchRequest<Input, InQueueQueueStatus>({
        method: options.method,
        targetUrl: buildUrl(endpointId, {
          ...runOptions,
          subdomain: "queue",
          query: webhookUrl ? { fal_webhook: webhookUrl } : undefined,
        }),
        headers: {
          ...extraHeaders,
          ...buildObjectLifecycleHeaders(storageSettings),
          [QUEUE_PRIORITY_HEADER]: priority ?? "normal",
          ...(hint && { [RUNNER_HINT_HEADER]: hint }),
          ...buildTimeoutHeaders(startTimeout),
          ...buildTagsHeaders(tags),
        },
        input: input as Input,
        config,
        options: {
          signal: options.abortSignal,
          retry: QUEUE_RETRY_CONFIG,
        },
      });
    },
    async status(
      endpointId: string,
      { requestId, logs = false, abortSignal }: QueueStatusOptions,
    ): Promise<QueueStatus> {
      const appId = parseEndpointId(endpointId);
      const prefix = appId.namespace ? `${appId.namespace}/` : "";
      return dispatchRequest<unknown, QueueStatus>({
        method: "get",
        targetUrl: buildUrl(`${prefix}${appId.owner}/${appId.alias}`, {
          subdomain: "queue",
          query: { logs: logs ? "1" : "0" },
          path: `/requests/${requestId}/status`,
        }),
        config,
        options: {
          signal: abortSignal,
          retry: QUEUE_STATUS_RETRY_CONFIG,
        },
      });
    },

    async streamStatus(
      endpointId: string,
      { requestId, logs = false, connectionMode }: QueueStatusStreamOptions,
    ): Promise<FalStream<unknown, QueueStatus>> {
      const appId = parseEndpointId(endpointId);
      const prefix = appId.namespace ? `${appId.namespace}/` : "";

      const queryParams = {
        logs: logs ? "1" : "0",
      };

      const url = buildUrl(`${prefix}${appId.owner}/${appId.alias}`, {
        subdomain: "queue",
        path: `/requests/${requestId}/status/stream`,
        query: queryParams,
      });

      return new FalStream<unknown, QueueStatus>(endpointId, config, {
        url,
        method: "get",
        connectionMode,
        queryParams,
      });
    },

    async subscribeToStatus(
      endpointId,
      options,
    ): Promise<CompletedQueueStatus> {
      const requestId = options.requestId;
      const timeout = options.timeout;
      let timeoutId: TimeoutId = undefined;

      const handleCancelError = () => {
        // Ignore errors as the client will follow through with the timeout
        // regardless of the server response. In case cancelation fails, we
        // still want to reject the promise and consider the client call canceled.
      };
      if (options.mode === "streaming") {
        const status = await ref.streamStatus(endpointId, {
          requestId,
          logs: options.logs,
          connectionMode:
            "connectionMode" in options
              ? (options.connectionMode as StreamingConnectionMode)
              : undefined,
        });
        const logs: RequestLog[] = [];
        if (timeout) {
          timeoutId = setTimeout(() => {
            status.abort();
            ref.cancel(endpointId, { requestId }).catch(handleCancelError);
            // TODO this error cannot bubble up to the user since it's thrown in
            // a closure in the global scope due to setTimeout behavior.
            // User will get a platform error instead. We should find a way to
            // make this behavior aligned with polling.
            throw new Error(
              `Client timed out waiting for the request to complete after ${timeout}ms`,
            );
          }, timeout);
        }
        status.on("data", (data: QueueStatus) => {
          if (options.onQueueUpdate) {
            // accumulate logs to match previous polling behavior
            if (
              "logs" in data &&
              Array.isArray(data.logs) &&
              data.logs.length > 0
            ) {
              logs.push(...data.logs);
            }
            options.onQueueUpdate("logs" in data ? { ...data, logs } : data);
          }
        });
        const doneStatus = await status.done();
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        return doneStatus as CompletedQueueStatus;
      }
      // default to polling until status streaming is stable and faster
      return new Promise<CompletedQueueStatus>((resolve, reject) => {
        let pollingTimeoutId: TimeoutId;
        let settled = false;
        const pollInterval =
          "pollInterval" in options && typeof options.pollInterval === "number"
            ? options.pollInterval
            : undefined;
        let nextDelay: (status: QueueStatus["status"]) => number;
        if (pollInterval !== undefined) {
          nextDelay = () => pollInterval;
        } else {
          try {
            const backoff = resolvePollBackoff(
              "pollBackoff" in options ? options.pollBackoff : undefined,
            );
            let delays = pollDelays(backoff);
            let previousStatus: QueueStatus["status"] | undefined;
            nextDelay = (status) => {
              // Don't let a long queue wait slow completion detection once running.
              // Completed resolves before this is called, without another sleep.
              if (status !== previousStatus) {
                delays = pollDelays(backoff);
              }
              previousStatus = status;
              return delays.next().value;
            };
          } catch (error) {
            reject(error);
            return;
          }
        }

        const clearScheduledTasks = () => {
          settled = true;
          options.abortSignal?.removeEventListener("abort", handleAbort);
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          if (pollingTimeoutId) {
            clearTimeout(pollingTimeoutId);
          }
        };
        const handleAbort = () => {
          clearScheduledTasks();
          const reason = options.abortSignal?.reason;
          reject(
            reason === undefined
              ? new DOMException("Status polling aborted", "AbortError")
              : reason,
          );
        };
        if (options.abortSignal?.aborted) {
          handleAbort();
          return;
        }
        options.abortSignal?.addEventListener("abort", handleAbort, { once: true });
        if (timeout) {
          timeoutId = setTimeout(() => {
            clearScheduledTasks();
            ref.cancel(endpointId, { requestId }).catch(handleCancelError);
            reject(
              new Error(
                `Client timed out waiting for the request to complete after ${timeout}ms`,
              ),
            );
          }, timeout);
        }
        const poll = async () => {
          try {
            const requestStatus = await ref.status(endpointId, {
              requestId,
              logs: options.logs ?? false,
              abortSignal: options.abortSignal,
            });
            if (settled) {
              return;
            }
            if (options.onQueueUpdate) {
              options.onQueueUpdate(requestStatus);
            }
            // onQueueUpdate may abort synchronously; don't schedule another poll after that.
            if (settled) {
              return;
            }
            if (requestStatus.status === "COMPLETED") {
              clearScheduledTasks();
              resolve(requestStatus);
              return;
            }
            pollingTimeoutId = setTimeout(poll, nextDelay(requestStatus.status));
          } catch (error) {
            clearScheduledTasks();
            reject(error);
          }
        };
        poll().catch(reject);
      });
    },

    async result<Output>(
      endpointId: string,
      { requestId, abortSignal }: BaseQueueOptions,
    ): Promise<Result<Output>> {
      const appId = parseEndpointId(endpointId);
      const prefix = appId.namespace ? `${appId.namespace}/` : "";
      return dispatchRequest<unknown, Result<Output>>({
        method: "get",
        targetUrl: buildUrl(`${prefix}${appId.owner}/${appId.alias}`, {
          subdomain: "queue",
          path: `/requests/${requestId}`,
        }),
        config: {
          ...config,
          responseHandler: resultResponseHandler,
        },
        options: {
          signal: abortSignal,
          retry: QUEUE_RETRY_CONFIG,
        },
      });
    },

    async cancel(
      endpointId: string,
      { requestId, abortSignal }: BaseQueueOptions,
    ): Promise<void> {
      const appId = parseEndpointId(endpointId);
      const prefix = appId.namespace ? `${appId.namespace}/` : "";
      await dispatchRequest<unknown, void>({
        method: "put",
        targetUrl: buildUrl(`${prefix}${appId.owner}/${appId.alias}`, {
          subdomain: "queue",
          path: `/requests/${requestId}/cancel`,
        }),
        config,
        options: {
          signal: abortSignal,
        },
      });
    },
  };
  return ref;
};
