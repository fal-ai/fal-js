// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import type {
  Gen3dModel,
  Gen3dModelInput,
  Gen3dModelOutput,
} from "./3d/endpoint-map";
import type {
  AudioModel,
  AudioModelInput,
  AudioModelOutput,
} from "./audio/endpoint-map";
import type {
  ImageModel,
  ImageModelInput,
  ImageModelOutput,
} from "./image/endpoint-map";
import type {
  JsonModel,
  JsonModelInput,
  JsonModelOutput,
} from "./json/endpoint-map";
import type {
  LlmModel,
  LlmModelInput,
  LlmModelOutput,
} from "./llm/endpoint-map";
import type {
  SpeechModel,
  SpeechModelInput,
  SpeechModelOutput,
} from "./speech/endpoint-map";
import type {
  TextModel,
  TextModelInput,
  TextModelOutput,
} from "./text/endpoint-map";
import type {
  TrainingModel,
  TrainingModelInput,
  TrainingModelOutput,
} from "./training/endpoint-map";
import type {
  UnknownModel,
  UnknownModelInput,
  UnknownModelOutput,
} from "./unknown/endpoint-map";
import type {
  VideoModel,
  VideoModelInput,
  VideoModelOutput,
} from "./video/endpoint-map";
import type {
  VisionModel,
  VisionModelInput,
  VisionModelOutput,
} from "./vision/endpoint-map";

/** Union of all endpoint IDs */
export type EndpointType =
  | Gen3dModel
  | AudioModel
  | ImageModel
  | JsonModel
  | LlmModel
  | SpeechModel
  | TextModel
  | TrainingModel
  | UnknownModel
  | VideoModel
  | VisionModel;

/** Get the input type for an endpoint */
export type InputType<T extends EndpointType> = T extends Gen3dModel
  ? Gen3dModelInput<T>
  : T extends AudioModel
    ? AudioModelInput<T>
    : T extends ImageModel
      ? ImageModelInput<T>
      : T extends JsonModel
        ? JsonModelInput<T>
        : T extends LlmModel
          ? LlmModelInput<T>
          : T extends SpeechModel
            ? SpeechModelInput<T>
            : T extends TextModel
              ? TextModelInput<T>
              : T extends TrainingModel
                ? TrainingModelInput<T>
                : T extends UnknownModel
                  ? UnknownModelInput<T>
                  : T extends VideoModel
                    ? VideoModelInput<T>
                    : T extends VisionModel
                      ? VisionModelInput<T>
                      : never;

/** Get the output type for an endpoint */
export type OutputType<T extends EndpointType> = T extends Gen3dModel
  ? Gen3dModelOutput<T>
  : T extends AudioModel
    ? AudioModelOutput<T>
    : T extends ImageModel
      ? ImageModelOutput<T>
      : T extends JsonModel
        ? JsonModelOutput<T>
        : T extends LlmModel
          ? LlmModelOutput<T>
          : T extends SpeechModel
            ? SpeechModelOutput<T>
            : T extends TextModel
              ? TextModelOutput<T>
              : T extends TrainingModel
                ? TrainingModelOutput<T>
                : T extends UnknownModel
                  ? UnknownModelOutput<T>
                  : T extends VideoModel
                    ? VideoModelOutput<T>
                    : T extends VisionModel
                      ? VisionModelOutput<T>
                      : never;
