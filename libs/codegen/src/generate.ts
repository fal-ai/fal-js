import { camelCase, pascalCase } from 'change-case';
import * as prettier from 'prettier';
import {
  FunctionDeclarationStructure,
  ImportDeclarationStructure,
  InterfaceDeclarationStructure,
  ParameterDeclarationStructure,
  Project,
  PropertySignatureStructure,
  SourceFileStructure,
  StatementStructures,
  StructureKind,
} from 'ts-morph';
import { IsolateFunctionMetadata, IsolateFunctionParameter } from './types';

const CORE_TYPES = {
  str: 'string',
} as const;

function generateProperty(
  param: IsolateFunctionParameter
): PropertySignatureStructure {
  return {
    kind: StructureKind.PropertySignature,
    name: param.name,
    isReadonly: true,
    type: CORE_TYPES[param.type],
    hasQuestionToken: !param.isRequired,
  };
}

export function generateFunction(metadata: IsolateFunctionMetadata): string {
  const identifier = camelCase(metadata.name);
  const typename = pascalCase(metadata.name);

  const members: StatementStructures[] = [];

  members.push({
    kind: StructureKind.ImportDeclaration,
    namedImports: ['run'],
    moduleSpecifier: '@fal-ai/koldstart-client',
  } as ImportDeclarationStructure);
  members.push({
    kind: StructureKind.ImportDeclaration,
    namedImports: ['credentials'],
    moduleSpecifier: '../credentials',
  } as ImportDeclarationStructure);

  const inputTypename = `${typename}Input`;
  const inputType = {
    name: inputTypename,
    properties: metadata.parameters.map(generateProperty),
  } as InterfaceDeclarationStructure;
  members.push(inputType);

  const onData: ParameterDeclarationStructure = {
    kind: StructureKind.Parameter,
    name: 'onData',
    type: '(data: string) => void',
  };
  const isolatedFunction: FunctionDeclarationStructure = {
    kind: StructureKind.Function,
    isExported: true,
    name: identifier,
    parameters: [
      {
        name: 'input',
        type: inputTypename,
      },
      onData,
    ],
    returnType: metadata.returnType
      ? CORE_TYPES[metadata.returnType]
      : undefined,
    statements: (writer) => {
      writer.write('return run(').block(() => {
        writer.writeLine(`host: '${metadata.config.host}'`);
        writer.writeLine('credentials');
        writer.writeLine(
          `environmentKind: '${metadata.config.environmentKind}'`
        );
        writer.writeLine(
          `requirements: ${JSON.stringify(metadata.config.requirements)}`
        );
        writer.writeLine(`definition: '${metadata.definition}'`);
      });
      writer.writeLine(');');
    },
  };
  members.push(isolatedFunction);

  const project = new Project();
  const source: SourceFileStructure = {
    kind: StructureKind.SourceFile,
    statements: members,
  };
  const filepath = `src/${identifier}.ts`;
  const file = project.createSourceFile(filepath, source);

  return prettier.format(file.print(), {
    filepath,
  });
}
