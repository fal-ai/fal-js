// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import type { LlmEndpointId } from "./endpoint-zod-map.js";
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

type JsonSchema = Readonly<Record<string, unknown>>;

/**
 * Map of llm endpoint id -> self-contained JSON Schemas.
 * Each input/output schema bundles its $ref closure under `$defs`, so it
 * can be handed directly to LLM tool APIs or `z.fromJSONSchema`.
 */
export const llmEndpointSchemaMap: Record<
  LlmEndpointId,
  { readonly input: JsonSchema; readonly output: JsonSchema }
> = {
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
