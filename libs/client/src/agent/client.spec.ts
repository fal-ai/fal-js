import { webcrypto } from "node:crypto";
import { createFalClient } from "../client";
import { createConfig } from "../config";
import { createAgentClient } from "./client";
import { AgentProtocolError, AgentRequestError } from "./errors";
import { reduceAgentEvent } from "./reducer";
import { agentResponseView } from "./response";
import type {
  AgentArtifact,
  AgentEvent,
  AgentInputRequest,
  AgentMessage,
  AgentResponse,
} from "./types";

beforeAll(() => {
  if (!globalThis.crypto)
    Object.defineProperty(globalThis, "crypto", {
      value: webcrypto,
      configurable: true,
    });
});

const artifact: AgentArtifact = {
  id: "asset_1",
  type: "fal.artifact",
  kind: "media",
  media_type: "image",
  revision: 1,
  files: [
    {
      role: "primary",
      url: "https://example.com/a.png",
      mime_type: "image/png",
    },
  ],
};
const question: AgentInputRequest = {
  id: "q_1",
  type: "fal.input_request",
  kind: "clarification",
  status: "pending",
  prompt: "Which style?",
  questions: [
    {
      id: "style",
      text: "Style?",
      multiple: false,
      options: [{ id: "studio", label: "Studio" }],
      allow_text: true,
    },
  ],
};
const message: AgentMessage = {
  id: "msg_1",
  type: "message",
  role: "assistant",
  status: "in_progress",
  content: [{ type: "output_text", text: "", annotations: [] }],
};
function response(
  sequence = 0,
  state: "running" | "question" | "done" | "failed" = "running",
): AgentResponse {
  return {
    id: "resp_1",
    status:
      state === "done"
        ? "completed"
        : state === "failed"
          ? "failed"
          : "in_progress",
    output:
      state === "question"
        ? [question]
        : state === "done" || state === "failed"
          ? [artifact]
          : [],
    error:
      state === "failed"
        ? { code: "llm_failed", message: "Execution stopped" }
        : null,
    usage: null,
    fal: {
      conversation_id: "conv_1",
      phase:
        state === "question"
          ? "waiting_for_input"
          : ["done", "failed"].includes(state)
            ? "finished"
            : "running",
      sequence_number: sequence,
      pending_input_ids: state === "question" ? ["q_1"] : [],
      final_artifact_ids: state === "done" ? ["asset_1"] : [],
    },
  };
}
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
function sse(events: unknown[], cancel = jest.fn()) {
  // Deliberately split UTF-8/event lines across network chunks.
  const bytes = new TextEncoder().encode(
    events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join(""),
  );
  let offset = 0;
  return new Response(
    new ReadableStream({
      pull(controller) {
        if (offset >= bytes.length) {
          controller.close();
          return;
        }
        controller.enqueue(bytes.slice(offset, offset + 7));
        offset += 7;
      },
      cancel,
    }),
    { headers: { "Content-Type": "text/event-stream" } },
  );
}
function setup(fetch: jest.Mock) {
  return createFalClient({
    credentials: "test-key",
    agent: { baseUrl: "https://agent.example/v1" },
    fetch,
    retry: { maxRetries: 1, baseDelay: 0, maxDelay: 0 },
  }).agent;
}
async function collect<T>(values: AsyncIterable<T>) {
  const result: T[] = [];
  for await (const value of values) result.push(value);
  return result;
}
function snapshotEvent(value: AgentResponse) {
  return {
    type: "response.snapshot",
    response_id: value.id,
    sequence_number: value.fal.sequence_number,
    response: value,
  };
}

describe("experimental Agent client", () => {
  it("keeps streaming a visible question until the producer finishes its text", async () => {
    const initial = response(0, "question");
    initial.fal.phase = "running";
    const settled = response(1, "question");
    settled.output.push({
      ...message,
      status: "completed",
      content: [
        {
          type: "output_text",
          text: "Pick whichever direction feels right.",
          annotations: [],
        },
      ],
    });
    const fetch = jest
      .fn()
      .mockResolvedValueOnce(json(initial))
      .mockResolvedValueOnce(sse([snapshotEvent(settled)]));
    const snapshots = await collect(setup(fetch).responses.stream("resp_1"));
    expect(snapshots).toHaveLength(2);
    expect(snapshots[0].pending_inputs).toHaveLength(1);
    expect(snapshots[1].output_text).toBe(
      "Pick whichever direction feels right.",
    );
    expect(snapshots[1].fal.phase).toBe("waiting_for_input");
  });

  it("requires explicit backend configuration and makes no accidental production call", async () => {
    const fetch = jest.fn();
    const agent = createFalClient({ fetch }).agent;
    await expect(agent.responses.create({ input: "hello" })).rejects.toThrow(
      "configure agent.baseUrl",
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("retries an ambiguous submission with one key and generates a new key for new work", async () => {
    const fetch = jest
      .fn()
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockImplementation(() => Promise.resolve(json(response())));
    const agent = setup(fetch);
    await agent.responses.create({ input: "make something" });
    await agent.responses.create({ input: "make something" });
    const keys = fetch.mock.calls.map(
      ([, init]) => init.headers["Idempotency-Key"],
    );
    expect(keys[0]).toBe(keys[1]);
    expect(keys[2]).not.toBe(keys[0]);
    expect(fetch.mock.calls[0][0]).toBe("https://agent.example/v1/responses");
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
      input: "make something",
      background: true,
    });
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe("Key test-key");
  });

  it("preserves the caller key and HTTP conflict; does not retry changed-payload conflicts", async () => {
    const fetch = jest
      .fn()
      .mockResolvedValue(json({ message: "Payload conflicts" }, 409));
    await expect(
      setup(fetch).responses.create(
        { input: "changed" },
        { idempotencyKey: "saved-key" },
      ),
    ).rejects.toMatchObject({ idempotencyKey: "saved-key", status: 409 });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("returns questions without throwing, answers the same response, and preserves partial failures", async () => {
    const fetch = jest
      .fn()
      .mockResolvedValueOnce(json(response()))
      .mockResolvedValueOnce(json(response(1, "question")))
      .mockResolvedValueOnce(json(response(2)))
      .mockResolvedValueOnce(json(response(3, "failed")));
    const agent = setup(fetch);
    const accepted = jest.fn();
    const paused = await agent.run(
      { input: "campaign" },
      { onAccepted: accepted, pollIntervalMs: 0 },
    );
    expect(accepted).toHaveBeenCalledTimes(1);
    expect(paused.pending_inputs[0].id).toBe("q_1");
    await agent.responses.answer(paused.id, {
      input_request_id: "q_1",
      answer: {
        kind: "answers",
        answers: [{ question_id: "style", selected_option_ids: ["studio"] }],
      },
    });
    const failed = await agent.responses.wait(paused.id);
    expect(failed.status).toBe("failed");
    expect(failed.artifacts).toEqual([artifact]);
    expect(failed.final_artifacts).toEqual([]);
    expect(fetch.mock.calls[2][0]).toBe(
      "https://agent.example/v1/responses/resp_1/input",
    );
  });

  it("aborts local waiting without posting cancel, retaining the response ID and snapshot", async () => {
    const controller = new AbortController();
    const fetch = jest.fn().mockImplementation(() => {
      controller.abort();
      return Promise.resolve(json(response()));
    });
    await expect(
      setup(fetch).responses.wait("resp_1", { signal: controller.signal }),
    ).rejects.toMatchObject({ responseId: "resp_1" });
    expect(fetch.mock.calls.every(([, init]) => init.method === "GET")).toBe(
      true,
    );
  });

  it("interrupts retry backoff promptly and retains an ambiguous create key", async () => {
    const controller = new AbortController();
    const fetch = jest.fn().mockImplementation(() => {
      setTimeout(() => controller.abort(), 5);
      return Promise.reject(new TypeError("fetch failed"));
    });
    const agent = createAgentClient(
      createConfig({
        agent: { baseUrl: "https://agent.example/v1" },
        fetch,
        retry: { maxRetries: 3, baseDelay: 30000 },
      }),
    );
    await expect(
      agent.responses.create(
        { input: "hello" },
        { signal: controller.signal, idempotencyKey: "recover-me" },
      ),
    ).rejects.toMatchObject({ idempotencyKey: "recover-me" });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("times out polling locally and allows explicit cancellation separately", async () => {
    const fetch = jest
      .fn()
      .mockImplementation(() => Promise.resolve(json(response())));
    const agent = setup(fetch);
    await expect(
      agent.responses.wait("resp_1", { timeoutMs: 10, pollIntervalMs: 10000 }),
    ).rejects.toMatchObject({
      responseId: "resp_1",
      lastResponse: { id: "resp_1" },
    });
    const cancelled = {
      ...response(1),
      status: "cancelled",
      fal: { ...response(1).fal, phase: "finished" },
    };
    fetch.mockResolvedValueOnce(json(cancelled));
    const result = await agent.responses.cancel("resp_1");
    expect(result.status).toBe("cancelled");
    expect(fetch.mock.calls[fetch.mock.calls.length - 1][0]).toBe(
      "https://agent.example/v1/responses/resp_1/cancel",
    );
  });

  it("reconciles deltas without mutating old snapshots, skips replay, then resolves an artifact", async () => {
    const initial = { ...response(), output: [message] };
    const delta = {
      type: "response.output_text.delta",
      response_id: "resp_1",
      sequence_number: 1,
      output_index: 0,
      item_id: "msg_1",
      content_index: 0,
      delta: "Café 🎬",
    };
    const done = response(2, "done");
    const fetch = jest
      .fn()
      .mockResolvedValueOnce(json(initial))
      .mockResolvedValueOnce(sse([delta, delta, snapshotEvent(done)]));
    const snapshots = await collect(setup(fetch).responses.stream("resp_1"));
    expect(snapshots).toHaveLength(3);
    expect(snapshots[0].output_text).toBe("");
    expect(snapshots[1].output_text).toBe("Café 🎬");
    expect(snapshots[2].artifacts[0].id).toBe("asset_1");
    expect(fetch.mock.calls[1][0]).toContain("starting_after=0");
  });

  it("closes observation at required input", async () => {
    const fetch = jest
      .fn()
      .mockResolvedValueOnce(json(response()))
      .mockResolvedValueOnce(sse([snapshotEvent(response(1, "question"))]));
    const snapshots = await collect(setup(fetch).responses.stream("resp_1"));
    expect(snapshots[snapshots.length - 1].pending_inputs).toHaveLength(1);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("resumes after disconnection from the last cursor without creating another response", async () => {
    const fetch = jest
      .fn()
      .mockResolvedValueOnce(json(response()))
      .mockResolvedValueOnce(sse([snapshotEvent(response(1))]))
      .mockResolvedValueOnce(json(response(1)))
      .mockResolvedValueOnce(sse([snapshotEvent(response(2, "done"))]));
    const snapshots = await collect(
      setup(fetch).responses.stream("resp_1", { reconnectDelayMs: 0 }),
    );
    expect(snapshots.map((r) => r.fal.sequence_number)).toEqual([0, 1, 2]);
    expect(fetch.mock.calls[3][0]).toContain("starting_after=1");
    expect(fetch.mock.calls.every(([, init]) => init.method === "GET")).toBe(
      true,
    );
  });

  it.each(["unknown", "gap", "expired"])(
    "recovers %s replay using the snapshot cursor",
    async (scenario) => {
      const fetch = jest.fn().mockResolvedValueOnce(json(response()));
      if (scenario === "expired")
        fetch.mockResolvedValueOnce(json({ message: "expired" }, 410));
      else
        fetch.mockResolvedValueOnce(
          sse([
            {
              type:
                scenario === "gap"
                  ? "response.output_text.delta"
                  : "future.new_event",
              response_id: "resp_1",
              sequence_number: scenario === "gap" ? 3 : 1,
            },
          ]),
        );
      fetch.mockResolvedValueOnce(json(response(4, "done")));
      const snapshots = await collect(setup(fetch).responses.stream("resp_1"));
      expect(snapshots.map((r) => r.fal.sequence_number)).toEqual([0, 4]);
    },
  );

  it("bounds reconnect attempts and exposes a recoverable handle", async () => {
    const fetch = jest
      .fn()
      .mockImplementation((url: string) =>
        Promise.resolve(
          url.includes("stream=true") ? sse([]) : json(response()),
        ),
      );
    await expect(
      collect(
        setup(fetch).responses.stream("resp_1", {
          reconnectDelayMs: 0,
          maxReconnects: 1,
        }),
      ),
    ).rejects.toMatchObject({
      responseId: "resp_1",
      lastResponse: { id: "resp_1" },
    });
    expect(
      fetch.mock.calls.filter(([url]) => url.includes("stream=true")),
    ).toHaveLength(2);
  });

  it("releases the stream body on for-await break without server cancellation", async () => {
    const cancel = jest.fn();
    const fetch = jest
      .fn()
      .mockResolvedValueOnce(json(response()))
      .mockResolvedValueOnce(
        sse([snapshotEvent(response(1)), snapshotEvent(response(2))], cancel),
      );
    for await (const value of setup(fetch).responses.stream("resp_1")) {
      if (value.fal.sequence_number === 1) break;
    }
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls.every(([, init]) => init.method === "GET")).toBe(
      true,
    );
  });

  it("rejects malformed stream data and never accepts another response's event", async () => {
    const fetch = jest
      .fn()
      .mockResolvedValueOnce(json(response()))
      .mockResolvedValueOnce(
        sse([{ ...snapshotEvent(response(1)), response_id: "wrong" }]),
      );
    await expect(
      collect(setup(fetch).responses.stream("resp_1")),
    ).rejects.toBeInstanceOf(AgentRequestError);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("times out a stalled stream, releases its reader, and retains the accepted response", async () => {
    const cancel = jest.fn();
    const fetch = jest
      .fn()
      .mockResolvedValueOnce(json(response()))
      .mockResolvedValueOnce(
        new Response(new ReadableStream({ cancel }), {
          headers: { "Content-Type": "text/event-stream" },
        }),
      );
    await expect(
      collect(setup(fetch).responses.stream("resp_1", { timeoutMs: 20 })),
    ).rejects.toMatchObject({
      responseId: "resp_1",
      lastResponse: { id: "resp_1" },
    });
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("rejects non-SSE content without reconnecting", async () => {
    const fetch = jest
      .fn()
      .mockResolvedValueOnce(json(response()))
      .mockResolvedValueOnce(json({ surprise: true }));
    await expect(
      collect(setup(fetch).responses.stream("resp_1")),
    ).rejects.toMatchObject({ responseId: "resp_1" });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("rejects a regressing recovery snapshot", async () => {
    const fetch = jest
      .fn()
      .mockResolvedValueOnce(json(response(2)))
      .mockResolvedValueOnce(sse([]))
      .mockResolvedValueOnce(json(response(1)));
    await expect(
      collect(setup(fetch).responses.stream("resp_1")),
    ).rejects.toMatchObject({
      message: "Agent snapshot cursor moved backwards",
      responseId: "resp_1",
    });
  });

  it("retains the recovery key and ID when an answer returns a different response", async () => {
    const fetch = jest
      .fn()
      .mockResolvedValueOnce(json({ ...response(), id: "wrong" }));
    await expect(
      setup(fetch).responses.answer(
        "resp_1",
        {
          input_request_id: "q_1",
          answer: { kind: "answers", answers: [] },
        },
        { idempotencyKey: "answer-key" },
      ),
    ).rejects.toMatchObject({
      responseId: "resp_1",
      idempotencyKey: "answer-key",
    });
  });

  it("does not lose a question on a newly accepted stream", async () => {
    const fetch = jest
      .fn()
      .mockResolvedValueOnce(json(response(1, "question")));
    const values = await collect(setup(fetch).stream({ input: "hello" }));
    expect(values).toHaveLength(1);
    expect(values[0].pending_inputs).toHaveLength(1);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("uses existing proxy middleware for Agent requests", async () => {
    const fetch = jest.fn().mockResolvedValue(json(response()));
    const agent = createFalClient({
      agent: { baseUrl: "https://agent.example/v1" },
      fetch,
      proxyUrl: { url: "https://app.example/proxy", when: "always" },
    }).agent;
    await agent.responses.retrieve("resp_1");
    expect(fetch.mock.calls[0][0]).toBe("https://app.example/proxy");
    expect(fetch.mock.calls[0][1].headers["x-fal-target-url"]).toBe(
      "https://agent.example/v1/responses/resp_1",
    );
  });

  it("encodes history cursors and forwards revision checks without falling back to hidden routes", async () => {
    const fetch = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve(json({ data: [], next_cursor: null })),
      );
    const agent = setup(fetch);
    await agent.conversations.items.list("conv/1", {
      cursor: "a+b&c",
      limit: 10,
    });
    expect(fetch.mock.calls[0][0]).toBe(
      "https://agent.example/v1/conversations/conv%2F1/items?cursor=a%2Bb%26c&limit=10",
    );
    await agent.plans.update("plan_1", {
      conversation: "conv_1",
      expected_revision: 2,
      changes: [{ type: "rename_step", step_id: "s1", label: "Hero" }],
    });
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toMatchObject({
      conversation: "conv_1",
      expected_revision: 2,
    });
    await agent.plans.retrieve("plan/1", { conversation: "conv/1" });
    expect(fetch.mock.calls[2][0]).toBe(
      "https://agent.example/v1/agent/plans/plan%2F1?conversation=conv%2F1",
    );
    fetch.mockResolvedValueOnce(json(response()));
    await agent.plans.run(
      "plan_1",
      { conversation: "conv_1", expected_revision: 3 },
      { idempotencyKey: "run-once" },
    );
    expect(fetch.mock.calls[3][0]).toBe(
      "https://agent.example/v1/agent/plans/plan_1/run",
    );
    expect(fetch.mock.calls[3][1].headers["Idempotency-Key"]).toBe("run-once");
  });
});

describe("Agent server errors", () => {
  it("preserves the runtime API's useful error message", async () => {
    const fetch = jest.fn().mockResolvedValueOnce(
      json(
        {
          error: {
            code: "invalid_request",
            message: "Per-response budgets are not supported yet",
          },
        },
        400,
      ),
    );
    await expect(
      setup(fetch).responses.create({ input: "hello" }),
    ).rejects.toMatchObject({
      message: "Per-response budgets are not supported yet",
      status: 400,
    });
  });
});

describe("Agent response representation", () => {
  it("preserves canonical JSON without persisting derived views", () => {
    const original = response(2, "done");
    const view = agentResponseView(original);
    expect(view.final_artifacts).toEqual([artifact]);
    expect(JSON.parse(JSON.stringify(view))).toEqual(original);
    view.output = [];
    expect(view.artifacts).toEqual([]);
  });
  it("requires a snapshot cursor and valid pending decision rather than silently finishing", () => {
    const value = response(0, "question");
    value.output = [];
    expect(() => agentResponseView(value)).toThrow(AgentProtocolError);
    expect(() =>
      agentResponseView({
        ...response(),
        fal: undefined,
      } as unknown as AgentResponse),
    ).toThrow(AgentProtocolError);
  });
  it("will not reopen a terminal response when a later event arrives", () => {
    const done = response(2, "done");
    expect(
      reduceAgentEvent(done, snapshotEvent(response(3)) as AgentEvent),
    ).toBe(done);
  });
});
