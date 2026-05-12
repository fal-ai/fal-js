# @fal-ai/schemas

Runtime schemas for fal.ai API endpoints. Ships **Zod** schemas for validation plus **JSON Schema** definitions for tooling — no TypeScript type definitions.

If you want TypeScript types, derive them from the Zod schemas with `z.infer<typeof SomeEndpointSchema>`.

## Generating

From the repo root:

```bash
# 1. Fetch the latest OpenAPI specs (requires FAL_KEY in .env.local)
npm run fetch-schemas

# 2. Run @hey-api/openapi-ts to emit zod.gen.ts + schemas.gen.ts per category
npm run generate-schemas

# 3. Emit per-category endpoint-schema.ts (Zod discriminatedUnion) and the
#    top-level schemas.ts / json-schemas.ts barrels
npm run generate-endpoint-maps

# Or run all three in sequence
npm run update-schemas
```

A daily GitHub Actions workflow (`.github/workflows/update-openapi-schemas.yml`) runs this pipeline and opens a PR when the schemas change.

## Entry points

- `@fal-ai/schemas` — re-exports everything from `./schemas`.
- `@fal-ai/schemas/schemas` — per-category Zod `discriminatedUnion('endpoint', [...])` schemas plus their inferred TS types.
- `@fal-ai/schemas/json-schemas` — JSON-Schema-compliant `as const` objects, one named export per OpenAPI schema (emitted by `@hey-api/schemas` with `type: 'json'`).

## Peer dependencies

- `zod ^4` — required if you import from `./schemas`.

The Zod peer dependency is optional in `package.json`. Skip it if you only need the JSON Schemas.
