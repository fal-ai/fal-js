// package: controller
// file: controller.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as controller_pb from "./controller_pb";
import * as common_pb from "./common_pb";
import * as server_pb from "./server_pb";
import * as google_protobuf_timestamp_pb from "google-protobuf/google/protobuf/timestamp_pb";

interface IIsolateControllerService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    run: IIsolateControllerService_IRun;
    map: IIsolateControllerService_IMap;
    schedule: IIsolateControllerService_ISchedule;
    listScheduledRuns: IIsolateControllerService_IListScheduledRuns;
    cancelScheduledRun: IIsolateControllerService_ICancelScheduledRun;
    listScheduledRunActivations: IIsolateControllerService_IListScheduledRunActivations;
    getScheduledActivationLogs: IIsolateControllerService_IGetScheduledActivationLogs;
    createUserKey: IIsolateControllerService_ICreateUserKey;
    listUserKeys: IIsolateControllerService_IListUserKeys;
    revokeUserKey: IIsolateControllerService_IRevokeUserKey;
}

interface IIsolateControllerService_IRun extends grpc.MethodDefinition<controller_pb.HostedRun, controller_pb.HostedRunResult> {
    path: "/controller.IsolateController/Run";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<controller_pb.HostedRun>;
    requestDeserialize: grpc.deserialize<controller_pb.HostedRun>;
    responseSerialize: grpc.serialize<controller_pb.HostedRunResult>;
    responseDeserialize: grpc.deserialize<controller_pb.HostedRunResult>;
}
interface IIsolateControllerService_IMap extends grpc.MethodDefinition<controller_pb.HostedMap, controller_pb.HostedRunResult> {
    path: "/controller.IsolateController/Map";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<controller_pb.HostedMap>;
    requestDeserialize: grpc.deserialize<controller_pb.HostedMap>;
    responseSerialize: grpc.serialize<controller_pb.HostedRunResult>;
    responseDeserialize: grpc.deserialize<controller_pb.HostedRunResult>;
}
interface IIsolateControllerService_ISchedule extends grpc.MethodDefinition<controller_pb.HostedRunCron, controller_pb.ScheduleInfo> {
    path: "/controller.IsolateController/Schedule";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<controller_pb.HostedRunCron>;
    requestDeserialize: grpc.deserialize<controller_pb.HostedRunCron>;
    responseSerialize: grpc.serialize<controller_pb.ScheduleInfo>;
    responseDeserialize: grpc.deserialize<controller_pb.ScheduleInfo>;
}
interface IIsolateControllerService_IListScheduledRuns extends grpc.MethodDefinition<controller_pb.ListScheduledRunsRequest, controller_pb.ListScheduledRunsResponse> {
    path: "/controller.IsolateController/ListScheduledRuns";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<controller_pb.ListScheduledRunsRequest>;
    requestDeserialize: grpc.deserialize<controller_pb.ListScheduledRunsRequest>;
    responseSerialize: grpc.serialize<controller_pb.ListScheduledRunsResponse>;
    responseDeserialize: grpc.deserialize<controller_pb.ListScheduledRunsResponse>;
}
interface IIsolateControllerService_ICancelScheduledRun extends grpc.MethodDefinition<controller_pb.CancelScheduledRunRequest, controller_pb.CancelScheduledRunResponse> {
    path: "/controller.IsolateController/CancelScheduledRun";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<controller_pb.CancelScheduledRunRequest>;
    requestDeserialize: grpc.deserialize<controller_pb.CancelScheduledRunRequest>;
    responseSerialize: grpc.serialize<controller_pb.CancelScheduledRunResponse>;
    responseDeserialize: grpc.deserialize<controller_pb.CancelScheduledRunResponse>;
}
interface IIsolateControllerService_IListScheduledRunActivations extends grpc.MethodDefinition<controller_pb.ListScheduledRunActivationsRequest, controller_pb.ListScheduledRunActivationsResponse> {
    path: "/controller.IsolateController/ListScheduledRunActivations";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<controller_pb.ListScheduledRunActivationsRequest>;
    requestDeserialize: grpc.deserialize<controller_pb.ListScheduledRunActivationsRequest>;
    responseSerialize: grpc.serialize<controller_pb.ListScheduledRunActivationsResponse>;
    responseDeserialize: grpc.deserialize<controller_pb.ListScheduledRunActivationsResponse>;
}
interface IIsolateControllerService_IGetScheduledActivationLogs extends grpc.MethodDefinition<controller_pb.GetScheduledActivationLogsRequest, controller_pb.GetScheduledActivationLogsResponse> {
    path: "/controller.IsolateController/GetScheduledActivationLogs";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<controller_pb.GetScheduledActivationLogsRequest>;
    requestDeserialize: grpc.deserialize<controller_pb.GetScheduledActivationLogsRequest>;
    responseSerialize: grpc.serialize<controller_pb.GetScheduledActivationLogsResponse>;
    responseDeserialize: grpc.deserialize<controller_pb.GetScheduledActivationLogsResponse>;
}
interface IIsolateControllerService_ICreateUserKey extends grpc.MethodDefinition<controller_pb.CreateUserKeyRequest, controller_pb.CreateUserKeyResponse> {
    path: "/controller.IsolateController/CreateUserKey";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<controller_pb.CreateUserKeyRequest>;
    requestDeserialize: grpc.deserialize<controller_pb.CreateUserKeyRequest>;
    responseSerialize: grpc.serialize<controller_pb.CreateUserKeyResponse>;
    responseDeserialize: grpc.deserialize<controller_pb.CreateUserKeyResponse>;
}
interface IIsolateControllerService_IListUserKeys extends grpc.MethodDefinition<controller_pb.ListUserKeysRequest, controller_pb.ListUserKeysResponse> {
    path: "/controller.IsolateController/ListUserKeys";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<controller_pb.ListUserKeysRequest>;
    requestDeserialize: grpc.deserialize<controller_pb.ListUserKeysRequest>;
    responseSerialize: grpc.serialize<controller_pb.ListUserKeysResponse>;
    responseDeserialize: grpc.deserialize<controller_pb.ListUserKeysResponse>;
}
interface IIsolateControllerService_IRevokeUserKey extends grpc.MethodDefinition<controller_pb.RevokeUserKeyRequest, controller_pb.RevokeUserKeyResponse> {
    path: "/controller.IsolateController/RevokeUserKey";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<controller_pb.RevokeUserKeyRequest>;
    requestDeserialize: grpc.deserialize<controller_pb.RevokeUserKeyRequest>;
    responseSerialize: grpc.serialize<controller_pb.RevokeUserKeyResponse>;
    responseDeserialize: grpc.deserialize<controller_pb.RevokeUserKeyResponse>;
}

export const IsolateControllerService: IIsolateControllerService;

export interface IIsolateControllerServer extends grpc.UntypedServiceImplementation {
    run: grpc.handleServerStreamingCall<controller_pb.HostedRun, controller_pb.HostedRunResult>;
    map: grpc.handleServerStreamingCall<controller_pb.HostedMap, controller_pb.HostedRunResult>;
    schedule: grpc.handleUnaryCall<controller_pb.HostedRunCron, controller_pb.ScheduleInfo>;
    listScheduledRuns: grpc.handleUnaryCall<controller_pb.ListScheduledRunsRequest, controller_pb.ListScheduledRunsResponse>;
    cancelScheduledRun: grpc.handleUnaryCall<controller_pb.CancelScheduledRunRequest, controller_pb.CancelScheduledRunResponse>;
    listScheduledRunActivations: grpc.handleUnaryCall<controller_pb.ListScheduledRunActivationsRequest, controller_pb.ListScheduledRunActivationsResponse>;
    getScheduledActivationLogs: grpc.handleUnaryCall<controller_pb.GetScheduledActivationLogsRequest, controller_pb.GetScheduledActivationLogsResponse>;
    createUserKey: grpc.handleUnaryCall<controller_pb.CreateUserKeyRequest, controller_pb.CreateUserKeyResponse>;
    listUserKeys: grpc.handleUnaryCall<controller_pb.ListUserKeysRequest, controller_pb.ListUserKeysResponse>;
    revokeUserKey: grpc.handleUnaryCall<controller_pb.RevokeUserKeyRequest, controller_pb.RevokeUserKeyResponse>;
}

export interface IIsolateControllerClient {
    run(request: controller_pb.HostedRun, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<controller_pb.HostedRunResult>;
    run(request: controller_pb.HostedRun, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<controller_pb.HostedRunResult>;
    map(request: controller_pb.HostedMap, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<controller_pb.HostedRunResult>;
    map(request: controller_pb.HostedMap, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<controller_pb.HostedRunResult>;
    schedule(request: controller_pb.HostedRunCron, callback: (error: grpc.ServiceError | null, response: controller_pb.ScheduleInfo) => void): grpc.ClientUnaryCall;
    schedule(request: controller_pb.HostedRunCron, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: controller_pb.ScheduleInfo) => void): grpc.ClientUnaryCall;
    schedule(request: controller_pb.HostedRunCron, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: controller_pb.ScheduleInfo) => void): grpc.ClientUnaryCall;
    listScheduledRuns(request: controller_pb.ListScheduledRunsRequest, callback: (error: grpc.ServiceError | null, response: controller_pb.ListScheduledRunsResponse) => void): grpc.ClientUnaryCall;
    listScheduledRuns(request: controller_pb.ListScheduledRunsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: controller_pb.ListScheduledRunsResponse) => void): grpc.ClientUnaryCall;
    listScheduledRuns(request: controller_pb.ListScheduledRunsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: controller_pb.ListScheduledRunsResponse) => void): grpc.ClientUnaryCall;
    cancelScheduledRun(request: controller_pb.CancelScheduledRunRequest, callback: (error: grpc.ServiceError | null, response: controller_pb.CancelScheduledRunResponse) => void): grpc.ClientUnaryCall;
    cancelScheduledRun(request: controller_pb.CancelScheduledRunRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: controller_pb.CancelScheduledRunResponse) => void): grpc.ClientUnaryCall;
    cancelScheduledRun(request: controller_pb.CancelScheduledRunRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: controller_pb.CancelScheduledRunResponse) => void): grpc.ClientUnaryCall;
    listScheduledRunActivations(request: controller_pb.ListScheduledRunActivationsRequest, callback: (error: grpc.ServiceError | null, response: controller_pb.ListScheduledRunActivationsResponse) => void): grpc.ClientUnaryCall;
    listScheduledRunActivations(request: controller_pb.ListScheduledRunActivationsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: controller_pb.ListScheduledRunActivationsResponse) => void): grpc.ClientUnaryCall;
    listScheduledRunActivations(request: controller_pb.ListScheduledRunActivationsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: controller_pb.ListScheduledRunActivationsResponse) => void): grpc.ClientUnaryCall;
    getScheduledActivationLogs(request: controller_pb.GetScheduledActivationLogsRequest, callback: (error: grpc.ServiceError | null, response: controller_pb.GetScheduledActivationLogsResponse) => void): grpc.ClientUnaryCall;
    getScheduledActivationLogs(request: controller_pb.GetScheduledActivationLogsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: controller_pb.GetScheduledActivationLogsResponse) => void): grpc.ClientUnaryCall;
    getScheduledActivationLogs(request: controller_pb.GetScheduledActivationLogsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: controller_pb.GetScheduledActivationLogsResponse) => void): grpc.ClientUnaryCall;
    createUserKey(request: controller_pb.CreateUserKeyRequest, callback: (error: grpc.ServiceError | null, response: controller_pb.CreateUserKeyResponse) => void): grpc.ClientUnaryCall;
    createUserKey(request: controller_pb.CreateUserKeyRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: controller_pb.CreateUserKeyResponse) => void): grpc.ClientUnaryCall;
    createUserKey(request: controller_pb.CreateUserKeyRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: controller_pb.CreateUserKeyResponse) => void): grpc.ClientUnaryCall;
    listUserKeys(request: controller_pb.ListUserKeysRequest, callback: (error: grpc.ServiceError | null, response: controller_pb.ListUserKeysResponse) => void): grpc.ClientUnaryCall;
    listUserKeys(request: controller_pb.ListUserKeysRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: controller_pb.ListUserKeysResponse) => void): grpc.ClientUnaryCall;
    listUserKeys(request: controller_pb.ListUserKeysRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: controller_pb.ListUserKeysResponse) => void): grpc.ClientUnaryCall;
    revokeUserKey(request: controller_pb.RevokeUserKeyRequest, callback: (error: grpc.ServiceError | null, response: controller_pb.RevokeUserKeyResponse) => void): grpc.ClientUnaryCall;
    revokeUserKey(request: controller_pb.RevokeUserKeyRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: controller_pb.RevokeUserKeyResponse) => void): grpc.ClientUnaryCall;
    revokeUserKey(request: controller_pb.RevokeUserKeyRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: controller_pb.RevokeUserKeyResponse) => void): grpc.ClientUnaryCall;
}

export class IsolateControllerClient extends grpc.Client implements IIsolateControllerClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public run(request: controller_pb.HostedRun, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<controller_pb.HostedRunResult>;
    public run(request: controller_pb.HostedRun, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<controller_pb.HostedRunResult>;
    public map(request: controller_pb.HostedMap, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<controller_pb.HostedRunResult>;
    public map(request: controller_pb.HostedMap, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<controller_pb.HostedRunResult>;
    public schedule(request: controller_pb.HostedRunCron, callback: (error: grpc.ServiceError | null, response: controller_pb.ScheduleInfo) => void): grpc.ClientUnaryCall;
    public schedule(request: controller_pb.HostedRunCron, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: controller_pb.ScheduleInfo) => void): grpc.ClientUnaryCall;
    public schedule(request: controller_pb.HostedRunCron, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: controller_pb.ScheduleInfo) => void): grpc.ClientUnaryCall;
    public listScheduledRuns(request: controller_pb.ListScheduledRunsRequest, callback: (error: grpc.ServiceError | null, response: controller_pb.ListScheduledRunsResponse) => void): grpc.ClientUnaryCall;
    public listScheduledRuns(request: controller_pb.ListScheduledRunsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: controller_pb.ListScheduledRunsResponse) => void): grpc.ClientUnaryCall;
    public listScheduledRuns(request: controller_pb.ListScheduledRunsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: controller_pb.ListScheduledRunsResponse) => void): grpc.ClientUnaryCall;
    public cancelScheduledRun(request: controller_pb.CancelScheduledRunRequest, callback: (error: grpc.ServiceError | null, response: controller_pb.CancelScheduledRunResponse) => void): grpc.ClientUnaryCall;
    public cancelScheduledRun(request: controller_pb.CancelScheduledRunRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: controller_pb.CancelScheduledRunResponse) => void): grpc.ClientUnaryCall;
    public cancelScheduledRun(request: controller_pb.CancelScheduledRunRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: controller_pb.CancelScheduledRunResponse) => void): grpc.ClientUnaryCall;
    public listScheduledRunActivations(request: controller_pb.ListScheduledRunActivationsRequest, callback: (error: grpc.ServiceError | null, response: controller_pb.ListScheduledRunActivationsResponse) => void): grpc.ClientUnaryCall;
    public listScheduledRunActivations(request: controller_pb.ListScheduledRunActivationsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: controller_pb.ListScheduledRunActivationsResponse) => void): grpc.ClientUnaryCall;
    public listScheduledRunActivations(request: controller_pb.ListScheduledRunActivationsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: controller_pb.ListScheduledRunActivationsResponse) => void): grpc.ClientUnaryCall;
    public getScheduledActivationLogs(request: controller_pb.GetScheduledActivationLogsRequest, callback: (error: grpc.ServiceError | null, response: controller_pb.GetScheduledActivationLogsResponse) => void): grpc.ClientUnaryCall;
    public getScheduledActivationLogs(request: controller_pb.GetScheduledActivationLogsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: controller_pb.GetScheduledActivationLogsResponse) => void): grpc.ClientUnaryCall;
    public getScheduledActivationLogs(request: controller_pb.GetScheduledActivationLogsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: controller_pb.GetScheduledActivationLogsResponse) => void): grpc.ClientUnaryCall;
    public createUserKey(request: controller_pb.CreateUserKeyRequest, callback: (error: grpc.ServiceError | null, response: controller_pb.CreateUserKeyResponse) => void): grpc.ClientUnaryCall;
    public createUserKey(request: controller_pb.CreateUserKeyRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: controller_pb.CreateUserKeyResponse) => void): grpc.ClientUnaryCall;
    public createUserKey(request: controller_pb.CreateUserKeyRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: controller_pb.CreateUserKeyResponse) => void): grpc.ClientUnaryCall;
    public listUserKeys(request: controller_pb.ListUserKeysRequest, callback: (error: grpc.ServiceError | null, response: controller_pb.ListUserKeysResponse) => void): grpc.ClientUnaryCall;
    public listUserKeys(request: controller_pb.ListUserKeysRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: controller_pb.ListUserKeysResponse) => void): grpc.ClientUnaryCall;
    public listUserKeys(request: controller_pb.ListUserKeysRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: controller_pb.ListUserKeysResponse) => void): grpc.ClientUnaryCall;
    public revokeUserKey(request: controller_pb.RevokeUserKeyRequest, callback: (error: grpc.ServiceError | null, response: controller_pb.RevokeUserKeyResponse) => void): grpc.ClientUnaryCall;
    public revokeUserKey(request: controller_pb.RevokeUserKeyRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: controller_pb.RevokeUserKeyResponse) => void): grpc.ClientUnaryCall;
    public revokeUserKey(request: controller_pb.RevokeUserKeyRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: controller_pb.RevokeUserKeyResponse) => void): grpc.ClientUnaryCall;
}
