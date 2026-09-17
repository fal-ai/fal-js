import type { AgentClient, AgentResponseView } from "@fal-ai/client";

/** Create once. Save the ID before opening the stream. */
export async function streamTask(
  agent: AgentClient,
  prompt: string,
  saveResponseId: (id: string) => void,
  render: (response: AgentResponseView) => void,
  signal?: AbortSignal,
) {
  const accepted = await agent.responses.create({ input: prompt });
  saveResponseId(accepted.id);
  render(accepted);
  return watchResponse(agent, accepted.id, render, signal);
}

/** Also use this after an answer or a reconnect; it never creates another job. */
export async function watchResponse(
  agent: AgentClient,
  responseId: string,
  render: (response: AgentResponseView) => void,
  signal?: AbortSignal,
) {
  let latest: AgentResponseView | undefined;
  for await (const response of agent.responses.stream(responseId, { signal })) {
    latest = response;
    render(response); // Replace state by ID; snapshots are not text deltas.
  }
  // Streaming stops at completion/failure/cancellation OR waiting_for_input.
  // Aborting observation does not cancel server execution.
  return latest;
}
