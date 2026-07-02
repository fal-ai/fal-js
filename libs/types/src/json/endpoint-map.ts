// AUTO-GENERATED - Do not edit manually
// Generated from types.gen.ts via scripts/generate-endpoint-maps.ts

import type {
  BagelUnderstandInput,
  BagelUnderstandOutput,
  FfmpegApiLoudnormInput,
  FfmpegApiLoudnormOutput,
  FfmpegApiMetadataInput,
  FfmpegApiMetadataOutput,
  FfmpegApiWaveformInput,
  FfmpegApiWaveformOutput,
  FiboEditEditStructuredInstructionInput,
  FiboEditEditStructuredInstructionOutput,
  FiboGenerateStructuredPromptInput,
  FiboGenerateStructuredPromptOutput,
  FiboLiteGenerateStructuredPromptInput,
  FiboLiteGenerateStructuredPromptLiteInput,
  FiboLiteGenerateStructuredPromptLiteOutput,
  FiboLiteGenerateStructuredPromptOutput,
  OmnilottieImageToLottieInput,
  OmnilottieImageToLottieOutput,
  OmnilottieInput,
  OmnilottieOutput,
  OmnilottieVideoToLottieInput,
  OmnilottieVideoToLottieOutput,
} from "./types.gen";

export type JsonEndpointMap = {
  "bria/fibo-edit/edit/structured_instruction": {
    input: FiboEditEditStructuredInstructionInput;
    output: FiboEditEditStructuredInstructionOutput;
  };
  "bria/fibo-lite/generate/structured_prompt": {
    input: FiboLiteGenerateStructuredPromptInput;
    output: FiboLiteGenerateStructuredPromptOutput;
  };
  "bria/fibo-lite/generate/structured_prompt/lite": {
    input: FiboLiteGenerateStructuredPromptLiteInput;
    output: FiboLiteGenerateStructuredPromptLiteOutput;
  };
  "bria/fibo/generate/structured_prompt": {
    input: FiboGenerateStructuredPromptInput;
    output: FiboGenerateStructuredPromptOutput;
  };
  "fal-ai/bagel/understand": {
    input: BagelUnderstandInput;
    output: BagelUnderstandOutput;
  };
  "fal-ai/ffmpeg-api/loudnorm": {
    input: FfmpegApiLoudnormInput;
    output: FfmpegApiLoudnormOutput;
  };
  "fal-ai/ffmpeg-api/metadata": {
    input: FfmpegApiMetadataInput;
    output: FfmpegApiMetadataOutput;
  };
  "fal-ai/ffmpeg-api/waveform": {
    input: FfmpegApiWaveformInput;
    output: FfmpegApiWaveformOutput;
  };
  "fal-ai/omnilottie": {
    input: OmnilottieInput;
    output: OmnilottieOutput;
  };
  "fal-ai/omnilottie/image-to-lottie": {
    input: OmnilottieImageToLottieInput;
    output: OmnilottieImageToLottieOutput;
  };
  "fal-ai/omnilottie/video-to-lottie": {
    input: OmnilottieVideoToLottieInput;
    output: OmnilottieVideoToLottieOutput;
  };
};

/** Union type of all json model endpoint IDs */
export type JsonModel = keyof JsonEndpointMap;

/** Get the input type for a specific json model */
export type JsonModelInput<T extends JsonModel> = JsonEndpointMap[T]["input"];

/** Get the output type for a specific json model */
export type JsonModelOutput<T extends JsonModel> = JsonEndpointMap[T]["output"];
