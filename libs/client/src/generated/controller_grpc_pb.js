// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var controller_pb = require('./controller_pb.js');
var common_pb = require('./common_pb.js');
var server_pb = require('./server_pb.js');
var google_protobuf_timestamp_pb = require('google-protobuf/google/protobuf/timestamp_pb.js');

function serialize_controller_CancelScheduledRunRequest(arg) {
  if (!(arg instanceof controller_pb.CancelScheduledRunRequest)) {
    throw new Error(
      'Expected argument of type controller.CancelScheduledRunRequest'
    );
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_controller_CancelScheduledRunRequest(buffer_arg) {
  return controller_pb.CancelScheduledRunRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_controller_CancelScheduledRunResponse(arg) {
  if (!(arg instanceof controller_pb.CancelScheduledRunResponse)) {
    throw new Error(
      'Expected argument of type controller.CancelScheduledRunResponse'
    );
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_controller_CancelScheduledRunResponse(buffer_arg) {
  return controller_pb.CancelScheduledRunResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_controller_CreateUserKeyRequest(arg) {
  if (!(arg instanceof controller_pb.CreateUserKeyRequest)) {
    throw new Error(
      'Expected argument of type controller.CreateUserKeyRequest'
    );
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_controller_CreateUserKeyRequest(buffer_arg) {
  return controller_pb.CreateUserKeyRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_controller_CreateUserKeyResponse(arg) {
  if (!(arg instanceof controller_pb.CreateUserKeyResponse)) {
    throw new Error(
      'Expected argument of type controller.CreateUserKeyResponse'
    );
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_controller_CreateUserKeyResponse(buffer_arg) {
  return controller_pb.CreateUserKeyResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_controller_GetScheduledActivationLogsRequest(arg) {
  if (!(arg instanceof controller_pb.GetScheduledActivationLogsRequest)) {
    throw new Error(
      'Expected argument of type controller.GetScheduledActivationLogsRequest'
    );
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_controller_GetScheduledActivationLogsRequest(buffer_arg) {
  return controller_pb.GetScheduledActivationLogsRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_controller_GetScheduledActivationLogsResponse(arg) {
  if (!(arg instanceof controller_pb.GetScheduledActivationLogsResponse)) {
    throw new Error(
      'Expected argument of type controller.GetScheduledActivationLogsResponse'
    );
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_controller_GetScheduledActivationLogsResponse(buffer_arg) {
  return controller_pb.GetScheduledActivationLogsResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_controller_HostedMap(arg) {
  if (!(arg instanceof controller_pb.HostedMap)) {
    throw new Error('Expected argument of type controller.HostedMap');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_controller_HostedMap(buffer_arg) {
  return controller_pb.HostedMap.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_controller_HostedRun(arg) {
  if (!(arg instanceof controller_pb.HostedRun)) {
    throw new Error('Expected argument of type controller.HostedRun');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_controller_HostedRun(buffer_arg) {
  return controller_pb.HostedRun.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_controller_HostedRunCron(arg) {
  if (!(arg instanceof controller_pb.HostedRunCron)) {
    throw new Error('Expected argument of type controller.HostedRunCron');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_controller_HostedRunCron(buffer_arg) {
  return controller_pb.HostedRunCron.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_controller_HostedRunResult(arg) {
  if (!(arg instanceof controller_pb.HostedRunResult)) {
    throw new Error('Expected argument of type controller.HostedRunResult');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_controller_HostedRunResult(buffer_arg) {
  return controller_pb.HostedRunResult.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_controller_ListScheduledRunActivationsRequest(arg) {
  if (!(arg instanceof controller_pb.ListScheduledRunActivationsRequest)) {
    throw new Error(
      'Expected argument of type controller.ListScheduledRunActivationsRequest'
    );
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_controller_ListScheduledRunActivationsRequest(buffer_arg) {
  return controller_pb.ListScheduledRunActivationsRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_controller_ListScheduledRunActivationsResponse(arg) {
  if (!(arg instanceof controller_pb.ListScheduledRunActivationsResponse)) {
    throw new Error(
      'Expected argument of type controller.ListScheduledRunActivationsResponse'
    );
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_controller_ListScheduledRunActivationsResponse(
  buffer_arg
) {
  return controller_pb.ListScheduledRunActivationsResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_controller_ListScheduledRunsRequest(arg) {
  if (!(arg instanceof controller_pb.ListScheduledRunsRequest)) {
    throw new Error(
      'Expected argument of type controller.ListScheduledRunsRequest'
    );
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_controller_ListScheduledRunsRequest(buffer_arg) {
  return controller_pb.ListScheduledRunsRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_controller_ListScheduledRunsResponse(arg) {
  if (!(arg instanceof controller_pb.ListScheduledRunsResponse)) {
    throw new Error(
      'Expected argument of type controller.ListScheduledRunsResponse'
    );
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_controller_ListScheduledRunsResponse(buffer_arg) {
  return controller_pb.ListScheduledRunsResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_controller_ListUserKeysRequest(arg) {
  if (!(arg instanceof controller_pb.ListUserKeysRequest)) {
    throw new Error('Expected argument of type controller.ListUserKeysRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_controller_ListUserKeysRequest(buffer_arg) {
  return controller_pb.ListUserKeysRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_controller_ListUserKeysResponse(arg) {
  if (!(arg instanceof controller_pb.ListUserKeysResponse)) {
    throw new Error(
      'Expected argument of type controller.ListUserKeysResponse'
    );
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_controller_ListUserKeysResponse(buffer_arg) {
  return controller_pb.ListUserKeysResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_controller_RevokeUserKeyRequest(arg) {
  if (!(arg instanceof controller_pb.RevokeUserKeyRequest)) {
    throw new Error(
      'Expected argument of type controller.RevokeUserKeyRequest'
    );
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_controller_RevokeUserKeyRequest(buffer_arg) {
  return controller_pb.RevokeUserKeyRequest.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_controller_RevokeUserKeyResponse(arg) {
  if (!(arg instanceof controller_pb.RevokeUserKeyResponse)) {
    throw new Error(
      'Expected argument of type controller.RevokeUserKeyResponse'
    );
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_controller_RevokeUserKeyResponse(buffer_arg) {
  return controller_pb.RevokeUserKeyResponse.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

function serialize_controller_ScheduleInfo(arg) {
  if (!(arg instanceof controller_pb.ScheduleInfo)) {
    throw new Error('Expected argument of type controller.ScheduleInfo');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_controller_ScheduleInfo(buffer_arg) {
  return controller_pb.ScheduleInfo.deserializeBinary(
    new Uint8Array(buffer_arg)
  );
}

var IsolateControllerService = (exports.IsolateControllerService = {
  // Run the given function on the specified environment. Streams logs
  // and the result originating from that function.
  run: {
    path: '/controller.IsolateController/Run',
    requestStream: false,
    responseStream: true,
    requestType: controller_pb.HostedRun,
    responseType: controller_pb.HostedRunResult,
    requestSerialize: serialize_controller_HostedRun,
    requestDeserialize: deserialize_controller_HostedRun,
    responseSerialize: serialize_controller_HostedRunResult,
    responseDeserialize: deserialize_controller_HostedRunResult,
  },
  // Run the given function in parallel with the given inputs
  map: {
    path: '/controller.IsolateController/Map',
    requestStream: false,
    responseStream: true,
    requestType: controller_pb.HostedMap,
    responseType: controller_pb.HostedRunResult,
    requestSerialize: serialize_controller_HostedMap,
    requestDeserialize: deserialize_controller_HostedMap,
    responseSerialize: serialize_controller_HostedRunResult,
    responseDeserialize: deserialize_controller_HostedRunResult,
  },
  // Schedule the given function to be run with the specified cron.
  schedule: {
    path: '/controller.IsolateController/Schedule',
    requestStream: false,
    responseStream: false,
    requestType: controller_pb.HostedRunCron,
    responseType: controller_pb.ScheduleInfo,
    requestSerialize: serialize_controller_HostedRunCron,
    requestDeserialize: deserialize_controller_HostedRunCron,
    responseSerialize: serialize_controller_ScheduleInfo,
    responseDeserialize: deserialize_controller_ScheduleInfo,
  },
  // List scheduled runs.
  listScheduledRuns: {
    path: '/controller.IsolateController/ListScheduledRuns',
    requestStream: false,
    responseStream: false,
    requestType: controller_pb.ListScheduledRunsRequest,
    responseType: controller_pb.ListScheduledRunsResponse,
    requestSerialize: serialize_controller_ListScheduledRunsRequest,
    requestDeserialize: deserialize_controller_ListScheduledRunsRequest,
    responseSerialize: serialize_controller_ListScheduledRunsResponse,
    responseDeserialize: deserialize_controller_ListScheduledRunsResponse,
  },
  // Cancel a scheduled run.
  cancelScheduledRun: {
    path: '/controller.IsolateController/CancelScheduledRun',
    requestStream: false,
    responseStream: false,
    requestType: controller_pb.CancelScheduledRunRequest,
    responseType: controller_pb.CancelScheduledRunResponse,
    requestSerialize: serialize_controller_CancelScheduledRunRequest,
    requestDeserialize: deserialize_controller_CancelScheduledRunRequest,
    responseSerialize: serialize_controller_CancelScheduledRunResponse,
    responseDeserialize: deserialize_controller_CancelScheduledRunResponse,
  },
  // List all the activations of one scheduled run.
  listScheduledRunActivations: {
    path: '/controller.IsolateController/ListScheduledRunActivations',
    requestStream: false,
    responseStream: false,
    requestType: controller_pb.ListScheduledRunActivationsRequest,
    responseType: controller_pb.ListScheduledRunActivationsResponse,
    requestSerialize: serialize_controller_ListScheduledRunActivationsRequest,
    requestDeserialize:
      deserialize_controller_ListScheduledRunActivationsRequest,
    responseSerialize: serialize_controller_ListScheduledRunActivationsResponse,
    responseDeserialize:
      deserialize_controller_ListScheduledRunActivationsResponse,
  },
  // Get logs from a particular activation of a scheduled run.
  getScheduledActivationLogs: {
    path: '/controller.IsolateController/GetScheduledActivationLogs',
    requestStream: false,
    responseStream: false,
    requestType: controller_pb.GetScheduledActivationLogsRequest,
    responseType: controller_pb.GetScheduledActivationLogsResponse,
    requestSerialize: serialize_controller_GetScheduledActivationLogsRequest,
    requestDeserialize:
      deserialize_controller_GetScheduledActivationLogsRequest,
    responseSerialize: serialize_controller_GetScheduledActivationLogsResponse,
    responseDeserialize:
      deserialize_controller_GetScheduledActivationLogsResponse,
  },
  // Creates an authentication key for a user
  createUserKey: {
    path: '/controller.IsolateController/CreateUserKey',
    requestStream: false,
    responseStream: false,
    requestType: controller_pb.CreateUserKeyRequest,
    responseType: controller_pb.CreateUserKeyResponse,
    requestSerialize: serialize_controller_CreateUserKeyRequest,
    requestDeserialize: deserialize_controller_CreateUserKeyRequest,
    responseSerialize: serialize_controller_CreateUserKeyResponse,
    responseDeserialize: deserialize_controller_CreateUserKeyResponse,
  },
  // Lists the user's authentication keys
  listUserKeys: {
    path: '/controller.IsolateController/ListUserKeys',
    requestStream: false,
    responseStream: false,
    requestType: controller_pb.ListUserKeysRequest,
    responseType: controller_pb.ListUserKeysResponse,
    requestSerialize: serialize_controller_ListUserKeysRequest,
    requestDeserialize: deserialize_controller_ListUserKeysRequest,
    responseSerialize: serialize_controller_ListUserKeysResponse,
    responseDeserialize: deserialize_controller_ListUserKeysResponse,
  },
  // Revokes an authentication key for a user
  revokeUserKey: {
    path: '/controller.IsolateController/RevokeUserKey',
    requestStream: false,
    responseStream: false,
    requestType: controller_pb.RevokeUserKeyRequest,
    responseType: controller_pb.RevokeUserKeyResponse,
    requestSerialize: serialize_controller_RevokeUserKeyRequest,
    requestDeserialize: deserialize_controller_RevokeUserKeyRequest,
    responseSerialize: serialize_controller_RevokeUserKeyResponse,
    responseDeserialize: deserialize_controller_RevokeUserKeyResponse,
  },
});

exports.IsolateControllerClient = grpc.makeGenericClientConstructor(
  IsolateControllerService
);
