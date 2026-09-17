<!-- cspell:words apek dogfood -->

# Lucas — fal Agent SDK handoff

September 16, 2026 · Local experimental integration

## What you're testing

A TypeScript SDK (`createFalClient(...).agent`) connected to the real Agent
runtime through the existing signed-in fal session. The playground exercises the
SDK itself: questions, answers, text, generation, artifacts, refinement and
reconnection. It does not need a public Agent API key.

| Repository                                          | Working branch           |
| --------------------------------------------------- | ------------------------ |
| [fal-ai/fal-js](https://github.com/fal-ai/fal-js)   | `apek/agent-sdk-v1`      |
| [fal-ai/web-app](https://github.com/fal-ai/web-app) | `apek/agent-sdk-runtime` |

## 1. Check out both branches

Clone the two repositories into sibling directories:

```sh
git clone --branch apek/agent-sdk-v1 https://github.com/fal-ai/fal-js.git fal-js-sdk
git clone --branch apek/agent-sdk-runtime https://github.com/fal-ai/web-app.git web-app-sdk-runtime
```

For existing checkouts, fetch origin and check out the matching branch in each
repo. Use these branches instead of applying the older handoff ZIP's patches.
The branches include the newer tabbed Agent experience and its findings.

## 2. Prepare and launch

Use Node 22.22+, npm 11.15+ for fal-js, and pnpm 11.25+ for web-app.
You need the team's normal working local Agent environment: database/schema and
model registry, backend credentials, and a signed-in account with Agent access.
Copy **your own** `apps/web/.env.local` and `apps/api/.env.local` from a working
web-app checkout into the corresponding paths in this checkout. Include a local
`CSRF_SECRET`; see the repo's example env file. This adapter adds no DB migration.

From the parent directory containing both checkouts:

```sh
(cd fal-js-sdk && npm ci)
(cd web-app-sdk-runtime && pnpm install --frozen-lockfile)
(cd web-app-sdk-runtime && pnpm exec turbo run build:compile --filter='@fal-ai/serverless-web-app^...' --concurrency=1)
(cd fal-js-sdk && node libs/client/examples/agent/build-session-demo.mjs ../web-app-sdk-runtime)
bash fal-js-sdk/libs/client/examples/agent/start-local.sh "$PWD/web-app-sdk-runtime"
```

The launcher starts web on **3020** and API on **3021**. Those ports must be free.
Use the normal registered development login origin; the supplied script uses
`http://127.0.0.1:3020`. Sign in at `/agent`, then open:

**http://127.0.0.1:3020/agent-sdk-demo/index.html**

The demo bundles SDK source directly; no npm publication or package linking is
needed. Re-run the demo build after changing SDK/demo source. Backend edits use
the usual dev reload. Ctrl+C stops the launcher. If `/agent` itself cannot run,
resolve the normal local app setup first.

## Small code examples

Start with [direct SDK examples](./simple/README.md) for short TypeScript scripts
without wrapper functions or sign-in code. [Integration recipes](./recipes/README.md)
cover the host application. Both include local runners with no paid calls.

## 3. Playground tabs

**API tests** contains the question and image tests below. **Agent experience**
builds a multi-turn chat using the same SDK, with questions, plans, media,
refinement, JSON inspection and recovery. Switching tabs preserves each view.
See [workspace findings](./WORKSPACE_FINDINGS.md) for verified behavior and gaps.

### API tests

### Question & answer

1. Select **01 · Question & answer**, then **Run question test**.
2. Wait for the question. Its accompanying text should appear **before** you
   answer. The response remains `in_progress`, phase `waiting_for_input` once
   the producer finishes writing.
3. Select an option and send the answer. The **same response ID** continues and
   finishes with an acknowledgement. No media is requested by this test.

### Image & refinement

1. Select **02 · Image & refinement**, then **Run image test**.
2. Observe an operation in progress, then an image artifact with a usable URL.
   Fast queue transitions may fall between snapshots. Normal generation charges
   apply.
3. Select the image, describe a change, and click **Refine image**. This creates
   a new response in the same conversation, using the artifact ID without a
   re-upload. Previous images stay visible for comparison within this view.
4. Try a warmth edit and an object replacement. The runtime may choose a sandbox
   edit for the first and a generative model for the second.

Repeat with **Streaming** and **Polling**. **JSON response** is the default
inspector tab: it is the full current API response object. **Lifecycle** is a
local log of observed changes, not a separate API resource or complete server
trace. Switching transport reconnects observation without resubmitting work.

**Disconnect** only stops observation. **Load** or a page refresh recovers the
saved response. **Cancel execution** requests server cancellation. The saved
response ID is local to this browser tab; history/gallery is not a full persisted
conversation UI. Apek's response IDs won't work against your separate local DB.

## What to look for / send back

- Missing or late text around a question; answer lost during updates.
- Duplicate work after reconnect/retry, or a response stuck in progress.
- Queued work incorrectly presented as an artifact before it has a result.
- Lost image references, failed refinements, or incomplete cancellation.
- SDK steps that feel unnecessarily complicated for a host app.

Include the test/prompt, transport, response ID, expected vs actual behavior,
and the relevant JSON/lifecycle excerpt. Redact credentials and private inputs.

## Current boundaries

- First-party session auth only; no public FAL_KEY or native-mobile auth yet.
- SSE delivers full snapshots, approximately once per second; not token deltas.
- `usage` is null; `final_artifact_ids` is empty. Use `response.artifacts` for
  available outputs. No per-response spending guarantee.
- Conversation history/list/edit/delete, plan edits and operation edits are
  not connected (501). Unsupported instructions/budgets are rejected (400).
- General file/composition exports need more adapters. Blueprints/bake are out.
- Provider cancellation, provider failure and concurrent duplicate paid requests
  still need live testing. Cancel-while-waiting, real image generation, two kinds
  of refinement, and disconnect/recovery have been exercised locally.

Latest fixes cover unnamed attachments, sandbox image MIME inference, and early
question handoff dropping trailing text. Streaming and polling were both checked
with text visible beside an unanswered question. Focused regression tests,
whole-web TypeScript and lint/format checks passed; no production build/deploy.

## Code map / deeper notes

- SDK: `fal-js/libs/client/src/agent/` and its `README.md`.
- Playground: `fal-js/libs/client/examples/agent/session-demo.{html,ts}`.
- Adapter: `web-app/apps/web/src/lib/agent-sdk/`.
- HTTP route: `/api/agent-v2/sdk` (enabled by `AGENT_SDK_ENABLED=1`).
- Persistence: `web-app/packages/data/src/db/entities/agent-sdk-response.ts`.
- Integration details: `web-app/docs/agent/SDK_SESSION_ADAPTER.md`.
- Earlier media test findings: `web-app/docs/agent/SDK_MEDIA_DOGFOOD_2026-09-16.md`.
