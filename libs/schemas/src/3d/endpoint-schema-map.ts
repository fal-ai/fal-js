// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import type { Gen3dEndpointId } from "./endpoint-zod-map.js";
import {
  H31ImageTo3dInputSchema,
  H31ImageTo3dOutputSchema,
  H31MultiviewTo3dInputSchema,
  H31MultiviewTo3dOutputSchema,
  H31TextTo3dInputSchema,
  H31TextTo3dOutputSchema,
  Hunyuan3dV2InputSchema,
  Hunyuan3dV2MiniInputSchema,
  Hunyuan3dV2MiniOutputSchema,
  Hunyuan3dV2MiniTurboInputSchema,
  Hunyuan3dV2MiniTurboOutputSchema,
  Hunyuan3dV2MultiViewInputSchema,
  Hunyuan3dV2MultiViewOutputSchema,
  Hunyuan3dV2MultiViewTurboInputSchema,
  Hunyuan3dV2MultiViewTurboOutputSchema,
  Hunyuan3dV2OutputSchema,
  Hunyuan3dV2TurboInputSchema,
  Hunyuan3dV2TurboOutputSchema,
  Hunyuan3dV31PartInputSchema,
  Hunyuan3dV31PartOutputSchema,
  Hunyuan3dV31ProImageTo3dInputSchema,
  Hunyuan3dV31ProImageTo3dOutputSchema,
  Hunyuan3dV31ProTextTo3dInputSchema,
  Hunyuan3dV31ProTextTo3dOutputSchema,
  Hunyuan3dV31RapidImageTo3dInputSchema,
  Hunyuan3dV31RapidImageTo3dOutputSchema,
  Hunyuan3dV31RapidTextTo3dInputSchema,
  Hunyuan3dV31RapidTextTo3dOutputSchema,
  Hunyuan3dV31SmartTopologyInputSchema,
  Hunyuan3dV31SmartTopologyOutputSchema,
  Hunyuan3dV3ImageTo3dInputSchema,
  Hunyuan3dV3ImageTo3dOutputSchema,
  Hunyuan3dV3SketchTo3dInputSchema,
  Hunyuan3dV3SketchTo3dOutputSchema,
  Hunyuan3dV3TextTo3dInputSchema,
  Hunyuan3dV3TextTo3dOutputSchema,
  HunyuanMotionFastInputSchema,
  HunyuanMotionFastOutputSchema,
  HunyuanMotionInputSchema,
  HunyuanMotionOutputSchema,
  HunyuanPartInputSchema,
  HunyuanPartOutputSchema,
  Hunyuan_worldImageToWorldInputSchema,
  Hunyuan_worldImageToWorldOutputSchema,
  Hyper3dRodinInputSchema,
  Hyper3dRodinOutputSchema,
  Hyper3dRodinV2InputSchema,
  Hyper3dRodinV2OutputSchema,
  OmnipartInputSchema,
  OmnipartOutputSchema,
  P1ImageTo3dInputSchema,
  P1ImageTo3dOutputSchema,
  P1TextTo3dInputSchema,
  P1TextTo3dOutputSchema,
  PshumanInputSchema,
  PshumanOutputSchema,
  Reconviagen05InputSchema,
  Reconviagen05OutputSchema,
  Sam33dAlignInputSchema,
  Sam33dAlignOutputSchema,
  Sam33dBodyInputSchema,
  Sam33dBodyOutputSchema,
  Sam33dObjectsInputSchema,
  Sam33dObjectsOutputSchema,
  Trellis2InputSchema,
  Trellis2OutputSchema,
  Trellis2RetextureInputSchema,
  Trellis2RetextureOutputSchema,
  TrellisInputSchema,
  TrellisMultiInputSchema,
  TrellisMultiOutputSchema,
  TrellisOutputSchema,
  TripoV25ImageTo3dInputSchema,
  TripoV25ImageTo3dOutputSchema,
  TripoV25MultiviewTo3dInputSchema,
  TripoV25MultiviewTo3dOutputSchema,
  TriposrInputSchema,
  TriposrOutputSchema,
  UltrashapeInputSchema,
  UltrashapeOutputSchema,
} from "./schemas.gen.js";

type JsonSchema = Readonly<Record<string, unknown>>;

/**
 * Map of 3d endpoint id -> self-contained JSON Schemas.
 * Each input/output schema bundles its $ref closure under `$defs`, so it
 * can be handed directly to LLM tool APIs or `z.fromJSONSchema`.
 */
export const gen3dEndpointSchemaMap: Record<
  Gen3dEndpointId,
  { readonly input: JsonSchema; readonly output: JsonSchema }
> = {
  "fal-ai/hunyuan_world/image-to-world": {
    input: Hunyuan_worldImageToWorldInputSchema,
    output: Hunyuan_worldImageToWorldOutputSchema,
  },
  "fal-ai/hunyuan-3d/v3.1/part": {
    input: Hunyuan3dV31PartInputSchema,
    output: Hunyuan3dV31PartOutputSchema,
  },
  "fal-ai/hunyuan-3d/v3.1/pro/image-to-3d": {
    input: Hunyuan3dV31ProImageTo3dInputSchema,
    output: Hunyuan3dV31ProImageTo3dOutputSchema,
  },
  "fal-ai/hunyuan-3d/v3.1/pro/text-to-3d": {
    input: Hunyuan3dV31ProTextTo3dInputSchema,
    output: Hunyuan3dV31ProTextTo3dOutputSchema,
  },
  "fal-ai/hunyuan-3d/v3.1/rapid/image-to-3d": {
    input: Hunyuan3dV31RapidImageTo3dInputSchema,
    output: Hunyuan3dV31RapidImageTo3dOutputSchema,
  },
  "fal-ai/hunyuan-3d/v3.1/rapid/text-to-3d": {
    input: Hunyuan3dV31RapidTextTo3dInputSchema,
    output: Hunyuan3dV31RapidTextTo3dOutputSchema,
  },
  "fal-ai/hunyuan-3d/v3.1/smart-topology": {
    input: Hunyuan3dV31SmartTopologyInputSchema,
    output: Hunyuan3dV31SmartTopologyOutputSchema,
  },
  "fal-ai/hunyuan-motion": {
    input: HunyuanMotionInputSchema,
    output: HunyuanMotionOutputSchema,
  },
  "fal-ai/hunyuan-motion/fast": {
    input: HunyuanMotionFastInputSchema,
    output: HunyuanMotionFastOutputSchema,
  },
  "fal-ai/hunyuan-part": {
    input: HunyuanPartInputSchema,
    output: HunyuanPartOutputSchema,
  },
  "fal-ai/hunyuan3d-v3/image-to-3d": {
    input: Hunyuan3dV3ImageTo3dInputSchema,
    output: Hunyuan3dV3ImageTo3dOutputSchema,
  },
  "fal-ai/hunyuan3d-v3/sketch-to-3d": {
    input: Hunyuan3dV3SketchTo3dInputSchema,
    output: Hunyuan3dV3SketchTo3dOutputSchema,
  },
  "fal-ai/hunyuan3d-v3/text-to-3d": {
    input: Hunyuan3dV3TextTo3dInputSchema,
    output: Hunyuan3dV3TextTo3dOutputSchema,
  },
  "fal-ai/hunyuan3d/v2": {
    input: Hunyuan3dV2InputSchema,
    output: Hunyuan3dV2OutputSchema,
  },
  "fal-ai/hunyuan3d/v2/mini": {
    input: Hunyuan3dV2MiniInputSchema,
    output: Hunyuan3dV2MiniOutputSchema,
  },
  "fal-ai/hunyuan3d/v2/mini/turbo": {
    input: Hunyuan3dV2MiniTurboInputSchema,
    output: Hunyuan3dV2MiniTurboOutputSchema,
  },
  "fal-ai/hunyuan3d/v2/multi-view": {
    input: Hunyuan3dV2MultiViewInputSchema,
    output: Hunyuan3dV2MultiViewOutputSchema,
  },
  "fal-ai/hunyuan3d/v2/multi-view/turbo": {
    input: Hunyuan3dV2MultiViewTurboInputSchema,
    output: Hunyuan3dV2MultiViewTurboOutputSchema,
  },
  "fal-ai/hunyuan3d/v2/turbo": {
    input: Hunyuan3dV2TurboInputSchema,
    output: Hunyuan3dV2TurboOutputSchema,
  },
  "fal-ai/hyper3d/rodin": {
    input: Hyper3dRodinInputSchema,
    output: Hyper3dRodinOutputSchema,
  },
  "fal-ai/hyper3d/rodin/v2": {
    input: Hyper3dRodinV2InputSchema,
    output: Hyper3dRodinV2OutputSchema,
  },
  "fal-ai/omnipart": {
    input: OmnipartInputSchema,
    output: OmnipartOutputSchema,
  },
  "fal-ai/pshuman": { input: PshumanInputSchema, output: PshumanOutputSchema },
  "fal-ai/reconviagen-0.5": {
    input: Reconviagen05InputSchema,
    output: Reconviagen05OutputSchema,
  },
  "fal-ai/sam-3/3d-align": {
    input: Sam33dAlignInputSchema,
    output: Sam33dAlignOutputSchema,
  },
  "fal-ai/sam-3/3d-body": {
    input: Sam33dBodyInputSchema,
    output: Sam33dBodyOutputSchema,
  },
  "fal-ai/sam-3/3d-objects": {
    input: Sam33dObjectsInputSchema,
    output: Sam33dObjectsOutputSchema,
  },
  "fal-ai/trellis": { input: TrellisInputSchema, output: TrellisOutputSchema },
  "fal-ai/trellis-2": {
    input: Trellis2InputSchema,
    output: Trellis2OutputSchema,
  },
  "fal-ai/trellis-2/retexture": {
    input: Trellis2RetextureInputSchema,
    output: Trellis2RetextureOutputSchema,
  },
  "fal-ai/trellis/multi": {
    input: TrellisMultiInputSchema,
    output: TrellisMultiOutputSchema,
  },
  "fal-ai/triposr": { input: TriposrInputSchema, output: TriposrOutputSchema },
  "fal-ai/ultrashape": {
    input: UltrashapeInputSchema,
    output: UltrashapeOutputSchema,
  },
  "tripo3d/h3.1/image-to-3d": {
    input: H31ImageTo3dInputSchema,
    output: H31ImageTo3dOutputSchema,
  },
  "tripo3d/h3.1/multiview-to-3d": {
    input: H31MultiviewTo3dInputSchema,
    output: H31MultiviewTo3dOutputSchema,
  },
  "tripo3d/h3.1/text-to-3d": {
    input: H31TextTo3dInputSchema,
    output: H31TextTo3dOutputSchema,
  },
  "tripo3d/p1/image-to-3d": {
    input: P1ImageTo3dInputSchema,
    output: P1ImageTo3dOutputSchema,
  },
  "tripo3d/p1/text-to-3d": {
    input: P1TextTo3dInputSchema,
    output: P1TextTo3dOutputSchema,
  },
  "tripo3d/tripo/v2.5/image-to-3d": {
    input: TripoV25ImageTo3dInputSchema,
    output: TripoV25ImageTo3dOutputSchema,
  },
  "tripo3d/tripo/v2.5/multiview-to-3d": {
    input: TripoV25MultiviewTo3dInputSchema,
    output: TripoV25MultiviewTo3dOutputSchema,
  },
};
