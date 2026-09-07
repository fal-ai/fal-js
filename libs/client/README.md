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

## Endpoint types

The client ships without endpoint types, which keeps it small. Install [`@fal-ai/types`](https://www.npmjs.com/package/@fal-ai/types) and import it once, anywhere in your project, to have endpoint ids autocomplete and inputs and results typed per endpoint:

```sh
npm install --save @fal-ai/types
```

```ts
import "@fal-ai/types";

const result = await fal.subscribe("fal-ai/flux/dev", {
  input: { prompt: "a cat wearing a tiny hat" },
});

result.data.images[0].url; // typed
```

Without it, everything still works — endpoint ids accept any string, inputs are `Record<string, any>` and results are `any`.

> **Upgrading:** the endpoint types used to be bundled in this package. They now live in `@fal-ai/types`, so install it to keep them. Existing imports from `@fal-ai/client/endpoints` keep working unchanged — that subpath now re-exports `@fal-ai/types` — though new code should import from `@fal-ai/types` directly.

## More features

The client library offers a plethora of features designed to simplify your journey with `fal.ai`. Dive into the [official documentation](https://fal.ai/docs) for a comprehensive guide.
