import { build } from "esbuild";
import { JSDOM } from "jsdom";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
const { outputFiles } = await build({
  entryPoints: [new URL("./delegation.ts", import.meta.url).pathname],
  bundle: true,
  write: false,
  format: "iife",
  globalName: "Delegation",
  platform: "browser",
  plugins: [
    {
      name: "fake-sdk",
      setup(b) {
        b.onResolve(
          { filter: /^(\.\.\/\.\.\/src\/index|@fal-sdk-demo\/session-fetch)$/ },
          (args) => ({ path: args.path, namespace: "fixture" }),
        );
        b.onLoad({ filter: /.*/, namespace: "fixture" }, () => ({
          contents:
            "export const secureFetch=()=>{}; export const createFalClient=()=>({agent:window.agent});export class AgentRequestError extends Error {}",
          loader: "js",
        }));
      },
    },
  ],
});
const tick = async () => {
  for (let i = 0; i < 12; i++) await new Promise((r) => setImmediate(r));
};
const response = (extra = {}) => ({
  id: "resp_test",
  status: "completed",
  output: [],
  output_text: "Media ready",
  artifacts: [],
  final_artifacts: [],
  pending_inputs: [],
  error: null,
  fal: {
    conversation_id: "chat_test",
    phase: "finished",
    sequence_number: 2,
    pending_input_ids: [],
    final_artifact_ids: [],
  },
  ...extra,
});
function mount(agent, saved) {
  const dom = new JSDOM('<div id="host"></div>', {
    url: "http://localhost",
    runScripts: "outside-only",
  });
  dom.window.agent = agent;
  dom.window.crypto.randomUUID = randomUUID;
  if (saved)
    dom.window.sessionStorage.setItem("fal-agent-delegation-v1", saved);
  dom.window.eval(outputFiles[0].text);
  const root = dom.window.document
    .getElementById("host")
    .attachShadow({ mode: "open" });
  dom.window.Delegation.mountDelegation(root);
  return { dom, root, $: (id) => root.getElementById(id) };
}
test("uncertain delegation survives reload and retries exact payload and key", async () => {
  const calls = [];
  const first = mount({
    responses: {
      create: async (...args) => {
        calls.push(args);
        throw Error("connection lost");
      },
    },
  });
  first.$("delegate").click();
  await tick();
  assert.equal(first.$("retry").hidden, false);
  assert.equal(first.$("delegate").disabled, true);
  const saved = first.dom.window.sessionStorage.getItem(
    "fal-agent-delegation-v1",
  );
  const second = mount(
    {
      responses: {
        create: async (...args) => {
          calls.push(args);
          return response();
        },
      },
    },
    saved,
  );
  second.$("retry").click();
  await tick();
  assert.deepEqual(
    JSON.parse(JSON.stringify(calls[0])),
    JSON.parse(JSON.stringify(calls[1])),
  );
  assert.match(second.$("handoff").textContent, /Task completed/);
  assert.equal(second.$("retry").hidden, true);
  first.dom.window.close();
  second.dom.window.close();
});
test("pending questions return to parent and resume the same response without automatic approval", async () => {
  let answers = [];
  const q = {
    id: "q",
    type: "fal.input_request",
    status: "pending",
    kind: "clarification",
    prompt: "Choose direction",
    questions: [
      {
        id: "style",
        text: "Style?",
        multiple: false,
        allow_text: false,
        options: [
          { id: "warm", label: "Warm" },
          { id: "cool", label: "Cool" },
        ],
      },
    ],
  };
  const r = response({
    status: "in_progress",
    pending_inputs: [q],
    output: [q],
    fal: {
      conversation_id: "chat_test",
      phase: "waiting_for_input",
      sequence_number: 1,
      pending_input_ids: ["q"],
      final_artifact_ids: [],
    },
  });
  const page = mount({
    responses: {
      create: async () => r,
      answer: async (...args) => {
        answers.push(args);
        return response();
      },
    },
  });
  page.$("delegate").click();
  await tick();
  assert.equal(answers.length, 0);
  assert.match(page.$("handoff").textContent, /Parent paused/);
  page.root.querySelector('input[value="warm"]').click();
  page.root.querySelector("fieldset button").click();
  await tick();
  assert.equal(answers[0][0], "resp_test");
  assert.equal(answers[0][1].input_request_id, "q");
  assert.equal(answers[0][1].answer.answers[0].selected_option_ids[0], "warm");
  assert.equal(page.root.querySelectorAll("fieldset").length, 0);
  page.dom.window.close();
});
test("follow-up keeps conversation and artifact identity; failed work stays failed in handoff", async () => {
  const calls = [];
  const artifact = {
    id: "asset",
    type: "fal.artifact",
    kind: "media",
    revision: 3,
    files: [],
  };
  const page = mount({
    responses: {
      create: async (req) => {
        calls.push(req);
        return response({
          status: "failed",
          error: { code: "partial", message: "one failed" },
          artifacts: [artifact],
          output: [artifact],
        });
      },
    },
  });
  page.$("delegate").click();
  await tick();
  assert.match(page.$("handoff").textContent, /Task failed/);
  const result = JSON.parse(page.$("result").textContent);
  assert.equal(result.artifacts[0].id, "asset");
  assert.equal(result.final_artifact_ids.length, 0);
  page.$("revision").value = "Make warmer";
  page.$("refine").click();
  await tick();
  assert.equal(calls[1].conversation, "chat_test");
  assert.equal(calls[1].input[0].content[1].artifact_id, "asset");
  assert.equal(calls[1].input[0].content[1].revision, 3);
  page.dom.window.close();
});
test("reload retrieves existing work; disconnect never cancels remote task", async () => {
  let retrieved = 0,
    cancelled = 0;
  const r = response({
    status: "in_progress",
    fal: {
      conversation_id: "chat_test",
      phase: "running",
      sequence_number: 1,
      pending_input_ids: [],
      final_artifact_ids: [],
    },
  });
  const page = mount(
    {
      responses: {
        retrieve: async () => {
          retrieved++;
          return r;
        },
        stream: async function* (_id, { signal }) {
          await new Promise((resolve) =>
            signal.addEventListener("abort", resolve, { once: true }),
          );
        },
        cancel: async () => {
          cancelled++;
          return response({ status: "cancelled" });
        },
      },
    },
    JSON.stringify({ responseId: "resp_test" }),
  );
  await tick();
  page.$("disconnect").click();
  await tick();
  assert.equal(retrieved, 1);
  assert.equal(cancelled, 0);
  assert.match(page.$("status").textContent, /remote task continues/);
  page.$("cancel").click();
  await tick();
  assert.equal(cancelled, 1);
  page.dom.window.close();
});
