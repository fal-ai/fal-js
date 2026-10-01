# Happy Oyster realtime extension

Experimental browser adapter for the fal Happy Oyster WMA app
(`fal-ai/happy-oyster-wma`). Applications use the fal client to open a session
and send controls; they do not need to import or initialize Alibaba's player
themselves.

This package requires the realtime extension API and data-only WMA support
(`receive: []`) in `@fal-ai/client` 1.11.0-alpha.1 or later. It is not
published yet. Do not use it against the legacy REST-only
`alibaba/happy-oyster` app.

## Quickstart

After compatible releases are published, install `@fal-ai/client` and
`@fal-ai/happy-oyster`. In the browser:

```ts
import { fal } from "@fal-ai/client";
import { happyOyster } from "@fal-ai/happy-oyster";

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
  onError: (error) => console.error(error.message),
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
`rewind(seconds)`. Instructions go through the app's `/travels/instruct`
endpoint so fal moderates them; the rest drive the partner player. Rewind takes
an absolute position in seconds. Use `session.can(action)` before enabling a
control: availability depends on both mode and the player's current state.
Calls that are unavailable reject.

Failures are `HappyOysterError`s with a `code` — the app's control error code
(for example `CONFIGURE_REJECTED`), or `http` with the fal `status` — and a
client-safe message.

## Connection ownership

The adapter waits for the world to build, opens a data-only WMA control
connection, sends `configure`, and starts partner playback with the returned
credentials. It reports readiness only after binding the exact partner travel
ID to the WMA session (as soon as the partner SDK reports it). Media flows
directly between Alibaba and the browser. The vendor player owns the supplied
video element; this adapter does not emit `onMedia` tracks. Use a different
element for each concurrent session.

The partner token is renewed over the WMA connection before it expires, and a
failed renewal is retried while the token is still valid; expiry fails the
session. Initial and renewed token deadlines include credential request
latency, so a delayed reply cannot extend a token's lifetime. Credentials are
kept inside the adapter rather than exposed through
its data/diagnostic callbacks. Billing is per session second from
configuration to release, handled by the app.

`close()` cancels pending work, removes listeners and timers, ends partner
playback, requests server-side travel release, and closes WMA. Both partner
cleanup and release acknowledgements have bounded waits; server disconnect
cleanup is the fallback. World generation is a separate durable operation;
closing a session does not delete the world.

The player SDK is loaded lazily on opening a session. `@happy-oyster/js-sdk`
0.1.x ignores its documented `model` option, so the adapter points the SDK's
request root at the model the app returns; SDK builds that honor `model` are
left untouched. This package's wrapper is MIT licensed; `@happy-oyster/js-sdk`
is a separately licensed Alibaba dependency. Installing this package opts into
that dependency; the core fal client does not load or depend on it.

## Development

From the repository root:

```sh
npm ci
npx nx build happy-oyster
npx nx test happy-oyster
npx nx lint happy-oyster
```

Tests exercise the real fal realtime lifecycle with mocked partner playback and
WMA transport, including cancellation, binding, token renewal, held commands,
and cleanup. They do not validate live Alibaba playback, account entitlements,
or billing.
