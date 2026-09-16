import { AgentProtocolError } from "./errors";
import { isAgentTerminal, validateAgentResponse } from "./response";
import type { AgentEvent, AgentResponse } from "./types";

/** null means that an authoritative snapshot is required before continuing. */
export function reduceAgentEvent(
  current: AgentResponse,
  event: AgentEvent,
): AgentResponse | null {
  if (
    !event ||
    typeof event.type !== "string" ||
    event.response_id !== current.id ||
    !Number.isSafeInteger(event.sequence_number) ||
    event.sequence_number < 0
  ) {
    throw new AgentProtocolError(
      "Invalid Agent event identity or sequence number",
    );
  }
  if (
    event.sequence_number <= current.fal.sequence_number ||
    isAgentTerminal(current)
  )
    return current;
  if (event.response) {
    validateAgentResponse(event.response);
    if (
      event.response.id !== current.id ||
      event.response.fal.sequence_number !== event.sequence_number
    ) {
      throw new AgentProtocolError(
        "Agent event snapshot does not match its envelope",
      );
    }
    return event.response;
  }
  // Never apply a delta across a missing event.
  if (event.sequence_number !== current.fal.sequence_number + 1) return null;
  const output = current.output.slice();
  const index = event.output_index;
  if (index === undefined || !Number.isInteger(index) || index < 0) return null;

  if (
    [
      "response.output_item.added",
      "response.output_item.done",
      "fal.output_item.updated",
    ].includes(event.type)
  ) {
    if (!event.item || index > output.length) return null;
    if (output[index] && output[index].id !== event.item.id) return null;
    if (output.some((item, i) => i !== index && item.id === event.item?.id))
      return null;
    output[index] = event.item;
  } else if (
    event.type === "response.output_text.delta" ||
    event.type === "response.content_part.added" ||
    event.type === "response.content_part.done"
  ) {
    const item = output[index];
    const contentIndex = event.content_index;
    if (
      !item ||
      item.type !== "message" ||
      item.id !== event.item_id ||
      contentIndex === undefined ||
      !Number.isInteger(contentIndex) ||
      contentIndex < 0
    )
      return null;
    const content = item.content.slice();
    if (event.type === "response.output_text.delta") {
      const part = content[contentIndex];
      if (part?.type !== "output_text" || typeof event.delta !== "string")
        return null;
      content[contentIndex] = { ...part, text: part.text + event.delta };
    } else {
      if (!event.part || contentIndex > content.length) return null;
      content[contentIndex] = event.part;
    }
    output[index] = { ...item, content };
  } else {
    // Additive events may change state we do not know how to reduce.
    return null;
  }
  const next = {
    ...current,
    output,
    fal: { ...current.fal, sequence_number: event.sequence_number },
  };
  validateAgentResponse(next);
  return next;
}
