// This file is manually maintained (not auto-generated).
// Heavy lifting (spec merge, schema rename, missing-ref injection, fal-file
// marking, default coercion) lives in scripts/lib/merge-openapi-specs.ts so
// scripts/generate-endpoint-maps.ts can reuse it.

import { buildMergedCategorySpecs } from "./scripts/merge-openapi-specs";

// Silence noisy heyapi warnings/logs that don't represent actionable issues.
const originalWarn = console.warn;
console.warn = (...args: Array<unknown>) => {
  const message = args[0];
  if (
    typeof message === "string" &&
    message.includes("Transformers warning:")
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

const originalLog = console.log;
console.log = (...args: Array<unknown>) => {
  const message = args[0];
  if (
    typeof message === "string" &&
    message.includes("raw OpenAPI specification")
  ) {
    return;
  }
  originalLog.apply(console, args);
};

export default buildMergedCategorySpecs().map(({ category, mergedSpec }) => ({
  input: mergedSpec,
  output: {
    path: `./libs/schemas/src/${category}`,
    indexFile: false,
    postProcess: ["prettier"],
  },
  plugins: [
    { name: "@hey-api/schemas", type: "json" },
    // metadata stays off (default): `.register(z.globalRegistry, ...)` calls
    // would be top-level side effects that block tree-shaking the category.
    // Descriptions/examples already ship in schemas.gen.ts (JSON Schema).
    { name: "zod" },
  ],
  parser: {
    filters: {
      schemas: {
        include: "/Input$|Output$/",
      },
      operations: {
        include: ["/post .*/"],
        exclude: ["/get .*/"],
      },
      orphans: false,
      preserveOrder: true,
    },
  },
}));
