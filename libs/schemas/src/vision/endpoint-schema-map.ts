// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import type { VisionEndpointId } from "./endpoint-zod-map.js";
import {
  ArbiterImageImageInputSchema,
  ArbiterImageImageOutputSchema,
  ArbiterImageInputSchema,
  ArbiterImageOutputSchema,
  ArbiterImageTextInputSchema,
  ArbiterImageTextOutputSchema,
  Florence2LargeCaptionInputSchema,
  Florence2LargeCaptionOutputSchema,
  Florence2LargeDetailedCaptionInputSchema,
  Florence2LargeDetailedCaptionOutputSchema,
  Florence2LargeMoreDetailedCaptionInputSchema,
  Florence2LargeMoreDetailedCaptionOutputSchema,
  Florence2LargeOcrInputSchema,
  Florence2LargeOcrOutputSchema,
  Florence2LargeRegionToCategoryInputSchema,
  Florence2LargeRegionToCategoryOutputSchema,
  Florence2LargeRegionToDescriptionInputSchema,
  Florence2LargeRegionToDescriptionOutputSchema,
  GotOcrV2InputSchema,
  GotOcrV2OutputSchema,
  ImageutilsNsfwInputSchema,
  ImageutilsNsfwOutputSchema,
  Isaac01InputSchema,
  Isaac01OpenaiV1ChatCompletionsInputSchema,
  Isaac01OpenaiV1ChatCompletionsOutputSchema,
  Isaac01OutputSchema,
  LlavaNextInputSchema,
  LlavaNextOutputSchema,
  Moondream2InputSchema,
  Moondream2ObjectDetectionInputSchema,
  Moondream2ObjectDetectionOutputSchema,
  Moondream2OutputSchema,
  Moondream2PointObjectDetectionInputSchema,
  Moondream2PointObjectDetectionOutputSchema,
  Moondream2VisualQueryInputSchema,
  Moondream2VisualQueryOutputSchema,
  Moondream3PreviewCaptionInputSchema,
  Moondream3PreviewCaptionOutputSchema,
  Moondream3PreviewDetectInputSchema,
  Moondream3PreviewDetectOutputSchema,
  Moondream3PreviewPointInputSchema,
  Moondream3PreviewPointOutputSchema,
  Moondream3PreviewQueryInputSchema,
  Moondream3PreviewQueryOutputSchema,
  MoondreamBatchedInputSchema,
  MoondreamBatchedOutputSchema,
  MoondreamNextBatchInputSchema,
  MoondreamNextBatchOutputSchema,
  MoondreamNextInputSchema,
  MoondreamNextOutputSchema,
  RouterVisionInputSchema,
  RouterVisionOutputSchema,
  Sa2va4bImageInputSchema,
  Sa2va4bImageOutputSchema,
  Sa2va4bVideoInputSchema,
  Sa2va4bVideoOutputSchema,
  Sa2va8bImageInputSchema,
  Sa2va8bImageOutputSchema,
  Sa2va8bVideoInputSchema,
  Sa2va8bVideoOutputSchema,
  Sam3ImageEmbedInputSchema,
  Sam3ImageEmbedOutputSchema,
  VideoUnderstandingInputSchema,
  VideoUnderstandingOutputSchema,
  XAilabNsfwInputSchema,
  XAilabNsfwOutputSchema,
} from "./schemas.gen.js";

type JsonSchema = Readonly<Record<string, unknown>>;

/**
 * Map of vision endpoint id -> self-contained JSON Schemas.
 * Each input/output schema bundles its $ref closure under `$defs`, so it
 * can be handed directly to LLM tool APIs or `z.fromJSONSchema`.
 */
export const visionEndpointSchemaMap: Record<
  VisionEndpointId,
  { readonly input: JsonSchema; readonly output: JsonSchema }
> = {
  "fal-ai/arbiter/image": {
    input: ArbiterImageInputSchema,
    output: ArbiterImageOutputSchema,
  },
  "fal-ai/arbiter/image/image": {
    input: ArbiterImageImageInputSchema,
    output: ArbiterImageImageOutputSchema,
  },
  "fal-ai/arbiter/image/text": {
    input: ArbiterImageTextInputSchema,
    output: ArbiterImageTextOutputSchema,
  },
  "fal-ai/florence-2-large/caption": {
    input: Florence2LargeCaptionInputSchema,
    output: Florence2LargeCaptionOutputSchema,
  },
  "fal-ai/florence-2-large/detailed-caption": {
    input: Florence2LargeDetailedCaptionInputSchema,
    output: Florence2LargeDetailedCaptionOutputSchema,
  },
  "fal-ai/florence-2-large/more-detailed-caption": {
    input: Florence2LargeMoreDetailedCaptionInputSchema,
    output: Florence2LargeMoreDetailedCaptionOutputSchema,
  },
  "fal-ai/florence-2-large/ocr": {
    input: Florence2LargeOcrInputSchema,
    output: Florence2LargeOcrOutputSchema,
  },
  "fal-ai/florence-2-large/region-to-category": {
    input: Florence2LargeRegionToCategoryInputSchema,
    output: Florence2LargeRegionToCategoryOutputSchema,
  },
  "fal-ai/florence-2-large/region-to-description": {
    input: Florence2LargeRegionToDescriptionInputSchema,
    output: Florence2LargeRegionToDescriptionOutputSchema,
  },
  "fal-ai/got-ocr/v2": {
    input: GotOcrV2InputSchema,
    output: GotOcrV2OutputSchema,
  },
  "fal-ai/imageutils/nsfw": {
    input: ImageutilsNsfwInputSchema,
    output: ImageutilsNsfwOutputSchema,
  },
  "fal-ai/llava-next": {
    input: LlavaNextInputSchema,
    output: LlavaNextOutputSchema,
  },
  "fal-ai/moondream-next": {
    input: MoondreamNextInputSchema,
    output: MoondreamNextOutputSchema,
  },
  "fal-ai/moondream-next/batch": {
    input: MoondreamNextBatchInputSchema,
    output: MoondreamNextBatchOutputSchema,
  },
  "fal-ai/moondream/batched": {
    input: MoondreamBatchedInputSchema,
    output: MoondreamBatchedOutputSchema,
  },
  "fal-ai/moondream2": {
    input: Moondream2InputSchema,
    output: Moondream2OutputSchema,
  },
  "fal-ai/moondream2/object-detection": {
    input: Moondream2ObjectDetectionInputSchema,
    output: Moondream2ObjectDetectionOutputSchema,
  },
  "fal-ai/moondream2/point-object-detection": {
    input: Moondream2PointObjectDetectionInputSchema,
    output: Moondream2PointObjectDetectionOutputSchema,
  },
  "fal-ai/moondream2/visual-query": {
    input: Moondream2VisualQueryInputSchema,
    output: Moondream2VisualQueryOutputSchema,
  },
  "fal-ai/moondream3-preview/caption": {
    input: Moondream3PreviewCaptionInputSchema,
    output: Moondream3PreviewCaptionOutputSchema,
  },
  "fal-ai/moondream3-preview/detect": {
    input: Moondream3PreviewDetectInputSchema,
    output: Moondream3PreviewDetectOutputSchema,
  },
  "fal-ai/moondream3-preview/point": {
    input: Moondream3PreviewPointInputSchema,
    output: Moondream3PreviewPointOutputSchema,
  },
  "fal-ai/moondream3-preview/query": {
    input: Moondream3PreviewQueryInputSchema,
    output: Moondream3PreviewQueryOutputSchema,
  },
  "fal-ai/sa2va/4b/image": {
    input: Sa2va4bImageInputSchema,
    output: Sa2va4bImageOutputSchema,
  },
  "fal-ai/sa2va/4b/video": {
    input: Sa2va4bVideoInputSchema,
    output: Sa2va4bVideoOutputSchema,
  },
  "fal-ai/sa2va/8b/image": {
    input: Sa2va8bImageInputSchema,
    output: Sa2va8bImageOutputSchema,
  },
  "fal-ai/sa2va/8b/video": {
    input: Sa2va8bVideoInputSchema,
    output: Sa2va8bVideoOutputSchema,
  },
  "fal-ai/sam-3/image/embed": {
    input: Sam3ImageEmbedInputSchema,
    output: Sam3ImageEmbedOutputSchema,
  },
  "fal-ai/video-understanding": {
    input: VideoUnderstandingInputSchema,
    output: VideoUnderstandingOutputSchema,
  },
  "fal-ai/x-ailab/nsfw": {
    input: XAilabNsfwInputSchema,
    output: XAilabNsfwOutputSchema,
  },
  "openrouter/router/vision": {
    input: RouterVisionInputSchema,
    output: RouterVisionOutputSchema,
  },
  "perceptron/isaac-01": {
    input: Isaac01InputSchema,
    output: Isaac01OutputSchema,
  },
  "perceptron/isaac-01/openai/v1/chat/completions": {
    input: Isaac01OpenaiV1ChatCompletionsInputSchema,
    output: Isaac01OpenaiV1ChatCompletionsOutputSchema,
  },
};
