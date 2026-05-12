// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import { z } from "zod";

import {
  zBytedanceSeedV2MiniInput,
  zNemotron3NanoOmniInput,
  zQueueStatus,
  zQwen3GuardInput,
  zRouterInput,
  zRouterOpenaiV1ChatCompletionsInput,
  zRouterOpenaiV1EmbeddingsInput,
  zRouterOpenaiV1ResponsesInput,
  zVideoPromptGeneratorInput,
} from "./zod.gen";

/** Zod schema for llm endpoints using discriminatedUnion */
export const LlmEndpointSchema = z.discriminatedUnion("endpoint", [
  z.object({
    endpoint: z.literal("fal-ai/bytedance/seed/v2/mini"),
    input: zBytedanceSeedV2MiniInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/qwen-3-guard"),
    input: zQwen3GuardInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/video-prompt-generator"),
    input: zVideoPromptGeneratorInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("nvidia/nemotron-3-nano-omni"),
    input: zNemotron3NanoOmniInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("openrouter/router"),
    input: zRouterInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("openrouter/router/openai/v1/chat/completions"),
    input: zRouterOpenaiV1ChatCompletionsInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("openrouter/router/openai/v1/embeddings"),
    input: zRouterOpenaiV1EmbeddingsInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("openrouter/router/openai/v1/responses"),
    input: zRouterOpenaiV1ResponsesInput,
    output: zQueueStatus,
  }),
]);

/** Inferred type from LlmEndpointSchema */
export type LlmEndpoint = z.infer<typeof LlmEndpointSchema>;
