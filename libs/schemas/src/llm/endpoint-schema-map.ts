// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import {
  BytedanceSeedV2MiniInputSchema,
  BytedanceSeedV2MiniOutputSchema,
  Nemotron3NanoOmniInputSchema,
  Nemotron3NanoOmniOutputSchema,
  Qwen3GuardInputSchema,
  Qwen3GuardOutputSchema,
  RouterInputSchema,
  RouterOpenaiV1ChatCompletionsInputSchema,
  RouterOpenaiV1ChatCompletionsOutputSchema,
  RouterOpenaiV1EmbeddingsInputSchema,
  RouterOpenaiV1EmbeddingsOutputSchema,
  RouterOpenaiV1ResponsesInputSchema,
  RouterOpenaiV1ResponsesOutputSchema,
  RouterOutputSchema,
  VideoPromptGeneratorInputSchema,
  VideoPromptGeneratorOutputSchema,
} from "./schemas.gen.js";

/**
 * Map of llm endpoint id -> self-contained JSON Schemas.
 * Each input/output schema bundles its $ref closure under `$defs`, so it
 * can be handed directly to LLM tool APIs or `z.fromJSONSchema`.
 */
export const llmEndpointSchemaMap: {
  readonly "fal-ai/bytedance/seed/v2/mini": {
    readonly input: typeof BytedanceSeedV2MiniInputSchema;
    readonly output: typeof BytedanceSeedV2MiniOutputSchema;
  };
  readonly "fal-ai/qwen-3-guard": {
    readonly input: typeof Qwen3GuardInputSchema;
    readonly output: typeof Qwen3GuardOutputSchema;
  };
  readonly "fal-ai/video-prompt-generator": {
    readonly input: typeof VideoPromptGeneratorInputSchema;
    readonly output: typeof VideoPromptGeneratorOutputSchema;
  };
  readonly "nvidia/nemotron-3-nano-omni": {
    readonly input: typeof Nemotron3NanoOmniInputSchema;
    readonly output: typeof Nemotron3NanoOmniOutputSchema;
  };
  readonly "openrouter/router": {
    readonly input: typeof RouterInputSchema;
    readonly output: typeof RouterOutputSchema;
  };
  readonly "openrouter/router/openai/v1/chat/completions": {
    readonly input: typeof RouterOpenaiV1ChatCompletionsInputSchema;
    readonly output: typeof RouterOpenaiV1ChatCompletionsOutputSchema;
  };
  readonly "openrouter/router/openai/v1/embeddings": {
    readonly input: typeof RouterOpenaiV1EmbeddingsInputSchema;
    readonly output: typeof RouterOpenaiV1EmbeddingsOutputSchema;
  };
  readonly "openrouter/router/openai/v1/responses": {
    readonly input: typeof RouterOpenaiV1ResponsesInputSchema;
    readonly output: typeof RouterOpenaiV1ResponsesOutputSchema;
  };
} = {
  "fal-ai/bytedance/seed/v2/mini": {
    input: BytedanceSeedV2MiniInputSchema,
    output: BytedanceSeedV2MiniOutputSchema,
  },
  "fal-ai/qwen-3-guard": {
    input: Qwen3GuardInputSchema,
    output: Qwen3GuardOutputSchema,
  },
  "fal-ai/video-prompt-generator": {
    input: VideoPromptGeneratorInputSchema,
    output: VideoPromptGeneratorOutputSchema,
  },
  "nvidia/nemotron-3-nano-omni": {
    input: Nemotron3NanoOmniInputSchema,
    output: Nemotron3NanoOmniOutputSchema,
  },
  "openrouter/router": { input: RouterInputSchema, output: RouterOutputSchema },
  "openrouter/router/openai/v1/chat/completions": {
    input: RouterOpenaiV1ChatCompletionsInputSchema,
    output: RouterOpenaiV1ChatCompletionsOutputSchema,
  },
  "openrouter/router/openai/v1/embeddings": {
    input: RouterOpenaiV1EmbeddingsInputSchema,
    output: RouterOpenaiV1EmbeddingsOutputSchema,
  },
  "openrouter/router/openai/v1/responses": {
    input: RouterOpenaiV1ResponsesInputSchema,
    output: RouterOpenaiV1ResponsesOutputSchema,
  },
};
