// package: controller
// file: controller.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from 'google-protobuf';
import * as google_protobuf_timestamp_pb from 'google-protobuf/google/protobuf/timestamp_pb';
import * as common_pb from './common_pb';
import * as server_pb from './server_pb';

export class HostedMap extends jspb.Message {
  clearEnvironmentsList(): void;
  getEnvironmentsList(): Array<server_pb.EnvironmentDefinition>;
  setEnvironmentsList(value: Array<server_pb.EnvironmentDefinition>): HostedMap;
  addEnvironments(
    value?: server_pb.EnvironmentDefinition,
    index?: number
  ): server_pb.EnvironmentDefinition;

  hasMachineRequirements(): boolean;
  clearMachineRequirements(): void;
  getMachineRequirements(): MachineRequirements | undefined;
  setMachineRequirements(value?: MachineRequirements): HostedMap;

  hasFunction(): boolean;
  clearFunction(): void;
  getFunction(): common_pb.SerializedObject | undefined;
  setFunction(value?: common_pb.SerializedObject): HostedMap;
  clearInputsList(): void;
  getInputsList(): Array<common_pb.SerializedObject>;
  setInputsList(value: Array<common_pb.SerializedObject>): HostedMap;
  addInputs(
    value?: common_pb.SerializedObject,
    index?: number
  ): common_pb.SerializedObject;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HostedMap.AsObject;
  static toObject(includeInstance: boolean, msg: HostedMap): HostedMap.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: HostedMap,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): HostedMap;
  static deserializeBinaryFromReader(
    message: HostedMap,
    reader: jspb.BinaryReader
  ): HostedMap;
}

export namespace HostedMap {
  export type AsObject = {
    environmentsList: Array<server_pb.EnvironmentDefinition.AsObject>;
    machineRequirements?: MachineRequirements.AsObject;
    pb_function?: common_pb.SerializedObject.AsObject;
    inputsList: Array<common_pb.SerializedObject.AsObject>;
  };
}

export class HostedRun extends jspb.Message {
  clearEnvironmentsList(): void;
  getEnvironmentsList(): Array<server_pb.EnvironmentDefinition>;
  setEnvironmentsList(value: Array<server_pb.EnvironmentDefinition>): HostedRun;
  addEnvironments(
    value?: server_pb.EnvironmentDefinition,
    index?: number
  ): server_pb.EnvironmentDefinition;

  hasMachineRequirements(): boolean;
  clearMachineRequirements(): void;
  getMachineRequirements(): MachineRequirements | undefined;
  setMachineRequirements(value?: MachineRequirements): HostedRun;

  hasFunction(): boolean;
  clearFunction(): void;
  getFunction(): common_pb.SerializedObject | undefined;
  setFunction(value?: common_pb.SerializedObject): HostedRun;

  hasSetupFunc(): boolean;
  clearSetupFunc(): void;
  getSetupFunc(): common_pb.SerializedObject | undefined;
  setSetupFunc(value?: common_pb.SerializedObject): HostedRun;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HostedRun.AsObject;
  static toObject(includeInstance: boolean, msg: HostedRun): HostedRun.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: HostedRun,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): HostedRun;
  static deserializeBinaryFromReader(
    message: HostedRun,
    reader: jspb.BinaryReader
  ): HostedRun;
}

export namespace HostedRun {
  export type AsObject = {
    environmentsList: Array<server_pb.EnvironmentDefinition.AsObject>;
    machineRequirements?: MachineRequirements.AsObject;
    pb_function?: common_pb.SerializedObject.AsObject;
    setupFunc?: common_pb.SerializedObject.AsObject;
  };
}

export class HostedRunCron extends jspb.Message {
  clearEnvironmentsList(): void;
  getEnvironmentsList(): Array<server_pb.EnvironmentDefinition>;
  setEnvironmentsList(
    value: Array<server_pb.EnvironmentDefinition>
  ): HostedRunCron;
  addEnvironments(
    value?: server_pb.EnvironmentDefinition,
    index?: number
  ): server_pb.EnvironmentDefinition;

  hasMachineRequirements(): boolean;
  clearMachineRequirements(): void;
  getMachineRequirements(): MachineRequirements | undefined;
  setMachineRequirements(value?: MachineRequirements): HostedRunCron;

  hasFunction(): boolean;
  clearFunction(): void;
  getFunction(): common_pb.SerializedObject | undefined;
  setFunction(value?: common_pb.SerializedObject): HostedRunCron;
  getCron(): string;
  setCron(value: string): HostedRunCron;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HostedRunCron.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: HostedRunCron
  ): HostedRunCron.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: HostedRunCron,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): HostedRunCron;
  static deserializeBinaryFromReader(
    message: HostedRunCron,
    reader: jspb.BinaryReader
  ): HostedRunCron;
}

export namespace HostedRunCron {
  export type AsObject = {
    environmentsList: Array<server_pb.EnvironmentDefinition.AsObject>;
    machineRequirements?: MachineRequirements.AsObject;
    pb_function?: common_pb.SerializedObject.AsObject;
    cron: string;
  };
}

export class CancelScheduledRunRequest extends jspb.Message {
  getRunId(): string;
  setRunId(value: string): CancelScheduledRunRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CancelScheduledRunRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: CancelScheduledRunRequest
  ): CancelScheduledRunRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: CancelScheduledRunRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): CancelScheduledRunRequest;
  static deserializeBinaryFromReader(
    message: CancelScheduledRunRequest,
    reader: jspb.BinaryReader
  ): CancelScheduledRunRequest;
}

export namespace CancelScheduledRunRequest {
  export type AsObject = {
    runId: string;
  };
}

export class CancelScheduledRunResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CancelScheduledRunResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: CancelScheduledRunResponse
  ): CancelScheduledRunResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: CancelScheduledRunResponse,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): CancelScheduledRunResponse;
  static deserializeBinaryFromReader(
    message: CancelScheduledRunResponse,
    reader: jspb.BinaryReader
  ): CancelScheduledRunResponse;
}

export namespace CancelScheduledRunResponse {
  export type AsObject = {};
}

export class ListScheduledRunsRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListScheduledRunsRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: ListScheduledRunsRequest
  ): ListScheduledRunsRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: ListScheduledRunsRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): ListScheduledRunsRequest;
  static deserializeBinaryFromReader(
    message: ListScheduledRunsRequest,
    reader: jspb.BinaryReader
  ): ListScheduledRunsRequest;
}

export namespace ListScheduledRunsRequest {
  export type AsObject = {};
}

export class ListScheduledRunActivationsRequest extends jspb.Message {
  getRunId(): string;
  setRunId(value: string): ListScheduledRunActivationsRequest;

  serializeBinary(): Uint8Array;
  toObject(
    includeInstance?: boolean
  ): ListScheduledRunActivationsRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: ListScheduledRunActivationsRequest
  ): ListScheduledRunActivationsRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: ListScheduledRunActivationsRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(
    bytes: Uint8Array
  ): ListScheduledRunActivationsRequest;
  static deserializeBinaryFromReader(
    message: ListScheduledRunActivationsRequest,
    reader: jspb.BinaryReader
  ): ListScheduledRunActivationsRequest;
}

export namespace ListScheduledRunActivationsRequest {
  export type AsObject = {
    runId: string;
  };
}

export class ListScheduledRunActivationsResponse extends jspb.Message {
  clearActivationIdsList(): void;
  getActivationIdsList(): Array<string>;
  setActivationIdsList(
    value: Array<string>
  ): ListScheduledRunActivationsResponse;
  addActivationIds(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(
    includeInstance?: boolean
  ): ListScheduledRunActivationsResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: ListScheduledRunActivationsResponse
  ): ListScheduledRunActivationsResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: ListScheduledRunActivationsResponse,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(
    bytes: Uint8Array
  ): ListScheduledRunActivationsResponse;
  static deserializeBinaryFromReader(
    message: ListScheduledRunActivationsResponse,
    reader: jspb.BinaryReader
  ): ListScheduledRunActivationsResponse;
}

export namespace ListScheduledRunActivationsResponse {
  export type AsObject = {
    activationIdsList: Array<string>;
  };
}

export class ListScheduledRunsResponse extends jspb.Message {
  clearScheduledRunsList(): void;
  getScheduledRunsList(): Array<ScheduleInfo>;
  setScheduledRunsList(value: Array<ScheduleInfo>): ListScheduledRunsResponse;
  addScheduledRuns(value?: ScheduleInfo, index?: number): ScheduleInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListScheduledRunsResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: ListScheduledRunsResponse
  ): ListScheduledRunsResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: ListScheduledRunsResponse,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): ListScheduledRunsResponse;
  static deserializeBinaryFromReader(
    message: ListScheduledRunsResponse,
    reader: jspb.BinaryReader
  ): ListScheduledRunsResponse;
}

export namespace ListScheduledRunsResponse {
  export type AsObject = {
    scheduledRunsList: Array<ScheduleInfo.AsObject>;
  };
}

export class GetScheduledActivationLogsRequest extends jspb.Message {
  getRunId(): string;
  setRunId(value: string): GetScheduledActivationLogsRequest;
  getActivationId(): string;
  setActivationId(value: string): GetScheduledActivationLogsRequest;

  serializeBinary(): Uint8Array;
  toObject(
    includeInstance?: boolean
  ): GetScheduledActivationLogsRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: GetScheduledActivationLogsRequest
  ): GetScheduledActivationLogsRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: GetScheduledActivationLogsRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(
    bytes: Uint8Array
  ): GetScheduledActivationLogsRequest;
  static deserializeBinaryFromReader(
    message: GetScheduledActivationLogsRequest,
    reader: jspb.BinaryReader
  ): GetScheduledActivationLogsRequest;
}

export namespace GetScheduledActivationLogsRequest {
  export type AsObject = {
    runId: string;
    activationId: string;
  };
}

export class GetScheduledActivationLogsResponse extends jspb.Message {
  getRawLogs(): Uint8Array | string;
  getRawLogs_asU8(): Uint8Array;
  getRawLogs_asB64(): string;
  setRawLogs(value: Uint8Array | string): GetScheduledActivationLogsResponse;

  serializeBinary(): Uint8Array;
  toObject(
    includeInstance?: boolean
  ): GetScheduledActivationLogsResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: GetScheduledActivationLogsResponse
  ): GetScheduledActivationLogsResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: GetScheduledActivationLogsResponse,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(
    bytes: Uint8Array
  ): GetScheduledActivationLogsResponse;
  static deserializeBinaryFromReader(
    message: GetScheduledActivationLogsResponse,
    reader: jspb.BinaryReader
  ): GetScheduledActivationLogsResponse;
}

export namespace GetScheduledActivationLogsResponse {
  export type AsObject = {
    rawLogs: Uint8Array | string;
  };
}

export class CreateUserKeyRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateUserKeyRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: CreateUserKeyRequest
  ): CreateUserKeyRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: CreateUserKeyRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): CreateUserKeyRequest;
  static deserializeBinaryFromReader(
    message: CreateUserKeyRequest,
    reader: jspb.BinaryReader
  ): CreateUserKeyRequest;
}

export namespace CreateUserKeyRequest {
  export type AsObject = {};
}

export class CreateUserKeyResponse extends jspb.Message {
  getKeySecret(): string;
  setKeySecret(value: string): CreateUserKeyResponse;
  getKeyId(): string;
  setKeyId(value: string): CreateUserKeyResponse;

  hasDescription(): boolean;
  clearDescription(): void;
  getDescription(): string | undefined;
  setDescription(value: string): CreateUserKeyResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateUserKeyResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: CreateUserKeyResponse
  ): CreateUserKeyResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: CreateUserKeyResponse,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): CreateUserKeyResponse;
  static deserializeBinaryFromReader(
    message: CreateUserKeyResponse,
    reader: jspb.BinaryReader
  ): CreateUserKeyResponse;
}

export namespace CreateUserKeyResponse {
  export type AsObject = {
    keySecret: string;
    keyId: string;
    description?: string;
  };
}

export class ListUserKeysRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListUserKeysRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: ListUserKeysRequest
  ): ListUserKeysRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: ListUserKeysRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): ListUserKeysRequest;
  static deserializeBinaryFromReader(
    message: ListUserKeysRequest,
    reader: jspb.BinaryReader
  ): ListUserKeysRequest;
}

export namespace ListUserKeysRequest {
  export type AsObject = {};
}

export class ListUserKeysResponse extends jspb.Message {
  clearUserKeysList(): void;
  getUserKeysList(): Array<UserKeyInfo>;
  setUserKeysList(value: Array<UserKeyInfo>): ListUserKeysResponse;
  addUserKeys(value?: UserKeyInfo, index?: number): UserKeyInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListUserKeysResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: ListUserKeysResponse
  ): ListUserKeysResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: ListUserKeysResponse,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): ListUserKeysResponse;
  static deserializeBinaryFromReader(
    message: ListUserKeysResponse,
    reader: jspb.BinaryReader
  ): ListUserKeysResponse;
}

export namespace ListUserKeysResponse {
  export type AsObject = {
    userKeysList: Array<UserKeyInfo.AsObject>;
  };
}

export class RevokeUserKeyRequest extends jspb.Message {
  getKeyId(): string;
  setKeyId(value: string): RevokeUserKeyRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RevokeUserKeyRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: RevokeUserKeyRequest
  ): RevokeUserKeyRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: RevokeUserKeyRequest,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): RevokeUserKeyRequest;
  static deserializeBinaryFromReader(
    message: RevokeUserKeyRequest,
    reader: jspb.BinaryReader
  ): RevokeUserKeyRequest;
}

export namespace RevokeUserKeyRequest {
  export type AsObject = {
    keyId: string;
  };
}

export class RevokeUserKeyResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RevokeUserKeyResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: RevokeUserKeyResponse
  ): RevokeUserKeyResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: RevokeUserKeyResponse,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): RevokeUserKeyResponse;
  static deserializeBinaryFromReader(
    message: RevokeUserKeyResponse,
    reader: jspb.BinaryReader
  ): RevokeUserKeyResponse;
}

export namespace RevokeUserKeyResponse {
  export type AsObject = {};
}

export class UserKeyInfo extends jspb.Message {
  getKeyId(): string;
  setKeyId(value: string): UserKeyInfo;

  hasCreatedAt(): boolean;
  clearCreatedAt(): void;
  getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): UserKeyInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UserKeyInfo.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: UserKeyInfo
  ): UserKeyInfo.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: UserKeyInfo,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): UserKeyInfo;
  static deserializeBinaryFromReader(
    message: UserKeyInfo,
    reader: jspb.BinaryReader
  ): UserKeyInfo;
}

export namespace UserKeyInfo {
  export type AsObject = {
    keyId: string;
    createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class ScheduleInfo extends jspb.Message {
  getRunId(): string;
  setRunId(value: string): ScheduleInfo;
  getState(): ScheduleInfo.State;
  setState(value: ScheduleInfo.State): ScheduleInfo;
  getCron(): string;
  setCron(value: string): ScheduleInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ScheduleInfo.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: ScheduleInfo
  ): ScheduleInfo.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: ScheduleInfo,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): ScheduleInfo;
  static deserializeBinaryFromReader(
    message: ScheduleInfo,
    reader: jspb.BinaryReader
  ): ScheduleInfo;
}

export namespace ScheduleInfo {
  export type AsObject = {
    runId: string;
    state: ScheduleInfo.State;
    cron: string;
  };

  export enum State {
    SCHEDULED = 0,
    INTERNAL_FAILURE = 1,
    CANCELLED = 2,
  }
}

export class HostedRunResult extends jspb.Message {
  getRunId(): string;
  setRunId(value: string): HostedRunResult;

  hasStatus(): boolean;
  clearStatus(): void;
  getStatus(): HostedRunStatus | undefined;
  setStatus(value?: HostedRunStatus): HostedRunResult;
  clearLogsList(): void;
  getLogsList(): Array<common_pb.Log>;
  setLogsList(value: Array<common_pb.Log>): HostedRunResult;
  addLogs(value?: common_pb.Log, index?: number): common_pb.Log;

  hasReturnValue(): boolean;
  clearReturnValue(): void;
  getReturnValue(): common_pb.SerializedObject | undefined;
  setReturnValue(value?: common_pb.SerializedObject): HostedRunResult;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HostedRunResult.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: HostedRunResult
  ): HostedRunResult.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: HostedRunResult,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): HostedRunResult;
  static deserializeBinaryFromReader(
    message: HostedRunResult,
    reader: jspb.BinaryReader
  ): HostedRunResult;
}

export namespace HostedRunResult {
  export type AsObject = {
    runId: string;
    status?: HostedRunStatus.AsObject;
    logsList: Array<common_pb.Log.AsObject>;
    returnValue?: common_pb.SerializedObject.AsObject;
  };
}

export class HostedRunStatus extends jspb.Message {
  getState(): HostedRunStatus.State;
  setState(value: HostedRunStatus.State): HostedRunStatus;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HostedRunStatus.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: HostedRunStatus
  ): HostedRunStatus.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: HostedRunStatus,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): HostedRunStatus;
  static deserializeBinaryFromReader(
    message: HostedRunStatus,
    reader: jspb.BinaryReader
  ): HostedRunStatus;
}

export namespace HostedRunStatus {
  export type AsObject = {
    state: HostedRunStatus.State;
  };

  export enum State {
    IN_PROGRESS = 0,
    SUCCESS = 1,
    INTERNAL_FAILURE = 2,
  }
}

export class MachineRequirements extends jspb.Message {
  getMachineType(): string;
  setMachineType(value: string): MachineRequirements;

  hasKeepAlive(): boolean;
  clearKeepAlive(): void;
  getKeepAlive(): number | undefined;
  setKeepAlive(value: number): MachineRequirements;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MachineRequirements.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: MachineRequirements
  ): MachineRequirements.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: MachineRequirements,
    writer: jspb.BinaryWriter
  ): void;
  static deserializeBinary(bytes: Uint8Array): MachineRequirements;
  static deserializeBinaryFromReader(
    message: MachineRequirements,
    reader: jspb.BinaryReader
  ): MachineRequirements;
}

export namespace MachineRequirements {
  export type AsObject = {
    machineType: string;
    keepAlive?: number;
  };
}
