// AUTO-GENERATED - Do not edit manually
// Generated from types.gen.ts via scripts/generate-endpoint-maps.ts

import { z } from "zod";

import {
  zChatterboxSpeechToSpeechInput,
  zChatterboxSpeechToSpeechOutput,
  zChatterboxTextToSpeechInput,
  zChatterboxTextToSpeechMultilingualInput,
  zChatterboxTextToSpeechMultilingualOutput,
  zChatterboxTextToSpeechOutput,
  zChatterboxhdSpeechToSpeechInput,
  zChatterboxhdSpeechToSpeechOutput,
  zChatterboxhdTextToSpeechInput,
  zChatterboxhdTextToSpeechOutput,
  zDiaTtsInput,
  zDiaTtsOutput,
  zElevenlabsTtsTurboV25Input,
  zElevenlabsTtsTurboV25Output,
  zIndexTts2TextToSpeechInput,
  zIndexTts2TextToSpeechOutput,
  zKlingVideoV1TtsInput,
  zKlingVideoV1TtsOutput,
  zMayaBatchInput,
  zMayaBatchOutput,
  zMayaInput,
  zMayaOutput,
  zMayaStreamInput,
  zMayaStreamOutput,
  zMinimaxPreviewSpeech25HdInput,
  zMinimaxPreviewSpeech25HdOutput,
  zMinimaxPreviewSpeech25TurboInput,
  zMinimaxPreviewSpeech25TurboOutput,
  zMinimaxSpeech02HdInput,
  zMinimaxSpeech02HdOutput,
  zMinimaxSpeech02TurboInput,
  zMinimaxSpeech02TurboOutput,
  zMinimaxSpeech26HdInput,
  zMinimaxSpeech26HdOutput,
  zMinimaxSpeech26TurboInput,
  zMinimaxSpeech26TurboOutput,
  zMinimaxVoiceCloneInput,
  zMinimaxVoiceCloneOutput,
  zMinimaxVoiceDesignInput,
  zMinimaxVoiceDesignOutput,
  zOrpheusTtsInput,
  zOrpheusTtsOutput,
  zQwen3TtsTextToSpeech06bInput,
  zQwen3TtsTextToSpeech06bOutput,
  zQwen3TtsTextToSpeech17bInput,
  zQwen3TtsTextToSpeech17bOutput,
  zQwen3TtsVoiceDesign17bInput,
  zQwen3TtsVoiceDesign17bOutput,
  zVibevoice05bInput,
  zVibevoice05bOutput,
  zVibevoice7bInput,
  zVibevoice7bOutput,
  zVibevoiceInput,
  zVibevoiceOutput,
} from "./zod.gen";

/** Zod schema for speech endpoints using discriminatedUnion */
export const SpeechEndpointSchema = z.discriminatedUnion("endpoint", [
  z.object({
    endpoint: z.literal("resemble-ai/chatterboxhd/speech-to-speech"),
    input: zChatterboxhdSpeechToSpeechInput,
    output: zChatterboxhdSpeechToSpeechOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/chatterbox/speech-to-speech"),
    input: zChatterboxSpeechToSpeechInput,
    output: zChatterboxSpeechToSpeechOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/qwen-3-tts/voice-design/1.7b"),
    input: zQwen3TtsVoiceDesign17bInput,
    output: zQwen3TtsVoiceDesign17bOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/qwen-3-tts/text-to-speech/1.7b"),
    input: zQwen3TtsTextToSpeech17bInput,
    output: zQwen3TtsTextToSpeech17bOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/qwen-3-tts/text-to-speech/0.6b"),
    input: zQwen3TtsTextToSpeech06bInput,
    output: zQwen3TtsTextToSpeech06bOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/vibevoice/0.5b"),
    input: zVibevoice05bInput,
    output: zVibevoice05bOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/maya/batch"),
    input: zMayaBatchInput,
    output: zMayaBatchOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/maya/stream"),
    input: zMayaStreamInput,
    output: zMayaStreamOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/maya"),
    input: zMayaInput,
    output: zMayaOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/minimax/speech-2.6-turbo"),
    input: zMinimaxSpeech26TurboInput,
    output: zMinimaxSpeech26TurboOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/minimax/speech-2.6-hd"),
    input: zMinimaxSpeech26HdInput,
    output: zMinimaxSpeech26HdOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/index-tts-2/text-to-speech"),
    input: zIndexTts2TextToSpeechInput,
    output: zIndexTts2TextToSpeechOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/kling-video/v1/tts"),
    input: zKlingVideoV1TtsInput,
    output: zKlingVideoV1TtsOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/chatterbox/text-to-speech/multilingual"),
    input: zChatterboxTextToSpeechMultilingualInput,
    output: zChatterboxTextToSpeechMultilingualOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/vibevoice/7b"),
    input: zVibevoice7bInput,
    output: zVibevoice7bOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/vibevoice"),
    input: zVibevoiceInput,
    output: zVibevoiceOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/minimax/preview/speech-2.5-hd"),
    input: zMinimaxPreviewSpeech25HdInput,
    output: zMinimaxPreviewSpeech25HdOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/minimax/preview/speech-2.5-turbo"),
    input: zMinimaxPreviewSpeech25TurboInput,
    output: zMinimaxPreviewSpeech25TurboOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/minimax/voice-design"),
    input: zMinimaxVoiceDesignInput,
    output: zMinimaxVoiceDesignOutput,
  }),
  z.object({
    endpoint: z.literal("resemble-ai/chatterboxhd/text-to-speech"),
    input: zChatterboxhdTextToSpeechInput,
    output: zChatterboxhdTextToSpeechOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/chatterbox/text-to-speech"),
    input: zChatterboxTextToSpeechInput,
    output: zChatterboxTextToSpeechOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/minimax/voice-clone"),
    input: zMinimaxVoiceCloneInput,
    output: zMinimaxVoiceCloneOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/minimax/speech-02-turbo"),
    input: zMinimaxSpeech02TurboInput,
    output: zMinimaxSpeech02TurboOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/minimax/speech-02-hd"),
    input: zMinimaxSpeech02HdInput,
    output: zMinimaxSpeech02HdOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/dia-tts"),
    input: zDiaTtsInput,
    output: zDiaTtsOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/orpheus-tts"),
    input: zOrpheusTtsInput,
    output: zOrpheusTtsOutput,
  }),
  z.object({
    endpoint: z.literal("fal-ai/elevenlabs/tts/turbo-v2.5"),
    input: zElevenlabsTtsTurboV25Input,
    output: zElevenlabsTtsTurboV25Output,
  }),
]);

/** Inferred type from SpeechEndpointSchema */
export type SpeechEndpoint = z.infer<typeof SpeechEndpointSchema>;
