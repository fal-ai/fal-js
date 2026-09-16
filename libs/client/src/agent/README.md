<!-- cspell:words apek idempotency upserts abortable worktree -->

# Agent SDK (experimental)

The initial Agent client is part of `@fal-ai/client`, under `fal.agent` or
`createFalClient(...).agent`. It implements the proposed **fal Agent SDK V1 —
Draft** contract. It is not connected to a deployed production Responses API.
No production URL is assumed: callers must configure a compatible backend.

This client does not run an LLM, generate media locally, or enforce server-side
budgets/ownership. See the server obligations below. A first-party session adapter
now connects it to the real Agent runtime in the web-app's
`apek/agent-sdk-runtime` branch. The separate reference server remains a local,
synthetic integration fixture.

## Start with one call

```ts
import { createFalClient } from "@fal-ai/client";

const fal = createFalClient({
  // Backend configuration only. Never embed long-lived keys in a mobile app.
  credentials: process.env.FAL_KEY,
  agent: { baseUrl: "https://your-agent-backend.example/v1" },
});

const response = await fal.agent.run({ input: "Create a product campaign.", fal: { max_cost_usd: 2 } }, { onAccepted: ({ id }) => saveResponseId(id), timeoutMs: 120_000 });

if (response.fal.phase === "waiting_for_input") {
  showQuestions(response.pending_inputs);
} else {
  showOutcome(response.status, response.artifacts, response.error);
}
```

`saveResponseId`, `showQuestions`, and `showOutcome` are application functions.
The singleton supports the same configuration with `fal.config(...)`.
The rest of the existing fal client API is unchanged.

`run` returns at a terminal outcome **or required input**. An accepted execution
failure is returned as `status: "failed"`, with partial artifacts intact.
Transport/authentication/validation/protocol failures throw `AgentRequestError`
or `AgentProtocolError`. Recover using the error's `responseId` when known; an
ambiguous create also carries its `idempotencyKey`.

## Response model

One ordered `output` array contains:

| Type                | Meaning                                                           |
| ------------------- | ----------------------------------------------------------------- |
| `message`           | Text and structured blocks such as plans/tables                   |
| `fal.operation`     | Work that can be queued, running, completed, failed, or cancelled |
| `fal.artifact`      | Media, file, data, or editable composition results                |
| `fal.input_request` | Clarification, approval, or artifact selection                    |

`output_text`, `artifacts`, `final_artifacts`, and `pending_inputs` are derived
SDK getters. They are not persisted by `JSON.stringify(response)`. `output_text`
contains message text, not an inferred "final answer only". Artifact selection
uses `fal.final_artifact_ids` and preserves its ordering. A queued operation does
not manufacture an empty artifact or pretend to have a URL.

The outer statuses retain the Responses vocabulary. Attention is
`status: "in_progress"` plus `fal.phase: "waiting_for_input"`. These fal item,
phase, and input variants are extensions, not standard OpenAI schemas.

## Stream the same result

```ts
const accepted = await fal.agent.responses.create(request);
saveResponseId(accepted.id);

for await (const response of fal.agent.responses.stream(accepted.id)) {
  render(response);
}
```

Or use `fal.agent.stream(request)` to create and observe in one helper. Streaming
yields an initial snapshot and updates, stops after required input or a terminal
outcome, and reconnects from the last cursor on an interrupted connection.
It never resubmits the original job. The SDK does not retain all prior snapshots;
applications should replace state by response/item ID, not append duplicates.

Unknown events, missing events, and HTTP 410 replay expiry cause authoritative
snapshot recovery. Malformed JSON/envelopes or mismatched response IDs fail
explicitly. The core recognizes text deltas, content-part changes, item upserts,
and full response snapshots. Unknown display block kinds retain fallback text;
unknown pending decision kinds fail closed.

`maxReconnects` (default 3) bounds consecutive reconnects without cursor progress;
`reconnectDelayMs` defaults to 500. An optional `timeoutMs` bounds the whole local
observation. With no timeout, a healthy long-running stream can continue.

## Answer, continue, and refine

```ts
await fal.agent.responses.answer(response.id, {
  input_request_id: question.id,
  answer: {
    kind: "answers",
    answers: [{ question_id: "style", selected_option_ids: ["studio"] }],
  },
});
const next = await fal.agent.responses.wait(response.id);
```

Approval answers are `{ kind: "approval", decision: "approve" | "reject" |
"request_changes", text? }`. Selection answers are `{ kind: "selection",
artifact_ids: [...] }`. The server binds the pending request to the exact target
revision/scope; answers cannot raise permissions or the original budget.

Another agent can supply those same typed answers or escalate to a person. No
framework adapter is required. A complete host must handle repeated questions,
timeouts, stale decisions, and unsuccessful outcomes rather than blindly approving.

Refinement starts a **new response**; answering resumes the existing one:

```ts
const refined = await fal.agent.run({
  conversation: response.fal.conversation_id,
  input: [
    {
      role: "user",
      content: [
        { type: "input_text", text: "Make this one warmer." },
        { type: "fal.input_artifact", artifact_id: chosen.id, revision: chosen.revision },
      ],
    },
  ],
});
```

Use existing `fal.storage.upload(file)` for uploads, followed by `input_image` or
`input_file` URL content. Do not pass private local filesystem paths as URLs.

## Recovery, cancellation, and retries

- Save the response ID; retrieve it after app restart with `responses.retrieve`.
- `responses.create` always submits with `background: true` and returns promptly.
- `responses.wait` polls (default 1000 ms) until terminal state or required input.
- `responses.cancel` requests server cancellation and may return a cancelling
  response before settlement. Call `wait` or `retrieve` to observe the outcome.
- Breaking iteration, AbortSignal, deadline expiry, or a disconnected client
  stops local observation **only**. No cancel request is implicitly sent.
- Each logical mutation gets one random idempotency key, reused on transport
  retries. Supply `idempotencyKey` to recover the same mutation after restart.
  New method invocations normally mean new work. Keys are not content caching.
- Backoff uses existing client retry settings and is locally abortable. HTTP
  409 is not retried. Unknown provider acceptance must be handled on the server.
- Runtimes without `crypto.randomUUID` must provide an explicit idempotency key.

Do not store customer keys in browsers/mobile bundles. Existing proxy middleware
works for Agent HTTP requests, but the application gateway must authenticate its
users, authorize resources, restrict forwarding, and support streaming. React
Native and native Swift/Kotlin runtimes have not been validated by this change.

## Additional surfaces

- `conversations.list`, `retrieve`, `update`, `delete`, and `items.list`.
- `plans.update(id, { expected_revision, changes })` for typed step edits,
  ordering, model pins, and checkpoints.
- `operations.update` for advertised queued-work rename/reorder controls.
- `artifacts.retrieve(id, { revision? })` to resolve metadata/authorized URLs.

Conversation pages have `{ data, next_cursor }`. They include user input,
input-answer receipts, and response output, rather than pretending a single
response is the whole transcript. Deletion is separate from cancellation.
The server must expose operation revision/capabilities before allowing edits.

These are typed transport surfaces; backend support is required for each. This
implementation does not claim full first-party UI parity or a shipped mobile app.

## Draft HTTP contract implemented by this SDK

All routes are relative to the explicitly configured base URL (normally `/v1`).

| Method/path                                       | Result                                          |
| ------------------------------------------------- | ----------------------------------------------- |
| `POST /responses`                                 | Accepted AgentResponse; `background: true`      |
| `GET /responses/:id`                              | Atomic AgentResponse snapshot                   |
| `GET /responses/:id?stream=true&starting_after=N` | SSE after snapshot cursor N                     |
| `POST /responses/:id/input`                       | Current AgentResponse after answer acceptance   |
| `POST /responses/:id/cancel`                      | Current AgentResponse after cancellation intent |
| `GET /conversations[?cursor=&limit=]`             | Conversation page                               |
| `GET/PATCH/DELETE /conversations/:id`             | Conversation or deletion receipt                |
| `GET /conversations/:id/items[?cursor=&limit=]`   | History page                                    |
| `PATCH /agent/plans/:id`                          | Versioned plan block                            |
| `PATCH /agent/operations/:id`                     | Updated operation                               |
| `GET /agent/artifacts/:id[?revision=]`            | Artifact metadata                               |

Mutations send `Idempotency-Key`. Authentication and request middleware use the
existing fal client flow; this contract does not advertise unchanged OpenAI-client
compatibility.

### Server obligations (not implemented by this client)

1. Persist acceptance, key attribution, settings, and dispatch intent before
   returning a response. Ensure retries do not duplicate paid work.
2. Enforce account/project ownership, limits, budgets, answer authorization,
   revision conflicts, retention, and deletion. Do not trust caller-supplied IDs.
3. Continue execution without a browser. Persist provider outcomes, publish
   readable artifacts, and schedule continuations.
4. Supply `fal.sequence_number` for every snapshot. It is a nonnegative,
   contiguous, response-wide change cursor. State changes and their events must
   be atomically ordered. All snapshots used for replay recovery are at least as
   current as events already observed. Do not change state without advancing it.
5. Replay every event after that cursor, or return 410 to request resync. SSE
   event JSON carries `type`, `response_id`, and `sequence_number`. A snapshot
   event also carries `response`; its cursor must equal the envelope cursor.
6. Emit a full snapshot when response status, selected artifacts, or pending
   input changes. Item deltas alone must not leave those indexes inconsistent.
7. A late callback must not restart cancelled work, reopen terminal output
   selection, or recreate deleted resources. Reconcile incurred usage honestly.

Supported incremental events: `response.output_item.added`,
`response.output_item.done`, `fal.output_item.updated`,
`response.content_part.added`, `response.content_part.done`, and
`response.output_text.delta`. All full-snapshot events use the same envelope.
Stream parsing is bounded; oversized frames (4 MiB) or excessive buffered events
fail rather than exhausting memory.

## Local development

### Real signed-in Agent runtime

With the web-app worktree on `apek/agent-sdk-runtime`, build the browser harness
from this SDK repository:

```sh
node libs/client/examples/agent/build-session-demo.mjs /path/to/web-app-worktree
```

Start that web-app worktree with `AGENT_SDK_ENABLED=1 fal-dev`, then visit its web
origin at `/agent-sdk-demo/index.html`. Sign in through `/agent` if needed. The
harness bundles this SDK and the web app's `secureFetch` CSRF wrapper, using the
existing session at `/api/agent-v2/sdk`. Its default prompt asks a question and
avoids media generation. Normal runtime charges apply when generating media.

The adapter supports create, retrieve, stream, wait, question/approval answers,
cancellation, media artifact retrieval and conversation retrieval. Editing and
history APIs return 501. Per-response instructions/budgets are rejected; public
FAL_KEY access and mobile authentication are separate work. See the web-app's
`docs/agent/SDK_SESSION_ADAPTER.md` for the precise supported surface and limits.

The signed-in flow has been exercised against the real runtime: question,
answer, streamed continuation, completion, recovery after reload, and cancellation
while waiting for input. A subsequent browser session verified image generation,
sandbox editing and generative refinement by artifact ID, including disconnect
and polling recovery. The harness now includes image previews, artifact-based
refinement, a streaming/polling selector and an observed lifecycle log. Live
provider cancellation remains unverified.

The playground has two explicit tests: **Question & answer** and **Image &
refinement**. Choosing a test fills an editable prompt; **Run test** submits it.
The image test renders previews and lets you select an artifact for refinement.
Images stay visible across refinements in the same conversation. The inspector
shows the full JSON response by default, with Lifecycle as a secondary tab and a
Streaming/Polling switch that reconnects observation without submitting new work.
Reloading retrieves the last response saved in this browser tab; **Load** can also
retrieve a response ID you provide. Gallery history is local to the current view.

### Synthetic fixture

From the repository root:

```sh
NX_DAEMON=false npx nx build client
node libs/client/examples/agent/smoke.mjs
```

The smoke script starts a loopback reference server on a random port. It runs a
question/answer -> queued generation -> artifact -> refinement journey, reopens
history, and verifies explicit cancellation. It makes no paid API calls.

The reference server keeps data only in memory and generates a placeholder SVG.
It is deliberately not proof of server durability, authorization isolation,
provider recovery, spending enforcement, or production compatibility.

Focused tests:

```sh
npx jest --config libs/client/jest.config.ts --runInBand --runTestsByPath libs/client/src/agent/client.spec.ts
```

### Conversation workspace example

The demo includes an **Agent experience** tab alongside **API tests** at
`/agent-sdk-demo/index.html#agent`. It uses the public SDK to build a small
multi-turn chat with inline questions, plans, media, references and recovery.
See [workspace findings](../../examples/agent/WORKSPACE_FINDINGS.md) for the live
checks, limitations and proposed next SDK work.
