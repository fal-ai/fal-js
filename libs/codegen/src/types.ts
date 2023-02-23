export type IsolateFunctionConfig = {
  environmentKind: string;
  requirements: string[];
  host: string;
};

export type IsolateFunctionParameter = {
  name: string;
  isRequired: boolean;
  type: string;
};

export type IsolateFunctionMetadata = {
  name: string;
  parameters: IsolateFunctionParameter[];
  returnType: string;
  definition: string;
  config: IsolateFunctionConfig;
};
