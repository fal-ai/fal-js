// AUTO-GENERATED - Do not edit manually
// Generated from types.gen.ts via scripts/generate-endpoint-maps.ts

import { z } from "zod";

import {
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
} from "./zod.gen";

/** Zod schema for llm endpoints using discriminatedUnion */
export const LlmEndpointSchema = z.discriminatedUnion("endpoint", [
  z.object({
    endpoint: z.literal("openrouter/router/openai/v1/responses"),
    input: zRouterOpenaiV1ResponsesInput,
    output: zRouterOpenaiV1ResponsesOutput,
  }),
  z.object({
    endpoint: z.literal("openrouter/router/openai/v1/embeddings"),
    input: zRouterOpenaiV1EmbeddingsInput,
    output: zRouterOpenaiV1EmbeddingsOutput,
  }),
  z.object({
    endpoint: z.literal("openrouter/router"),
    input: zRouterInput,
    output: zRouterOutput,
  }),
  z.object({
    endpoint: z.literal("openrouter/router/openai/v1/chat/completions"),
    input: zRouterOpenaiV1ChatCompletionsInput,
    output: zRouterOpenaiV1ChatCompletionsOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/qwen-3-guard"),
    input: zQwen3GuardInput,
    output: zQwen3GuardOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/video-prompt-generator"),
    input: zVideoPromptGeneratorInput,
    output: zVideoPromptGeneratorOutput,
  }),
]);

/** Inferred type from LlmEndpointSchema */
export type LlmEndpoint = z.infer<typeof LlmEndpointSchema>;
