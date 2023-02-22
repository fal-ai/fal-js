"use strict";
exports.__esModule = true;
var common_pb_1 = require("./proto/generated/common_pb");
var controller_pb_1 = require("./proto/generated/controller_pb");
var server_pb_1 = require("./proto/generated/server_pb");
var fs = require("fs");
var controller_grpc_pb_1 = require("./proto/generated/controller_grpc_pb");
var grpc = require("@grpc/grpc-js");
var credentials = grpc.credentials.combineChannelCredentials(grpc.credentials.createSsl(), grpc.credentials.createFromMetadataGenerator(function (_, callback) {
    var md = new grpc.Metadata();
    md.add("auth-key", "f2588f17f0bfc75c323dc5f9b5da83e0");
    md.add("auth-key-id", "648b02a4-e2cd-430c-8bac-4ca2712dad18");
    callback(null, md);
}));
var client = new controller_grpc_pb_1.IsolateControllerClient("api.shark.fal.ai", credentials);
var req = new controller_pb_1.HostedRun();
var serObj = new common_pb_1.SerializedObject();
var definition = fs.readFileSync('/Users/gorkemyurtseven/dev/koldstart-playground/koldstart-javascript/python.dump');
serObj.setMethod("dill");
serObj.setDefinition(definition);
serObj.setWasItRaised(false);
serObj.setStringizedTraceback("");
var environment = new server_pb_1.EnvironmentDefinition();
environment.setKind("virtualenv");
req.setFunction(serObj);
req.setEnvironmentsList([environment]);
client.run(req).on("data", function (data) {
    console.log(data.toObject());
});
