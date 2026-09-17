import type { AgentClient } from "@fal-ai/client";

/** Register this function as a tool in your own agent framework. */
export async function delegateToFal(agent: AgentClient, brief: string) {
  const response = await agent.run({ input: brief });
  if (response.fal.phase === "waiting_for_input") {
    return {
      outcome: "needs_input" as const,
      responseId: response.id,
      questions: response.pending_inputs,
    };
    // Your host agent may answer from known requirements or ask its user.
    // Continue through responses.answer(responseId, ...), not a new run().
  }
  return {
    outcome: response.status,
    responseId: response.id,
    text: response.output_text,
    artifacts: response.artifacts,
    error: response.error,
  };
}
