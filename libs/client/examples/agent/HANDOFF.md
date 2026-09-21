# Test the Agent SDK

This is the setup and acceptance guide for the experimental Agent SDK. The SDK
uses the real fal Agent runtime through a signed-in browser session. It is not a
public FAL_KEY API. Use matching SDK and runtime checkouts; rebuild the playground
after SDK edits.

## 1. Run the free checks first

Use Node 22.22+, npm 11.15+ for fal-js, and pnpm 11.25+ for web-app.
From the fal-js checkout:

```sh
npm ci
npm run test:agent
npm run typecheck:agent
```

`test:agent` runs SDK unit tests, playground host tests, and both sets of executable
examples against the loopback HTTP/SSE fixture. No sign-in, database, LLM, or paid
provider call is involved. This checks SDK behavior, not production authentication
or provider reliability.

From the matching web-app checkout:

```sh
pnpm install --frozen-lockfile
pnpm run check:local
pnpm run build:compile --concurrency=1 --filter='./packages/*'
pnpm run test:agent-sdk:local
pnpm run typecheck:web:local
```

The runtime test command covers the adapter and affected native execution paths.
Database tests are skipped unless explicitly enabled. With the local PostgreSQL
instance running at `localhost:54320/fal-web`:

```sh
AGENT_SDK_DATABASE_TEST=1 pnpm run test:web:local src/lib/agent-sdk/state.integration.test.ts
```

That test uses a random disposable schema and removes it afterward. It does not
load `.env` or connect to a remote database. It covers ownership, retention,
concurrent readers, recovery hashes, plan guards, deletion fences, and final picks.

## 2. Prepare the signed-in runtime

Use the team's normal local Agent setup, including database, model registry,
backend credentials, and an account with Agent access. Configure your own
`apps/web/.env.local` and `apps/api/.env.local`; the web environment needs a local
`CSRF_SECRET`. Do not copy another person's credentials into a bundle or script.

**Apply the runtime migrations before enabling the adapter.** Migration
`0162_agent_chat_deletions.sql` adds the deletion table and insertion fences.
From web-app, with `DATABASE_URL` targeting your local development database:

```sh
pnpm run db:migrate
```

Do not renumber an already applied migration or edit the database migration ledger
by hand. If this database previously applied the experimental `0159_agent_chat_deletions`
migration, recreate a disposable development database or coordinate its migration
history before using the rebased branch.

Build the demo from fal-js (substitute the actual runtime checkout path):

```sh
node libs/client/examples/agent/build-session-demo.mjs ../web-app-agent-sdk
bash libs/client/examples/agent/start-local.sh ../web-app-agent-sdk
```

The launcher uses web port 3020 and API port 3021. If a compatible server already
runs with `AGENT_SDK_ENABLED=1`, reuse it and only rebuild the demo into that checkout.
Otherwise, ensure those ports are free. Sign in at
<http://127.0.0.1:3020/agent>, then open
<http://127.0.0.1:3020/agent-sdk-demo/index.html>.

## 3. Walk through acceptance

| Check                           | Action                                                                                                     | Expected result                                                                                |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Question, free of media charges | API tests → Question & answer; run, then answer                                                            | Trailing text appears before handoff; the same response ID resumes and completes.              |
| Approval                        | Create the two-step text plan, load it, edit/save, run, approve step two                                   | Revision advances; the checkpoint resumes once. Also exercise approval in Agent experience.    |
| Recovery                        | Disconnect while running, reload, load/reconnect                                                           | Existing work returns without creating another response.                                       |
| Cancellation                    | Cancel while waiting for an answer                                                                         | Response and pending question become cancelled. Disconnect alone must not cancel.              |
| Conversations                   | Create, rename, reopen, paginate, delete                                                                   | History is restored; deleted conversations cannot be read or resumed.                          |
| Resources                       | Use the SDK action panel for projects, documents, memory, settings, queues, and library assets/collections | Changes are reflected when read back; stale settings/plan revisions are rejected.              |
| Media, paid                     | Image & refinement; generate, select the artifact, describe an edit                                        | New response in the same conversation; the artifact ID is reused without uploading it again.   |
| Results, paid                   | Mark/unmark a completed artifact as final; load generation summary                                         | Explicit final selection persists; generation costs distinguish priced from unpriced requests. |

Repeat observation with Streaming and Polling. Text-only runs still invoke the
Agent model; “free” above means no media generation, not a billing guarantee.
Provider cancellation, provider failures, and concurrent duplicate paid submissions
need deliberate live testing before a public release. The historical reports in
this folder are dated evidence, not verification of the current checkout.

## Report a failure

Include both commit IDs, test/prompt, transport, response/conversation ID, expected
versus actual result, and the relevant JSON/lifecycle excerpt. Exclude credentials
and private inputs. For uncertain submissions, retain the exact request and
idempotency key; creating a new key starts new work.

## Where the documentation lives

- [SDK reference](../../src/agent/README.md): current API, lifecycle, limits.
- [Direct examples](./simple/README.md): short runnable SDK calls.
- [Integration recipes](./recipes/README.md): host persistence and delegation.
- web-app `docs/agent/SDK_SESSION_ADAPTER.md`: runtime setup, persistence, migrations.
- [Historical workspace findings](./WORKSPACE_FINDINGS.md): earlier live sessions.

When behavior changes, update the reference and relevant example in the same
change. Keep setup and acceptance steps here instead of copying capability lists
into multiple handoffs.
