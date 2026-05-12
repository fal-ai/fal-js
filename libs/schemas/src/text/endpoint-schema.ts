// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import { z } from "zod";

import {
  zCohereTranscribeInput,
  zElevenlabsSpeechToTextInput,
  zElevenlabsSpeechToTextScribeV2Input,
  zNemotron3NanoOmniAudioInput,
  zNemotron3NanoOmniVideoInput,
  zNemotron3NanoOmniVisionInput,
  zQueueStatus,
  zRouterVideoEnterpriseInput,
  zRouterVideoInput,
  zSileroVadInput,
  zSmartTurnInput,
  zSpeechToTextInput,
  zSpeechToTextStreamInput,
  zSpeechToTextTurboInput,
  zSpeechToTextTurboStreamInput,
  zWizperInput,
} from "./zod.gen";

/** Zod schema for text endpoints using discriminatedUnion */
export const TextEndpointSchema = z.discriminatedUnion("endpoint", [
  z.object({
    endpoint: z.literal("fal-ai/cohere-transcribe"),
    input: zCohereTranscribeInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/elevenlabs/speech-to-text"),
    input: zElevenlabsSpeechToTextInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/elevenlabs/speech-to-text/scribe-v2"),
    input: zElevenlabsSpeechToTextScribeV2Input,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/silero-vad"),
    input: zSileroVadInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/smart-turn"),
    input: zSmartTurnInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/speech-to-text"),
    input: zSpeechToTextInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/speech-to-text/stream"),
    input: zSpeechToTextStreamInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/speech-to-text/turbo"),
    input: zSpeechToTextTurboInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/speech-to-text/turbo/stream"),
    input: zSpeechToTextTurboStreamInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/wizper"),
    input: zWizperInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("nvidia/nemotron-3-nano-omni/audio"),
    input: zNemotron3NanoOmniAudioInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("nvidia/nemotron-3-nano-omni/video"),
    input: zNemotron3NanoOmniVideoInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("nvidia/nemotron-3-nano-omni/vision"),
    input: zNemotron3NanoOmniVisionInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("openrouter/router/video"),
    input: zRouterVideoInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("openrouter/router/video/enterprise"),
    input: zRouterVideoEnterpriseInput,
    output: zQueueStatus,
  }),
]);

/** Inferred type from TextEndpointSchema */
export type TextEndpoint = z.infer<typeof TextEndpointSchema>;
