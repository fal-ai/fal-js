// AUTO-GENERATED - Do not edit manually
// Generated from types.gen.ts via scripts/generate-endpoint-maps.ts

import type {
  AiDetectorDetectTextInput,
  AiDetectorDetectTextOutput,
  ElevenlabsSpeechToTextInput,
  ElevenlabsSpeechToTextOutput,
  ElevenlabsSpeechToTextScribeV2Input,
  ElevenlabsSpeechToTextScribeV2Output,
  NemotronAsrInput,
  NemotronAsrOutput,
  NemotronAsrStreamInput,
  NemotronAsrStreamOutput,
  RouterVideoEnterpriseInput,
  RouterVideoEnterpriseOutput,
  RouterVideoInput,
  RouterVideoOutput,
  SileroVadInput,
  SileroVadOutput,
  SmartTurnInput,
  SmartTurnOutput,
  SpeechToTextInput,
  SpeechToTextOutput,
  SpeechToTextStreamInput,
  SpeechToTextStreamOutput,
  SpeechToTextTurboInput,
  SpeechToTextTurboOutput,
  SpeechToTextTurboStreamInput,
  SpeechToTextTurboStreamOutput,
  WhisperInput,
  WhisperOutput,
  WizperInput,
  WizperOutput,
} from "./types.gen";

export type TextEndpointMap = {
  "fal-ai/nemotron/asr/stream": {
    input: NemotronAsrStreamInput;
    output: NemotronAsrStreamOutput;
  };
  "fal-ai/nemotron/asr": {
    input: NemotronAsrInput;
    output: NemotronAsrOutput;
  };
  "fal-ai/silero-vad": {
    input: SileroVadInput;
    output: SileroVadOutput;
  };
  "fal-ai/elevenlabs/speech-to-text/scribe-v2": {
    input: ElevenlabsSpeechToTextScribeV2Input;
    output: ElevenlabsSpeechToTextScribeV2Output;
  };
  "fal-ai/smart-turn": {
    input: SmartTurnInput;
    output: SmartTurnOutput;
  };
  "fal-ai/speech-to-text/turbo": {
    input: SpeechToTextTurboInput;
    output: SpeechToTextTurboOutput;
  };
  "fal-ai/speech-to-text/turbo/stream": {
    input: SpeechToTextTurboStreamInput;
    output: SpeechToTextTurboStreamOutput;
  };
  "fal-ai/speech-to-text/stream": {
    input: SpeechToTextStreamInput;
    output: SpeechToTextStreamOutput;
  };
  "fal-ai/speech-to-text": {
    input: SpeechToTextInput;
    output: SpeechToTextOutput;
  };
  "fal-ai/elevenlabs/speech-to-text": {
    input: ElevenlabsSpeechToTextInput;
    output: ElevenlabsSpeechToTextOutput;
  };
  "fal-ai/wizper": {
    input: WizperInput;
    output: WizperOutput;
  };
  "fal-ai/whisper": {
    input: WhisperInput;
    output: WhisperOutput;
  };
  "half-moon-ai/ai-detector/detect-text": {
    input: AiDetectorDetectTextInput;
    output: AiDetectorDetectTextOutput;
  };
  "openrouter/router/video/enterprise": {
    input: RouterVideoEnterpriseInput;
    output: RouterVideoEnterpriseOutput;
  };
  "openrouter/router/video": {
    input: RouterVideoInput;
    output: RouterVideoOutput;
  };
};

/** Union type of all text model endpoint IDs */
export type TextModel = keyof TextEndpointMap;

/** Get the input type for a specific text model */
export type TextModelInput<T extends TextModel> = TextEndpointMap[T]["input"];

/** Get the output type for a specific text model */
export type TextModelOutput<T extends TextModel> = TextEndpointMap[T]["output"];
