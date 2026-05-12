// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import { z } from "zod";

import {
  zArbiterImageImageInput,
  zArbiterImageInput,
  zArbiterImageTextInput,
  zFlorence2LargeCaptionInput,
  zFlorence2LargeDetailedCaptionInput,
  zFlorence2LargeMoreDetailedCaptionInput,
  zFlorence2LargeOcrInput,
  zFlorence2LargeRegionToCategoryInput,
  zFlorence2LargeRegionToDescriptionInput,
  zGotOcrV2Input,
  zImageutilsNsfwInput,
  zIsaac01Input,
  zIsaac01OpenaiV1ChatCompletionsInput,
  zLlavaNextInput,
  zMoondream2Input,
  zMoondream2ObjectDetectionInput,
  zMoondream2PointObjectDetectionInput,
  zMoondream2VisualQueryInput,
  zMoondream3PreviewCaptionInput,
  zMoondream3PreviewDetectInput,
  zMoondream3PreviewPointInput,
  zMoondream3PreviewQueryInput,
  zMoondreamBatchedInput,
  zMoondreamNextBatchInput,
  zMoondreamNextInput,
  zQueueStatus,
  zRouterVisionInput,
  zSa2Va4bImageInput,
  zSa2Va4bVideoInput,
  zSa2Va8bImageInput,
  zSa2Va8bVideoInput,
  zSam3ImageEmbedInput,
  zVideoUnderstandingInput,
  zXAilabNsfwInput,
} from "./zod.gen";

/** Zod schema for vision endpoints using discriminatedUnion */
export const VisionEndpointSchema = z.discriminatedUnion("endpoint", [
  z.object({
    endpoint: z.literal("fal-ai/arbiter/image"),
    input: zArbiterImageInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/arbiter/image/image"),
    input: zArbiterImageImageInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/arbiter/image/text"),
    input: zArbiterImageTextInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/florence-2-large/caption"),
    input: zFlorence2LargeCaptionInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/florence-2-large/detailed-caption"),
    input: zFlorence2LargeDetailedCaptionInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/florence-2-large/more-detailed-caption"),
    input: zFlorence2LargeMoreDetailedCaptionInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/florence-2-large/ocr"),
    input: zFlorence2LargeOcrInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/florence-2-large/region-to-category"),
    input: zFlorence2LargeRegionToCategoryInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/florence-2-large/region-to-description"),
    input: zFlorence2LargeRegionToDescriptionInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/got-ocr/v2"),
    input: zGotOcrV2Input,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/imageutils/nsfw"),
    input: zImageutilsNsfwInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/llava-next"),
    input: zLlavaNextInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/moondream-next"),
    input: zMoondreamNextInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/moondream-next/batch"),
    input: zMoondreamNextBatchInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/moondream/batched"),
    input: zMoondreamBatchedInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/moondream2"),
    input: zMoondream2Input,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/moondream2/object-detection"),
    input: zMoondream2ObjectDetectionInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/moondream2/point-object-detection"),
    input: zMoondream2PointObjectDetectionInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/moondream2/visual-query"),
    input: zMoondream2VisualQueryInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/moondream3-preview/caption"),
    input: zMoondream3PreviewCaptionInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/moondream3-preview/detect"),
    input: zMoondream3PreviewDetectInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/moondream3-preview/point"),
    input: zMoondream3PreviewPointInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/moondream3-preview/query"),
    input: zMoondream3PreviewQueryInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/sa2va/4b/image"),
    input: zSa2Va4bImageInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/sa2va/4b/video"),
    input: zSa2Va4bVideoInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/sa2va/8b/image"),
    input: zSa2Va8bImageInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/sa2va/8b/video"),
    input: zSa2Va8bVideoInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/sam-3/image/embed"),
    input: zSam3ImageEmbedInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/video-understanding"),
    input: zVideoUnderstandingInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/x-ailab/nsfw"),
    input: zXAilabNsfwInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("openrouter/router/vision"),
    input: zRouterVisionInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("perceptron/isaac-01"),
    input: zIsaac01Input,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("perceptron/isaac-01/openai/v1/chat/completions"),
    input: zIsaac01OpenaiV1ChatCompletionsInput,
    output: zQueueStatus,
  }),
]);

/** Inferred type from VisionEndpointSchema */
export type VisionEndpoint = z.infer<typeof VisionEndpointSchema>;
