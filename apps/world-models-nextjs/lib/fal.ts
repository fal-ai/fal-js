"use client";

import { createFalClient } from "@fal-ai/client";

export const fal = createFalClient({
  proxyUrl: "/api/fal/proxy",
});

export async function realtimeToken(app: string): Promise<string> {
  const response = await fetch("/api/fal/realtime-token", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ app }),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Could not authorize the realtime session");
  }
  return response.text();
}
