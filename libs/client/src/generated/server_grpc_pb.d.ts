// package: 
// file: server.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as server_pb from "./server_pb";
import * as common_pb from "./common_pb";
import * as google_protobuf_struct_pb from "google-protobuf/google/protobuf/struct_pb";

interface IIsolateService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    run: IIsolateService_IRun;
}

interface IIsolateService_IRun extends grpc.MethodDefinition<server_pb.BoundFunction, common_pb.PartialRunResult> {
    path: "/Isolate/Run";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<server_pb.BoundFunction>;
    requestDeserialize: grpc.deserialize<server_pb.BoundFunction>;
    responseSerialize: grpc.serialize<common_pb.PartialRunResult>;
    responseDeserialize: grpc.deserialize<common_pb.PartialRunResult>;
}

export const IsolateService: IIsolateService;

export interface IIsolateServer extends grpc.UntypedServiceImplementation {
    run: grpc.handleServerStreamingCall<server_pb.BoundFunction, common_pb.PartialRunResult>;
}

export interface IIsolateClient {
    run(request: server_pb.BoundFunction, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<common_pb.PartialRunResult>;
    run(request: server_pb.BoundFunction, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<common_pb.PartialRunResult>;
}

export class IsolateClient extends grpc.Client implements IIsolateClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public run(request: server_pb.BoundFunction, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<common_pb.PartialRunResult>;
    public run(request: server_pb.BoundFunction, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<common_pb.PartialRunResult>;
}
