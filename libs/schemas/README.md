# @fal-ai/schemas

TypeScript types and Zod schemas for fal.ai API endpoints.

This package is generated from fal.ai's OpenAPI specifications. The contents of `src/` (except this README and the placeholder entry points) are produced by the generator scripts under `scripts/` at the repo root.

## Generating

From the repo root:

```bash
# 1. Fetch the latest OpenAPI specs (requires FAL_KEY in .env.local)
npm run fetch-openapi-models

# 2. Generate TypeScript types and Zod schemas via @hey-api/openapi-ts
npm run generate-types

# 3. Generate endpoint maps and discriminated unions
npm run generate-endpoint-maps

# Or run all three in sequence
npm run update-types
```

A daily GitHub Actions workflow (`.github/workflows/update-openapi-types.yml`) also runs this pipeline and opens a PR when the schemas change.

## Entry points

- `@fal-ai/schemas` — `EndpointType`, `InputType<T>`, `OutputType<T>`, and their strict variants.
- `@fal-ai/schemas/endpoints` — `EndpointTypeMap`.
- `@fal-ai/schemas/schemas` — Zod schemas (peer dependency on `zod@^4`).

## Status

The Zod export is optional — install `zod@^4` alongside this package if you want runtime validation.
