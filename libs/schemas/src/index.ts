// AUTO-GENERATED on update — Do not edit manually.
// This file is overwritten by scripts/generate-endpoint-maps.ts.
// Run `npm run update-schemas` from the repo root to populate it.

/** Union of only known endpoint IDs. Use this to reject unknown/custom endpoints at compile time. */
export type EndpointTypeStrict = never;

/** Union of all known endpoint IDs, plus any custom string for private endpoints. */
// eslint-disable-next-line @typescript-eslint/ban-types
export type EndpointType = EndpointTypeStrict | (string & {});

/** Get the input type for a known endpoint. Returns `never` for unknown endpoints. */
export type InputTypeStrict<T extends EndpointTypeStrict> = T extends never
  ? never
  : never;

/** Get the output type for a known endpoint. Returns `never` for unknown endpoints. */
export type OutputTypeStrict<T extends EndpointTypeStrict> = T extends never
  ? never
  : never;

/** Get the input type for an endpoint. Falls back to Record<string, any> for unknown endpoints. */
export type InputType<T extends string> = T extends never
  ? never
  : Record<string, any>;

/** Get the output type for an endpoint. Falls back to any for unknown endpoints. */
export type OutputType<T extends string> = T extends never ? never : any;
