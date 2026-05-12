// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import {
  zAceStepAudioInpaintInput,
  zAceStepAudioInpaintOutput,
  zAceStepAudioOutpaintInput,
  zAceStepAudioOutpaintOutput,
  zAceStepAudioToAudioInput,
  zAceStepAudioToAudioOutput,
  zAceStepInput,
  zAceStepOutput,
  zAceStepPromptToAudioInput,
  zAceStepPromptToAudioOutput,
  zAudioUnderstandingInput,
  zAudioUnderstandingOutput,
  zCsm1bInput,
  zCsm1bOutput,
  zDeepfilternet3Input,
  zDeepfilternet3Output,
  zDemucsInput,
  zDemucsOutput,
  zDiaTtsVoiceCloneInput,
  zDiaTtsVoiceCloneOutput,
  zDiffrhythmInput,
  zDiffrhythmOutput,
  zElevenlabsAudioIsolationInput,
  zElevenlabsAudioIsolationOutput,
  zElevenlabsMusicInput,
  zElevenlabsMusicOutput,
  zElevenlabsSoundEffectsV2Input,
  zElevenlabsSoundEffectsV2Output,
  zElevenlabsTextToDialogueElevenV3Input,
  zElevenlabsTextToDialogueElevenV3Output,
  zElevenlabsTtsElevenV3Input,
  zElevenlabsTtsElevenV3Output,
  zElevenlabsTtsMultilingualV2Input,
  zElevenlabsTtsMultilingualV2Output,
  zElevenlabsVoiceChangerInput,
  zElevenlabsVoiceChangerOutput,
  zF5TtsInput,
  zF5TtsOutput,
  zGeminiTtsInput,
  zGeminiTtsOutput,
  zKlingVideoCreateVoiceInput,
  zKlingVideoCreateVoiceOutput,
  zKlingVideoVideoToAudioInput,
  zKlingVideoVideoToAudioOutput,
  zKokoroAmericanEnglishInput,
  zKokoroAmericanEnglishOutput,
  zKokoroBrazilianPortugueseInput,
  zKokoroBrazilianPortugueseOutput,
  zKokoroBritishEnglishInput,
  zKokoroBritishEnglishOutput,
  zKokoroFrenchInput,
  zKokoroFrenchOutput,
  zKokoroHindiInput,
  zKokoroHindiOutput,
  zKokoroItalianInput,
  zKokoroItalianOutput,
  zKokoroJapaneseInput,
  zKokoroJapaneseOutput,
  zKokoroMandarinChineseInput,
  zKokoroMandarinChineseOutput,
  zKokoroSpanishInput,
  zKokoroSpanishOutput,
  zLavaSrInput,
  zLavaSrOutput,
  zLyria2Input,
  zLyria2Output,
  zMinimaxMusicInput,
  zMinimaxMusicOutput,
  zMinimaxMusicV15Input,
  zMinimaxMusicV15Output,
  zMinimaxMusicV25Input,
  zMinimaxMusicV25Output,
  zMinimaxMusicV26Input,
  zMinimaxMusicV26Output,
  zMinimaxMusicV2Input,
  zMinimaxMusicV2Output,
  zMmaudioV2TextToAudioInput,
  zMmaudioV2TextToAudioOutput,
  zMusicGeneratorInput,
  zMusicGeneratorOutput,
  zNovaSrInput,
  zNovaSrOutput,
  zPersonaplexInput,
  zPersonaplexOutput,
  zPersonaplexRealtimeInput,
  zPersonaplexRealtimeOutput,
  zQwen3TtsCloneVoice06bInput,
  zQwen3TtsCloneVoice06bOutput,
  zQwen3TtsCloneVoice17bInput,
  zQwen3TtsCloneVoice17bOutput,
  zSamAudioSeparateInput,
  zSamAudioSeparateOutput,
  zSamAudioSpanSeparateInput,
  zSamAudioSpanSeparateOutput,
  zSamAudioVisualSeparateInput,
  zSamAudioVisualSeparateOutput,
  zSfxV15VideoToAudioInput,
  zSfxV15VideoToAudioOutput,
  zSfxV1VideoToAudioInput,
  zSfxV1VideoToAudioOutput,
  zSoundEffectsGeneratorInput,
  zSoundEffectsGeneratorOutput,
  zStableAudio25AudioToAudioInput,
  zStableAudio25AudioToAudioOutput,
  zStableAudio25InpaintInput,
  zStableAudio25InpaintOutput,
  zStableAudio25TextToAudioInput,
  zStableAudio25TextToAudioOutput,
  zStableAudioInput,
  zStableAudioOutput,
  zTada1bTextToSpeechInput,
  zTada1bTextToSpeechOutput,
  zTada3bTextToSpeechInput,
  zTada3bTextToSpeechOutput,
  zWorkflowUtilitiesAudioCompressorInput,
  zWorkflowUtilitiesAudioCompressorOutput,
  zWorkflowUtilitiesImpulseResponseInput,
  zWorkflowUtilitiesImpulseResponseOutput,
  zYueInput,
  zYueOutput,
  zZonosInput,
  zZonosOutput,
} from "./zod.gen.js";

/** Map of audio endpoint id -> Zod input/output schemas. */
export const audioEndpoints: {
  readonly "cassetteai/music-generator": {
    readonly input: typeof zMusicGeneratorInput;
    readonly output: typeof zMusicGeneratorOutput;
  };
  readonly "cassetteai/sound-effects-generator": {
    readonly input: typeof zSoundEffectsGeneratorInput;
    readonly output: typeof zSoundEffectsGeneratorOutput;
  };
  readonly "fal-ai/ace-step": {
    readonly input: typeof zAceStepInput;
    readonly output: typeof zAceStepOutput;
  };
  readonly "fal-ai/ace-step/audio-inpaint": {
    readonly input: typeof zAceStepAudioInpaintInput;
    readonly output: typeof zAceStepAudioInpaintOutput;
  };
  readonly "fal-ai/ace-step/audio-outpaint": {
    readonly input: typeof zAceStepAudioOutpaintInput;
    readonly output: typeof zAceStepAudioOutpaintOutput;
  };
  readonly "fal-ai/ace-step/audio-to-audio": {
    readonly input: typeof zAceStepAudioToAudioInput;
    readonly output: typeof zAceStepAudioToAudioOutput;
  };
  readonly "fal-ai/ace-step/prompt-to-audio": {
    readonly input: typeof zAceStepPromptToAudioInput;
    readonly output: typeof zAceStepPromptToAudioOutput;
  };
  readonly "fal-ai/audio-understanding": {
    readonly input: typeof zAudioUnderstandingInput;
    readonly output: typeof zAudioUnderstandingOutput;
  };
  readonly "fal-ai/csm-1b": {
    readonly input: typeof zCsm1bInput;
    readonly output: typeof zCsm1bOutput;
  };
  readonly "fal-ai/deepfilternet3": {
    readonly input: typeof zDeepfilternet3Input;
    readonly output: typeof zDeepfilternet3Output;
  };
  readonly "fal-ai/demucs": {
    readonly input: typeof zDemucsInput;
    readonly output: typeof zDemucsOutput;
  };
  readonly "fal-ai/dia-tts/voice-clone": {
    readonly input: typeof zDiaTtsVoiceCloneInput;
    readonly output: typeof zDiaTtsVoiceCloneOutput;
  };
  readonly "fal-ai/diffrhythm": {
    readonly input: typeof zDiffrhythmInput;
    readonly output: typeof zDiffrhythmOutput;
  };
  readonly "fal-ai/elevenlabs/audio-isolation": {
    readonly input: typeof zElevenlabsAudioIsolationInput;
    readonly output: typeof zElevenlabsAudioIsolationOutput;
  };
  readonly "fal-ai/elevenlabs/music": {
    readonly input: typeof zElevenlabsMusicInput;
    readonly output: typeof zElevenlabsMusicOutput;
  };
  readonly "fal-ai/elevenlabs/sound-effects/v2": {
    readonly input: typeof zElevenlabsSoundEffectsV2Input;
    readonly output: typeof zElevenlabsSoundEffectsV2Output;
  };
  readonly "fal-ai/elevenlabs/text-to-dialogue/eleven-v3": {
    readonly input: typeof zElevenlabsTextToDialogueElevenV3Input;
    readonly output: typeof zElevenlabsTextToDialogueElevenV3Output;
  };
  readonly "fal-ai/elevenlabs/tts/eleven-v3": {
    readonly input: typeof zElevenlabsTtsElevenV3Input;
    readonly output: typeof zElevenlabsTtsElevenV3Output;
  };
  readonly "fal-ai/elevenlabs/tts/multilingual-v2": {
    readonly input: typeof zElevenlabsTtsMultilingualV2Input;
    readonly output: typeof zElevenlabsTtsMultilingualV2Output;
  };
  readonly "fal-ai/elevenlabs/voice-changer": {
    readonly input: typeof zElevenlabsVoiceChangerInput;
    readonly output: typeof zElevenlabsVoiceChangerOutput;
  };
  readonly "fal-ai/f5-tts": {
    readonly input: typeof zF5TtsInput;
    readonly output: typeof zF5TtsOutput;
  };
  readonly "fal-ai/gemini-tts": {
    readonly input: typeof zGeminiTtsInput;
    readonly output: typeof zGeminiTtsOutput;
  };
  readonly "fal-ai/kling-video/create-voice": {
    readonly input: typeof zKlingVideoCreateVoiceInput;
    readonly output: typeof zKlingVideoCreateVoiceOutput;
  };
  readonly "fal-ai/kling-video/video-to-audio": {
    readonly input: typeof zKlingVideoVideoToAudioInput;
    readonly output: typeof zKlingVideoVideoToAudioOutput;
  };
  readonly "fal-ai/kokoro/american-english": {
    readonly input: typeof zKokoroAmericanEnglishInput;
    readonly output: typeof zKokoroAmericanEnglishOutput;
  };
  readonly "fal-ai/kokoro/brazilian-portuguese": {
    readonly input: typeof zKokoroBrazilianPortugueseInput;
    readonly output: typeof zKokoroBrazilianPortugueseOutput;
  };
  readonly "fal-ai/kokoro/british-english": {
    readonly input: typeof zKokoroBritishEnglishInput;
    readonly output: typeof zKokoroBritishEnglishOutput;
  };
  readonly "fal-ai/kokoro/french": {
    readonly input: typeof zKokoroFrenchInput;
    readonly output: typeof zKokoroFrenchOutput;
  };
  readonly "fal-ai/kokoro/hindi": {
    readonly input: typeof zKokoroHindiInput;
    readonly output: typeof zKokoroHindiOutput;
  };
  readonly "fal-ai/kokoro/italian": {
    readonly input: typeof zKokoroItalianInput;
    readonly output: typeof zKokoroItalianOutput;
  };
  readonly "fal-ai/kokoro/japanese": {
    readonly input: typeof zKokoroJapaneseInput;
    readonly output: typeof zKokoroJapaneseOutput;
  };
  readonly "fal-ai/kokoro/mandarin-chinese": {
    readonly input: typeof zKokoroMandarinChineseInput;
    readonly output: typeof zKokoroMandarinChineseOutput;
  };
  readonly "fal-ai/kokoro/spanish": {
    readonly input: typeof zKokoroSpanishInput;
    readonly output: typeof zKokoroSpanishOutput;
  };
  readonly "fal-ai/lava-sr": {
    readonly input: typeof zLavaSrInput;
    readonly output: typeof zLavaSrOutput;
  };
  readonly "fal-ai/lyria2": {
    readonly input: typeof zLyria2Input;
    readonly output: typeof zLyria2Output;
  };
  readonly "fal-ai/minimax-music": {
    readonly input: typeof zMinimaxMusicInput;
    readonly output: typeof zMinimaxMusicOutput;
  };
  readonly "fal-ai/minimax-music/v1.5": {
    readonly input: typeof zMinimaxMusicV15Input;
    readonly output: typeof zMinimaxMusicV15Output;
  };
  readonly "fal-ai/minimax-music/v2": {
    readonly input: typeof zMinimaxMusicV2Input;
    readonly output: typeof zMinimaxMusicV2Output;
  };
  readonly "fal-ai/minimax-music/v2.5": {
    readonly input: typeof zMinimaxMusicV25Input;
    readonly output: typeof zMinimaxMusicV25Output;
  };
  readonly "fal-ai/minimax-music/v2.6": {
    readonly input: typeof zMinimaxMusicV26Input;
    readonly output: typeof zMinimaxMusicV26Output;
  };
  readonly "fal-ai/mmaudio-v2/text-to-audio": {
    readonly input: typeof zMmaudioV2TextToAudioInput;
    readonly output: typeof zMmaudioV2TextToAudioOutput;
  };
  readonly "fal-ai/nova-sr": {
    readonly input: typeof zNovaSrInput;
    readonly output: typeof zNovaSrOutput;
  };
  readonly "fal-ai/personaplex": {
    readonly input: typeof zPersonaplexInput;
    readonly output: typeof zPersonaplexOutput;
  };
  readonly "fal-ai/personaplex/realtime": {
    readonly input: typeof zPersonaplexRealtimeInput;
    readonly output: typeof zPersonaplexRealtimeOutput;
  };
  readonly "fal-ai/qwen-3-tts/clone-voice/0.6b": {
    readonly input: typeof zQwen3TtsCloneVoice06bInput;
    readonly output: typeof zQwen3TtsCloneVoice06bOutput;
  };
  readonly "fal-ai/qwen-3-tts/clone-voice/1.7b": {
    readonly input: typeof zQwen3TtsCloneVoice17bInput;
    readonly output: typeof zQwen3TtsCloneVoice17bOutput;
  };
  readonly "fal-ai/sam-audio/separate": {
    readonly input: typeof zSamAudioSeparateInput;
    readonly output: typeof zSamAudioSeparateOutput;
  };
  readonly "fal-ai/sam-audio/span-separate": {
    readonly input: typeof zSamAudioSpanSeparateInput;
    readonly output: typeof zSamAudioSpanSeparateOutput;
  };
  readonly "fal-ai/sam-audio/visual-separate": {
    readonly input: typeof zSamAudioVisualSeparateInput;
    readonly output: typeof zSamAudioVisualSeparateOutput;
  };
  readonly "fal-ai/stable-audio": {
    readonly input: typeof zStableAudioInput;
    readonly output: typeof zStableAudioOutput;
  };
  readonly "fal-ai/stable-audio-25/audio-to-audio": {
    readonly input: typeof zStableAudio25AudioToAudioInput;
    readonly output: typeof zStableAudio25AudioToAudioOutput;
  };
  readonly "fal-ai/stable-audio-25/inpaint": {
    readonly input: typeof zStableAudio25InpaintInput;
    readonly output: typeof zStableAudio25InpaintOutput;
  };
  readonly "fal-ai/stable-audio-25/text-to-audio": {
    readonly input: typeof zStableAudio25TextToAudioInput;
    readonly output: typeof zStableAudio25TextToAudioOutput;
  };
  readonly "fal-ai/tada/1b/text-to-speech": {
    readonly input: typeof zTada1bTextToSpeechInput;
    readonly output: typeof zTada1bTextToSpeechOutput;
  };
  readonly "fal-ai/tada/3b/text-to-speech": {
    readonly input: typeof zTada3bTextToSpeechInput;
    readonly output: typeof zTada3bTextToSpeechOutput;
  };
  readonly "fal-ai/workflow-utilities/audio-compressor": {
    readonly input: typeof zWorkflowUtilitiesAudioCompressorInput;
    readonly output: typeof zWorkflowUtilitiesAudioCompressorOutput;
  };
  readonly "fal-ai/workflow-utilities/impulse-response": {
    readonly input: typeof zWorkflowUtilitiesImpulseResponseInput;
    readonly output: typeof zWorkflowUtilitiesImpulseResponseOutput;
  };
  readonly "fal-ai/yue": {
    readonly input: typeof zYueInput;
    readonly output: typeof zYueOutput;
  };
  readonly "fal-ai/zonos": {
    readonly input: typeof zZonosInput;
    readonly output: typeof zZonosOutput;
  };
  readonly "mirelo-ai/sfx-v1.5/video-to-audio": {
    readonly input: typeof zSfxV15VideoToAudioInput;
    readonly output: typeof zSfxV15VideoToAudioOutput;
  };
  readonly "mirelo-ai/sfx-v1/video-to-audio": {
    readonly input: typeof zSfxV1VideoToAudioInput;
    readonly output: typeof zSfxV1VideoToAudioOutput;
  };
} = {
  "cassetteai/music-generator": {
    input: zMusicGeneratorInput,
    output: zMusicGeneratorOutput,
  },
  "cassetteai/sound-effects-generator": {
    input: zSoundEffectsGeneratorInput,
    output: zSoundEffectsGeneratorOutput,
  },
  "fal-ai/ace-step": { input: zAceStepInput, output: zAceStepOutput },
  "fal-ai/ace-step/audio-inpaint": {
    input: zAceStepAudioInpaintInput,
    output: zAceStepAudioInpaintOutput,
  },
  "fal-ai/ace-step/audio-outpaint": {
    input: zAceStepAudioOutpaintInput,
    output: zAceStepAudioOutpaintOutput,
  },
  "fal-ai/ace-step/audio-to-audio": {
    input: zAceStepAudioToAudioInput,
    output: zAceStepAudioToAudioOutput,
  },
  "fal-ai/ace-step/prompt-to-audio": {
    input: zAceStepPromptToAudioInput,
    output: zAceStepPromptToAudioOutput,
  },
  "fal-ai/audio-understanding": {
    input: zAudioUnderstandingInput,
    output: zAudioUnderstandingOutput,
  },
  "fal-ai/csm-1b": { input: zCsm1bInput, output: zCsm1bOutput },
  "fal-ai/deepfilternet3": {
    input: zDeepfilternet3Input,
    output: zDeepfilternet3Output,
  },
  "fal-ai/demucs": { input: zDemucsInput, output: zDemucsOutput },
  "fal-ai/dia-tts/voice-clone": {
    input: zDiaTtsVoiceCloneInput,
    output: zDiaTtsVoiceCloneOutput,
  },
  "fal-ai/diffrhythm": { input: zDiffrhythmInput, output: zDiffrhythmOutput },
  "fal-ai/elevenlabs/audio-isolation": {
    input: zElevenlabsAudioIsolationInput,
    output: zElevenlabsAudioIsolationOutput,
  },
  "fal-ai/elevenlabs/music": {
    input: zElevenlabsMusicInput,
    output: zElevenlabsMusicOutput,
  },
  "fal-ai/elevenlabs/sound-effects/v2": {
    input: zElevenlabsSoundEffectsV2Input,
    output: zElevenlabsSoundEffectsV2Output,
  },
  "fal-ai/elevenlabs/text-to-dialogue/eleven-v3": {
    input: zElevenlabsTextToDialogueElevenV3Input,
    output: zElevenlabsTextToDialogueElevenV3Output,
  },
  "fal-ai/elevenlabs/tts/eleven-v3": {
    input: zElevenlabsTtsElevenV3Input,
    output: zElevenlabsTtsElevenV3Output,
  },
  "fal-ai/elevenlabs/tts/multilingual-v2": {
    input: zElevenlabsTtsMultilingualV2Input,
    output: zElevenlabsTtsMultilingualV2Output,
  },
  "fal-ai/elevenlabs/voice-changer": {
    input: zElevenlabsVoiceChangerInput,
    output: zElevenlabsVoiceChangerOutput,
  },
  "fal-ai/f5-tts": { input: zF5TtsInput, output: zF5TtsOutput },
  "fal-ai/gemini-tts": { input: zGeminiTtsInput, output: zGeminiTtsOutput },
  "fal-ai/kling-video/create-voice": {
    input: zKlingVideoCreateVoiceInput,
    output: zKlingVideoCreateVoiceOutput,
  },
  "fal-ai/kling-video/video-to-audio": {
    input: zKlingVideoVideoToAudioInput,
    output: zKlingVideoVideoToAudioOutput,
  },
  "fal-ai/kokoro/american-english": {
    input: zKokoroAmericanEnglishInput,
    output: zKokoroAmericanEnglishOutput,
  },
  "fal-ai/kokoro/brazilian-portuguese": {
    input: zKokoroBrazilianPortugueseInput,
    output: zKokoroBrazilianPortugueseOutput,
  },
  "fal-ai/kokoro/british-english": {
    input: zKokoroBritishEnglishInput,
    output: zKokoroBritishEnglishOutput,
  },
  "fal-ai/kokoro/french": {
    input: zKokoroFrenchInput,
    output: zKokoroFrenchOutput,
  },
  "fal-ai/kokoro/hindi": {
    input: zKokoroHindiInput,
    output: zKokoroHindiOutput,
  },
  "fal-ai/kokoro/italian": {
    input: zKokoroItalianInput,
    output: zKokoroItalianOutput,
  },
  "fal-ai/kokoro/japanese": {
    input: zKokoroJapaneseInput,
    output: zKokoroJapaneseOutput,
  },
  "fal-ai/kokoro/mandarin-chinese": {
    input: zKokoroMandarinChineseInput,
    output: zKokoroMandarinChineseOutput,
  },
  "fal-ai/kokoro/spanish": {
    input: zKokoroSpanishInput,
    output: zKokoroSpanishOutput,
  },
  "fal-ai/lava-sr": { input: zLavaSrInput, output: zLavaSrOutput },
  "fal-ai/lyria2": { input: zLyria2Input, output: zLyria2Output },
  "fal-ai/minimax-music": {
    input: zMinimaxMusicInput,
    output: zMinimaxMusicOutput,
  },
  "fal-ai/minimax-music/v1.5": {
    input: zMinimaxMusicV15Input,
    output: zMinimaxMusicV15Output,
  },
  "fal-ai/minimax-music/v2": {
    input: zMinimaxMusicV2Input,
    output: zMinimaxMusicV2Output,
  },
  "fal-ai/minimax-music/v2.5": {
    input: zMinimaxMusicV25Input,
    output: zMinimaxMusicV25Output,
  },
  "fal-ai/minimax-music/v2.6": {
    input: zMinimaxMusicV26Input,
    output: zMinimaxMusicV26Output,
  },
  "fal-ai/mmaudio-v2/text-to-audio": {
    input: zMmaudioV2TextToAudioInput,
    output: zMmaudioV2TextToAudioOutput,
  },
  "fal-ai/nova-sr": { input: zNovaSrInput, output: zNovaSrOutput },
  "fal-ai/personaplex": {
    input: zPersonaplexInput,
    output: zPersonaplexOutput,
  },
  "fal-ai/personaplex/realtime": {
    input: zPersonaplexRealtimeInput,
    output: zPersonaplexRealtimeOutput,
  },
  "fal-ai/qwen-3-tts/clone-voice/0.6b": {
    input: zQwen3TtsCloneVoice06bInput,
    output: zQwen3TtsCloneVoice06bOutput,
  },
  "fal-ai/qwen-3-tts/clone-voice/1.7b": {
    input: zQwen3TtsCloneVoice17bInput,
    output: zQwen3TtsCloneVoice17bOutput,
  },
  "fal-ai/sam-audio/separate": {
    input: zSamAudioSeparateInput,
    output: zSamAudioSeparateOutput,
  },
  "fal-ai/sam-audio/span-separate": {
    input: zSamAudioSpanSeparateInput,
    output: zSamAudioSpanSeparateOutput,
  },
  "fal-ai/sam-audio/visual-separate": {
    input: zSamAudioVisualSeparateInput,
    output: zSamAudioVisualSeparateOutput,
  },
  "fal-ai/stable-audio": {
    input: zStableAudioInput,
    output: zStableAudioOutput,
  },
  "fal-ai/stable-audio-25/audio-to-audio": {
    input: zStableAudio25AudioToAudioInput,
    output: zStableAudio25AudioToAudioOutput,
  },
  "fal-ai/stable-audio-25/inpaint": {
    input: zStableAudio25InpaintInput,
    output: zStableAudio25InpaintOutput,
  },
  "fal-ai/stable-audio-25/text-to-audio": {
    input: zStableAudio25TextToAudioInput,
    output: zStableAudio25TextToAudioOutput,
  },
  "fal-ai/tada/1b/text-to-speech": {
    input: zTada1bTextToSpeechInput,
    output: zTada1bTextToSpeechOutput,
  },
  "fal-ai/tada/3b/text-to-speech": {
    input: zTada3bTextToSpeechInput,
    output: zTada3bTextToSpeechOutput,
  },
  "fal-ai/workflow-utilities/audio-compressor": {
    input: zWorkflowUtilitiesAudioCompressorInput,
    output: zWorkflowUtilitiesAudioCompressorOutput,
  },
  "fal-ai/workflow-utilities/impulse-response": {
    input: zWorkflowUtilitiesImpulseResponseInput,
    output: zWorkflowUtilitiesImpulseResponseOutput,
  },
  "fal-ai/yue": { input: zYueInput, output: zYueOutput },
  "fal-ai/zonos": { input: zZonosInput, output: zZonosOutput },
  "mirelo-ai/sfx-v1.5/video-to-audio": {
    input: zSfxV15VideoToAudioInput,
    output: zSfxV15VideoToAudioOutput,
  },
  "mirelo-ai/sfx-v1/video-to-audio": {
    input: zSfxV1VideoToAudioInput,
    output: zSfxV1VideoToAudioOutput,
  },
};

/** Union of valid audio endpoint ids. */
export type AudioEndpointId = keyof typeof audioEndpoints;
