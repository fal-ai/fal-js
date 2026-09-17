import { fal } from "./client";

// In your app, load this ID from your own saved state after a reload/restart.
const responseId = process.env.EXAMPLE_RESPONSE_ID!;
const response = await fal.agent.responses.retrieve(responseId);
console.log(response);

// Observe that same response. This does not submit new work.
for await (const latest of fal.agent.responses.stream(responseId)) {
  console.log(latest);
}
