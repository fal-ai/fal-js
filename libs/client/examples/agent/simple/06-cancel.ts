import { fal } from "./client";

const accepted = await fal.agent.responses.create({
  input: "Plan a product campaign.",
});

// This example immediately requests cancellation.
await fal.agent.responses.cancel(accepted.id);
const response = await fal.agent.responses.wait(accepted.id);
console.log(response.status);

// Closing a stream only stops observation. cancel() requests a server-side stop.
