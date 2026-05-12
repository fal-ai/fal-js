// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import { z } from "zod";

import {
  zQueueStatus,
  zRouterAudioInput,
  zWorkflowUtilitiesInterleaveVideoInput,
} from "./zod.gen";

/** Zod schema for unknown endpoints using discriminatedUnion */
export const UnknownEndpointSchema = z.discriminatedUnion("endpoint", [
  z.object({
    endpoint: z.literal("fal-ai/workflow-utilities/interleave-video"),
    input: zWorkflowUtilitiesInterleaveVideoInput,
    output: zQueueStatus,
  }),
  z.object({
    endpoint: z.literal("openrouter/router/audio"),
    input: zRouterAudioInput,
    output: zQueueStatus,
  }),
]);

/** Inferred type from UnknownEndpointSchema */
export type UnknownEndpoint = z.infer<typeof UnknownEndpointSchema>;
