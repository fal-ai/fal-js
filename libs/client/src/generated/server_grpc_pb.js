// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var server_pb = require('./server_pb.js');
var common_pb = require('./common_pb.js');
var google_protobuf_struct_pb = require('google-protobuf/google/protobuf/struct_pb.js');

function serialize_BoundFunction(arg) {
  if (!(arg instanceof server_pb.BoundFunction)) {
    throw new Error('Expected argument of type BoundFunction');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_BoundFunction(buffer_arg) {
  return server_pb.BoundFunction.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_PartialRunResult(arg) {
  if (!(arg instanceof common_pb.PartialRunResult)) {
    throw new Error('Expected argument of type PartialRunResult');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_PartialRunResult(buffer_arg) {
  return common_pb.PartialRunResult.deserializeBinary(new Uint8Array(buffer_arg));
}


var IsolateService = exports.IsolateService = {
  // Run the given function on the specified environment. Streams logs
// and the result originating from that function.
run: {
    path: '/Isolate/Run',
    requestStream: false,
    responseStream: true,
    requestType: server_pb.BoundFunction,
    responseType: common_pb.PartialRunResult,
    requestSerialize: serialize_BoundFunction,
    requestDeserialize: deserialize_BoundFunction,
    responseSerialize: serialize_PartialRunResult,
    responseDeserialize: deserialize_PartialRunResult,
  },
};

exports.IsolateClient = grpc.makeGenericClientConstructor(IsolateService);
