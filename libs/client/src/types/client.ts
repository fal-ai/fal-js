// `EndpointTypeMap` is declared in the entry point rather than here so that
// `@fal-ai/types` can extend it with `declare module "@fal-ai/client"`. The
// import is type-only, so this cycle is erased at build time.
import type { EndpointTypeMap } from "../index";

// eslint-disable-next-line @typescript-eslint/ban-types
export type EndpointType = keyof EndpointTypeMap | (string & {});

// Get input type based on endpoint ID
export type InputType<T extends string> = T extends keyof EndpointTypeMap
  ? EndpointTypeMap[T]["input"]
  : Record<string, any>;

// Get output type based on endpoint ID
export type OutputType<T extends string> = T extends keyof EndpointTypeMap
  ? EndpointTypeMap[T]["output"]
  : any;
