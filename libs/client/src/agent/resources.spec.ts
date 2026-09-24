import { createFalClient } from "../client";

it("routes skills and conversation actions without optional request settings", async () => {
  const fetch = jest.fn().mockImplementation(
    async () =>
      new Response(JSON.stringify({ id: "resource" }), {
        headers: { "Content-Type": "application/json" },
      }),
  );
  const { agent } = createFalClient({
    credentials: "test-key",
    fetch,
  });
  await agent.skills.list({ search: "product photos" });
  await agent.skills.create({
    name: "product-photos",
    description: "Product photos",
    body: "Use soft light.",
  });
  await agent.conversations.fork("chat/1");
  await agent.conversations.sharing.update("chat/1", {
    emails: ["reviewer@example.com"],
  });
  expect(
    fetch.mock.calls.map(([url, options]) => [url, options.method]),
  ).toEqual([
    [
      "https://fal.ai/api/agent-v2/sdk/agent/skills?search=product+photos",
      "GET",
    ],
    ["https://fal.ai/api/agent-v2/sdk/agent/skills", "POST"],
    ["https://fal.ai/api/agent-v2/sdk/conversations/chat%2F1/fork", "POST"],
    ["https://fal.ai/api/agent-v2/sdk/conversations/chat%2F1/sharing", "PATCH"],
  ]);
  expect(JSON.parse(fetch.mock.calls[3][1].body)).toEqual({
    emails: ["reviewer@example.com"],
  });
});

it("does not repeat a skill installation or conversation fork after a lost acknowledgement", async () => {
  const fetch = jest.fn().mockRejectedValue(new TypeError("Connection lost"));
  const { agent } = createFalClient({
    fetch,
    retry: { maxRetries: 1, baseDelay: 0, maxDelay: 0 },
  });
  await expect(
    agent.skills.importFromGithub({
      repoUrl: "https://github.com/example/skills",
    }),
  ).rejects.toThrow("Connection lost");
  await expect(agent.conversations.fork("chat")).rejects.toThrow(
    "Connection lost",
  );
  expect(fetch).toHaveBeenCalledTimes(2);
});
