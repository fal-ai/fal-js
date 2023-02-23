import * as grpc from '@grpc/grpc-js';
import { Struct } from 'google-protobuf/google/protobuf/struct_pb';
// import { decode as decodeBase64 } from 'js-base64';
import { SerializedObject } from './generated/common_pb';
import { IsolateControllerClient } from './generated/controller_grpc_pb';
import { HostedRun } from './generated/controller_pb';
import { EnvironmentDefinition } from './generated/server_pb';

export type Credentials = {
  id: string;
  key: string;
};

export type RunInput = {
  credentials: Credentials;
  environmentKind: string;
  requirements: string[];
  host: string;
  definition: string;
};

export type OnData = (data: string) => void;

export function run(input: RunInput, onData: OnData) {
  const credentials: grpc.ChannelCredentials =
    grpc.credentials.combineChannelCredentials(
      grpc.credentials.createSsl(),
      grpc.credentials.createFromMetadataGenerator((_, callback) => {
        const md = new grpc.Metadata();
        md.add('auth-key', input.credentials.key);
        md.add('auth-key-id', input.credentials.id);
        callback(null, md);
      })
    );

  const client = new IsolateControllerClient(input.host, credentials);
  const req = new HostedRun();

  const serObj = new SerializedObject();

  serObj.setMethod('dill');
  // serObj.setDefinition(decodeBase64(input.definition));
  serObj.setDefinition(input.definition);
  serObj.setWasItRaised(false);
  serObj.setStringizedTraceback('');

  const environment = new EnvironmentDefinition();
  environment.setKind(input.environmentKind);
  environment.setConfiguration(
    Struct.fromJavaScript({
      requirements: input.requirements,
    })
  );

  req.setFunction(serObj);
  req.setEnvironmentsList([environment]);

  client.run(req).on('data', onData);
}
