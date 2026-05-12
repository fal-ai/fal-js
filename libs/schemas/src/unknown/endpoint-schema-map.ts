// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import type { UnknownEndpointId } from "./endpoint-zod-map.js";
import {
  RouterAudioInputSchema,
  RouterAudioOutputSchema,
  WorkflowUtilitiesInterleaveVideoInputSchema,
  WorkflowUtilitiesInterleaveVideoOutputSchema,
} from "./schemas.gen.js";

type JsonSchema = Readonly<Record<string, unknown>>;

/**
 * Map of unknown endpoint id -> self-contained JSON Schemas.
 * Each input/output schema bundles its $ref closure under `$defs`, so it
 * can be handed directly to LLM tool APIs or `z.fromJSONSchema`.
 */
export const unknownEndpointSchemaMap: Record<
  UnknownEndpointId,
  { readonly input: JsonSchema; readonly output: JsonSchema }
> = {
  "fal-ai/workflow-utilities/interleave-video": {
    input: WorkflowUtilitiesInterleaveVideoInputSchema,
    output: WorkflowUtilitiesInterleaveVideoOutputSchema,
  },
  "openrouter/router/audio": {
    input: RouterAudioInputSchema,
    output: RouterAudioOutputSchema,
  },
};
