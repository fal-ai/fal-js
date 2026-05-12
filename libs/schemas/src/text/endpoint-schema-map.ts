// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

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

/**
 * Map of text endpoint id -> self-contained JSON Schemas.
 * Each input/output schema bundles its $ref closure under `$defs`, so it
 * can be handed directly to LLM tool APIs or `z.fromJSONSchema`.
 */
export const textEndpointSchemaMap: {
  readonly "fal-ai/cohere-transcribe": {
    readonly input: typeof CohereTranscribeInputSchema;
    readonly output: typeof CohereTranscribeOutputSchema;
  };
  readonly "fal-ai/elevenlabs/speech-to-text": {
    readonly input: typeof ElevenlabsSpeechToTextInputSchema;
    readonly output: typeof ElevenlabsSpeechToTextOutputSchema;
  };
  readonly "fal-ai/elevenlabs/speech-to-text/scribe-v2": {
    readonly input: typeof ElevenlabsSpeechToTextScribeV2InputSchema;
    readonly output: typeof ElevenlabsSpeechToTextScribeV2OutputSchema;
  };
  readonly "fal-ai/silero-vad": {
    readonly input: typeof SileroVadInputSchema;
    readonly output: typeof SileroVadOutputSchema;
  };
  readonly "fal-ai/smart-turn": {
    readonly input: typeof SmartTurnInputSchema;
    readonly output: typeof SmartTurnOutputSchema;
  };
  readonly "fal-ai/speech-to-text": {
    readonly input: typeof SpeechToTextInputSchema;
    readonly output: typeof SpeechToTextOutputSchema;
  };
  readonly "fal-ai/speech-to-text/stream": {
    readonly input: typeof SpeechToTextStreamInputSchema;
    readonly output: typeof SpeechToTextStreamOutputSchema;
  };
  readonly "fal-ai/speech-to-text/turbo": {
    readonly input: typeof SpeechToTextTurboInputSchema;
    readonly output: typeof SpeechToTextTurboOutputSchema;
  };
  readonly "fal-ai/speech-to-text/turbo/stream": {
    readonly input: typeof SpeechToTextTurboStreamInputSchema;
    readonly output: typeof SpeechToTextTurboStreamOutputSchema;
  };
  readonly "fal-ai/wizper": {
    readonly input: typeof WizperInputSchema;
    readonly output: typeof WizperOutputSchema;
  };
  readonly "nvidia/nemotron-3-nano-omni/audio": {
    readonly input: typeof Nemotron3NanoOmniAudioInputSchema;
    readonly output: typeof Nemotron3NanoOmniAudioOutputSchema;
  };
  readonly "nvidia/nemotron-3-nano-omni/video": {
    readonly input: typeof Nemotron3NanoOmniVideoInputSchema;
    readonly output: typeof Nemotron3NanoOmniVideoOutputSchema;
  };
  readonly "nvidia/nemotron-3-nano-omni/vision": {
    readonly input: typeof Nemotron3NanoOmniVisionInputSchema;
    readonly output: typeof Nemotron3NanoOmniVisionOutputSchema;
  };
  readonly "openrouter/router/video": {
    readonly input: typeof RouterVideoInputSchema;
    readonly output: typeof RouterVideoOutputSchema;
  };
  readonly "openrouter/router/video/enterprise": {
    readonly input: typeof RouterVideoEnterpriseInputSchema;
    readonly output: typeof RouterVideoEnterpriseOutputSchema;
  };
} = {
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
