// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import { z } from "zod";

import {
  zQueueStatus,
  zWorkflowUtilitiesPickImageByIndexInput,
} from "./zod.gen";

/** Zod schema for workflow endpoints using discriminatedUnion */
export const WorkflowEndpointSchema = z.discriminatedUnion("endpoint", [
  z.object({
    endpoint: z.literal("fal-ai/workflow-utilities/pick-image-by-index"),
    input: zWorkflowUtilitiesPickImageByIndexInput,
    output: zQueueStatus,
  }),
]);

/** Inferred type from WorkflowEndpointSchema */
export type WorkflowEndpoint = z.infer<typeof WorkflowEndpointSchema>;
