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

/**
 * Resolves all $ref references in a schema by inlining the referenced definitions.
 * Handles circular references by tracking visited paths.
 */
function resolveRefs(
  schema: JSONSchema,
  definitions: Record<string, JSONSchema>,
  visited: Set<string> = new Set(),
  depth = 0,
): JSONSchema {
  const maxDepth = 10;
  if (depth > maxDepth) {
    return schema;
  }

  if (schema.$ref) {
    const refPath = schema.$ref.replace("#/components/schemas/", "");
    if (visited.has(refPath)) {
      // Circular reference - return a placeholder that references $defs
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
    );
    visited.delete(refPath);
    return resolved;
  }

  const result: JSONSchema = {};

  for (const [key, value] of Object.entries(schema)) {
    if (key === "$defs") {
      continue;
    }

    if (key === "properties" && typeof value === "object" && value !== null) {
      result.properties = {};
      for (const [propKey, propValue] of Object.entries(
        value as Record<string, JSONSchema>,
      )) {
        result.properties[propKey] = resolveRefs(
          propValue,
          definitions,
          new Set(visited),
          depth + 1,
        );
      }
    } else if (key === "items" && typeof value === "object" && value !== null) {
      result.items = resolveRefs(
        value as JSONSchema,
        definitions,
        new Set(visited),
        depth + 1,
      );
    } else if (
      (key === "allOf" || key === "anyOf" || key === "oneOf") &&
      Array.isArray(value)
    ) {
      result[key] = value.map((item) =>
        resolveRefs(item, definitions, new Set(visited), depth + 1),
      );
    } else if (
      key === "additionalProperties" &&
      typeof value === "object" &&
      value !== null
    ) {
      result.additionalProperties = resolveRefs(
        value as JSONSchema,
        definitions,
        new Set(visited),
        depth + 1,
      );
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Extracts the schema reference name from a $ref string.
 */
function extractRefName(ref: string): string {
  return ref.replace("#/components/schemas/", "");
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

  // The OpenAPI paths use the actual endpoint ID (e.g., "/fal-ai/flux/dev")
  const inputPath = `/${endpointId}`;
  const outputPath = `/${endpointId}/requests/{request_id}`;

  // Extract input schema from POST /{endpointId}
  const postPath = openapi.paths[inputPath];
  const postOp = postPath?.post;
  const inputSchemaRef =
    postOp?.requestBody?.content?.["application/json"]?.schema;

  if (!inputSchemaRef) {
    throw new Error(`Could not find input schema for endpoint: ${endpointId}`);
  }

  // Extract output schema from GET /{endpointId}/requests/{request_id}
  const getPath = openapi.paths[outputPath];
  const getOp = getPath?.get;
  const outputSchemaRef =
    getOp?.responses?.["200"]?.content?.["application/json"]?.schema;

  if (!outputSchemaRef) {
    throw new Error(`Could not find output schema for endpoint: ${endpointId}`);
  }

  // Resolve the input schema
  let inputSchema: JSONSchema;
  if (inputSchemaRef.$ref) {
    const inputRefName = extractRefName(inputSchemaRef.$ref);
    const inputDef = definitions[inputRefName];
    if (!inputDef) {
      throw new Error(
        `Could not resolve input schema ref: ${inputSchemaRef.$ref}`,
      );
    }
    inputSchema = resolveRefs({ ...inputDef }, definitions);
  } else {
    inputSchema = resolveRefs({ ...inputSchemaRef }, definitions);
  }

  // Resolve the output schema
  let outputSchema: JSONSchema;
  if (outputSchemaRef.$ref) {
    const outputRefName = extractRefName(outputSchemaRef.$ref);
    const outputDef = definitions[outputRefName];
    if (!outputDef) {
      throw new Error(
        `Could not resolve output schema ref: ${outputSchemaRef.$ref}`,
      );
    }
    outputSchema = resolveRefs({ ...outputDef }, definitions);
  } else {
    outputSchema = resolveRefs({ ...outputSchemaRef }, definitions);
  }

  return {
    input: inputSchema,
    output: outputSchema,
  };
}
