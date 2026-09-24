import type { AgentClient, AgentRequest } from "@fal-ai/client";

/** Save the exact input and key before sending. */
export type SavedCommand = { request: AgentRequest; idempotencyKey: string };

// Reuse the saved command after an uncertain failure; use a new key for new work.
export function submitOrRetry(agent: AgentClient, command: SavedCommand) {
  return agent.responses.create(command.request, {
    idempotencyKey: command.idempotencyKey,
  });
}

/** Loading a saved response does not repeat the original execution. */
export function restoreResponse(agent: AgentClient, responseId: string) {
  return agent.responses.retrieve(responseId);
}

/** Explicit cancellation; closing a tab or aborting a stream does not do this. */
export async function cancelExecution(agent: AgentClient, responseId: string) {
  await agent.responses.cancel(responseId);
  return agent.responses.wait(responseId);
}
