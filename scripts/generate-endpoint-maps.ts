#!/usr/bin/env tsx
/**
 * Generate per-category endpoint maps plus top-level barrels for
 * @fal-ai/schemas, and bundle each emitted JSON Schema with its transitive
 * `$ref` closure so consumers can pass schemas straight into LLM tool APIs.
 *
 * For each category we emit:
 *   - {category}/schemas.gen.ts        Rewritten in place: every XxxSchema gets
 *                                      a `$defs` field containing the transitive
 *                                      closure of #/components/schemas/... refs
 *                                      and refs are rewritten to #/$defs/...
 *   - {category}/endpoint-zod-map.ts   `{category}EndpointZodMap` const — record
 *                                      keyed by endpoint id with `{ input, output }`
 *                                      Zod schemas pulled from `zod.gen.ts`, plus
 *                                      `{Category}EndpointId = keyof typeof ...`.
 *   - {category}/endpoint-schema-map.ts  `{category}EndpointSchemaMap` const —
 *                                      same key set, values are the bundled
 *                                      JSON Schemas from schemas.gen.ts.
 *   - {category}/index.ts              Zod barrel: re-exports endpoint-zod-map +
 *                                      zod.gen (`@fal-ai/schemas/zod/{category}`).
 *   - {category}/schemas-index.ts      JSON Schema barrel: re-exports
 *                                      endpoint-schema-map + schemas.gen
 *                                      (`@fal-ai/schemas/schemas/{category}`).
 *
 * And at the package root:
 *   - schemas.ts  Namespaced JSON Schema barrels (per-category schemas-index).
 *   - zod.ts      Namespaced Zod barrels (per-category index).
 *   - index.ts    Default entry — re-exports schemas.ts.
 *
 * The endpoint **input** is read from the POST's `requestBody`. The **output**
 * is read from the sibling GET at `${pathKey}/requests/{request_id}` — the
 * POST's 200 response is always `QueueStatus` (queue ack), not the real result.
 *
 * Endpoint metadata is derived from the same merged OpenAPI specs that feed
 * @hey-api/openapi-ts (via scripts/merge-openapi-specs.ts), so renamed schemas
 * (e.g. FileTypeInputType2) resolve to the actual emitted zod names.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as prettier from "prettier";

import {
  buildMergedCategorySpecs,
  type MergedSpec,
} from "./merge-openapi-specs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMAS_SRC = join(__dirname, "..", "libs", "schemas", "src");

interface EndpointInfo {
  endpointId: string;
  inputType: string;
  outputType: string;
}

/**
 * Walk a merged spec's paths and pull out (endpointId, inputSchema, outputSchema)
 * triples for every POST operation. Uses the post-rename schema names so the
 * generated imports match the schemas emitted by heyapi.
 *
 * Input comes from the POST's `requestBody`. Output comes from the **sibling
 * GET** at `${pathKey}/requests/{request_id}` — the POST's 200 response is
 * always `QueueStatus` (queue ack), while the real per-endpoint output lives
 * on the GET that fetches the queued result.
 */
function extractEndpointsFromSpec(mergedSpec: MergedSpec): Array<EndpointInfo> {
  const endpoints: Array<EndpointInfo> = [];

  for (const [pathKey, pathItem] of Object.entries(mergedSpec.paths)) {
    const post = (pathItem as { post?: Record<string, any> }).post;
    if (!post) continue;

    const inputRef =
      post.requestBody?.content?.["application/json"]?.schema?.$ref;
    if (typeof inputRef !== "string") continue;

    const resultPathKey = `${pathKey}/requests/{request_id}`;
    const resultGet = (
      mergedSpec.paths[resultPathKey] as
        | { get?: Record<string, any> }
        | undefined
    )?.get;
    const outputRef =
      resultGet?.responses?.["200"]?.content?.["application/json"]?.schema
        ?.$ref;
    if (typeof outputRef !== "string") {
      console.warn(
        `  Warning: no sibling GET ${resultPathKey} found — skipping endpoint ${pathKey}`,
      );
      continue;
    }

    const inputType = inputRef.replace(/^#\/components\/schemas\//, "");
    const outputType = outputRef.replace(/^#\/components\/schemas\//, "");
    const endpointId = pathKey.replace(/^\//, "");
    endpoints.push({ endpointId, inputType, outputType });
  }

  return endpoints.sort((a, b) => a.endpointId.localeCompare(b.endpointId));
}

/**
 * Normalize a name to alphanumeric-lowercase. Used to resolve our source schema
 * names against the (PascalCased, separator-stripped) `z*` exports emitted by
 * the heyapi zod plugin — heyapi's exact naming rules are non-trivial, so we
 * match on the lossy normalized form instead of trying to reproduce them.
 */
function normalizeId(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

/**
 * Read `zod.gen.ts` and build a normalized -> actual export-name map for every
 * top-level `export const z*` it declares.
 */
function buildZodExportLookup(categoryPath: string): Map<string, string> {
  const source = readFileSync(join(categoryPath, "zod.gen.ts"), "utf-8");
  const lookup = new Map<string, string>();
  for (const match of source.matchAll(/export const (z[A-Za-z0-9_$]+)/g)) {
    const exportName = match[1]!;
    lookup.set(normalizeId(exportName.slice(1)), exportName);
  }
  return lookup;
}

/**
 * Read `schemas.gen.ts` and build a normalized -> actual export-name map for
 * every top-level `export const *Schema` it declares. Same lossy-normalization
 * trick as `buildZodExportLookup` to bridge heyapi's renaming.
 */
function buildSchemaExportLookup(categoryPath: string): Map<string, string> {
  const source = readFileSync(join(categoryPath, "schemas.gen.ts"), "utf-8");
  const lookup = new Map<string, string>();
  for (const match of source.matchAll(
    /export const ([A-Za-z0-9_$]+)Schema\b/g,
  )) {
    lookup.set(normalizeId(match[1]!), `${match[1]}Schema`);
  }
  return lookup;
}

/** PascalCase a category name; prefix with `Gen` if it'd start with a digit. */
function toPascalCase(str: string): string {
  const pascalCase = str
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
  return /^\d/.test(pascalCase) ? "Gen" + pascalCase : pascalCase;
}

/** camelCase variant of `toPascalCase` (first char lowered). */
function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

async function formatTypeScript(content: string): Promise<string> {
  const config = await prettier.resolveConfig(process.cwd());
  return prettier.format(content, { ...config, parser: "typescript" });
}

// ──────────────────────────────────────────────────────────────────────────────
// JSON Schema $defs bundling
// ──────────────────────────────────────────────────────────────────────────────

const COMPONENT_REF_PREFIX = "#/components/schemas/";
const DEFS_REF_PREFIX = "#/$defs/";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | { readonly [key: string]: JsonValue }
  | ReadonlyArray<JsonValue>;

/** Recursively collect every `#/components/schemas/Foo` ref name in a node. */
function collectComponentRefs(node: unknown, into: Set<string>): void {
  if (typeof node !== "object" || node === null) return;
  if (Array.isArray(node)) {
    for (const v of node) collectComponentRefs(v, into);
    return;
  }
  for (const [key, value] of Object.entries(node)) {
    if (
      key === "$ref" &&
      typeof value === "string" &&
      value.startsWith(COMPONENT_REF_PREFIX)
    ) {
      into.add(value.slice(COMPONENT_REF_PREFIX.length));
    } else {
      collectComponentRefs(value, into);
    }
  }
}

/** Clone a JSON value, rewriting `#/components/schemas/Foo` → `#/$defs/Foo`. */
function rewriteRefs(node: JsonValue): JsonValue {
  if (typeof node !== "object" || node === null) return node;
  if (Array.isArray(node)) return node.map(rewriteRefs);
  const out: Record<string, JsonValue> = {};
  for (const [key, value] of Object.entries(node)) {
    if (
      key === "$ref" &&
      typeof value === "string" &&
      value.startsWith(COMPONENT_REF_PREFIX)
    ) {
      out[key] = DEFS_REF_PREFIX + value.slice(COMPONENT_REF_PREFIX.length);
    } else {
      out[key] = rewriteRefs(value);
    }
  }
  return out;
}

/**
 * Bundle `name` with its transitive ref closure into a self-contained JSON
 * Schema. Returns the rewritten schema with a `$defs` field (only if the
 * closure is non-empty) — the input itself is not mutated.
 */
function bundleSchemaWithDefs(
  name: string,
  schemas: Record<string, JsonValue>,
  category: string,
): JsonValue {
  const root = schemas[name];
  if (root === undefined) {
    throw new Error(`Schema not found in ${category}: ${name}`);
  }

  const closure = new Set<string>();
  const queue: Array<string> = [];
  const seedRefs = new Set<string>();
  collectComponentRefs(root, seedRefs);
  for (const r of seedRefs) {
    if (r !== name) queue.push(r);
  }
  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (closure.has(cur)) continue;
    closure.add(cur);
    const target = schemas[cur];
    if (target === undefined) {
      console.warn(
        `  Warning: ref target '${cur}' not found in ${category}/schemas.gen.ts (transitively referenced from '${name}')`,
      );
      continue;
    }
    const subRefs = new Set<string>();
    collectComponentRefs(target, subRefs);
    for (const r of subRefs) {
      if (r !== name && !closure.has(r)) queue.push(r);
    }
  }

  const rewrittenRoot = rewriteRefs(root) as Record<string, JsonValue>;
  if (closure.size === 0) return rewrittenRoot;

  const defs: Record<string, JsonValue> = {};
  for (const refName of [...closure].sort()) {
    const target = schemas[refName];
    if (target === undefined) continue;
    defs[refName] = rewriteRefs(target);
  }
  return { ...rewrittenRoot, $defs: defs };
}

/**
 * Load every `XxxSchema` export from a category's `schemas.gen.ts` at runtime.
 * Returns a map keyed by the schema's source name (without the `Schema` suffix)
 * since that matches the names used in `$ref` strings.
 */
async function loadCategorySchemas(
  categoryPath: string,
): Promise<Record<string, JsonValue>> {
  const url = pathToFileURL(join(categoryPath, "schemas.gen.ts")).href;
  const mod = (await import(url)) as Record<string, unknown>;
  const out: Record<string, JsonValue> = {};
  for (const [exportName, value] of Object.entries(mod)) {
    if (exportName === "default") continue;
    if (!exportName.endsWith("Schema")) continue;
    out[exportName.slice(0, -"Schema".length)] = value as JsonValue;
  }
  return out;
}

/**
 * Rewrite `{category}/schemas.gen.ts` so every `XxxSchema` export is bundled
 * with its `$defs` closure and uses `#/$defs/...` refs. Idempotent — re-running
 * is safe because `rewriteRefs` is a no-op on already-rewritten refs.
 */
async function rewriteSchemasGen(
  category: string,
  categoryPath: string,
): Promise<void> {
  const schemas = await loadCategorySchemas(categoryPath);
  const sortedNames = Object.keys(schemas).sort();

  const lines = [
    `// AUTO-GENERATED - Do not edit manually`,
    `// Generated by @hey-api/openapi-ts and post-processed by`,
    `// scripts/generate-endpoint-maps.ts to embed each schema's $defs closure.`,
    ``,
  ];

  for (const name of sortedNames) {
    const bundled = bundleSchemaWithDefs(name, schemas, category);
    lines.push(
      `export const ${name}Schema = ${JSON.stringify(bundled)} as const;`,
      ``,
    );
  }

  const out = await formatTypeScript(lines.join("\n"));
  writeFileSync(join(categoryPath, "schemas.gen.ts"), out);
  console.log(`  ✓ Rewrote ${category}/schemas.gen.ts with $defs bundling`);
}

// ──────────────────────────────────────────────────────────────────────────────
// Per-category generators
// ──────────────────────────────────────────────────────────────────────────────

/**
 * `endpoint-zod-map.ts`: `{category}EndpointZodMap` const — a record keyed by
 * endpoint id pointing at `{ input, output }` Zod schemas, plus
 * `{Category}EndpointId = keyof typeof ...`. Explicit type annotation (rather
 * than `as const` + inference) keeps TS from materializing the full structural
 * type for every entry's Zod schemas — that's what trips TS7056 on large
 * categories (image, video).
 */
async function generateEndpointZodMap(
  category: string,
  categoryPath: string,
  endpoints: Array<EndpointInfo>,
): Promise<void> {
  const typeName = toPascalCase(category);
  const constName = `${toCamelCase(category)}EndpointZodMap`;
  const idTypeName = `${typeName}EndpointId`;
  const zodExports = buildZodExportLookup(categoryPath);

  const resolveZodName = (
    schemaName: string,
    endpointId: string,
  ): string | null => {
    const hit = zodExports.get(normalizeId(schemaName));
    if (!hit) {
      console.warn(
        `  Warning: no zod export found for schema "${schemaName}" (endpoint ${endpointId}) in ${category}/zod.gen.ts`,
      );
      return null;
    }
    return hit;
  };

  const resolved = endpoints.flatMap(
    ({ endpointId, inputType, outputType }) => {
      const inputName = resolveZodName(inputType, endpointId);
      const outputName = resolveZodName(outputType, endpointId);
      if (!inputName || !outputName) return [];
      return [{ endpointId, inputName, outputName }];
    },
  );

  const schemaImports = Array.from(
    new Set(resolved.flatMap((e) => [e.inputName, e.outputName])),
  ).sort();

  const lines = [
    `// AUTO-GENERATED - Do not edit manually`,
    `// Generated via scripts/generate-endpoint-maps.ts`,
    ``,
    `import {`,
    ...schemaImports.map((t) => `  ${t},`),
    `} from './zod.gen.js'`,
    ``,
    `/** Map of ${category} endpoint id -> Zod input/output schemas. */`,
    `export const ${constName}: {`,
  ];

  for (const { endpointId, inputName, outputName } of resolved) {
    lines.push(
      `  readonly '${endpointId}': { readonly input: typeof ${inputName}; readonly output: typeof ${outputName} },`,
    );
  }
  lines.push(`} = {`);
  for (const { endpointId, inputName, outputName } of resolved) {
    lines.push(
      `  '${endpointId}': { input: ${inputName}, output: ${outputName} },`,
    );
  }
  lines.push(`}`);
  lines.push(``);
  lines.push(`/** Union of valid ${category} endpoint ids. */`);
  lines.push(`export type ${idTypeName} = keyof typeof ${constName}`);

  const out = await formatTypeScript(lines.join("\n"));
  writeFileSync(join(categoryPath, "endpoint-zod-map.ts"), out);
  console.log(`  ✓ Generated ${category}/endpoint-zod-map.ts`);
}

/**
 * `endpoint-schema-map.ts`: `{category}EndpointSchemaMap` const — the same
 * record shape as the Zod map but pointing at the bundled JSON Schemas from
 * `schemas.gen.ts`. Each `input`/`output` value is self-contained (refs live
 * in `$defs` on the schema itself) so the values can be passed straight to
 * Anthropic / OpenAI tool APIs or `z.fromJSONSchema`.
 *
 * Explicit `typeof XxxSchema` annotation per entry (mirroring the Zod map)
 * so consumers reading `videoEndpointSchemaMap[id].input.properties.foo.enum`
 * get the literal `as const` types, and so TS doesn't have to infer the
 * structural type for hundreds of complex schema literals (TS7056).
 */
async function generateEndpointSchemaMap(
  category: string,
  categoryPath: string,
  endpoints: Array<EndpointInfo>,
): Promise<void> {
  const constName = `${toCamelCase(category)}EndpointSchemaMap`;
  const schemaExports = buildSchemaExportLookup(categoryPath);

  const resolveSchemaName = (
    schemaName: string,
    endpointId: string,
  ): string | null => {
    const hit = schemaExports.get(normalizeId(schemaName));
    if (!hit) {
      console.warn(
        `  Warning: no JSON Schema export found for "${schemaName}" (endpoint ${endpointId}) in ${category}/schemas.gen.ts`,
      );
      return null;
    }
    return hit;
  };

  const resolved = endpoints.flatMap(
    ({ endpointId, inputType, outputType }) => {
      const inputName = resolveSchemaName(inputType, endpointId);
      const outputName = resolveSchemaName(outputType, endpointId);
      if (!inputName || !outputName) return [];
      return [{ endpointId, inputName, outputName }];
    },
  );

  const schemaImports = Array.from(
    new Set(resolved.flatMap((e) => [e.inputName, e.outputName])),
  ).sort();

  const lines = [
    `// AUTO-GENERATED - Do not edit manually`,
    `// Generated via scripts/generate-endpoint-maps.ts`,
    ``,
    `import {`,
    ...schemaImports.map((t) => `  ${t},`),
    `} from './schemas.gen.js'`,
    ``,
    `/**`,
    ` * Map of ${category} endpoint id -> self-contained JSON Schemas.`,
    ` * Each input/output schema bundles its $ref closure under \`$defs\`, so it`,
    ` * can be handed directly to LLM tool APIs or \`z.fromJSONSchema\`.`,
    ` */`,
    `export const ${constName}: {`,
  ];
  for (const { endpointId, inputName, outputName } of resolved) {
    lines.push(
      `  readonly '${endpointId}': { readonly input: typeof ${inputName}; readonly output: typeof ${outputName} },`,
    );
  }
  lines.push(`} = {`);
  for (const { endpointId, inputName, outputName } of resolved) {
    lines.push(
      `  '${endpointId}': { input: ${inputName}, output: ${outputName} },`,
    );
  }
  lines.push(`}`);

  const out = await formatTypeScript(lines.join("\n"));
  writeFileSync(join(categoryPath, "endpoint-schema-map.ts"), out);
  console.log(`  ✓ Generated ${category}/endpoint-schema-map.ts`);
}

/**
 * Per-category Zod barrel — `@fal-ai/schemas/zod/{category}`. Re-exports the
 * endpoint Zod map + raw zod schemas.
 */
async function generateCategoryZodIndex(
  category: string,
  categoryPath: string,
): Promise<void> {
  const lines = [
    `// AUTO-GENERATED - Do not edit manually`,
    `// Generated via scripts/generate-endpoint-maps.ts`,
    ``,
    `export * from './endpoint-zod-map.js'`,
    `export * from './zod.gen.js'`,
  ];
  const out = await formatTypeScript(lines.join("\n"));
  writeFileSync(join(categoryPath, "index.ts"), out);
  console.log(`  ✓ Generated ${category}/index.ts`);
}

/**
 * Per-category JSON Schema barrel — `@fal-ai/schemas/schemas/{category}`.
 * Re-exports the endpoint schema map + raw JSON Schemas.
 */
async function generateCategorySchemasIndex(
  category: string,
  categoryPath: string,
): Promise<void> {
  const lines = [
    `// AUTO-GENERATED - Do not edit manually`,
    `// Generated via scripts/generate-endpoint-maps.ts`,
    ``,
    `export * from './endpoint-schema-map.js'`,
    `export * from './schemas.gen.js'`,
  ];
  const out = await formatTypeScript(lines.join("\n"));
  writeFileSync(join(categoryPath, "schemas-index.ts"), out);
  console.log(`  ✓ Generated ${category}/schemas-index.ts`);
}

// ──────────────────────────────────────────────────────────────────────────────
// Top-level barrels
// ──────────────────────────────────────────────────────────────────────────────

async function generateZodBarrel(
  processedCategories: Array<string>,
): Promise<void> {
  const lines = [
    `// AUTO-GENERATED - Do not edit manually`,
    `// Generated via scripts/generate-endpoint-maps.ts`,
    ``,
    `// Per-category Zod schemas — namespaced because raw input/output schema`,
    `// names collide across categories.`,
    ...processedCategories.map(
      (c) => `export * as ${toPascalCase(c)} from './${c}/index.js'`,
    ),
  ];
  const out = await formatTypeScript(lines.join("\n"));
  writeFileSync(join(SCHEMAS_SRC, "zod.ts"), out);
  console.log(`  ✓ Generated zod.ts`);
}

async function generateSchemasBarrel(
  processedCategories: Array<string>,
): Promise<void> {
  const lines = [
    `// AUTO-GENERATED - Do not edit manually`,
    `// Generated via scripts/generate-endpoint-maps.ts`,
    ``,
    `// Per-category JSON Schemas + endpoint schema maps.`,
    `// Namespaced to prevent name collisions across categories.`,
    ...processedCategories.map(
      (c) => `export * as ${toPascalCase(c)} from './${c}/schemas-index.js'`,
    ),
  ];
  const out = await formatTypeScript(lines.join("\n"));
  writeFileSync(join(SCHEMAS_SRC, "schemas.ts"), out);
  console.log(`  ✓ Generated schemas.ts`);
}

async function generateIndex(): Promise<void> {
  // Default entry re-exports only JSON Schemas so consumers can use the
  // package without installing the optional `zod` peer dependency.
  const lines = [
    `// AUTO-GENERATED - Do not edit manually`,
    `// Generated via scripts/generate-endpoint-maps.ts`,
    ``,
    `export * from './schemas.js'`,
  ];
  const out = await formatTypeScript(lines.join("\n"));
  writeFileSync(join(SCHEMAS_SRC, "index.ts"), out);
  console.log(`  ✓ Generated index.ts`);
}

// ──────────────────────────────────────────────────────────────────────────────
// Entry point
// ──────────────────────────────────────────────────────────────────────────────

async function main() {
  if (!existsSync(SCHEMAS_SRC)) {
    console.error("Error: libs/schemas/src/ directory not found.");
    process.exit(1);
  }

  console.log("Building merged OpenAPI specs per category...");
  const merged = buildMergedCategorySpecs();
  console.log(`Found ${merged.length} categories`);

  console.log("\nProcessing categories...");
  const processedCategories: Array<string> = [];
  for (const { category, mergedSpec } of merged) {
    const endpoints = extractEndpointsFromSpec(mergedSpec);
    if (endpoints.length === 0) {
      console.warn(`  Warning: No endpoints found for ${category}, skipping`);
      continue;
    }
    const categoryPath = join(SCHEMAS_SRC, category);
    if (!existsSync(categoryPath)) {
      console.warn(
        `  Warning: ${categoryPath} does not exist — run generate-schemas first. Skipping.`,
      );
      continue;
    }

    // Order matters: bundle $defs FIRST so the schema map can reference the
    // augmented schemas, and the endpoint zod map can be regenerated alongside.
    await rewriteSchemasGen(category, categoryPath);
    await generateEndpointZodMap(category, categoryPath, endpoints);
    await generateEndpointSchemaMap(category, categoryPath, endpoints);
    await generateCategoryZodIndex(category, categoryPath);
    await generateCategorySchemasIndex(category, categoryPath);
    processedCategories.push(category);
  }

  console.log("\nGenerating top-level barrels...");
  await generateSchemasBarrel(processedCategories);
  await generateZodBarrel(processedCategories);
  await generateIndex();

  console.log(`\n✓ Done! Generated schemas under libs/schemas/src/`);
  console.log(`\nCategories generated:`);
  for (const category of processedCategories) {
    console.log(`  - ${category}`);
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
