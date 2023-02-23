// package:
// file: common.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class SerializedObject extends jspb.Message {
  getMethod(): string;
  setMethod(value: string): SerializedObject;
  getDefinition(): Uint8Array | string;
  getDefinition_asU8(): Uint8Array;
  getDefinition_asB64(): string;
  setDefinition(value: Uint8Array | string): SerializedObject;
  getWasItRaised(): boolean;
  setWasItRaised(value: boolean): SerializedObject;

  hasStringizedTraceback(): boolean;
  clearStringizedTraceback(): void;
  getStringizedTraceback(): string | undefined;
  setStringizedTraceback(value: string): SerializedObject;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SerializedObject.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: SerializedObject
  ): SerializedObject.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: SerializedObject,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): SerializedObject;
  static deserializeBinaryFromReader(
    message: SerializedObject,
    reader: jspb.BinaryReader
  ): SerializedObject;
}

export namespace SerializedObject {
  export type AsObject = {
    method: string;
    definition: Uint8Array | string;
    wasItRaised: boolean;
    stringizedTraceback?: string;
  };
}

export class PartialRunResult extends jspb.Message {
  getIsComplete(): boolean;
  setIsComplete(value: boolean): PartialRunResult;
  clearLogsList(): void;
  getLogsList(): Array<Log>;
  setLogsList(value: Array<Log>): PartialRunResult;
  addLogs(value?: Log, index?: number): Log;

  hasResult(): boolean;
  clearResult(): void;
  getResult(): SerializedObject | undefined;
  setResult(value?: SerializedObject): PartialRunResult;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PartialRunResult.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: PartialRunResult
  ): PartialRunResult.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: PartialRunResult,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): PartialRunResult;
  static deserializeBinaryFromReader(
    message: PartialRunResult,
    reader: jspb.BinaryReader
  ): PartialRunResult;
}

export namespace PartialRunResult {
  export type AsObject = {
    isComplete: boolean;
    logsList: Array<Log.AsObject>;
    result?: SerializedObject.AsObject;
  };
}

export class Log extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): Log;
  getSource(): LogSource;
  setSource(value: LogSource): Log;
  getLevel(): LogLevel;
  setLevel(value: LogLevel): Log;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Log.AsObject;
  static toObject(includeInstance: boolean, msg: Log): Log.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(message: Log, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Log;
  static deserializeBinaryFromReader(
    message: Log,
    reader: jspb.BinaryReader
  ): Log;
}

export namespace Log {
  export type AsObject = {
    message: string;
    source: LogSource;
    level: LogLevel;
  };
}

export enum LogSource {
  BUILDER = 0,
  BRIDGE = 1,
  USER = 2,
}

export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARNING = 3,
  ERROR = 4,
  STDOUT = 5,
  STDERR = 6,
}
