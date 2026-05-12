// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import type { TrainingEndpointId } from "./endpoint-zod-map.js";
import {
  ErnieImageTrainerInputSchema,
  ErnieImageTrainerOutputSchema,
  Flux2Klein4bBaseTrainerEditInputSchema,
  Flux2Klein4bBaseTrainerEditOutputSchema,
  Flux2Klein4bBaseTrainerInputSchema,
  Flux2Klein4bBaseTrainerOutputSchema,
  Flux2Klein9bBaseTrainerEditInputSchema,
  Flux2Klein9bBaseTrainerEditOutputSchema,
  Flux2Klein9bBaseTrainerInputSchema,
  Flux2Klein9bBaseTrainerOutputSchema,
  Flux2TrainerEditInputSchema,
  Flux2TrainerEditOutputSchema,
  Flux2TrainerInputSchema,
  Flux2TrainerOutputSchema,
  Flux2TrainerV2EditInputSchema,
  Flux2TrainerV2EditOutputSchema,
  Flux2TrainerV2InputSchema,
  Flux2TrainerV2OutputSchema,
  FluxKontextTrainerInputSchema,
  FluxKontextTrainerOutputSchema,
  FluxKreaTrainerInputSchema,
  FluxKreaTrainerOutputSchema,
  FluxLoraFastTrainingInputSchema,
  FluxLoraFastTrainingOutputSchema,
  FluxLoraPortraitTrainerInputSchema,
  FluxLoraPortraitTrainerOutputSchema,
  HunyuanVideoLoraTrainingInputSchema,
  HunyuanVideoLoraTrainingOutputSchema,
  IdeogramCustomModelsInputSchema,
  IdeogramCustomModelsOutputSchema,
  Ltx23V2vTrainerInputSchema,
  Ltx23V2vTrainerOutputSchema,
  Ltx23VideoTrainerInputSchema,
  Ltx23VideoTrainerOutputSchema,
  Ltx2VideoTrainerInputSchema,
  Ltx2VideoTrainerOutputSchema,
  LtxVideoTrainerInputSchema,
  LtxVideoTrainerOutputSchema,
  PhotaCreateProfileInputSchema,
  PhotaCreateProfileOutputSchema,
  QwenImage2512TrainerInputSchema,
  QwenImage2512TrainerOutputSchema,
  QwenImage2512TrainerV2InputSchema,
  QwenImage2512TrainerV2OutputSchema,
  QwenImageEdit2509TrainerInputSchema,
  QwenImageEdit2509TrainerOutputSchema,
  QwenImageEdit2511TrainerInputSchema,
  QwenImageEdit2511TrainerOutputSchema,
  QwenImageEditPlusTrainerInputSchema,
  QwenImageEditPlusTrainerOutputSchema,
  QwenImageEditTrainerInputSchema,
  QwenImageEditTrainerOutputSchema,
  QwenImageLayeredTrainerInputSchema,
  QwenImageLayeredTrainerOutputSchema,
  QwenImageTrainerInputSchema,
  QwenImageTrainerOutputSchema,
  QwenImageTrainerV2InputSchema,
  QwenImageTrainerV2OutputSchema,
  RecraftV3CreateStyleInputSchema,
  RecraftV3CreateStyleOutputSchema,
  TurboFluxTrainerInputSchema,
  TurboFluxTrainerOutputSchema,
  Wan22ImageTrainerInputSchema,
  Wan22ImageTrainerOutputSchema,
  Wan22TrainerI2vA14bInputSchema,
  Wan22TrainerI2vA14bOutputSchema,
  Wan22TrainerT2vA14bInputSchema,
  Wan22TrainerT2vA14bOutputSchema,
  WanTrainerFlf2v720pInputSchema,
  WanTrainerFlf2v720pOutputSchema,
  WanTrainerI2v720pInputSchema,
  WanTrainerI2v720pOutputSchema,
  WanTrainerInputSchema,
  WanTrainerOutputSchema,
  WanTrainerT2v14bInputSchema,
  WanTrainerT2v14bOutputSchema,
  WanTrainerT2vInputSchema,
  WanTrainerT2vOutputSchema,
  ZImageBaseTrainerInputSchema,
  ZImageBaseTrainerOutputSchema,
  ZImageTrainerInputSchema,
  ZImageTrainerOutputSchema,
  ZImageTurboTrainerV2InputSchema,
  ZImageTurboTrainerV2OutputSchema,
} from "./schemas.gen.js";

type JsonSchema = Readonly<Record<string, unknown>>;

/**
 * Map of training endpoint id -> self-contained JSON Schemas.
 * Each input/output schema bundles its $ref closure under `$defs`, so it
 * can be handed directly to LLM tool APIs or `z.fromJSONSchema`.
 */
export const trainingEndpointSchemaMap: Record<
  TrainingEndpointId,
  { readonly input: JsonSchema; readonly output: JsonSchema }
> = {
  "fal-ai/ernie-image-trainer": {
    input: ErnieImageTrainerInputSchema,
    output: ErnieImageTrainerOutputSchema,
  },
  "fal-ai/flux-2-klein-4b-base-trainer": {
    input: Flux2Klein4bBaseTrainerInputSchema,
    output: Flux2Klein4bBaseTrainerOutputSchema,
  },
  "fal-ai/flux-2-klein-4b-base-trainer/edit": {
    input: Flux2Klein4bBaseTrainerEditInputSchema,
    output: Flux2Klein4bBaseTrainerEditOutputSchema,
  },
  "fal-ai/flux-2-klein-9b-base-trainer": {
    input: Flux2Klein9bBaseTrainerInputSchema,
    output: Flux2Klein9bBaseTrainerOutputSchema,
  },
  "fal-ai/flux-2-klein-9b-base-trainer/edit": {
    input: Flux2Klein9bBaseTrainerEditInputSchema,
    output: Flux2Klein9bBaseTrainerEditOutputSchema,
  },
  "fal-ai/flux-2-trainer": {
    input: Flux2TrainerInputSchema,
    output: Flux2TrainerOutputSchema,
  },
  "fal-ai/flux-2-trainer-v2": {
    input: Flux2TrainerV2InputSchema,
    output: Flux2TrainerV2OutputSchema,
  },
  "fal-ai/flux-2-trainer-v2/edit": {
    input: Flux2TrainerV2EditInputSchema,
    output: Flux2TrainerV2EditOutputSchema,
  },
  "fal-ai/flux-2-trainer/edit": {
    input: Flux2TrainerEditInputSchema,
    output: Flux2TrainerEditOutputSchema,
  },
  "fal-ai/flux-kontext-trainer": {
    input: FluxKontextTrainerInputSchema,
    output: FluxKontextTrainerOutputSchema,
  },
  "fal-ai/flux-krea-trainer": {
    input: FluxKreaTrainerInputSchema,
    output: FluxKreaTrainerOutputSchema,
  },
  "fal-ai/flux-lora-fast-training": {
    input: FluxLoraFastTrainingInputSchema,
    output: FluxLoraFastTrainingOutputSchema,
  },
  "fal-ai/flux-lora-portrait-trainer": {
    input: FluxLoraPortraitTrainerInputSchema,
    output: FluxLoraPortraitTrainerOutputSchema,
  },
  "fal-ai/hunyuan-video-lora-training": {
    input: HunyuanVideoLoraTrainingInputSchema,
    output: HunyuanVideoLoraTrainingOutputSchema,
  },
  "fal-ai/ideogram/custom-models": {
    input: IdeogramCustomModelsInputSchema,
    output: IdeogramCustomModelsOutputSchema,
  },
  "fal-ai/ltx-video-trainer": {
    input: LtxVideoTrainerInputSchema,
    output: LtxVideoTrainerOutputSchema,
  },
  "fal-ai/ltx2-video-trainer": {
    input: Ltx2VideoTrainerInputSchema,
    output: Ltx2VideoTrainerOutputSchema,
  },
  "fal-ai/ltx23-v2v-trainer": {
    input: Ltx23V2vTrainerInputSchema,
    output: Ltx23V2vTrainerOutputSchema,
  },
  "fal-ai/ltx23-video-trainer": {
    input: Ltx23VideoTrainerInputSchema,
    output: Ltx23VideoTrainerOutputSchema,
  },
  "fal-ai/phota/create-profile": {
    input: PhotaCreateProfileInputSchema,
    output: PhotaCreateProfileOutputSchema,
  },
  "fal-ai/qwen-image-2512-trainer": {
    input: QwenImage2512TrainerInputSchema,
    output: QwenImage2512TrainerOutputSchema,
  },
  "fal-ai/qwen-image-2512-trainer-v2": {
    input: QwenImage2512TrainerV2InputSchema,
    output: QwenImage2512TrainerV2OutputSchema,
  },
  "fal-ai/qwen-image-edit-2509-trainer": {
    input: QwenImageEdit2509TrainerInputSchema,
    output: QwenImageEdit2509TrainerOutputSchema,
  },
  "fal-ai/qwen-image-edit-2511-trainer": {
    input: QwenImageEdit2511TrainerInputSchema,
    output: QwenImageEdit2511TrainerOutputSchema,
  },
  "fal-ai/qwen-image-edit-plus-trainer": {
    input: QwenImageEditPlusTrainerInputSchema,
    output: QwenImageEditPlusTrainerOutputSchema,
  },
  "fal-ai/qwen-image-edit-trainer": {
    input: QwenImageEditTrainerInputSchema,
    output: QwenImageEditTrainerOutputSchema,
  },
  "fal-ai/qwen-image-layered-trainer": {
    input: QwenImageLayeredTrainerInputSchema,
    output: QwenImageLayeredTrainerOutputSchema,
  },
  "fal-ai/qwen-image-trainer": {
    input: QwenImageTrainerInputSchema,
    output: QwenImageTrainerOutputSchema,
  },
  "fal-ai/qwen-image-trainer-v2": {
    input: QwenImageTrainerV2InputSchema,
    output: QwenImageTrainerV2OutputSchema,
  },
  "fal-ai/recraft/v3/create-style": {
    input: RecraftV3CreateStyleInputSchema,
    output: RecraftV3CreateStyleOutputSchema,
  },
  "fal-ai/turbo-flux-trainer": {
    input: TurboFluxTrainerInputSchema,
    output: TurboFluxTrainerOutputSchema,
  },
  "fal-ai/wan-22-image-trainer": {
    input: Wan22ImageTrainerInputSchema,
    output: Wan22ImageTrainerOutputSchema,
  },
  "fal-ai/wan-22-trainer/i2v-a14b": {
    input: Wan22TrainerI2vA14bInputSchema,
    output: Wan22TrainerI2vA14bOutputSchema,
  },
  "fal-ai/wan-22-trainer/t2v-a14b": {
    input: Wan22TrainerT2vA14bInputSchema,
    output: Wan22TrainerT2vA14bOutputSchema,
  },
  "fal-ai/wan-trainer": {
    input: WanTrainerInputSchema,
    output: WanTrainerOutputSchema,
  },
  "fal-ai/wan-trainer/flf2v-720p": {
    input: WanTrainerFlf2v720pInputSchema,
    output: WanTrainerFlf2v720pOutputSchema,
  },
  "fal-ai/wan-trainer/i2v-720p": {
    input: WanTrainerI2v720pInputSchema,
    output: WanTrainerI2v720pOutputSchema,
  },
  "fal-ai/wan-trainer/t2v": {
    input: WanTrainerT2vInputSchema,
    output: WanTrainerT2vOutputSchema,
  },
  "fal-ai/wan-trainer/t2v-14b": {
    input: WanTrainerT2v14bInputSchema,
    output: WanTrainerT2v14bOutputSchema,
  },
  "fal-ai/z-image-base-trainer": {
    input: ZImageBaseTrainerInputSchema,
    output: ZImageBaseTrainerOutputSchema,
  },
  "fal-ai/z-image-trainer": {
    input: ZImageTrainerInputSchema,
    output: ZImageTrainerOutputSchema,
  },
  "fal-ai/z-image-turbo-trainer-v2": {
    input: ZImageTurboTrainerV2InputSchema,
    output: ZImageTurboTrainerV2OutputSchema,
  },
};
