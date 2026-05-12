// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import {
  zRouterAudioInput,
  zRouterAudioOutput,
  zWorkflowUtilitiesInterleaveVideoInput,
  zWorkflowUtilitiesInterleaveVideoOutput,
} from "./zod.gen.js";

/** Map of unknown endpoint id -> Zod input/output schemas. */
export const unknownEndpointZodMap: {
  readonly "fal-ai/workflow-utilities/interleave-video": {
    readonly input: typeof zWorkflowUtilitiesInterleaveVideoInput;
    readonly output: typeof zWorkflowUtilitiesInterleaveVideoOutput;
  };
  readonly "openrouter/router/audio": {
    readonly input: typeof zRouterAudioInput;
    readonly output: typeof zRouterAudioOutput;
  };
} = {
  "fal-ai/workflow-utilities/interleave-video": {
    input: zWorkflowUtilitiesInterleaveVideoInput,
    output: zWorkflowUtilitiesInterleaveVideoOutput,
  },
  "openrouter/router/audio": {
    input: zRouterAudioInput,
    output: zRouterAudioOutput,
  },
};

/** Union of valid unknown endpoint ids. */
export type UnknownEndpointId = keyof typeof unknownEndpointZodMap;
