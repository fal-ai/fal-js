// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import { z } from "zod";

import {
  zErnieImageTrainerInput,
  zFlux2Klein4bBaseTrainerEditInput,
  zFlux2Klein4bBaseTrainerInput,
  zFlux2Klein9bBaseTrainerEditInput,
  zFlux2Klein9bBaseTrainerInput,
  zFlux2TrainerEditInput,
  zFlux2TrainerInput,
  zFlux2TrainerV2EditInput,
  zFlux2TrainerV2Input,
  zFluxKontextTrainerInput,
  zFluxKreaTrainerInput,
  zFluxLoraFastTrainingInput,
  zFluxLoraPortraitTrainerInput,
  zHunyuanVideoLoraTrainingInput,
  zIdeogramCustomModelsInput,
  zLtx23V2vTrainerInput,
  zLtx23VideoTrainerInput,
  zLtx2VideoTrainerInput,
  zLtxVideoTrainerInput,
  zPhotaCreateProfileInput,
  zQueueStatus,
  zQwenImage2512TrainerInput,
  zQwenImage2512TrainerV2Input,
  zQwenImageEdit2509TrainerInput,
  zQwenImageEdit2511TrainerInput,
  zQwenImageEditPlusTrainerInput,
  zQwenImageEditTrainerInput,
  zQwenImageLayeredTrainerInput,
  zQwenImageTrainerInput,
  zQwenImageTrainerV2Input,
  zRecraftV3CreateStyleInput,
  zTurboFluxTrainerInput,
  zWan22ImageTrainerInput,
  zWan22TrainerI2vA14bInput,
  zWan22TrainerT2vA14bInput,
  zWanTrainerFlf2V720pInput,
  zWanTrainerI2V720pInput,
  zWanTrainerInput,
  zWanTrainerT2V14bInput,
  zWanTrainerT2vInput,
  zZImageBaseTrainerInput,
  zZImageTrainerInput,
  zZImageTurboTrainerV2Input,
} from "./zod.gen";

/** Zod schema for training endpoints using discriminatedUnion */
export const TrainingEndpointSchema = z.discriminatedUnion("endpoint", [
  z.object({
    endpoint: z.literal("fal-ai/ernie-image-trainer"),
    input: zErnieImageTrainerInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/flux-2-klein-4b-base-trainer"),
    input: zFlux2Klein4bBaseTrainerInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/flux-2-klein-4b-base-trainer/edit"),
    input: zFlux2Klein4bBaseTrainerEditInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/flux-2-klein-9b-base-trainer"),
    input: zFlux2Klein9bBaseTrainerInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/flux-2-klein-9b-base-trainer/edit"),
    input: zFlux2Klein9bBaseTrainerEditInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/flux-2-trainer"),
    input: zFlux2TrainerInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/flux-2-trainer-v2"),
    input: zFlux2TrainerV2Input,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/flux-2-trainer-v2/edit"),
    input: zFlux2TrainerV2EditInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/flux-2-trainer/edit"),
    input: zFlux2TrainerEditInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/flux-kontext-trainer"),
    input: zFluxKontextTrainerInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/flux-krea-trainer"),
    input: zFluxKreaTrainerInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/flux-lora-fast-training"),
    input: zFluxLoraFastTrainingInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/flux-lora-portrait-trainer"),
    input: zFluxLoraPortraitTrainerInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/hunyuan-video-lora-training"),
    input: zHunyuanVideoLoraTrainingInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/ideogram/custom-models"),
    input: zIdeogramCustomModelsInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/ltx-video-trainer"),
    input: zLtxVideoTrainerInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/ltx2-video-trainer"),
    input: zLtx2VideoTrainerInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/ltx23-v2v-trainer"),
    input: zLtx23V2vTrainerInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/ltx23-video-trainer"),
    input: zLtx23VideoTrainerInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/phota/create-profile"),
    input: zPhotaCreateProfileInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/qwen-image-2512-trainer"),
    input: zQwenImage2512TrainerInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/qwen-image-2512-trainer-v2"),
    input: zQwenImage2512TrainerV2Input,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/qwen-image-edit-2509-trainer"),
    input: zQwenImageEdit2509TrainerInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/qwen-image-edit-2511-trainer"),
    input: zQwenImageEdit2511TrainerInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/qwen-image-edit-plus-trainer"),
    input: zQwenImageEditPlusTrainerInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/qwen-image-edit-trainer"),
    input: zQwenImageEditTrainerInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/qwen-image-layered-trainer"),
    input: zQwenImageLayeredTrainerInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/qwen-image-trainer"),
    input: zQwenImageTrainerInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/qwen-image-trainer-v2"),
    input: zQwenImageTrainerV2Input,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/recraft/v3/create-style"),
    input: zRecraftV3CreateStyleInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/turbo-flux-trainer"),
    input: zTurboFluxTrainerInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/wan-22-image-trainer"),
    input: zWan22ImageTrainerInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/wan-22-trainer/i2v-a14b"),
    input: zWan22TrainerI2vA14bInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/wan-22-trainer/t2v-a14b"),
    input: zWan22TrainerT2vA14bInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/wan-trainer"),
    input: zWanTrainerInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/wan-trainer/flf2v-720p"),
    input: zWanTrainerFlf2V720pInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/wan-trainer/i2v-720p"),
    input: zWanTrainerI2V720pInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/wan-trainer/t2v"),
    input: zWanTrainerT2vInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/wan-trainer/t2v-14b"),
    input: zWanTrainerT2V14bInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/z-image-base-trainer"),
    input: zZImageBaseTrainerInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/z-image-trainer"),
    input: zZImageTrainerInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/z-image-turbo-trainer-v2"),
    input: zZImageTurboTrainerV2Input,
    output: zQueueStatus,
  }),
]);

/** Inferred type from TrainingEndpointSchema */
export type TrainingEndpoint = z.infer<typeof TrainingEndpointSchema>;
