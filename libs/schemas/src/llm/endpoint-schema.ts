// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import {
  zBytedanceSeedV2MiniInput,
  zBytedanceSeedV2MiniOutput,
  zNemotron3NanoOmniInput,
  zNemotron3NanoOmniOutput,
  zQwen3GuardInput,
  zQwen3GuardOutput,
  zRouterInput,
  zRouterOpenaiV1ChatCompletionsInput,
  zRouterOpenaiV1ChatCompletionsOutput,
  zRouterOpenaiV1EmbeddingsInput,
  zRouterOpenaiV1EmbeddingsOutput,
  zRouterOpenaiV1ResponsesInput,
  zRouterOpenaiV1ResponsesOutput,
  zRouterOutput,
  zVideoPromptGeneratorInput,
  zVideoPromptGeneratorOutput,
} from "./zod.gen.js";

/** Map of llm endpoint id -> Zod input/output schemas. */
export const llmEndpoints: {
  readonly "fal-ai/bytedance/seed/v2/mini": {
    readonly input: typeof zBytedanceSeedV2MiniInput;
    readonly output: typeof zBytedanceSeedV2MiniOutput;
  };
  readonly "fal-ai/qwen-3-guard": {
    readonly input: typeof zQwen3GuardInput;
    readonly output: typeof zQwen3GuardOutput;
  };
  readonly "fal-ai/video-prompt-generator": {
    readonly input: typeof zVideoPromptGeneratorInput;
    readonly output: typeof zVideoPromptGeneratorOutput;
  };
  readonly "nvidia/nemotron-3-nano-omni": {
    readonly input: typeof zNemotron3NanoOmniInput;
    readonly output: typeof zNemotron3NanoOmniOutput;
  };
  readonly "openrouter/router": {
    readonly input: typeof zRouterInput;
    readonly output: typeof zRouterOutput;
  };
  readonly "openrouter/router/openai/v1/chat/completions": {
    readonly input: typeof zRouterOpenaiV1ChatCompletionsInput;
    readonly output: typeof zRouterOpenaiV1ChatCompletionsOutput;
  };
  readonly "openrouter/router/openai/v1/embeddings": {
    readonly input: typeof zRouterOpenaiV1EmbeddingsInput;
    readonly output: typeof zRouterOpenaiV1EmbeddingsOutput;
  };
  readonly "openrouter/router/openai/v1/responses": {
    readonly input: typeof zRouterOpenaiV1ResponsesInput;
    readonly output: typeof zRouterOpenaiV1ResponsesOutput;
  };
} = {
  "fal-ai/bytedance/seed/v2/mini": {
    input: zBytedanceSeedV2MiniInput,
    output: zBytedanceSeedV2MiniOutput,
  },
  "fal-ai/qwen-3-guard": { input: zQwen3GuardInput, output: zQwen3GuardOutput },
  "fal-ai/video-prompt-generator": {
    input: zVideoPromptGeneratorInput,
    output: zVideoPromptGeneratorOutput,
  },
  "nvidia/nemotron-3-nano-omni": {
    input: zNemotron3NanoOmniInput,
    output: zNemotron3NanoOmniOutput,
  },
  "openrouter/router": { input: zRouterInput, output: zRouterOutput },
  "openrouter/router/openai/v1/chat/completions": {
    input: zRouterOpenaiV1ChatCompletionsInput,
    output: zRouterOpenaiV1ChatCompletionsOutput,
  },
  "openrouter/router/openai/v1/embeddings": {
    input: zRouterOpenaiV1EmbeddingsInput,
    output: zRouterOpenaiV1EmbeddingsOutput,
  },
  "openrouter/router/openai/v1/responses": {
    input: zRouterOpenaiV1ResponsesInput,
    output: zRouterOpenaiV1ResponsesOutput,
  },
};

/** Union of valid llm endpoint ids. */
export type LlmEndpointId = keyof typeof llmEndpoints;
