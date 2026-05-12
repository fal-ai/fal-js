// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import type { WorkflowEndpointId } from "./endpoint-zod-map.js";
import {
  WorkflowUtilitiesPickImageByIndexInputSchema,
  WorkflowUtilitiesPickImageByIndexOutputSchema,
} from "./schemas.gen.js";

type JsonSchema = Readonly<Record<string, unknown>>;

/**
 * Map of workflow endpoint id -> self-contained JSON Schemas.
 * Each input/output schema bundles its $ref closure under `$defs`, so it
 * can be handed directly to LLM tool APIs or `z.fromJSONSchema`.
 */
export const workflowEndpointSchemaMap: Record<
  WorkflowEndpointId,
  { readonly input: JsonSchema; readonly output: JsonSchema }
> = {
  "fal-ai/workflow-utilities/pick-image-by-index": {
    input: WorkflowUtilitiesPickImageByIndexInputSchema,
    output: WorkflowUtilitiesPickImageByIndexOutputSchema,
  },
};
