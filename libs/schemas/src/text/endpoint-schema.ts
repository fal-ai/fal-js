// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import {
  zCohereTranscribeInput,
  zCohereTranscribeOutput,
  zElevenlabsSpeechToTextInput,
  zElevenlabsSpeechToTextOutput,
  zElevenlabsSpeechToTextScribeV2Input,
  zElevenlabsSpeechToTextScribeV2Output,
  zNemotron3NanoOmniAudioInput,
  zNemotron3NanoOmniAudioOutput,
  zNemotron3NanoOmniVideoInput,
  zNemotron3NanoOmniVideoOutput,
  zNemotron3NanoOmniVisionInput,
  zNemotron3NanoOmniVisionOutput,
  zRouterVideoEnterpriseInput,
  zRouterVideoEnterpriseOutput,
  zRouterVideoInput,
  zRouterVideoOutput,
  zSileroVadInput,
  zSileroVadOutput,
  zSmartTurnInput,
  zSmartTurnOutput,
  zSpeechToTextInput,
  zSpeechToTextOutput,
  zSpeechToTextStreamInput,
  zSpeechToTextStreamOutput,
  zSpeechToTextTurboInput,
  zSpeechToTextTurboOutput,
  zSpeechToTextTurboStreamInput,
  zSpeechToTextTurboStreamOutput,
  zWizperInput,
  zWizperOutput,
} from "./zod.gen.js";

/** Map of text endpoint id -> Zod input/output schemas. */
export const textEndpoints: {
  readonly "fal-ai/cohere-transcribe": {
    readonly input: typeof zCohereTranscribeInput;
    readonly output: typeof zCohereTranscribeOutput;
  };
  readonly "fal-ai/elevenlabs/speech-to-text": {
    readonly input: typeof zElevenlabsSpeechToTextInput;
    readonly output: typeof zElevenlabsSpeechToTextOutput;
  };
  readonly "fal-ai/elevenlabs/speech-to-text/scribe-v2": {
    readonly input: typeof zElevenlabsSpeechToTextScribeV2Input;
    readonly output: typeof zElevenlabsSpeechToTextScribeV2Output;
  };
  readonly "fal-ai/silero-vad": {
    readonly input: typeof zSileroVadInput;
    readonly output: typeof zSileroVadOutput;
  };
  readonly "fal-ai/smart-turn": {
    readonly input: typeof zSmartTurnInput;
    readonly output: typeof zSmartTurnOutput;
  };
  readonly "fal-ai/speech-to-text": {
    readonly input: typeof zSpeechToTextInput;
    readonly output: typeof zSpeechToTextOutput;
  };
  readonly "fal-ai/speech-to-text/stream": {
    readonly input: typeof zSpeechToTextStreamInput;
    readonly output: typeof zSpeechToTextStreamOutput;
  };
  readonly "fal-ai/speech-to-text/turbo": {
    readonly input: typeof zSpeechToTextTurboInput;
    readonly output: typeof zSpeechToTextTurboOutput;
  };
  readonly "fal-ai/speech-to-text/turbo/stream": {
    readonly input: typeof zSpeechToTextTurboStreamInput;
    readonly output: typeof zSpeechToTextTurboStreamOutput;
  };
  readonly "fal-ai/wizper": {
    readonly input: typeof zWizperInput;
    readonly output: typeof zWizperOutput;
  };
  readonly "nvidia/nemotron-3-nano-omni/audio": {
    readonly input: typeof zNemotron3NanoOmniAudioInput;
    readonly output: typeof zNemotron3NanoOmniAudioOutput;
  };
  readonly "nvidia/nemotron-3-nano-omni/video": {
    readonly input: typeof zNemotron3NanoOmniVideoInput;
    readonly output: typeof zNemotron3NanoOmniVideoOutput;
  };
  readonly "nvidia/nemotron-3-nano-omni/vision": {
    readonly input: typeof zNemotron3NanoOmniVisionInput;
    readonly output: typeof zNemotron3NanoOmniVisionOutput;
  };
  readonly "openrouter/router/video": {
    readonly input: typeof zRouterVideoInput;
    readonly output: typeof zRouterVideoOutput;
  };
  readonly "openrouter/router/video/enterprise": {
    readonly input: typeof zRouterVideoEnterpriseInput;
    readonly output: typeof zRouterVideoEnterpriseOutput;
  };
} = {
  "fal-ai/cohere-transcribe": {
    input: zCohereTranscribeInput,
    output: zCohereTranscribeOutput,
  },
  "fal-ai/elevenlabs/speech-to-text": {
    input: zElevenlabsSpeechToTextInput,
    output: zElevenlabsSpeechToTextOutput,
  },
  "fal-ai/elevenlabs/speech-to-text/scribe-v2": {
    input: zElevenlabsSpeechToTextScribeV2Input,
    output: zElevenlabsSpeechToTextScribeV2Output,
  },
  "fal-ai/silero-vad": { input: zSileroVadInput, output: zSileroVadOutput },
  "fal-ai/smart-turn": { input: zSmartTurnInput, output: zSmartTurnOutput },
  "fal-ai/speech-to-text": {
    input: zSpeechToTextInput,
    output: zSpeechToTextOutput,
  },
  "fal-ai/speech-to-text/stream": {
    input: zSpeechToTextStreamInput,
    output: zSpeechToTextStreamOutput,
  },
  "fal-ai/speech-to-text/turbo": {
    input: zSpeechToTextTurboInput,
    output: zSpeechToTextTurboOutput,
  },
  "fal-ai/speech-to-text/turbo/stream": {
    input: zSpeechToTextTurboStreamInput,
    output: zSpeechToTextTurboStreamOutput,
  },
  "fal-ai/wizper": { input: zWizperInput, output: zWizperOutput },
  "nvidia/nemotron-3-nano-omni/audio": {
    input: zNemotron3NanoOmniAudioInput,
    output: zNemotron3NanoOmniAudioOutput,
  },
  "nvidia/nemotron-3-nano-omni/video": {
    input: zNemotron3NanoOmniVideoInput,
    output: zNemotron3NanoOmniVideoOutput,
  },
  "nvidia/nemotron-3-nano-omni/vision": {
    input: zNemotron3NanoOmniVisionInput,
    output: zNemotron3NanoOmniVisionOutput,
  },
  "openrouter/router/video": {
    input: zRouterVideoInput,
    output: zRouterVideoOutput,
  },
  "openrouter/router/video/enterprise": {
    input: zRouterVideoEnterpriseInput,
    output: zRouterVideoEnterpriseOutput,
  },
};

/** Union of valid text endpoint ids. */
export type TextEndpointId = keyof typeof textEndpoints;
