# @fal-ai/schemas

Runtime schemas for fal.ai API endpoints. Ships **JSON Schema** definitions for tooling plus **Zod** schemas for validation — no TypeScript type definitions.

If you want TypeScript types, derive them from the Zod schemas with `z.infer<typeof someSchema>`.

## Generating

From the repo root:

```bash
# 1. Fetch the latest OpenAPI specs (requires FAL_KEY in .env.local)
npm run fetch-schemas

# 2. Run @hey-api/openapi-ts to emit zod.gen.ts + schemas.gen.ts per category
npm run generate-schemas

# 3. Emit per-category endpoint-schema.ts (typed endpoint record) and the
#    top-level schemas.ts / zod.ts barrels
npm run generate-endpoint-maps

# Or run all three in sequence
npm run update-schemas
```

A daily GitHub Actions workflow (`.github/workflows/update-openapi-schemas.yml`) runs this pipeline and opens a PR when the schemas change.

## Entry points

The package ships as ES Modules with per-category subpath exports so bundlers only pull in what you import.

JSON Schemas (no `zod` peer required):

- `@fal-ai/schemas` — default entry, re-exports the namespaced JSON Schemas.
- `@fal-ai/schemas/schemas` — same as above; every category exposed under its own namespace (e.g. `Image.AestheticsSchema`).
- `@fal-ai/schemas/schemas/{category}` — JSON Schemas for a single category (e.g. `@fal-ai/schemas/schemas/image`). Categories: `3d`, `audio`, `image`, `json`, `llm`, `speech`, `text`, `training`, `unknown`, `video`, `vision`, `workflow`.

Zod (requires `zod ^4`):

- `@fal-ai/schemas/zod` — every category namespaced (e.g. `Image.imageEndpoints`, `Image.zAuraFlowInput`). Raw input/output schema names collide across categories, so the top-level barrel namespaces per category to match the JSON Schemas layout.
- `@fal-ai/schemas/zod/{category}` — single category's `{category}Endpoints` record (a typed `{ [endpointId]: { input, output } }` map), the `{Category}EndpointId` key-union type, and every `z*Input` / `z*Output` schema. Importing this drags in the entire category's `zod.gen.ts` because it contains top-level `z.globalRegistry` side effects.

### Typed-client example

```ts
import { z } from "zod";
import { imageEndpoints, type ImageEndpointId } from "@fal-ai/schemas/zod/image";

async function callImage<E extends ImageEndpointId>(endpoint: E, input: z.input<(typeof imageEndpoints)[E]["input"]>): Promise<z.output<(typeof imageEndpoints)[E]["output"]>> {
  const parsed = imageEndpoints[endpoint].input.parse(input);
  // ...send to fal, then:
  // return imageEndpoints[endpoint].output.parse(rawResponse);
}
```

The endpoint id narrows `input`/`output` to the precise per-endpoint schemas — no per-endpoint overloads or `as` casts required.

### Envelope validation

There is no exported `discriminatedUnion` over `{ endpoint, input, output }`. The per-endpoint record covers narrowing and the typed-client pattern above; consumers who specifically want envelope validation can dispatch via the record:

```ts
imageEndpoints[payload.endpoint].input.parse(payload.input);
```

or build a discriminated union on demand from the record entries.

## Peer dependencies

- `zod ^4` — required if you import from `./zod` or `./zod/{category}`.

The Zod peer dependency is optional in `package.json`. Skip it if you only need the JSON Schemas.
