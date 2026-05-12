#!/usr/bin/env tsx
/**
 * Generate per-category endpoint Zod schemas plus top-level barrels for
 * @fal-ai/schemas.
 *
 * For each category we emit:
 *   - {category}/endpoint-schema.ts  Zod discriminatedUnion over {endpoint, input, output}
 *
 * And at the package root:
 *   - schemas.ts       re-exports every category's endpoint-schema.ts
 *   - json-schemas.ts  re-exports every category's schemas.gen.ts (JSON Schemas)
 *   - index.ts         re-exports from schemas.ts
 *
 * This script does NOT emit any TypeScript types. Consumers wanting types
 * should `z.infer` from the discriminated unions in schemas.ts.
 *
 * Endpoint metadata is derived from the same merged OpenAPI specs that feed
 * @hey-api/openapi-ts (via scripts/lib/merge-openapi-specs.ts), so renamed
 * schemas (e.g. FileTypeInputType2) resolve to the actual emitted zod names.
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
 */
function extractEndpointsFromSpec(mergedSpec: MergedSpec): Array<EndpointInfo> {
  const endpoints: Array<EndpointInfo> = [];

  for (const [pathKey, pathItem] of Object.entries(mergedSpec.paths)) {
    const post = (pathItem as { post?: Record<string, any> }).post;
    if (!post) continue;

    const inputRef =
      post.requestBody?.content?.["application/json"]?.schema?.$ref;
    const outputRef =
      post.responses?.["200"]?.content?.["application/json"]?.schema?.$ref;
    if (typeof inputRef !== "string" || typeof outputRef !== "string") continue;

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

  const lines = [
    `// AUTO-GENERATED - Do not edit manually`,
    `// Generated via scripts/generate-endpoint-maps.ts`,
    ``,
    `import { z } from 'zod'`,
    ``,
    `import {`,
    ...schemaImports.map((t) => `  ${t},`),
    `} from './zod.gen'`,
    ``,
    `/** Zod schema for ${category} endpoints using discriminatedUnion */`,
    `export const ${typeName}EndpointSchema = z.discriminatedUnion('endpoint', [`,
  ];

  for (const { endpointId, inputName, outputName } of resolvedEndpoints) {
    lines.push(`  z.object({`);
    lines.push(`    endpoint: z.literal('${endpointId}'),`);
    lines.push(`    input: ${inputName},`);
    lines.push(`    output: ${outputName},`);
    lines.push(`  }),`);
  }

  lines.push(`])`);
  lines.push(``);
  lines.push(`/** Inferred type from ${typeName}EndpointSchema */`);
  lines.push(
    `export type ${typeName}Endpoint = z.infer<typeof ${typeName}EndpointSchema>`,
  );

  const outputPath = join(categoryPath, "endpoint-schema.ts");
  writeFileSync(outputPath, await formatTypeScript(lines.join("\n")));
  console.log(`  ✓ Generated ${category}/endpoint-schema.ts`);
}

async function generateSchemasBarrel(
  processedCategories: Array<string>,
): Promise<void> {
  const lines = [
    `// AUTO-GENERATED - Do not edit manually`,
    `// Generated via scripts/generate-endpoint-maps.ts`,
    ``,
    `// Re-export all category endpoint schemas`,
    ...processedCategories.map((c) => `export * from './${c}/endpoint-schema'`),
  ];
  const outputPath = join(SCHEMAS_SRC, "schemas.ts");
  writeFileSync(outputPath, await formatTypeScript(lines.join("\n")));
  console.log(`  ✓ Generated schemas.ts`);
}

async function generateJsonSchemasBarrel(
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
      (c) => `export * as ${toPascalCase(c)} from './${c}/schemas.gen'`,
    ),
  ];
  const outputPath = join(SCHEMAS_SRC, "json-schemas.ts");
  writeFileSync(outputPath, await formatTypeScript(lines.join("\n")));
  console.log(`  ✓ Generated json-schemas.ts`);
}

async function generateIndex(): Promise<void> {
  const lines = [
    `// AUTO-GENERATED - Do not edit manually`,
    `// Generated via scripts/generate-endpoint-maps.ts`,
    ``,
    `export * from './schemas'`,
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
    processedCategories.push(category);
  }

  console.log("\nGenerating top-level barrels...");
  await generateSchemasBarrel(processedCategories);
  await generateJsonSchemasBarrel(processedCategories);
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
