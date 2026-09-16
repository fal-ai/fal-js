import { createParser } from "eventsource-parser";
import { AgentProtocolError } from "./errors";
import { throwIfAborted } from "./transport";
import type { AgentEvent } from "./types";

/** Bounded incremental SSE parser. Body cancellation never cancels the run. */
export async function* agentEvents(
  response: Response,
  signal?: AbortSignal,
): AsyncGenerator<AgentEvent> {
  if (!response.body) throw new AgentProtocolError("Missing Agent stream body");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const events: AgentEvent[] = [];
  let parsingError: Error | undefined;
  let frame = "";
  const maxFrameSize = 4 * 1024 * 1024;
  const parser = createParser((event) => {
    if (event.type !== "event") return;
    if (event.data === "[DONE]") return;
    try {
      if (events.length >= 1024)
        throw new AgentProtocolError("Too many buffered Agent events");
      events.push(JSON.parse(event.data));
    } catch (error) {
      parsingError =
        error instanceof AgentProtocolError
          ? error
          : new AgentProtocolError("Invalid Agent event JSON");
    }
  });
  const abort = () => {
    void reader.cancel().catch(() => undefined);
  };
  signal?.addEventListener("abort", abort, { once: true });
  try {
    for (;;) {
      throwIfAborted(signal);
      const chunk = await reader.read();
      throwIfAborted(signal);
      if (chunk.done) break;
      // Feed one frame at a time, including comment heartbeats. Account for
      // delimiters across chunks without treating a long healthy connection
      // as a single oversized frame. Slice large chunks before decoding them.
      for (let offset = 0; offset < chunk.value.length; offset += 16384) {
        frame += decoder.decode(chunk.value.subarray(offset, offset + 16384), {
          stream: true,
        });
        let boundary = /\r\n\r\n|\n\n|\r\r/.exec(frame);
        while (boundary) {
          const complete = frame.slice(0, boundary.index);
          if (new TextEncoder().encode(complete).length > maxFrameSize) {
            throw new AgentProtocolError("Agent SSE frame exceeds 4 MiB");
          }
          parser.feed(complete + "\n\n");
          frame = frame.slice(boundary.index + boundary[0].length);
          if (parsingError) throw parsingError;
          while (events.length) yield events.shift() as AgentEvent;
          boundary = /\r\n\r\n|\n\n|\r\r/.exec(frame);
        }
        if (new TextEncoder().encode(frame).length > maxFrameSize) {
          throw new AgentProtocolError("Agent SSE frame exceeds 4 MiB");
        }
      }
    }
  } finally {
    signal?.removeEventListener("abort", abort);
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}
