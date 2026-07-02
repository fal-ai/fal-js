// AUTO-GENERATED - Do not edit manually
// Generated from types.gen.ts via scripts/generate-endpoint-maps.ts

import type {
  AceStepAudioInpaintInput,
  AceStepAudioInpaintOutput,
  AceStepAudioOutpaintInput,
  AceStepAudioOutpaintOutput,
  AceStepAudioToAudioInput,
  AceStepAudioToAudioOutput,
  AceStepInput,
  AceStepOutput,
  AceStepPromptToAudioInput,
  AceStepPromptToAudioOutput,
  AudioUnderstandingInput,
  AudioUnderstandingOutput,
  Csm1bInput,
  Csm1bOutput,
  Deepfilternet3Input,
  Deepfilternet3Output,
  DemucsInput,
  DemucsOutput,
  DiaTtsVoiceCloneInput,
  DiaTtsVoiceCloneOutput,
  DiffrhythmInput,
  DiffrhythmOutput,
  ElevenlabsAudioIsolationInput,
  ElevenlabsAudioIsolationOutput,
  ElevenlabsMusicInput,
  ElevenlabsMusicOutput,
  ElevenlabsSoundEffectsV2Input,
  ElevenlabsSoundEffectsV2Output,
  ElevenlabsTextToDialogueElevenV3Input,
  ElevenlabsTextToDialogueElevenV3Output,
  ElevenlabsTtsElevenV3Input,
  ElevenlabsTtsElevenV3Output,
  ElevenlabsTtsMultilingualV2Input,
  ElevenlabsTtsMultilingualV2Output,
  ElevenlabsVoiceChangerInput,
  ElevenlabsVoiceChangerOutput,
  F5TtsInput,
  F5TtsOutput,
  FfmpegApiMergeAudiosInput,
  FfmpegApiMergeAudiosOutput,
  GeminiTtsInput,
  GeminiTtsOutput,
  KlingVideoCreateVoiceInput,
  KlingVideoCreateVoiceOutput,
  KlingVideoVideoToAudioInput,
  KlingVideoVideoToAudioOutput,
  KokoroAmericanEnglishInput,
  KokoroAmericanEnglishOutput,
  KokoroBrazilianPortugueseInput,
  KokoroBrazilianPortugueseOutput,
  KokoroBritishEnglishInput,
  KokoroBritishEnglishOutput,
  KokoroFrenchInput,
  KokoroFrenchOutput,
  KokoroHindiInput,
  KokoroHindiOutput,
  KokoroItalianInput,
  KokoroItalianOutput,
  KokoroJapaneseInput,
  KokoroJapaneseOutput,
  KokoroMandarinChineseInput,
  KokoroMandarinChineseOutput,
  KokoroSpanishInput,
  KokoroSpanishOutput,
  LavaSrInput,
  LavaSrOutput,
  Lyria2Input,
  Lyria2Output,
  MinimaxMusicInput,
  MinimaxMusicOutput,
  MinimaxMusicV15Input,
  MinimaxMusicV15Output,
  MinimaxMusicV25Input,
  MinimaxMusicV25Output,
  MinimaxMusicV26Input,
  MinimaxMusicV26Output,
  MinimaxMusicV2Input,
  MinimaxMusicV2Output,
  MmaudioV2TextToAudioInput,
  MmaudioV2TextToAudioOutput,
  MusicGeneratorInput,
  MusicGeneratorOutput,
  NovaSrInput,
  NovaSrOutput,
  PersonaplexInput,
  PersonaplexOutput,
  PersonaplexRealtimeInput,
  PersonaplexRealtimeOutput,
  Qwen3TtsCloneVoice06bInput,
  Qwen3TtsCloneVoice06bOutput,
  Qwen3TtsCloneVoice17bInput,
  Qwen3TtsCloneVoice17bOutput,
  SamAudioSeparateInput,
  SamAudioSeparateOutput,
  SamAudioSpanSeparateInput,
  SamAudioSpanSeparateOutput,
  SamAudioVisualSeparateInput,
  SamAudioVisualSeparateOutput,
  SfxV15VideoToAudioInput,
  SfxV15VideoToAudioOutput,
  SfxV1VideoToAudioInput,
  SfxV1VideoToAudioOutput,
  SoundEffectsGeneratorInput,
  SoundEffectsGeneratorOutput,
  StableAudio25AudioToAudioInput,
  StableAudio25AudioToAudioOutput,
  StableAudio25InpaintInput,
  StableAudio25InpaintOutput,
  StableAudio25TextToAudioInput,
  StableAudio25TextToAudioOutput,
  StableAudioInput,
  StableAudioOutput,
  Tada1bTextToSpeechInput,
  Tada1bTextToSpeechOutput,
  Tada3bTextToSpeechInput,
  Tada3bTextToSpeechOutput,
  V2ExtendInput,
  V2ExtendOutput,
  V2InpaintInput,
  V2InpaintOutput,
  V2TextToMusicInput,
  V2TextToMusicOutput,
  WorkflowUtilitiesAudioCompressorInput,
  WorkflowUtilitiesAudioCompressorOutput,
  WorkflowUtilitiesImpulseResponseInput,
  WorkflowUtilitiesImpulseResponseOutput,
  YueInput,
  YueOutput,
  ZonosInput,
  ZonosOutput,
} from "./types.gen";

export type AudioEndpointMap = {
  "cassetteai/music-generator": {
    input: MusicGeneratorInput;
    output: MusicGeneratorOutput;
  };
  "cassetteai/sound-effects-generator": {
    input: SoundEffectsGeneratorInput;
    output: SoundEffectsGeneratorOutput;
  };
  "fal-ai/ace-step": {
    input: AceStepInput;
    output: AceStepOutput;
  };
  "fal-ai/ace-step/audio-inpaint": {
    input: AceStepAudioInpaintInput;
    output: AceStepAudioInpaintOutput;
  };
  "fal-ai/ace-step/audio-outpaint": {
    input: AceStepAudioOutpaintInput;
    output: AceStepAudioOutpaintOutput;
  };
  "fal-ai/ace-step/audio-to-audio": {
    input: AceStepAudioToAudioInput;
    output: AceStepAudioToAudioOutput;
  };
  "fal-ai/ace-step/prompt-to-audio": {
    input: AceStepPromptToAudioInput;
    output: AceStepPromptToAudioOutput;
  };
  "fal-ai/audio-understanding": {
    input: AudioUnderstandingInput;
    output: AudioUnderstandingOutput;
  };
  "fal-ai/csm-1b": {
    input: Csm1bInput;
    output: Csm1bOutput;
  };
  "fal-ai/deepfilternet3": {
    input: Deepfilternet3Input;
    output: Deepfilternet3Output;
  };
  "fal-ai/demucs": {
    input: DemucsInput;
    output: DemucsOutput;
  };
  "fal-ai/dia-tts/voice-clone": {
    input: DiaTtsVoiceCloneInput;
    output: DiaTtsVoiceCloneOutput;
  };
  "fal-ai/diffrhythm": {
    input: DiffrhythmInput;
    output: DiffrhythmOutput;
  };
  "fal-ai/elevenlabs/audio-isolation": {
    input: ElevenlabsAudioIsolationInput;
    output: ElevenlabsAudioIsolationOutput;
  };
  "fal-ai/elevenlabs/music": {
    input: ElevenlabsMusicInput;
    output: ElevenlabsMusicOutput;
  };
  "fal-ai/elevenlabs/sound-effects/v2": {
    input: ElevenlabsSoundEffectsV2Input;
    output: ElevenlabsSoundEffectsV2Output;
  };
  "fal-ai/elevenlabs/text-to-dialogue/eleven-v3": {
    input: ElevenlabsTextToDialogueElevenV3Input;
    output: ElevenlabsTextToDialogueElevenV3Output;
  };
  "fal-ai/elevenlabs/tts/eleven-v3": {
    input: ElevenlabsTtsElevenV3Input;
    output: ElevenlabsTtsElevenV3Output;
  };
  "fal-ai/elevenlabs/tts/multilingual-v2": {
    input: ElevenlabsTtsMultilingualV2Input;
    output: ElevenlabsTtsMultilingualV2Output;
  };
  "fal-ai/elevenlabs/voice-changer": {
    input: ElevenlabsVoiceChangerInput;
    output: ElevenlabsVoiceChangerOutput;
  };
  "fal-ai/f5-tts": {
    input: F5TtsInput;
    output: F5TtsOutput;
  };
  "fal-ai/ffmpeg-api/merge-audios": {
    input: FfmpegApiMergeAudiosInput;
    output: FfmpegApiMergeAudiosOutput;
  };
  "fal-ai/gemini-tts": {
    input: GeminiTtsInput;
    output: GeminiTtsOutput;
  };
  "fal-ai/kling-video/create-voice": {
    input: KlingVideoCreateVoiceInput;
    output: KlingVideoCreateVoiceOutput;
  };
  "fal-ai/kling-video/video-to-audio": {
    input: KlingVideoVideoToAudioInput;
    output: KlingVideoVideoToAudioOutput;
  };
  "fal-ai/kokoro/american-english": {
    input: KokoroAmericanEnglishInput;
    output: KokoroAmericanEnglishOutput;
  };
  "fal-ai/kokoro/brazilian-portuguese": {
    input: KokoroBrazilianPortugueseInput;
    output: KokoroBrazilianPortugueseOutput;
  };
  "fal-ai/kokoro/british-english": {
    input: KokoroBritishEnglishInput;
    output: KokoroBritishEnglishOutput;
  };
  "fal-ai/kokoro/french": {
    input: KokoroFrenchInput;
    output: KokoroFrenchOutput;
  };
  "fal-ai/kokoro/hindi": {
    input: KokoroHindiInput;
    output: KokoroHindiOutput;
  };
  "fal-ai/kokoro/italian": {
    input: KokoroItalianInput;
    output: KokoroItalianOutput;
  };
  "fal-ai/kokoro/japanese": {
    input: KokoroJapaneseInput;
    output: KokoroJapaneseOutput;
  };
  "fal-ai/kokoro/mandarin-chinese": {
    input: KokoroMandarinChineseInput;
    output: KokoroMandarinChineseOutput;
  };
  "fal-ai/kokoro/spanish": {
    input: KokoroSpanishInput;
    output: KokoroSpanishOutput;
  };
  "fal-ai/lava-sr": {
    input: LavaSrInput;
    output: LavaSrOutput;
  };
  "fal-ai/lyria2": {
    input: Lyria2Input;
    output: Lyria2Output;
  };
  "fal-ai/minimax-music": {
    input: MinimaxMusicInput;
    output: MinimaxMusicOutput;
  };
  "fal-ai/minimax-music/v1.5": {
    input: MinimaxMusicV15Input;
    output: MinimaxMusicV15Output;
  };
  "fal-ai/minimax-music/v2": {
    input: MinimaxMusicV2Input;
    output: MinimaxMusicV2Output;
  };
  "fal-ai/minimax-music/v2.5": {
    input: MinimaxMusicV25Input;
    output: MinimaxMusicV25Output;
  };
  "fal-ai/minimax-music/v2.6": {
    input: MinimaxMusicV26Input;
    output: MinimaxMusicV26Output;
  };
  "fal-ai/mmaudio-v2/text-to-audio": {
    input: MmaudioV2TextToAudioInput;
    output: MmaudioV2TextToAudioOutput;
  };
  "fal-ai/nova-sr": {
    input: NovaSrInput;
    output: NovaSrOutput;
  };
  "fal-ai/personaplex": {
    input: PersonaplexInput;
    output: PersonaplexOutput;
  };
  "fal-ai/personaplex/realtime": {
    input: PersonaplexRealtimeInput;
    output: PersonaplexRealtimeOutput;
  };
  "fal-ai/qwen-3-tts/clone-voice/0.6b": {
    input: Qwen3TtsCloneVoice06bInput;
    output: Qwen3TtsCloneVoice06bOutput;
  };
  "fal-ai/qwen-3-tts/clone-voice/1.7b": {
    input: Qwen3TtsCloneVoice17bInput;
    output: Qwen3TtsCloneVoice17bOutput;
  };
  "fal-ai/sam-audio/separate": {
    input: SamAudioSeparateInput;
    output: SamAudioSeparateOutput;
  };
  "fal-ai/sam-audio/span-separate": {
    input: SamAudioSpanSeparateInput;
    output: SamAudioSpanSeparateOutput;
  };
  "fal-ai/sam-audio/visual-separate": {
    input: SamAudioVisualSeparateInput;
    output: SamAudioVisualSeparateOutput;
  };
  "fal-ai/stable-audio": {
    input: StableAudioInput;
    output: StableAudioOutput;
  };
  "fal-ai/stable-audio-25/audio-to-audio": {
    input: StableAudio25AudioToAudioInput;
    output: StableAudio25AudioToAudioOutput;
  };
  "fal-ai/stable-audio-25/inpaint": {
    input: StableAudio25InpaintInput;
    output: StableAudio25InpaintOutput;
  };
  "fal-ai/stable-audio-25/text-to-audio": {
    input: StableAudio25TextToAudioInput;
    output: StableAudio25TextToAudioOutput;
  };
  "fal-ai/tada/1b/text-to-speech": {
    input: Tada1bTextToSpeechInput;
    output: Tada1bTextToSpeechOutput;
  };
  "fal-ai/tada/3b/text-to-speech": {
    input: Tada3bTextToSpeechInput;
    output: Tada3bTextToSpeechOutput;
  };
  "fal-ai/workflow-utilities/audio-compressor": {
    input: WorkflowUtilitiesAudioCompressorInput;
    output: WorkflowUtilitiesAudioCompressorOutput;
  };
  "fal-ai/workflow-utilities/impulse-response": {
    input: WorkflowUtilitiesImpulseResponseInput;
    output: WorkflowUtilitiesImpulseResponseOutput;
  };
  "fal-ai/yue": {
    input: YueInput;
    output: YueOutput;
  };
  "fal-ai/zonos": {
    input: ZonosInput;
    output: ZonosOutput;
  };
  "mirelo-ai/sfx-v1.5/video-to-audio": {
    input: SfxV15VideoToAudioInput;
    output: SfxV15VideoToAudioOutput;
  };
  "mirelo-ai/sfx-v1/video-to-audio": {
    input: SfxV1VideoToAudioInput;
    output: SfxV1VideoToAudioOutput;
  };
  "sonauto/v2/extend": {
    input: V2ExtendInput;
    output: V2ExtendOutput;
  };
  "sonauto/v2/inpaint": {
    input: V2InpaintInput;
    output: V2InpaintOutput;
  };
  "sonauto/v2/text-to-music": {
    input: V2TextToMusicInput;
    output: V2TextToMusicOutput;
  };
};

/** Union type of all audio model endpoint IDs */
export type AudioModel = keyof AudioEndpointMap;

/** Get the input type for a specific audio model */
export type AudioModelInput<T extends AudioModel> =
  AudioEndpointMap[T]["input"];

/** Get the output type for a specific audio model */
export type AudioModelOutput<T extends AudioModel> =
  AudioEndpointMap[T]["output"];
