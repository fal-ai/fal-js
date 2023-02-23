// package:
// file: server.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from 'google-protobuf';
import * as google_protobuf_struct_pb from 'google-protobuf/google/protobuf/struct_pb';
import * as common_pb from './common_pb';

export class BoundFunction extends jspb.Message {
  clearEnvironmentsList(): void;
  getEnvironmentsList(): Array<EnvironmentDefinition>;
  setEnvironmentsList(value: Array<EnvironmentDefinition>): BoundFunction;
  addEnvironments(
    value?: EnvironmentDefinition,
    index?: number
  ): EnvironmentDefinition;

  hasFunction(): boolean;
  clearFunction(): void;
  getFunction(): common_pb.SerializedObject | undefined;
  setFunction(value?: common_pb.SerializedObject): BoundFunction;

  hasSetupFunc(): boolean;
  clearSetupFunc(): void;
  getSetupFunc(): common_pb.SerializedObject | undefined;
  setSetupFunc(value?: common_pb.SerializedObject): BoundFunction;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BoundFunction.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: BoundFunction
  ): BoundFunction.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: BoundFunction,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): BoundFunction;
  static deserializeBinaryFromReader(
    message: BoundFunction,
    reader: jspb.BinaryReader
  ): BoundFunction;
}

export namespace BoundFunction {
  export type AsObject = {
    environmentsList: Array<EnvironmentDefinition.AsObject>;
    pb_function?: common_pb.SerializedObject.AsObject;
    setupFunc?: common_pb.SerializedObject.AsObject;
  };
}

export class EnvironmentDefinition extends jspb.Message {
  getKind(): string;
  setKind(value: string): EnvironmentDefinition;

  hasConfiguration(): boolean;
  clearConfiguration(): void;
  getConfiguration(): google_protobuf_struct_pb.Struct | undefined;
  setConfiguration(
    value?: google_protobuf_struct_pb.Struct
  ): EnvironmentDefinition;
  getForce(): boolean;
  setForce(value: boolean): EnvironmentDefinition;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EnvironmentDefinition.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: EnvironmentDefinition
  ): EnvironmentDefinition.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: EnvironmentDefinition,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): EnvironmentDefinition;
  static deserializeBinaryFromReader(
    message: EnvironmentDefinition,
    reader: jspb.BinaryReader
  ): EnvironmentDefinition;
}

export namespace EnvironmentDefinition {
  export type AsObject = {
    kind: string;
    configuration?: google_protobuf_struct_pb.Struct.AsObject;
    force: boolean;
  };
}
