/** Verify the built client in an isolated npm consumer without its optional peer. */
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const { mkdtempSync, existsSync, writeFileSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join } = require("node:path");

const consumer = mkdtempSync(join(tmpdir(), "fal-client-optional-peer-"));
try {
  const packed = JSON.parse(
    execFileSync(
      "npm",
      ["pack", "./dist/libs/client", "--pack-destination", consumer, "--json"],
      { encoding: "utf8" },
    ),
  )[0];
  writeFileSync(
    join(consumer, "package.json"),
    JSON.stringify({
      name: "optional-peer-check",
      version: "1.0.0",
      private: true,
    }),
  );
  execFileSync(
    "npm",
    [
      "install",
      join(consumer, packed.filename),
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
    ],
    { cwd: consumer, stdio: "pipe" },
  );
  assert.equal(
    existsSync(join(consumer, "node_modules/@happy-oyster/js-sdk")),
    false,
    "normal installs must not install the vendor SDK",
  );
  const client = join(consumer, "node_modules/@fal-ai/client");
  const manifest = require(join(client, "package.json"));
  assert.equal(manifest.peerDependencies["@happy-oyster/js-sdk"], "0.1.4");
  assert.equal(
    manifest.peerDependenciesMeta["@happy-oyster/js-sdk"].optional,
    true,
  );
  assert.equal(manifest.dependencies["@happy-oyster/js-sdk"], undefined);
  assert.equal(existsSync(join(client, "HAPPY_OYSTER.md")), true);
  writeFileSync(
    join(consumer, "check.cjs"),
    `
    const assert = require('node:assert/strict');
    require('@fal-ai/client');
    require('@fal-ai/client/realtime');
    const { happyOyster } = require('@fal-ai/client/happy-oyster');
    (async () => {
      let cleanups = [];
      let calls = [];
      const context = {
        signal: new AbortController().signal,
        run: async endpoint => {
          calls.push(endpoint);
          assert.ok(endpoint.endsWith('/worlds/build-status'));
          return {data:{encrypted_world_id:'world',status:'ready',mode:'adventure'}};
        },
        endpointId:'test/happy-oyster-wma',
        addCleanup: cleanup => cleanups.push(cleanup),
        diagnostic: () => {},
      };
      for (let i=0; i<2; i++) {
        await assert.rejects(happyOyster().open(context,{worldId:'world',videoElement:{}}), error => error.code === 'sdk_unavailable' && error.message.includes('@happy-oyster/js-sdk@0.1.4'));
        for (const cleanup of cleanups.splice(0)) await cleanup();
      }
      assert.equal(calls.length,2);
      console.log('PASS: core/subpath imports, missing-peer error, no billing, cleanup/retry');
    })().catch(error => {console.error(error);process.exitCode=1});
  `,
  );
  execFileSync(process.execPath, [join(consumer, "check.cjs")], {
    cwd: consumer,
    stdio: "inherit",
  });
  console.log(
    "PASS: isolated npm install omits optional vendor dependency; packed exports/docs/peer metadata verified",
  );
} finally {
  rmSync(consumer, { recursive: true, force: true });
}
