import { createFalClient } from "@fal-ai/client";

// The client reads FAL_KEY from the environment.
export const agent = createFalClient().agent;
