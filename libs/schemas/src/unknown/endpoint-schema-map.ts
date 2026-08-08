// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import {
  RouterAudioInputSchema,
  RouterAudioOutputSchema,
  WorkflowUtilitiesInterleaveVideoInputSchema,
  WorkflowUtilitiesInterleaveVideoOutputSchema,
} from "./schemas.gen.js";

/**
 * Map of unknown endpoint id -> self-contained JSON Schemas.
 * Each input/output schema bundles its $ref closure under `$defs`, so it
 * can be handed directly to LLM tool APIs or `z.fromJSONSchema`.
 */
export const unknownEndpointSchemaMap: {
  readonly "fal-ai/workflow-utilities/interleave-video": {
    readonly input: typeof WorkflowUtilitiesInterleaveVideoInputSchema;
    readonly output: typeof WorkflowUtilitiesInterleaveVideoOutputSchema;
  };
  readonly "openrouter/router/audio": {
    readonly input: typeof RouterAudioInputSchema;
    readonly output: typeof RouterAudioOutputSchema;
  };
} = {
  "fal-ai/workflow-utilities/interleave-video": {
    input: WorkflowUtilitiesInterleaveVideoInputSchema,
    output: WorkflowUtilitiesInterleaveVideoOutputSchema,
  },
  "openrouter/router/audio": {
    input: RouterAudioInputSchema,
    output: RouterAudioOutputSchema,
  },
};
