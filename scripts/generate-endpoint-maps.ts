#!/usr/bin/env tsx
/**
 * Generate category-specific EndpointTypeMap files from heyapi-generated types
 *
 * This script:
 * 1. Scans each category directory for types.gen.ts
 * 2. Extracts endpoint information from Post*Data and Get*Responses types
 * 3. For each category, generates:
 *    - {category}/endpoint-map.ts: TypeScript types (EndpointMap, Model, ModelInput, ModelOutput)
 *    - {category}/endpoint-schema.ts: Zod discriminatedUnion schema
 * 4. Generates unified files:
 *    - schemas.ts: Combined Zod discriminatedUnion of all endpoint schemas
 *    - client.ts: EndpointType, InputType<T>, OutputType<T>, and EndpointTypeMap
 */

import {
  existsSync,
  readFileSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as prettier from "prettier";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface EndpointInfo {
  endpointId: string;
  inputType: string;
  outputType: string;
}

/**
 * Extract endpoints from types.gen.ts file
 */
function extractEndpointsFromTypes(categoryPath: string): Array<EndpointInfo> {
  const typesPath = join(categoryPath, "types.gen.ts");
  if (!existsSync(typesPath)) {
    return [];
  }

  const content = readFileSync(typesPath, "utf-8");
  const endpoints: Array<EndpointInfo> = [];

  // Match: export type Post*Data = {
  //   body: SchemaXxxInput
  //   ...
  //   url: '/endpoint-path'
  // }
  const postTypeRegex =
    /export type (Post\w+)Data = \{[\s\S]*?body:\s*(\b\w+\b);?[\s\S]*?url:\s*["']([^"']+)["']/g;

  let match;
  while ((match = postTypeRegex.exec(content)) !== null) {
    const inputType = match[2]!;
    const urlPath = match[3]!;

    // Remove leading slash from URL to get endpoint ID
    const endpointId = urlPath.replace(/^\//, "");

    // Derive output type from input type by replacing "Input" with "Output"
    const outputType = inputType.replace(/Input(Type\d+)?$/, "Output$1");

    // Verify the output type exists in the content
    if (!content.includes(`export type ${outputType}`)) {
      console.warn(
        `  Warning: Could not find output type ${outputType} for ${endpointId}`,
      );
      continue;
    }

    endpoints.push({
      endpointId,
      inputType,
      outputType,
    });
  }

  return endpoints;
}

/**
 * Get Zod schema name from TypeScript type name
 * SchemaWanEffectsInput -> zSchemaWanEffectsInput
 */
function getZodSchemaName(typeName: string): string {
  return "z" + typeName;
}

/**
 * Convert category name to PascalCase
 * Prefix with "Gen" if starts with a digit
 */
function toPascalCase(str: string): string {
  const pascalCase = str
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  // TypeScript identifiers cannot start with a number
  // Prefix with "Gen" if it starts with a digit
  if (/^\d/.test(pascalCase)) {
    return "Gen" + pascalCase;
  }

  return pascalCase;
}

/**
 * Format TypeScript code using prettier
 */
async function formatTypeScript(content: string): Promise<string> {
  return prettier.format(content, {
    parser: "typescript",
    semi: false,
    singleQuote: true,
    trailingComma: "all",
  });
}

/**
 * Generate endpoint-map.ts for a category (TypeScript types only)
 */
async function generateEndpointMap(
  category: string,
  categoryPath: string,
  endpoints: Array<EndpointInfo>,
): Promise<void> {
  const typeName = toPascalCase(category);

  // Collect unique type names
  const inputTypes = new Set<string>();
  const outputTypes = new Set<string>();

  for (const { inputType, outputType } of endpoints) {
    inputTypes.add(inputType);
    outputTypes.add(outputType);
  }

  // Generate imports
  const typeImports = Array.from(
    new Set([...inputTypes, ...outputTypes]),
  ).sort();

  const lines = [
    `// AUTO-GENERATED - Do not edit manually`,
    `// Generated from types.gen.ts via scripts/generate-endpoint-maps.ts`,
    ``,
    `import type {`,
    ...typeImports.map((t) => `  ${t},`),
    `} from './types.gen'`,
    ``,
  ];

  // Generate TypeScript EndpointMap type
  lines.push(`export type ${typeName}EndpointMap = {`);

  for (const { endpointId, inputType, outputType } of endpoints) {
    lines.push(`  '${endpointId}': {`);
    lines.push(`    input: ${inputType}`);
    lines.push(`    output: ${outputType}`);
    lines.push(`  }`);
  }

  lines.push(`}`);

  // Generate Model type
  lines.push(``);
  lines.push(`/** Union type of all ${category} model endpoint IDs */`);
  lines.push(`export type ${typeName}Model = keyof ${typeName}EndpointMap`);

  // Generate utility types
  lines.push(``);
  lines.push(`/** Get the input type for a specific ${category} model */`);
  lines.push(
    `export type ${typeName}ModelInput<T extends ${typeName}Model> = ${typeName}EndpointMap[T]['input']`,
  );
  lines.push(``);
  lines.push(`/** Get the output type for a specific ${category} model */`);
  lines.push(
    `export type ${typeName}ModelOutput<T extends ${typeName}Model> = ${typeName}EndpointMap[T]['output']`,
  );

  // Format and write to file
  const outputPath = join(categoryPath, "endpoint-map.ts");
  const formattedContent = await formatTypeScript(lines.join("\n"));
  writeFileSync(outputPath, formattedContent);
  console.log(
    `  ✓ Generated ${category}/endpoint-map.ts (${endpoints.length} endpoints)`,
  );
}

/**
 * Generate endpoint-schema.ts for a category (Zod discriminatedUnion)
 */
async function generateEndpointSchema(
  category: string,
  categoryPath: string,
  endpoints: Array<EndpointInfo>,
): Promise<void> {
  const typeName = toPascalCase(category);

  // Collect unique schema names
  const inputSchemas = new Set<string>();
  const outputSchemas = new Set<string>();

  for (const { inputType, outputType } of endpoints) {
    inputSchemas.add(getZodSchemaName(inputType));
    outputSchemas.add(getZodSchemaName(outputType));
  }

  const schemaImports = Array.from(
    new Set([...inputSchemas, ...outputSchemas]),
  ).sort();

  const lines = [
    `// AUTO-GENERATED - Do not edit manually`,
    `// Generated from types.gen.ts via scripts/generate-endpoint-maps.ts`,
    ``,
    `import { z } from 'zod'`,
    ``,
    `import {`,
    ...schemaImports.map((t) => `  ${t},`),
    `} from './zod.gen'`,
    ``,
  ];

  // Generate Zod discriminatedUnion
  lines.push(
    `/** Zod schema for ${category} endpoints using discriminatedUnion */`,
  );
  lines.push(
    `export const ${typeName}EndpointSchema = z.discriminatedUnion('endpoint', [`,
  );

  for (const { endpointId, inputType, outputType } of endpoints) {
    const inputSchema = getZodSchemaName(inputType);
    const outputSchema = getZodSchemaName(outputType);
    lines.push(`  z.object({`);
    lines.push(`    endpoint: z.literal('${endpointId}'),`);
    lines.push(`    input: ${inputSchema},`);
    lines.push(`    output: ${outputSchema},`);
    lines.push(`  }),`);
  }

  lines.push(`])`);

  // Generate inferred types from the schema
  lines.push(``);
  lines.push(`/** Inferred type from ${typeName}EndpointSchema */`);
  lines.push(
    `export type ${typeName}Endpoint = z.infer<typeof ${typeName}EndpointSchema>`,
  );

  // Format and write to file
  const outputPath = join(categoryPath, "endpoint-schema.ts");
  const formattedContent = await formatTypeScript(lines.join("\n"));
  writeFileSync(outputPath, formattedContent);
  console.log(`  ✓ Generated ${category}/endpoint-schema.ts`);
}

/**
 * Generate schemas.ts - Re-export category endpoint schemas
 */
async function generateSchemasFile(
  generatedDir: string,
  processedCategories: Array<string>,
): Promise<void> {
  const lines = [
    `// AUTO-GENERATED - Do not edit manually`,
    `// Generated via scripts/generate-endpoint-maps.ts`,
    ``,
    `// Re-export all category endpoint schemas`,
  ];

  for (const category of processedCategories) {
    lines.push(`export * from './${category}/endpoint-schema'`);
  }

  const outputPath = join(generatedDir, "schemas.ts");
  const formattedContent = await formatTypeScript(lines.join("\n"));
  writeFileSync(outputPath, formattedContent);
  console.log(`  ✓ Generated schemas.ts`);
}

/**
 * Generate endpoints.ts - EndpointTypeMap
 */
async function generateEndpointsFile(
  generatedDir: string,
  processedCategories: Array<string>,
): Promise<void> {
  const lines = [
    `// AUTO-GENERATED - Do not edit manually`,
    `// Generated via scripts/generate-endpoint-maps.ts`,
    ``,
  ];

  // Import EndpointMap from each category
  for (const category of processedCategories) {
    const typeName = toPascalCase(category);
    lines.push(
      `import type { ${typeName}EndpointMap } from './${category}/endpoint-map'`,
    );
  }

  lines.push(``);

  // Generate combined EndpointTypeMap
  lines.push(`/** Combined EndpointTypeMap for all fal.ai endpoints */`);
  lines.push(`export type EndpointTypeMap =`);
  for (let i = 0; i < processedCategories.length; i++) {
    const category = processedCategories[i]!;
    const typeName = toPascalCase(category);
    const isLast = i === processedCategories.length - 1;
    lines.push(`  ${typeName}EndpointMap${isLast ? "" : " &"}`);
  }

  const outputPath = join(generatedDir, "endpoints.ts");
  const formattedContent = await formatTypeScript(lines.join("\n"));
  writeFileSync(outputPath, formattedContent);
  console.log(`  ✓ Generated endpoints.ts`);
}

/**
 * Generate client.ts - EndpointType, InputType<T>, OutputType<T>
 */
async function generateClientFile(
  generatedDir: string,
  processedCategories: Array<string>,
): Promise<void> {
  const lines = [
    `// AUTO-GENERATED - Do not edit manually`,
    `// Generated via scripts/generate-endpoint-maps.ts`,
    ``,
  ];

  // Import types from each category's endpoint-map.ts
  for (const category of processedCategories) {
    const typeName = toPascalCase(category);
    lines.push(`import type {`);
    lines.push(`  ${typeName}Model,`);
    lines.push(`  ${typeName}ModelInput,`);
    lines.push(`  ${typeName}ModelOutput,`);
    lines.push(`} from './${category}/endpoint-map'`);
  }

  lines.push(``);

  // Generate union of all endpoint types
  lines.push(`/** Union of all endpoint IDs */`);
  lines.push(`export type EndpointType =`);
  for (let i = 0; i < processedCategories.length; i++) {
    const category = processedCategories[i]!;
    const typeName = toPascalCase(category);
    const isFirst = i === 0;
    lines.push(`  ${isFirst ? "" : "| "}${typeName}Model`);
  }

  lines.push(``);

  // Generate InputType - tests T against each category using conditional types
  lines.push(`/** Get the input type for an endpoint */`);
  lines.push(`export type InputType<T extends EndpointType> =`);
  for (let i = 0; i < processedCategories.length; i++) {
    const category = processedCategories[i]!;
    const typeName = toPascalCase(category);
    lines.push(`  T extends ${typeName}Model ? ${typeName}ModelInput<T> :`);
  }
  lines.push(`  never`);

  lines.push(``);

  // Generate OutputType - tests T against each category using conditional types
  lines.push(`/** Get the output type for an endpoint */`);
  lines.push(`export type OutputType<T extends EndpointType> =`);
  for (let i = 0; i < processedCategories.length; i++) {
    const category = processedCategories[i]!;
    const typeName = toPascalCase(category);
    lines.push(`  T extends ${typeName}Model ? ${typeName}ModelOutput<T> :`);
  }
  lines.push(`  never`);

  const outputPath = join(generatedDir, "client.ts");
  const formattedContent = await formatTypeScript(lines.join("\n"));
  writeFileSync(outputPath, formattedContent);
  console.log(`  ✓ Generated client.ts`);
}

async function main() {
  const generatedDir = join(__dirname, "..", "libs", "client", "src", "types");

  if (!existsSync(generatedDir)) {
    console.error("Error: src/types/ directory not found.");
    process.exit(1);
  }

  console.log("Scanning types/ directory for categories...");

  // Get all category directories
  const categories = readdirSync(generatedDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .sort();

  console.log(`Found ${categories.length} categories:`);
  for (const category of categories) {
    console.log(`  - ${category}`);
  }

  console.log("\nGenerating endpoint maps and schemas...");

  const processedCategories: Array<string> = [];

  for (const category of categories) {
    const categoryPath = join(generatedDir, category);

    // Extract endpoints from types.gen.ts
    const endpoints = extractEndpointsFromTypes(categoryPath);

    if (endpoints.length === 0) {
      console.warn(`  Warning: No endpoints found for ${category}, skipping`);
      continue;
    }

    // Generate endpoint-map.ts (TypeScript types)
    await generateEndpointMap(category, categoryPath, endpoints);

    // Generate endpoint-schema.ts (Zod discriminatedUnion)
    await generateEndpointSchema(category, categoryPath, endpoints);

    processedCategories.push(category);
  }

  // Generate unified files
  console.log("\nGenerating unified files...");

  await generateSchemasFile(generatedDir, processedCategories);
  await generateClientFile(generatedDir, processedCategories);

  // Generate endpoints.ts
  await generateEndpointsFile(generatedDir, processedCategories);

  // Delete old files if they exist
  const oldFiles = ["index.ts"];
  for (const file of oldFiles) {
    const filePath = join(generatedDir, file);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
      console.log(`  ✓ Deleted ${file} (no longer needed)`);
    }
  }

  console.log(`\n✓ Done! Generated endpoint maps in libs/client/src/types/`);
  console.log(`\nCategories generated:`);
  for (const category of processedCategories) {
    console.log(`  - ${category} (${toPascalCase(category)}Model)`);
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
