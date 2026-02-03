// AUTO-GENERATED - Do not edit manually
// Generated from types.gen.ts via scripts/generate-endpoint-maps.ts

import type {
  ChatterboxSpeechToSpeechInput,
  ChatterboxSpeechToSpeechOutput,
  ChatterboxTextToSpeechInput,
  ChatterboxTextToSpeechMultilingualInput,
  ChatterboxTextToSpeechMultilingualOutput,
  ChatterboxTextToSpeechOutput,
  ChatterboxhdSpeechToSpeechInput,
  ChatterboxhdSpeechToSpeechOutput,
  ChatterboxhdTextToSpeechInput,
  ChatterboxhdTextToSpeechOutput,
  DiaTtsInput,
  DiaTtsOutput,
  ElevenlabsTtsTurboV25Input,
  ElevenlabsTtsTurboV25Output,
  IndexTts2TextToSpeechInput,
  IndexTts2TextToSpeechOutput,
  KlingVideoV1TtsInput,
  KlingVideoV1TtsOutput,
  MayaBatchInput,
  MayaBatchOutput,
  MayaInput,
  MayaOutput,
  MayaStreamInput,
  MayaStreamOutput,
  MinimaxPreviewSpeech25HdInput,
  MinimaxPreviewSpeech25HdOutput,
  MinimaxPreviewSpeech25TurboInput,
  MinimaxPreviewSpeech25TurboOutput,
  MinimaxSpeech02HdInput,
  MinimaxSpeech02HdOutput,
  MinimaxSpeech02TurboInput,
  MinimaxSpeech02TurboOutput,
  MinimaxSpeech26HdInput,
  MinimaxSpeech26HdOutput,
  MinimaxSpeech26TurboInput,
  MinimaxSpeech26TurboOutput,
  MinimaxVoiceCloneInput,
  MinimaxVoiceCloneOutput,
  MinimaxVoiceDesignInput,
  MinimaxVoiceDesignOutput,
  OrpheusTtsInput,
  OrpheusTtsOutput,
  Qwen3TtsTextToSpeech06bInput,
  Qwen3TtsTextToSpeech06bOutput,
  Qwen3TtsTextToSpeech17bInput,
  Qwen3TtsTextToSpeech17bOutput,
  Qwen3TtsVoiceDesign17bInput,
  Qwen3TtsVoiceDesign17bOutput,
  Vibevoice05bInput,
  Vibevoice05bOutput,
  Vibevoice7bInput,
  Vibevoice7bOutput,
  VibevoiceInput,
  VibevoiceOutput,
} from "./types.gen";

export type SpeechEndpointMap = {
  "resemble-ai/chatterboxhd/speech-to-speech": {
    input: ChatterboxhdSpeechToSpeechInput;
    output: ChatterboxhdSpeechToSpeechOutput;
  };
  "fal-ai/chatterbox/speech-to-speech": {
    input: ChatterboxSpeechToSpeechInput;
    output: ChatterboxSpeechToSpeechOutput;
  };
  "fal-ai/qwen-3-tts/voice-design/1.7b": {
    input: Qwen3TtsVoiceDesign17bInput;
    output: Qwen3TtsVoiceDesign17bOutput;
  };
  "fal-ai/qwen-3-tts/text-to-speech/1.7b": {
    input: Qwen3TtsTextToSpeech17bInput;
    output: Qwen3TtsTextToSpeech17bOutput;
  };
  "fal-ai/qwen-3-tts/text-to-speech/0.6b": {
    input: Qwen3TtsTextToSpeech06bInput;
    output: Qwen3TtsTextToSpeech06bOutput;
  };
  "fal-ai/vibevoice/0.5b": {
    input: Vibevoice05bInput;
    output: Vibevoice05bOutput;
  };
  "fal-ai/maya/batch": {
    input: MayaBatchInput;
    output: MayaBatchOutput;
  };
  "fal-ai/maya/stream": {
    input: MayaStreamInput;
    output: MayaStreamOutput;
  };
  "fal-ai/maya": {
    input: MayaInput;
    output: MayaOutput;
  };
  "fal-ai/minimax/speech-2.6-turbo": {
    input: MinimaxSpeech26TurboInput;
    output: MinimaxSpeech26TurboOutput;
  };
  "fal-ai/minimax/speech-2.6-hd": {
    input: MinimaxSpeech26HdInput;
    output: MinimaxSpeech26HdOutput;
  };
  "fal-ai/index-tts-2/text-to-speech": {
    input: IndexTts2TextToSpeechInput;
    output: IndexTts2TextToSpeechOutput;
  };
  "fal-ai/kling-video/v1/tts": {
    input: KlingVideoV1TtsInput;
    output: KlingVideoV1TtsOutput;
  };
  "fal-ai/chatterbox/text-to-speech/multilingual": {
    input: ChatterboxTextToSpeechMultilingualInput;
    output: ChatterboxTextToSpeechMultilingualOutput;
  };
  "fal-ai/vibevoice/7b": {
    input: Vibevoice7bInput;
    output: Vibevoice7bOutput;
  };
  "fal-ai/vibevoice": {
    input: VibevoiceInput;
    output: VibevoiceOutput;
  };
  "fal-ai/minimax/preview/speech-2.5-hd": {
    input: MinimaxPreviewSpeech25HdInput;
    output: MinimaxPreviewSpeech25HdOutput;
  };
  "fal-ai/minimax/preview/speech-2.5-turbo": {
    input: MinimaxPreviewSpeech25TurboInput;
    output: MinimaxPreviewSpeech25TurboOutput;
  };
  "fal-ai/minimax/voice-design": {
    input: MinimaxVoiceDesignInput;
    output: MinimaxVoiceDesignOutput;
  };
  "resemble-ai/chatterboxhd/text-to-speech": {
    input: ChatterboxhdTextToSpeechInput;
    output: ChatterboxhdTextToSpeechOutput;
  };
  "fal-ai/chatterbox/text-to-speech": {
    input: ChatterboxTextToSpeechInput;
    output: ChatterboxTextToSpeechOutput;
  };
  "fal-ai/minimax/voice-clone": {
    input: MinimaxVoiceCloneInput;
    output: MinimaxVoiceCloneOutput;
  };
  "fal-ai/minimax/speech-02-turbo": {
    input: MinimaxSpeech02TurboInput;
    output: MinimaxSpeech02TurboOutput;
  };
  "fal-ai/minimax/speech-02-hd": {
    input: MinimaxSpeech02HdInput;
    output: MinimaxSpeech02HdOutput;
  };
  "fal-ai/dia-tts": {
    input: DiaTtsInput;
    output: DiaTtsOutput;
  };
  "fal-ai/orpheus-tts": {
    input: OrpheusTtsInput;
    output: OrpheusTtsOutput;
  };
  "fal-ai/elevenlabs/tts/turbo-v2.5": {
    input: ElevenlabsTtsTurboV25Input;
    output: ElevenlabsTtsTurboV25Output;
  };
};

/** Union type of all speech model endpoint IDs */
export type SpeechModel = keyof SpeechEndpointMap;

/** Get the input type for a specific speech model */
export type SpeechModelInput<T extends SpeechModel> =
  SpeechEndpointMap[T]["input"];

/** Get the output type for a specific speech model */
export type SpeechModelOutput<T extends SpeechModel> =
  SpeechEndpointMap[T]["output"];
