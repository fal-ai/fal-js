import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { startReferenceServer } from "./mock-server.mjs";

const packageDirectory =
  process.argv[2] ??
  fileURLToPath(new URL("../../../../dist/libs/client", import.meta.url));
const require = createRequire(`${packageDirectory}/package.json`);
const { createFalClient } = require("@fal-ai/client");
const server = await startReferenceServer();
try {
  const fal = createFalClient({
    credentials: "local-demo",
    fetch: server.fetch,
  });
  for (const method of [
    fal.agent.skills.list,
    fal.agent.projects.documents.upload,
    fal.agent.conversations.fork,
    fal.agent.library.characters.create,
    fal.agent.library.entities.create,
  ]) {
    assert.equal(typeof method, "function");
  }
  const options = { timeoutMs: 5000, pollIntervalMs: 10 };
  const first = await fal.agent.run({ input: "Create a campaign." }, options);
  assert.equal(first.fal.phase, "waiting_for_input");
  const input = first.pending_inputs[0];
  await fal.agent.responses.answer(first.id, {
    input_request_id: input.id,
    answer: {
      kind: "answers",
      answers: [{ question_id: "style", selected_option_ids: ["studio"] }],
    },
  });
  const states = [];
  let result;
  for await (const value of fal.agent.responses.stream(first.id, options)) {
    result = value;
    for (const item of value.output)
      if (item.type === "fal.operation") states.push(item.status);
  }
  assert.equal(result.status, "completed");
  assert(states.includes("queued"));
  assert(states.includes("in_progress"));
  assert.equal(result.final_artifacts.length, 1);
  const file = await fetch(result.final_artifacts[0].files[0].url);
  assert.equal(file.status, 200);
  assert((await file.text()).includes("synthetic test artifact"));

  // A new client with only a saved ID can retrieve exactly the same result.
  const restored = createFalClient({
    credentials: "local-demo",
    fetch: server.fetch,
  });
  assert.deepEqual(
    JSON.parse(
      JSON.stringify(await restored.agent.responses.retrieve(result.id)),
    ),
    JSON.parse(JSON.stringify(result)),
  );
  const history = await restored.agent.conversations.items.list(
    result.fal.conversation_id,
  );
  assert(history.data.some((item) => item.type === "answer"));
  const refined = await fal.agent.run(
    {
      conversation: result.fal.conversation_id,
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: "Make this warmer." },
            {
              type: "fal.input_artifact",
              artifact_id: result.final_artifacts[0].id,
              revision: 1,
            },
          ],
        },
      ],
    },
    options,
  );
  assert.equal(refined.status, "completed");
  assert.equal(refined.fal.conversation_id, result.fal.conversation_id);

  const pending = await fal.agent.responses.create({
    input: "A task to cancel.",
  });
  assert.equal(
    (await fal.agent.responses.cancel(pending.id)).status,
    "cancelled",
  );
  await new Promise((resolve) => setTimeout(resolve, 80));
  assert.equal(
    (await fal.agent.responses.retrieve(pending.id)).status,
    "cancelled",
  );
  console.log(
    "PASS: real HTTP question/answer, queued media, SSE, artifact download, reconnect, history, refinement, cancellation.",
  );
  console.log(
    "Synthetic protocol fixture only; no real LLM/provider calls or production backend validation.",
  );
} finally {
  await server.close();
}
