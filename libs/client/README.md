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

## Where the client sends your credentials

Credentials and scoped tokens are only ever attached to `https://fal.ai` and
`https://fal.run` URLs and their subdomains. Endpoint ids resolve to those hosts,
and a URL passed in place of an endpoint id is refused when it points anywhere
else. Hosts are matched on dot boundaries, so a lookalike domain that merely
ends with the same characters is not fal and never receives a key.

If requests have to go through a server you control, configure it as a proxy
rather than rewriting the URL in a request middleware:

```ts
fal.config({
  // browser-only by default; pass { url, when: "always" } for other runtimes
  proxyUrl: "/api/fal/proxy",
});
```

The request then travels to your proxy, while the logical fal destination stays
in the `x-fal-target-url` header and is still validated.

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

## More features

The client library offers a plethora of features designed to simplify your journey with `fal.ai`. Dive into the [official documentation](https://fal.ai/docs) for a comprehensive guide.
