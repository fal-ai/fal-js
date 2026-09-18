import { build } from "esbuild";
import { JSDOM } from "jsdom";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(
  new URL("./session-demo.html", import.meta.url),
  "utf8",
);
const { outputFiles } = await build({
  entryPoints: [new URL("./session-demo.ts", import.meta.url).pathname],
  bundle: true,
  write: false,
  format: "iife",
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
            : "export const createFalClient = () => window.fixtureClient; export const AgentRequestError = class extends Error {};",
          loader: "js",
        }));
      },
    },
  ],
});
const tick = async () => {
  for (let i = 0; i < 8; i++)
    await new Promise((resolve) => setImmediate(resolve));
};
const deferred = () => {
  let resolve;
  const promise = new Promise((r) => {
    resolve = r;
  });
  return { promise, resolve };
};
const plan = {
  id: "plan-a",
  type: "fal.block",
  kind: "plan",
  revision: 1,
  fallback_text: "Plan A",
  data: { title: "Plan A", steps: [] },
};
const planHistory = {
  data: [
    {
      type: "output",
      response_id: null,
      item: { type: "message", content: [plan] },
    },
  ],
  next_cursor: null,
};
async function host(list = async () => planHistory) {
  const dom = new JSDOM(html, {
    url: "https://fal.local:3020/agent-sdk-demo/index.html",
    runScripts: "outside-only",
  });
  const w = dom.window;
  w.crypto.randomUUID = randomUUID;
  const calls = [];
  w.fixtureClient = {
    agent: {
      conversations: {
        list: async () => ({
          data: [
            { id: "a", title: "A" },
            { id: "b", title: "B" },
          ],
          next_cursor: null,
        }),
        retrieve: async (id) => ({
          id,
          title: id.toUpperCase(),
          active_response_ids: [],
        }),
        items: { list },
      },
      plans: {
        retrieve: async (...args) => {
          calls.push(args);
          return plan;
        },
      },
    },
    storage: { upload: async () => "https://fal.media/brief.txt" },
  };
  w.eval(outputFiles[0].text);
  await tick();
  const $ = (id) => w.document.getElementById(id);
  return {
    w,
    $,
    calls,
    close: () => w.close(),
    choose: (id) => {
      $("conversation-picker").value = id;
      $("conversation-picker").dispatchEvent(new w.Event("change"));
    },

  };
}

test("plan loading awaits an in-flight history refresh instead of reporting no plan", async () => {
  const gate = deferred();
  let reads = 0;
  const h = await host(async () => {
    reads++;
    return gate.promise;
  });
  try {
    h.choose("a");
    const loading = h.$("load-plan").onclick();
    await tick();
    assert.equal(reads, 1);
    assert.equal(h.calls.length, 0);
    assert.doesNotMatch(h.$("notice").textContent, /No plan/);
    gate.resolve(planHistory);
    await loading;
    assert.equal(h.calls.length, 1);
    assert.equal(h.$("plan-name").value, "Plan A");
  } finally {
    gate.resolve(planHistory);
    h.close();
  }
});

test("navigation starts its own history load and ignores the older result", async () => {
  const gate = deferred();
  const h = await host((id) =>
    id === "a"
      ? gate.promise
      : Promise.resolve({ data: [], next_cursor: null }),
  );
  try {
    h.choose("a");
    h.choose("b");
    await tick();
    assert.equal(h.$("conversation-title").value, "B");
    gate.resolve(planHistory);
    await tick();
    assert.equal(h.$("conversation-title").value, "B");
    assert.equal(h.$("history").textContent, "");
  } finally {
    gate.resolve(planHistory);
    h.close();
  }
});
