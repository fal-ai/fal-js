import { createFalClient } from "@fal-ai/client";

const baseUrl = process.env.FAL_AGENT_BASE_URL;
if (!baseUrl) throw new Error("Set FAL_AGENT_BASE_URL to your Agent API endpoint");

// The client reads FAL_KEY from the environment.
export const agent = createFalClient({ agent: { baseUrl } }).agent;
