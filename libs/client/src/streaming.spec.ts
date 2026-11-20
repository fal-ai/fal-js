jest.mock("./request", () => {
  const actual = jest.requireActual("./request");
  return {
    ...actual,
    dispatchRequest: jest.fn(),
  };
});

import { createFalClient } from "./client";
import { dispatchRequest } from "./request";

describe("stream headers", () => {
  beforeEach(() => {
    (dispatchRequest as jest.Mock).mockReset();
    (dispatchRequest as jest.Mock).mockResolvedValue(undefined);
  });

  it("includes the packed tags header when tags are provided", async () => {
    const client = createFalClient({ credentials: "test-key" });
    await client.stream("fal-ai/fast-sdxl", {
      input: { prompt: "hello" },
      tags: { team: "design", env: "prod" },
    });

    expect(dispatchRequest).toHaveBeenCalledTimes(1);
    const call = (dispatchRequest as jest.Mock).mock.calls[0][0];
    expect(call.options.headers["x-fal-tags"]).toBe("team=design,env=prod");
  });

  it("omits the tags header when tags are not provided", async () => {
    const client = createFalClient({ credentials: "test-key" });
    await client.stream("fal-ai/fast-sdxl", {
      input: { prompt: "hello" },
    });

    expect(dispatchRequest).toHaveBeenCalledTimes(1);
    const call = (dispatchRequest as jest.Mock).mock.calls[0][0];
    expect(call.options.headers["x-fal-tags"]).toBeUndefined();
  });
});

describe("stream decoding", () => {
  beforeEach(() => {
    (dispatchRequest as jest.Mock).mockReset();
    (dispatchRequest as jest.Mock).mockImplementation(
      jest.requireActual("./request").dispatchRequest,
    );
  });

  async function consumeChunks(
    chunks: Uint8Array[],
    contentType = "text/event-stream",
  ) {
    const client = createFalClient({
      fetch: async () =>
        new Response(
          new ReadableStream({
            start(controller) {
              for (const chunk of chunks) {
                controller.enqueue(chunk);
              }
              controller.close();
            },
          }),
          { headers: { "content-type": contentType } },
        ),
    });
    const stream = await client.stream("fixture/text", {});
    const data: unknown[] = [];
    stream.on("data", (value) => data.push(value));
    const iteration = (async () => {
      const values: unknown[] = [];
      for await (const value of stream) {
        values.push(value);
      }
      return values;
    })();
    const done = await stream.done();
    return { data, iteration: await iteration, done };
  }

  it.each(["unchunked", "é", "☃", "😀", "every byte"])(
    "preserves UTF-8 and SSE framing when split at %s",
    async (split) => {
      const expected = [{ text: "first" }, { text: "café ☃ 😀 漢字" }];
      const wire = new TextEncoder().encode(
        expected
          .map((value) => `data: ${JSON.stringify(value)}\r\n\r\n`)
          .join(""),
      );
      let chunks = [wire];
      if (split === "every byte") {
        chunks = Array.from(wire, (byte) => new Uint8Array([byte]));
      } else if (split !== "unchunked") {
        const start = wire.indexOf(new TextEncoder().encode(split)[0]);
        chunks = [wire.slice(0, start + 1), wire.slice(start + 1)];
      }

      const result = await consumeChunks(chunks);

      expect(result.data).toEqual(expected);
      expect(result.iteration).toEqual(expected);
      expect(result.done).toEqual(expected[1]);
    },
  );

  it("flushes a truncated UTF-8 tail at EOF with replacement semantics", async () => {
    const decode = jest.spyOn(TextDecoder.prototype, "decode");
    try {
      const expected = { text: "complete" };
      const result = await consumeChunks([
        new TextEncoder().encode(`data: ${JSON.stringify(expected)}\n\n: `),
        new Uint8Array([0xe2, 0x98]),
      ]);

      expect(decode.mock.results[decode.mock.results.length - 1]?.value).toBe(
        "\uFFFD",
      );
      expect(result.data).toEqual([expected]);
      expect(result.iteration).toEqual([expected]);
      expect(result.done).toEqual(expected);
    } finally {
      decode.mockRestore();
    }
  });

  it("preserves binary chunks without decoding", async () => {
    const chunks = [new Uint8Array([0xc3]), new Uint8Array([0xa9, 0xff, 0x00])];

    const result = await consumeChunks(chunks, "application/octet-stream");

    expect(result.data).toEqual(chunks);
    expect(result.iteration).toEqual(chunks);
    expect(result.done).toEqual(chunks[1]);
  });
});
