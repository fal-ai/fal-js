import type { IceGatheringOptions, IceGatheringResult } from "./extension";

/** @experimental The `fal.realtime.open()` extension API is experimental and may change in a minor release. */
export const DEFAULT_ICE_TIMEOUT_MS = 12_000;
/** @experimental The `fal.realtime.open()` extension API is experimental and may change in a minor release. */
export const DEFAULT_ICE_QUIET_PERIOD_MS = 1_250;

/**
 * Number of configured TURN servers, counting each server object at most once.
 *
 * @experimental The `fal.realtime.open()` extension API is experimental and may change in a minor release.
 */
export function countTurnServers(iceServers: RTCIceServer[]): number {
  return iceServers.filter((server) => {
    const urls = Array.isArray(server.urls) ? server.urls : [server.urls];
    return urls.some((url) => /^turns?:/i.test(url));
  }).length;
}

/**
 * Does this configuration include a TURN server? Then a relay candidate is required.
 *
 * @experimental The `fal.realtime.open()` extension API is experimental and may change in a minor release.
 */
export function hasTurnServer(iceServers: RTCIceServer[]): boolean {
  return countTurnServers(iceServers) > 0;
}

/**
 * `typ host`, `typ srflx` or `typ relay` out of a candidate line.
 *
 * @experimental The `fal.realtime.open()` extension API is experimental and may change in a minor release.
 */
export function parseIceCandidateType(
  candidate: string,
): "host" | "srflx" | "relay" | null {
  const match = candidate.match(/(?:^|\s)typ\s+(host|srflx|relay)(?:\s|$)/);
  return (match?.[1] as "host" | "srflx" | "relay" | undefined) ?? null;
}

/**
 * Resolve when the candidate set is good enough AND has settled, when gathering completes, or when
 * the hard bound elapses — whichever comes first.
 *
 * Every candidate restarts the quiet-period debounce, because the goal is a stable set in the SDP
 * rather than the first usable address the browser happens to find. A TURN configuration is not
 * "sufficient" until a relay candidate exists: shipping an offer without one when TURN was configured
 * produces a connection that cannot work and reports nothing about why.
 *
 * @experimental The `fal.realtime.open()` extension API is experimental and may change in a minor release.
 */
export async function gatherIceCandidates(
  pc: Pick<
    RTCPeerConnection,
    "iceGatheringState" | "addEventListener" | "removeEventListener"
  >,
  options: IceGatheringOptions & {
    onProgress?: (result: IceGatheringResult) => void;
  } = {},
): Promise<IceGatheringResult> {
  const {
    iceServers = [],
    iceTransportPolicy = "all",
    timeoutMs = DEFAULT_ICE_TIMEOUT_MS,
    quietPeriodMs = DEFAULT_ICE_QUIET_PERIOD_MS,
    signal,
    onProgress,
  } = options;

  const abortReason = () =>
    signal?.reason ?? new DOMException("ICE gathering aborted", "AbortError");
  if (signal?.aborted) throw abortReason();

  const counts = { host: 0, srflx: 0, relay: 0 };
  const snapshot = (
    state: IceGatheringResult["state"],
  ): IceGatheringResult => ({
    ...counts,
    state,
  });

  if (pc.iceGatheringState === "complete") {
    const done = snapshot("complete");
    onProgress?.(done);
    return done;
  }

  return new Promise<IceGatheringResult>((resolve, reject) => {
    let settled = false;
    let quiet: ReturnType<typeof setTimeout> | null = null;
    const requireRelay = hasTurnServer(iceServers);
    const sufficient = () =>
      iceTransportPolicy === "relay"
        ? counts.relay > 0
        : requireRelay
          ? counts.relay > 0
          : counts.srflx > 0;

    const removeWaiters = () => {
      clearTimeout(hardBound);
      if (quiet !== null) clearTimeout(quiet);
      pc.removeEventListener(
        "icegatheringstatechange",
        onState as EventListener,
      );
      pc.removeEventListener("icecandidate", onCandidate as EventListener);
      signal?.removeEventListener("abort", onAbort);
    };
    const finish = (state: IceGatheringResult["state"]) => {
      if (settled) return;
      settled = true;
      removeWaiters();
      const done = snapshot(state);
      onProgress?.(done);
      resolve(done);
    };
    const onAbort = () => {
      if (settled) return;
      settled = true;
      removeWaiters();
      reject(abortReason());
    };
    const onState = () => {
      if (pc.iceGatheringState === "complete") finish("complete");
    };
    const onCandidate = (event: RTCPeerConnectionIceEvent) => {
      const type = event.candidate
        ? parseIceCandidateType(event.candidate.candidate)
        : null;
      if (type) counts[type] += 1;
      if (quiet !== null) clearTimeout(quiet);
      if (sufficient())
        quiet = setTimeout(() => finish("sufficient"), quietPeriodMs);
    };
    const hardBound = setTimeout(() => finish("timeout"), timeoutMs);
    pc.addEventListener("icegatheringstatechange", onState as EventListener);
    pc.addEventListener("icecandidate", onCandidate as EventListener);
    signal?.addEventListener("abort", onAbort, { once: true });
    // Close the race where the signal aborts between the initial check and listener registration.
    if (signal?.aborted) onAbort();
  });
}
