import { build } from "esbuild";
import { access, copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const webApp = process.argv[2];
if (!webApp)
  throw new Error(
    "Usage: node libs/client/examples/agent/build-session-demo.mjs /path/to/web-app-worktree",
  );
await access(resolve(webApp, "apps/web/package.json"));
const out = resolve(webApp, "apps/web/public/agent-sdk-demo");
await mkdir(out, { recursive: true });
await build({
  alias: {
    "@fal-sdk-demo/session-fetch": resolve(
      webApp,
      "apps/web/src/lib/csrf-client.ts",
    ),
  },
  entryPoints: [
    resolve(here, "session-demo.ts"),
    resolve(here, "playground-tabs.ts"),
  ],
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  outdir: out,
});
// Static page can't reach next/font's hashed URLs, so ship the brand fonts alongside it.
const fonts = resolve(webApp, "apps/web/src/styles/fonts");
await mkdir(resolve(out, "fonts"), { recursive: true });
for (const file of [
  "public-sans-rounded/PublicSansRounded-Regular.woff2",
  "public-sans-rounded/PublicSansRounded-Medium.woff2",
  "public-sans-rounded/PublicSansRounded-SemiBold.woff2",
  "public-sans-rounded/PublicSansRounded-Bold.woff2",
  "focal/focal-medium-web.woff2",
  "focal/focal-bold-web.woff2",
])
  await copyFile(
    resolve(fonts, file),
    resolve(out, "fonts", file.split("/").pop()),
  );
const workspace = await readFile(resolve(here, "agent-workspace.html"), "utf8");
const style = workspace.match(/<style>([\s\S]*?)<\/style>/)?.[1];
const body = workspace.match(/<body>([\s\S]*?)<\/body>/)?.[1];
if (!style || !body) throw new Error("Missing Agent workspace template");
const fragment = body
  .replace(/<header>[\s\S]*?<\/header>/, "")
  .replace(/<script[\s\S]*?<\/script>/g, "");
const template = `<template id="agent-workspace-template"><style>${style.replace(":root", ":host").replace(/\bbody\s*\{/, ".agent-root {")}</style><div class="agent-root">${fragment}</div></template>`;
const playground = await readFile(resolve(here, "session-demo.html"), "utf8");
await writeFile(
  resolve(out, "index.html"),
  playground.replace("<!-- AGENT_WORKSPACE_TEMPLATE -->", template),
);
// Keep earlier shared links useful; the workspace now lives in the main tabbed page.
await writeFile(
  resolve(out, "agent.html"),
  '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=index.html#agent"><title>Agent SDK Playground</title><a href="index.html#agent">Open Agent experience in the playground</a>',
);
console.log(
  `Built SDK demo at ${out}. Start the web app with AGENT_SDK_ENABLED=1, then visit /agent-sdk-demo/index.html.`,
);
