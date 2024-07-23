export type Result<T> = {
  result: T;
};

export type EnqueueResult = {
  request_id: string;
};

export type RequestLog = {
  message: string;
  level: 'STDERR' | 'STDOUT' | 'ERROR' | 'INFO' | 'WARN' | 'DEBUG';
  source: 'USER';
  timestamp: string; // Using string to represent date-time format, but you could also use 'Date' type if you're going to construct Date objects.
};

export type Metrics = {
  inference_time: number | null;
};

interface BaseQueueStatus {
  status: 'IN_PROGRESS' | 'COMPLETED' | 'IN_QUEUE';
}

export interface InProgressQueueStatus extends BaseQueueStatus {
  status: 'IN_PROGRESS';
  response_url: string;
  logs: RequestLog[];
}

export interface CompletedQueueStatus extends BaseQueueStatus {
  status: 'COMPLETED';
  response_url: string;
  logs: RequestLog[];
  metrics: Metrics;
}

export interface EnqueuedQueueStatus extends BaseQueueStatus {
  status: 'IN_QUEUE';
  queue_position: number;
  response_url: string;
}

export type QueueStatus =
  | InProgressQueueStatus
  | CompletedQueueStatus
  | EnqueuedQueueStatus;

export function isQueueStatus(obj: any): obj is QueueStatus {
  return obj && obj.status && obj.response_url;
}

export function isCompletedQueueStatus(obj: any): obj is CompletedQueueStatus {
  return isQueueStatus(obj) && obj.status === 'COMPLETED';
}

export type ValidationErrorInfo = {
  msg: string;
  loc: Array<string | number>;
  type: string;
};

/**
 * Represents the response from a WebHook request.
 * This is a union type that varies based on the `status` property.
 *
 * @template Payload - The type of the payload in the response. It defaults to `any`,
 * allowing for flexibility in specifying the structure of the payload.
 */
export type WebHookResponse<Payload = any> =
  | {
      /** Indicates a successful response. */
      status: 'OK';
      /** The payload of the response, structure determined by the Payload type. */
      payload: Payload;
      /** Error is never present in a successful response. */
      error: never;
      /** The unique identifier for the request. */
      request_id: string;
    }
  | {
      /** Indicates an unsuccessful response. */
      status: 'ERROR';
      /** The payload of the response, structure determined by the Payload type. */
      payload: Payload;
      /** Description of the error that occurred. */
      error: string;
      /** The unique identifier for the request. */
      request_id: string;
    };
