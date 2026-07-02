// AUTO-GENERATED - Do not edit manually
// Generated from types.gen.ts via scripts/generate-endpoint-maps.ts

import type {
  BytedanceSeedV2MiniInput,
  BytedanceSeedV2MiniOutput,
  Qwen3GuardInput,
  Qwen3GuardOutput,
  RouterInput,
  RouterOpenaiV1ChatCompletionsInput,
  RouterOpenaiV1ChatCompletionsOutput,
  RouterOpenaiV1EmbeddingsInput,
  RouterOpenaiV1EmbeddingsOutput,
  RouterOpenaiV1ResponsesInput,
  RouterOpenaiV1ResponsesOutput,
  RouterOutput,
  VideoPromptGeneratorInput,
  VideoPromptGeneratorOutput,
} from "./types.gen";

export type LlmEndpointMap = {
  "fal-ai/bytedance/seed/v2/mini": {
    input: BytedanceSeedV2MiniInput;
    output: BytedanceSeedV2MiniOutput;
  };
  "fal-ai/qwen-3-guard": {
    input: Qwen3GuardInput;
    output: Qwen3GuardOutput;
  };
  "fal-ai/video-prompt-generator": {
    input: VideoPromptGeneratorInput;
    output: VideoPromptGeneratorOutput;
  };
  "openrouter/router": {
    input: RouterInput;
    output: RouterOutput;
  };
  "openrouter/router/openai/v1/chat/completions": {
    input: RouterOpenaiV1ChatCompletionsInput;
    output: RouterOpenaiV1ChatCompletionsOutput;
  };
  "openrouter/router/openai/v1/embeddings": {
    input: RouterOpenaiV1EmbeddingsInput;
    output: RouterOpenaiV1EmbeddingsOutput;
  };
  "openrouter/router/openai/v1/responses": {
    input: RouterOpenaiV1ResponsesInput;
    output: RouterOpenaiV1ResponsesOutput;
  };
};

/** Union type of all llm model endpoint IDs */
export type LlmModel = keyof LlmEndpointMap;

/** Get the input type for a specific llm model */
export type LlmModelInput<T extends LlmModel> = LlmEndpointMap[T]["input"];

/** Get the output type for a specific llm model */
export type LlmModelOutput<T extends LlmModel> = LlmEndpointMap[T]["output"];
