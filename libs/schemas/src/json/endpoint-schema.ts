// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import { z } from "zod";

import {
  zBagelUnderstandInput,
  zFiboEditEditStructuredInstructionInput,
  zFiboGenerateStructuredPromptInput,
  zFiboLiteGenerateStructuredPromptInput,
  zFiboLiteGenerateStructuredPromptLiteInput,
  zOmnilottieImageToLottieInput,
  zOmnilottieInput,
  zOmnilottieVideoToLottieInput,
  zQueueStatus,
} from "./zod.gen";

/** Zod schema for json endpoints using discriminatedUnion */
export const JsonEndpointSchema = z.discriminatedUnion("endpoint", [
  z.object({
    endpoint: z.literal("bria/fibo-edit/edit/structured_instruction"),
    input: zFiboEditEditStructuredInstructionInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("bria/fibo-lite/generate/structured_prompt"),
    input: zFiboLiteGenerateStructuredPromptInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("bria/fibo-lite/generate/structured_prompt/lite"),
    input: zFiboLiteGenerateStructuredPromptLiteInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("bria/fibo/generate/structured_prompt"),
    input: zFiboGenerateStructuredPromptInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/bagel/understand"),
    input: zBagelUnderstandInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/omnilottie"),
    input: zOmnilottieInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/omnilottie/image-to-lottie"),
    input: zOmnilottieImageToLottieInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/omnilottie/video-to-lottie"),
    input: zOmnilottieVideoToLottieInput,
    output: zQueueStatus,
  }),
]);

/** Inferred type from JsonEndpointSchema */
export type JsonEndpoint = z.infer<typeof JsonEndpointSchema>;
