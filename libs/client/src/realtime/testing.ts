import type {
  IceGatheringResult,
  RealtimeDiagnostic,
  RealtimeExtensionContext,
} from "./extension";

/**
 * A complete, compiler-checked `RealtimeExtensionContext` for extension tests.
 *
 * Returning the interface directly means a new required context member produces a compile error in
 * extension tests instead of a later "method is not a function" failure. Overrides keep individual
 * tests small without weakening the rest of the contract.
 *
 * Exported from `@fal-ai/client/realtime/testing` so external extensions can use the same checked
 * fixture. It stays out of the `./realtime` barrel so production bundles do not include it.
 */
export function fakeExtensionContext(
  overrides: Partial<RealtimeExtensionContext> = {},
): RealtimeExtensionContext {
  const ice: IceGatheringResult = {
    host: 0,
    srflx: 0,
    relay: 0,
    state: "complete",
  };
  return {
    endpointId: "test/endpoint",
    signal: new AbortController().signal,
    run: async () => ({ data: undefined, requestId: "test" }) as never,
    connect: () => ({ send: () => undefined, close: () => undefined }) as never,
    addCleanup: () => undefined,
    close: async () => undefined,
    fetch: async () => new Response("{}"),
    gatherIce: async () => ice,
    diagnostic: (_event: RealtimeDiagnostic) => undefined,
    media: (_stream: MediaStream) => undefined,
    data: (_raw: string) => undefined,
    fail: async () => undefined,
    ...overrides,
  };
}
