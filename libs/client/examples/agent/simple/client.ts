import { createFalClient } from "@fal-ai/client";

// Shared setup for these local examples. run.mjs supplies the test server URL.
// "local-demo" is a fixture token, not a real fal key.
const baseUrl = process.env.AGENT_EXAMPLE_BASE_URL;
if (!baseUrl) throw new Error("Start these examples with simple/run.mjs");

export const fal = createFalClient({
  credentials: "local-demo",
  agent: { baseUrl },
});
