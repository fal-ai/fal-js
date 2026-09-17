import type { AgentAnswer, AgentClient } from "@fal-ai/client";

/** Pass the user's (or host agent's) explicit answer; never auto-approve. */
export async function answerInput(
  agent: AgentClient,
  responseId: string,
  inputRequestId: string,
  answer: AgentAnswer,
) {
  await agent.responses.answer(responseId, {
    input_request_id: inputRequestId,
    answer,
  });
  return agent.responses.wait(responseId); // Same response, continued.
}

// Clarification answer: use IDs from response.pending_inputs, not labels.
// { kind: "answers", answers: [{ question_id, selected_option_ids: [optionId] }] }
// Free text: add `text` to the entry when the question allows it.
// Approval: { kind: "approval", decision: "approve" } — only if advertised.
// The returned response can need another answer. Render pending_inputs again.
// To show live updates after answering, use responses.stream(responseId)
// instead of wait(responseId).
