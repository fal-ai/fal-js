import * as grpc from "@grpc/grpc-js";
import * as fs from "fs";
import { SerializedObject } from "./generated/common_pb";
import { IsolateControllerClient } from "./generated/controller_grpc_pb";
import { HostedRun } from "./generated/controller_pb";
import { EnvironmentDefinition } from "./generated/server_pb";

const credentials: grpc.ChannelCredentials =
  grpc.credentials.combineChannelCredentials(
    grpc.credentials.createSsl(),
    grpc.credentials.createFromMetadataGenerator((_, callback) => {
      const md = new grpc.Metadata();
      md.add("auth-key", "f2588f17f0bfc75c323dc5f9b5da83e0");
      md.add("auth-key-id", "648b02a4-e2cd-430c-8bac-4ca2712dad18");
      callback(null, md);
    })
  );
const client = new IsolateControllerClient("api.shark.fal.ai", credentials);
const req = new HostedRun();

const serObj = new SerializedObject();

let definition = fs.readFileSync(
  "/Users/gorkemyurtseven/dev/koldstart-playground/koldstart-javascript/python.dump"
);

serObj.setMethod("dill");
serObj.setDefinition(definition);
serObj.setWasItRaised(false);
serObj.setStringizedTraceback("");

const environment = new EnvironmentDefinition();
environment.setKind("virtualenv");

req.setFunction(serObj);
req.setEnvironmentsList([environment]);

client.run(req).on("data", (data) => {
  console.log(data.toObject());
});
