# Contributing to @fal-ai/schemas

All files under `src/` are generated — do not edit them by hand. To change what ships, update the generator scripts or the upstream OpenAPI specs and regenerate.

## Regenerating schemas

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

## Layout

- `src/{category}/zod.gen.ts` — raw Zod schemas, one per request/response model.
- `src/{category}/schemas.gen.ts` — raw JSON Schemas for the same models.
- `src/{category}/endpoint-schema.ts` — typed `{category}Endpoints` record keyed by fal endpoint id, plus the `{Category}EndpointId` key union.
- `src/{category}/index.ts` — barrel re-exporting both `zod.gen.ts` and `endpoint-schema.ts`.
- `src/schemas.ts` / `src/zod.ts` — top-level barrels that namespace each category to avoid name collisions across them.

The `sideEffects` field in `package.json` keeps `zod.gen.*` and `endpoint-schema.*` from being tree-shaken away — they register schemas on `z.globalRegistry` at import time.
