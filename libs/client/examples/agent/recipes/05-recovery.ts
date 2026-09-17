import type { AgentClient, AgentRequest } from "@fal-ai/client";

/** Persist this command BEFORE sending it, including the exact input and key. */
export type SavedCommand = { request: AgentRequest; idempotencyKey: string };

export function submitOrRetry(agent: AgentClient, command: SavedCommand) {
  return agent.responses.create(command.request, {
    idempotencyKey: command.idempotencyKey,
  });
  // Reuse the SAME command after an uncertain network failure.
  // A new intentional request gets a new key: crypto.randomUUID().
  // Errors can be AgentRequestError (transport/auth/validation), separate from
  // an accepted response whose status is "failed". Do not blindly retry 4xx.
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
