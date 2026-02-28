import { RequiredConfig } from "./config";
import { dispatchRequest } from "./request";

/**
 * A JSON Schema object. This is a subset of the JSON Schema specification
 * that covers the most common properties used in OpenAPI schemas.
 */
export type JSONSchema = {
  type?: string | string[];
  properties?: Record<string, JSONSchema>;
  required?: string[];
  items?: JSONSchema;
  allOf?: JSONSchema[];
  anyOf?: JSONSchema[];
  oneOf?: JSONSchema[];
  $ref?: string;
  $defs?: Record<string, JSONSchema>;
  enum?: unknown[];
  const?: unknown;
  default?: unknown;
  description?: string;
  title?: string;
  format?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  additionalProperties?: boolean | JSONSchema;
  [key: string]: unknown;
};

/**
 * The input and output schemas for a fal endpoint.
 */
export interface EndpointSchemas {
  input: JSONSchema;
  output: JSONSchema;
}

type OpenAPISchema = {
  paths: Record<string, Record<string, OpenAPIOperation>>;
  components?: {
    schemas?: Record<string, JSONSchema>;
  };
};

type OpenAPIOperation = {
  requestBody?: {
    content?: {
      "application/json"?: {
        schema?: JSONSchema;
      };
    };
  };
  responses?: Record<
    string,
    {
      content?: {
        "application/json"?: {
          schema?: JSONSchema;
        };
      };
    }
  >;
};

const MAX_REF_DEPTH = 10;

/**
 * Resolves all $ref references in a schema by inlining the referenced definitions.
 * Handles circular references by tracking visited paths and collecting definitions for $defs.
 */
function resolveRefs(
  schema: JSONSchema,
  definitions: Record<string, JSONSchema>,
  visited: Set<string> = new Set(),
  depth = 0,
  collectedDefs: Record<string, JSONSchema> = {},
): JSONSchema {
  if (depth > MAX_REF_DEPTH) {
    return schema;
  }

  if (schema.$ref) {
    const refPath = schema.$ref.replace("#/components/schemas/", "");
    if (visited.has(refPath)) {
      // Add to $defs if not already there (check with 'in' to detect placeholder)
      if (!(refPath in collectedDefs) && definitions[refPath]) {
        // Mark as being processed to prevent infinite recursion
        collectedDefs[refPath] = {}; // placeholder
        // Resolve the definition with itself already visited,
        // so its self-references become $refs too
        collectedDefs[refPath] = resolveRefs(
          { ...definitions[refPath] },
          definitions,
          new Set([refPath]),
          0,
          collectedDefs,
        );
      }
      return { $ref: `#/$defs/${refPath}` };
    }

    const refSchema = definitions[refPath];
    if (!refSchema) {
      return schema;
    }

    visited.add(refPath);
    const resolved = resolveRefs(
      { ...refSchema },
      definitions,
      new Set(visited),
      depth + 1,
      collectedDefs,
    );
    visited.delete(refPath);
    return resolved;
  }

  const recurse = (value: JSONSchema): JSONSchema =>
    resolveRefs(value, definitions, new Set(visited), depth + 1, collectedDefs);

  // Copy all properties except the ones we'll handle specially
  const {
    properties,
    items,
    allOf,
    anyOf,
    oneOf,
    additionalProperties,
    ...rest
  } = schema;
  delete rest.$defs;
  const result: JSONSchema = { ...rest };

  if (properties) {
    result.properties = Object.fromEntries(
      Object.entries(properties).map(([k, v]) => [k, recurse(v)]),
    );
  }
  if (items) {
    result.items = recurse(items);
  }
  if (allOf) {
    result.allOf = allOf.map(recurse);
  }
  if (anyOf) {
    result.anyOf = anyOf.map(recurse);
  }
  if (oneOf) {
    result.oneOf = oneOf.map(recurse);
  }
  if (
    typeof additionalProperties === "object" &&
    additionalProperties !== null
  ) {
    result.additionalProperties = recurse(additionalProperties);
  } else if (additionalProperties !== undefined) {
    result.additionalProperties = additionalProperties;
  }

  return result;
}

function resolveSchemaRef(
  schemaRef: JSONSchema,
  definitions: Record<string, JSONSchema>,
  schemaType: "input" | "output",
): JSONSchema {
  const collectedDefs: Record<string, JSONSchema> = {};
  let result: JSONSchema;

  if (!schemaRef.$ref) {
    result = resolveRefs(
      { ...schemaRef },
      definitions,
      new Set(),
      0,
      collectedDefs,
    );
  } else {
    const refName = schemaRef.$ref.replace("#/components/schemas/", "");
    const refDef = definitions[refName];
    if (!refDef) {
      throw new Error(
        `Could not resolve ${schemaType} schema ref: ${schemaRef.$ref}`,
      );
    }
    result = resolveRefs(
      { ...refDef },
      definitions,
      new Set(),
      0,
      collectedDefs,
    );
  }

  if (Object.keys(collectedDefs).length > 0) {
    result.$defs = collectedDefs;
  }
  return result;
}

/**
 * Fetches the OpenAPI schema for an endpoint and extracts the input/output JSON schemas.
 *
 * @param endpointId The endpoint ID (e.g., "fal-ai/flux/dev")
 * @param config The client configuration
 * @returns The input and output JSON schemas for the endpoint
 */
export async function fetchEndpointSchemas(
  endpointId: string,
  config: RequiredConfig,
): Promise<EndpointSchemas> {
  const url = `https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=${encodeURIComponent(endpointId)}`;

  const openapi = await dispatchRequest<undefined, OpenAPISchema>({
    method: "GET",
    targetUrl: url,
    config,
  });

  const definitions = openapi.components?.schemas ?? {};
  const inputPath = `/${endpointId}`;
  const outputPath = `/${endpointId}/requests/{request_id}`;

  const inputSchemaRef =
    openapi.paths[inputPath]?.post?.requestBody?.content?.["application/json"]
      ?.schema;
  if (!inputSchemaRef) {
    throw new Error(`Could not find input schema for endpoint: ${endpointId}`);
  }

  const outputSchemaRef =
    openapi.paths[outputPath]?.get?.responses?.["200"]?.content?.[
      "application/json"
    ]?.schema;
  if (!outputSchemaRef) {
    throw new Error(`Could not find output schema for endpoint: ${endpointId}`);
  }

  return {
    input: resolveSchemaRef(inputSchemaRef, definitions, "input"),
    output: resolveSchemaRef(outputSchemaRef, definitions, "output"),
  };
}
