// AUTO-GENERATED - Do not edit manually
// Generated from types.gen.ts via scripts/generate-endpoint-maps.ts

import type {
  Flux2Klein4bBaseTrainerEditInput,
  Flux2Klein4bBaseTrainerEditOutput,
  Flux2Klein4bBaseTrainerInput,
  Flux2Klein4bBaseTrainerOutput,
  Flux2Klein9bBaseTrainerEditInput,
  Flux2Klein9bBaseTrainerEditOutput,
  Flux2Klein9bBaseTrainerInput,
  Flux2Klein9bBaseTrainerOutput,
  Flux2TrainerEditInput,
  Flux2TrainerEditOutput,
  Flux2TrainerInput,
  Flux2TrainerOutput,
  Flux2TrainerV2EditInput,
  Flux2TrainerV2EditOutput,
  Flux2TrainerV2Input,
  Flux2TrainerV2Output,
  FluxKontextTrainerInput,
  FluxKontextTrainerOutput,
  FluxKreaTrainerInput,
  FluxKreaTrainerOutput,
  FluxLoraFastTrainingInput,
  FluxLoraFastTrainingOutput,
  FluxLoraPortraitTrainerInput,
  FluxLoraPortraitTrainerOutput,
  HunyuanVideoLoraTrainingInput,
  HunyuanVideoLoraTrainingOutput,
  Ltx2V2vTrainerInput,
  Ltx2V2vTrainerOutput,
  Ltx2VideoTrainerInput,
  Ltx2VideoTrainerOutput,
  LtxVideoTrainerInput,
  LtxVideoTrainerOutput,
  QwenImage2512TrainerInput,
  QwenImage2512TrainerOutput,
  QwenImage2512TrainerV2Input,
  QwenImage2512TrainerV2Output,
  QwenImageEdit2509TrainerInput,
  QwenImageEdit2509TrainerOutput,
  QwenImageEdit2511TrainerInput,
  QwenImageEdit2511TrainerOutput,
  QwenImageEditPlusTrainerInput,
  QwenImageEditPlusTrainerOutput,
  QwenImageEditTrainerInput,
  QwenImageEditTrainerOutput,
  QwenImageLayeredTrainerInput,
  QwenImageLayeredTrainerOutput,
  QwenImageTrainerInput,
  QwenImageTrainerOutput,
  RecraftV3CreateStyleInput,
  RecraftV3CreateStyleOutput,
  TurboFluxTrainerInput,
  TurboFluxTrainerOutput,
  Wan22ImageTrainerInput,
  Wan22ImageTrainerOutput,
  WanTrainerFlf2V720pInput,
  WanTrainerFlf2V720pOutput,
  WanTrainerI2V720pInput,
  WanTrainerI2V720pOutput,
  WanTrainerInput,
  WanTrainerOutput,
  WanTrainerT2V14bInput,
  WanTrainerT2V14bOutput,
  WanTrainerT2vInput,
  WanTrainerT2vOutput,
  ZImageBaseTrainerInput,
  ZImageBaseTrainerOutput,
  ZImageTrainerInput,
  ZImageTrainerOutput,
  ZImageTurboTrainerV2Input,
  ZImageTurboTrainerV2Output,
} from "./types.gen";

export type TrainingEndpointMap = {
  "fal-ai/flux-krea-trainer": {
    input: FluxKreaTrainerInput;
    output: FluxKreaTrainerOutput;
  };
  "fal-ai/flux-kontext-trainer": {
    input: FluxKontextTrainerInput;
    output: FluxKontextTrainerOutput;
  };
  "fal-ai/flux-lora-fast-training": {
    input: FluxLoraFastTrainingInput;
    output: FluxLoraFastTrainingOutput;
  };
  "fal-ai/flux-lora-portrait-trainer": {
    input: FluxLoraPortraitTrainerInput;
    output: FluxLoraPortraitTrainerOutput;
  };
  "fal-ai/z-image-base-trainer": {
    input: ZImageBaseTrainerInput;
    output: ZImageBaseTrainerOutput;
  };
  "fal-ai/z-image-turbo-trainer-v2": {
    input: ZImageTurboTrainerV2Input;
    output: ZImageTurboTrainerV2Output;
  };
  "fal-ai/flux-2-klein-9b-base-trainer/edit": {
    input: Flux2Klein9bBaseTrainerEditInput;
    output: Flux2Klein9bBaseTrainerEditOutput;
  };
  "fal-ai/flux-2-klein-9b-base-trainer": {
    input: Flux2Klein9bBaseTrainerInput;
    output: Flux2Klein9bBaseTrainerOutput;
  };
  "fal-ai/flux-2-klein-4b-base-trainer": {
    input: Flux2Klein4bBaseTrainerInput;
    output: Flux2Klein4bBaseTrainerOutput;
  };
  "fal-ai/flux-2-klein-4b-base-trainer/edit": {
    input: Flux2Klein4bBaseTrainerEditInput;
    output: Flux2Klein4bBaseTrainerEditOutput;
  };
  "fal-ai/qwen-image-2512-trainer-v2": {
    input: QwenImage2512TrainerV2Input;
    output: QwenImage2512TrainerV2Output;
  };
  "fal-ai/flux-2-trainer-v2/edit": {
    input: Flux2TrainerV2EditInput;
    output: Flux2TrainerV2EditOutput;
  };
  "fal-ai/flux-2-trainer-v2": {
    input: Flux2TrainerV2Input;
    output: Flux2TrainerV2Output;
  };
  "fal-ai/ltx2-v2v-trainer": {
    input: Ltx2V2vTrainerInput;
    output: Ltx2V2vTrainerOutput;
  };
  "fal-ai/ltx2-video-trainer": {
    input: Ltx2VideoTrainerInput;
    output: Ltx2VideoTrainerOutput;
  };
  "fal-ai/qwen-image-2512-trainer": {
    input: QwenImage2512TrainerInput;
    output: QwenImage2512TrainerOutput;
  };
  "fal-ai/qwen-image-edit-2511-trainer": {
    input: QwenImageEdit2511TrainerInput;
    output: QwenImageEdit2511TrainerOutput;
  };
  "fal-ai/qwen-image-layered-trainer": {
    input: QwenImageLayeredTrainerInput;
    output: QwenImageLayeredTrainerOutput;
  };
  "fal-ai/qwen-image-edit-2509-trainer": {
    input: QwenImageEdit2509TrainerInput;
    output: QwenImageEdit2509TrainerOutput;
  };
  "fal-ai/z-image-trainer": {
    input: ZImageTrainerInput;
    output: ZImageTrainerOutput;
  };
  "fal-ai/flux-2-trainer/edit": {
    input: Flux2TrainerEditInput;
    output: Flux2TrainerEditOutput;
  };
  "fal-ai/flux-2-trainer": {
    input: Flux2TrainerInput;
    output: Flux2TrainerOutput;
  };
  "fal-ai/qwen-image-edit-plus-trainer": {
    input: QwenImageEditPlusTrainerInput;
    output: QwenImageEditPlusTrainerOutput;
  };
  "fal-ai/qwen-image-edit-trainer": {
    input: QwenImageEditTrainerInput;
    output: QwenImageEditTrainerOutput;
  };
  "fal-ai/qwen-image-trainer": {
    input: QwenImageTrainerInput;
    output: QwenImageTrainerOutput;
  };
  "fal-ai/wan-22-image-trainer": {
    input: Wan22ImageTrainerInput;
    output: Wan22ImageTrainerOutput;
  };
  "fal-ai/wan-trainer/t2v": {
    input: WanTrainerT2vInput;
    output: WanTrainerT2vOutput;
  };
  "fal-ai/wan-trainer/t2v-14b": {
    input: WanTrainerT2V14bInput;
    output: WanTrainerT2V14bOutput;
  };
  "fal-ai/wan-trainer/i2v-720p": {
    input: WanTrainerI2V720pInput;
    output: WanTrainerI2V720pOutput;
  };
  "fal-ai/wan-trainer/flf2v-720p": {
    input: WanTrainerFlf2V720pInput;
    output: WanTrainerFlf2V720pOutput;
  };
  "fal-ai/ltx-video-trainer": {
    input: LtxVideoTrainerInput;
    output: LtxVideoTrainerOutput;
  };
  "fal-ai/recraft/v3/create-style": {
    input: RecraftV3CreateStyleInput;
    output: RecraftV3CreateStyleOutput;
  };
  "fal-ai/turbo-flux-trainer": {
    input: TurboFluxTrainerInput;
    output: TurboFluxTrainerOutput;
  };
  "fal-ai/wan-trainer": {
    input: WanTrainerInput;
    output: WanTrainerOutput;
  };
  "fal-ai/hunyuan-video-lora-training": {
    input: HunyuanVideoLoraTrainingInput;
    output: HunyuanVideoLoraTrainingOutput;
  };
};

/** Union type of all training model endpoint IDs */
export type TrainingModel = keyof TrainingEndpointMap;

/** Get the input type for a specific training model */
export type TrainingModelInput<T extends TrainingModel> =
  TrainingEndpointMap[T]["input"];

/** Get the output type for a specific training model */
export type TrainingModelOutput<T extends TrainingModel> =
  TrainingEndpointMap[T]["output"];
