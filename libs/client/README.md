# fal.ai JavaScript/TypeScript client library

![@fal-ai/client npm package](https://img.shields.io/npm/v/@fal-ai/client?color=%237527D7&label=%40fal-ai%2Fclient&style=flat-square)

## Introduction

The `fal.ai` JavaScript Client Library provides a seamless way to interact with `fal` endpoints from your JavaScript or TypeScript applications. With built-in support for various platforms, it ensures consistent behavior across web, Node.js, and React Native environments.

## Getting started

Before diving into the client-specific features, ensure you've set up your credentials:

```ts
import { fal } from "@fal-ai/client";

fal.config({
  // Can also be auto-configured using environment variables:
  credentials: "FAL_KEY",
});
```

**Note:** Ensure you've reviewed the [fal.ai getting started guide](https://fal.ai/docs) to acquire your credentials and register your functions. Also, make sure your credentials are always protected. See the [../proxy](../proxy) package for a secure way to use the client in client-side applications.

## Running functions with `fal.run`

The `fal.run` method is the simplest way to execute a function. It returns a promise that resolves to the function's result:

```ts
const result = await fal.run("my-function-id", {
  input: { foo: "bar" },
});
```

## Long-running functions with `fal.subscribe`

The `fal.subscribe` method offers a powerful way to rely on the [queue system](https://fal.ai/docs/model-apis/model-endpoints/queue) to execute long-running functions. It returns the result once it's done like any other async function, so your don't have to deal with queue status updates yourself. However, it does support queue events, in case you want to listen and react to them:

```ts
const result = await fal.subscribe("my-function-id", {
  input: { foo: "bar" },
  onQueueUpdate(update) {
    if (update.status === "IN_QUEUE") {
      console.log(`Your position in the queue is ${update.position}`);
    }
  },
});
```

## Protocol-aware realtime sessions

`fal.realtime.connect()` remains the low-level WebSocket API. Models that need
WebRTC signaling, provider SDKs, heartbeats, or another negotiation protocol
can expose that behavior as an application-installed extension:

```ts
import { fal } from "@fal-ai/client";
import { lucyRealtime } from "@fal-ai/client/realtime";

const lucy = await fal.realtime.open(lucyRealtime(), {
  input: {
    prompt: "Turn me into a marble statue",
    image_url: firstCameraFrame,
  },
  localStream: cameraStream,
  tokenProvider: getRealtimeToken,
  onRemoteStream(stream) {
    outputVideo.srcObject = stream;
  },
});

lucy.send({ prompt: "Now make it cinematic" });
await lucy.close();
```

Extensions are ordinary installed JavaScript, never code loaded from endpoint
metadata. fal owns cancellation and idempotent cleanup; the extension owns its
wire protocol and may return any model-specific session API:

```ts
import { defineRealtimeExtension, type RealtimeSession } from "@fal-ai/client/realtime";

interface DragonSession extends RealtimeSession {
  roar(intensity: number): void;
}

const dragonWorld = defineRealtimeExtension<{ prompt: string }, DragonSession>({
  id: "acme/dragon-world",
  defaultEndpoint: "acme/dragon-world",
  supports: (endpointId) => endpointId === "acme/dragon-world",
  async open(context, options) {
    const connection = context.connect<Record<string, unknown>, Record<string, unknown>>(context.endpointId, { onResult: console.log });
    context.addCleanup(() => connection.close());
    connection.send({ prompt: options.prompt });

    return {
      roar: (intensity) => connection.send({ roar: intensity }),
      close() {},
    };
  },
});

const world = await fal.realtime.open(dragonWorld, {
  prompt: "A storm above a ruined castle",
});
```

Extensions can also be installed in `createFalClient({ realtime: {
extensions: [...] } })` and selected by endpoint. If multiple installed
extensions claim the same endpoint, the client fails explicitly instead of
choosing one by import order.

## More features

The client library offers a plethora of features designed to simplify your journey with `fal.ai`. Dive into the [official documentation](https://fal.ai/docs) for a comprehensive guide.
