// Runner infrastructure only: the numbered .ts files contain the SDK examples.
import { build } from "esbuild";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { startReferenceServer } from "../mock-server.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const names = (await readdir(here))
  .filter((name) => /^\d\d-.*\.ts$/.test(name))
  .sort();
const choice = process.argv[2] ?? "01";
const selected =
  choice === "all"
    ? names
    : names.filter((name) => name === choice || name.startsWith(`${choice}-`));
if (!selected.length)
  throw new Error(`Choose 01–06 or all. Available: ${names.join(", ")}`);
const temp = await mkdtemp(resolve(here, ".run-"));
let server;
try {
  server = await startReferenceServer();
  process.env.AGENT_EXAMPLE_BASE_URL = server.baseUrl;
  console.log(
    "Local synthetic responses only; no sign-in, real keys, LLM calls, or paid media.",
  );
  if (selected.some((name) => /^(04|05)-/.test(name))) {
    // Seed a fixture result for examples that start from existing work.
    // This fixture-only policy is not advertised by the signed-in runtime.
    const headers = {
      Authorization: "Key local-demo",
      "Content-Type": "application/json",
      "Idempotency-Key": crypto.randomUUID(),
    };
    const created = await fetch(`${server.baseUrl}/responses`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        input: "Fixture image",
        fal: { on_ambiguity: "assume" },
      }),
    });
    if (!created.ok) throw new Error(`Fixture setup failed: ${created.status}`);
    let response = await created.json();
    const deadline = Date.now() + 5000;
    while (response.status !== "completed") {
      if (Date.now() > deadline) throw new Error("Fixture setup timed out");
      await new Promise((resolve) => setTimeout(resolve, 20));
      const snapshot = await fetch(
        `${server.baseUrl}/responses/${response.id}`,
        { headers: { Authorization: headers.Authorization } },
      );
      if (!snapshot.ok)
        throw new Error(`Fixture read failed: ${snapshot.status}`);
      response = await snapshot.json();
    }
    process.env.EXAMPLE_RESPONSE_ID = response.id;
  }
  for (const name of selected) {
    const outfile = resolve(temp, name.replace(/\.ts$/, ".mjs"));
    await build({
      entryPoints: [resolve(here, name)],
      tsconfig: resolve(here, "tsconfig.json"),
      alias: { "@fal-ai/client": resolve(here, "../../../src/index.ts") },
      outfile,
      bundle: true,
      platform: "node",
      format: "esm",
      packages: "external",
      banner: {
        js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);',
      },
    });
    console.log(`\n--- ${name} ---`);
    await import(pathToFileURL(outfile).href);
  }
} finally {
  await server?.close();
  await rm(temp, { recursive: true, force: true });
}
