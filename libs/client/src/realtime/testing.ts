import type {
  IceGatheringResult,
  RealtimeDiagnostic,
  RealtimeExtensionContext,
} from "./extension";

/**
 * A complete `RealtimeExtensionContext` for tests, with every member present.
 *
 * EXISTS TO KILL A CAST. The extension specs used to build a partial object and write
 * `as unknown as RealtimeExtensionContext`, and a double cast switches off checking altogether — so
 * when the context grew `fetch`, `gatherIce`, `diagnostic` and `fail`, every spec kept compiling with
 * a fake that had none of them. The failure surfaced at runtime instead, as
 * "context.diagnostic is not a function", which is strictly later and harder to read than a build
 * error would have been.
 *
 * Because this returns a real `RealtimeExtensionContext` with no cast, adding a member to the
 * interface now breaks these specs at COMPILE time — which is the entire reason the interface exists.
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
    fail: async () => undefined,
    ...overrides,
  };
}
