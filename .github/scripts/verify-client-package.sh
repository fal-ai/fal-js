#!/usr/bin/env bash
set -euo pipefail

# Test the published package shape outside the workspace's TypeScript aliases.
smoke_dir=$(mktemp -d)
trap 'rm -rf "$smoke_dir"' EXIT
npm pack ./dist/libs/client --pack-destination "$smoke_dir"
npm install --prefix "$smoke_dir" "$smoke_dir"/*.tgz \
  --ignore-scripts --no-audit --no-fund --package-lock=false

cat > "$smoke_dir/consumer.ts" <<'TS'
import {
  createFalClient,
  fal,
  AgentRequestError,
  type AgentClient,
  type AgentRequest,
  type AgentResponseView,
} from "@fal-ai/client";

const agent: AgentClient = createFalClient({ credentials: "local-demo" }).agent;
const request: AgentRequest = { input: "Create a campaign." };
const response: Promise<AgentResponseView> = agent.responses.create(request);
const upload: AgentClient["projects"]["documents"]["upload"] =
  fal.agent.projects.documents.upload;
void [response, upload, AgentRequestError];
TS

node node_modules/typescript/bin/tsc --noEmit --strict \
  --target es2022 --module node16 --moduleResolution node16 \
  --lib es2022,dom,dom.iterable --types node \
  --typeRoots "$PWD/node_modules/@types" "$smoke_dir/consumer.ts"

cat > "$smoke_dir/exports.mjs" <<'JS'
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const manifest = JSON.parse(readFileSync(
  new URL("./node_modules/@fal-ai/client/package.json", import.meta.url), "utf8",
));
for (const subpath of Object.keys(manifest.exports)) {
  const name = `@fal-ai/client${subpath.slice(1)}`;
  assert(require(name));
  assert(await import(name));
}
const cjs = require("@fal-ai/client");
const esm = await import("@fal-ai/client");
assert.equal(esm.createFalClient, cjs.createFalClient);
assert.equal(esm.fal, cjs.fal);
console.log(`PASS: ${manifest.name}@${manifest.version} public CJS/ESM exports on ${process.version}`);
JS

# Existing synthetic HTTP/SSE scenarios; never contact a paid backend.
for node_version in 18 22; do
  npm exec --yes --package="node@$node_version" -- node "$smoke_dir/exports.mjs"
  npm exec --yes --package="node@$node_version" -- node \
    libs/client/examples/agent/smoke.mjs \
    "$smoke_dir/node_modules/@fal-ai/client"
done
