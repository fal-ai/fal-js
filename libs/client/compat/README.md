# compat

Hand-written files copied verbatim into the published package by the `build`
target's `assets` (see `../project.json`), landing at `src/types/`.

They are not part of the client's TypeScript compilation. `endpoints.d.ts`
re-exports `@fal-ai/types`, which the client cannot reference from its own
sources: `@fal-ai/types` augments `@fal-ai/client`, so a source-level import
would create a dependency cycle between the two projects.

For the same reason the client does not declare `@fal-ai/types` as an optional
peer dependency. This workspace uses the nx npm preset, which derives the project
graph from `package.json`, so declaring it — even as an optional peer — puts the
cycle back and breaks `nx build`. The relationship is documented in the two
READMEs instead. Nothing is lost by leaving it out: npm does not install
optional peers, nor warn when they are missing.
