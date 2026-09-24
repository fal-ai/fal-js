import { fal } from "./client";

for await (const response of fal.agent.stream({
  input: "Help me create a product image.",
})) {
  console.log(response.id, response.status, response.fal.phase);
  console.log(response.output_text);
  console.log(response.artifacts);
  console.log(response.pending_inputs);
}

// Each value is the current snapshot, not a text delta.
// In a UI, replace the displayed state instead of appending its text.
// The stream stops at a final outcome OR when an answer is needed.
