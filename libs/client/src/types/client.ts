import { EndpointTypeMap } from "./endpoints";

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
