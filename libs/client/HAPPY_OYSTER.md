# Happy Oyster realtime extension

Experimental browser adapter for the fal Happy Oyster WMA app
(`fal-ai/happy-oyster-wma`). Applications use the fal client to open a session
and send controls; they do not need to import or initialize Alibaba's player
themselves.

This credential-free HTTP control protocol requires `@fal-ai/client` 1.11.0-alpha.7 and the matching registry runner. Earlier token-based alpha clients are incompatible. It is not
published yet. Do not use it against the legacy REST-only
`alibaba/happy-oyster` app.

## Quickstart

After a compatible client release is published:

```sh
npm install @fal-ai/client@alpha @happy-oyster/js-sdk@0.1.4
```

The vendor SDK is an optional peer dependency pinned to the tested version.
Installing the fal client alone does not install it. The Happy Oyster adapter
initializes and manages it for you; you do not import the vendor SDK directly.
In the browser:

```ts
import { fal } from "@fal-ai/client";
import { happyOyster } from "@fal-ai/client/happy-oyster";

// Configure this route on your server using @fal-ai/server-proxy.
// Keep FAL_KEY on the server; never embed it in browser code.
fal.config({ proxyUrl: "/api/fal/proxy" });

const { data: world } = await fal.run("fal-ai/happy-oyster-wma/worlds/create", {
  input: {
    mode: "adventure",
    prompt: "A realistic alpine village surrounded by mountains",
    perspective: "first_person",
    first_frame_image_url: "https://example.com/alpine-village.jpg",
  },
});

const video = document.querySelector<HTMLVideoElement>("video")!;
video.autoplay = true;
video.playsInline = true;
video.muted = true;

const connection = fal.realtime.open(happyOyster(), {
  worldId: world.encrypted_world_id,
  videoElement: video,
  onTravelStatus: (status) => console.log(status),
  onError: (error) => {
    if (error instanceof Error) console.error(error.message);
  },
});

const { session } = await connection.ready;
if (session.can("command")) {
  await session.command({ translation: "Front" }); // Held until replaced.
  await session.command({}); // Release every held control.
}

// Close when leaving the page, unmounting the player, or ending the session.
await connection.close();
```

You can supply an existing `worldId` instead of creating one. Pass `mode` for a
world that was not created through fal; otherwise the app resolves it. For a
private WMA app, set `endpointId` to its app root, for example
`owner/happy-oyster-wma`. `/start-session` and companion HTTP endpoints are
derived from that root.

## Modes and controls

Adventure sessions expose `command({ translation, rotation, interaction })`
(vocabularies are exported as `ADVENTURE_TRANSLATIONS`, `ADVENTURE_ROTATIONS`
and `ADVENTURE_INTERACTIONS`). Each call replaces the complete held state and
omitted fields become `"None"`. The adapter re-sends a held state while it is
held, because the model applies one command per generation step. Send
`command({})` on key release, blur, or when leaving the controls.

Directing sessions expose `instruct(text)`, `pause()`, `resume()`, and
`rewind(seconds)`. All HTTP controls run through the active billed WMA session; fal moderates instructions. The partner player still manages local playback state. Rewind takes
an absolute position in seconds. Use `session.can(action)` before enabling a
control: availability depends on both mode and the player's current state.
Calls that are unavailable reject.

Operation rejections can be `HappyOysterError`s with a `code` — the app's control error code
(for example `CONFIGURE_REJECTED`), or `http` with the fal `status` — and a
client-safe message. Managed lifecycle failures (including `onError` and
opening/control timeouts) can be plain `Error`; narrow callback values before
reading their message rather than assuming every failure has a typed code.

## Connection ownership

The adapter waits for the world to build, opens a data-only WMA control
connection, sends `configure`, and starts partner playback with the returned
credentials for a travel the runner has already created. The runner consumes
the one-time ticket and retains Alibaba's actual ID before sending the
configuration; the browser receives no usable entry ticket. The extension
acknowledges that ID before playback starts and reports readiness after RTC
starts. A client-supplied different ID cannot replace server cleanup. Media flows
directly between Alibaba and the browser. SDK 0.1.4 has no public existing-travel
join API, so the adapter replaces its private `backendService.startTravel`
hook with a one-use return of the validated runner snapshot. The ID passed
to `createTravel` as `ticket` is a local placeholder and is never exchanged
with Alibaba. The hook must exist or opening fails closed. This is why the
optional peer is pinned to the tested version; a future public join API can
replace this compatibility adapter. The vendor player owns the supplied
video element; this adapter does not emit `onMedia` tracks. The partner SDK
shares one RTC engine per browser page, so only one session can be opening,
playing, or cleaning up there. A concurrent opening rejects with
`HappyOysterError` code `busy` before configuration or billing. Await the first
connection's `close()` before opening another; separate browser tabs have
separate player contexts. If vendor cleanup exceeds the bounded close wait,
`close()` still returns, but the page remains busy until the vendor's actual
cleanup settles. Wait and retry, reload the page, or use another tab if it
stalls; allowing another player sooner could let old cleanup disconnect it.

The runner supplies `control_protocol: "fal-session-v1"` and only the travel's
RTC credentials. No Alibaba HTTP token is returned, installed or renewed.
The adapter replaces this SDK instance's backend `get` and `post` methods with
allowlisted WMA operations, including status polling and the provider feature
gate. Unknown paths and other travel IDs fail closed. The runner owns the travel
ID and rejects control after release. SDK 0.1.4 can latch onto a stale `PAUSED`
status during resume even after media restarts. The transport waits up to 15 seconds
for that transition to clear, returning actual provider data; terminal statuses
pass through immediately, and close cancels the wait. Before Directing resume or
rewind, the adapter retires the previous RTC engine using the pinned SDK's
instance `rtcSession.disconnect` hook. This avoids reusing a singleton while
its old channel's termination events are still arriving. The hook is validated
before playback; close during cleanup prevents the new join. There are no standalone status, pause,
resume, rewind, instruction or end HTTP routes. Adventure commands continue over
RTC directly; fal never transports the media.

A control acknowledgement timeout fails and disconnects the session because
replies have no correlation IDs. RTC credentials stay out of public data and
diagnostic callbacks. Session billing runs from configuration until release.

`close()` cancels pending work, removes listeners and timers, ends partner
playback, requests server-side travel release, and closes WMA. Both partner
cleanup and release acknowledgements have bounded waits; server disconnect
cleanup is the fallback. World generation is a separate durable operation;
closing a session does not delete the world.

The player SDK is loaded lazily on opening a session. `@happy-oyster/js-sdk`
0.1.4 has no public HTTP transport injection API, so the instance-level private
backend hooks are pinned and validated. The fallback request root is deliberately
invalid; authenticated operations must use the WMA adapter. This wrapper is MIT licensed;
`@happy-oyster/js-sdk` is a separately licensed Alibaba optional peer dependency.
Only Happy Oyster users install it. Neither the client root nor other realtime
entrypoints load it. Importing `@fal-ai/client/happy-oyster` is safe without it;
opening a Happy Oyster session without it rejects with `sdk_unavailable` and
installation instructions before any billable session configuration.

## Development

From the repository root:

```sh
npm ci
npx nx build client
npx nx test client --runInBand
npx nx lint client
node scripts/verify-happy-oyster-package.cjs
```

Tests exercise the real fal realtime lifecycle with mocked partner playback and
WMA transport, including cancellation, binding, session-bound HTTP controls, held commands,
and cleanup. They do not validate live Alibaba playback, account entitlements,
or billing.

The client build is CommonJS, while Alibaba's SDK exposes only an ESM import.
`happy-oyster-sdk.cjs` is copied unchanged into the package to preserve native
dynamic `import()` and keep SDK loading lazy. The packed consumer check covers
both a missing peer and an installed peer with an import-only export.

Run `node scripts/verify-happy-oyster-sdk.cjs` to exercise the real pinned SDK startup and HTTP hooks in both modes with simulated media and no paid network calls.
