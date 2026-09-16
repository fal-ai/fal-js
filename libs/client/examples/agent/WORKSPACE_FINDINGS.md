<!-- cspell:words apek dogfood worktree inspectable idempotency schnell typecheck -->
<!-- cspell:ignore uagcvqv llaoheockealtek bsbsm kncjbu bejd koiulja pjhcu -->

# Agent experience built with the SDK

September 16, 2026 · Local dogfood prototype, not full first-party parity

## Try it

Use the SDK branch `apek/agent-sdk-v1` with web-app branch
`apek/agent-sdk-runtime`, a working signed-in Agent environment, and
`AGENT_SDK_ENABLED=1`.

From the fal-js checkout:

```sh
node libs/client/examples/agent/build-session-demo.mjs /path/to/web-app-worktree
```

Open `/agent-sdk-demo/index.html` on the web app's local origin and select the
**Agent experience** tab beside **API tests**. Both views stay mounted in the same
page, preserving drafts and ongoing observation when switching. The agent view
uses a scoped DOM root so its controls and styles do not conflict with API tests.
A direct link selects the tab: <http://127.0.0.1:3020/agent-sdk-demo/index.html#agent>.
Earlier `/agent-sdk-demo/agent.html` links redirect to this tab.

Select a starter to populate the composer, then send. A useful sequence is:

1. Explore a visual direction and answer the question.
2. Ask for one image in that direction.
3. Click **Use in next message** on the image and request a change.
4. Disconnect during work and reload the page to recover.
5. Request a plan card without executing it.

Real media generation uses your account and normal charges. The separate Lucas
handoff ZIP is an earlier snapshot and does not include this new page.

## What was built

- A conversation view backed exclusively by `createFalClient(...).agent` for
  Agent actions. The only private import is `secureFetch`, the existing
  first-party session/CSRF transport. No direct tRPC, DB or runtime imports.
- Follow-up turns share a conversation. Question answers resume the same
  response; an image refinement creates a new response with an artifact ID.
- Inline text, clarification questions, approvals and selections; a read-only
  plan renderer; operation states; image/video/audio previews; safe file links.
- Unknown blocks retain their fallback text and inspectable structured data.
- Full JSON response is the default inspector. Lifecycle is an optional local
  observation log. Earlier responses can be selected without changing the chat.
- Streaming and polling, reconnect, explicit cancellation, and local recovery.
- Requests persist their payload and idempotency key before mutation. Uncertain
  failures expose **Retry the same request**, including after reload. Definitive
  validation/auth rejections unlock the UI. Reload never resubmits automatically.
- Question selection, text and focus survive unrelated snapshot updates.

The host saves response IDs, user prompts, answer receipts and any unconfirmed
command in this tab's session storage. It retrieves authoritative responses on
reload. This is not server conversation history, account-wide history, or a
cross-device persistence feature. New conversation resets this tab's view.

## Live evidence

One signed-in local conversation, `j6da9v8s71c6obs5qup1`:

| Step                     | Response                    | Observed result                                                                                                                                                                                |
| ------------------------ | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clarify visual direction | `resp_8qeo2r982f9a0uagcvqv` | Three options and accompanying text appeared before answering; choosing Warm artisan continued the same response to completion.                                                                |
| Generate image           | `resp_j7llaoheockealtek74o` | Follow-up retained the chosen direction, generated one FLUX schnell image, and rendered a loaded 512 × 512 preview.                                                                            |
| Refine by artifact       | `resp_bsbsm00j20kncjbu967j` | Referenced `dal6c62u40j637j592qg` without re-upload; sandbox image editor returned a second loaded 512 × 512 preview. Started in polling, disconnected, reloaded, recovered through streaming. |
| Plan without execution   | `resp_bejd2fu2176a3koiulja` | Structured plan rendered with five steps covering three shots, review and grading; no generation requested or performed by this turn.                                                          |

A second clarification, `resp_k7pjhcu37ffc64see95r`, was observed through
polling and cancelled while waiting. Both the response and its input request
became `cancelled`; the composer became available again.

Reload restored the previous turns and media. These IDs are evidence from
Apek's local database; they will not resolve against a separate local database.
The agent described its grading math; this test verifies SDK transport and
visible output, not independent pixel-level correctness of those claims.

## What this reveals about the SDK

### 1. Conversation history and answer receipts are the largest missing piece

A response is easy to render, but a conversation needs user messages, answers,
response boundaries and ordered history. The runtime adapter does not yet
implement `conversations.items.list`. We had to keep our own prompt/response
ledger and reconstruct it with individual retrieves.

An answered input request contains its new status but not the answer that was
submitted. The host must keep that receipt, too. Within a response, assistant
messages can span both sides of a user decision, so the output array alone does
not reconstruct a complete conversation timeline.

**Next:** implement ordered conversation items with user input and answer
receipts, retaining stable response/item IDs. Make this the main recovery path.

### 2. Plan rendering works; plan interaction still needs a contract

The real plan arrived as a `fal.block` with title, step IDs, detail, model and
approval-checkpoint fields. No custom runtime API was necessary to display it.
But plan editing is a typed SDK method backed by a 501 in this adapter. The
snapshot does not advertise which plan actions are currently supported.

The planning response completed with a textual request for feedback and no
`pending_input_ids`. That is a normal completed turn, not a structured approval
request. The host must not manufacture an Approve/Run action from that text.

**Next:** publish supported actions/capabilities with blocks (or a runtime
capability resource), and connect the specific first-party plan actions needed
for v1. Keep unsupported controls absent. Define typed table/task block schemas
before attempting matching interactive components; generic fallback alone is
not first-party parity.

### 3. Long stretches of work have little useful activity information

The refinement initially showed only `in_progress / running`. The sandbox edit
became a completed operation with its result later. The adapter projects media
run events; it does not represent every intermediate tool action. We cannot
claim the UI will explain what is happening during arbitrary tool work.

**Next:** expose a small, stable operation/activity representation for meaningful
non-media work. Avoid sending private reasoning. A human-readable label and
state would already improve perceived responsiveness.

### 4. A small optional host controller could remove substantial boilerplate

The low-level SDK calls are straightforward. Most host code manages observation
replacement, mutation locks, pending command recovery, input state and transcript
reconciliation. Both demo pages now need similar lifecycle glue.

**Next:** first stabilize history and capabilities, then consider an optional
framework-neutral conversation controller or a React adapter. Keep the current
low-level API for backend/agent integrations. Do not add more output types just
to absorb application state.

### 5. Output metadata still limits the product experience

The tested responses have `usage: null` and no `final_artifact_ids`. Images have
stable IDs and usable URLs; the UI can show and reference them. It cannot safely
label a selected final deliverable or display settled per-response cost. Plain
message text also has no answer/progress channel, so the host cannot reliably
separate final copy from narration.

**Next:** decide which of cost, final-output selection and text channels is
required for the first-party v1 experience; do not infer those fields in the UI.

## Validation and boundaries

- Live signed-in question/answer, contextual follow-up image, artifact refinement,
  loaded previews, reload/reconnect, plan display and cancellation while waiting
  verified in Chrome.
- Six isolated host regression tests pass: idempotent retry across reload,
  question draft/focus preservation, history recovery and artifact references,
  rejected input recovery, disconnect vs cancel, and safe fallback/partial results.
- The playground modules typecheck using the repository's TypeScript
  resolution/strictness settings; browser bundles build; formatting checks pass.
- Tests use fixture SDK responses and no network. Run from fal-js:

```sh
node --test libs/client/examples/agent/agent-workspace.test.mjs
```

Approval/selection forms and video/audio renderers are implemented but not
live-tested in this session. Unknown blocks and handled provider failures are
fixture-tested; no live provider failure or paid-job cancellation claim. Text
currently uses a safe plain-text renderer, so Markdown formatting remains
visible. Image attachment is by URL; direct upload UI, native mobile auth,
conversation listing, rich table/task renderers and editable plans remain out.
No production build, deployment, SDK publication or branch push was performed.

## Source

- `agent-workspace.html`: page and styles.
- `agent-workspace.ts`: public SDK host integration.
- `agent-workspace.test.mjs`: isolated host regression tests.
- `playground-tabs.ts`: accessible tab selection and one-time workspace mounting.
- `build-session-demo.mjs`: assembles the tabbed playground in the web checkout.
- `../../src/agent/README.md`: SDK contract and transport behavior.
- Web-app `docs/agent/SDK_SESSION_ADAPTER.md`: runtime adapter and limits.
