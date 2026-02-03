// AUTO-GENERATED - Do not edit manually
// Generated from types.gen.ts via scripts/generate-endpoint-maps.ts

import { z } from "zod";

import {
  zQwen3TtsCloneVoice06bInput,
  zQwen3TtsCloneVoice06bOutput,
  zQwen3TtsCloneVoice17bInput,
  zQwen3TtsCloneVoice17bOutput,
  zRouterAudioInput,
  zRouterAudioOutput,
  zWorkflowUtilitiesInterleaveVideoInput,
  zWorkflowUtilitiesInterleaveVideoOutput,
} from "./zod.gen";

/** Zod schema for unknown endpoints using discriminatedUnion */
export const UnknownEndpointSchema = z.discriminatedUnion("endpoint", [
  z.object({
    endpoint: z.literal("fal-ai/workflow-utilities/interleave-video"),
    input: zWorkflowUtilitiesInterleaveVideoInput,
    output: zWorkflowUtilitiesInterleaveVideoOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/qwen-3-tts/clone-voice/1.7b"),
    input: zQwen3TtsCloneVoice17bInput,
    output: zQwen3TtsCloneVoice17bOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/qwen-3-tts/clone-voice/0.6b"),
    input: zQwen3TtsCloneVoice06bInput,
    output: zQwen3TtsCloneVoice06bOutput,
  }),
  z.object({
    endpoint: z.literal("openrouter/router/audio"),
    input: zRouterAudioInput,
    output: zRouterAudioOutput,
  }),
]);

/** Inferred type from UnknownEndpointSchema */
export type UnknownEndpoint = z.infer<typeof UnknownEndpointSchema>;
