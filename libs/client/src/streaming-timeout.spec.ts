import { createFalClient } from "./client";
import { ApiError } from "./response";

async function advance(ms: number) {
  do {
    const step = Math.min(ms, 16);
    jest.advanceTimersByTime(step);
    for (let i = 0; i < 20; i++) await Promise.resolve();
    ms -= step;
  } while (ms > 0);
}

describe.each(["text/event-stream", "application/octet-stream"])(
  "%s chunk deadlines",
  (contentType) => {
    const binary = contentType === "application/octet-stream";
    const encode = (n: number) =>
      binary
        ? new Uint8Array([n])
        : new TextEncoder().encode(`data: {"n":${n}}\n\n`);
    const output = (n: number) => (binary ? new Uint8Array([n]) : { n });

    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    async function fixture(timeout = 50, useDefault = false) {
      let controller!: ReadableStreamDefaultController<Uint8Array>;
      const cancel = jest.fn();
      const body = new ReadableStream<Uint8Array>({
        start(value) {
          controller = value;
        },
        cancel,
      });
      const fetch = jest.fn(
        async () =>
          new Response(body, {
            headers: {
              "content-type": contentType,
              "x-fal-request-id": "fixture-id",
            },
          }),
      );
      const client = createFalClient({ fetch });
      const stream = await client.stream("fixture/stream", {
        timeout: useDefault ? undefined : timeout,
      });
      const data = jest.fn();
      const error = jest.fn();
      const done = jest.fn();
      stream.on("data", data);
      stream.on("error", error);
      stream.on("done", done);
      const result = stream.done().then(
        (value) => ({ value, error: undefined }),
        (error) => ({ value: undefined, error }),
      );
      await advance(0);
      return {
        controller,
        cancel,
        body,
        fetch,
        stream,
        data,
        error,
        done,
        result,
      };
    }

    it.each([false, true])(
      "rejects a stalled read (partial data: %s) and drains buffered output",
      async (partial) => {
        const f = await fixture();
        if (partial) {
          f.controller.enqueue(encode(1));
          await advance(0);
        }
        await advance(50);
        expect(f.error).toHaveBeenCalledTimes(1);
        expect((await f.result).error).toMatchObject({
          status: 408,
          requestId: "fixture-id",
        });
        expect(f.done).not.toHaveBeenCalled();
        expect(f.cancel).toHaveBeenCalledTimes(1);
        expect(f.body.locked).toBe(false);
        expect(f.fetch).toHaveBeenCalledTimes(1);
        expect(jest.getTimerCount()).toBe(0);
        // Iteration can begin after the terminal error without waiting for a future event.
        const values = (async () => {
          const values = [];
          for await (const value of f.stream) values.push(value);
          return values;
        })();
        await advance(100);
        expect(await values).toEqual(partial ? [output(1)] : []);
        expect(f.data.mock.calls.map(([value]) => value)).toEqual(
          partial ? [output(1)] : [],
        );
        expect(f.error).toHaveBeenCalledTimes(1);
      },
    );

    it("finishes active iteration on timeout", async () => {
      const f = await fixture();
      const values = (async () => {
        const values = [];
        for await (const value of f.stream) values.push(value);
        return values;
      })();
      f.controller.enqueue(encode(1));
      await advance(100);
      expect((await f.result).error).toMatchObject({ status: 408 });
      expect(await values).toEqual([output(1)]);
      expect(jest.getTimerCount()).toBe(0);
    });

    it("drains an iterator created after user abort", async () => {
      const f = await fixture();
      f.controller.enqueue(encode(1));
      await advance(0);
      f.stream.abort();
      const values = (async () => {
        const values = [];
        for await (const value of f.stream) values.push(value);
        return values;
      })();
      await advance(100);
      expect(await values).toEqual([output(1)]);
      expect(await f.result).toEqual({ value: output(1), error: undefined });
      expect(jest.getTimerCount()).toBe(0);
    });

    it("renews the deadline for every chunk while total duration exceeds it", async () => {
      const f = await fixture();
      for (let n = 1; n <= 5; n++) {
        await advance(40);
        f.controller.enqueue(encode(n));
        await advance(0);
      }
      f.controller.close();
      await advance(0);
      expect(await f.result).toEqual({ value: output(5), error: undefined });
      expect(f.data).toHaveBeenCalledTimes(5);
      expect(f.done).toHaveBeenCalledTimes(1);
      expect(f.error).not.toHaveBeenCalled();
      expect(f.cancel).not.toHaveBeenCalled();
      expect(f.body.locked).toBe(false);
      expect(jest.getTimerCount()).toBe(0);
    });

    it("clears its deadline on empty EOF", async () => {
      const f = await fixture();
      f.controller.close();
      await advance(100);
      expect((await f.result).error).toBeUndefined();
      expect(f.done).toHaveBeenCalledTimes(1);
      expect(f.error).not.toHaveBeenCalled();
      expect(f.body.locked).toBe(false);
      expect(jest.getTimerCount()).toBe(0);
    });

    it.each([false, true])(
      "preserves user abort results and finishes active iteration (partial data: %s)",
      async (partial) => {
        const f = await fixture();
        const values = (async () => {
          const values = [];
          for await (const value of f.stream) values.push(value);
          return values;
        })();
        if (partial) {
          f.controller.enqueue(encode(1));
          await advance(0);
        }
        f.stream.abort();
        await advance(100);
        expect(await f.result).toEqual({
          value: partial ? output(1) : {},
          error: undefined,
        });
        expect(await values).toEqual(partial ? [output(1)] : []);
        expect(f.error).not.toHaveBeenCalled();
        expect(f.done).not.toHaveBeenCalled();
        expect(f.cancel).toHaveBeenCalledTimes(1);
        expect(f.body.locked).toBe(false);
        expect(jest.getTimerCount()).toBe(0);
      },
    );

    it("settles read failures once without retrying the HTTP request", async () => {
      const f = await fixture();
      f.controller.enqueue(encode(1));
      await advance(0);
      const failure = new ApiError({ message: "body failed", status: 503 });
      f.controller.error(failure);
      await advance(1000);
      expect((await f.result).error).toBe(failure);
      expect(f.error).toHaveBeenCalledTimes(1);
      expect(f.done).not.toHaveBeenCalled();
      expect(f.fetch).toHaveBeenCalledTimes(1);
      expect(f.body.locked).toBe(false);
      expect(jest.getTimerCount()).toBe(0);
    });

    it.each(["EOF", "abort"])(
      "lets %s before the deadline settle once",
      async (ending) => {
        const f = await fixture();
        await advance(49);
        if (ending === "EOF") f.controller.close();
        else f.stream.abort();
        await advance(0);
        await advance(100);
        expect((await f.result).error).toBeUndefined();
        expect(f.error).not.toHaveBeenCalled();
        expect(f.done).toHaveBeenCalledTimes(ending === "EOF" ? 1 : 0);
        expect(f.body.locked).toBe(false);
        expect(jest.getTimerCount()).toBe(0);
      },
    );

    it("keeps a deadline error when the caller aborts after it expires", async () => {
      const f = await fixture();
      await advance(50);
      f.stream.abort();
      await advance(100);
      expect((await f.result).error).toMatchObject({ status: 408 });
      expect(f.error).toHaveBeenCalledTimes(1);
      expect(f.done).not.toHaveBeenCalled();
      expect(f.cancel).toHaveBeenCalledTimes(1);
      expect(jest.getTimerCount()).toBe(0);
    });

    it.each([0, -1])(
      "enforces finite immediate timeout %s",
      async (timeout) => {
        const f = await fixture(timeout);
        await advance(1);
        expect((await f.result).error).toMatchObject({ status: 408 });
        expect(f.error).toHaveBeenCalledTimes(1);
        expect(f.body.locked).toBe(false);
        expect(jest.getTimerCount()).toBe(0);
      },
    );

    it.each([Infinity, NaN])(
      "does not arm a finite deadline for %s",
      async (timeout) => {
        const f = await fixture(timeout);
        await advance(20000);
        expect(f.error).not.toHaveBeenCalled();
        expect(jest.getTimerCount()).toBe(0);
        f.controller.enqueue(encode(1));
        f.controller.close();
        await advance(0);
        expect(await f.result).toEqual({ value: output(1), error: undefined });
        expect(f.body.locked).toBe(false);
      },
    );

    it("uses the documented 15 second default", async () => {
      const f = await fixture(50, true);
      f.controller.enqueue(encode(1));
      await advance(0);
      await advance(14999);
      expect(f.error).not.toHaveBeenCalled();
      await advance(1);
      expect((await f.result).error).toMatchObject({ status: 408 });
      expect(jest.getTimerCount()).toBe(0);
    });
  },
);

describe("SSE deadline activity and parse failures", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  async function fixture() {
    let controller!: ReadableStreamDefaultController<Uint8Array>;
    const cancel = jest.fn();
    const body = new ReadableStream<Uint8Array>({
      start(value) {
        controller = value;
      },
      cancel,
    });
    const stream = await createFalClient({
      fetch: async () =>
        new Response(body, {
          headers: { "content-type": "text/event-stream" },
        }),
    }).stream("fixture/stream", { timeout: 50 });
    const data = jest.fn();
    const message = jest.fn();
    const error = jest.fn();
    const done = jest.fn();
    stream.on("data", data);
    stream.on("message" as Parameters<typeof stream.on>[0], message);
    stream.on("error", error);
    stream.on("done", done);
    const result = stream.done().then(
      (value) => ({ value, error: undefined }),
      (error) => ({ value: undefined, error }),
    );
    await advance(0);
    return {
      controller,
      stream,
      data,
      message,
      error,
      done,
      result,
      body,
      cancel,
    };
  }

  it("renews on comments and partial frames, not only parsed messages", async () => {
    const f = await fixture();
    const add = jest.spyOn(f.stream.signal, "addEventListener");
    const remove = jest.spyOn(f.stream.signal, "removeEventListener");
    for (const text of [": heartbeat\n\n", "data: ", '{"n":1}', "\n", "\n"]) {
      await advance(40);
      f.controller.enqueue(new TextEncoder().encode(text));
      await advance(0);
    }
    f.controller.close();
    await advance(0);
    expect(await f.result).toEqual({ value: { n: 1 }, error: undefined });
    expect(f.data).toHaveBeenCalledTimes(1);
    expect(f.message).toHaveBeenCalledWith({ n: 1 });
    for (const [type, listener] of add.mock.calls) {
      expect(
        remove.mock.calls.some(
          ([removedType, removedListener]) =>
            removedType === type && removedListener === listener,
        ),
      ).toBe(true);
    }
    expect(f.body.locked).toBe(false);
    expect(jest.getTimerCount()).toBe(0);
  });

  it("stops same-chunk events after a parse failure and cancels the reader", async () => {
    const f = await fixture();
    f.controller.enqueue(
      new TextEncoder().encode('data: invalid\n\ndata: {"n":2}\n\n'),
    );
    await advance(100);
    expect((await f.result).error).toBeInstanceOf(SyntaxError);
    expect(f.data).not.toHaveBeenCalled();
    expect(f.message).not.toHaveBeenCalled();
    expect(f.error).toHaveBeenCalledTimes(1);
    expect(f.done).not.toHaveBeenCalled();
    expect(f.cancel).toHaveBeenCalledTimes(1);
    expect(f.body.locked).toBe(false);
    expect(jest.getTimerCount()).toBe(0);
  });
});
