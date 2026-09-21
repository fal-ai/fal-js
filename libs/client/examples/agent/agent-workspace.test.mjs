// Host-state regression checks. These fixtures never contact the Agent runtime.
import { build } from "esbuild";
import { JSDOM } from "jsdom";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(
  new URL("./agent-workspace.html", import.meta.url),
  "utf8",
);
const { outputFiles } = await build({
  entryPoints: [new URL("./agent-workspace.ts", import.meta.url).pathname],
  bundle: true,
  write: false,
  format: "iife",
  globalName: "AgentWorkspace",
  platform: "browser",
  plugins: [
    {
      name: "fixture-sdk",
      setup(build) {
        build.onResolve(
          { filter: /^(\.\.\/\.\.\/src\/index|@fal-sdk-demo\/session-fetch)$/ },
          (args) => ({ path: args.path, namespace: "fixture" }),
        );
        build.onLoad({ filter: /.*/, namespace: "fixture" }, (args) => ({
          contents: args.path.includes("session-fetch")
            ? "export const secureFetch = () => { throw new Error('Unexpected network request'); };"
            : "export const createFalClient = () => ({ agent: window.fixtureAgent }); export const AgentRequestError = window.FixtureError;",
          loader: "js",
        }));
      },
    },
  ],
});
const code = outputFiles[0].text;
const tick = async () => {
  for (let i = 0; i < 6; i++)
    await new Promise((resolve) => setImmediate(resolve));
};
const question = {
  id: "q",
  type: "fal.input_request",
  kind: "clarification",
  status: "pending",
  prompt: "Pick a style",
  questions: [
    {
      id: "style",
      text: "Which style?",
      multiple: false,
      allow_text: true,
      options: [
        { id: "warm", label: "Warm" },
        { id: "cool", label: "Cool" },
      ],
    },
  ],
};
const message = (text) => ({
  id: "m",
  type: "message",
  role: "assistant",
  status: "completed",
  content: [{ type: "output_text", text, annotations: [] }],
});
function response(id, output = [], status = "completed", phase = "finished") {
  return {
    id,
    status,
    output,
    error: null,
    usage: null,
    fal: {
      conversation_id: "conversation-1",
      sequence_number: 1,
      phase,
      pending_input_ids: output
        .filter((i) => i.type === "fal.input_request" && i.status === "pending")
        .map((i) => i.id),
      final_artifact_ids: [],
    },
    get artifacts() {
      return this.output.filter((i) => i.type === "fal.artifact");
    },
    get pending_inputs() {
      return this.output.filter(
        (i) => i.type === "fal.input_request" && i.status === "pending",
      );
    },
  };
}
async function host({ create, retrieve, stream, saved, answer, cancel } = {}) {
  const dom = new JSDOM(html, {
    url: "http://127.0.0.1:3020/agent-sdk-demo/agent.html",
    runScripts: "outside-only",
  });
  const w = dom.window;
  const markup = w.document.body.innerHTML;
  const hostElement = w.document.createElement("div");
  const decoy = w.document.createElement("input");
  decoy.id = "prompt";
  decoy.value = "API tab draft";
  w.document.body.replaceChildren(decoy, hostElement);
  const scope = hostElement.attachShadow({ mode: "open" });
  scope.innerHTML = markup;
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.crypto.randomUUID = randomUUID;
  w.FixtureError = class extends Error {
    constructor(message, status) {
      super(message);
      this.status = status;
    }
  };
  const calls = [];
  w.fixtureAgent = {
    responses: {
      create: async (req, opts) => {
        calls.push({ req, opts });
        return create ? create(req, opts, w) : response("r1");
      },
      retrieve: retrieve ?? (async (id) => response(id)),
      stream:
        stream ??
        async function* (id) {
          yield await w.fixtureAgent.responses.retrieve(id);
        },
      answer: answer ?? (async () => response("r1")),
      cancel: cancel ?? (async (id) => response(id, [], "cancelled")),
    },
  };
  if (saved)
    w.sessionStorage.setItem("fal-agent-workspace-v1", JSON.stringify(saved));
  w.eval(code);
  w.AgentWorkspace.mountAgentWorkspace(scope);
  await tick();
  return {
    w,
    document: scope,
    calls,
    close: () => w.close(),
    submit: async (text) => {
      scope.getElementById("prompt").value = text;
      scope
        .getElementById("compose")
        .dispatchEvent(
          new w.Event("submit", { bubbles: true, cancelable: true }),
        );
      await tick();
      assert.equal(decoy.value, "API tab draft");
    },
  };
}
test("uncertain submission retries exact key and payload, including after reload", async () => {
  const h = await host({
    create: async () => {
      throw new Error("connection dropped");
    },
  });
  try {
    await h.submit("Make one image");
    assert.equal(h.document.getElementById("send").disabled, true);
    assert.equal(h.document.getElementById("retry").hidden, false);
    h.document.getElementById("retry").click();
    await tick();
    assert.equal(h.calls.length, 2);
    assert.deepEqual(h.calls[0], h.calls[1]);
    const saved = JSON.parse(
      h.w.sessionStorage.getItem("fal-agent-workspace-v1"),
    );
    const recovered = await host({ saved });
    try {
      assert.equal(recovered.calls.length, 0);
      recovered.document.getElementById("retry").click();
      await tick();
      assert.equal(
        recovered.calls[0].opts.idempotencyKey,
        h.calls[0].opts.idempotencyKey,
      );
      assert.deepEqual(
        JSON.parse(JSON.stringify(recovered.calls[0].req)),
        JSON.parse(JSON.stringify(h.calls[0].req)),
      );
    } finally {
      recovered.close();
    }
  } finally {
    h.close();
  }
});
test("text updates preserve question selection, free text and focus; answer resumes same response", async () => {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  let answered;
  const initial = response("r1", [question], "in_progress", "running");
  const final = response(
    "r1",
    [question, message("Pick whichever direction feels right")],
    "in_progress",
    "waiting_for_input",
  );
  final.fal.sequence_number = 2;
  const h = await host({
    create: async () => initial,
    stream: async function* () {
      yield initial;
      await gate;
      yield final;
    },
    answer: async (id, input) => {
      answered = { id, input };
      return response(id, [
        { ...question, status: "answered" },
        message("Confirmed"),
      ]);
    },
  });
  try {
    await h.submit("Ask me");
    const radio = h.document.querySelector('input[value="warm"]');
    radio.checked = true;
    const free = h.document.querySelector('textarea[name="style_text"]');
    free.value = "With texture";
    free.focus();
    release();
    await tick();
    assert.equal(h.document.querySelector('input[value="warm"]'), radio);
    assert.equal(radio.checked, true);
    assert.equal(free.value, "With texture");
    assert.equal(h.document.activeElement, free);
    assert.match(
      h.document.getElementById("thread").textContent,
      /Pick whichever/,
    );
    h.document
      .querySelector(".question")
      .dispatchEvent(new h.w.Event("submit", { cancelable: true }));
    await tick();
    assert.equal(answered.id, "r1");
    assert.equal(answered.input.answer.answers[0].text, "With texture");
    assert.equal(
      answered.input.answer.answers[0].selected_option_ids[0],
      "warm",
    );
  } finally {
    release();
    h.close();
  }
});
test("reload restores every response without creating work; refinement uses artifact ID and conversation", async () => {
  const artifact = {
    id: "art1",
    type: "fal.artifact",
    kind: "media",
    media_type: "image",
    revision: 2,
    files: [],
  };
  const h = await host({
    saved: {
      turns: [
        { id: "r1", prompt: "First", receipts: [] },
        { id: "r2", prompt: "Second", receipts: [] },
      ],
    },
    retrieve: async (id) =>
      response(id, id === "r2" ? [artifact] : [message("Earlier answer")]),
  });
  try {
    assert.equal(h.calls.length, 0);
    assert.equal(h.document.querySelectorAll(".turn").length, 2);
    assert.equal(h.document.getElementById("json").hidden, false);
    h.document.querySelector(".artifact button").click();
    await h.submit("Make it warmer");
    assert.equal(h.calls[0].req.conversation, "conversation-1");
    assert.deepEqual(
      JSON.parse(JSON.stringify(h.calls[0].req.input[0].content[1])),
      { type: "fal.input_artifact", artifact_id: "art1", revision: 2 },
    );
  } finally {
    h.close();
  }
});
test("definitive validation rejection unlocks composer and keeps the original prompt", async () => {
  const h = await host({
    create: async (_req, _opts, w) => {
      throw new w.FixtureError("Unsupported image", 422);
    },
  });
  try {
    await h.submit("Draft to fix");
    assert.equal(h.document.getElementById("send").disabled, false);
    assert.equal(h.document.getElementById("prompt").value, "Draft to fix");
    assert.equal(h.document.getElementById("retry").hidden, true);
  } finally {
    h.close();
  }
});

test("disconnect stops observation without cancellation; explicit cancel targets current response", async () => {
  let cancellations = 0;
  const active = response("r1", [], "in_progress", "running");
  const h = await host({
    create: async () => active,
    stream: async function* (_id, { signal }) {
      yield active;
      await new Promise((resolve) =>
        signal.addEventListener("abort", resolve, { once: true }),
      );
    },
    cancel: async (id) => {
      cancellations++;
      return response(id, [], "cancelled");
    },
  });
  try {
    await h.submit("Long-running work");
    h.document.getElementById("disconnect").click();
    await tick();
    assert.equal(cancellations, 0);
    assert.equal(h.document.getElementById("send").disabled, true);
    h.document.getElementById("cancel").click();
    await tick();
    assert.equal(cancellations, 1);
  } finally {
    h.close();
  }
});
test("unknown blocks stay readable and handled operation failures preserve partial artifacts", async () => {
  const r = response("r1", [
    {
      id: "m",
      type: "message",
      role: "assistant",
      status: "completed",
      content: [
        {
          id: "b",
          type: "fal.block",
          kind: "future-widget",
          revision: 1,
          fallback_text: "A new card",
          data: { value: "<script>unsafe()</script>" },
        },
      ],
    },
    {
      id: "op",
      type: "fal.operation",
      kind: "generation",
      name: "Image generation",
      status: "failed",
      artifact_ids: [],
      error: { code: "provider_error", message: "Provider unavailable" },
    },
    {
      id: "art",
      type: "fal.artifact",
      kind: "data",
      revision: 1,
      data: { ok: true },
    },
  ]);
  const h = await host({
    saved: { turns: [{ id: "r1", prompt: "Test", receipts: [] }] },
    retrieve: async () => r,
  });
  try {
    assert.match(h.document.getElementById("thread").textContent, /A new card/);
    assert.match(
      h.document.getElementById("thread").textContent,
      /Provider unavailable/,
    );
    assert.equal(h.document.querySelectorAll(".artifact").length, 1);
    assert.equal(h.document.querySelectorAll("#thread script").length, 0);
    assert.equal(h.document.getElementById("send").disabled, false);
  } finally {
    h.close();
  }
});

test("library cards restore real previews and identity without inventing generated artifacts", async () => {
  const blocks = [
    {
      kind: "asset",
      data: {
        assetRecordId: "catalog-1",
        url: "https://fal.media/reference.png",
        type: "image",
      },
    },
    {
      kind: "collection",
      data: {
        collectionId: "collection-1",
        assetCount: 2,
        previewAssets: [{ url: "https://fal.media/clip.mp4", type: "video" }],
      },
    },
    { kind: "media", data: { url: "javascript:alert(1)", type: "image" } },
  ].map((block, i) => ({
    ...block,
    id: `library-${i}`,
    type: "fal.block",
    revision: 1,
    fallback_text: "Library card",
  }));
  const h = await host({
    saved: {
      turns: [{ id: "r1", prompt: "Show my references", receipts: [] }],
    },
    retrieve: async () => response("r1", [{ ...message(""), content: blocks }]),
  });
  try {
    const thread = h.document.getElementById("thread");
    assert.equal(
      thread.querySelector("img").src,
      "https://fal.media/reference.png",
    );
    assert.equal(
      thread.querySelector("video").src,
      "https://fal.media/clip.mp4",
    );
    assert.match(thread.textContent, /catalog-1/);
    assert.match(thread.textContent, /collection-1/);
    assert.match(thread.textContent, /2 assets/);
    assert.equal(thread.querySelectorAll("img").length, 1);
    assert.equal(thread.querySelectorAll(".artifact").length, 0);
    assert.equal(thread.querySelectorAll('a[href^="javascript:"]').length, 0);
  } finally {
    h.close();
  }
});

test("exports retain download warnings and final selection uses the current revision", async () => {
  const artifact = {
    id: "artifact",
    type: "fal.artifact",
    kind: "media",
    media_type: "image",
    revision: 1,
    files: [
      {
        role: "primary",
        url: "https://fal.media/result.png",
        mime_type: "image/png",
      },
    ],
  };
  let r = response("r1", [
    artifact,
    {
      ...message(""),
      content: [
        {
          id: "export",
          type: "fal.block",
          kind: "export",
          revision: 1,
          fallback_text: "Export",
          data: {
            zipName: "deliverables.zip",
            url: "https://fal.media/result.zip",
            files: [{ path: "images/result.png" }],
            failedCount: 1,
            truncatedCount: 2,
          },
        },
      ],
    },
  ]);
  const h = await host({
    saved: { turns: [{ id: "r1", prompt: "Export", receipts: [] }] },
    retrieve: async () => r,
  });
  try {
    const selections = [];
    h.w.fixtureAgent.responses.selectFinalArtifacts = async (id, input) => {
      selections.push({ id, input });
      r = {
        ...r,
        fal: {
          ...r.fal,
          final_artifact_ids: input.artifact_ids,
          sequence_number: r.fal.sequence_number + 1,
        },
      };
      return r;
    };
    assert.equal(
      h.document.querySelector(".block a").href,
      "https://fal.media/result.zip",
    );
    assert.match(
      h.document.getElementById("thread").textContent,
      /1 failed · 2 excluded/,
    );
    const finalButton = () =>
      [...h.document.querySelectorAll(".artifact button")].find((b) =>
        b.textContent.includes("final deliverable"),
      );
    finalButton().click();
    await tick();
    assert.deepEqual(JSON.parse(JSON.stringify(selections[0])), {
      id: "r1",
      input: { artifact_ids: ["artifact"], expected_sequence_number: 1 },
    });
    assert.equal(finalButton().getAttribute("aria-pressed"), "true");
    finalButton().click();
    await tick();
    assert.equal(selections[1].input.expected_sequence_number, 2);
    assert.equal(finalButton().getAttribute("aria-pressed"), "false");
  } finally {
    h.close();
  }
});

test("approval buttons send only the runtime-supported decision fields", async () => {
  const approval = {
    id: "approval_1",
    type: "fal.input_request",
    kind: "approval",
    status: "pending",
    prompt: "Continue?",
    target: { item_id: "next", revision: 1 },
    accepted_answers: ["approve", "reject"],
  };
  const calls = [];
  const h = await host({
    saved: { turns: [{ id: "r1", prompt: "Make a plan", receipts: [] }] },
    retrieve: async () =>
      response("r1", [approval], "in_progress", "waiting_for_input"),
    answer: async (id, input) => {
      calls.push({ id, input });
      return response("r1");
    },
  });
  try {
    const submitter = h.document.querySelector(
      '.question button[value="approve"]',
    );
    const event = new h.w.Event("submit", { cancelable: true });
    Object.defineProperty(event, "submitter", { value: submitter });
    h.document.querySelector(".question").dispatchEvent(event);
    await tick();
    assert.deepEqual(JSON.parse(JSON.stringify(calls)), [
      {
        id: "r1",
        input: {
          input_request_id: "approval_1",
          answer: { kind: "approval", decision: "approve" },
        },
      },
    ]);
  } finally {
    h.close();
  }
});
