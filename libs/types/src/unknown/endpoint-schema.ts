// AUTO-GENERATED - Do not edit manually
// Generated from types.gen.ts via scripts/generate-endpoint-maps.ts

import { z } from "zod";

import {
  zRouterAudioInput,
  zRouterAudioOutput,
  zWorkflowUtilitiesInterleaveVideoInput,
  zWorkflowUtilitiesInterleaveVideoOutput,
} from "./zod.gen";

/** Zod schema for unknown endpoints using discriminatedUnion */
export const UnknownEndpointSchema = z.discriminatedUnion("endpoint", [
  z.object({
    endpoint: z.literal("fal-ai/workflow-utilities/interleave-video"),
    input: zWorkflowUtilitiesInterleaveVideoInput,
    output: zWorkflowUtilitiesInterleaveVideoOutput,
  }),
  z.object({
    endpoint: z.literal("openrouter/router/audio"),
    input: zRouterAudioInput,
    output: zRouterAudioOutput,
  }),
]);

/** Inferred type from UnknownEndpointSchema */
export type UnknownEndpoint = z.infer<typeof UnknownEndpointSchema>;
