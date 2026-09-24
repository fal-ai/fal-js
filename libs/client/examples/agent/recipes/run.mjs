import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { startReferenceServer } from "../mock-server.mjs";

const here = dirname(fileURLToPath(import.meta.url));
// Keep the temporary bundle inside this checkout so Node resolves dependencies.
const temp = await mkdtemp(resolve(here, ".run-"));
let server;
try {
  const outfile = resolve(temp, "demo.cjs");
  await build({
    entryPoints: [resolve(here, "demo.ts")],
    tsconfig: resolve(here, "tsconfig.json"),
    outfile,
    alias: { "@fal-ai/client": resolve(here, "../../../src/index.ts") },
    bundle: true,
    platform: "node",
    format: "cjs",
    packages: "external",
  });
  server = await startReferenceServer();
  const { demo } = createRequire(import.meta.url)(outfile);
  await demo(server.fetch);
} finally {
  await server?.close();
  await rm(temp, { recursive: true, force: true });
}
