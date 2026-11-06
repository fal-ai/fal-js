import { createFalClient } from "../client";
import { AgentRequestError } from "./errors";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
const setup = (fetch: jest.Mock) =>
  createFalClient({
    credentials: "test-key",
    fetch,
    retry: { maxRetries: 1, baseDelay: 0, maxDelay: 0 },
  }).agent.templates;

it("lists with an encoded query and retrieves by an encoded id", async () => {
  const fetch = jest
    .fn()
    .mockImplementation(() => Promise.resolve(json({ items: [] })));
  const templates = setup(fetch);
  await templates.list({ query: "ad & promo", output: "video", limit: 10 });
  await templates.retrieve("tpl/1");
  const list = new URL(fetch.mock.calls[0][0]);
  expect(list.pathname).toBe("/api/agent-v2/sdk/agent/templates");
  expect(JSON.parse(list.searchParams.get("input") ?? "")).toEqual({
    query: "ad & promo",
    output: "video",
    limit: 10,
  });
  expect(fetch.mock.calls[1][0]).toBe(
    "https://fal.ai/api/agent-v2/sdk/agent/templates/tpl%2F1",
  );
});

it("runs with the given idempotency key and returns the Agent response", async () => {
  const fetch = jest.fn().mockResolvedValueOnce(
    json(
      {
        id: "resp_1",
        status: "in_progress",
        output: [],
        error: null,
        usage: null,
        fal: {
          conversation_id: "conv_1",
          phase: "running",
          sequence_number: 0,
          pending_input_ids: [],
          final_artifact_ids: [],
        },
      },
      202,
    ),
  );
  const input = {
    version_id: "ver_1",
    inputs: { "artifact.a1": "https://v3b.fal.media/files/a.png" },
  };
  const response = await setup(fetch).run("tpl_1", input, {
    idempotencyKey: "run-key",
  });
  const [url, init] = fetch.mock.calls[0];
  expect(url).toBe(
    "https://fal.ai/api/agent-v2/sdk/agent/templates/tpl_1/runs",
  );
  expect(init.method).toBe("POST");
  expect(init.headers["Idempotency-Key"]).toBe("run-key");
  expect(JSON.parse(init.body)).toEqual(input);
  expect(response.id).toBe("resp_1");
  expect(response.status).toBe("in_progress");
});

it("exposes the server error code and retry hint with the key to reuse", async () => {
  const fetch = jest.fn().mockResolvedValueOnce(
    json(
      {
        error: {
          code: "idempotency_key_in_use",
          message: "Another request with this Idempotency-Key is starting",
          retry_after_seconds: 2,
        },
      },
      409,
    ),
  );
  const error = await setup(fetch)
    .run("tpl_1", { version_id: "ver_1" }, { idempotencyKey: "run-key" })
    .catch((cause) => cause);
  expect(error).toBeInstanceOf(AgentRequestError);
  expect(error).toMatchObject({
    status: 409,
    code: "idempotency_key_in_use",
    retryAfterSeconds: 2,
    idempotencyKey: "run-key",
  });
});
