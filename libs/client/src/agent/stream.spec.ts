import { AgentProtocolError } from "./errors";
import { agentEvents } from "./stream";

async function collect(body: string) {
  const events = [];
  for await (const event of agentEvents(new Response(body))) events.push(event);
  return events;
}

describe("Agent SSE parser", () => {
  it("stops delivery after abort even when another event is already buffered", async () => {
    const abort = new AbortController();
    const event = { type: "ping", response_id: "resp_1", sequence_number: 1 };
    const events = agentEvents(
      new Response(`data: ${JSON.stringify(event)}\n\n`.repeat(2)),
      abort.signal,
    );
    expect((await events.next()).value).toEqual(event);
    abort.abort();
    await expect(events.next()).rejects.toMatchObject({ name: "AbortError" });
  });

  it.each(["\r\n\n", "\n\r\n", "\r\n\r", "\r\r\n"])(
    "accepts mixed line endings across network chunks: %j",
    async (ending) => {
      const event = { type: "ping", response_id: "resp_1", sequence_number: 1 };
      const body = `data: ${JSON.stringify(event)}${ending}`;
      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          for (const byte of new TextEncoder().encode(body))
            controller.enqueue(Uint8Array.of(byte));
          controller.close();
        },
      });
      const events = [];
      for await (const item of agentEvents(new Response(stream)))
        events.push(item);
      expect(events).toEqual([event]);
    },
  );

  it("bounds individual frames without counting heartbeats against later frames", async () => {
    const heartbeats = `:${" ".repeat(8192)}\r\n\r\n`.repeat(520);
    const event = { type: "ping", response_id: "resp_1", sequence_number: 1 };
    expect(
      await collect(`${heartbeats}data: ${JSON.stringify(event)}\r\n\r\n`),
    ).toEqual([event]);
  });
  it("rejects oversized frames", async () => {
    await expect(
      collect(`data: ${"x".repeat(4 * 1024 * 1024)}\n\n`),
    ).rejects.toThrow(AgentProtocolError);
  });
  it("rejects malformed JSON and releases the body", async () => {
    await expect(collect("data: {broken}\n\n")).rejects.toThrow(
      "Invalid Agent event JSON",
    );
  });
});
