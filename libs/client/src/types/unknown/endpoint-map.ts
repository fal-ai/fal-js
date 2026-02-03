// AUTO-GENERATED - Do not edit manually
// Generated from types.gen.ts via scripts/generate-endpoint-maps.ts

import type {
  Qwen3TtsCloneVoice06bInput,
  Qwen3TtsCloneVoice06bOutput,
  Qwen3TtsCloneVoice17bInput,
  Qwen3TtsCloneVoice17bOutput,
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
  "fal-ai/qwen-3-tts/clone-voice/1.7b": {
    input: Qwen3TtsCloneVoice17bInput;
    output: Qwen3TtsCloneVoice17bOutput;
  };
  "fal-ai/qwen-3-tts/clone-voice/0.6b": {
    input: Qwen3TtsCloneVoice06bInput;
    output: Qwen3TtsCloneVoice06bOutput;
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
