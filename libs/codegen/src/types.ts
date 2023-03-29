export type IsolateFunctionConfig = {
  env_kind: string;
  requirements: string[];
  host: string;
};

export type IsolateFunctionParameter = {
  name: string;
  is_required: boolean;
  type: string;
};

export type IsolateFunctionMetadata = {
  name: string;
  parameters: IsolateFunctionParameter[];
  return_type: string;
  definition: string;
  config: IsolateFunctionConfig;
};
