// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import {
  zBagelUnderstandInput,
  zBagelUnderstandOutput,
  zFiboEditEditStructuredInstructionInput,
  zFiboEditEditStructuredInstructionOutput,
  zFiboGenerateStructuredPromptInput,
  zFiboGenerateStructuredPromptOutput,
  zFiboLiteGenerateStructuredPromptInput,
  zFiboLiteGenerateStructuredPromptLiteInput,
  zFiboLiteGenerateStructuredPromptLiteOutput,
  zFiboLiteGenerateStructuredPromptOutput,
  zOmnilottieImageToLottieInput,
  zOmnilottieImageToLottieOutput,
  zOmnilottieInput,
  zOmnilottieOutput,
  zOmnilottieVideoToLottieInput,
  zOmnilottieVideoToLottieOutput,
} from "./zod.gen.js";

/** Map of json endpoint id -> Zod input/output schemas. */
export const jsonEndpoints: {
  readonly "bria/fibo-edit/edit/structured_instruction": {
    readonly input: typeof zFiboEditEditStructuredInstructionInput;
    readonly output: typeof zFiboEditEditStructuredInstructionOutput;
  };
  readonly "bria/fibo-lite/generate/structured_prompt": {
    readonly input: typeof zFiboLiteGenerateStructuredPromptInput;
    readonly output: typeof zFiboLiteGenerateStructuredPromptOutput;
  };
  readonly "bria/fibo-lite/generate/structured_prompt/lite": {
    readonly input: typeof zFiboLiteGenerateStructuredPromptLiteInput;
    readonly output: typeof zFiboLiteGenerateStructuredPromptLiteOutput;
  };
  readonly "bria/fibo/generate/structured_prompt": {
    readonly input: typeof zFiboGenerateStructuredPromptInput;
    readonly output: typeof zFiboGenerateStructuredPromptOutput;
  };
  readonly "fal-ai/bagel/understand": {
    readonly input: typeof zBagelUnderstandInput;
    readonly output: typeof zBagelUnderstandOutput;
  };
  readonly "fal-ai/omnilottie": {
    readonly input: typeof zOmnilottieInput;
    readonly output: typeof zOmnilottieOutput;
  };
  readonly "fal-ai/omnilottie/image-to-lottie": {
    readonly input: typeof zOmnilottieImageToLottieInput;
    readonly output: typeof zOmnilottieImageToLottieOutput;
  };
  readonly "fal-ai/omnilottie/video-to-lottie": {
    readonly input: typeof zOmnilottieVideoToLottieInput;
    readonly output: typeof zOmnilottieVideoToLottieOutput;
  };
} = {
  "bria/fibo-edit/edit/structured_instruction": {
    input: zFiboEditEditStructuredInstructionInput,
    output: zFiboEditEditStructuredInstructionOutput,
  },
  "bria/fibo-lite/generate/structured_prompt": {
    input: zFiboLiteGenerateStructuredPromptInput,
    output: zFiboLiteGenerateStructuredPromptOutput,
  },
  "bria/fibo-lite/generate/structured_prompt/lite": {
    input: zFiboLiteGenerateStructuredPromptLiteInput,
    output: zFiboLiteGenerateStructuredPromptLiteOutput,
  },
  "bria/fibo/generate/structured_prompt": {
    input: zFiboGenerateStructuredPromptInput,
    output: zFiboGenerateStructuredPromptOutput,
  },
  "fal-ai/bagel/understand": {
    input: zBagelUnderstandInput,
    output: zBagelUnderstandOutput,
  },
  "fal-ai/omnilottie": { input: zOmnilottieInput, output: zOmnilottieOutput },
  "fal-ai/omnilottie/image-to-lottie": {
    input: zOmnilottieImageToLottieInput,
    output: zOmnilottieImageToLottieOutput,
  },
  "fal-ai/omnilottie/video-to-lottie": {
    input: zOmnilottieVideoToLottieInput,
    output: zOmnilottieVideoToLottieOutput,
  },
};

/** Union of valid json endpoint ids. */
export type JsonEndpointId = keyof typeof jsonEndpoints;
