# Happy Oyster realtime extension

Experimental browser adapter for Happy Oyster's `happy-oyster/1` external-session
contract. Applications use the fal client to open a session and send commands;
they do not need to import or initialize Alibaba's player themselves.

This package requires the realtime extension API and data-only WMA support in
`@fal-ai/client` (fal-js #230). It is not published yet. Do not use it against the
legacy REST-only `alibaba/happy-oyster` app.

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
  },
});

const video = document.querySelector<HTMLVideoElement>("video")!;
video.autoplay = true;
video.playsInline = true;
video.muted = true;

const connection = fal.realtime.open(happyOyster(), {
  worldId: world.encrypted_world_id,
  videoElement: video,
  onState: (state) => console.log(state),
  onError: () => console.error("Happy Oyster session failed"),
});

const { session } = await connection.ready;
if (session.can("command")) {
  await session.command({ translation: "Front" });
  await session.command({}); // Release every held control.
}

// Close when leaving the page, unmounting the player, or ending the session.
await connection.close();
```

You can supply an existing `worldId` instead of creating one. For a private WMA
app, set `endpointId` to its app root, for example `owner/happy-oyster-wma`.
`/start-session` and companion HTTP endpoints are derived from that root.

## Modes and controls

Adventure sessions expose `command({ translation, rotation, interaction })`.
Each command replaces the complete held state; omitted fields become `"None"`.
Send `command({})` on key release, blur, or when leaving the controls.

Directing sessions expose `instruct(text)`, `pause()`, `resume()`, and
`rewind(seconds)`. Rewind takes an absolute position in seconds. Use
`session.can(action)` before enabling a control: availability depends on both
mode and the player's current state. Calls that are unavailable reject.

## Connection ownership

The adapter polls world readiness, opens a data-only WMA control connection,
provisions a ticket and billable token grant, and starts partner playback. It
reports readiness only after binding the exact partner travel ID to the WMA
session. Media flows directly between Alibaba and the browser. The vendor
player owns the supplied video element; this adapter does not emit `onMedia`
tracks. Use a different element for each concurrent session.

Tokens refresh automatically before expiry. A failed or stalled refresh fails
and closes the session. Provisioning and token issuance are never automatically
retried because they can be billable. `tokenExpireSeconds` defaults to 60 and
accepts 1–1800 seconds. Session credentials are kept inside the adapter rather
than exposed through its data/diagnostic callbacks.

`close()` cancels pending work, removes listeners and timers, ends partner
playback, requests server-side travel release, and closes WMA. Both partner
cleanup and release acknowledgements have bounded waits; server disconnect
cleanup is the fallback. World generation is a separate durable operation;
closing a session does not delete the world.

The player SDK is loaded lazily on opening a session. This package's wrapper is
MIT licensed; `@happy-oyster/js-sdk` is a separately licensed Alibaba dependency.
Installing this package opts into that dependency; the core fal client does not
load or depend on it.

## Development

From the repository root:

```sh
npm ci
npx nx build happy-oyster
npx nx test happy-oyster
npx nx lint happy-oyster
```

Tests exercise the real fal realtime lifecycle with mocked partner playback and
WMA transport, including cancellation, binding, token renewal, and cleanup.
They do not validate live Alibaba playback, account entitlements, or billing.
