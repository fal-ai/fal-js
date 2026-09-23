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
  let trailingCR = false;
  const maxFrameSize = 4 * 1024 * 1024;
  const parser = createParser((event) => {
    if (event.type !== "event") return;
    if (event.data === "[DONE]") return;
    try {
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
        let text = decoder.decode(
          chunk.value.subarray(offset, offset + 16384),
          {
            stream: true,
          },
        );
        if (text) {
          // Treat CRLF as one line ending, including across network chunks.
          if (trailingCR && text.startsWith("\n")) text = text.slice(1);
          trailingCR = text.endsWith("\r");
          frame += text.replace(/\r\n|\r/g, "\n");
        }
        let boundary = frame.indexOf("\n\n");
        while (boundary !== -1) {
          const complete = frame.slice(0, boundary);
          if (new TextEncoder().encode(complete).length > maxFrameSize) {
            throw new AgentProtocolError("Agent SSE frame exceeds 4 MiB");
          }
          parser.feed(complete + "\n\n");
          frame = frame.slice(boundary + 2);
          if (parsingError) throw parsingError;
          while (events.length) {
            throwIfAborted(signal);
            yield events.shift() as AgentEvent;
          }
          boundary = frame.indexOf("\n\n");
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
