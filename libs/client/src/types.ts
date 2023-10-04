export type Result<T> = {
  result: T;
};

export type EnqueueResult = {
  request_id: string;
};

// export type QueueStatus = {
//   status: "IN_PROGRESS" | "COMPLETED";
//   queue: number;
// };

export type RequestLog = {
  message: string;
  level: 'STDERR' | 'STDOUT' | 'ERROR' | 'INFO' | 'WARN' | 'DEBUG';
  source: 'USER';
  timestamp: string; // Using string to represent date-time format, but you could also use 'Date' type if you're going to construct Date objects.
};

export type QueueStatus =
  | {
      status: 'IN_PROGRESS' | 'COMPLETED';
      response_url: string;
      logs: RequestLog[];
    }
  | {
      status: 'IN_QUEUE';
      queue_position: number;
      response_url: string;
    };

export function isQueueStatus(obj: any): obj is QueueStatus {
  return obj && obj.status && obj.response_url;
}

export type ValidationErrorInfo = {
  msg: string;
  loc: Array<string | number>;
  type: string;
};
