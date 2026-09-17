// Executed by run.mjs against the local synthetic server, never production.
import { createFalClient, type AgentResponseView } from "@fal-ai/client";
import assert from "node:assert/strict";
import { runTask } from "./01-run";
import { streamTask } from "./02-stream";
import { answerInput } from "./03-answer";
import { generateImage, refineImage } from "./04-media";
import { cancelExecution, restoreResponse, submitOrRetry } from "./05-recovery";
import { delegateToFal } from "./06-agent-to-agent";

export async function demo(baseUrl: string) {
  const agent = createFalClient({
    credentials: "local-demo", // Fixture token, not a real fal credential.
    agent: { baseUrl },
  }).agent;
  let savedId = "";
  const save = (id: string) => {
    savedId = id;
    console.log("Saved response:", id);
  };
  const render = (r: AgentResponseView) =>
    console.log("Snapshot:", r.id, r.status, r.fal.phase);

  const first = await runTask(
    agent,
    "Help me choose a visual direction.",
    save,
  );
  assert.equal(first.id, savedId);
  const request = first.pending_inputs[0];
  assert.equal(request?.kind, "clarification");
  if (request.kind !== "clarification")
    throw new Error("Expected fixture question");
  // This fixed choice is only for the synthetic demo. A real host asks its user.
  const completed = await answerInput(agent, first.id, request.id, {
    kind: "answers",
    answers: request.questions.map((q) => ({
      question_id: q.id,
      selected_option_ids: [q.options[0].id],
    })),
  });
  assert.equal(completed.id, first.id);
  assert.equal(completed.status, "completed");

  const streamed = await streamTask(
    agent,
    "Ask me for a direction.",
    save,
    render,
  );
  assert.equal(streamed?.fal.phase, "waiting_for_input");
  assert.equal((await cancelExecution(agent, savedId)).status, "cancelled");

  const image = await generateImage(agent, completed.fal.conversation_id);
  const artifact = image.artifacts[0];
  assert(artifact);
  const refined = await refineImage(agent, image.fal.conversation_id, artifact);
  assert.equal(refined.status, "completed");
  assert.notEqual(refined.id, image.id);
  assert.equal(refined.fal.conversation_id, image.fal.conversation_id);
  assert.equal((await restoreResponse(agent, refined.id)).id, refined.id);

  const command = {
    request: { input: "A recoverable request." },
    idempotencyKey: crypto.randomUUID(),
  };
  const accepted = await submitOrRetry(agent, command);
  const retried = await submitOrRetry(agent, command);
  assert.equal(accepted.id, retried.id);
  await cancelExecution(agent, accepted.id);

  const delegated = await delegateToFal(agent, "Plan a campaign.");
  assert.equal(delegated.outcome, "needs_input");
  await cancelExecution(agent, delegated.responseId);
  console.log(
    "PASS: run, stream, answer, media, refinement, recovery, retry, cancel, delegation.",
  );
  console.log(
    "Synthetic responses only. No LLM calls, paid generations, or production authentication.",
  );
}
