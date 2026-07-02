// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import type { Gen3dEndpointMap } from "./3d/endpoint-map";
import type { AudioEndpointMap } from "./audio/endpoint-map";
import type { ImageEndpointMap } from "./image/endpoint-map";
import type { JsonEndpointMap } from "./json/endpoint-map";
import type { LlmEndpointMap } from "./llm/endpoint-map";
import type { SpeechEndpointMap } from "./speech/endpoint-map";
import type { TextEndpointMap } from "./text/endpoint-map";
import type { TrainingEndpointMap } from "./training/endpoint-map";
import type { UnknownEndpointMap } from "./unknown/endpoint-map";
import type { VideoEndpointMap } from "./video/endpoint-map";
import type { VisionEndpointMap } from "./vision/endpoint-map";

/** Combined EndpointTypeMap for all fal.ai endpoints */
export type EndpointTypeMap = Gen3dEndpointMap &
  AudioEndpointMap &
  ImageEndpointMap &
  JsonEndpointMap &
  LlmEndpointMap &
  SpeechEndpointMap &
  TextEndpointMap &
  TrainingEndpointMap &
  UnknownEndpointMap &
  VideoEndpointMap &
  VisionEndpointMap;
