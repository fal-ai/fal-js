// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

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

/**
 * Map of training endpoint id -> self-contained JSON Schemas.
 * Each input/output schema bundles its $ref closure under `$defs`, so it
 * can be handed directly to LLM tool APIs or `z.fromJSONSchema`.
 */
export const trainingEndpointSchemaMap: {
  readonly "fal-ai/ernie-image-trainer": {
    readonly input: typeof ErnieImageTrainerInputSchema;
    readonly output: typeof ErnieImageTrainerOutputSchema;
  };
  readonly "fal-ai/flux-2-klein-4b-base-trainer": {
    readonly input: typeof Flux2Klein4bBaseTrainerInputSchema;
    readonly output: typeof Flux2Klein4bBaseTrainerOutputSchema;
  };
  readonly "fal-ai/flux-2-klein-4b-base-trainer/edit": {
    readonly input: typeof Flux2Klein4bBaseTrainerEditInputSchema;
    readonly output: typeof Flux2Klein4bBaseTrainerEditOutputSchema;
  };
  readonly "fal-ai/flux-2-klein-9b-base-trainer": {
    readonly input: typeof Flux2Klein9bBaseTrainerInputSchema;
    readonly output: typeof Flux2Klein9bBaseTrainerOutputSchema;
  };
  readonly "fal-ai/flux-2-klein-9b-base-trainer/edit": {
    readonly input: typeof Flux2Klein9bBaseTrainerEditInputSchema;
    readonly output: typeof Flux2Klein9bBaseTrainerEditOutputSchema;
  };
  readonly "fal-ai/flux-2-trainer": {
    readonly input: typeof Flux2TrainerInputSchema;
    readonly output: typeof Flux2TrainerOutputSchema;
  };
  readonly "fal-ai/flux-2-trainer-v2": {
    readonly input: typeof Flux2TrainerV2InputSchema;
    readonly output: typeof Flux2TrainerV2OutputSchema;
  };
  readonly "fal-ai/flux-2-trainer-v2/edit": {
    readonly input: typeof Flux2TrainerV2EditInputSchema;
    readonly output: typeof Flux2TrainerV2EditOutputSchema;
  };
  readonly "fal-ai/flux-2-trainer/edit": {
    readonly input: typeof Flux2TrainerEditInputSchema;
    readonly output: typeof Flux2TrainerEditOutputSchema;
  };
  readonly "fal-ai/flux-kontext-trainer": {
    readonly input: typeof FluxKontextTrainerInputSchema;
    readonly output: typeof FluxKontextTrainerOutputSchema;
  };
  readonly "fal-ai/flux-krea-trainer": {
    readonly input: typeof FluxKreaTrainerInputSchema;
    readonly output: typeof FluxKreaTrainerOutputSchema;
  };
  readonly "fal-ai/flux-lora-fast-training": {
    readonly input: typeof FluxLoraFastTrainingInputSchema;
    readonly output: typeof FluxLoraFastTrainingOutputSchema;
  };
  readonly "fal-ai/flux-lora-portrait-trainer": {
    readonly input: typeof FluxLoraPortraitTrainerInputSchema;
    readonly output: typeof FluxLoraPortraitTrainerOutputSchema;
  };
  readonly "fal-ai/hunyuan-video-lora-training": {
    readonly input: typeof HunyuanVideoLoraTrainingInputSchema;
    readonly output: typeof HunyuanVideoLoraTrainingOutputSchema;
  };
  readonly "fal-ai/ideogram/custom-models": {
    readonly input: typeof IdeogramCustomModelsInputSchema;
    readonly output: typeof IdeogramCustomModelsOutputSchema;
  };
  readonly "fal-ai/ltx-video-trainer": {
    readonly input: typeof LtxVideoTrainerInputSchema;
    readonly output: typeof LtxVideoTrainerOutputSchema;
  };
  readonly "fal-ai/ltx2-video-trainer": {
    readonly input: typeof Ltx2VideoTrainerInputSchema;
    readonly output: typeof Ltx2VideoTrainerOutputSchema;
  };
  readonly "fal-ai/ltx23-v2v-trainer": {
    readonly input: typeof Ltx23V2vTrainerInputSchema;
    readonly output: typeof Ltx23V2vTrainerOutputSchema;
  };
  readonly "fal-ai/ltx23-video-trainer": {
    readonly input: typeof Ltx23VideoTrainerInputSchema;
    readonly output: typeof Ltx23VideoTrainerOutputSchema;
  };
  readonly "fal-ai/phota/create-profile": {
    readonly input: typeof PhotaCreateProfileInputSchema;
    readonly output: typeof PhotaCreateProfileOutputSchema;
  };
  readonly "fal-ai/qwen-image-2512-trainer": {
    readonly input: typeof QwenImage2512TrainerInputSchema;
    readonly output: typeof QwenImage2512TrainerOutputSchema;
  };
  readonly "fal-ai/qwen-image-2512-trainer-v2": {
    readonly input: typeof QwenImage2512TrainerV2InputSchema;
    readonly output: typeof QwenImage2512TrainerV2OutputSchema;
  };
  readonly "fal-ai/qwen-image-edit-2509-trainer": {
    readonly input: typeof QwenImageEdit2509TrainerInputSchema;
    readonly output: typeof QwenImageEdit2509TrainerOutputSchema;
  };
  readonly "fal-ai/qwen-image-edit-2511-trainer": {
    readonly input: typeof QwenImageEdit2511TrainerInputSchema;
    readonly output: typeof QwenImageEdit2511TrainerOutputSchema;
  };
  readonly "fal-ai/qwen-image-edit-plus-trainer": {
    readonly input: typeof QwenImageEditPlusTrainerInputSchema;
    readonly output: typeof QwenImageEditPlusTrainerOutputSchema;
  };
  readonly "fal-ai/qwen-image-edit-trainer": {
    readonly input: typeof QwenImageEditTrainerInputSchema;
    readonly output: typeof QwenImageEditTrainerOutputSchema;
  };
  readonly "fal-ai/qwen-image-layered-trainer": {
    readonly input: typeof QwenImageLayeredTrainerInputSchema;
    readonly output: typeof QwenImageLayeredTrainerOutputSchema;
  };
  readonly "fal-ai/qwen-image-trainer": {
    readonly input: typeof QwenImageTrainerInputSchema;
    readonly output: typeof QwenImageTrainerOutputSchema;
  };
  readonly "fal-ai/qwen-image-trainer-v2": {
    readonly input: typeof QwenImageTrainerV2InputSchema;
    readonly output: typeof QwenImageTrainerV2OutputSchema;
  };
  readonly "fal-ai/recraft/v3/create-style": {
    readonly input: typeof RecraftV3CreateStyleInputSchema;
    readonly output: typeof RecraftV3CreateStyleOutputSchema;
  };
  readonly "fal-ai/turbo-flux-trainer": {
    readonly input: typeof TurboFluxTrainerInputSchema;
    readonly output: typeof TurboFluxTrainerOutputSchema;
  };
  readonly "fal-ai/wan-22-image-trainer": {
    readonly input: typeof Wan22ImageTrainerInputSchema;
    readonly output: typeof Wan22ImageTrainerOutputSchema;
  };
  readonly "fal-ai/wan-22-trainer/i2v-a14b": {
    readonly input: typeof Wan22TrainerI2vA14bInputSchema;
    readonly output: typeof Wan22TrainerI2vA14bOutputSchema;
  };
  readonly "fal-ai/wan-22-trainer/t2v-a14b": {
    readonly input: typeof Wan22TrainerT2vA14bInputSchema;
    readonly output: typeof Wan22TrainerT2vA14bOutputSchema;
  };
  readonly "fal-ai/wan-trainer": {
    readonly input: typeof WanTrainerInputSchema;
    readonly output: typeof WanTrainerOutputSchema;
  };
  readonly "fal-ai/wan-trainer/flf2v-720p": {
    readonly input: typeof WanTrainerFlf2v720pInputSchema;
    readonly output: typeof WanTrainerFlf2v720pOutputSchema;
  };
  readonly "fal-ai/wan-trainer/i2v-720p": {
    readonly input: typeof WanTrainerI2v720pInputSchema;
    readonly output: typeof WanTrainerI2v720pOutputSchema;
  };
  readonly "fal-ai/wan-trainer/t2v": {
    readonly input: typeof WanTrainerT2vInputSchema;
    readonly output: typeof WanTrainerT2vOutputSchema;
  };
  readonly "fal-ai/wan-trainer/t2v-14b": {
    readonly input: typeof WanTrainerT2v14bInputSchema;
    readonly output: typeof WanTrainerT2v14bOutputSchema;
  };
  readonly "fal-ai/z-image-base-trainer": {
    readonly input: typeof ZImageBaseTrainerInputSchema;
    readonly output: typeof ZImageBaseTrainerOutputSchema;
  };
  readonly "fal-ai/z-image-trainer": {
    readonly input: typeof ZImageTrainerInputSchema;
    readonly output: typeof ZImageTrainerOutputSchema;
  };
  readonly "fal-ai/z-image-turbo-trainer-v2": {
    readonly input: typeof ZImageTurboTrainerV2InputSchema;
    readonly output: typeof ZImageTurboTrainerV2OutputSchema;
  };
} = {
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
