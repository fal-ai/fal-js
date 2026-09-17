import { createFalClient } from "@fal-ai/client";

/** Call inside the signed-in web app with its existing secureFetch transport. */
export function createSessionAgent(sessionFetch: typeof fetch, origin: string) {
  return createFalClient({
    fetch: sessionFetch,
    agent: { baseUrl: `${origin}/api/agent-v2/sdk` },
  }).agent;
}

// In the web app:
// import { secureFetch } from "~/lib/csrf-client";
// const agent = createSessionAgent(secureFetch, window.location.origin);
//
// The session transport supplies CSRF protection and existing browser cookies.
// Public FAL_KEY access is not implemented by the current runtime adapter.
