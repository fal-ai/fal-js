// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import {
  WorkflowUtilitiesPickImageByIndexInputSchema,
  WorkflowUtilitiesPickImageByIndexOutputSchema,
} from "./schemas.gen.js";

/**
 * Map of workflow endpoint id -> self-contained JSON Schemas.
 * Each input/output schema bundles its $ref closure under `$defs`, so it
 * can be handed directly to LLM tool APIs or `z.fromJSONSchema`.
 */
export const workflowEndpointSchemaMap: {
  readonly "fal-ai/workflow-utilities/pick-image-by-index": {
    readonly input: typeof WorkflowUtilitiesPickImageByIndexInputSchema;
    readonly output: typeof WorkflowUtilitiesPickImageByIndexOutputSchema;
  };
} = {
  "fal-ai/workflow-utilities/pick-image-by-index": {
    input: WorkflowUtilitiesPickImageByIndexInputSchema,
    output: WorkflowUtilitiesPickImageByIndexOutputSchema,
  },
};
