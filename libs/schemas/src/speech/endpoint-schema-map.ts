// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import {
  ChatterboxSpeechToSpeechInputSchema,
  ChatterboxSpeechToSpeechOutputSchema,
  ChatterboxTextToSpeechInputSchema,
  ChatterboxTextToSpeechMultilingualInputSchema,
  ChatterboxTextToSpeechMultilingualOutputSchema,
  ChatterboxTextToSpeechOutputSchema,
  ChatterboxhdSpeechToSpeechInputSchema,
  ChatterboxhdSpeechToSpeechOutputSchema,
  ChatterboxhdTextToSpeechInputSchema,
  ChatterboxhdTextToSpeechOutputSchema,
  DiaTtsInputSchema,
  DiaTtsOutputSchema,
  ElevenlabsTtsTurboV25InputSchema,
  ElevenlabsTtsTurboV25OutputSchema,
  Gemini31FlashTtsInputSchema,
  Gemini31FlashTtsOutputSchema,
  IndexTts2TextToSpeechInputSchema,
  IndexTts2TextToSpeechOutputSchema,
  InworldTtsInputSchema,
  InworldTtsOutputSchema,
  KlingVideoV1TtsInputSchema,
  KlingVideoV1TtsOutputSchema,
  LuxTtsInputSchema,
  LuxTtsOutputSchema,
  MayaBatchInputSchema,
  MayaBatchOutputSchema,
  MayaInputSchema,
  MayaOutputSchema,
  MayaStreamInputSchema,
  MayaStreamOutputSchema,
  MinimaxPreviewSpeech25HdInputSchema,
  MinimaxPreviewSpeech25HdOutputSchema,
  MinimaxPreviewSpeech25TurboInputSchema,
  MinimaxPreviewSpeech25TurboOutputSchema,
  MinimaxSpeech02HdInputSchema,
  MinimaxSpeech02HdOutputSchema,
  MinimaxSpeech02TurboInputSchema,
  MinimaxSpeech02TurboOutputSchema,
  MinimaxSpeech26HdInputSchema,
  MinimaxSpeech26HdOutputSchema,
  MinimaxSpeech26TurboInputSchema,
  MinimaxSpeech26TurboOutputSchema,
  MinimaxSpeech28HdInputSchema,
  MinimaxSpeech28HdOutputSchema,
  MinimaxSpeech28TurboInputSchema,
  MinimaxSpeech28TurboOutputSchema,
  MinimaxVoiceCloneInputSchema,
  MinimaxVoiceCloneOutputSchema,
  MinimaxVoiceDesignInputSchema,
  MinimaxVoiceDesignOutputSchema,
  OrpheusTtsInputSchema,
  OrpheusTtsOutputSchema,
  Qwen3TtsTextToSpeech06bInputSchema,
  Qwen3TtsTextToSpeech06bOutputSchema,
  Qwen3TtsTextToSpeech17bInputSchema,
  Qwen3TtsTextToSpeech17bOutputSchema,
  Qwen3TtsVoiceDesign17bInputSchema,
  Qwen3TtsVoiceDesign17bOutputSchema,
  TtsV1InputSchema,
  TtsV1OutputSchema,
  Vibevoice05bInputSchema,
  Vibevoice05bOutputSchema,
  Vibevoice7bInputSchema,
  Vibevoice7bOutputSchema,
  VibevoiceInputSchema,
  VibevoiceOutputSchema,
} from "./schemas.gen.js";

/**
 * Map of speech endpoint id -> self-contained JSON Schemas.
 * Each input/output schema bundles its $ref closure under `$defs`, so it
 * can be handed directly to LLM tool APIs or `z.fromJSONSchema`.
 */
export const speechEndpointSchemaMap: {
  readonly "fal-ai/chatterbox/speech-to-speech": {
    readonly input: typeof ChatterboxSpeechToSpeechInputSchema;
    readonly output: typeof ChatterboxSpeechToSpeechOutputSchema;
  };
  readonly "fal-ai/chatterbox/text-to-speech": {
    readonly input: typeof ChatterboxTextToSpeechInputSchema;
    readonly output: typeof ChatterboxTextToSpeechOutputSchema;
  };
  readonly "fal-ai/chatterbox/text-to-speech/multilingual": {
    readonly input: typeof ChatterboxTextToSpeechMultilingualInputSchema;
    readonly output: typeof ChatterboxTextToSpeechMultilingualOutputSchema;
  };
  readonly "fal-ai/dia-tts": {
    readonly input: typeof DiaTtsInputSchema;
    readonly output: typeof DiaTtsOutputSchema;
  };
  readonly "fal-ai/elevenlabs/tts/turbo-v2.5": {
    readonly input: typeof ElevenlabsTtsTurboV25InputSchema;
    readonly output: typeof ElevenlabsTtsTurboV25OutputSchema;
  };
  readonly "fal-ai/gemini-3.1-flash-tts": {
    readonly input: typeof Gemini31FlashTtsInputSchema;
    readonly output: typeof Gemini31FlashTtsOutputSchema;
  };
  readonly "fal-ai/index-tts-2/text-to-speech": {
    readonly input: typeof IndexTts2TextToSpeechInputSchema;
    readonly output: typeof IndexTts2TextToSpeechOutputSchema;
  };
  readonly "fal-ai/inworld-tts": {
    readonly input: typeof InworldTtsInputSchema;
    readonly output: typeof InworldTtsOutputSchema;
  };
  readonly "fal-ai/kling-video/v1/tts": {
    readonly input: typeof KlingVideoV1TtsInputSchema;
    readonly output: typeof KlingVideoV1TtsOutputSchema;
  };
  readonly "fal-ai/lux-tts": {
    readonly input: typeof LuxTtsInputSchema;
    readonly output: typeof LuxTtsOutputSchema;
  };
  readonly "fal-ai/maya": {
    readonly input: typeof MayaInputSchema;
    readonly output: typeof MayaOutputSchema;
  };
  readonly "fal-ai/maya/batch": {
    readonly input: typeof MayaBatchInputSchema;
    readonly output: typeof MayaBatchOutputSchema;
  };
  readonly "fal-ai/maya/stream": {
    readonly input: typeof MayaStreamInputSchema;
    readonly output: typeof MayaStreamOutputSchema;
  };
  readonly "fal-ai/minimax/preview/speech-2.5-hd": {
    readonly input: typeof MinimaxPreviewSpeech25HdInputSchema;
    readonly output: typeof MinimaxPreviewSpeech25HdOutputSchema;
  };
  readonly "fal-ai/minimax/preview/speech-2.5-turbo": {
    readonly input: typeof MinimaxPreviewSpeech25TurboInputSchema;
    readonly output: typeof MinimaxPreviewSpeech25TurboOutputSchema;
  };
  readonly "fal-ai/minimax/speech-02-hd": {
    readonly input: typeof MinimaxSpeech02HdInputSchema;
    readonly output: typeof MinimaxSpeech02HdOutputSchema;
  };
  readonly "fal-ai/minimax/speech-02-turbo": {
    readonly input: typeof MinimaxSpeech02TurboInputSchema;
    readonly output: typeof MinimaxSpeech02TurboOutputSchema;
  };
  readonly "fal-ai/minimax/speech-2.6-hd": {
    readonly input: typeof MinimaxSpeech26HdInputSchema;
    readonly output: typeof MinimaxSpeech26HdOutputSchema;
  };
  readonly "fal-ai/minimax/speech-2.6-turbo": {
    readonly input: typeof MinimaxSpeech26TurboInputSchema;
    readonly output: typeof MinimaxSpeech26TurboOutputSchema;
  };
  readonly "fal-ai/minimax/speech-2.8-hd": {
    readonly input: typeof MinimaxSpeech28HdInputSchema;
    readonly output: typeof MinimaxSpeech28HdOutputSchema;
  };
  readonly "fal-ai/minimax/speech-2.8-turbo": {
    readonly input: typeof MinimaxSpeech28TurboInputSchema;
    readonly output: typeof MinimaxSpeech28TurboOutputSchema;
  };
  readonly "fal-ai/minimax/voice-clone": {
    readonly input: typeof MinimaxVoiceCloneInputSchema;
    readonly output: typeof MinimaxVoiceCloneOutputSchema;
  };
  readonly "fal-ai/minimax/voice-design": {
    readonly input: typeof MinimaxVoiceDesignInputSchema;
    readonly output: typeof MinimaxVoiceDesignOutputSchema;
  };
  readonly "fal-ai/orpheus-tts": {
    readonly input: typeof OrpheusTtsInputSchema;
    readonly output: typeof OrpheusTtsOutputSchema;
  };
  readonly "fal-ai/qwen-3-tts/text-to-speech/0.6b": {
    readonly input: typeof Qwen3TtsTextToSpeech06bInputSchema;
    readonly output: typeof Qwen3TtsTextToSpeech06bOutputSchema;
  };
  readonly "fal-ai/qwen-3-tts/text-to-speech/1.7b": {
    readonly input: typeof Qwen3TtsTextToSpeech17bInputSchema;
    readonly output: typeof Qwen3TtsTextToSpeech17bOutputSchema;
  };
  readonly "fal-ai/qwen-3-tts/voice-design/1.7b": {
    readonly input: typeof Qwen3TtsVoiceDesign17bInputSchema;
    readonly output: typeof Qwen3TtsVoiceDesign17bOutputSchema;
  };
  readonly "fal-ai/vibevoice": {
    readonly input: typeof VibevoiceInputSchema;
    readonly output: typeof VibevoiceOutputSchema;
  };
  readonly "fal-ai/vibevoice/0.5b": {
    readonly input: typeof Vibevoice05bInputSchema;
    readonly output: typeof Vibevoice05bOutputSchema;
  };
  readonly "fal-ai/vibevoice/7b": {
    readonly input: typeof Vibevoice7bInputSchema;
    readonly output: typeof Vibevoice7bOutputSchema;
  };
  readonly "resemble-ai/chatterboxhd/speech-to-speech": {
    readonly input: typeof ChatterboxhdSpeechToSpeechInputSchema;
    readonly output: typeof ChatterboxhdSpeechToSpeechOutputSchema;
  };
  readonly "resemble-ai/chatterboxhd/text-to-speech": {
    readonly input: typeof ChatterboxhdTextToSpeechInputSchema;
    readonly output: typeof ChatterboxhdTextToSpeechOutputSchema;
  };
  readonly "xai/tts/v1": {
    readonly input: typeof TtsV1InputSchema;
    readonly output: typeof TtsV1OutputSchema;
  };
} = {
  "fal-ai/chatterbox/speech-to-speech": {
    input: ChatterboxSpeechToSpeechInputSchema,
    output: ChatterboxSpeechToSpeechOutputSchema,
  },
  "fal-ai/chatterbox/text-to-speech": {
    input: ChatterboxTextToSpeechInputSchema,
    output: ChatterboxTextToSpeechOutputSchema,
  },
  "fal-ai/chatterbox/text-to-speech/multilingual": {
    input: ChatterboxTextToSpeechMultilingualInputSchema,
    output: ChatterboxTextToSpeechMultilingualOutputSchema,
  },
  "fal-ai/dia-tts": { input: DiaTtsInputSchema, output: DiaTtsOutputSchema },
  "fal-ai/elevenlabs/tts/turbo-v2.5": {
    input: ElevenlabsTtsTurboV25InputSchema,
    output: ElevenlabsTtsTurboV25OutputSchema,
  },
  "fal-ai/gemini-3.1-flash-tts": {
    input: Gemini31FlashTtsInputSchema,
    output: Gemini31FlashTtsOutputSchema,
  },
  "fal-ai/index-tts-2/text-to-speech": {
    input: IndexTts2TextToSpeechInputSchema,
    output: IndexTts2TextToSpeechOutputSchema,
  },
  "fal-ai/inworld-tts": {
    input: InworldTtsInputSchema,
    output: InworldTtsOutputSchema,
  },
  "fal-ai/kling-video/v1/tts": {
    input: KlingVideoV1TtsInputSchema,
    output: KlingVideoV1TtsOutputSchema,
  },
  "fal-ai/lux-tts": { input: LuxTtsInputSchema, output: LuxTtsOutputSchema },
  "fal-ai/maya": { input: MayaInputSchema, output: MayaOutputSchema },
  "fal-ai/maya/batch": {
    input: MayaBatchInputSchema,
    output: MayaBatchOutputSchema,
  },
  "fal-ai/maya/stream": {
    input: MayaStreamInputSchema,
    output: MayaStreamOutputSchema,
  },
  "fal-ai/minimax/preview/speech-2.5-hd": {
    input: MinimaxPreviewSpeech25HdInputSchema,
    output: MinimaxPreviewSpeech25HdOutputSchema,
  },
  "fal-ai/minimax/preview/speech-2.5-turbo": {
    input: MinimaxPreviewSpeech25TurboInputSchema,
    output: MinimaxPreviewSpeech25TurboOutputSchema,
  },
  "fal-ai/minimax/speech-02-hd": {
    input: MinimaxSpeech02HdInputSchema,
    output: MinimaxSpeech02HdOutputSchema,
  },
  "fal-ai/minimax/speech-02-turbo": {
    input: MinimaxSpeech02TurboInputSchema,
    output: MinimaxSpeech02TurboOutputSchema,
  },
  "fal-ai/minimax/speech-2.6-hd": {
    input: MinimaxSpeech26HdInputSchema,
    output: MinimaxSpeech26HdOutputSchema,
  },
  "fal-ai/minimax/speech-2.6-turbo": {
    input: MinimaxSpeech26TurboInputSchema,
    output: MinimaxSpeech26TurboOutputSchema,
  },
  "fal-ai/minimax/speech-2.8-hd": {
    input: MinimaxSpeech28HdInputSchema,
    output: MinimaxSpeech28HdOutputSchema,
  },
  "fal-ai/minimax/speech-2.8-turbo": {
    input: MinimaxSpeech28TurboInputSchema,
    output: MinimaxSpeech28TurboOutputSchema,
  },
  "fal-ai/minimax/voice-clone": {
    input: MinimaxVoiceCloneInputSchema,
    output: MinimaxVoiceCloneOutputSchema,
  },
  "fal-ai/minimax/voice-design": {
    input: MinimaxVoiceDesignInputSchema,
    output: MinimaxVoiceDesignOutputSchema,
  },
  "fal-ai/orpheus-tts": {
    input: OrpheusTtsInputSchema,
    output: OrpheusTtsOutputSchema,
  },
  "fal-ai/qwen-3-tts/text-to-speech/0.6b": {
    input: Qwen3TtsTextToSpeech06bInputSchema,
    output: Qwen3TtsTextToSpeech06bOutputSchema,
  },
  "fal-ai/qwen-3-tts/text-to-speech/1.7b": {
    input: Qwen3TtsTextToSpeech17bInputSchema,
    output: Qwen3TtsTextToSpeech17bOutputSchema,
  },
  "fal-ai/qwen-3-tts/voice-design/1.7b": {
    input: Qwen3TtsVoiceDesign17bInputSchema,
    output: Qwen3TtsVoiceDesign17bOutputSchema,
  },
  "fal-ai/vibevoice": {
    input: VibevoiceInputSchema,
    output: VibevoiceOutputSchema,
  },
  "fal-ai/vibevoice/0.5b": {
    input: Vibevoice05bInputSchema,
    output: Vibevoice05bOutputSchema,
  },
  "fal-ai/vibevoice/7b": {
    input: Vibevoice7bInputSchema,
    output: Vibevoice7bOutputSchema,
  },
  "resemble-ai/chatterboxhd/speech-to-speech": {
    input: ChatterboxhdSpeechToSpeechInputSchema,
    output: ChatterboxhdSpeechToSpeechOutputSchema,
  },
  "resemble-ai/chatterboxhd/text-to-speech": {
    input: ChatterboxhdTextToSpeechInputSchema,
    output: ChatterboxhdTextToSpeechOutputSchema,
  },
  "xai/tts/v1": { input: TtsV1InputSchema, output: TtsV1OutputSchema },
};
