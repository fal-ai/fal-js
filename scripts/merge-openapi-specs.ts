// Shared helpers for fetching, transforming, and merging fal.ai's per-model
// OpenAPI specs. Imported by both openapi-ts.config.ts (to feed @hey-api/openapi-ts)
// and scripts/generate-endpoint-maps.ts (to derive endpoint -> schema mappings).

import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const JSON_DIR = join(__dirname, "..", "json");

/**
 * Registry of known missing schemas that fal.ai references but doesn't define.
 *
 * fal.ai's OpenAPI specs sometimes contain $ref pointers to schemas that don't
 * exist in components.schemas. We inject definitions BEFORE @hey-api/openapi-ts
 * parses the specs (it fails on missing $refs).
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
};

/**
 * Property-name patterns identifying file/URL fields that should be marked for
 * the Zod resolver so the fal client can transparently upload Blob/File inputs.
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

function isFalFileField(propertyName: string): boolean {
  return FAL_FILE_FIELD_PATTERNS.some((pattern) => pattern.test(propertyName));
}

/**
 * Mark a string schema as a fal-file-input. We only attach the marker — the
 * Zod resolver inspects this extension at runtime to widen the schema to
 * accept Blob/File alongside string URLs.
 */
function transformToFalFileSchema(
  schema: Record<string, unknown>,
): Record<string, unknown> {
  return { ...schema, "x-fal-file-input": true };
}

/**
 * Coerce default values to match their declared schema type. Some fal specs
 * declare a property as `type: "string"` but provide a numeric default; that
 * makes Zod codegen emit `.default(129)` on `z.string()` which fails tsc.
 */
function coerceDefaults(spec: object): void {
  const schemas = (
    spec as { components?: { schemas?: Record<string, object> } }
  ).components?.schemas;
  if (!schemas) return;
  for (const schema of Object.values(schemas)) {
    coerceDefaultsRecursively(schema);
  }
}

function coerceDefaultsRecursively(obj: object): void {
  if (typeof obj !== "object" || obj === null) return;
  const schema = obj as Record<string, unknown>;

  if (schema.properties && typeof schema.properties === "object") {
    const properties = schema.properties as Record<
      string,
      Record<string, unknown>
    >;
    for (const value of Object.values(properties)) {
      if (
        value.type === "string" &&
        value.default !== undefined &&
        typeof value.default !== "string"
      ) {
        value.default = String(value.default);
      }
      if (
        value.type === "integer" &&
        value.default !== undefined &&
        typeof value.default === "string"
      ) {
        const parsed = parseInt(value.default, 10);
        if (!isNaN(parsed)) value.default = parsed;
      }
      if (
        value.type === "number" &&
        value.default !== undefined &&
        typeof value.default === "string"
      ) {
        const parsed = parseFloat(value.default);
        if (!isNaN(parsed)) value.default = parsed;
      }
      if (
        value.type === "boolean" &&
        value.default !== undefined &&
        typeof value.default === "string"
      ) {
        value.default = value.default === "true";
      }
      coerceDefaultsRecursively(value);
    }
  }

  for (const key of ["allOf", "anyOf", "oneOf"]) {
    const arr = schema[key];
    if (Array.isArray(arr)) {
      arr.forEach((item) => {
        if (item && typeof item === "object") {
          coerceDefaultsRecursively(item as object);
        }
      });
    }
  }

  if (schema.items && typeof schema.items === "object") {
    coerceDefaultsRecursively(schema.items);
  }
}

/**
 * Mark fal-file-input fields on Input schemas only — Output URL fields should
 * stay as plain strings.
 */
function transformFalFileFields(spec: object): void {
  const schemas = (
    spec as { components?: { schemas?: Record<string, object> } }
  ).components?.schemas;
  if (!schemas) return;
  for (const [schemaName, schema] of Object.entries(schemas)) {
    if (!schemaName.endsWith("Input")) continue;
    transformPropertiesRecursively(schema);
  }
}

function transformPropertiesRecursively(obj: object): void {
  if (typeof obj !== "object") return;
  const schema = obj as Record<string, unknown>;

  if (schema.properties && typeof schema.properties === "object") {
    const properties = schema.properties as Record<
      string,
      Record<string, unknown>
    >;
    for (const [key, value] of Object.entries(properties)) {
      if (isFalFileField(key) && value.type === "string" && !value.enum) {
        properties[key] = transformToFalFileSchema(value);
      } else if (
        isFalFileField(key) &&
        value.type === "array" &&
        value.items &&
        typeof value.items === "object"
      ) {
        const items = value.items as Record<string, unknown>;
        if (items.type === "string" && !items.enum) {
          items["x-fal-file-input"] = true;
        }
      }
      transformPropertiesRecursively(value);
    }
  }

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

  if (schema.items && typeof schema.items === "object") {
    transformPropertiesRecursively(schema.items);
  }

  if (
    schema.additionalProperties &&
    typeof schema.additionalProperties === "object"
  ) {
    transformPropertiesRecursively(schema.additionalProperties);
  }
}

function findAllRefs(obj: unknown, refs: Set<string> = new Set()): Set<string> {
  if (!obj || typeof obj !== "object") return refs;
  if (Array.isArray(obj)) {
    obj.forEach((item) => findAllRefs(item, refs));
  } else {
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (key === "$ref" && typeof value === "string") {
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
 * For each $ref in `spec` that points at a missing schema: inject either a
 * known definition (if registered in KNOWN_MISSING_SCHEMAS) or a generic
 * placeholder, so the heyapi parser doesn't fail.
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
      typedSpec.components.schemas[missingRef] =
        KNOWN_MISSING_SCHEMAS[missingRef];
      fixed++;
    } else {
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

function hashSchema(schema: object): string {
  const json = JSON.stringify(
    schema,
    Object.keys(schema as Record<string, unknown>).sort(),
  );
  return createHash("sha256").update(json).digest("hex").slice(0, 16);
}

function generateUniqueSchemaName(baseName: string, index: number): string {
  return `${baseName}Type${index}`;
}

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

export interface MergedSpec {
  openapi: string;
  info: { title: string; version: string };
  components: {
    schemas: Record<string, object>;
    securitySchemes: object;
  };
  paths: Record<string, object>;
  servers: Array<object>;
  security: Array<object>;
}

/**
 * Merge multiple per-model OpenAPI specs into a single category-level spec.
 * Identical schemas across endpoints are deduplicated; conflicting schemas
 * (same name, different shape) get suffixed with `Type2`, `Type3`, ... and
 * all internal $refs are rewritten consistently.
 */
export function mergeOpenAPISpecs(
  specs: Array<object>,
  categoryName: string,
): MergedSpec {
  type TypedSpec = {
    info?: { "x-fal-metadata"?: { endpointId?: string } };
    components?: { schemas?: Record<string, object>; securitySchemes?: object };
    paths?: Record<string, object>;
    servers?: Array<object>;
    security?: Array<object>;
  };

  const merged: MergedSpec = {
    openapi: "3.0.4",
    info: { title: `Fal.ai ${categoryName} API`, version: "1.0.0" },
    components: { schemas: {}, securitySchemes: {} },
    paths: {},
    servers: [],
    security: [],
  };

  const registry = new Map<
    string,
    Map<string, { schema: object; endpointIds: string[]; finalName: string }>
  >();

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

  for (const hashMap of registry.values()) {
    for (const variant of hashMap.values()) {
      const clonedSchema = structuredClone(variant.schema);
      const firstEndpoint = variant.endpointIds[0];
      const mapping = refMappings.get(firstEndpoint);
      if (mapping?.size) {
        rewriteRefs(clonedSchema, mapping);
      }
      merged.components.schemas[variant.finalName] = clonedSchema;
    }
  }

  for (const spec of specs as TypedSpec[]) {
    const endpointId = spec.info?.["x-fal-metadata"]?.endpointId || "unknown";
    const mapping = refMappings.get(endpointId);
    for (const [pathKey, pathItem] of Object.entries(spec.paths || {})) {
      const cloned = structuredClone(pathItem);
      if (mapping?.size) {
        rewriteRefs(cloned, mapping);
      }
      merged.paths[pathKey] = cloned;
    }
  }

  const first = specs[0] as TypedSpec;
  if (first?.components?.securitySchemes)
    merged.components.securitySchemes = structuredClone(
      first.components.securitySchemes,
    );
  if (first?.servers) merged.servers = structuredClone(first.servers);
  if (first?.security) merged.security = structuredClone(first.security);

  merged.paths = Object.fromEntries(
    Object.entries(merged.paths).sort(([a], [b]) => a.localeCompare(b)),
  );
  merged.components.schemas = Object.fromEntries(
    Object.entries(merged.components.schemas).sort(([a], [b]) =>
      a.localeCompare(b),
    ),
  );

  return merged;
}

function getFalCategoryFilenames(): Array<string> {
  return readdirSync(JSON_DIR)
    .filter((file) => file.endsWith(".json"))
    .sort();
}

/**
 * Group source JSON filenames by inferred category. Filenames look like
 * `fal.models.image-to-video.json` -> category `video`, or `fal.models.llm.json`
 * -> category `llm`.
 */
export function getFalGroupedCategoryFilenames(): Array<{
  category: string;
  filenames: Array<string>;
}> {
  return Object.entries(
    getFalCategoryFilenames().reduce(
      (acc: Record<string, Array<string>>, filename) => {
        const category = filename.replace(
          /fal\.models\.([^-.]+-to-([^.]+)|([^-.]+))\.json/,
          "$2$3",
        );
        if (!acc[category]) acc[category] = [];
        acc[category].push(filename);
        return acc;
      },
      {},
    ),
  ).map(([category, filenames]) => ({ category, filenames }));
}

/**
 * Load one source JSON file and apply all pre-processing transforms to each
 * model's OpenAPI spec. Returns the array of transformed per-model specs.
 */
export function getFalModelOpenApiObjects(filename: string): Array<object> {
  const fileContents = readFileSync(join(JSON_DIR, filename), "utf8");
  const json = JSON.parse(fileContents);

  let totalFixed = 0;
  const allUnknown = new Set<string>();

  const specs = json.models.map((model: { openapi: object }) => {
    const spec = model.openapi;
    const { fixed, unknown } = resolveMissingRefs(spec);
    totalFixed += fixed;
    unknown.forEach((u) => allUnknown.add(u));
    transformFalFileFields(spec);
    coerceDefaults(spec);
    return spec;
  });

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

/**
 * Build the merged spec for each category in one call. Used by both
 * openapi-ts.config.ts (one entry per category) and generate-endpoint-maps.
 */
export function buildMergedCategorySpecs(): Array<{
  category: string;
  mergedSpec: MergedSpec;
}> {
  return getFalGroupedCategoryFilenames().map(({ category, filenames }) => {
    const allSpecs = filenames.map(getFalModelOpenApiObjects).flat();
    return { category, mergedSpec: mergeOpenAPISpecs(allSpecs, category) };
  });
}
