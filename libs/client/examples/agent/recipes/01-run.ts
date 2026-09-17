import type { AgentClient } from "@fal-ai/client";

/** One call: submit, then poll until finished OR a user decision is needed. */
export async function runTask(
  agent: AgentClient,
  prompt: string,
  saveResponseId: (id: string) => void,
) {
  const response = await agent.run(
    { input: prompt },
    { onAccepted: ({ id }) => saveResponseId(id) },
  );

  // A resolved promise does not necessarily mean "completed".
  if (response.fal.phase === "waiting_for_input") {
    console.log("Needs an answer:", response.pending_inputs);
  } else if (response.status === "failed") {
    console.error("Execution failed:", response.error);
  }

  // Partial results can remain available even when execution fails.
  console.log(response.output_text, response.artifacts);
  return response;
}
