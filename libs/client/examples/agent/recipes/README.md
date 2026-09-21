<!-- cspell:words idempotency -->

# Agent SDK: integration recipes

For the simplest SDK calls without wrappers or sign-in setup, start with the
[direct examples](../simple/README.md). This folder covers host integration.

Each numbered file is a small exported
function, with real SDK types, comments and no playground UI code.

| File                                           | What to inspect                                                  |
| ---------------------------------------------- | ---------------------------------------------------------------- |
| [00-client.ts](./00-client.ts)                 | Configure the signed-in runtime transport.                       |
| [01-run.ts](./01-run.ts)                       | One call that returns a result or a question.                    |
| [02-stream.ts](./02-stream.ts)                 | Create once, save the ID, render streaming snapshots.            |
| [03-answer.ts](./03-answer.ts)                 | Send a typed answer and continue the same response.              |
| [04-media.ts](./04-media.ts)                   | Generate an image, then refine by artifact ID.                   |
| [05-recovery.ts](./05-recovery.ts)             | Retry with the same key, retrieve saved work, cancel explicitly. |
| [06-agent-to-agent.ts](./06-agent-to-agent.ts) | Expose fal Agent as a tool in your own agent.                    |

Imports use `@fal-ai/client`. The local TypeScript configuration points that
name at this branch's source, so IDE autocomplete and Go to Definition work
without publishing or installing a new SDK release. The released npm package
does not yet contain this experimental Agent surface.

## Run the examples locally

From the fal-js repository root, after `npm ci` (Node 22.22+):

```sh
node libs/client/examples/agent/recipes/run.mjs
node node_modules/typescript/bin/tsc -p libs/client/examples/agent/recipes/tsconfig.json
```

[demo.ts](./demo.ts) calls the recipes against our local HTTP/SSE fixture and
checks their results. The fixture always asks a fixed question for a new
conversation and produces a synthetic image after the answer. It does not
interpret prompts, run an LLM or generate paid media. The runner starts and
stops the fixture automatically and requires no credentials.

## Use the real runtime

Call the same functions with the client from `00-client.ts` inside the signed-in
web app. Pass the app's `secureFetch` and origin. See the [setup guide](../HANDOFF.md)
for both required branches and the playground. Do not paste session cookies
into Node or put a FAL_KEY in frontend code; public Agent key auth is not yet wired.
Real image runs incur normal generation charges.

## Details worth noticing

- `run`/`wait` return, and streams stop, when input is needed as well as when
  execution ends. Handle repeated questions, not just the first one.
- A question answer continues a response. A new prompt/refinement creates one.
- Stream snapshots replace current state; do not append their full text on every
  update. The current runtime streams snapshots, not individual text deltas.
- A queued operation has no artifact URL. Partial artifacts may survive failure.
- Closing observation does not cancel execution. Use `responses.cancel` explicitly.
- Persist the accepted ID for recovery. For uncertain submissions, persist and
  reuse the exact command and idempotency key. These recipes inject persistence
  callbacks; choosing durable storage is the host application's responsibility.
- `usage` remains null. Generation summaries report billed media costs separately;
  final artifacts are explicitly selected. See the [SDK reference](../../../src/agent/README.md).
