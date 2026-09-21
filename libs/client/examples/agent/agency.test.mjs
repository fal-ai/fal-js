import { build } from "esbuild";
import { JSDOM } from "jsdom";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
const { outputFiles } = await build({
  entryPoints: [new URL("./agency.ts", import.meta.url).pathname],
  bundle: true,
  write: false,
  format: "iife",
  globalName: "Agency",
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
            "export const secureFetch=(...args)=>window.parentFetch(...args);export const createFalClient=()=>({agent:window.agent});export class AgentRequestError extends Error {}",
          loader: "js",
        }));
      },
    },
  ],
});
const tick = async () => {
  for (let i = 0; i < 20; i++) await new Promise((r) => setTimeout(r, 2));
};
const response = (extra = {}) => ({
  id: "resp_test",
  status: "completed",
  output: [],
  output_text: "Finished",
  artifacts: [],
  final_artifacts: [],
  pending_inputs: [],
  error: null,
  fal: {
    conversation_id: "chat_test",
    phase: "finished",
    sequence_number: 3,
    pending_input_ids: [],
    final_artifact_ids: [],
  },
  ...extra,
});
const pending = {
  id: "q",
  type: "fal.input_request",
  status: "pending",
  kind: "clarification",
  prompt: "Choose a style",
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
function mount(agent, parent, saved) {
  const dom = new JSDOM('<div id="host"></div>', {
    url: "http://localhost",
    runScripts: "outside-only",
  });
  dom.window.agent = agent;
  dom.window.crypto.randomUUID = randomUUID;
  dom.window.parentFetch = parent;
  if (saved)
    for (const [k, v] of Object.entries(saved))
      dom.window.sessionStorage.setItem(k, v);
  dom.window.eval(outputFiles[0].text);
  const root = dom.window.document
    .getElementById("host")
    .attachShadow({ mode: "open" });
  dom.window.Agency.mountAgency(root);
  return {
    dom,
    root,
    $: (id) => root.getElementById(id),
    inspector: () => root.getElementById("inspector-host").shadowRoot,
  };
}
const success = (data) => ({ ok: true, json: async () => data });
const delegate = {
  text: "I will delegate the visual.",
  action: {
    name: "delegate_media",
    args: {
      title: "Coffee visual",
      assignment: "Ask about style",
      continue_conversation: false,
    },
  },
  model: "test-parent",
};
test("real parent tool loop routes a client decision, resumes the same task and shares both views", async () => {
  let calls = 0,
    creates = 0,
    answers = [];
  const waiting = response({
    status: "in_progress",
    pending_inputs: [pending],
    output: [pending],
    fal: {
      conversation_id: "chat_test",
      phase: "waiting_for_input",
      sequence_number: 1,
      pending_input_ids: ["q"],
      final_artifact_ids: [],
    },
  });
  const page = mount(
    {
      responses: {
        create: async () => {
          creates++;
          return waiting;
        },
        answer: async (...args) => {
          answers.push(args);
          return response();
        },
      },
    },
    async () => {
      calls++;
      return success(
        calls === 1
          ? delegate
          : calls === 2
            ? {
                text: "Which style would you prefer?",
                action: null,
                model: "test-parent",
              }
            : {
                text: "Here is the completed campaign direction.",
                action: null,
                model: "test-parent",
              },
      );
    },
  );
  page.$("agency-prompt").value = "Make a coffee campaign";
  page.$("send-agency").click();
  await tick();
  assert.equal(creates, 1);
  assert.equal(calls, 2);
  assert.match(page.$("messages").textContent, /Which style/);
  assert.equal(page.$("decision").querySelectorAll("form").length, 1);
  page.$("inspect-view").click();
  assert.equal(page.$("chat").hidden, true);
  assert.match(
    page.inspector().getElementById("result").textContent,
    /waiting_for_input/,
  );
  page.$("app-view").click();
  page.$("decision").querySelector('input[value="warm"]').click();
  page.$("decision").querySelector("button").click();
  await tick();
  assert.equal(answers[0][0], "resp_test");
  assert.equal(answers[0][1].input_request_id, "q");
  assert.equal(calls, 3);
  assert.match(page.$("messages").textContent, /completed campaign direction/);
  assert.equal(page.$("decision").querySelectorAll("form").length, 0);
  assert.equal(creates, 1);
  page.dom.window.close();
});
test("progress updates do not invoke the parent model until the task stops", async () => {
  let calls = 0;
  const running = response({
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
        create: async () => running,
        stream: async function* () {
          yield { ...running, fal: { ...running.fal, sequence_number: 2 } };
          yield response();
        },
      },
    },
    async () =>
      success(
        ++calls === 1
          ? delegate
          : { text: "Results are ready.", action: null, model: "test-parent" },
      ),
  );
  page.$("agency-prompt").value = "Create media";
  page.$("send-agency").click();
  await tick();
  assert.equal(calls, 2);
  assert.match(page.$("messages").textContent, /Results are ready/);
  page.dom.window.close();
});
test("reload recovers an interrupted parent command using its original idempotency key", async () => {
  const command = {
    kind: "create",
    key: "original-key",
    request: { input: "one image" },
  };
  let options;
  const page = mount(
    {
      responses: {
        create: async (_r, o) => {
          options = o;
          return response();
        },
      },
    },
    async () => success({ text: "Done", action: null, model: "test-parent" }),
    {
      "fal-agency-parent-v1": JSON.stringify({
        history: [{ role: "user", text: "one image" }],
        pendingAction: command,
        owned: true,
        parentNeeded: false,
      }),
    },
  );
  assert.equal(options, undefined);
  page.$("continue-agency").click();
  await tick();
  assert.equal(options.idempotencyKey, "original-key");
  assert.equal(
    JSON.parse(page.dom.window.sessionStorage.getItem("fal-agency-parent-v1"))
      .pendingAction,
    undefined,
  );
  page.dom.window.close();
});
test("later snapshots of the same input request do not wake the parent twice", async () => {
  let calls = 0;
  const running = response({
    status: "in_progress",
    fal: {
      conversation_id: "chat_test",
      phase: "running",
      sequence_number: 0,
      pending_input_ids: [],
      final_artifact_ids: [],
    },
  });
  const waiting = response({
    status: "in_progress",
    pending_inputs: [pending],
    output: [pending],
    fal: {
      conversation_id: "chat_test",
      phase: "waiting_for_input",
      sequence_number: 1,
      pending_input_ids: ["q"],
      final_artifact_ids: [],
    },
  });
  const page = mount(
    {
      responses: {
        create: async () => running,
        stream: async function* () {
          yield waiting;
          await new Promise((r) => setTimeout(r, 30));
          yield {
            ...waiting,
            output_text: "Extra display text",
            fal: { ...waiting.fal, sequence_number: 2 },
          };
        },
      },
    },
    async () =>
      success(
        ++calls === 1
          ? delegate
          : {
              text: "Choose your direction.",
              action: null,
              model: "test-parent",
            },
      ),
  );
  page.$("agency-prompt").value = "Create media";
  page.$("send-agency").click();
  await tick();
  await tick();
  assert.equal(calls, 2);
  assert.equal(page.$("decision").querySelectorAll("form").length, 1);
  page.dom.window.close();
});
test("reload restores unanswered decisions without another parent turn and unlocks controls", async () => {
  let parentCalls = 0;
  const waiting = response({
    status: "in_progress",
    pending_inputs: [pending],
    output: [pending],
    fal: {
      conversation_id: "chat_test",
      phase: "waiting_for_input",
      sequence_number: 9,
      pending_input_ids: ["q"],
      final_artifact_ids: [],
    },
  });
  const page = mount(
    { responses: { retrieve: async () => waiting } },
    async () => {
      parentCalls++;
      return success({ text: "Unexpected", action: null, model: "test" });
    },
    {
      "fal-agent-delegation-v1": JSON.stringify({ responseId: "resp_test" }),
      "fal-agency-parent-v1": JSON.stringify({
        history: [{ role: "agency", text: "Choose a style" }],
        owned: true,
        handled: 'resp_test:in_progress:waiting_for_input:["q"]',
        parentNeeded: false,
      }),
    },
  );
  await tick();
  assert.equal(parentCalls, 0);
  assert.equal(page.$("decision").querySelector("fieldset").disabled, false);
  assert.equal(page.$("send-agency").disabled, false);
  page.dom.window.close();
});

const savedSession = () => ({
  "fal-agent-delegation-v1": JSON.stringify({
    responseId: "resp_test",
    lastCommand: {
      kind: "create",
      request: { input: "Old brief" },
      key: "old",
    },
  }),
  "fal-agency-parent-v1": JSON.stringify({
    history: [{ role: "user", text: "Old campaign" }],
    draft: "Old draft",
    owned: true,
    handled: "resp_test:completed:finished:[]",
    events: ["Old activity"],
    taskIds: ["resp_test"],
  }),
});

test("full reset clears both views and survives reload; next delegation starts a new conversation", async () => {
  const creates = [],
    parents = [];
  const agent = {
    responses: {
      retrieve: async () => response(),
      create: async (request) => {
        creates.push(request);
        return response();
      },
    },
  };
  const parent = async (_url, options) => {
    parents.push(JSON.parse(options.body));
    return success(
      parents.length === 1
        ? {
            ...delegate,
            action: {
              ...delegate.action,
              args: { ...delegate.action.args, continue_conversation: true },
            },
          }
        : { text: "Done", action: null },
    );
  };
  let page = mount(agent, parent, savedSession());
  await tick();
  page.$("reset-session").click();
  page.$("dismiss-reset").click();
  assert.match(page.$("messages").textContent, /Old campaign/);
  page.$("reset-session").click();
  page.$("confirm-reset").click();
  await tick();
  assert.doesNotMatch(page.$("messages").textContent, /Old campaign/);
  assert.equal(page.$("agency-prompt").value, "");
  assert.equal(page.$("timeline").textContent, "");
  assert.equal(
    page.inspector().getElementById("result").textContent,
    "No result yet.",
  );
  page.$("inspect-view").click();
  assert.equal(
    page.inspector().getElementById("call").textContent,
    "No task delegated.",
  );
  assert.equal(
    page.dom.window.sessionStorage.getItem("fal-agent-delegation-v1"),
    null,
  );
  const saved = {
    "fal-agency-parent-v1": page.dom.window.sessionStorage.getItem(
      "fal-agency-parent-v1",
    ),
  };
  page.dom.window.close();
  page = mount(agent, parent, saved);
  await tick();
  assert.equal(parents.length, 0);
  page.$("app-view").click();
  page.$("agency-prompt").value = "New campaign";
  page.$("send-agency").click();
  await tick();
  assert.equal(parents[0].specialist, null);
  assert.deepEqual(parents[0].history, [
    { role: "user", text: "New campaign" },
  ]);
  assert.equal(creates[0].conversation, undefined);
  page.dom.window.close();
});

test("workspace clear retains chat and draft while cancelling a waiting specialist", async () => {
  const cancels = [];
  const waiting = response({
    status: "in_progress",
    pending_inputs: [pending],
    fal: {
      ...response().fal,
      phase: "waiting_for_input",
      pending_input_ids: ["q"],
    },
  });
  const page = mount(
    {
      responses: {
        retrieve: async () => waiting,
        cancel: async (...args) => {
          cancels.push(args);
          return response({ status: "cancelled" });
        },
      },
    },
    async () => success({ text: "Choose", action: null }),
    savedSession(),
  );
  await tick();
  page.$("clear-workspace").click();
  page.$("confirm-reset").click();
  await tick();
  assert.equal(cancels.length, 1);
  assert.equal(cancels[0][0], "resp_test");
  assert.match(page.$("messages").textContent, /Old campaign/);
  assert.match(page.$("messages").textContent, /Delegation workspace cleared/);
  assert.equal(page.$("agency-prompt").value, "Old draft");
  assert.equal(page.$("decision").textContent, "");
  assert.equal(page.$("timeline").textContent, "");
  assert.equal(
    page.inspector().getElementById("status").textContent,
    "Ready for delegation",
  );
  page.dom.window.close();
});

test("reset ignores a late parent result and never delegates its stale action", async () => {
  let finish,
    signal,
    creates = 0;
  const page = mount(
    {
      responses: {
        create: async () => {
          creates++;
          return response();
        },
      },
    },
    async (_url, options) => {
      signal = options.signal;
      return new Promise((resolve) => {
        finish = resolve;
      });
    },
  );
  page.$("agency-prompt").value = "Old campaign";
  page.$("send-agency").click();
  await tick();
  page.$("reset-session").click();
  page.$("confirm-reset").click();
  await tick();
  assert.equal(signal.aborted, true);
  finish(success(delegate));
  await tick();
  assert.equal(creates, 0);
  assert.doesNotMatch(
    page.$("messages").textContent,
    /Old campaign|I will delegate/,
  );
  assert.equal(page.$("send-agency").disabled, false);
  page.dom.window.close();
});

test("failed cancellation keeps recovery state; retry uses the same cancellation key", async () => {
  const keys = [];
  const waiting = response({
    status: "in_progress",
    pending_inputs: [pending],
    fal: {
      ...response().fal,
      phase: "waiting_for_input",
      pending_input_ids: ["q"],
    },
  });
  const page = mount(
    {
      responses: {
        retrieve: async () => waiting,
        cancel: async (_id, options) => {
          keys.push(options.idempotencyKey);
          if (keys.length === 1) throw Error("Connection lost");
          return response({ status: "cancelled" });
        },
      },
    },
    async () => success({ text: "Choose", action: null }),
    savedSession(),
  );
  await tick();
  page.$("reset-session").click();
  page.$("confirm-reset").click();
  await tick();
  assert.equal(page.$("reset-confirm").hidden, false);
  assert.match(page.$("messages").textContent, /Old campaign/);
  assert.ok(page.dom.window.sessionStorage.getItem("fal-agent-delegation-v1"));
  page.$("confirm-reset").click();
  await tick();
  assert.equal(keys.length, 2);
  assert.equal(keys[0], keys[1]);
  assert.equal(page.$("reset-confirm").hidden, true);
  assert.equal(
    page.dom.window.sessionStorage.getItem("fal-agent-delegation-v1"),
    null,
  );
  page.dom.window.close();
});

test("inspection templates only fill a shared persistent draft; explicit run uses the parent loop", async () => {
  const requests = [];
  let creates = 0;
  const agent = {
    responses: {
      create: async () => {
        creates++;
        return response();
      },
    },
  };
  const parent = async (_url, options) => {
    requests.push(JSON.parse(options.body));
    return success(
      requests.length === 1
        ? delegate
        : { text: "The plan is ready.", action: null },
    );
  };
  let page = mount(agent, parent);
  page.$("inspect-view").click();
  assert.equal(page.$("inspect-starter").hidden, false);
  assert.equal(page.$("run-starter").disabled, true);
  for (const name of ["direction", "coffee", "plan"]) {
    page.root.querySelector(`[data-template="${name}"]`).click();
    assert.ok(page.$("starter-brief").value.length > 100);
    assert.equal(page.$("starter-brief").value, page.$("agency-prompt").value);
  }
  await tick();
  assert.equal(requests.length, 0);
  assert.equal(creates, 0);
  page.$("starter-brief").value += " Use a blue palette.";
  page.$("starter-brief").dispatchEvent(new page.dom.window.Event("input"));
  const brief = page.$("starter-brief").value;
  page.$("app-view").click();
  assert.equal(page.$("agency-prompt").value, brief);
  page.$("inspect-view").click();
  const saved = {
    "fal-agency-parent-v1": page.dom.window.sessionStorage.getItem(
      "fal-agency-parent-v1",
    ),
  };
  page.dom.window.close();
  page = mount(agent, parent, saved);
  assert.equal(page.$("inspect-starter").hidden, false);
  assert.equal(page.$("starter-brief").value, brief);
  page.$("run-starter").click();
  page.$("run-starter").click();
  await tick();
  assert.equal(creates, 1);
  assert.equal(requests.length, 2);
  assert.deepEqual(requests[0].history, [{ role: "user", text: brief }]);
  assert.equal(page.$("starter-brief").value, "");
  assert.equal(page.$("starter-reply-text").textContent, "The plan is ready.");
  assert.match(
    page.inspector().getElementById("result").textContent,
    /completed/,
  );
  page.dom.window.close();
});
