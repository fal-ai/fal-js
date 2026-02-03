// AUTO-GENERATED - Do not edit manually
// Generated from types.gen.ts via scripts/generate-endpoint-maps.ts

import { z } from "zod";

import {
  zAiDetectorDetectTextInput,
  zAiDetectorDetectTextOutput,
  zElevenlabsSpeechToTextInput,
  zElevenlabsSpeechToTextOutput,
  zElevenlabsSpeechToTextScribeV2Input,
  zElevenlabsSpeechToTextScribeV2Output,
  zNemotronAsrInput,
  zNemotronAsrOutput,
  zNemotronAsrStreamInput,
  zNemotronAsrStreamOutput,
  zRouterVideoEnterpriseInput,
  zRouterVideoEnterpriseOutput,
  zRouterVideoInput,
  zRouterVideoOutput,
  zSileroVadInput,
  zSileroVadOutput,
  zSmartTurnInput,
  zSmartTurnOutput,
  zSpeechToTextInput,
  zSpeechToTextOutput,
  zSpeechToTextStreamInput,
  zSpeechToTextStreamOutput,
  zSpeechToTextTurboInput,
  zSpeechToTextTurboOutput,
  zSpeechToTextTurboStreamInput,
  zSpeechToTextTurboStreamOutput,
  zWhisperInput,
  zWhisperOutput,
  zWizperInput,
  zWizperOutput,
} from "./zod.gen";

/** Zod schema for text endpoints using discriminatedUnion */
export const TextEndpointSchema = z.discriminatedUnion("endpoint", [
  z.object({
    endpoint: z.literal("fal-ai/nemotron/asr/stream"),
    input: zNemotronAsrStreamInput,
    output: zNemotronAsrStreamOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/nemotron/asr"),
    input: zNemotronAsrInput,
    output: zNemotronAsrOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/silero-vad"),
    input: zSileroVadInput,
    output: zSileroVadOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/elevenlabs/speech-to-text/scribe-v2"),
    input: zElevenlabsSpeechToTextScribeV2Input,
    output: zElevenlabsSpeechToTextScribeV2Output,
  }),
  z.object({
    endpoint: z.literal("fal-ai/smart-turn"),
    input: zSmartTurnInput,
    output: zSmartTurnOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/speech-to-text/turbo"),
    input: zSpeechToTextTurboInput,
    output: zSpeechToTextTurboOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/speech-to-text/turbo/stream"),
    input: zSpeechToTextTurboStreamInput,
    output: zSpeechToTextTurboStreamOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/speech-to-text/stream"),
    input: zSpeechToTextStreamInput,
    output: zSpeechToTextStreamOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/speech-to-text"),
    input: zSpeechToTextInput,
    output: zSpeechToTextOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/elevenlabs/speech-to-text"),
    input: zElevenlabsSpeechToTextInput,
    output: zElevenlabsSpeechToTextOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/wizper"),
    input: zWizperInput,
    output: zWizperOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/whisper"),
    input: zWhisperInput,
    output: zWhisperOutput,
  }),
  z.object({
    endpoint: z.literal("half-moon-ai/ai-detector/detect-text"),
    input: zAiDetectorDetectTextInput,
    output: zAiDetectorDetectTextOutput,
  }),
  z.object({
    endpoint: z.literal("openrouter/router/video/enterprise"),
    input: zRouterVideoEnterpriseInput,
    output: zRouterVideoEnterpriseOutput,
  }),
  z.object({
    endpoint: z.literal("openrouter/router/video"),
    input: zRouterVideoInput,
    output: zRouterVideoOutput,
  }),
]);

/** Inferred type from TextEndpointSchema */
export type TextEndpoint = z.infer<typeof TextEndpointSchema>;
