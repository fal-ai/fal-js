// This file is manually maintained (not auto-generated)
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Filter out noisy warnings/logs from @hey-api/openapi-ts
const originalWarn = console.warn;
console.warn = (...args: Array<unknown>) => {
  const message = args[0];
  if (typeof message === "string") {
    // Filter out "Transformers warning: schema {...} is too complex" messages
    // The actual message starts with emoji: "❗️ Transformers warning:"
    if (message.includes("Transformers warning:")) {
      return;
    }
  }
  originalWarn.apply(console, args);
};

const originalLog = console.log;
console.log = (...args: Array<unknown>) => {
  const message = args[0];
  if (typeof message === "string") {
    // Filter out "[Job N] [M] raw OpenAPI specification" messages
    if (message.includes("raw OpenAPI specification")) {
      return;
    }
  }
  originalLog.apply(console, args);
};

/**
 * Registry of known missing schemas that fal.ai references but doesn't define.
 *
 * fal.ai's OpenAPI specs sometimes contain $ref pointers to schemas that don't exist
 * in the components.schemas section. This is a data quality issue from their API.
 *
 * We resolve these missing $refs by injecting proper schema definitions BEFORE
 * @hey-api/openapi-ts sees the specs (since the parser fails on missing $refs).
 *
 * When console warnings show unknown placeholders, research the schema structure
 * and add proper definitions here to get correct TypeScript types.
 */
const KNOWN_MISSING_SCHEMAS: Record<string, object> = {
  TrackPoint: {
    type: "object",
    description: "A coordinate point with x and y values for motion tracking",
    properties: {
      x: { type: "number", description: "X coordinate" },
      y: { type: "number", description: "Y coordinate" },
    },
    required: ["x", "y"],
  },
  // Add more known missing schemas here as they're discovered
};

/**
 * Patterns that identify URL fields which should accept Blob/File uploads.
 * The fal SDK automatically uploads Blobs/Files via storage.transformInput().
 */
const FAL_FILE_FIELD_PATTERNS = [
  /_url$/,
  /_urls$/,
  /^image$/,
  /^images$/,
  /^video$/,
  /^audio$/,
  /^file$/,
];

/**
 * Check if a property name represents a file/URL field that should accept Blob/File.
 */
function isFalFileField(propertyName: string): boolean {
  return FAL_FILE_FIELD_PATTERNS.some((pattern) => pattern.test(propertyName));
}

/**
 * Transform a string schema to accept string | Blob | File.
 * Uses OpenAPI anyOf to create a union type that TypeScript plugin understands.
 * Also adds x-fal-file-input extension for the Zod resolver.
 */
function transformToFalFileSchema(
  schema: Record<string, unknown>,
): Record<string, unknown> {
  // Preserve existing properties like title, description, default
  const { type: _type, format: _format, ...rest } = schema;
  return {
    anyOf: [
      { type: "string" },
      { type: "string", format: "binary" }, // TypeScript plugin generates Blob | File for this
    ],
    "x-fal-file-input": true, // Marker for Zod resolver
    ...rest,
  };
}

/**
 * Transform URL fields on Input schemas to accept string | Blob | File.
 * Only transforms fields on Input schemas (schema names ending with 'Input')
 * so that Output schema URL fields remain as plain strings.
 */
function transformFalFileFields(spec: object): void {
  const schemas = (
    spec as { components?: { schemas?: Record<string, object> } }
  ).components?.schemas;
  if (!schemas) return;

  for (const [schemaName, schema] of Object.entries(schemas)) {
    // Only process Input schemas - Output schemas should keep URLs as strings
    if (!schemaName.endsWith("Input")) continue;
    transformPropertiesRecursively(schema);
  }
}

/**
 * Recursively transform properties matching fal-file patterns to anyOf union.
 */
function transformPropertiesRecursively(obj: object): void {
  if (typeof obj !== "object") return;

  const schema = obj as Record<string, unknown>;

  if (schema.properties && typeof schema.properties === "object") {
    const properties = schema.properties as Record<
      string,
      Record<string, unknown>
    >;
    for (const [key, value] of Object.entries(properties)) {
      // Transform string fields matching our patterns to anyOf union
      if (
        isFalFileField(key) &&
        value.type === "string" &&
        !value.enum &&
        !value.anyOf
      ) {
        properties[key] = transformToFalFileSchema(value);
      }
      // Transform array items that are strings
      // For arrays, we only add the marker (no anyOf) - typeTransformer handles the type
      else if (
        isFalFileField(key) &&
        value.type === "array" &&
        value.items &&
        typeof value.items === "object"
      ) {
        const items = value.items as Record<string, unknown>;
        if (items.type === "string" && !items.enum && !items.anyOf) {
          // Just add the marker, keep items as type: string
          // The typeTransformer will convert this to string | Blob | File
          // and hey-api will preserve the array wrapper
          items["x-fal-file-input"] = true;
        }
      }
      // Recurse into nested schemas
      transformPropertiesRecursively(value);
    }
  }

  // Recurse into allOf/anyOf/oneOf
  for (const key of ["allOf", "anyOf", "oneOf"]) {
    const arr = schema[key];
    if (Array.isArray(arr)) {
      arr.forEach((item) => {
        if (item && typeof item === "object") {
          transformPropertiesRecursively(item as object);
        }
      });
    }
  }

  // Recurse into items
  if (schema.items && typeof schema.items === "object") {
    transformPropertiesRecursively(schema.items);
  }

  // Recurse into additionalProperties
  if (
    schema.additionalProperties &&
    typeof schema.additionalProperties === "object"
  ) {
    transformPropertiesRecursively(schema.additionalProperties);
  }
}

/**
 * Recursively find all $ref pointers in an OpenAPI spec object.
 * Extracts schema names from references like "#/components/schemas/SchemaName".
 */
function findAllRefs(obj: unknown, refs: Set<string> = new Set()): Set<string> {
  if (!obj || typeof obj !== "object") return refs;

  if (Array.isArray(obj)) {
    obj.forEach((item) => findAllRefs(item, refs));
  } else {
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (key === "$ref" && typeof value === "string") {
        // Extract schema name from "#/components/schemas/SchemaName"
        const match = value.match(/#\/components\/schemas\/(.+)/);
        if (match?.[1]) refs.add(match[1]);
      }
      if (typeof value === "object") {
        findAllRefs(value, refs);
      }
    }
  }

  return refs;
}

/**
 * Resolve missing $refs by injecting schema definitions.
 *
 * For known missing schemas (in KNOWN_MISSING_SCHEMAS), uses proper definitions.
 * For unknown missing schemas, creates generic placeholders to prevent parser failures.
 *
 * This runs during config evaluation, before @hey-api/openapi-ts parses the specs.
 */
function resolveMissingRefs(spec: object): {
  fixed: number;
  unknown: Array<string>;
} {
  const typedSpec = spec as {
    components?: { schemas?: Record<string, object> };
  };
  if (!typedSpec.components?.schemas) return { fixed: 0, unknown: [] };

  const allRefs = findAllRefs(spec);
  const existingSchemas = new Set(Object.keys(typedSpec.components.schemas));
  const missingRefs = [...allRefs].filter((ref) => !existingSchemas.has(ref));

  let fixed = 0;
  const unknown: Array<string> = [];

  for (const missingRef of missingRefs) {
    typedSpec.components.schemas ??= {};

    if (KNOWN_MISSING_SCHEMAS[missingRef]) {
      // Use known schema definition for proper TypeScript types
      typedSpec.components.schemas[missingRef] =
        KNOWN_MISSING_SCHEMAS[missingRef];
      fixed++;
    } else {
      // Create generic placeholder to prevent parser failure
      // This will generate { [key: string]: unknown } TypeScript types
      typedSpec.components.schemas[missingRef] = {
        type: "object",
        description: `Schema referenced but not defined by fal.ai (missing from source OpenAPI spec)`,
        additionalProperties: true,
      };
      unknown.push(missingRef);
    }
  }

  return { fixed, unknown };
}

/**
 * Hash a schema for identity comparison.
 */
function hashSchema(schema: object): string {
  const json = JSON.stringify(
    schema,
    Object.keys(schema as Record<string, unknown>).sort(),
  );
  return createHash("sha256").update(json).digest("hex").slice(0, 16);
}

/**
 * Generate unique schema name with numeric suffix.
 * Produces names like "FileType1", "FileType2" for easy searching.
 */
function generateUniqueSchemaName(baseName: string, index: number): string {
  return `${baseName}Type${index}`;
}

/**
 * Rewrite $ref pointers in an object using a name mapping.
 */
function rewriteRefs(obj: unknown, mapping: Map<string, string>): void {
  if (!obj || typeof obj !== "object") return;
  if (Array.isArray(obj)) {
    obj.forEach((item) => rewriteRefs(item, mapping));
    return;
  }
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (key === "$ref" && typeof value === "string") {
      const match = value.match(/^#\/components\/schemas\/(.+)$/);
      if (match && mapping.has(match[1])) {
        (obj as Record<string, string>)[key] =
          `#/components/schemas/${mapping.get(match[1])}`;
      }
    } else if (typeof value === "object") {
      rewriteRefs(value, mapping);
    }
  }
}

/**
 * Merge multiple OpenAPI specs into a single spec.
 * Deduplicates identical schemas, renames conflicting ones.
 */
function mergeOpenAPISpecs(specs: Array<object>, categoryName: string): object {
  type TypedSpec = {
    info?: { "x-fal-metadata"?: { endpointId?: string } };
    components?: { schemas?: Record<string, object>; securitySchemes?: object };
    paths?: Record<string, object>;
    servers?: Array<object>;
    security?: Array<object>;
  };

  const merged: TypedSpec = {
    openapi: "3.0.4",
    info: { title: `Fal.ai ${categoryName} API`, version: "1.0.0" },
    components: { schemas: {}, securitySchemes: {} },
    paths: {},
    servers: [],
    security: [],
  } as TypedSpec;

  // Schema registry: name -> hash -> { schema, endpointIds, finalName }
  const registry = new Map<
    string,
    Map<string, { schema: object; endpointIds: string[]; finalName: string }>
  >();

  // First pass: collect schemas
  for (const spec of specs as TypedSpec[]) {
    const endpointId = spec.info?.["x-fal-metadata"]?.endpointId || "unknown";
    for (const [name, schema] of Object.entries(
      spec.components?.schemas || {},
    )) {
      const hash = hashSchema(schema);
      if (!registry.has(name)) registry.set(name, new Map());
      const hashMap = registry.get(name)!;
      if (!hashMap.has(hash)) {
        hashMap.set(hash, { schema, endpointIds: [], finalName: name });
      }
      hashMap.get(hash)!.endpointIds.push(endpointId);
    }
  }

  // Assign final names (most common keeps original, others renamed)
  for (const [baseName, hashMap] of registry) {
    const variants = [...hashMap.values()].sort(
      (a, b) => b.endpointIds.length - a.endpointIds.length,
    );
    variants[0].finalName = baseName;
    for (let i = 1; i < variants.length; i++) {
      variants[i].finalName = generateUniqueSchemaName(baseName, i + 1);
      console.log(
        "Generating unique schema name for",
        baseName,
        "->",
        variants[i].finalName,
      );
    }
  }

  // Build ref mapping per endpoint
  const refMappings = new Map<string, Map<string, string>>();
  for (const [baseName, hashMap] of registry) {
    for (const variant of hashMap.values()) {
      for (const endpointId of variant.endpointIds) {
        if (!refMappings.has(endpointId))
          refMappings.set(endpointId, new Map());
        if (variant.finalName !== baseName) {
          refMappings.get(endpointId)!.set(baseName, variant.finalName);
        }
      }
    }
  }

  // Add schemas to merged spec with ref rewriting
  for (const hashMap of registry.values()) {
    for (const variant of hashMap.values()) {
      const clonedSchema = structuredClone(variant.schema);
      // Use the first endpoint's mapping to rewrite refs inside the schema
      const firstEndpoint = variant.endpointIds[0];
      const mapping = refMappings.get(firstEndpoint);
      if (mapping?.size) {
        rewriteRefs(clonedSchema, mapping);
      }
      merged.components!.schemas![variant.finalName] = clonedSchema;
    }
  }

  // Second pass: merge paths with ref rewriting
  for (const spec of specs as TypedSpec[]) {
    const endpointId = spec.info?.["x-fal-metadata"]?.endpointId || "unknown";
    const mapping = refMappings.get(endpointId);
    for (const [pathKey, pathItem] of Object.entries(spec.paths || {})) {
      const cloned = structuredClone(pathItem);
      if (mapping?.size) {
        console.log("Rewriting refs for", pathKey, "->", [
          ...mapping.entries(),
        ]);
        rewriteRefs(cloned, mapping);
      }
      merged.paths![pathKey] = cloned;
    }
  }

  // Take security/servers from first spec
  const first = specs[0] as TypedSpec;
  if (first?.components?.securitySchemes)
    merged.components!.securitySchemes = structuredClone(
      first.components.securitySchemes,
    );
  if (first?.servers) merged.servers = structuredClone(first.servers);
  if (first?.security) merged.security = structuredClone(first.security);

  return merged;
}

function getFalCategoryFilenames(): Array<string> {
  const categoryDir = join(__dirname, "json");
  const files = readdirSync(categoryDir)
    .filter((file) => file.endsWith(".json"))
    .sort();
  return files;
}

function getFalGroupedCategoryFilenames(): Array<{
  category: string;
  filenames: Array<string>;
}> {
  const categoryFilenames = getFalCategoryFilenames();
  const groupedCategoryFilenames = Object.entries(
    categoryFilenames.reduce(
      (acc: Record<string, Array<string>>, filename) => {
        const category = filename.replace(
          /fal\.models\.([^-.]+-to-([^.]+)|([^-.]+))\.json/,
          "$2$3",
        );
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(filename);
        return acc;
      },
      {} as Record<string, Array<string>>,
    ),
  ).map(([category, filenames]) => ({ category, filenames }));
  return groupedCategoryFilenames;
}

function getFalModelOpenApiObjects(filename: string): Array<object> {
  const fileContents = readFileSync(join(__dirname, "json", filename), "utf8");
  const json = JSON.parse(fileContents);

  let totalFixed = 0;
  const allUnknown = new Set<string>();

  const specs = json.models.map((model: { openapi: object }) => {
    const spec = model.openapi;
    const { fixed, unknown } = resolveMissingRefs(spec);

    totalFixed += fixed;
    unknown.forEach((u) => allUnknown.add(u));

    // Transform URL fields on Input schemas to accept string | Blob | File
    transformFalFileFields(spec);

    return spec;
  });

  // Log summary if any refs were fixed
  if (totalFixed > 0 || allUnknown.size > 0) {
    console.log(`[${filename}] Resolved ${totalFixed} known missing refs`);
    if (allUnknown.size > 0) {
      console.warn(
        `[${filename}] Created placeholders for unknown refs: ${[...allUnknown].join(", ")}`,
      );
    }
  }

  return specs;
}

export default [
  ...getFalGroupedCategoryFilenames().map(({ category, filenames }) => {
    const allSpecs = filenames.map(getFalModelOpenApiObjects).flat();
    const mergedSpec = mergeOpenAPISpecs(allSpecs, category);

    return {
      input: mergedSpec, // Single merged spec instead of array
      output: {
        path: `./libs/client/src/types/${category}`,
        indexFile: false,
        postProcess: ["prettier"],
      },
      plugins: [
        {
          name: "@hey-api/typescript",
        },
        {
          name: "zod",
          metadata: true,
        },
      ],
      parser: {
        filters: {
          schemas: {
            include: "/Input$|Output$|^Post.*Data$/",
          },
          operations: {
            include: ["/post .*/"],
            exclude: ["/get .*/"],
          },
          orphans: false,
        },
      },
    };
  }),
];
