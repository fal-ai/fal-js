/**
 * Convert a self-contained JSON Schema into one accepted by OpenAI's
 * structured-outputs **strict mode** (`response_format.json_schema` with
 * `strict: true`).
 *
 * OpenAI strict mode requires: every property in `required`; all
 * "optional" fields modelled as nullable; `additionalProperties: false`
 * on every object; `anyOf` instead of `oneOf`; and a small allowlist of
 * recognised keywords. This helper applies those transforms recursively
 * to a deep-clone of the input.
 *
 * Designed to pair with the schemas exported from
 * `@fal-ai/schemas/schemas/{category}`, which already bundle their `$ref`
 * closure under `$defs` and use `#/$defs/...` refs.
 *
 * @example
 * ```ts
 * import { toOpenAIStrict } from "@fal-ai/schemas/openai-strict";
 * import { Veo3InputSchema } from "@fal-ai/schemas/schemas/video";
 *
 * await openai.chat.completions.create({
 *   model: "gpt-5",
 *   messages: [...],
 *   response_format: {
 *     type: "json_schema",
 *     json_schema: { name: "veo3_input", schema: toOpenAIStrict(Veo3InputSchema), strict: true },
 *   },
 * });
 * ```
 */

type JsonSchema = Readonly<Record<string, unknown>>;

// Keys OpenAI strict mode recognises. Anything else is dropped.
// `default`, `examples`, `format`, `minLength`/`maxLength`, `minimum`/`maximum`,
// `pattern`, `multipleOf`, and our `x-fal-*` extensions all fall away.
const STRICT_ALLOWED_KEYS = new Set([
  "type",
  "properties",
  "required",
  "additionalProperties",
  "items",
  "anyOf",
  "$ref",
  "$defs",
  "enum",
  "const",
  "description",
  "title",
]);

export function toOpenAIStrict<T extends JsonSchema>(schema: T): JsonSchema {
  return transform(schema) as JsonSchema;
}

// Keys whose values are maps of name → schema (not schemas themselves).
// We recurse on the values but never apply the schema-keyword allowlist to
// the keys.
const SCHEMA_MAP_KEYS = new Set(["properties", "$defs"]);
// Keys whose values are arrays of literals that must be passed through verbatim.
const LITERAL_ARRAY_KEYS = new Set(["required", "enum"]);

function transform(node: unknown): unknown {
  if (typeof node !== "object" || node === null) return node;
  if (Array.isArray(node)) return node.map(transform);

  const input = node as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (key === "oneOf") {
      // OpenAI strict accepts anyOf, not oneOf.
      out.anyOf = transform(value);
      continue;
    }
    if (!STRICT_ALLOWED_KEYS.has(key)) continue;
    if (
      SCHEMA_MAP_KEYS.has(key) &&
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      const mapped: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value)) {
        mapped[k] = transform(v);
      }
      out[key] = mapped;
      continue;
    }
    if (LITERAL_ARRAY_KEYS.has(key)) {
      out[key] = value;
      continue;
    }
    out[key] = transform(value);
  }

  // Object-schema invariants: every declared property must appear in `required`;
  // properties not originally required are widened to allow `null`;
  // `additionalProperties: false` everywhere.
  if (
    out.type === "object" &&
    out.properties &&
    typeof out.properties === "object" &&
    !Array.isArray(out.properties)
  ) {
    const properties = out.properties as Record<string, unknown>;
    const originallyRequired = new Set(
      Array.isArray(out.required) ? (out.required as Array<string>) : [],
    );
    const newProperties: Record<string, unknown> = {};
    const newRequired: Array<string> = [];

    for (const [propName, propSchema] of Object.entries(properties)) {
      newRequired.push(propName);
      newProperties[propName] = originallyRequired.has(propName)
        ? propSchema
        : makeNullable(propSchema);
    }
    out.properties = newProperties;
    out.required = newRequired;
    out.additionalProperties = false;
  }

  return out;
}

/**
 * Widen `schema` so it accepts `null` in addition to its existing shape.
 * Used to convert optional properties into required-but-nullable form.
 */
function makeNullable(schema: unknown): unknown {
  if (typeof schema !== "object" || schema === null || Array.isArray(schema)) {
    return { anyOf: [schema, { type: "null" }] };
  }
  const s = schema as Record<string, unknown>;

  // Already nullable via type array.
  if (Array.isArray(s.type) && (s.type as Array<string>).includes("null")) {
    return s;
  }
  // Already nullable via anyOf member.
  if (
    Array.isArray(s.anyOf) &&
    (s.anyOf as Array<{ type?: string }>).some((v) => v?.type === "null")
  ) {
    return s;
  }

  // $ref / const / enum: wrap whole schema in anyOf with null.
  if (typeof s.$ref === "string" || "const" in s || Array.isArray(s.enum)) {
    return { anyOf: [s, { type: "null" }] };
  }

  // Single string type → type-array form.
  if (typeof s.type === "string") {
    return { ...s, type: [s.type as string, "null"] };
  }

  // anyOf without null → add null member.
  if (Array.isArray(s.anyOf)) {
    return { ...s, anyOf: [...(s.anyOf as Array<unknown>), { type: "null" }] };
  }

  // Fallback wrap.
  return { anyOf: [s, { type: "null" }] };
}
