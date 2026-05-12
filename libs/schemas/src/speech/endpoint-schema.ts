// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

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
  zGemini31FlashTtsInput,
  zGemini31FlashTtsOutput,
  zIndexTts2TextToSpeechInput,
  zIndexTts2TextToSpeechOutput,
  zInworldTtsInput,
  zInworldTtsOutput,
  zKlingVideoV1TtsInput,
  zKlingVideoV1TtsOutput,
  zLuxTtsInput,
  zLuxTtsOutput,
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
  zMinimaxSpeech28HdInput,
  zMinimaxSpeech28HdOutput,
  zMinimaxSpeech28TurboInput,
  zMinimaxSpeech28TurboOutput,
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
  zTtsV1Input,
  zTtsV1Output,
  zVibevoice05bInput,
  zVibevoice05bOutput,
  zVibevoice7bInput,
  zVibevoice7bOutput,
  zVibevoiceInput,
  zVibevoiceOutput,
} from "./zod.gen.js";

/** Map of speech endpoint id -> Zod input/output schemas. */
export const speechEndpoints: {
  readonly "fal-ai/chatterbox/speech-to-speech": {
    readonly input: typeof zChatterboxSpeechToSpeechInput;
    readonly output: typeof zChatterboxSpeechToSpeechOutput;
  };
  readonly "fal-ai/chatterbox/text-to-speech": {
    readonly input: typeof zChatterboxTextToSpeechInput;
    readonly output: typeof zChatterboxTextToSpeechOutput;
  };
  readonly "fal-ai/chatterbox/text-to-speech/multilingual": {
    readonly input: typeof zChatterboxTextToSpeechMultilingualInput;
    readonly output: typeof zChatterboxTextToSpeechMultilingualOutput;
  };
  readonly "fal-ai/dia-tts": {
    readonly input: typeof zDiaTtsInput;
    readonly output: typeof zDiaTtsOutput;
  };
  readonly "fal-ai/elevenlabs/tts/turbo-v2.5": {
    readonly input: typeof zElevenlabsTtsTurboV25Input;
    readonly output: typeof zElevenlabsTtsTurboV25Output;
  };
  readonly "fal-ai/gemini-3.1-flash-tts": {
    readonly input: typeof zGemini31FlashTtsInput;
    readonly output: typeof zGemini31FlashTtsOutput;
  };
  readonly "fal-ai/index-tts-2/text-to-speech": {
    readonly input: typeof zIndexTts2TextToSpeechInput;
    readonly output: typeof zIndexTts2TextToSpeechOutput;
  };
  readonly "fal-ai/inworld-tts": {
    readonly input: typeof zInworldTtsInput;
    readonly output: typeof zInworldTtsOutput;
  };
  readonly "fal-ai/kling-video/v1/tts": {
    readonly input: typeof zKlingVideoV1TtsInput;
    readonly output: typeof zKlingVideoV1TtsOutput;
  };
  readonly "fal-ai/lux-tts": {
    readonly input: typeof zLuxTtsInput;
    readonly output: typeof zLuxTtsOutput;
  };
  readonly "fal-ai/maya": {
    readonly input: typeof zMayaInput;
    readonly output: typeof zMayaOutput;
  };
  readonly "fal-ai/maya/batch": {
    readonly input: typeof zMayaBatchInput;
    readonly output: typeof zMayaBatchOutput;
  };
  readonly "fal-ai/maya/stream": {
    readonly input: typeof zMayaStreamInput;
    readonly output: typeof zMayaStreamOutput;
  };
  readonly "fal-ai/minimax/preview/speech-2.5-hd": {
    readonly input: typeof zMinimaxPreviewSpeech25HdInput;
    readonly output: typeof zMinimaxPreviewSpeech25HdOutput;
  };
  readonly "fal-ai/minimax/preview/speech-2.5-turbo": {
    readonly input: typeof zMinimaxPreviewSpeech25TurboInput;
    readonly output: typeof zMinimaxPreviewSpeech25TurboOutput;
  };
  readonly "fal-ai/minimax/speech-02-hd": {
    readonly input: typeof zMinimaxSpeech02HdInput;
    readonly output: typeof zMinimaxSpeech02HdOutput;
  };
  readonly "fal-ai/minimax/speech-02-turbo": {
    readonly input: typeof zMinimaxSpeech02TurboInput;
    readonly output: typeof zMinimaxSpeech02TurboOutput;
  };
  readonly "fal-ai/minimax/speech-2.6-hd": {
    readonly input: typeof zMinimaxSpeech26HdInput;
    readonly output: typeof zMinimaxSpeech26HdOutput;
  };
  readonly "fal-ai/minimax/speech-2.6-turbo": {
    readonly input: typeof zMinimaxSpeech26TurboInput;
    readonly output: typeof zMinimaxSpeech26TurboOutput;
  };
  readonly "fal-ai/minimax/speech-2.8-hd": {
    readonly input: typeof zMinimaxSpeech28HdInput;
    readonly output: typeof zMinimaxSpeech28HdOutput;
  };
  readonly "fal-ai/minimax/speech-2.8-turbo": {
    readonly input: typeof zMinimaxSpeech28TurboInput;
    readonly output: typeof zMinimaxSpeech28TurboOutput;
  };
  readonly "fal-ai/minimax/voice-clone": {
    readonly input: typeof zMinimaxVoiceCloneInput;
    readonly output: typeof zMinimaxVoiceCloneOutput;
  };
  readonly "fal-ai/minimax/voice-design": {
    readonly input: typeof zMinimaxVoiceDesignInput;
    readonly output: typeof zMinimaxVoiceDesignOutput;
  };
  readonly "fal-ai/orpheus-tts": {
    readonly input: typeof zOrpheusTtsInput;
    readonly output: typeof zOrpheusTtsOutput;
  };
  readonly "fal-ai/qwen-3-tts/text-to-speech/0.6b": {
    readonly input: typeof zQwen3TtsTextToSpeech06bInput;
    readonly output: typeof zQwen3TtsTextToSpeech06bOutput;
  };
  readonly "fal-ai/qwen-3-tts/text-to-speech/1.7b": {
    readonly input: typeof zQwen3TtsTextToSpeech17bInput;
    readonly output: typeof zQwen3TtsTextToSpeech17bOutput;
  };
  readonly "fal-ai/qwen-3-tts/voice-design/1.7b": {
    readonly input: typeof zQwen3TtsVoiceDesign17bInput;
    readonly output: typeof zQwen3TtsVoiceDesign17bOutput;
  };
  readonly "fal-ai/vibevoice": {
    readonly input: typeof zVibevoiceInput;
    readonly output: typeof zVibevoiceOutput;
  };
  readonly "fal-ai/vibevoice/0.5b": {
    readonly input: typeof zVibevoice05bInput;
    readonly output: typeof zVibevoice05bOutput;
  };
  readonly "fal-ai/vibevoice/7b": {
    readonly input: typeof zVibevoice7bInput;
    readonly output: typeof zVibevoice7bOutput;
  };
  readonly "resemble-ai/chatterboxhd/speech-to-speech": {
    readonly input: typeof zChatterboxhdSpeechToSpeechInput;
    readonly output: typeof zChatterboxhdSpeechToSpeechOutput;
  };
  readonly "resemble-ai/chatterboxhd/text-to-speech": {
    readonly input: typeof zChatterboxhdTextToSpeechInput;
    readonly output: typeof zChatterboxhdTextToSpeechOutput;
  };
  readonly "xai/tts/v1": {
    readonly input: typeof zTtsV1Input;
    readonly output: typeof zTtsV1Output;
  };
} = {
  "fal-ai/chatterbox/speech-to-speech": {
    input: zChatterboxSpeechToSpeechInput,
    output: zChatterboxSpeechToSpeechOutput,
  },
  "fal-ai/chatterbox/text-to-speech": {
    input: zChatterboxTextToSpeechInput,
    output: zChatterboxTextToSpeechOutput,
  },
  "fal-ai/chatterbox/text-to-speech/multilingual": {
    input: zChatterboxTextToSpeechMultilingualInput,
    output: zChatterboxTextToSpeechMultilingualOutput,
  },
  "fal-ai/dia-tts": { input: zDiaTtsInput, output: zDiaTtsOutput },
  "fal-ai/elevenlabs/tts/turbo-v2.5": {
    input: zElevenlabsTtsTurboV25Input,
    output: zElevenlabsTtsTurboV25Output,
  },
  "fal-ai/gemini-3.1-flash-tts": {
    input: zGemini31FlashTtsInput,
    output: zGemini31FlashTtsOutput,
  },
  "fal-ai/index-tts-2/text-to-speech": {
    input: zIndexTts2TextToSpeechInput,
    output: zIndexTts2TextToSpeechOutput,
  },
  "fal-ai/inworld-tts": { input: zInworldTtsInput, output: zInworldTtsOutput },
  "fal-ai/kling-video/v1/tts": {
    input: zKlingVideoV1TtsInput,
    output: zKlingVideoV1TtsOutput,
  },
  "fal-ai/lux-tts": { input: zLuxTtsInput, output: zLuxTtsOutput },
  "fal-ai/maya": { input: zMayaInput, output: zMayaOutput },
  "fal-ai/maya/batch": { input: zMayaBatchInput, output: zMayaBatchOutput },
  "fal-ai/maya/stream": { input: zMayaStreamInput, output: zMayaStreamOutput },
  "fal-ai/minimax/preview/speech-2.5-hd": {
    input: zMinimaxPreviewSpeech25HdInput,
    output: zMinimaxPreviewSpeech25HdOutput,
  },
  "fal-ai/minimax/preview/speech-2.5-turbo": {
    input: zMinimaxPreviewSpeech25TurboInput,
    output: zMinimaxPreviewSpeech25TurboOutput,
  },
  "fal-ai/minimax/speech-02-hd": {
    input: zMinimaxSpeech02HdInput,
    output: zMinimaxSpeech02HdOutput,
  },
  "fal-ai/minimax/speech-02-turbo": {
    input: zMinimaxSpeech02TurboInput,
    output: zMinimaxSpeech02TurboOutput,
  },
  "fal-ai/minimax/speech-2.6-hd": {
    input: zMinimaxSpeech26HdInput,
    output: zMinimaxSpeech26HdOutput,
  },
  "fal-ai/minimax/speech-2.6-turbo": {
    input: zMinimaxSpeech26TurboInput,
    output: zMinimaxSpeech26TurboOutput,
  },
  "fal-ai/minimax/speech-2.8-hd": {
    input: zMinimaxSpeech28HdInput,
    output: zMinimaxSpeech28HdOutput,
  },
  "fal-ai/minimax/speech-2.8-turbo": {
    input: zMinimaxSpeech28TurboInput,
    output: zMinimaxSpeech28TurboOutput,
  },
  "fal-ai/minimax/voice-clone": {
    input: zMinimaxVoiceCloneInput,
    output: zMinimaxVoiceCloneOutput,
  },
  "fal-ai/minimax/voice-design": {
    input: zMinimaxVoiceDesignInput,
    output: zMinimaxVoiceDesignOutput,
  },
  "fal-ai/orpheus-tts": { input: zOrpheusTtsInput, output: zOrpheusTtsOutput },
  "fal-ai/qwen-3-tts/text-to-speech/0.6b": {
    input: zQwen3TtsTextToSpeech06bInput,
    output: zQwen3TtsTextToSpeech06bOutput,
  },
  "fal-ai/qwen-3-tts/text-to-speech/1.7b": {
    input: zQwen3TtsTextToSpeech17bInput,
    output: zQwen3TtsTextToSpeech17bOutput,
  },
  "fal-ai/qwen-3-tts/voice-design/1.7b": {
    input: zQwen3TtsVoiceDesign17bInput,
    output: zQwen3TtsVoiceDesign17bOutput,
  },
  "fal-ai/vibevoice": { input: zVibevoiceInput, output: zVibevoiceOutput },
  "fal-ai/vibevoice/0.5b": {
    input: zVibevoice05bInput,
    output: zVibevoice05bOutput,
  },
  "fal-ai/vibevoice/7b": {
    input: zVibevoice7bInput,
    output: zVibevoice7bOutput,
  },
  "resemble-ai/chatterboxhd/speech-to-speech": {
    input: zChatterboxhdSpeechToSpeechInput,
    output: zChatterboxhdSpeechToSpeechOutput,
  },
  "resemble-ai/chatterboxhd/text-to-speech": {
    input: zChatterboxhdTextToSpeechInput,
    output: zChatterboxhdTextToSpeechOutput,
  },
  "xai/tts/v1": { input: zTtsV1Input, output: zTtsV1Output },
};

/** Union of valid speech endpoint ids. */
export type SpeechEndpointId = keyof typeof speechEndpoints;
