// AUTO-GENERATED - Do not edit manually
// Generated from types.gen.ts via scripts/generate-endpoint-maps.ts

import type {
  BytedanceSeed3dImageTo3dInput,
  BytedanceSeed3dImageTo3dOutput,
  Hunyuan3dV21Input,
  Hunyuan3dV21Output,
  Hunyuan3dV2Input,
  Hunyuan3dV2MiniInput,
  Hunyuan3dV2MiniOutput,
  Hunyuan3dV2MiniTurboInput,
  Hunyuan3dV2MiniTurboOutput,
  Hunyuan3dV2MultiViewInput,
  Hunyuan3dV2MultiViewOutput,
  Hunyuan3dV2MultiViewTurboInput,
  Hunyuan3dV2MultiViewTurboOutput,
  Hunyuan3dV2Output,
  Hunyuan3dV2TurboInput,
  Hunyuan3dV2TurboOutput,
  Hunyuan3dV31ProImageTo3dInput,
  Hunyuan3dV31ProImageTo3dOutput,
  Hunyuan3dV31ProTextTo3dInput,
  Hunyuan3dV31ProTextTo3dOutput,
  Hunyuan3dV31RapidImageTo3dInput,
  Hunyuan3dV31RapidImageTo3dOutput,
  Hunyuan3dV31RapidTextTo3dInput,
  Hunyuan3dV31RapidTextTo3dOutput,
  Hunyuan3dV31SmartTopologyInput,
  Hunyuan3dV31SmartTopologyOutput,
  Hunyuan3dV3ImageTo3dInput,
  Hunyuan3dV3ImageTo3dOutput,
  Hunyuan3dV3SketchTo3dInput,
  Hunyuan3dV3SketchTo3dOutput,
  Hunyuan3dV3TextTo3dInput,
  Hunyuan3dV3TextTo3dOutput,
  HunyuanMotionFastInput,
  HunyuanMotionFastOutput,
  HunyuanMotionInput,
  HunyuanMotionOutput,
  HunyuanWorldImageToWorldInput,
  HunyuanWorldImageToWorldOutput,
  Hyper3dRodinInput,
  Hyper3dRodinOutput,
  Hyper3dRodinV2Input,
  Hyper3dRodinV2Output,
  MeshyV5MultiImageTo3dInput,
  MeshyV5MultiImageTo3dOutput,
  MeshyV6PreviewImageTo3dInput,
  MeshyV6PreviewImageTo3dOutput,
  MeshyV6PreviewTextTo3dInput,
  MeshyV6PreviewTextTo3dOutput,
  OmnipartInput,
  OmnipartOutput,
  PshumanInput,
  PshumanOutput,
  Sam33dBodyInput,
  Sam33dBodyOutput,
  Sam33dObjectsInput,
  Sam33dObjectsOutput,
  Trellis2Input,
  Trellis2Output,
  TrellisInput,
  TrellisMultiInput,
  TrellisMultiOutput,
  TrellisOutput,
  TripoV25ImageTo3dInput,
  TripoV25ImageTo3dOutput,
  TripoV25MultiviewTo3dInput,
  TripoV25MultiviewTo3dOutput,
  TriposrInput,
  TriposrOutput,
} from "./types.gen";

export type Gen3dEndpointMap = {
  "fal-ai/hunyuan-3d/v3.1/smart-topology": {
    input: Hunyuan3dV31SmartTopologyInput;
    output: Hunyuan3dV31SmartTopologyOutput;
  };
  "fal-ai/hunyuan-3d/v3.1/rapid/image-to-3d": {
    input: Hunyuan3dV31RapidImageTo3dInput;
    output: Hunyuan3dV31RapidImageTo3dOutput;
  };
  "fal-ai/hunyuan-3d/v3.1/pro/image-to-3d": {
    input: Hunyuan3dV31ProImageTo3dInput;
    output: Hunyuan3dV31ProImageTo3dOutput;
  };
  "fal-ai/trellis-2": {
    input: Trellis2Input;
    output: Trellis2Output;
  };
  "fal-ai/hunyuan3d-v3/sketch-to-3d": {
    input: Hunyuan3dV3SketchTo3dInput;
    output: Hunyuan3dV3SketchTo3dOutput;
  };
  "fal-ai/hunyuan3d-v3/image-to-3d": {
    input: Hunyuan3dV3ImageTo3dInput;
    output: Hunyuan3dV3ImageTo3dOutput;
  };
  "fal-ai/sam-3/3d-body": {
    input: Sam33dBodyInput;
    output: Sam33dBodyOutput;
  };
  "fal-ai/sam-3/3d-objects": {
    input: Sam33dObjectsInput;
    output: Sam33dObjectsOutput;
  };
  "fal-ai/omnipart": {
    input: OmnipartInput;
    output: OmnipartOutput;
  };
  "fal-ai/bytedance/seed3d/image-to-3d": {
    input: BytedanceSeed3dImageTo3dInput;
    output: BytedanceSeed3dImageTo3dOutput;
  };
  "fal-ai/meshy/v5/multi-image-to-3d": {
    input: MeshyV5MultiImageTo3dInput;
    output: MeshyV5MultiImageTo3dOutput;
  };
  "fal-ai/meshy/v6-preview/image-to-3d": {
    input: MeshyV6PreviewImageTo3dInput;
    output: MeshyV6PreviewImageTo3dOutput;
  };
  "fal-ai/hyper3d/rodin/v2": {
    input: Hyper3dRodinV2Input;
    output: Hyper3dRodinV2Output;
  };
  "fal-ai/pshuman": {
    input: PshumanInput;
    output: PshumanOutput;
  };
  "fal-ai/hunyuan_world/image-to-world": {
    input: HunyuanWorldImageToWorldInput;
    output: HunyuanWorldImageToWorldOutput;
  };
  "tripo3d/tripo/v2.5/multiview-to-3d": {
    input: TripoV25MultiviewTo3dInput;
    output: TripoV25MultiviewTo3dOutput;
  };
  "fal-ai/hunyuan3d-v21": {
    input: Hunyuan3dV21Input;
    output: Hunyuan3dV21Output;
  };
  "fal-ai/trellis/multi": {
    input: TrellisMultiInput;
    output: TrellisMultiOutput;
  };
  "tripo3d/tripo/v2.5/image-to-3d": {
    input: TripoV25ImageTo3dInput;
    output: TripoV25ImageTo3dOutput;
  };
  "fal-ai/hunyuan3d/v2/multi-view": {
    input: Hunyuan3dV2MultiViewInput;
    output: Hunyuan3dV2MultiViewOutput;
  };
  "fal-ai/hunyuan3d/v2/mini": {
    input: Hunyuan3dV2MiniInput;
    output: Hunyuan3dV2MiniOutput;
  };
  "fal-ai/hunyuan3d/v2/turbo": {
    input: Hunyuan3dV2TurboInput;
    output: Hunyuan3dV2TurboOutput;
  };
  "fal-ai/hunyuan3d/v2/mini/turbo": {
    input: Hunyuan3dV2MiniTurboInput;
    output: Hunyuan3dV2MiniTurboOutput;
  };
  "fal-ai/hunyuan3d/v2": {
    input: Hunyuan3dV2Input;
    output: Hunyuan3dV2Output;
  };
  "fal-ai/hunyuan3d/v2/multi-view/turbo": {
    input: Hunyuan3dV2MultiViewTurboInput;
    output: Hunyuan3dV2MultiViewTurboOutput;
  };
  "fal-ai/hyper3d/rodin": {
    input: Hyper3dRodinInput;
    output: Hyper3dRodinOutput;
  };
  "fal-ai/trellis": {
    input: TrellisInput;
    output: TrellisOutput;
  };
  "fal-ai/triposr": {
    input: TriposrInput;
    output: TriposrOutput;
  };
  "fal-ai/hunyuan-3d/v3.1/rapid/text-to-3d": {
    input: Hunyuan3dV31RapidTextTo3dInput;
    output: Hunyuan3dV31RapidTextTo3dOutput;
  };
  "fal-ai/hunyuan-3d/v3.1/pro/text-to-3d": {
    input: Hunyuan3dV31ProTextTo3dInput;
    output: Hunyuan3dV31ProTextTo3dOutput;
  };
  "fal-ai/hunyuan-motion/fast": {
    input: HunyuanMotionFastInput;
    output: HunyuanMotionFastOutput;
  };
  "fal-ai/hunyuan-motion": {
    input: HunyuanMotionInput;
    output: HunyuanMotionOutput;
  };
  "fal-ai/hunyuan3d-v3/text-to-3d": {
    input: Hunyuan3dV3TextTo3dInput;
    output: Hunyuan3dV3TextTo3dOutput;
  };
  "fal-ai/meshy/v6-preview/text-to-3d": {
    input: MeshyV6PreviewTextTo3dInput;
    output: MeshyV6PreviewTextTo3dOutput;
  };
};

/** Union type of all 3d model endpoint IDs */
export type Gen3dModel = keyof Gen3dEndpointMap;

/** Get the input type for a specific 3d model */
export type Gen3dModelInput<T extends Gen3dModel> =
  Gen3dEndpointMap[T]["input"];

/** Get the output type for a specific 3d model */
export type Gen3dModelOutput<T extends Gen3dModel> =
  Gen3dEndpointMap[T]["output"];
