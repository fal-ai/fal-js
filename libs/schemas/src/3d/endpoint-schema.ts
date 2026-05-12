// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import { z } from "zod";

import {
  zH31ImageTo3dInput,
  zH31MultiviewTo3dInput,
  zH31TextTo3dInput,
  zHunyuan3dV2Input,
  zHunyuan3dV2MiniInput,
  zHunyuan3dV2MiniTurboInput,
  zHunyuan3dV2MultiViewInput,
  zHunyuan3dV2MultiViewTurboInput,
  zHunyuan3dV2TurboInput,
  zHunyuan3dV31PartInput,
  zHunyuan3dV31ProImageTo3dInput,
  zHunyuan3dV31ProTextTo3dInput,
  zHunyuan3dV31RapidImageTo3dInput,
  zHunyuan3dV31RapidTextTo3dInput,
  zHunyuan3dV31SmartTopologyInput,
  zHunyuan3dV3ImageTo3dInput,
  zHunyuan3dV3SketchTo3dInput,
  zHunyuan3dV3TextTo3dInput,
  zHunyuanMotionFastInput,
  zHunyuanMotionInput,
  zHunyuanPartInput,
  zHunyuanWorldImageToWorldInput,
  zHyper3dRodinInput,
  zHyper3dRodinV2Input,
  zOmnipartInput,
  zP1ImageTo3dInput,
  zP1TextTo3dInput,
  zPshumanInput,
  zQueueStatus,
  zReconviagen05Input,
  zSam33dAlignInput,
  zSam33dBodyInput,
  zSam33dObjectsInput,
  zTrellis2Input,
  zTrellis2RetextureInput,
  zTrellisInput,
  zTrellisMultiInput,
  zTripoV25ImageTo3dInput,
  zTripoV25MultiviewTo3dInput,
  zTriposrInput,
  zUltrashapeInput,
} from "./zod.gen";

/** Zod schema for 3d endpoints using discriminatedUnion */
export const Gen3dEndpointSchema = z.discriminatedUnion("endpoint", [
  z.object({
    endpoint: z.literal("fal-ai/hunyuan_world/image-to-world"),
    input: zHunyuanWorldImageToWorldInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/hunyuan-3d/v3.1/part"),
    input: zHunyuan3dV31PartInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/hunyuan-3d/v3.1/pro/image-to-3d"),
    input: zHunyuan3dV31ProImageTo3dInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/hunyuan-3d/v3.1/pro/text-to-3d"),
    input: zHunyuan3dV31ProTextTo3dInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/hunyuan-3d/v3.1/rapid/image-to-3d"),
    input: zHunyuan3dV31RapidImageTo3dInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/hunyuan-3d/v3.1/rapid/text-to-3d"),
    input: zHunyuan3dV31RapidTextTo3dInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/hunyuan-3d/v3.1/smart-topology"),
    input: zHunyuan3dV31SmartTopologyInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/hunyuan-motion"),
    input: zHunyuanMotionInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/hunyuan-motion/fast"),
    input: zHunyuanMotionFastInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/hunyuan-part"),
    input: zHunyuanPartInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/hunyuan3d-v3/image-to-3d"),
    input: zHunyuan3dV3ImageTo3dInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/hunyuan3d-v3/sketch-to-3d"),
    input: zHunyuan3dV3SketchTo3dInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/hunyuan3d-v3/text-to-3d"),
    input: zHunyuan3dV3TextTo3dInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/hunyuan3d/v2"),
    input: zHunyuan3dV2Input,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/hunyuan3d/v2/mini"),
    input: zHunyuan3dV2MiniInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/hunyuan3d/v2/mini/turbo"),
    input: zHunyuan3dV2MiniTurboInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/hunyuan3d/v2/multi-view"),
    input: zHunyuan3dV2MultiViewInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/hunyuan3d/v2/multi-view/turbo"),
    input: zHunyuan3dV2MultiViewTurboInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/hunyuan3d/v2/turbo"),
    input: zHunyuan3dV2TurboInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/hyper3d/rodin"),
    input: zHyper3dRodinInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/hyper3d/rodin/v2"),
    input: zHyper3dRodinV2Input,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/omnipart"),
    input: zOmnipartInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/pshuman"),
    input: zPshumanInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/reconviagen-0.5"),
    input: zReconviagen05Input,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/sam-3/3d-align"),
    input: zSam33dAlignInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/sam-3/3d-body"),
    input: zSam33dBodyInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/sam-3/3d-objects"),
    input: zSam33dObjectsInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/trellis"),
    input: zTrellisInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/trellis-2"),
    input: zTrellis2Input,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/trellis-2/retexture"),
    input: zTrellis2RetextureInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/trellis/multi"),
    input: zTrellisMultiInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/triposr"),
    input: zTriposrInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/ultrashape"),
    input: zUltrashapeInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("tripo3d/h3.1/image-to-3d"),
    input: zH31ImageTo3dInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("tripo3d/h3.1/multiview-to-3d"),
    input: zH31MultiviewTo3dInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("tripo3d/h3.1/text-to-3d"),
    input: zH31TextTo3dInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("tripo3d/p1/image-to-3d"),
    input: zP1ImageTo3dInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("tripo3d/p1/text-to-3d"),
    input: zP1TextTo3dInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("tripo3d/tripo/v2.5/image-to-3d"),
    input: zTripoV25ImageTo3dInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("tripo3d/tripo/v2.5/multiview-to-3d"),
    input: zTripoV25MultiviewTo3dInput,
    output: zQueueStatus,
  }),
]);

/** Inferred type from Gen3dEndpointSchema */
export type Gen3dEndpoint = z.infer<typeof Gen3dEndpointSchema>;
