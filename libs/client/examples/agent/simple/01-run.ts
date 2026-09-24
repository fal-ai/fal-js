import { fal } from "./client";

const response = await fal.agent.run({
  input: "Generate an image of a blue ceramic mug.",
});

console.log(response.status);
console.log(response.output_text);
console.log(response.artifacts);

// run() returns when finished OR when the agent needs an answer.
if (response.fal.phase === "waiting_for_input") {
  console.log("Questions:", response.pending_inputs);
}
