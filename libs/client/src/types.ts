export type Result<T> = {
  result: T;
};

export type EnqueueResult = {
  request_id: string;
};

export type QueueStatus<T> =
  | {
      status: 'in_progress';
      queue: number;
    }
  | {
      status: 'done';
      result: T;
    };
