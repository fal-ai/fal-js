# @fal-ai/types

Type definitions for every [fal.ai](https://fal.ai) endpoint, as an optional add-on to [`@fal-ai/client`](https://www.npmjs.com/package/@fal-ai/client).

The client itself ships no endpoint types, so it stays small. Install this package when you want your endpoint calls typed and your endpoint ids autocompleted.

## Install

```sh
npm install @fal-ai/types
```

It needs `@fal-ai/client` v2 or later alongside it, which you almost certainly already have:

```sh
npm install @fal-ai/client @fal-ai/types
```

## Usage

Import it once, anywhere in your project — the import registers the types with the client for your whole compilation, so there is nothing to wire up per call site:

```ts
import "@fal-ai/types";
```

A good home for that line is wherever you already configure the client, or any file that is part of your build (an entry point, or a `types.d.ts`).

That's it. Endpoint ids now autocomplete, inputs are checked, and results are typed:

```ts
import { fal } from "@fal-ai/client";
import "@fal-ai/types";

const result = await fal.subscribe("fal-ai/flux/dev", {
  input: {
    prompt: "a cat wearing a tiny hat",
    // ^ checked against the endpoint's input schema
  },
});

result.data.images[0].url;
// ^ typed from the endpoint's output schema
```

The individual input and output types are exported too, if you want to reference them directly:

```ts
import type { FluxDevInput, FluxDevOutput } from "@fal-ai/types";

function buildPrompt(): FluxDevInput {
  return { prompt: "a cat wearing a tiny hat" };
}
```

Importing any type from the package activates the registry as well, so a `import type { ... }` line does the same job as the bare `import "@fal-ai/types"`.

## Coming from a bundled-types version of the client

The endpoint types used to ship inside `@fal-ai/client` and were importable from `@fal-ai/client/endpoints`. That subpath still works once this package is installed, so existing imports need no changes:

```ts
import type { IllusionDiffusionOutput } from "@fal-ai/client/endpoints"; // still fine
```

It is deprecated, though, and importing from `@fal-ai/types` is the way forward.

## Without this package

Everything still works — the client just can't tell one endpoint from another. Endpoint ids accept any string, inputs are `Record<string, any>`, and results are `any`:

```ts
const result = await fal.subscribe("fal-ai/flux/dev", {
  input: { prompt: "a cat wearing a tiny hat" }, // not checked
});

result.data; // any
```

## Versioning

This package is generated from the live endpoint schemas and released on its own cadence, independent of the client. Upgrading it can change or narrow endpoint types as the underlying models change, so it follows the endpoints rather than semver in the strictest sense — pin it if you need types frozen.

## License

MIT
