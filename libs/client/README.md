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
  onMedia(stream) {
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

### Session lifecycle and reporting

Every session reports the same coarse lifecycle regardless of protocol, so an application offering more
than one model renders one status indicator rather than one per extension:

```ts
const session = await fal.realtime.open(lucyRealtime(), {
  input: { prompt: "a storm over a ruined castle" },
  onState: (state) => setStatus(state), // "opening" | "live" | "failed" | "closed"
  onDiagnostic: (event) => {
    if (event.kind === "failure") setError(event.message);
  },
});

session.state; // the same value, readable at any time
```

Four states, deliberately. Anything finer is protocol detail: `negotiating` means something specific in
one model and nothing in a world that spends thirty seconds building.

`failed` and `closed` are both terminal, and **`failed` wins**. A session that dies reports `"failed"`
and stays there while its resources are released — it does not decay into `"closed"`, because teardown
happens either way and reporting it would erase the only thing separating a dead transport from a user
who pressed disconnect.

Detail belongs in diagnostics:

```ts
type RealtimeDiagnostic = { kind: "progress"; phase: string; detail?: Record<string, number | string> } | { kind: "warning"; message: string; detail?: Record<string, number | string> } | { kind: "failure"; message: string; observed?: Record<string, number | string> };
```

`phase` and the free-form `detail` bag are deliberately not shaped around any one protocol — useful
progress is `"world building"` for one model and `"3 of 4 TURN servers answered"` for another.

**A `failure` reports what was observed, never what was inferred.** This is a convention rather than a
type, and it is the difference between a diagnostic that helps and one that misleads: a message reading
_"either peer is behind symmetric NAT or blocked UDP"_ sent us after a router for three rounds, when the
cause was a TURN credential thirty seconds too young. Report the candidate counts and the per-server
error codes; let the reader draw the conclusion.

### Inbound media and data

Whatever comes back arrives through two callbacks named once, by the client, rather than once per
extension:

```ts
const session = await fal.realtime.open(wmaRaw(), {
  endpointId: "fal-ai/wma-outstream",
  onMedia: (stream) => {
    videoEl.srcObject = stream;
  },
  onData: (raw) => setScore(JSON.parse(raw)),
});
```

`onMedia` fires once per inbound stream; `onData` once per message on the extension's data channel.
Naming them here is the same argument as `onState`: "a remote stream arrived" means the same thing in
every protocol, so if each extension named it, an application offering two models would branch per
protocol just to attach a video element.

`onData` hands you a raw string on purpose. The client cannot know a model's schema, and parsing on its
behalf would put one protocol's vocabulary in the transport — so the extension delivers and you parse.

Both are optional on both sides. An extension need not call them, and plenty do not: an app can send a
camera up and get its answer back as data with no inbound media at all, and an extension that hands a
video element to a provider SDK never sees a `MediaStream` to publish. Neither callback can break a
session — a throw from your handler is swallowed, because these fire inside browser event handlers
where nothing upstream could catch it, and a render bug should not kill the connection.

### What an extension is given

`open(context, options)` receives these primitives:

| Member                 | For                                                                                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `context.run()`        | a fal **endpoint**, with the parent client's auth, proxy and retries                                                                                                                        |
| `context.connect()`    | the fal realtime WebSocket                                                                                                                                                                  |
| `context.fetch()`      | fal infrastructure that is **not** an endpoint — a shared bridge, a control plane addressed by body rather than path. Same credentials and proxy as `run()`, but returns the raw `Response` |
| `context.gatherIce()`  | ICE gathering for browser WebRTC: sufficient set, then a quiet period, under a hard bound                                                                                                   |
| `context.diagnostic()` | progress and failure reports; safe to call with no `onDiagnostic` supplied                                                                                                                  |
| `context.media()`      | publish an inbound stream to `onMedia`                                                                                                                                                      |
| `context.data()`       | publish one inbound message to `onData`                                                                                                                                                     |
| `context.fail()`       | end the session **because it failed**, as opposed to closing it                                                                                                                             |
| `context.addCleanup()` | every resource acquired, released in reverse order                                                                                                                                          |
| `context.signal`       | cancellation                                                                                                                                                                                |
| `context.endpointId`   | the endpoint this session was opened against                                                                                                                                                |
| `context.close()`      | end the managed session from inside                                                                                                                                                         |

`gatherIce` lives here rather than in an extension because both obvious strategies are wrong: waiting
for `iceGatheringState === "complete"` pays a dead STUN server's full timeout, while a fixed short cap
silently ships an offer with no relay candidate that can never form a relayed path — and fails with no
error at all. A TURN configuration is not "sufficient" until a relay candidate exists, because that is
the reason TURN was configured.

`fail` exists because `close()` cannot express the difference between a transport that died and a user
who disconnected. Both would arrive as `"closed"`, and those are the two cases a status UI most needs to
tell apart.

## More features

The client library offers a plethora of features designed to simplify your journey with `fal.ai`. Dive into the [official documentation](https://fal.ai/docs) for a comprehensive guide.
