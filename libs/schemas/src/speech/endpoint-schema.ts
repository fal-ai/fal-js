// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import { z } from "zod";

import {
  zChatterboxSpeechToSpeechInput,
  zChatterboxTextToSpeechInput,
  zChatterboxTextToSpeechMultilingualInput,
  zChatterboxhdSpeechToSpeechInput,
  zChatterboxhdTextToSpeechInput,
  zDiaTtsInput,
  zElevenlabsTtsTurboV25Input,
  zGemini31FlashTtsInput,
  zIndexTts2TextToSpeechInput,
  zInworldTtsInput,
  zKlingVideoV1TtsInput,
  zLuxTtsInput,
  zMayaBatchInput,
  zMayaInput,
  zMayaStreamInput,
  zMinimaxPreviewSpeech25HdInput,
  zMinimaxPreviewSpeech25TurboInput,
  zMinimaxSpeech02HdInput,
  zMinimaxSpeech02TurboInput,
  zMinimaxSpeech26HdInput,
  zMinimaxSpeech26TurboInput,
  zMinimaxSpeech28HdInput,
  zMinimaxSpeech28TurboInput,
  zMinimaxVoiceCloneInput,
  zMinimaxVoiceDesignInput,
  zOrpheusTtsInput,
  zQueueStatus,
  zQwen3TtsTextToSpeech06bInput,
  zQwen3TtsTextToSpeech17bInput,
  zQwen3TtsVoiceDesign17bInput,
  zTtsV1Input,
  zVibevoice05bInput,
  zVibevoice7bInput,
  zVibevoiceInput,
} from "./zod.gen";

/** Zod schema for speech endpoints using discriminatedUnion */
export const SpeechEndpointSchema = z.discriminatedUnion("endpoint", [
  z.object({
    endpoint: z.literal("fal-ai/chatterbox/speech-to-speech"),
    input: zChatterboxSpeechToSpeechInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/chatterbox/text-to-speech"),
    input: zChatterboxTextToSpeechInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/chatterbox/text-to-speech/multilingual"),
    input: zChatterboxTextToSpeechMultilingualInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/dia-tts"),
    input: zDiaTtsInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/elevenlabs/tts/turbo-v2.5"),
    input: zElevenlabsTtsTurboV25Input,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/gemini-3.1-flash-tts"),
    input: zGemini31FlashTtsInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/index-tts-2/text-to-speech"),
    input: zIndexTts2TextToSpeechInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/inworld-tts"),
    input: zInworldTtsInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/kling-video/v1/tts"),
    input: zKlingVideoV1TtsInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/lux-tts"),
    input: zLuxTtsInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/maya"),
    input: zMayaInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/maya/batch"),
    input: zMayaBatchInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/maya/stream"),
    input: zMayaStreamInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/minimax/preview/speech-2.5-hd"),
    input: zMinimaxPreviewSpeech25HdInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/minimax/preview/speech-2.5-turbo"),
    input: zMinimaxPreviewSpeech25TurboInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/minimax/speech-02-hd"),
    input: zMinimaxSpeech02HdInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/minimax/speech-02-turbo"),
    input: zMinimaxSpeech02TurboInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/minimax/speech-2.6-hd"),
    input: zMinimaxSpeech26HdInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/minimax/speech-2.6-turbo"),
    input: zMinimaxSpeech26TurboInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/minimax/speech-2.8-hd"),
    input: zMinimaxSpeech28HdInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/minimax/speech-2.8-turbo"),
    input: zMinimaxSpeech28TurboInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/minimax/voice-clone"),
    input: zMinimaxVoiceCloneInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/minimax/voice-design"),
    input: zMinimaxVoiceDesignInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/orpheus-tts"),
    input: zOrpheusTtsInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/qwen-3-tts/text-to-speech/0.6b"),
    input: zQwen3TtsTextToSpeech06bInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/qwen-3-tts/text-to-speech/1.7b"),
    input: zQwen3TtsTextToSpeech17bInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/qwen-3-tts/voice-design/1.7b"),
    input: zQwen3TtsVoiceDesign17bInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/vibevoice"),
    input: zVibevoiceInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/vibevoice/0.5b"),
    input: zVibevoice05bInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("fal-ai/vibevoice/7b"),
    input: zVibevoice7bInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("resemble-ai/chatterboxhd/speech-to-speech"),
    input: zChatterboxhdSpeechToSpeechInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("resemble-ai/chatterboxhd/text-to-speech"),
    input: zChatterboxhdTextToSpeechInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("xai/tts/v1"),
    input: zTtsV1Input,
    output: zQueueStatus,
  }),
]);

/** Inferred type from SpeechEndpointSchema */
export type SpeechEndpoint = z.infer<typeof SpeechEndpointSchema>;
