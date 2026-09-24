import type { AgentArtifact, AgentClient } from "@fal-ai/client";

export async function generateImage(agent: AgentClient, conversation?: string) {
  const response = await agent.run({
    conversation,
    input:
      "Generate one square image of a cobalt ceramic mug on a pale stone table. Use fal-ai/flux/schnell. Proceed without clarification.",
  });
  // The prompt is a request, not an enforced output contract.
  // If the agent asks a question, handle response.pending_inputs first.
  // Available results live in response.artifacts, even after partial failure.
  return response;
}

/** Select an actual artifact from a previous response; no download or upload. */
export function refineImage(
  agent: AgentClient,
  conversationId: string,
  chosen: AgentArtifact,
  instruction = "Make this one warmer. Keep the composition unchanged.",
) {
  return agent.run({
    conversation: conversationId,
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: instruction },
          {
            type: "fal.input_artifact",
            artifact_id: chosen.id,
            revision: chosen.revision,
          },
        ],
      },
    ],
  });
  // This is a NEW response in the same conversation.
  // Queued work is a fal.operation; no artifact URL exists until it resolves.
}
