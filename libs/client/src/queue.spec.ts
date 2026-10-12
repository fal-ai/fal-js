import { createConfig, type RequiredConfig } from "./config";
import {
  createQueueClient,
  pollDelays,
  type PollBackoff,
  resolvePollBackoff,
  type QueueStatusSubscriptionOptions,
} from "./queue";
import type { StorageClient } from "./storage";

jest.mock("./request", () => {
  const actual = jest.requireActual("./request");
  return {
    ...actual,
    dispatchRequest: jest.fn(),
  };
});

import { dispatchRequest } from "./request";

describe("pollDelays", () => {
  const defaults: Required<PollBackoff> = {
    initial: 250,
    multiplier: 1.05,
    maximum: 30_000,
    jitter: 0.2,
  };
  const noJitter = { ...defaults, jitter: 0 };
  const take = (backoff: Required<PollBackoff>, count: number) => {
    const delays = pollDelays(backoff);
    return Array.from({ length: count }, () => delays.next().value);
  };

  it("grows from initial up to maximum", () => {
    const delays = take(noJitter, 1000);
    expect(delays.slice(0, 3)).toEqual([250, 262.5, 275.625]);
    expect(delays[999]).toBe(30_000);
  });

  it("keeps jitter within bounds", () => {
    const first = new Set(Array.from({ length: 100 }, () => take(defaults, 1)[0]));
    expect(first.size).toBeGreaterThan(1);
    for (const delay of first) {
      expect(delay).toBeGreaterThanOrEqual(200);
      expect(delay).toBeLessThanOrEqual(300);
    }
    for (const delay of take({ ...defaults, multiplier: 2 }, 100)) {
      expect(delay).toBeLessThanOrEqual(30_000);
    }
  });

  it("treats explicitly undefined fields as defaults", () => {
    expect(resolvePollBackoff({ initial: undefined, jitter: 0 })).toEqual(noJitter);
  });

  it.each([
    { initial: 0 },
    { initial: 40_000 },
    { maximum: Infinity },
    { multiplier: 0.9 },
    { jitter: 1.5 },
  ])(
    "rejects invalid parameters %o",
    (overrides) => {
      expect(() => resolvePollBackoff(overrides)).toThrow("pollBackoff requires");
    },
  );
});

describe("queue.subscribeToStatus polling", () => {
  const inQueue = { status: "IN_QUEUE", request_id: "req_123", queue_position: 1 };
  const completed = { status: "COMPLETED", request_id: "req_123" };
  const config = createConfig({ credentials: "test-key" });
  const storage: StorageClient = {
    upload: jest.fn(),
    transformInput: jest.fn(),
  };
  const dispatch = dispatchRequest as jest.Mock;
  let scheduled: jest.SpyInstance;

  type PollingOptions = Omit<
    Extract<QueueStatusSubscriptionOptions, { mode?: "polling" }>,
    "requestId"
  >;
  const subscribe = (options: PollingOptions = {}) =>
    createQueueClient({ config, storage }).subscribeToStatus("fal-ai/test", {
      requestId: "req_123",
      ...options,
    });
  const lastDelay = () => scheduled.mock.lastCall?.[1];
  // Lets the pending status request resolve while timers stay fake.
  const settle = () => new Promise(setImmediate);

  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ["setImmediate"] });
    dispatch.mockReset();
    scheduled = jest.spyOn(global, "setTimeout");
  });

  afterEach(() => {
    // Restore the setTimeout spy first so the fake clock can uninstall cleanly.
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it("backs off using pollBackoff", async () => {
    dispatch
      .mockResolvedValueOnce(inQueue)
      .mockResolvedValueOnce(inQueue)
      .mockResolvedValueOnce(completed);
    const onQueueUpdate = jest.fn();

    const result = subscribe({
      pollBackoff: { initial: 1000, multiplier: 2, jitter: 0 },
      onQueueUpdate,
    });
    await settle();
    expect(lastDelay()).toBe(1000);
    jest.runOnlyPendingTimers();
    await settle();
    expect(lastDelay()).toBe(2000);
    jest.runOnlyPendingTimers();

    await expect(result).resolves.toEqual(completed);
    expect(onQueueUpdate.mock.calls).toEqual([[inQueue], [inQueue], [completed]]);
  });

  it.each([undefined, 500])(
    "resets only on status changes with pollInterval %s",
    async (pollInterval) => {
      const statuses = [
        { ...inQueue, queue_position: 2 },
        inQueue,
        { status: "IN_PROGRESS", request_id: "req_123", logs: [] },
        {
          status: "IN_PROGRESS",
          request_id: "req_123",
          logs: [{ message: "working" }],
        },
        { ...inQueue, queue_position: 0 },
        { ...inQueue, queue_position: 0 },
        completed,
      ];
      for (const status of statuses) {
        dispatch.mockResolvedValueOnce(status);
      }
      const onQueueUpdate = jest.fn();
      const result = subscribe({
        pollInterval,
        pollBackoff: { initial: 1000, multiplier: 2, jitter: 0 },
        onQueueUpdate,
      });
      const expectedDelays =
        pollInterval === undefined
          ? [1000, 2000, 1000, 2000, 1000, 2000]
          : Array(6).fill(pollInterval);
      for (const delay of expectedDelays) {
        await settle();
        expect(lastDelay()).toBe(delay);
        jest.runOnlyPendingTimers();
      }

      await expect(result).resolves.toEqual(completed);
      expect(onQueueUpdate.mock.calls).toEqual(statuses.map((status) => [status]));
      expect(scheduled).toHaveBeenCalledTimes(6);
      expect(jest.getTimerCount()).toBe(0);
    },
  );

  it("uses a fixed pollInterval and ignores pollBackoff, even an invalid one", async () => {
    dispatch.mockResolvedValueOnce(inQueue).mockResolvedValueOnce(completed);

    const result = subscribe({ pollInterval: 500, pollBackoff: { initial: 0 } });
    await settle();
    expect(lastDelay()).toBe(500);
    jest.runOnlyPendingTimers();

    await expect(result).resolves.toEqual(completed);
  });

  it("rejects without polling when the signal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      subscribe({ abortSignal: controller.signal }),
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("rejects with the abort reason when aborted between polls and stops polling", async () => {
    const controller = new AbortController();
    const reason = new Error("stop polling");
    dispatch.mockResolvedValue(inQueue);

    const result = subscribe({
      abortSignal: controller.signal,
      timeout: 60_000,
    });
    await settle();
    controller.abort(reason);

    await expect(result).rejects.toBe(reason);
    expect(jest.getTimerCount()).toBe(0);
    jest.advanceTimersByTime(60_000);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it.each(["abort", "timeout"])(
    "ignores a status response that arrives after %s",
    async (termination) => {
      const controller = new AbortController();
      let respond: (value: unknown) => void = () => undefined;
      dispatch.mockImplementationOnce(
        () => new Promise((resolve) => (respond = resolve)),
      );
      const onQueueUpdate = jest.fn();

      const result = subscribe({
        abortSignal: controller.signal,
        timeout: 1000,
        onQueueUpdate,
      });
      if (termination === "abort") {
        controller.abort();
      } else {
        jest.advanceTimersByTime(1000);
      }
      await expect(result).rejects.toThrow();
      respond(inQueue);
      await settle();

      expect(onQueueUpdate).not.toHaveBeenCalled();
      expect(jest.getTimerCount()).toBe(0);
    },
  );

  it("does not schedule another poll when onQueueUpdate aborts", async () => {
    const controller = new AbortController();
    dispatch.mockResolvedValue(inQueue);

    await expect(
      subscribe({
        abortSignal: controller.signal,
        onQueueUpdate: () => controller.abort(),
      }),
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
  });

  it("clears the timeout when a status request fails", async () => {
    const error = new Error("status failed");
    dispatch.mockRejectedValue(error);

    await expect(subscribe({ timeout: 60_000 })).rejects.toBe(error);
    expect(jest.getTimerCount()).toBe(0);
  });
});

describe("queue.submit headers", () => {
  const config: RequiredConfig = createConfig({
    credentials: "test-key",
    // node test env has global fetch; rely on default resolver
  });

  const storage: StorageClient = {
    upload: jest.fn(),
    // passthrough transform to avoid touching files
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transformInput: async (input: any) => input,
  };

  beforeEach(() => {
    (dispatchRequest as jest.Mock).mockReset();
    (dispatchRequest as jest.Mock).mockResolvedValue({
      status: "IN_QUEUE",
      request_id: "req_123",
      response_url: "https://queue.fal.run/x/y/requests/req_123",
      status_url: "https://queue.fal.run/x/y/requests/req_123/status",
      cancel_url: "https://queue.fal.run/x/y/requests/req_123/cancel",
      queue_position: 0,
    });
  });

  it("merges user headers and overrides with priority and hint", async () => {
    const queue = createQueueClient({ config, storage });
    await queue.submit("fal-ai/fast-sdxl", {
      input: { prompt: "hello" },
      // user-provided headers that should be merged
      headers: {
        "x-custom": "abc",
        // these should be overridden by explicit options
        "x-fal-queue-priority": "normal",
        "x-fal-runner-hint": "old",
      },
      priority: "low",
      hint: "new-hint",
    });

    expect(dispatchRequest).toHaveBeenCalledTimes(1);
    const call = (dispatchRequest as jest.Mock).mock.calls[0][0];
    expect(call.headers).toEqual(
      expect.objectContaining({
        "x-custom": "abc",
        "x-fal-queue-priority": "low",
        "x-fal-runner-hint": "new-hint",
      }),
    );
  });

  it("sets default priority and omits hint when not provided", async () => {
    const queue = createQueueClient({ config, storage });
    await queue.submit("fal-ai/fast-sdxl", {
      input: { prompt: "hi" },
    });

    const call = (dispatchRequest as jest.Mock).mock.calls[0][0];
    expect(call.headers["x-fal-queue-priority"]).toBe("normal");
    expect(call.headers["x-fal-runner-hint"]).toBeUndefined();
  });

  it("includes startTimeout header when provided", async () => {
    const queue = createQueueClient({ config, storage });
    await queue.submit("fal-ai/fast-sdxl", {
      input: { prompt: "hi" },
      startTimeout: 30,
    });

    const call = (dispatchRequest as jest.Mock).mock.calls[0][0];
    expect(call.headers["x-fal-request-start-timeout"]).toBe("30");
  });

  it("omits startTimeout header when not provided", async () => {
    const queue = createQueueClient({ config, storage });
    await queue.submit("fal-ai/fast-sdxl", {
      input: { prompt: "hi" },
    });

    const call = (dispatchRequest as jest.Mock).mock.calls[0][0];
    expect(call.headers["x-fal-request-start-timeout"]).toBeUndefined();
  });

  it("startTimeout overrides user-provided x-fal-request-start-timeout header", async () => {
    const queue = createQueueClient({ config, storage });
    await queue.submit("fal-ai/fast-sdxl", {
      input: { prompt: "hi" },
      headers: {
        "x-fal-request-start-timeout": "10",
      },
      startTimeout: 60,
    });

    const call = (dispatchRequest as jest.Mock).mock.calls[0][0];
    expect(call.headers["x-fal-request-start-timeout"]).toBe("60");
  });

  it("includes the packed tags header when tags are provided", async () => {
    const queue = createQueueClient({ config, storage });
    await queue.submit("fal-ai/fast-sdxl", {
      input: { prompt: "hi" },
      tags: { team: "design", env: "prod" },
    });

    const call = (dispatchRequest as jest.Mock).mock.calls[0][0];
    expect(call.headers["x-fal-tags"]).toBe("team=design,env=prod");
  });

  it("omits the tags header when tags are not provided", async () => {
    const queue = createQueueClient({ config, storage });
    await queue.submit("fal-ai/fast-sdxl", {
      input: { prompt: "hi" },
    });

    const call = (dispatchRequest as jest.Mock).mock.calls[0][0];
    expect(call.headers["x-fal-tags"]).toBeUndefined();
  });

  it("tags override a user-provided x-fal-tags header", async () => {
    const queue = createQueueClient({ config, storage });
    await queue.submit("fal-ai/fast-sdxl", {
      input: { prompt: "hi" },
      headers: {
        "x-fal-tags": "team=old",
      },
      tags: { team: "design" },
    });

    const call = (dispatchRequest as jest.Mock).mock.calls[0][0];
    expect(call.headers["x-fal-tags"]).toBe("team=design");
  });

  it("throws error when startTimeout is <= 1 second", async () => {
    const queue = createQueueClient({ config, storage });
    await expect(
      queue.submit("fal-ai/fast-sdxl", {
        input: { prompt: "hi" },
        startTimeout: 1,
      }),
    ).rejects.toThrow("Timeout must be greater than 1 seconds");

    await expect(
      queue.submit("fal-ai/fast-sdxl", {
        input: { prompt: "hi" },
        startTimeout: 0,
      }),
    ).rejects.toThrow("Timeout must be greater than 1 seconds");
  });
});
