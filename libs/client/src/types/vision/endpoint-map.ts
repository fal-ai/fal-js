// AUTO-GENERATED - Do not edit manually
// Generated from types.gen.ts via scripts/generate-endpoint-maps.ts

import type {
  AiDetectorDetectImageInput,
  AiDetectorDetectImageOutput,
  ArbiterImageImageInput,
  ArbiterImageImageOutput,
  ArbiterImageInput,
  ArbiterImageOutput,
  ArbiterImageTextInput,
  ArbiterImageTextOutput,
  Florence2LargeCaptionInput,
  Florence2LargeCaptionOutput,
  Florence2LargeDetailedCaptionInput,
  Florence2LargeDetailedCaptionOutput,
  Florence2LargeMoreDetailedCaptionInput,
  Florence2LargeMoreDetailedCaptionOutput,
  Florence2LargeOcrInput,
  Florence2LargeOcrOutput,
  Florence2LargeRegionToCategoryInput,
  Florence2LargeRegionToCategoryOutput,
  Florence2LargeRegionToDescriptionInput,
  Florence2LargeRegionToDescriptionOutput,
  GotOcrV2Input,
  GotOcrV2Output,
  ImageutilsNsfwInput,
  ImageutilsNsfwOutput,
  Isaac01Input,
  Isaac01OpenaiV1ChatCompletionsInput,
  Isaac01OpenaiV1ChatCompletionsOutput,
  Isaac01Output,
  LlavaNextInput,
  LlavaNextOutput,
  Moondream2Input,
  Moondream2ObjectDetectionInput,
  Moondream2ObjectDetectionOutput,
  Moondream2Output,
  Moondream2PointObjectDetectionInput,
  Moondream2PointObjectDetectionOutput,
  Moondream2VisualQueryInput,
  Moondream2VisualQueryOutput,
  Moondream3PreviewCaptionInput,
  Moondream3PreviewCaptionOutput,
  Moondream3PreviewDetectInput,
  Moondream3PreviewDetectOutput,
  Moondream3PreviewPointInput,
  Moondream3PreviewPointOutput,
  Moondream3PreviewQueryInput,
  Moondream3PreviewQueryOutput,
  MoondreamBatchedInput,
  MoondreamBatchedOutput,
  MoondreamNextBatchInput,
  MoondreamNextBatchOutput,
  MoondreamNextInput,
  MoondreamNextOutput,
  RouterVisionInput,
  RouterVisionOutput,
  Sa2Va4bImageInput,
  Sa2Va4bImageOutput,
  Sa2Va4bVideoInput,
  Sa2Va4bVideoOutput,
  Sa2Va8bImageInput,
  Sa2Va8bImageOutput,
  Sa2Va8bVideoInput,
  Sa2Va8bVideoOutput,
  Sam3ImageEmbedInput,
  Sam3ImageEmbedOutput,
  VideoUnderstandingInput,
  VideoUnderstandingOutput,
  XAilabNsfwInput,
  XAilabNsfwOutput,
} from "./types.gen";

export type VisionEndpointMap = {
  "fal-ai/arbiter/image/text": {
    input: ArbiterImageTextInput;
    output: ArbiterImageTextOutput;
  };
  "fal-ai/arbiter/image/image": {
    input: ArbiterImageImageInput;
    output: ArbiterImageImageOutput;
  };
  "fal-ai/arbiter/image": {
    input: ArbiterImageInput;
    output: ArbiterImageOutput;
  };
  "half-moon-ai/ai-detector/detect-image": {
    input: AiDetectorDetectImageInput;
    output: AiDetectorDetectImageOutput;
  };
  "fal-ai/sam-3/image/embed": {
    input: Sam3ImageEmbedInput;
    output: Sam3ImageEmbedOutput;
  };
  "openrouter/router/vision": {
    input: RouterVisionInput;
    output: RouterVisionOutput;
  };
  "fal-ai/moondream3-preview/detect": {
    input: Moondream3PreviewDetectInput;
    output: Moondream3PreviewDetectOutput;
  };
  "fal-ai/moondream3-preview/point": {
    input: Moondream3PreviewPointInput;
    output: Moondream3PreviewPointOutput;
  };
  "fal-ai/moondream3-preview/query": {
    input: Moondream3PreviewQueryInput;
    output: Moondream3PreviewQueryOutput;
  };
  "fal-ai/moondream3-preview/caption": {
    input: Moondream3PreviewCaptionInput;
    output: Moondream3PreviewCaptionOutput;
  };
  "perceptron/isaac-01/openai/v1/chat/completions": {
    input: Isaac01OpenaiV1ChatCompletionsInput;
    output: Isaac01OpenaiV1ChatCompletionsOutput;
  };
  "perceptron/isaac-01": {
    input: Isaac01Input;
    output: Isaac01Output;
  };
  "fal-ai/x-ailab/nsfw": {
    input: XAilabNsfwInput;
    output: XAilabNsfwOutput;
  };
  "fal-ai/video-understanding": {
    input: VideoUnderstandingInput;
    output: VideoUnderstandingOutput;
  };
  "fal-ai/moondream2/visual-query": {
    input: Moondream2VisualQueryInput;
    output: Moondream2VisualQueryOutput;
  };
  "fal-ai/moondream2": {
    input: Moondream2Input;
    output: Moondream2Output;
  };
  "fal-ai/moondream2/point-object-detection": {
    input: Moondream2PointObjectDetectionInput;
    output: Moondream2PointObjectDetectionOutput;
  };
  "fal-ai/moondream2/object-detection": {
    input: Moondream2ObjectDetectionInput;
    output: Moondream2ObjectDetectionOutput;
  };
  "fal-ai/got-ocr/v2": {
    input: GotOcrV2Input;
    output: GotOcrV2Output;
  };
  "fal-ai/moondream-next/batch": {
    input: MoondreamNextBatchInput;
    output: MoondreamNextBatchOutput;
  };
  "fal-ai/sa2va/4b/video": {
    input: Sa2Va4bVideoInput;
    output: Sa2Va4bVideoOutput;
  };
  "fal-ai/sa2va/8b/video": {
    input: Sa2Va8bVideoInput;
    output: Sa2Va8bVideoOutput;
  };
  "fal-ai/sa2va/4b/image": {
    input: Sa2Va4bImageInput;
    output: Sa2Va4bImageOutput;
  };
  "fal-ai/sa2va/8b/image": {
    input: Sa2Va8bImageInput;
    output: Sa2Va8bImageOutput;
  };
  "fal-ai/moondream-next": {
    input: MoondreamNextInput;
    output: MoondreamNextOutput;
  };
  "fal-ai/florence-2-large/region-to-description": {
    input: Florence2LargeRegionToDescriptionInput;
    output: Florence2LargeRegionToDescriptionOutput;
  };
  "fal-ai/florence-2-large/ocr": {
    input: Florence2LargeOcrInput;
    output: Florence2LargeOcrOutput;
  };
  "fal-ai/florence-2-large/more-detailed-caption": {
    input: Florence2LargeMoreDetailedCaptionInput;
    output: Florence2LargeMoreDetailedCaptionOutput;
  };
  "fal-ai/florence-2-large/region-to-category": {
    input: Florence2LargeRegionToCategoryInput;
    output: Florence2LargeRegionToCategoryOutput;
  };
  "fal-ai/florence-2-large/caption": {
    input: Florence2LargeCaptionInput;
    output: Florence2LargeCaptionOutput;
  };
  "fal-ai/florence-2-large/detailed-caption": {
    input: Florence2LargeDetailedCaptionInput;
    output: Florence2LargeDetailedCaptionOutput;
  };
  "fal-ai/imageutils/nsfw": {
    input: ImageutilsNsfwInput;
    output: ImageutilsNsfwOutput;
  };
  "fal-ai/moondream/batched": {
    input: MoondreamBatchedInput;
    output: MoondreamBatchedOutput;
  };
  "fal-ai/llava-next": {
    input: LlavaNextInput;
    output: LlavaNextOutput;
  };
};

/** Union type of all vision model endpoint IDs */
export type VisionModel = keyof VisionEndpointMap;

/** Get the input type for a specific vision model */
export type VisionModelInput<T extends VisionModel> =
  VisionEndpointMap[T]["input"];

/** Get the output type for a specific vision model */
export type VisionModelOutput<T extends VisionModel> =
  VisionEndpointMap[T]["output"];
