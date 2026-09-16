import { AgentProtocolError } from "./errors";
import { agentEvents } from "./stream";

async function collect(body: string) {
  const events = [];
  for await (const event of agentEvents(new Response(body))) events.push(event);
  return events;
}

describe("Agent SSE parser", () => {
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
