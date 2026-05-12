// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import type { TextEndpointId } from "./endpoint-zod-map.js";
import {
  CohereTranscribeInputSchema,
  CohereTranscribeOutputSchema,
  ElevenlabsSpeechToTextInputSchema,
  ElevenlabsSpeechToTextOutputSchema,
  ElevenlabsSpeechToTextScribeV2InputSchema,
  ElevenlabsSpeechToTextScribeV2OutputSchema,
  Nemotron3NanoOmniAudioInputSchema,
  Nemotron3NanoOmniAudioOutputSchema,
  Nemotron3NanoOmniVideoInputSchema,
  Nemotron3NanoOmniVideoOutputSchema,
  Nemotron3NanoOmniVisionInputSchema,
  Nemotron3NanoOmniVisionOutputSchema,
  RouterVideoEnterpriseInputSchema,
  RouterVideoEnterpriseOutputSchema,
  RouterVideoInputSchema,
  RouterVideoOutputSchema,
  SileroVadInputSchema,
  SileroVadOutputSchema,
  SmartTurnInputSchema,
  SmartTurnOutputSchema,
  SpeechToTextInputSchema,
  SpeechToTextOutputSchema,
  SpeechToTextStreamInputSchema,
  SpeechToTextStreamOutputSchema,
  SpeechToTextTurboInputSchema,
  SpeechToTextTurboOutputSchema,
  SpeechToTextTurboStreamInputSchema,
  SpeechToTextTurboStreamOutputSchema,
  WizperInputSchema,
  WizperOutputSchema,
} from "./schemas.gen.js";

type JsonSchema = Readonly<Record<string, unknown>>;

/**
 * Map of text endpoint id -> self-contained JSON Schemas.
 * Each input/output schema bundles its $ref closure under `$defs`, so it
 * can be handed directly to LLM tool APIs or `z.fromJSONSchema`.
 */
export const textEndpointSchemaMap: Record<
  TextEndpointId,
  { readonly input: JsonSchema; readonly output: JsonSchema }
> = {
  "fal-ai/cohere-transcribe": {
    input: CohereTranscribeInputSchema,
    output: CohereTranscribeOutputSchema,
  },
  "fal-ai/elevenlabs/speech-to-text": {
    input: ElevenlabsSpeechToTextInputSchema,
    output: ElevenlabsSpeechToTextOutputSchema,
  },
  "fal-ai/elevenlabs/speech-to-text/scribe-v2": {
    input: ElevenlabsSpeechToTextScribeV2InputSchema,
    output: ElevenlabsSpeechToTextScribeV2OutputSchema,
  },
  "fal-ai/silero-vad": {
    input: SileroVadInputSchema,
    output: SileroVadOutputSchema,
  },
  "fal-ai/smart-turn": {
    input: SmartTurnInputSchema,
    output: SmartTurnOutputSchema,
  },
  "fal-ai/speech-to-text": {
    input: SpeechToTextInputSchema,
    output: SpeechToTextOutputSchema,
  },
  "fal-ai/speech-to-text/stream": {
    input: SpeechToTextStreamInputSchema,
    output: SpeechToTextStreamOutputSchema,
  },
  "fal-ai/speech-to-text/turbo": {
    input: SpeechToTextTurboInputSchema,
    output: SpeechToTextTurboOutputSchema,
  },
  "fal-ai/speech-to-text/turbo/stream": {
    input: SpeechToTextTurboStreamInputSchema,
    output: SpeechToTextTurboStreamOutputSchema,
  },
  "fal-ai/wizper": { input: WizperInputSchema, output: WizperOutputSchema },
  "nvidia/nemotron-3-nano-omni/audio": {
    input: Nemotron3NanoOmniAudioInputSchema,
    output: Nemotron3NanoOmniAudioOutputSchema,
  },
  "nvidia/nemotron-3-nano-omni/video": {
    input: Nemotron3NanoOmniVideoInputSchema,
    output: Nemotron3NanoOmniVideoOutputSchema,
  },
  "nvidia/nemotron-3-nano-omni/vision": {
    input: Nemotron3NanoOmniVisionInputSchema,
    output: Nemotron3NanoOmniVisionOutputSchema,
  },
  "openrouter/router/video": {
    input: RouterVideoInputSchema,
    output: RouterVideoOutputSchema,
  },
  "openrouter/router/video/enterprise": {
    input: RouterVideoEnterpriseInputSchema,
    output: RouterVideoEnterpriseOutputSchema,
  },
};
