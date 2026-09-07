/**
 * Compatibility re-export of the endpoint types, which now live in their own
 * package, `@fal-ai/types`.
 *
 * Importing from `@fal-ai/client/endpoints` keeps working as long as
 * `@fal-ai/types` is installed alongside the client, so existing code needs no
 * changes:
 *
 * ```ts
 * import type { IllusionDiffusionOutput } from "@fal-ai/client/endpoints";
 * ```
 *
 * New code should import from `@fal-ai/types` directly.
 *
 * This file is only reachable from the `./endpoints` subpath, never from the
 * client's entry point, so consumers who do not use the subpath never load it
 * and never need `@fal-ai/types` installed.
 *
 * @deprecated Import from `@fal-ai/types` instead. This subpath is kept for
 * backwards compatibility and may be removed in a future major version.
 */
export * from "@fal-ai/types";
