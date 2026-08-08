// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import {
  AceStepAudioInpaintInputSchema,
  AceStepAudioInpaintOutputSchema,
  AceStepAudioOutpaintInputSchema,
  AceStepAudioOutpaintOutputSchema,
  AceStepAudioToAudioInputSchema,
  AceStepAudioToAudioOutputSchema,
  AceStepInputSchema,
  AceStepOutputSchema,
  AceStepPromptToAudioInputSchema,
  AceStepPromptToAudioOutputSchema,
  AudioUnderstandingInputSchema,
  AudioUnderstandingOutputSchema,
  Csm1bInputSchema,
  Csm1bOutputSchema,
  Deepfilternet3InputSchema,
  Deepfilternet3OutputSchema,
  DemucsInputSchema,
  DemucsOutputSchema,
  DiaTtsVoiceCloneInputSchema,
  DiaTtsVoiceCloneOutputSchema,
  DiffrhythmInputSchema,
  DiffrhythmOutputSchema,
  ElevenlabsAudioIsolationInputSchema,
  ElevenlabsAudioIsolationOutputSchema,
  ElevenlabsMusicInputSchema,
  ElevenlabsMusicOutputSchema,
  ElevenlabsSoundEffectsV2InputSchema,
  ElevenlabsSoundEffectsV2OutputSchema,
  ElevenlabsTextToDialogueElevenV3InputSchema,
  ElevenlabsTextToDialogueElevenV3OutputSchema,
  ElevenlabsTtsElevenV3InputSchema,
  ElevenlabsTtsElevenV3OutputSchema,
  ElevenlabsTtsMultilingualV2InputSchema,
  ElevenlabsTtsMultilingualV2OutputSchema,
  ElevenlabsVoiceChangerInputSchema,
  ElevenlabsVoiceChangerOutputSchema,
  F5TtsInputSchema,
  F5TtsOutputSchema,
  GeminiTtsInputSchema,
  GeminiTtsOutputSchema,
  KlingVideoCreateVoiceInputSchema,
  KlingVideoCreateVoiceOutputSchema,
  KlingVideoVideoToAudioInputSchema,
  KlingVideoVideoToAudioOutputSchema,
  KokoroAmericanEnglishInputSchema,
  KokoroAmericanEnglishOutputSchema,
  KokoroBrazilianPortugueseInputSchema,
  KokoroBrazilianPortugueseOutputSchema,
  KokoroBritishEnglishInputSchema,
  KokoroBritishEnglishOutputSchema,
  KokoroFrenchInputSchema,
  KokoroFrenchOutputSchema,
  KokoroHindiInputSchema,
  KokoroHindiOutputSchema,
  KokoroItalianInputSchema,
  KokoroItalianOutputSchema,
  KokoroJapaneseInputSchema,
  KokoroJapaneseOutputSchema,
  KokoroMandarinChineseInputSchema,
  KokoroMandarinChineseOutputSchema,
  KokoroSpanishInputSchema,
  KokoroSpanishOutputSchema,
  LavaSrInputSchema,
  LavaSrOutputSchema,
  Lyria2InputSchema,
  Lyria2OutputSchema,
  MinimaxMusicInputSchema,
  MinimaxMusicOutputSchema,
  MinimaxMusicV15InputSchema,
  MinimaxMusicV15OutputSchema,
  MinimaxMusicV25InputSchema,
  MinimaxMusicV25OutputSchema,
  MinimaxMusicV26InputSchema,
  MinimaxMusicV26OutputSchema,
  MinimaxMusicV2InputSchema,
  MinimaxMusicV2OutputSchema,
  MmaudioV2TextToAudioInputSchema,
  MmaudioV2TextToAudioOutputSchema,
  MusicGeneratorInputSchema,
  MusicGeneratorOutputSchema,
  NovaSrInputSchema,
  NovaSrOutputSchema,
  PersonaplexInputSchema,
  PersonaplexOutputSchema,
  PersonaplexRealtimeInputSchema,
  PersonaplexRealtimeOutputSchema,
  Qwen3TtsCloneVoice06bInputSchema,
  Qwen3TtsCloneVoice06bOutputSchema,
  Qwen3TtsCloneVoice17bInputSchema,
  Qwen3TtsCloneVoice17bOutputSchema,
  SamAudioSeparateInputSchema,
  SamAudioSeparateOutputSchema,
  SamAudioSpanSeparateInputSchema,
  SamAudioSpanSeparateOutputSchema,
  SamAudioVisualSeparateInputSchema,
  SamAudioVisualSeparateOutputSchema,
  SfxV15VideoToAudioInputSchema,
  SfxV15VideoToAudioOutputSchema,
  SfxV1VideoToAudioInputSchema,
  SfxV1VideoToAudioOutputSchema,
  SoundEffectsGeneratorInputSchema,
  SoundEffectsGeneratorOutputSchema,
  StableAudio25AudioToAudioInputSchema,
  StableAudio25AudioToAudioOutputSchema,
  StableAudio25InpaintInputSchema,
  StableAudio25InpaintOutputSchema,
  StableAudio25TextToAudioInputSchema,
  StableAudio25TextToAudioOutputSchema,
  StableAudioInputSchema,
  StableAudioOutputSchema,
  Tada1bTextToSpeechInputSchema,
  Tada1bTextToSpeechOutputSchema,
  Tada3bTextToSpeechInputSchema,
  Tada3bTextToSpeechOutputSchema,
  WorkflowUtilitiesAudioCompressorInputSchema,
  WorkflowUtilitiesAudioCompressorOutputSchema,
  WorkflowUtilitiesImpulseResponseInputSchema,
  WorkflowUtilitiesImpulseResponseOutputSchema,
  YueInputSchema,
  YueOutputSchema,
  ZonosInputSchema,
  ZonosOutputSchema,
} from "./schemas.gen.js";

/**
 * Map of audio endpoint id -> self-contained JSON Schemas.
 * Each input/output schema bundles its $ref closure under `$defs`, so it
 * can be handed directly to LLM tool APIs or `z.fromJSONSchema`.
 */
export const audioEndpointSchemaMap: {
  readonly "cassetteai/music-generator": {
    readonly input: typeof MusicGeneratorInputSchema;
    readonly output: typeof MusicGeneratorOutputSchema;
  };
  readonly "cassetteai/sound-effects-generator": {
    readonly input: typeof SoundEffectsGeneratorInputSchema;
    readonly output: typeof SoundEffectsGeneratorOutputSchema;
  };
  readonly "fal-ai/ace-step": {
    readonly input: typeof AceStepInputSchema;
    readonly output: typeof AceStepOutputSchema;
  };
  readonly "fal-ai/ace-step/audio-inpaint": {
    readonly input: typeof AceStepAudioInpaintInputSchema;
    readonly output: typeof AceStepAudioInpaintOutputSchema;
  };
  readonly "fal-ai/ace-step/audio-outpaint": {
    readonly input: typeof AceStepAudioOutpaintInputSchema;
    readonly output: typeof AceStepAudioOutpaintOutputSchema;
  };
  readonly "fal-ai/ace-step/audio-to-audio": {
    readonly input: typeof AceStepAudioToAudioInputSchema;
    readonly output: typeof AceStepAudioToAudioOutputSchema;
  };
  readonly "fal-ai/ace-step/prompt-to-audio": {
    readonly input: typeof AceStepPromptToAudioInputSchema;
    readonly output: typeof AceStepPromptToAudioOutputSchema;
  };
  readonly "fal-ai/audio-understanding": {
    readonly input: typeof AudioUnderstandingInputSchema;
    readonly output: typeof AudioUnderstandingOutputSchema;
  };
  readonly "fal-ai/csm-1b": {
    readonly input: typeof Csm1bInputSchema;
    readonly output: typeof Csm1bOutputSchema;
  };
  readonly "fal-ai/deepfilternet3": {
    readonly input: typeof Deepfilternet3InputSchema;
    readonly output: typeof Deepfilternet3OutputSchema;
  };
  readonly "fal-ai/demucs": {
    readonly input: typeof DemucsInputSchema;
    readonly output: typeof DemucsOutputSchema;
  };
  readonly "fal-ai/dia-tts/voice-clone": {
    readonly input: typeof DiaTtsVoiceCloneInputSchema;
    readonly output: typeof DiaTtsVoiceCloneOutputSchema;
  };
  readonly "fal-ai/diffrhythm": {
    readonly input: typeof DiffrhythmInputSchema;
    readonly output: typeof DiffrhythmOutputSchema;
  };
  readonly "fal-ai/elevenlabs/audio-isolation": {
    readonly input: typeof ElevenlabsAudioIsolationInputSchema;
    readonly output: typeof ElevenlabsAudioIsolationOutputSchema;
  };
  readonly "fal-ai/elevenlabs/music": {
    readonly input: typeof ElevenlabsMusicInputSchema;
    readonly output: typeof ElevenlabsMusicOutputSchema;
  };
  readonly "fal-ai/elevenlabs/sound-effects/v2": {
    readonly input: typeof ElevenlabsSoundEffectsV2InputSchema;
    readonly output: typeof ElevenlabsSoundEffectsV2OutputSchema;
  };
  readonly "fal-ai/elevenlabs/text-to-dialogue/eleven-v3": {
    readonly input: typeof ElevenlabsTextToDialogueElevenV3InputSchema;
    readonly output: typeof ElevenlabsTextToDialogueElevenV3OutputSchema;
  };
  readonly "fal-ai/elevenlabs/tts/eleven-v3": {
    readonly input: typeof ElevenlabsTtsElevenV3InputSchema;
    readonly output: typeof ElevenlabsTtsElevenV3OutputSchema;
  };
  readonly "fal-ai/elevenlabs/tts/multilingual-v2": {
    readonly input: typeof ElevenlabsTtsMultilingualV2InputSchema;
    readonly output: typeof ElevenlabsTtsMultilingualV2OutputSchema;
  };
  readonly "fal-ai/elevenlabs/voice-changer": {
    readonly input: typeof ElevenlabsVoiceChangerInputSchema;
    readonly output: typeof ElevenlabsVoiceChangerOutputSchema;
  };
  readonly "fal-ai/f5-tts": {
    readonly input: typeof F5TtsInputSchema;
    readonly output: typeof F5TtsOutputSchema;
  };
  readonly "fal-ai/gemini-tts": {
    readonly input: typeof GeminiTtsInputSchema;
    readonly output: typeof GeminiTtsOutputSchema;
  };
  readonly "fal-ai/kling-video/create-voice": {
    readonly input: typeof KlingVideoCreateVoiceInputSchema;
    readonly output: typeof KlingVideoCreateVoiceOutputSchema;
  };
  readonly "fal-ai/kling-video/video-to-audio": {
    readonly input: typeof KlingVideoVideoToAudioInputSchema;
    readonly output: typeof KlingVideoVideoToAudioOutputSchema;
  };
  readonly "fal-ai/kokoro/american-english": {
    readonly input: typeof KokoroAmericanEnglishInputSchema;
    readonly output: typeof KokoroAmericanEnglishOutputSchema;
  };
  readonly "fal-ai/kokoro/brazilian-portuguese": {
    readonly input: typeof KokoroBrazilianPortugueseInputSchema;
    readonly output: typeof KokoroBrazilianPortugueseOutputSchema;
  };
  readonly "fal-ai/kokoro/british-english": {
    readonly input: typeof KokoroBritishEnglishInputSchema;
    readonly output: typeof KokoroBritishEnglishOutputSchema;
  };
  readonly "fal-ai/kokoro/french": {
    readonly input: typeof KokoroFrenchInputSchema;
    readonly output: typeof KokoroFrenchOutputSchema;
  };
  readonly "fal-ai/kokoro/hindi": {
    readonly input: typeof KokoroHindiInputSchema;
    readonly output: typeof KokoroHindiOutputSchema;
  };
  readonly "fal-ai/kokoro/italian": {
    readonly input: typeof KokoroItalianInputSchema;
    readonly output: typeof KokoroItalianOutputSchema;
  };
  readonly "fal-ai/kokoro/japanese": {
    readonly input: typeof KokoroJapaneseInputSchema;
    readonly output: typeof KokoroJapaneseOutputSchema;
  };
  readonly "fal-ai/kokoro/mandarin-chinese": {
    readonly input: typeof KokoroMandarinChineseInputSchema;
    readonly output: typeof KokoroMandarinChineseOutputSchema;
  };
  readonly "fal-ai/kokoro/spanish": {
    readonly input: typeof KokoroSpanishInputSchema;
    readonly output: typeof KokoroSpanishOutputSchema;
  };
  readonly "fal-ai/lava-sr": {
    readonly input: typeof LavaSrInputSchema;
    readonly output: typeof LavaSrOutputSchema;
  };
  readonly "fal-ai/lyria2": {
    readonly input: typeof Lyria2InputSchema;
    readonly output: typeof Lyria2OutputSchema;
  };
  readonly "fal-ai/minimax-music": {
    readonly input: typeof MinimaxMusicInputSchema;
    readonly output: typeof MinimaxMusicOutputSchema;
  };
  readonly "fal-ai/minimax-music/v1.5": {
    readonly input: typeof MinimaxMusicV15InputSchema;
    readonly output: typeof MinimaxMusicV15OutputSchema;
  };
  readonly "fal-ai/minimax-music/v2": {
    readonly input: typeof MinimaxMusicV2InputSchema;
    readonly output: typeof MinimaxMusicV2OutputSchema;
  };
  readonly "fal-ai/minimax-music/v2.5": {
    readonly input: typeof MinimaxMusicV25InputSchema;
    readonly output: typeof MinimaxMusicV25OutputSchema;
  };
  readonly "fal-ai/minimax-music/v2.6": {
    readonly input: typeof MinimaxMusicV26InputSchema;
    readonly output: typeof MinimaxMusicV26OutputSchema;
  };
  readonly "fal-ai/mmaudio-v2/text-to-audio": {
    readonly input: typeof MmaudioV2TextToAudioInputSchema;
    readonly output: typeof MmaudioV2TextToAudioOutputSchema;
  };
  readonly "fal-ai/nova-sr": {
    readonly input: typeof NovaSrInputSchema;
    readonly output: typeof NovaSrOutputSchema;
  };
  readonly "fal-ai/personaplex": {
    readonly input: typeof PersonaplexInputSchema;
    readonly output: typeof PersonaplexOutputSchema;
  };
  readonly "fal-ai/personaplex/realtime": {
    readonly input: typeof PersonaplexRealtimeInputSchema;
    readonly output: typeof PersonaplexRealtimeOutputSchema;
  };
  readonly "fal-ai/qwen-3-tts/clone-voice/0.6b": {
    readonly input: typeof Qwen3TtsCloneVoice06bInputSchema;
    readonly output: typeof Qwen3TtsCloneVoice06bOutputSchema;
  };
  readonly "fal-ai/qwen-3-tts/clone-voice/1.7b": {
    readonly input: typeof Qwen3TtsCloneVoice17bInputSchema;
    readonly output: typeof Qwen3TtsCloneVoice17bOutputSchema;
  };
  readonly "fal-ai/sam-audio/separate": {
    readonly input: typeof SamAudioSeparateInputSchema;
    readonly output: typeof SamAudioSeparateOutputSchema;
  };
  readonly "fal-ai/sam-audio/span-separate": {
    readonly input: typeof SamAudioSpanSeparateInputSchema;
    readonly output: typeof SamAudioSpanSeparateOutputSchema;
  };
  readonly "fal-ai/sam-audio/visual-separate": {
    readonly input: typeof SamAudioVisualSeparateInputSchema;
    readonly output: typeof SamAudioVisualSeparateOutputSchema;
  };
  readonly "fal-ai/stable-audio": {
    readonly input: typeof StableAudioInputSchema;
    readonly output: typeof StableAudioOutputSchema;
  };
  readonly "fal-ai/stable-audio-25/audio-to-audio": {
    readonly input: typeof StableAudio25AudioToAudioInputSchema;
    readonly output: typeof StableAudio25AudioToAudioOutputSchema;
  };
  readonly "fal-ai/stable-audio-25/inpaint": {
    readonly input: typeof StableAudio25InpaintInputSchema;
    readonly output: typeof StableAudio25InpaintOutputSchema;
  };
  readonly "fal-ai/stable-audio-25/text-to-audio": {
    readonly input: typeof StableAudio25TextToAudioInputSchema;
    readonly output: typeof StableAudio25TextToAudioOutputSchema;
  };
  readonly "fal-ai/tada/1b/text-to-speech": {
    readonly input: typeof Tada1bTextToSpeechInputSchema;
    readonly output: typeof Tada1bTextToSpeechOutputSchema;
  };
  readonly "fal-ai/tada/3b/text-to-speech": {
    readonly input: typeof Tada3bTextToSpeechInputSchema;
    readonly output: typeof Tada3bTextToSpeechOutputSchema;
  };
  readonly "fal-ai/workflow-utilities/audio-compressor": {
    readonly input: typeof WorkflowUtilitiesAudioCompressorInputSchema;
    readonly output: typeof WorkflowUtilitiesAudioCompressorOutputSchema;
  };
  readonly "fal-ai/workflow-utilities/impulse-response": {
    readonly input: typeof WorkflowUtilitiesImpulseResponseInputSchema;
    readonly output: typeof WorkflowUtilitiesImpulseResponseOutputSchema;
  };
  readonly "fal-ai/yue": {
    readonly input: typeof YueInputSchema;
    readonly output: typeof YueOutputSchema;
  };
  readonly "fal-ai/zonos": {
    readonly input: typeof ZonosInputSchema;
    readonly output: typeof ZonosOutputSchema;
  };
  readonly "mirelo-ai/sfx-v1.5/video-to-audio": {
    readonly input: typeof SfxV15VideoToAudioInputSchema;
    readonly output: typeof SfxV15VideoToAudioOutputSchema;
  };
  readonly "mirelo-ai/sfx-v1/video-to-audio": {
    readonly input: typeof SfxV1VideoToAudioInputSchema;
    readonly output: typeof SfxV1VideoToAudioOutputSchema;
  };
} = {
  "cassetteai/music-generator": {
    input: MusicGeneratorInputSchema,
    output: MusicGeneratorOutputSchema,
  },
  "cassetteai/sound-effects-generator": {
    input: SoundEffectsGeneratorInputSchema,
    output: SoundEffectsGeneratorOutputSchema,
  },
  "fal-ai/ace-step": { input: AceStepInputSchema, output: AceStepOutputSchema },
  "fal-ai/ace-step/audio-inpaint": {
    input: AceStepAudioInpaintInputSchema,
    output: AceStepAudioInpaintOutputSchema,
  },
  "fal-ai/ace-step/audio-outpaint": {
    input: AceStepAudioOutpaintInputSchema,
    output: AceStepAudioOutpaintOutputSchema,
  },
  "fal-ai/ace-step/audio-to-audio": {
    input: AceStepAudioToAudioInputSchema,
    output: AceStepAudioToAudioOutputSchema,
  },
  "fal-ai/ace-step/prompt-to-audio": {
    input: AceStepPromptToAudioInputSchema,
    output: AceStepPromptToAudioOutputSchema,
  },
  "fal-ai/audio-understanding": {
    input: AudioUnderstandingInputSchema,
    output: AudioUnderstandingOutputSchema,
  },
  "fal-ai/csm-1b": { input: Csm1bInputSchema, output: Csm1bOutputSchema },
  "fal-ai/deepfilternet3": {
    input: Deepfilternet3InputSchema,
    output: Deepfilternet3OutputSchema,
  },
  "fal-ai/demucs": { input: DemucsInputSchema, output: DemucsOutputSchema },
  "fal-ai/dia-tts/voice-clone": {
    input: DiaTtsVoiceCloneInputSchema,
    output: DiaTtsVoiceCloneOutputSchema,
  },
  "fal-ai/diffrhythm": {
    input: DiffrhythmInputSchema,
    output: DiffrhythmOutputSchema,
  },
  "fal-ai/elevenlabs/audio-isolation": {
    input: ElevenlabsAudioIsolationInputSchema,
    output: ElevenlabsAudioIsolationOutputSchema,
  },
  "fal-ai/elevenlabs/music": {
    input: ElevenlabsMusicInputSchema,
    output: ElevenlabsMusicOutputSchema,
  },
  "fal-ai/elevenlabs/sound-effects/v2": {
    input: ElevenlabsSoundEffectsV2InputSchema,
    output: ElevenlabsSoundEffectsV2OutputSchema,
  },
  "fal-ai/elevenlabs/text-to-dialogue/eleven-v3": {
    input: ElevenlabsTextToDialogueElevenV3InputSchema,
    output: ElevenlabsTextToDialogueElevenV3OutputSchema,
  },
  "fal-ai/elevenlabs/tts/eleven-v3": {
    input: ElevenlabsTtsElevenV3InputSchema,
    output: ElevenlabsTtsElevenV3OutputSchema,
  },
  "fal-ai/elevenlabs/tts/multilingual-v2": {
    input: ElevenlabsTtsMultilingualV2InputSchema,
    output: ElevenlabsTtsMultilingualV2OutputSchema,
  },
  "fal-ai/elevenlabs/voice-changer": {
    input: ElevenlabsVoiceChangerInputSchema,
    output: ElevenlabsVoiceChangerOutputSchema,
  },
  "fal-ai/f5-tts": { input: F5TtsInputSchema, output: F5TtsOutputSchema },
  "fal-ai/gemini-tts": {
    input: GeminiTtsInputSchema,
    output: GeminiTtsOutputSchema,
  },
  "fal-ai/kling-video/create-voice": {
    input: KlingVideoCreateVoiceInputSchema,
    output: KlingVideoCreateVoiceOutputSchema,
  },
  "fal-ai/kling-video/video-to-audio": {
    input: KlingVideoVideoToAudioInputSchema,
    output: KlingVideoVideoToAudioOutputSchema,
  },
  "fal-ai/kokoro/american-english": {
    input: KokoroAmericanEnglishInputSchema,
    output: KokoroAmericanEnglishOutputSchema,
  },
  "fal-ai/kokoro/brazilian-portuguese": {
    input: KokoroBrazilianPortugueseInputSchema,
    output: KokoroBrazilianPortugueseOutputSchema,
  },
  "fal-ai/kokoro/british-english": {
    input: KokoroBritishEnglishInputSchema,
    output: KokoroBritishEnglishOutputSchema,
  },
  "fal-ai/kokoro/french": {
    input: KokoroFrenchInputSchema,
    output: KokoroFrenchOutputSchema,
  },
  "fal-ai/kokoro/hindi": {
    input: KokoroHindiInputSchema,
    output: KokoroHindiOutputSchema,
  },
  "fal-ai/kokoro/italian": {
    input: KokoroItalianInputSchema,
    output: KokoroItalianOutputSchema,
  },
  "fal-ai/kokoro/japanese": {
    input: KokoroJapaneseInputSchema,
    output: KokoroJapaneseOutputSchema,
  },
  "fal-ai/kokoro/mandarin-chinese": {
    input: KokoroMandarinChineseInputSchema,
    output: KokoroMandarinChineseOutputSchema,
  },
  "fal-ai/kokoro/spanish": {
    input: KokoroSpanishInputSchema,
    output: KokoroSpanishOutputSchema,
  },
  "fal-ai/lava-sr": { input: LavaSrInputSchema, output: LavaSrOutputSchema },
  "fal-ai/lyria2": { input: Lyria2InputSchema, output: Lyria2OutputSchema },
  "fal-ai/minimax-music": {
    input: MinimaxMusicInputSchema,
    output: MinimaxMusicOutputSchema,
  },
  "fal-ai/minimax-music/v1.5": {
    input: MinimaxMusicV15InputSchema,
    output: MinimaxMusicV15OutputSchema,
  },
  "fal-ai/minimax-music/v2": {
    input: MinimaxMusicV2InputSchema,
    output: MinimaxMusicV2OutputSchema,
  },
  "fal-ai/minimax-music/v2.5": {
    input: MinimaxMusicV25InputSchema,
    output: MinimaxMusicV25OutputSchema,
  },
  "fal-ai/minimax-music/v2.6": {
    input: MinimaxMusicV26InputSchema,
    output: MinimaxMusicV26OutputSchema,
  },
  "fal-ai/mmaudio-v2/text-to-audio": {
    input: MmaudioV2TextToAudioInputSchema,
    output: MmaudioV2TextToAudioOutputSchema,
  },
  "fal-ai/nova-sr": { input: NovaSrInputSchema, output: NovaSrOutputSchema },
  "fal-ai/personaplex": {
    input: PersonaplexInputSchema,
    output: PersonaplexOutputSchema,
  },
  "fal-ai/personaplex/realtime": {
    input: PersonaplexRealtimeInputSchema,
    output: PersonaplexRealtimeOutputSchema,
  },
  "fal-ai/qwen-3-tts/clone-voice/0.6b": {
    input: Qwen3TtsCloneVoice06bInputSchema,
    output: Qwen3TtsCloneVoice06bOutputSchema,
  },
  "fal-ai/qwen-3-tts/clone-voice/1.7b": {
    input: Qwen3TtsCloneVoice17bInputSchema,
    output: Qwen3TtsCloneVoice17bOutputSchema,
  },
  "fal-ai/sam-audio/separate": {
    input: SamAudioSeparateInputSchema,
    output: SamAudioSeparateOutputSchema,
  },
  "fal-ai/sam-audio/span-separate": {
    input: SamAudioSpanSeparateInputSchema,
    output: SamAudioSpanSeparateOutputSchema,
  },
  "fal-ai/sam-audio/visual-separate": {
    input: SamAudioVisualSeparateInputSchema,
    output: SamAudioVisualSeparateOutputSchema,
  },
  "fal-ai/stable-audio": {
    input: StableAudioInputSchema,
    output: StableAudioOutputSchema,
  },
  "fal-ai/stable-audio-25/audio-to-audio": {
    input: StableAudio25AudioToAudioInputSchema,
    output: StableAudio25AudioToAudioOutputSchema,
  },
  "fal-ai/stable-audio-25/inpaint": {
    input: StableAudio25InpaintInputSchema,
    output: StableAudio25InpaintOutputSchema,
  },
  "fal-ai/stable-audio-25/text-to-audio": {
    input: StableAudio25TextToAudioInputSchema,
    output: StableAudio25TextToAudioOutputSchema,
  },
  "fal-ai/tada/1b/text-to-speech": {
    input: Tada1bTextToSpeechInputSchema,
    output: Tada1bTextToSpeechOutputSchema,
  },
  "fal-ai/tada/3b/text-to-speech": {
    input: Tada3bTextToSpeechInputSchema,
    output: Tada3bTextToSpeechOutputSchema,
  },
  "fal-ai/workflow-utilities/audio-compressor": {
    input: WorkflowUtilitiesAudioCompressorInputSchema,
    output: WorkflowUtilitiesAudioCompressorOutputSchema,
  },
  "fal-ai/workflow-utilities/impulse-response": {
    input: WorkflowUtilitiesImpulseResponseInputSchema,
    output: WorkflowUtilitiesImpulseResponseOutputSchema,
  },
  "fal-ai/yue": { input: YueInputSchema, output: YueOutputSchema },
  "fal-ai/zonos": { input: ZonosInputSchema, output: ZonosOutputSchema },
  "mirelo-ai/sfx-v1.5/video-to-audio": {
    input: SfxV15VideoToAudioInputSchema,
    output: SfxV15VideoToAudioOutputSchema,
  },
  "mirelo-ai/sfx-v1/video-to-audio": {
    input: SfxV1VideoToAudioInputSchema,
    output: SfxV1VideoToAudioOutputSchema,
  },
};
