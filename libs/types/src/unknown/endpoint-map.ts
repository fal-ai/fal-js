// AUTO-GENERATED - Do not edit manually
// Generated from types.gen.ts via scripts/generate-endpoint-maps.ts

import type {
  RouterAudioInput,
  RouterAudioOutput,
  WorkflowUtilitiesInterleaveVideoInput,
  WorkflowUtilitiesInterleaveVideoOutput,
} from "./types.gen";

export type UnknownEndpointMap = {
  "fal-ai/workflow-utilities/interleave-video": {
    input: WorkflowUtilitiesInterleaveVideoInput;
    output: WorkflowUtilitiesInterleaveVideoOutput;
  };
  "openrouter/router/audio": {
    input: RouterAudioInput;
    output: RouterAudioOutput;
  };
};

/** Union type of all unknown model endpoint IDs */
export type UnknownModel = keyof UnknownEndpointMap;

/** Get the input type for a specific unknown model */
export type UnknownModelInput<T extends UnknownModel> =
  UnknownEndpointMap[T]["input"];

/** Get the output type for a specific unknown model */
export type UnknownModelOutput<T extends UnknownModel> =
  UnknownEndpointMap[T]["output"];
