// AUTO-GENERATED - Do not edit manually
// Generated via scripts/generate-endpoint-maps.ts

import {
  zWorkflowUtilitiesPickImageByIndexInput,
  zWorkflowUtilitiesPickImageByIndexOutput,
} from "./zod.gen.js";

/** Map of workflow endpoint id -> Zod input/output schemas. */
export const workflowEndpointZodMap: {
  readonly "fal-ai/workflow-utilities/pick-image-by-index": {
    readonly input: typeof zWorkflowUtilitiesPickImageByIndexInput;
    readonly output: typeof zWorkflowUtilitiesPickImageByIndexOutput;
  };
} = {
  "fal-ai/workflow-utilities/pick-image-by-index": {
    input: zWorkflowUtilitiesPickImageByIndexInput,
    output: zWorkflowUtilitiesPickImageByIndexOutput,
  },
};

/** Union of valid workflow endpoint ids. */
export type WorkflowEndpointId = keyof typeof workflowEndpointZodMap;
