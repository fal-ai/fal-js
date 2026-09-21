# Agent SDK (experimental)

`createFalClient(...).agent` exposes the fal Agent runtime. The current adapter
requires a signed-in first-party session and `AGENT_SDK_ENABLED=1`; there is no
public Agent FAL_KEY endpoint. The SDK must be built from the matching source
checkout until this surface is released.

For setup and verification, start with the [testing guide](../../examples/agent/HANDOFF.md).
For short calls, see the [direct examples](../../examples/agent/simple/README.md).

## Connect

Inside the signed-in web app:

```ts
import { createFalClient } from "@fal-ai/client";
import { secureFetch } from "~/lib/csrf-client";

const agent = createFalClient({
  fetch: secureFetch,
  agent: { baseUrl: `${window.location.origin}/api/agent-v2/sdk` },
}).agent;
```

Use the app's session/CSRF transport. Do not put session cookies or backend keys
into a browser bundle. Resource access follows the current account and fal project.

## Submit and observe

```ts
const command = {
  request: { input: "Help me plan a product image." },
  idempotencyKey: crypto.randomUUID(),
};
// Persist command before sending if recovery across reloads matters.
const accepted = await agent.responses.create(command.request, {
  idempotencyKey: command.idempotencyKey,
});
// Persist accepted.id before observing.
for await (const response of agent.responses.stream(accepted.id)) {
  console.log(response.output_text, response.artifacts, response.pending_inputs);
}
```

`agent.run(request, options)` submits and polls; `agent.stream(request, options)`
submits and streams. Both accept `onAccepted` so a host can save the response ID.
`responses.wait(id)` polls existing work. `responses.retrieve(id)` reads once.
Observation stops when execution finishes **or** the response needs input.
A resolved call does not imply successful execution: inspect `status` and `error`.

Streaming delivers full SSE snapshots, not text deltas. Replace state by response
ID instead of appending `output_text`. Cursors detect replay and backwards state;
unknown events reconcile with an authoritative snapshot. Connections roll over
and reconnect without submitting new work.

`signal` and `timeoutMs` stop local observation only. `responses.cancel(id)`
explicitly requests execution/provider cancellation; already incurred charges
remain. `AgentRequestError` carries the HTTP status, response ID, idempotency key,
and last observed response when available.

Retry an uncertain create/answer/plan command with the **same key and body**.
Changed input returns 409. Resource mutations are sent once because the native
resource APIs do not provide idempotency receipts; read back before repeating an
uncertain write.

## Continue a conversation

Pass `conversation` for a follow-up, or `previous_response_id` for the latest
settled response; do not pass both. Forks are not supported. A follow-up creates a
new response; answering a pending question continues the original response.

```ts
await agent.responses.answer(response.id, {
  input_request_id: question.id,
  answer: {
    kind: "answers",
    answers: [{ question_id: "style", selected_option_ids: ["studio"] }],
  },
});
await agent.responses.wait(response.id);
```

Use IDs from the actual pending input. Clarifications accept selected option IDs
and optional free text where allowed. Approvals accept only
`{ kind: "approval", decision: "approve" | "reject" }`; no approval feedback or
selection-answer variant is implemented. Never auto-approve on a user's behalf.
Preferred-model questions still require the existing settings UI (422).

## Available resources

| Surface                             | Supported operations                                                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `responses`                         | create, retrieve, wait, stream, answer, cancel, selectFinalArtifacts                                               |
| `conversations`                     | create idle chat, list, retrieve, update title, delete, items.list, generationSummary                              |
| `plans`                             | retrieve, update editable plan, run with revision/idempotency guards                                               |
| `projects`                          | list/create/retrieve/update/delete, resources, conversations, documents, memory, asset/collection attachments      |
| `models`, `settings`, `preferences` | model discovery/capabilities and native settings/preferences with their revision guards                            |
| `queue`, `runs`                     | inspect, halt/resume, reorder/edit queued prompts, approval, dispatch, run retry/cancel                            |
| `library`                           | asset browse/register/detail/favorite/prompt/delete; collection list/create/update/move/favorite/delete/membership |
| `artifacts`                         | retrieve authorized completed media                                                                                |

Conversation deletion can return `{deleted: false}` while running work stops;
repeat deletion to finish cleanup. History pagination returns 409 if its snapshot
changes; restart from the first page. Artifact IDs and library asset-record IDs
are different identities; use the appropriate resource's ID.

## Edit and run a plan

Edits replace the complete list of editable steps. Retain IDs for existing steps,
omit an ID to add a step, omit an existing step to remove it, and reorder the array
to change execution order. Server-owned detail/reasoning remain on the server.

```ts
const plan = await agent.plans.retrieve(planId, { conversation });
const updated = await agent.plans.update(plan.id, {
  conversation,
  expected_revision: plan.revision,
  title: "Product campaign",
  steps: plan.data.steps.map((step) => ({
    id: step.id,
    label: step.label,
    endpoint_id: step.endpoint_id ?? null,
    model_pinned: step.model_pinned === true,
    requires_approval: step.requires_approval === true,
  })),
});
const execution = await agent.plans.run(updated.id, {
  conversation,
  expected_revision: updated.revision,
});
```

Plans have 1–50 steps, unique existing IDs, and a required endpoint for pinned
models. Stale revisions and edits during execution return 409. Plan runs preserve
checkpoints and resume through response approvals. Generic `operations.update`
is not part of this implemented API; use the queue/run controls.

## Media and costs

Pending generation is a `fal.operation`, not an artifact with a fabricated URL.
Completed output appears in `response.artifacts`. Refinement accepts
`{type: "fal.input_artifact", artifact_id, revision: 1}` alongside text in a user
message. Partial artifacts can survive a failed response.

`responses.selectFinalArtifacts(id, {artifact_ids, expected_sequence_number})`
saves explicit final picks after a response settles. `response.final_artifacts`
reflects that selection. Completion alone does not select every intermediate.

`conversations.generationSummary(id)` reports billed generation costs and unpriced
requests. It excludes LLM usage. Aggregate `response.usage` remains null.

## Limits

- No public-key/native-mobile auth, response forks, or token-delta events.
- Per-response `instructions`, `max_cost_usd`, and ambiguity policies other than
  `ask` are rejected. There is no enforced per-response spending cap.
- Canonical media is supported; general file/composition artifact adapters are not.
  Export blocks may retain native download links without becoming SDK artifacts.
- Blueprints/bake are outside this integration.
- Projection/history currently read whole conversations; broad rollout needs
  work on large-history reads.
