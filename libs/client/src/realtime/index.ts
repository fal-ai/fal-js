export {
  defineRealtimeExtension,
  type AnyRealtimeExtension,
  type IceGatheringOptions,
  type IceGatheringResult,
  type RealtimeDiagnostic,
  type RealtimeExtension,
  type RealtimeExtensionContext,
  type RealtimeExtensionOptions,
  type RealtimeExtensionSession,
  type RealtimeOpenOptions,
  type RealtimeSession,
  type RealtimeState,
} from "./extension";

// Exported so an extension living outside this package can reuse the strategy rather than
// reimplement it, which is the whole reason it moved into the kernel.
export {
  DEFAULT_ICE_QUIET_PERIOD_MS,
  DEFAULT_ICE_TIMEOUT_MS,
  gatherIceCandidates,
  hasTurnServer,
  parseIceCandidateType,
} from "./ice";

export * from "./happy-oyster";
export * from "./lucy";
