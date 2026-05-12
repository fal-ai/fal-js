// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import {
  zH31ImageTo3dInput,
  zH31ImageTo3dOutput,
  zH31MultiviewTo3dInput,
  zH31MultiviewTo3dOutput,
  zH31TextTo3dInput,
  zH31TextTo3dOutput,
  zHunyuan3dV2Input,
  zHunyuan3dV2MiniInput,
  zHunyuan3dV2MiniOutput,
  zHunyuan3dV2MiniTurboInput,
  zHunyuan3dV2MiniTurboOutput,
  zHunyuan3dV2MultiViewInput,
  zHunyuan3dV2MultiViewOutput,
  zHunyuan3dV2MultiViewTurboInput,
  zHunyuan3dV2MultiViewTurboOutput,
  zHunyuan3dV2Output,
  zHunyuan3dV2TurboInput,
  zHunyuan3dV2TurboOutput,
  zHunyuan3dV31PartInput,
  zHunyuan3dV31PartOutput,
  zHunyuan3dV31ProImageTo3dInput,
  zHunyuan3dV31ProImageTo3dOutput,
  zHunyuan3dV31ProTextTo3dInput,
  zHunyuan3dV31ProTextTo3dOutput,
  zHunyuan3dV31RapidImageTo3dInput,
  zHunyuan3dV31RapidImageTo3dOutput,
  zHunyuan3dV31RapidTextTo3dInput,
  zHunyuan3dV31RapidTextTo3dOutput,
  zHunyuan3dV31SmartTopologyInput,
  zHunyuan3dV31SmartTopologyOutput,
  zHunyuan3dV3ImageTo3dInput,
  zHunyuan3dV3ImageTo3dOutput,
  zHunyuan3dV3SketchTo3dInput,
  zHunyuan3dV3SketchTo3dOutput,
  zHunyuan3dV3TextTo3dInput,
  zHunyuan3dV3TextTo3dOutput,
  zHunyuanMotionFastInput,
  zHunyuanMotionFastOutput,
  zHunyuanMotionInput,
  zHunyuanMotionOutput,
  zHunyuanPartInput,
  zHunyuanPartOutput,
  zHunyuanWorldImageToWorldInput,
  zHunyuanWorldImageToWorldOutput,
  zHyper3dRodinInput,
  zHyper3dRodinOutput,
  zHyper3dRodinV2Input,
  zHyper3dRodinV2Output,
  zOmnipartInput,
  zOmnipartOutput,
  zP1ImageTo3dInput,
  zP1ImageTo3dOutput,
  zP1TextTo3dInput,
  zP1TextTo3dOutput,
  zPshumanInput,
  zPshumanOutput,
  zReconviagen05Input,
  zReconviagen05Output,
  zSam33dAlignInput,
  zSam33dAlignOutput,
  zSam33dBodyInput,
  zSam33dBodyOutput,
  zSam33dObjectsInput,
  zSam33dObjectsOutput,
  zTrellis2Input,
  zTrellis2Output,
  zTrellis2RetextureInput,
  zTrellis2RetextureOutput,
  zTrellisInput,
  zTrellisMultiInput,
  zTrellisMultiOutput,
  zTrellisOutput,
  zTripoV25ImageTo3dInput,
  zTripoV25ImageTo3dOutput,
  zTripoV25MultiviewTo3dInput,
  zTripoV25MultiviewTo3dOutput,
  zTriposrInput,
  zTriposrOutput,
  zUltrashapeInput,
  zUltrashapeOutput,
} from "./zod.gen.js";

/** Map of 3d endpoint id -> Zod input/output schemas. */
export const gen3dEndpoints: {
  readonly "fal-ai/hunyuan_world/image-to-world": {
    readonly input: typeof zHunyuanWorldImageToWorldInput;
    readonly output: typeof zHunyuanWorldImageToWorldOutput;
  };
  readonly "fal-ai/hunyuan-3d/v3.1/part": {
    readonly input: typeof zHunyuan3dV31PartInput;
    readonly output: typeof zHunyuan3dV31PartOutput;
  };
  readonly "fal-ai/hunyuan-3d/v3.1/pro/image-to-3d": {
    readonly input: typeof zHunyuan3dV31ProImageTo3dInput;
    readonly output: typeof zHunyuan3dV31ProImageTo3dOutput;
  };
  readonly "fal-ai/hunyuan-3d/v3.1/pro/text-to-3d": {
    readonly input: typeof zHunyuan3dV31ProTextTo3dInput;
    readonly output: typeof zHunyuan3dV31ProTextTo3dOutput;
  };
  readonly "fal-ai/hunyuan-3d/v3.1/rapid/image-to-3d": {
    readonly input: typeof zHunyuan3dV31RapidImageTo3dInput;
    readonly output: typeof zHunyuan3dV31RapidImageTo3dOutput;
  };
  readonly "fal-ai/hunyuan-3d/v3.1/rapid/text-to-3d": {
    readonly input: typeof zHunyuan3dV31RapidTextTo3dInput;
    readonly output: typeof zHunyuan3dV31RapidTextTo3dOutput;
  };
  readonly "fal-ai/hunyuan-3d/v3.1/smart-topology": {
    readonly input: typeof zHunyuan3dV31SmartTopologyInput;
    readonly output: typeof zHunyuan3dV31SmartTopologyOutput;
  };
  readonly "fal-ai/hunyuan-motion": {
    readonly input: typeof zHunyuanMotionInput;
    readonly output: typeof zHunyuanMotionOutput;
  };
  readonly "fal-ai/hunyuan-motion/fast": {
    readonly input: typeof zHunyuanMotionFastInput;
    readonly output: typeof zHunyuanMotionFastOutput;
  };
  readonly "fal-ai/hunyuan-part": {
    readonly input: typeof zHunyuanPartInput;
    readonly output: typeof zHunyuanPartOutput;
  };
  readonly "fal-ai/hunyuan3d-v3/image-to-3d": {
    readonly input: typeof zHunyuan3dV3ImageTo3dInput;
    readonly output: typeof zHunyuan3dV3ImageTo3dOutput;
  };
  readonly "fal-ai/hunyuan3d-v3/sketch-to-3d": {
    readonly input: typeof zHunyuan3dV3SketchTo3dInput;
    readonly output: typeof zHunyuan3dV3SketchTo3dOutput;
  };
  readonly "fal-ai/hunyuan3d-v3/text-to-3d": {
    readonly input: typeof zHunyuan3dV3TextTo3dInput;
    readonly output: typeof zHunyuan3dV3TextTo3dOutput;
  };
  readonly "fal-ai/hunyuan3d/v2": {
    readonly input: typeof zHunyuan3dV2Input;
    readonly output: typeof zHunyuan3dV2Output;
  };
  readonly "fal-ai/hunyuan3d/v2/mini": {
    readonly input: typeof zHunyuan3dV2MiniInput;
    readonly output: typeof zHunyuan3dV2MiniOutput;
  };
  readonly "fal-ai/hunyuan3d/v2/mini/turbo": {
    readonly input: typeof zHunyuan3dV2MiniTurboInput;
    readonly output: typeof zHunyuan3dV2MiniTurboOutput;
  };
  readonly "fal-ai/hunyuan3d/v2/multi-view": {
    readonly input: typeof zHunyuan3dV2MultiViewInput;
    readonly output: typeof zHunyuan3dV2MultiViewOutput;
  };
  readonly "fal-ai/hunyuan3d/v2/multi-view/turbo": {
    readonly input: typeof zHunyuan3dV2MultiViewTurboInput;
    readonly output: typeof zHunyuan3dV2MultiViewTurboOutput;
  };
  readonly "fal-ai/hunyuan3d/v2/turbo": {
    readonly input: typeof zHunyuan3dV2TurboInput;
    readonly output: typeof zHunyuan3dV2TurboOutput;
  };
  readonly "fal-ai/hyper3d/rodin": {
    readonly input: typeof zHyper3dRodinInput;
    readonly output: typeof zHyper3dRodinOutput;
  };
  readonly "fal-ai/hyper3d/rodin/v2": {
    readonly input: typeof zHyper3dRodinV2Input;
    readonly output: typeof zHyper3dRodinV2Output;
  };
  readonly "fal-ai/omnipart": {
    readonly input: typeof zOmnipartInput;
    readonly output: typeof zOmnipartOutput;
  };
  readonly "fal-ai/pshuman": {
    readonly input: typeof zPshumanInput;
    readonly output: typeof zPshumanOutput;
  };
  readonly "fal-ai/reconviagen-0.5": {
    readonly input: typeof zReconviagen05Input;
    readonly output: typeof zReconviagen05Output;
  };
  readonly "fal-ai/sam-3/3d-align": {
    readonly input: typeof zSam33dAlignInput;
    readonly output: typeof zSam33dAlignOutput;
  };
  readonly "fal-ai/sam-3/3d-body": {
    readonly input: typeof zSam33dBodyInput;
    readonly output: typeof zSam33dBodyOutput;
  };
  readonly "fal-ai/sam-3/3d-objects": {
    readonly input: typeof zSam33dObjectsInput;
    readonly output: typeof zSam33dObjectsOutput;
  };
  readonly "fal-ai/trellis": {
    readonly input: typeof zTrellisInput;
    readonly output: typeof zTrellisOutput;
  };
  readonly "fal-ai/trellis-2": {
    readonly input: typeof zTrellis2Input;
    readonly output: typeof zTrellis2Output;
  };
  readonly "fal-ai/trellis-2/retexture": {
    readonly input: typeof zTrellis2RetextureInput;
    readonly output: typeof zTrellis2RetextureOutput;
  };
  readonly "fal-ai/trellis/multi": {
    readonly input: typeof zTrellisMultiInput;
    readonly output: typeof zTrellisMultiOutput;
  };
  readonly "fal-ai/triposr": {
    readonly input: typeof zTriposrInput;
    readonly output: typeof zTriposrOutput;
  };
  readonly "fal-ai/ultrashape": {
    readonly input: typeof zUltrashapeInput;
    readonly output: typeof zUltrashapeOutput;
  };
  readonly "tripo3d/h3.1/image-to-3d": {
    readonly input: typeof zH31ImageTo3dInput;
    readonly output: typeof zH31ImageTo3dOutput;
  };
  readonly "tripo3d/h3.1/multiview-to-3d": {
    readonly input: typeof zH31MultiviewTo3dInput;
    readonly output: typeof zH31MultiviewTo3dOutput;
  };
  readonly "tripo3d/h3.1/text-to-3d": {
    readonly input: typeof zH31TextTo3dInput;
    readonly output: typeof zH31TextTo3dOutput;
  };
  readonly "tripo3d/p1/image-to-3d": {
    readonly input: typeof zP1ImageTo3dInput;
    readonly output: typeof zP1ImageTo3dOutput;
  };
  readonly "tripo3d/p1/text-to-3d": {
    readonly input: typeof zP1TextTo3dInput;
    readonly output: typeof zP1TextTo3dOutput;
  };
  readonly "tripo3d/tripo/v2.5/image-to-3d": {
    readonly input: typeof zTripoV25ImageTo3dInput;
    readonly output: typeof zTripoV25ImageTo3dOutput;
  };
  readonly "tripo3d/tripo/v2.5/multiview-to-3d": {
    readonly input: typeof zTripoV25MultiviewTo3dInput;
    readonly output: typeof zTripoV25MultiviewTo3dOutput;
  };
} = {
  "fal-ai/hunyuan_world/image-to-world": {
    input: zHunyuanWorldImageToWorldInput,
    output: zHunyuanWorldImageToWorldOutput,
  },
  "fal-ai/hunyuan-3d/v3.1/part": {
    input: zHunyuan3dV31PartInput,
    output: zHunyuan3dV31PartOutput,
  },
  "fal-ai/hunyuan-3d/v3.1/pro/image-to-3d": {
    input: zHunyuan3dV31ProImageTo3dInput,
    output: zHunyuan3dV31ProImageTo3dOutput,
  },
  "fal-ai/hunyuan-3d/v3.1/pro/text-to-3d": {
    input: zHunyuan3dV31ProTextTo3dInput,
    output: zHunyuan3dV31ProTextTo3dOutput,
  },
  "fal-ai/hunyuan-3d/v3.1/rapid/image-to-3d": {
    input: zHunyuan3dV31RapidImageTo3dInput,
    output: zHunyuan3dV31RapidImageTo3dOutput,
  },
  "fal-ai/hunyuan-3d/v3.1/rapid/text-to-3d": {
    input: zHunyuan3dV31RapidTextTo3dInput,
    output: zHunyuan3dV31RapidTextTo3dOutput,
  },
  "fal-ai/hunyuan-3d/v3.1/smart-topology": {
    input: zHunyuan3dV31SmartTopologyInput,
    output: zHunyuan3dV31SmartTopologyOutput,
  },
  "fal-ai/hunyuan-motion": {
    input: zHunyuanMotionInput,
    output: zHunyuanMotionOutput,
  },
  "fal-ai/hunyuan-motion/fast": {
    input: zHunyuanMotionFastInput,
    output: zHunyuanMotionFastOutput,
  },
  "fal-ai/hunyuan-part": {
    input: zHunyuanPartInput,
    output: zHunyuanPartOutput,
  },
  "fal-ai/hunyuan3d-v3/image-to-3d": {
    input: zHunyuan3dV3ImageTo3dInput,
    output: zHunyuan3dV3ImageTo3dOutput,
  },
  "fal-ai/hunyuan3d-v3/sketch-to-3d": {
    input: zHunyuan3dV3SketchTo3dInput,
    output: zHunyuan3dV3SketchTo3dOutput,
  },
  "fal-ai/hunyuan3d-v3/text-to-3d": {
    input: zHunyuan3dV3TextTo3dInput,
    output: zHunyuan3dV3TextTo3dOutput,
  },
  "fal-ai/hunyuan3d/v2": {
    input: zHunyuan3dV2Input,
    output: zHunyuan3dV2Output,
  },
  "fal-ai/hunyuan3d/v2/mini": {
    input: zHunyuan3dV2MiniInput,
    output: zHunyuan3dV2MiniOutput,
  },
  "fal-ai/hunyuan3d/v2/mini/turbo": {
    input: zHunyuan3dV2MiniTurboInput,
    output: zHunyuan3dV2MiniTurboOutput,
  },
  "fal-ai/hunyuan3d/v2/multi-view": {
    input: zHunyuan3dV2MultiViewInput,
    output: zHunyuan3dV2MultiViewOutput,
  },
  "fal-ai/hunyuan3d/v2/multi-view/turbo": {
    input: zHunyuan3dV2MultiViewTurboInput,
    output: zHunyuan3dV2MultiViewTurboOutput,
  },
  "fal-ai/hunyuan3d/v2/turbo": {
    input: zHunyuan3dV2TurboInput,
    output: zHunyuan3dV2TurboOutput,
  },
  "fal-ai/hyper3d/rodin": {
    input: zHyper3dRodinInput,
    output: zHyper3dRodinOutput,
  },
  "fal-ai/hyper3d/rodin/v2": {
    input: zHyper3dRodinV2Input,
    output: zHyper3dRodinV2Output,
  },
  "fal-ai/omnipart": { input: zOmnipartInput, output: zOmnipartOutput },
  "fal-ai/pshuman": { input: zPshumanInput, output: zPshumanOutput },
  "fal-ai/reconviagen-0.5": {
    input: zReconviagen05Input,
    output: zReconviagen05Output,
  },
  "fal-ai/sam-3/3d-align": {
    input: zSam33dAlignInput,
    output: zSam33dAlignOutput,
  },
  "fal-ai/sam-3/3d-body": {
    input: zSam33dBodyInput,
    output: zSam33dBodyOutput,
  },
  "fal-ai/sam-3/3d-objects": {
    input: zSam33dObjectsInput,
    output: zSam33dObjectsOutput,
  },
  "fal-ai/trellis": { input: zTrellisInput, output: zTrellisOutput },
  "fal-ai/trellis-2": { input: zTrellis2Input, output: zTrellis2Output },
  "fal-ai/trellis-2/retexture": {
    input: zTrellis2RetextureInput,
    output: zTrellis2RetextureOutput,
  },
  "fal-ai/trellis/multi": {
    input: zTrellisMultiInput,
    output: zTrellisMultiOutput,
  },
  "fal-ai/triposr": { input: zTriposrInput, output: zTriposrOutput },
  "fal-ai/ultrashape": { input: zUltrashapeInput, output: zUltrashapeOutput },
  "tripo3d/h3.1/image-to-3d": {
    input: zH31ImageTo3dInput,
    output: zH31ImageTo3dOutput,
  },
  "tripo3d/h3.1/multiview-to-3d": {
    input: zH31MultiviewTo3dInput,
    output: zH31MultiviewTo3dOutput,
  },
  "tripo3d/h3.1/text-to-3d": {
    input: zH31TextTo3dInput,
    output: zH31TextTo3dOutput,
  },
  "tripo3d/p1/image-to-3d": {
    input: zP1ImageTo3dInput,
    output: zP1ImageTo3dOutput,
  },
  "tripo3d/p1/text-to-3d": {
    input: zP1TextTo3dInput,
    output: zP1TextTo3dOutput,
  },
  "tripo3d/tripo/v2.5/image-to-3d": {
    input: zTripoV25ImageTo3dInput,
    output: zTripoV25ImageTo3dOutput,
  },
  "tripo3d/tripo/v2.5/multiview-to-3d": {
    input: zTripoV25MultiviewTo3dInput,
    output: zTripoV25MultiviewTo3dOutput,
  },
};

/** Union of valid 3d endpoint ids. */
export type Gen3dEndpointId = keyof typeof gen3dEndpoints;
