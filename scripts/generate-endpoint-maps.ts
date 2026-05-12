#!/usr/bin/env tsx
/**
 * Generate per-category endpoint records plus top-level barrels for
 * @fal-ai/schemas.
 *
 * For each category we emit:
 *   - {category}/endpoint-schema.ts  `{category}Endpoints` const — a record keyed by
 *                                    endpoint id with `{ input, output }` Zod schemas
 *                                    pulled from `zod.gen.ts`, plus a
 *                                    `{Category}EndpointId = keyof typeof ...` type.
 *   - {category}/index.ts            Barrel that re-exports endpoint-schema + zod.gen.
 *
 * And at the package root:
 *   - schemas.ts  Namespaced JSON Schemas, one namespace per category.
 *   - zod.ts      Namespaced Zod barrel (per-category raw schema names collide).
 *   - index.ts    Default entry — re-exports schemas.ts (JSON Schemas only, no zod peer).
 *
 * Each category is also exposed directly through package.json `exports`:
 *   - `@fal-ai/schemas/schemas/{category}` -> `{category}/schemas.gen.ts`
 *   - `@fal-ai/schemas/zod/{category}`     -> `{category}/index.ts`
 *
 * The endpoint **input** is read from the POST's `requestBody`. The **output**
 * is read from the sibling GET at `${pathKey}/requests/{request_id}` — the
 * POST's 200 response is always `QueueStatus` (queue ack), not the real result.
 *
 * Endpoint metadata is derived from the same merged OpenAPI specs that feed
 * @hey-api/openapi-ts (via scripts/lib/merge-openapi-specs.ts), so renamed
 * schemas (e.g. FileTypeInputType2) resolve to the actual emitted zod names.
 *
 * The record shape is deliberate: a `z.discriminatedUnion('endpoint', [...])`
 * over hundreds of branches blows past TS's declaration-emit budget (TS7056)
 * for the largest categories. The flat record stays linear in declaration size.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
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
  const zodGenPath = join(categoryPath, "zod.gen.ts");
  const source = readFileSync(zodGenPath, "utf-8");
  const lookup = new Map<string, string>();
  const exportRegex = /export const (z[A-Za-z0-9_$]+)/g;
  let match: RegExpExecArray | null;
  while ((match = exportRegex.exec(source)) !== null) {
    const exportName = match[1]!;
    lookup.set(normalizeId(exportName.slice(1)), exportName);
  }
  return lookup;
}

/**
 * PascalCase a category name; prefix with "Gen" if it'd otherwise start with
 * a digit (TypeScript identifiers cannot start with a number).
 */
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

async function generateEndpointSchema(
  category: string,
  categoryPath: string,
  endpoints: Array<EndpointInfo>,
): Promise<void> {
  const typeName = toPascalCase(category);
  const constName = `${toCamelCase(category)}Endpoints`;
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

  const resolvedEndpoints = endpoints.flatMap(
    ({ endpointId, inputType, outputType }) => {
      const inputName = resolveZodName(inputType, endpointId);
      const outputName = resolveZodName(outputType, endpointId);
      if (!inputName || !outputName) return [];
      return [{ endpointId, inputName, outputName }];
    },
  );

  const schemaImports = Array.from(
    new Set(
      resolvedEndpoints.flatMap(({ inputName, outputName }) => [
        inputName,
        outputName,
      ]),
    ),
  ).sort();

  // Explicit type annotation (rather than `as const` + inference) so TS
  // doesn't have to materialize the full structural type for every entry's
  // Zod schemas — that's what trips TS7056 on large categories (image, video).
  // With the annotation, TS emits the type verbatim, sized linearly in N.
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

  for (const { endpointId, inputName, outputName } of resolvedEndpoints) {
    lines.push(
      `  readonly '${endpointId}': { readonly input: typeof ${inputName}; readonly output: typeof ${outputName} },`,
    );
  }

  lines.push(`} = {`);

  for (const { endpointId, inputName, outputName } of resolvedEndpoints) {
    lines.push(
      `  '${endpointId}': { input: ${inputName}, output: ${outputName} },`,
    );
  }

  lines.push(`}`);
  lines.push(``);
  lines.push(`/** Union of valid ${category} endpoint ids. */`);
  lines.push(`export type ${idTypeName} = keyof typeof ${constName}`);

  const outputPath = join(categoryPath, "endpoint-schema.ts");
  writeFileSync(outputPath, await formatTypeScript(lines.join("\n")));
  console.log(`  ✓ Generated ${category}/endpoint-schema.ts`);
}

/**
 * Per-category Zod barrel: re-exports the endpoint record + id type from
 * `endpoint-schema.ts` alongside the raw input/output schemas in `zod.gen.ts`,
 * so `@fal-ai/schemas/zod/{category}` exposes both through one subpath.
 */
async function generateCategoryZodIndex(
  category: string,
  categoryPath: string,
): Promise<void> {
  const lines = [
    `// AUTO-GENERATED - Do not edit manually`,
    `// Generated via scripts/generate-endpoint-maps.ts`,
    ``,
    `export * from './endpoint-schema.js'`,
    `export * from './zod.gen.js'`,
  ];
  const outputPath = join(categoryPath, "index.ts");
  writeFileSync(outputPath, await formatTypeScript(lines.join("\n")));
  console.log(`  ✓ Generated ${category}/index.ts`);
}

async function generateZodBarrel(
  processedCategories: Array<string>,
): Promise<void> {
  // Each category exposes its {category}Endpoints record + raw input/output
  // schemas via its index.ts barrel. Namespace per category here because raw
  // schema names (zFile, zImage, zQueueStatus, ...) collide across categories.
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
  const outputPath = join(SCHEMAS_SRC, "zod.ts");
  writeFileSync(outputPath, await formatTypeScript(lines.join("\n")));
  console.log(`  ✓ Generated zod.ts`);
}

async function generateSchemasBarrel(
  processedCategories: Array<string>,
): Promise<void> {
  // Categories share many schema names (e.g. `FileSchema`, `QueueStatusSchema`),
  // so we expose each category under its own namespace to avoid collisions.
  const lines = [
    `// AUTO-GENERATED - Do not edit manually`,
    `// Generated via scripts/generate-endpoint-maps.ts`,
    ``,
    `// Per-category JSON Schemas (as-const objects from @hey-api/schemas).`,
    `// Each category is namespaced to prevent name collisions across categories.`,
    ...processedCategories.map(
      (c) => `export * as ${toPascalCase(c)} from './${c}/schemas.gen.js'`,
    ),
  ];
  const outputPath = join(SCHEMAS_SRC, "schemas.ts");
  writeFileSync(outputPath, await formatTypeScript(lines.join("\n")));
  console.log(`  ✓ Generated schemas.ts`);
}

async function generateIndex(): Promise<void> {
  // Default entry intentionally re-exports only JSON Schemas so consumers can
  // use the package without installing the optional `zod` peer dependency.
  const lines = [
    `// AUTO-GENERATED - Do not edit manually`,
    `// Generated via scripts/generate-endpoint-maps.ts`,
    ``,
    `export * from './schemas.js'`,
  ];
  const outputPath = join(SCHEMAS_SRC, "index.ts");
  writeFileSync(outputPath, await formatTypeScript(lines.join("\n")));
  console.log(`  ✓ Generated index.ts`);
}

async function main() {
  if (!existsSync(SCHEMAS_SRC)) {
    console.error("Error: libs/schemas/src/ directory not found.");
    process.exit(1);
  }

  console.log("Building merged OpenAPI specs per category...");
  const merged = buildMergedCategorySpecs();
  console.log(`Found ${merged.length} categories`);

  console.log("\nGenerating endpoint schemas...");
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
    await generateEndpointSchema(category, categoryPath, endpoints);
    await generateCategoryZodIndex(category, categoryPath);
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
