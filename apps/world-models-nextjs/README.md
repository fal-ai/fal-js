# World models with fal.js

A deliberately small Next.js app showing how a customer can use two very
different realtime world models through the same fal.js lifecycle:

- Lucy 2.5: browser camera → fal signaling → WebRTC video
- Happy Oyster: create a persistent world → vendor RTC travel → controls

The pages contain only product UI and model-specific controls. Signaling,
polling, heartbeats, token refresh, command cadence, and teardown live in the
fal.js extensions.

## Run locally

From the repository root:

```bash
cp apps/world-models-nextjs/.env.example apps/world-models-nextjs/.env.local
# Put your server-side FAL_KEY in .env.local
npx nx serve world-models-nextjs --port=3200
```

Open `http://localhost:3200`.

This demo leaves the proxy unauthenticated so it is easy to run locally.
Before deploying a customer app, protect both API routes with the app's own
authentication and rate limits.
