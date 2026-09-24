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
  // Unknown events are reconciled through an authoritative snapshot.
  return null;
}
