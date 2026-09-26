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

> [!WARNING]
>
> **Experimental.** Everything reached through `fal.realtime.open()` — the
> extension contract, the bundled `wma()`, `lucyRealtime()`, and `websocket()`
> extensions, and the `/realtime/*` subpath exports — is experimental surface
> area and may change in a minor release. `fal.realtime.connect()` keeps its
> signature, with two behavioral fixes: when several `connect()` calls share a
> `connectionKey`, the newest handle now owns the connection (a stale handle's
> `send()`/`close()` no longer act on it), and a handle that was explicitly
> `close()`d no longer reconnects on a later `send()` — both previously
> delivered stale messages through connections they no longer owned.

`fal.realtime.open()` opens a session with a named protocol extension. Models
that need WebRTC signaling, provider SDKs, heartbeats, or another negotiation
protocol expose that behavior as an application-installed extension, and fal's
own WebSocket protocol is available through the same door as
[`websocket()`](#fals-own-websocket-protocol-behind-open).

`open()` returns **synchronously**, with negotiation already running eagerly
behind the handle. You can render from `session.state`, call `send()`
immediately — sends are queued in order (bounded) and flushed the moment the
session is live — and hear about everything through callbacks:

```ts
import { fal } from "@fal-ai/client";
import { lucyRealtime } from "@fal-ai/client/realtime";

const lucy = fal.realtime.open(lucyRealtime(), {
  input: {
    prompt: "Turn me into a marble statue",
    image_url: firstCameraFrame,
  },
  localStream: cameraStream,
  tokenProvider: getRealtimeToken,
  onMedia(stream) {
    outputVideo.srcObject = stream;
  },
  onState: (state) => setStatus(state), // "opening" | "live" | "failed" | "closed"
  onError: (error) => console.error(error), // the terminal failure, delivered once
});

lucy.send({ prompt: "Now make it cinematic" }); // queued if still opening
await lucy.close();
```

Prefer the awaited style? `session.ready` resolves with the same handle once
the session is live and rejects with the failure, so `const lucy = await
fal.realtime.open(...).ready` gives the promise-shaped call site — but no
caller is required to hold a promise: every failure `ready` can carry also
reaches `onError` and `onState("failed")`, and an ignored `ready` never
becomes an unhandled rejection. The handle is a small plain object: `state`,
`send`, `close`, and `ready` work from the first tick, and `close()` during
`"opening"` cancels the negotiation. Extension-specific members (like Lucy's
`remoteStream`) live on `handle.session`, which is set once the session is
live.

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

// The typed session surface (roar) via the awaited style:
const world = await fal.realtime.open(dragonWorld, {
  prompt: "A storm above a ruined castle",
}).ready;
world.session.roar(11); // typed as present after `await .ready` — no optional chain
```

Which extension opens a session is always named at the call site. There is no
registry and no selection by endpoint name, because an endpoint id does not say
which protocol it speaks — `fal-ai/wma-outstream` looks exactly like an endpoint
with no realtime path at all. A surface that discovers models at runtime should
route on the model's published `x-fal-realtime` contract, which states its
transport, rather than on a guess from the name.

An extension that _does_ own a closed set of endpoints can add an optional
`supports(endpointId)` to reject a stale or mistyped id before negotiation
starts. It is a guard, not a router; most protocols have no such set and should
omit it.

### Optional WMA receive preferences

The existing `receive: ["video", "audio"]` syntax keeps browser defaults.
Object entries opt into preferences for an individual receive slot:

```ts
import { fal } from "@fal-ai/client";
import { wma } from "@fal-ai/client/realtime";

const session = fal.realtime.open(wma("my-owner/my-model"), {
  receive: [
    { kind: "video", codecPreferences: ["video/H264", "video/VP8"] },
    {
      kind: "audio",
      opus: { stereo: true, maxAverageBitrate: 192_000 },
    },
  ],
  onMedia: (stream) => {
    videoElement.srcObject = stream;
  },
  onError: console.error,
});
```

These optional settings apply before negotiation and require reconnecting to
change. Opus settings describe reception, even when a local track shares the
slot through `sendrecv`. They do not configure local capture or sender bitrate.
Codec preferences participate in negotiation and can affect the codec used in
both directions on a `sendrecv` transceiver.

- `codecPreferences` orders supported codec MIME types without removing
  browser fallback or repair codecs. Unavailable types produce a diagnostic;
  if none are available, the browser order is unchanged. A nonempty list
  requires `setCodecPreferences` support in the browser.
- `opus.stereo` requests stereo or mono; omission preserves the browser default.
- `opus.maxAverageBitrate` is a receive ceiling in bits/s (integer 6000–510000),
  not a target or a guarantee of actual bandwidth. Opus preferences require
  Opus in the offer but do not force the server to select it.

The model still controls its encoder. For example, Director separately accepts
`audio_bitrate: 192000` in its initial `configure` message. No model-specific
configuration is sent automatically by fal-js. Omitting these new options
preserves existing SDP and behavior.

### fal's own WebSocket protocol, behind `open()`

`websocket()` speaks the same wire protocol as `fal.realtime.connect()` —
msgpack over a fal WebSocket, through the same functions — and differs only in
_when_ the socket opens:

```ts
import { websocket } from "@fal-ai/client/realtime";

const session = fal.realtime.open(websocket("fal-ai/fast-lightning-sdxl"), {
  tokenProvider: getRealtimeToken,
  onResult: (result) => setImage(result.images[0].url),
  onState: (state) => setStatus(state),
  onError: (error) => setError(error),
});

session.send({ prompt: "a moonlit harbour" }); // queued until the socket is live
await session.close();
```

`connect()` is lazy: nothing happens until the first `send()`, so a wrong key or
a missing endpoint looks exactly like a model that has not answered yet. Here
the socket opens **eagerly** — negotiation starts the moment `open()` returns —
while the handle stays synchronous: sends queue in order until the socket is
live, a failed handshake is reported once through `onError` (and rejects
`session.ready` for awaited call sites) instead of a callback that may never
fire, and `state` reads `"live"` only when the transport agrees.

Two behaviors are deliberately not carried over:

- **Implicit reconnect.** `connect()` reconnects on the next `send()` after any
  failure, which falls out of its transitions rather than having been designed.
  Here a dead socket surfaces as `state: "failed"`, and you reopen — because an
  application that can see the failure can say something true about it, instead
  of appearing to work while dropping every send.
- **Token refresh.** `connect()` refreshes at 90% of expiry, but nothing sends a
  token over an already-open socket and every exit from its active state
  discards the fetched value, so the refreshed token reaches nothing. Whether
  that is dead code or a missing feature turns on whether the server enforces
  expiry mid-connection, which is not answerable from the client. Copying a
  mechanism with no demonstrated effect would only make it harder to add the
  real one later.

`tokenProvider` is required here, where `connect()` makes it optional and falls
back to minting from your long-lived credentials. That fallback already warns
that it is deprecated and points at `tokenProvider`; the eager API requires the
supported short-lived-token path explicitly.

Results arrive through `onResult` rather than the shared `onData`, because this
is the one transport that knows its own framing: messages are msgpack and are
decoded before anything else looks at them, so handing back a re-serialized
string would throw that away.

`connect()` keeps its signature and its behavior. This is an additional door
onto one protocol, not a replacement.

### Session lifecycle and reporting

Every session reports the same coarse lifecycle regardless of protocol, so an application offering more
than one model renders one status indicator rather than one per extension:

```ts
const session = fal.realtime.open(lucyRealtime(), {
  input: { prompt: "a storm over a ruined castle" },
  onState: (state) => setStatus(state), // "opening" | "live" | "failed" | "closed"
  onDiagnostic: (event) => {
    if (event.kind === "failure") setError(event.message);
  },
});

session.state; // the same value, readable at any time — "opening" from the first tick
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
type, and it is the difference between a diagnostic that helps and one that misleads. No relay
candidate can result from NAT behavior, blocked UDP, invalid credentials, or a failed TURN server;
the client reports candidate counts and per-server errors rather than guessing which cause applies.

### Inbound media and data

Whatever comes back arrives through two callbacks named once, by the client, rather than once per
extension:

```ts
const session = fal.realtime.open(wma("fal-ai/wma-outstream"), {
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

| Member                 | For                                                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `context.run()`        | a fal **endpoint**, with the parent client's auth, proxy and retries                                                                                                                 |
| `context.connect()`    | the fal realtime WebSocket                                                                                                                                                           |
| `context.fetch()`      | fal infrastructure that is **not** an endpoint — a shared bridge or control plane. Uses JSON string request bodies so every proxy adapter preserves them; returns the raw `Response` |
| `context.gatherIce()`  | ICE gathering for browser WebRTC: sufficient set, then a quiet period, under a hard bound                                                                                            |
| `context.diagnostic()` | progress and failure reports; safe to call with no `onDiagnostic` supplied                                                                                                           |
| `context.media()`      | publish an inbound stream to `onMedia`                                                                                                                                               |
| `context.data()`       | publish one inbound message to `onData`                                                                                                                                              |
| `context.fail()`       | end the session **because it failed**, as opposed to closing it                                                                                                                      |
| `context.addCleanup()` | every resource acquired, released in reverse order                                                                                                                                   |
| `context.signal`       | cancellation                                                                                                                                                                         |
| `context.endpointId`   | the endpoint this session was opened against                                                                                                                                         |
| `context.close()`      | end the managed session from inside                                                                                                                                                  |

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
