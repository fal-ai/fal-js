// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import type { JsonEndpointId } from "./endpoint-zod-map.js";
import {
  BagelUnderstandInputSchema,
  BagelUnderstandOutputSchema,
  FiboEditEditStructured_instructionInputSchema,
  FiboEditEditStructured_instructionOutputSchema,
  FiboGenerateStructured_promptInputSchema,
  FiboGenerateStructured_promptOutputSchema,
  FiboLiteGenerateStructured_promptInputSchema,
  FiboLiteGenerateStructured_promptLiteInputSchema,
  FiboLiteGenerateStructured_promptLiteOutputSchema,
  FiboLiteGenerateStructured_promptOutputSchema,
  OmnilottieImageToLottieInputSchema,
  OmnilottieImageToLottieOutputSchema,
  OmnilottieInputSchema,
  OmnilottieOutputSchema,
  OmnilottieVideoToLottieInputSchema,
  OmnilottieVideoToLottieOutputSchema,
} from "./schemas.gen.js";

type JsonSchema = Readonly<Record<string, unknown>>;

/**
 * Map of json endpoint id -> self-contained JSON Schemas.
 * Each input/output schema bundles its $ref closure under `$defs`, so it
 * can be handed directly to LLM tool APIs or `z.fromJSONSchema`.
 */
export const jsonEndpointSchemaMap: Record<
  JsonEndpointId,
  { readonly input: JsonSchema; readonly output: JsonSchema }
> = {
  "bria/fibo-edit/edit/structured_instruction": {
    input: FiboEditEditStructured_instructionInputSchema,
    output: FiboEditEditStructured_instructionOutputSchema,
  },
  "bria/fibo-lite/generate/structured_prompt": {
    input: FiboLiteGenerateStructured_promptInputSchema,
    output: FiboLiteGenerateStructured_promptOutputSchema,
  },
  "bria/fibo-lite/generate/structured_prompt/lite": {
    input: FiboLiteGenerateStructured_promptLiteInputSchema,
    output: FiboLiteGenerateStructured_promptLiteOutputSchema,
  },
  "bria/fibo/generate/structured_prompt": {
    input: FiboGenerateStructured_promptInputSchema,
    output: FiboGenerateStructured_promptOutputSchema,
  },
  "fal-ai/bagel/understand": {
    input: BagelUnderstandInputSchema,
    output: BagelUnderstandOutputSchema,
  },
  "fal-ai/omnilottie": {
    input: OmnilottieInputSchema,
    output: OmnilottieOutputSchema,
  },
  "fal-ai/omnilottie/image-to-lottie": {
    input: OmnilottieImageToLottieInputSchema,
    output: OmnilottieImageToLottieOutputSchema,
  },
  "fal-ai/omnilottie/video-to-lottie": {
    input: OmnilottieVideoToLottieInputSchema,
    output: OmnilottieVideoToLottieOutputSchema,
  },
};
