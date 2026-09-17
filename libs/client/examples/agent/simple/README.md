# Direct SDK calls

Start with [01-run.ts](./01-run.ts). These are scripts that call `fal.agent`
directly: no `runTask`, custom helper functions, UI callbacks or sign-in code.
[client.ts](./client.ts) contains the one-time client configuration.

| File                                                           | SDK call                                              |
| -------------------------------------------------------------- | ----------------------------------------------------- |
| [01-run.ts](./01-run.ts)                                       | `fal.agent.run(...)`                                  |
| [02-stream.ts](./02-stream.ts)                                 | `fal.agent.stream(...)`                               |
| [03-answer-a-question.ts](./03-answer-a-question.ts)           | `responses.answer(...)` then `responses.wait(...)`    |
| [04-refine-an-image.ts](./04-refine-an-image.ts)               | `run(...)` with a previous artifact ID                |
| [05-retrieve-and-reconnect.ts](./05-retrieve-and-reconnect.ts) | `responses.retrieve(...)` and `responses.stream(...)` |
| [06-cancel.ts](./06-cancel.ts)                                 | `responses.create(...)`, `cancel(...)`, `wait(...)`   |

Open the files in your IDE. TypeScript resolves the actual SDK source on this
branch, so autocomplete and Go to Definition work.

## Run one or all

From the fal-js repository root, after installing dependencies:

```sh
node libs/client/examples/agent/simple/run.mjs 01
node libs/client/examples/agent/simple/run.mjs all
node node_modules/typescript/bin/tsc -p libs/client/examples/agent/simple/tsconfig.json
```

The runner supplies a local test server and, for 04/05, a saved synthetic image
response. It always asks a fixed question for new conversations and returns
synthetic media after the answer. It does not interpret your prompt or make
real model calls. No real credentials or sign-in are needed.

**These are real SDK calls against a test backend.** Public FAL_KEY authentication
for the Agent runtime is still pending; these examples do not imply that it is
available. The [signed-in integration examples](../recipes/README.md) and
[playground setup](../HANDOFF.md) remain separate.

`run` and streaming stop when input is needed as well as at a final outcome.
Inspect status and pending inputs; a resolved call does not guarantee success.
An error thrown by the HTTP client is separate from `response.status: "failed"`.
For persistence callbacks, exact retries and host-agent delegation, see the
[more complete integration recipes](../recipes/README.md).
