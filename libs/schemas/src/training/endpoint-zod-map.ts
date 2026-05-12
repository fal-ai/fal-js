// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import {
  zErnieImageTrainerInput,
  zErnieImageTrainerOutput,
  zFlux2Klein4bBaseTrainerEditInput,
  zFlux2Klein4bBaseTrainerEditOutput,
  zFlux2Klein4bBaseTrainerInput,
  zFlux2Klein4bBaseTrainerOutput,
  zFlux2Klein9bBaseTrainerEditInput,
  zFlux2Klein9bBaseTrainerEditOutput,
  zFlux2Klein9bBaseTrainerInput,
  zFlux2Klein9bBaseTrainerOutput,
  zFlux2TrainerEditInput,
  zFlux2TrainerEditOutput,
  zFlux2TrainerInput,
  zFlux2TrainerOutput,
  zFlux2TrainerV2EditInput,
  zFlux2TrainerV2EditOutput,
  zFlux2TrainerV2Input,
  zFlux2TrainerV2Output,
  zFluxKontextTrainerInput,
  zFluxKontextTrainerOutput,
  zFluxKreaTrainerInput,
  zFluxKreaTrainerOutput,
  zFluxLoraFastTrainingInput,
  zFluxLoraFastTrainingOutput,
  zFluxLoraPortraitTrainerInput,
  zFluxLoraPortraitTrainerOutput,
  zHunyuanVideoLoraTrainingInput,
  zHunyuanVideoLoraTrainingOutput,
  zIdeogramCustomModelsInput,
  zIdeogramCustomModelsOutput,
  zLtx23V2vTrainerInput,
  zLtx23V2vTrainerOutput,
  zLtx23VideoTrainerInput,
  zLtx23VideoTrainerOutput,
  zLtx2VideoTrainerInput,
  zLtx2VideoTrainerOutput,
  zLtxVideoTrainerInput,
  zLtxVideoTrainerOutput,
  zPhotaCreateProfileInput,
  zPhotaCreateProfileOutput,
  zQwenImage2512TrainerInput,
  zQwenImage2512TrainerOutput,
  zQwenImage2512TrainerV2Input,
  zQwenImage2512TrainerV2Output,
  zQwenImageEdit2509TrainerInput,
  zQwenImageEdit2509TrainerOutput,
  zQwenImageEdit2511TrainerInput,
  zQwenImageEdit2511TrainerOutput,
  zQwenImageEditPlusTrainerInput,
  zQwenImageEditPlusTrainerOutput,
  zQwenImageEditTrainerInput,
  zQwenImageEditTrainerOutput,
  zQwenImageLayeredTrainerInput,
  zQwenImageLayeredTrainerOutput,
  zQwenImageTrainerInput,
  zQwenImageTrainerOutput,
  zQwenImageTrainerV2Input,
  zQwenImageTrainerV2Output,
  zRecraftV3CreateStyleInput,
  zRecraftV3CreateStyleOutput,
  zTurboFluxTrainerInput,
  zTurboFluxTrainerOutput,
  zWan22ImageTrainerInput,
  zWan22ImageTrainerOutput,
  zWan22TrainerI2vA14bInput,
  zWan22TrainerI2vA14bOutput,
  zWan22TrainerT2vA14bInput,
  zWan22TrainerT2vA14bOutput,
  zWanTrainerFlf2V720pInput,
  zWanTrainerFlf2V720pOutput,
  zWanTrainerI2V720pInput,
  zWanTrainerI2V720pOutput,
  zWanTrainerInput,
  zWanTrainerOutput,
  zWanTrainerT2V14bInput,
  zWanTrainerT2V14bOutput,
  zWanTrainerT2vInput,
  zWanTrainerT2vOutput,
  zZImageBaseTrainerInput,
  zZImageBaseTrainerOutput,
  zZImageTrainerInput,
  zZImageTrainerOutput,
  zZImageTurboTrainerV2Input,
  zZImageTurboTrainerV2Output,
} from "./zod.gen.js";

/** Map of training endpoint id -> Zod input/output schemas. */
export const trainingEndpointZodMap: {
  readonly "fal-ai/ernie-image-trainer": {
    readonly input: typeof zErnieImageTrainerInput;
    readonly output: typeof zErnieImageTrainerOutput;
  };
  readonly "fal-ai/flux-2-klein-4b-base-trainer": {
    readonly input: typeof zFlux2Klein4bBaseTrainerInput;
    readonly output: typeof zFlux2Klein4bBaseTrainerOutput;
  };
  readonly "fal-ai/flux-2-klein-4b-base-trainer/edit": {
    readonly input: typeof zFlux2Klein4bBaseTrainerEditInput;
    readonly output: typeof zFlux2Klein4bBaseTrainerEditOutput;
  };
  readonly "fal-ai/flux-2-klein-9b-base-trainer": {
    readonly input: typeof zFlux2Klein9bBaseTrainerInput;
    readonly output: typeof zFlux2Klein9bBaseTrainerOutput;
  };
  readonly "fal-ai/flux-2-klein-9b-base-trainer/edit": {
    readonly input: typeof zFlux2Klein9bBaseTrainerEditInput;
    readonly output: typeof zFlux2Klein9bBaseTrainerEditOutput;
  };
  readonly "fal-ai/flux-2-trainer": {
    readonly input: typeof zFlux2TrainerInput;
    readonly output: typeof zFlux2TrainerOutput;
  };
  readonly "fal-ai/flux-2-trainer-v2": {
    readonly input: typeof zFlux2TrainerV2Input;
    readonly output: typeof zFlux2TrainerV2Output;
  };
  readonly "fal-ai/flux-2-trainer-v2/edit": {
    readonly input: typeof zFlux2TrainerV2EditInput;
    readonly output: typeof zFlux2TrainerV2EditOutput;
  };
  readonly "fal-ai/flux-2-trainer/edit": {
    readonly input: typeof zFlux2TrainerEditInput;
    readonly output: typeof zFlux2TrainerEditOutput;
  };
  readonly "fal-ai/flux-kontext-trainer": {
    readonly input: typeof zFluxKontextTrainerInput;
    readonly output: typeof zFluxKontextTrainerOutput;
  };
  readonly "fal-ai/flux-krea-trainer": {
    readonly input: typeof zFluxKreaTrainerInput;
    readonly output: typeof zFluxKreaTrainerOutput;
  };
  readonly "fal-ai/flux-lora-fast-training": {
    readonly input: typeof zFluxLoraFastTrainingInput;
    readonly output: typeof zFluxLoraFastTrainingOutput;
  };
  readonly "fal-ai/flux-lora-portrait-trainer": {
    readonly input: typeof zFluxLoraPortraitTrainerInput;
    readonly output: typeof zFluxLoraPortraitTrainerOutput;
  };
  readonly "fal-ai/hunyuan-video-lora-training": {
    readonly input: typeof zHunyuanVideoLoraTrainingInput;
    readonly output: typeof zHunyuanVideoLoraTrainingOutput;
  };
  readonly "fal-ai/ideogram/custom-models": {
    readonly input: typeof zIdeogramCustomModelsInput;
    readonly output: typeof zIdeogramCustomModelsOutput;
  };
  readonly "fal-ai/ltx-video-trainer": {
    readonly input: typeof zLtxVideoTrainerInput;
    readonly output: typeof zLtxVideoTrainerOutput;
  };
  readonly "fal-ai/ltx2-video-trainer": {
    readonly input: typeof zLtx2VideoTrainerInput;
    readonly output: typeof zLtx2VideoTrainerOutput;
  };
  readonly "fal-ai/ltx23-v2v-trainer": {
    readonly input: typeof zLtx23V2vTrainerInput;
    readonly output: typeof zLtx23V2vTrainerOutput;
  };
  readonly "fal-ai/ltx23-video-trainer": {
    readonly input: typeof zLtx23VideoTrainerInput;
    readonly output: typeof zLtx23VideoTrainerOutput;
  };
  readonly "fal-ai/phota/create-profile": {
    readonly input: typeof zPhotaCreateProfileInput;
    readonly output: typeof zPhotaCreateProfileOutput;
  };
  readonly "fal-ai/qwen-image-2512-trainer": {
    readonly input: typeof zQwenImage2512TrainerInput;
    readonly output: typeof zQwenImage2512TrainerOutput;
  };
  readonly "fal-ai/qwen-image-2512-trainer-v2": {
    readonly input: typeof zQwenImage2512TrainerV2Input;
    readonly output: typeof zQwenImage2512TrainerV2Output;
  };
  readonly "fal-ai/qwen-image-edit-2509-trainer": {
    readonly input: typeof zQwenImageEdit2509TrainerInput;
    readonly output: typeof zQwenImageEdit2509TrainerOutput;
  };
  readonly "fal-ai/qwen-image-edit-2511-trainer": {
    readonly input: typeof zQwenImageEdit2511TrainerInput;
    readonly output: typeof zQwenImageEdit2511TrainerOutput;
  };
  readonly "fal-ai/qwen-image-edit-plus-trainer": {
    readonly input: typeof zQwenImageEditPlusTrainerInput;
    readonly output: typeof zQwenImageEditPlusTrainerOutput;
  };
  readonly "fal-ai/qwen-image-edit-trainer": {
    readonly input: typeof zQwenImageEditTrainerInput;
    readonly output: typeof zQwenImageEditTrainerOutput;
  };
  readonly "fal-ai/qwen-image-layered-trainer": {
    readonly input: typeof zQwenImageLayeredTrainerInput;
    readonly output: typeof zQwenImageLayeredTrainerOutput;
  };
  readonly "fal-ai/qwen-image-trainer": {
    readonly input: typeof zQwenImageTrainerInput;
    readonly output: typeof zQwenImageTrainerOutput;
  };
  readonly "fal-ai/qwen-image-trainer-v2": {
    readonly input: typeof zQwenImageTrainerV2Input;
    readonly output: typeof zQwenImageTrainerV2Output;
  };
  readonly "fal-ai/recraft/v3/create-style": {
    readonly input: typeof zRecraftV3CreateStyleInput;
    readonly output: typeof zRecraftV3CreateStyleOutput;
  };
  readonly "fal-ai/turbo-flux-trainer": {
    readonly input: typeof zTurboFluxTrainerInput;
    readonly output: typeof zTurboFluxTrainerOutput;
  };
  readonly "fal-ai/wan-22-image-trainer": {
    readonly input: typeof zWan22ImageTrainerInput;
    readonly output: typeof zWan22ImageTrainerOutput;
  };
  readonly "fal-ai/wan-22-trainer/i2v-a14b": {
    readonly input: typeof zWan22TrainerI2vA14bInput;
    readonly output: typeof zWan22TrainerI2vA14bOutput;
  };
  readonly "fal-ai/wan-22-trainer/t2v-a14b": {
    readonly input: typeof zWan22TrainerT2vA14bInput;
    readonly output: typeof zWan22TrainerT2vA14bOutput;
  };
  readonly "fal-ai/wan-trainer": {
    readonly input: typeof zWanTrainerInput;
    readonly output: typeof zWanTrainerOutput;
  };
  readonly "fal-ai/wan-trainer/flf2v-720p": {
    readonly input: typeof zWanTrainerFlf2V720pInput;
    readonly output: typeof zWanTrainerFlf2V720pOutput;
  };
  readonly "fal-ai/wan-trainer/i2v-720p": {
    readonly input: typeof zWanTrainerI2V720pInput;
    readonly output: typeof zWanTrainerI2V720pOutput;
  };
  readonly "fal-ai/wan-trainer/t2v": {
    readonly input: typeof zWanTrainerT2vInput;
    readonly output: typeof zWanTrainerT2vOutput;
  };
  readonly "fal-ai/wan-trainer/t2v-14b": {
    readonly input: typeof zWanTrainerT2V14bInput;
    readonly output: typeof zWanTrainerT2V14bOutput;
  };
  readonly "fal-ai/z-image-base-trainer": {
    readonly input: typeof zZImageBaseTrainerInput;
    readonly output: typeof zZImageBaseTrainerOutput;
  };
  readonly "fal-ai/z-image-trainer": {
    readonly input: typeof zZImageTrainerInput;
    readonly output: typeof zZImageTrainerOutput;
  };
  readonly "fal-ai/z-image-turbo-trainer-v2": {
    readonly input: typeof zZImageTurboTrainerV2Input;
    readonly output: typeof zZImageTurboTrainerV2Output;
  };
} = {
  "fal-ai/ernie-image-trainer": {
    input: zErnieImageTrainerInput,
    output: zErnieImageTrainerOutput,
  },
  "fal-ai/flux-2-klein-4b-base-trainer": {
    input: zFlux2Klein4bBaseTrainerInput,
    output: zFlux2Klein4bBaseTrainerOutput,
  },
  "fal-ai/flux-2-klein-4b-base-trainer/edit": {
    input: zFlux2Klein4bBaseTrainerEditInput,
    output: zFlux2Klein4bBaseTrainerEditOutput,
  },
  "fal-ai/flux-2-klein-9b-base-trainer": {
    input: zFlux2Klein9bBaseTrainerInput,
    output: zFlux2Klein9bBaseTrainerOutput,
  },
  "fal-ai/flux-2-klein-9b-base-trainer/edit": {
    input: zFlux2Klein9bBaseTrainerEditInput,
    output: zFlux2Klein9bBaseTrainerEditOutput,
  },
  "fal-ai/flux-2-trainer": {
    input: zFlux2TrainerInput,
    output: zFlux2TrainerOutput,
  },
  "fal-ai/flux-2-trainer-v2": {
    input: zFlux2TrainerV2Input,
    output: zFlux2TrainerV2Output,
  },
  "fal-ai/flux-2-trainer-v2/edit": {
    input: zFlux2TrainerV2EditInput,
    output: zFlux2TrainerV2EditOutput,
  },
  "fal-ai/flux-2-trainer/edit": {
    input: zFlux2TrainerEditInput,
    output: zFlux2TrainerEditOutput,
  },
  "fal-ai/flux-kontext-trainer": {
    input: zFluxKontextTrainerInput,
    output: zFluxKontextTrainerOutput,
  },
  "fal-ai/flux-krea-trainer": {
    input: zFluxKreaTrainerInput,
    output: zFluxKreaTrainerOutput,
  },
  "fal-ai/flux-lora-fast-training": {
    input: zFluxLoraFastTrainingInput,
    output: zFluxLoraFastTrainingOutput,
  },
  "fal-ai/flux-lora-portrait-trainer": {
    input: zFluxLoraPortraitTrainerInput,
    output: zFluxLoraPortraitTrainerOutput,
  },
  "fal-ai/hunyuan-video-lora-training": {
    input: zHunyuanVideoLoraTrainingInput,
    output: zHunyuanVideoLoraTrainingOutput,
  },
  "fal-ai/ideogram/custom-models": {
    input: zIdeogramCustomModelsInput,
    output: zIdeogramCustomModelsOutput,
  },
  "fal-ai/ltx-video-trainer": {
    input: zLtxVideoTrainerInput,
    output: zLtxVideoTrainerOutput,
  },
  "fal-ai/ltx2-video-trainer": {
    input: zLtx2VideoTrainerInput,
    output: zLtx2VideoTrainerOutput,
  },
  "fal-ai/ltx23-v2v-trainer": {
    input: zLtx23V2vTrainerInput,
    output: zLtx23V2vTrainerOutput,
  },
  "fal-ai/ltx23-video-trainer": {
    input: zLtx23VideoTrainerInput,
    output: zLtx23VideoTrainerOutput,
  },
  "fal-ai/phota/create-profile": {
    input: zPhotaCreateProfileInput,
    output: zPhotaCreateProfileOutput,
  },
  "fal-ai/qwen-image-2512-trainer": {
    input: zQwenImage2512TrainerInput,
    output: zQwenImage2512TrainerOutput,
  },
  "fal-ai/qwen-image-2512-trainer-v2": {
    input: zQwenImage2512TrainerV2Input,
    output: zQwenImage2512TrainerV2Output,
  },
  "fal-ai/qwen-image-edit-2509-trainer": {
    input: zQwenImageEdit2509TrainerInput,
    output: zQwenImageEdit2509TrainerOutput,
  },
  "fal-ai/qwen-image-edit-2511-trainer": {
    input: zQwenImageEdit2511TrainerInput,
    output: zQwenImageEdit2511TrainerOutput,
  },
  "fal-ai/qwen-image-edit-plus-trainer": {
    input: zQwenImageEditPlusTrainerInput,
    output: zQwenImageEditPlusTrainerOutput,
  },
  "fal-ai/qwen-image-edit-trainer": {
    input: zQwenImageEditTrainerInput,
    output: zQwenImageEditTrainerOutput,
  },
  "fal-ai/qwen-image-layered-trainer": {
    input: zQwenImageLayeredTrainerInput,
    output: zQwenImageLayeredTrainerOutput,
  },
  "fal-ai/qwen-image-trainer": {
    input: zQwenImageTrainerInput,
    output: zQwenImageTrainerOutput,
  },
  "fal-ai/qwen-image-trainer-v2": {
    input: zQwenImageTrainerV2Input,
    output: zQwenImageTrainerV2Output,
  },
  "fal-ai/recraft/v3/create-style": {
    input: zRecraftV3CreateStyleInput,
    output: zRecraftV3CreateStyleOutput,
  },
  "fal-ai/turbo-flux-trainer": {
    input: zTurboFluxTrainerInput,
    output: zTurboFluxTrainerOutput,
  },
  "fal-ai/wan-22-image-trainer": {
    input: zWan22ImageTrainerInput,
    output: zWan22ImageTrainerOutput,
  },
  "fal-ai/wan-22-trainer/i2v-a14b": {
    input: zWan22TrainerI2vA14bInput,
    output: zWan22TrainerI2vA14bOutput,
  },
  "fal-ai/wan-22-trainer/t2v-a14b": {
    input: zWan22TrainerT2vA14bInput,
    output: zWan22TrainerT2vA14bOutput,
  },
  "fal-ai/wan-trainer": { input: zWanTrainerInput, output: zWanTrainerOutput },
  "fal-ai/wan-trainer/flf2v-720p": {
    input: zWanTrainerFlf2V720pInput,
    output: zWanTrainerFlf2V720pOutput,
  },
  "fal-ai/wan-trainer/i2v-720p": {
    input: zWanTrainerI2V720pInput,
    output: zWanTrainerI2V720pOutput,
  },
  "fal-ai/wan-trainer/t2v": {
    input: zWanTrainerT2vInput,
    output: zWanTrainerT2vOutput,
  },
  "fal-ai/wan-trainer/t2v-14b": {
    input: zWanTrainerT2V14bInput,
    output: zWanTrainerT2V14bOutput,
  },
  "fal-ai/z-image-base-trainer": {
    input: zZImageBaseTrainerInput,
    output: zZImageBaseTrainerOutput,
  },
  "fal-ai/z-image-trainer": {
    input: zZImageTrainerInput,
    output: zZImageTrainerOutput,
  },
  "fal-ai/z-image-turbo-trainer-v2": {
    input: zZImageTurboTrainerV2Input,
    output: zZImageTurboTrainerV2Output,
  },
};

/** Union of valid training endpoint ids. */
export type TrainingEndpointId = keyof typeof trainingEndpointZodMap;
