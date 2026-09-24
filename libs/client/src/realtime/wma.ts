/**
 * WMA extension for `fal.realtime.open()`.
 *
 * The browser POSTs a complete SDP offer to the WMA signalling bridge, while media flows directly
 * between the browser and fal runner (or through TURN). This supports receive-only generation and
 * bidirectional transforms without putting media through the bridge.
 *
 * This fal-operated protocol ships with the client and uses the same extension contract available to
 * separately versioned vendor adapters.
 *
 * Four protocol invariants shape the implementation:
 *
 *  1. NO TRICKLE ICE. The bridge takes one complete SDP, so the offer can only be sent once gathering
 *     has produced a usable candidate set — `context.gatherIce` is that strategy, and it is in the
 *     kernel precisely because this is not the last protocol that will need it.
 *  2. THE DATA CHANNEL CAN DIE WHILE ICE SAYS "connected". SCTP state is independent of
 *     `pc.connectionState`, so a caller watching only the latter believes the session is live while
 *     every control message is dropped.
 *  3. MESSAGES SENT BEFORE THE CHANNEL OPENS ARE LOST. Callers enable input on "connected", which
 *     precedes channel "open". Queue and flush, bounded.
 *  4. HEARTBEATS CAN PILE UP. A stalled bridge plus a naive setInterval produces an unbounded number
 *     of in-flight requests. Skip a tick if the last is unsettled.
 */
import { throwIfRealtimeAborted } from "./abort";
import {
  defineRealtimeExtension,
  type RealtimeExtensionContext,
  type RealtimeSession,
} from "./extension";
import { countTurnServers } from "./ice";

const WMA_URL = "https://wma.fal.run";
const ICE_DISCOVERY_TIMEOUT_MS = 5_000;
const SESSION_NEGOTIATION_TIMEOUT_MS = 120_000;
const HEARTBEAT_INTERVAL_MS = 5_000;
const HEARTBEAT_TIMEOUT_MS = 4_000;
// Reserved control-channel vocabulary for the session-affine network query: the request reaches
// the exact runner holding this peer connection over the data channel itself, which no
// out-of-band API can promise. Responses are intercepted before context.data.
const NETWORK_INFO_REQUEST_TYPE = "wma.network-info.request";
const NETWORK_INFO_RESPONSE_TYPE = "wma.network-info.response";
const NETWORK_INFO_TIMEOUT_MS = 10_000;
const BROWSER_NETWORK_INFO_TIMEOUT_MS = 5_000;
const BROWSER_NETWORK_INFO_POLL_MS = 100;
const MAX_QUEUED_MESSAGES = 64;
const DEFAULT_STUN_URL = "stun:stun.l.google.com:19302";

/** @experimental The `fal.realtime.open()` extension API is experimental and may change in a minor release. */
export type WmaControlMessage = object;

/** @experimental The `fal.realtime.open()` extension API is experimental and may change in a minor release. */
export interface WmaOptions {
  /**
   * Media direction. Sessions without a local stream default to `"recvonly"`; sessions with local
   * tracks preserve addTrack's `"sendrecv"` behavior. Pass an explicit direction for other flows.
   */
  direction?: RTCRtpTransceiverDirection;
  /**
   * Media to send UP, on the same peer connection the output comes back on.
   *
   * Supplying this is what makes a transform app possible — camera in, transformed video out — and it
   * is deliberately the same connection rather than a second one: WebRTC negotiates both directions
   * in one SDP exchange, and a second connection would double the ICE work to carry half the session.
   *
   * The tracks are NOT stopped on close. They belong to the caller, who may be showing the camera in
   * a local preview or sharing it with another session; stopping them would turn off a device this
   * extension does not own.
   */
  localStream?: MediaStream | null;
  /**
   * ICE servers. OPTIONAL — when omitted the extension first sends the routed endpoint identity to
   * the authenticated WMA bridge for short-lived TURN credentials, then falls back to the app's own
   * `/ice` endpoint for deployments that manage their own credential vending.
   *
   * That self-provisioning is the answer to "who fetches ICE servers?", and it is possible
   * because the bridge is reached through credentialed `context.fetch`, while the app fallback route
   * is a fal endpoint reached through `context.run`. The browser never sees the Metered secret,
   * only a credential minted for it.
   *
   * Pass this to override (your own TURN provider, or to force STUN for testing).
   */
  iceServers?: RTCIceServer[];
  /**
   * Which ICE candidate types the browser may use.
   *
   * The browser default, `"all"`, prefers direct host or server-reflexive paths and uses TURN only
   * when needed. Set this to `"relay"` to require a TURN path, primarily for connectivity tests.
   * Opening fails if none of the configured TURN servers can allocate a relay candidate.
   */
  iceTransportPolicy?: RTCIceTransportPolicy;
}

/** @experimental The `fal.realtime.open()` extension API is experimental and may change in a minor release. */
export interface WmaRealtimeSession extends RealtimeSession {
  sessionId: string;
  /** Bounded-queued until the control channel opens; dropped once closing. */
  send(message: WmaControlMessage): void;
  /**
   * Both ends of THIS session's selected network path: the browser's view from getStats()/the
   * SCTP ICE transport, and the runner's view queried over the data channel itself — so the two
   * rows always describe the same peer connection, never a neighboring session's.
   */
  getConnectionInfo(): Promise<WmaConnectionInfo>;
  close(): void;
}

/** @experimental The `fal.realtime.open()` extension API is experimental and may change in a minor release. */
export interface WmaIceCandidateInfo {
  type: string;
  protocol: string;
  endpoint: string;
  address?: string;
  port?: number;
  relayProtocol?: string;
  tcpType?: string;
  relatedAddress?: string;
  relatedPort?: number;
}

/** @experimental The `fal.realtime.open()` extension API is experimental and may change in a minor release. */
export interface WmaNetworkPath {
  side: "browser" | "runner";
  sessionId?: string;
  observedAtMs: number;
  available: boolean;
  reason?: string;
  connectionState: string;
  iceConnectionState: string;
  iceRole?: string;
  dtlsState?: string;
  pairSelection?: string;
  localCandidate?: WmaIceCandidateInfo;
  remoteCandidate?: WmaIceCandidateInfo;
  usesTurn?: boolean;
  browserUsesTurn?: boolean;
  runnerUsesTurn?: boolean;
  currentRoundTripTimeMs?: number;
  availableOutgoingBitrate?: number;
}

/** @experimental The `fal.realtime.open()` extension API is experimental and may change in a minor release. */
export interface WmaConnectionInfo {
  browser: WmaNetworkPath;
  runner: WmaNetworkPath;
}

/**
 * Ask the bridge for ephemeral TURN credentials, retaining the app route as a compatibility
 * fallback. This must complete before `createOffer()`: that is when the browser starts gathering
 * candidates, and adding TURN credentials afterwards cannot produce a relay candidate for the
 * one-shot SDP the bridge accepts.
 *
 * Degrades to STUN rather than failing the connect: an app without Metered configured, or a
 * provider outage, should still work for everyone on a permissive network. The failure is
 * logged rather than swallowed silently, because "no relay" is the difference between working
 * and not for anyone behind blocked UDP.
 */
/*
 * Credential propagation is enforced by the vending endpoint, not by a client-side delay. The
 * server is the only side that knows which replica minted a credential and therefore the only side
 * that can guarantee the returned credential is already usable.
 */
async function fetchIceServers(
  context: RealtimeExtensionContext,
): Promise<RTCIceServer[]> {
  const controller = new AbortController();
  const abortDiscovery = () => controller.abort(context.signal.reason);
  if (context.signal.aborted) {
    abortDiscovery();
  } else {
    context.signal.addEventListener("abort", abortDiscovery, { once: true });
  }
  const discoveryTimeout = setTimeout(
    () => controller.abort(),
    ICE_DISCOVERY_TIMEOUT_MS,
  );
  try {
    const response = await context.fetch(`${WMA_URL}/ice`, {
      method: "POST",
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id: context.endpointId }),
    });
    if (!response.ok) {
      // Drain before throwing: the kernel releases this request's signal bookkeeping when the
      // body is consumed, and a fallback session that outlives a failed bridge probe must not
      // pin the response for its whole lifetime. Same rule as the heartbeat's error drain.
      await response.arrayBuffer().catch(() => undefined);
      throw new Error(`bridge /ice request failed (HTTP ${response.status})`);
    }
    const payload = (await response.json()) as {
      ice_servers?: RTCIceServer[];
      status?: string;
      credential_age_seconds?: number;
    };
    if (Array.isArray(payload.ice_servers) && payload.ice_servers.length > 0) {
      context.diagnostic({
        kind: "progress",
        phase: "ice-servers",
        detail: {
          source: "bridge",
          status: payload.status ?? "unknown",
          credentialAgeSeconds: payload.credential_age_seconds ?? 0,
        },
      });
      return payload.ice_servers;
    }
    if (payload.status === "app_managed") {
      context.diagnostic({
        kind: "progress",
        phase: "ice-servers",
        detail: { source: "app-managed; trying app fallback" },
      });
    } else {
      throw new Error("bridge /ice response contained no ICE servers");
    }
  } catch {
    if (context.signal.aborted) {
      throw (
        context.signal.reason ??
        new DOMException("WMA ICE discovery aborted", "AbortError")
      );
    }
    // A bridge rollout must not strand existing apps which vend their own credentials.
    // Do not include the error in diagnostics: fetch implementations may include credentials in
    // their message, while the source is enough to make the fallback visible to the caller.
    context.diagnostic({
      kind: "progress",
      phase: "ice-servers",
      detail: { source: "bridge-unavailable; trying app fallback" },
    });
  } finally {
    clearTimeout(discoveryTimeout);
    context.signal.removeEventListener("abort", abortDiscovery);
  }
  // Fallback to the app's own /ice endpoint.
  const fallbackController = new AbortController();
  const abortFallback = () => fallbackController.abort(context.signal.reason);
  if (context.signal.aborted) {
    abortFallback();
  } else {
    context.signal.addEventListener("abort", abortFallback, { once: true });
  }
  const fallbackTimeout = setTimeout(
    () => fallbackController.abort(),
    ICE_DISCOVERY_TIMEOUT_MS,
  );
  try {
    const result = await context.run(`${context.endpointId}/ice`, {
      input: {},
      abortSignal: fallbackController.signal,
    });
    const payload = result.data as {
      ice_servers?: RTCIceServer[];
      status?: string;
      credential_age_seconds?: number;
    };
    if (Array.isArray(payload?.ice_servers) && payload.ice_servers.length > 0) {
      // The age is reported for observability only — the runner has already waited it out, so there
      // is nothing for this side to do with it beyond showing it.
      context.diagnostic({
        kind: "progress",
        phase: "ice-servers",
        detail: {
          source: "app-fallback",
          status: payload.status ?? "unknown",
          credentialAgeSeconds: payload.credential_age_seconds ?? 0,
        },
      });
      return payload.ice_servers;
    }
    context.diagnostic({
      kind: "progress",
      phase: "ice-servers",
      detail: { source: "empty-ice-response" },
    });
  } catch (exc) {
    if (context.signal.aborted) {
      throw (
        context.signal.reason ??
        new DOMException("WMA ICE discovery aborted", "AbortError")
      );
    }
    console.warn("[wma] /ice unavailable, falling back to STUN:", exc);
    context.diagnostic({
      kind: "progress",
      phase: "ice-servers",
      detail: {
        source: `ice-endpoint-failed: ${exc instanceof Error ? exc.message : String(exc)}`,
      },
    });
  } finally {
    clearTimeout(fallbackTimeout);
    context.signal.removeEventListener("abort", abortFallback);
  }
  return [{ urls: DEFAULT_STUN_URL }];
}

/** fal error payloads are inconsistent; dig out something a human can act on. */
async function readErrorMessage(response: Response): Promise<string> {
  const fallback = `WMA session request failed (HTTP ${response.status})`;
  try {
    const data: unknown = await response.json();
    if (typeof data === "object" && data !== null) {
      const record = data as Record<string, unknown>;
      for (const field of ["error", "message", "detail"]) {
        const value = record[field];
        if (typeof value === "string" && value) return value;
        if (
          Array.isArray(value) &&
          typeof (value[0] as any)?.msg === "string"
        ) {
          return (value[0] as any).msg;
        }
      }
    }
  } catch {
    /* non-JSON body */
  }
  return fallback;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function candidateInfo(candidate: any): WmaIceCandidateInfo {
  const address = String(candidate.address ?? candidate.ip ?? "unknown");
  const port = Number(candidate.port ?? 0);
  return {
    type: String(candidate.candidateType ?? candidate.type ?? "unknown"),
    protocol: String(candidate.protocol ?? "unknown").toLowerCase(),
    endpoint: address.includes(":")
      ? `[${address}]:${port}`
      : `${address}:${port}`,
    address,
    port,
    relayProtocol: candidate.relayProtocol,
    tcpType: candidate.tcpType,
    relatedAddress: candidate.relatedAddress,
    relatedPort: candidate.relatedPort,
  };
}

function raceProbeStep<T>(
  operation: Promise<T>,
  signal: AbortSignal,
  timeoutMs: number,
): Promise<{ timedOut: false; value: T } | { timedOut: true }> {
  throwIfRealtimeAborted(signal);
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      signal.removeEventListener("abort", onAbort);
      callback();
    };
    const onAbort = () => finish(() => reject(signal.reason));
    signal.addEventListener("abort", onAbort, { once: true });
    const timeout = setTimeout(
      () => finish(() => resolve({ timedOut: true })),
      timeoutMs,
    );
    operation.then(
      (value) => finish(() => resolve({ timedOut: false, value })),
      (error) => finish(() => reject(error)),
    );
    if (signal.aborted) onAbort();
  });
}

function probeDelay(ms: number, signal: AbortSignal): Promise<void> {
  throwIfRealtimeAborted(signal);
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      signal.removeEventListener("abort", onAbort);
      callback();
    };
    const onAbort = () => finish(() => reject(signal.reason));
    signal.addEventListener("abort", onAbort, { once: true });
    const timeout = setTimeout(() => finish(resolve), ms);
    if (signal.aborted) onAbort();
  });
}

/**
 * The browser's half of the selected path, from the SCTP transport's ICE pair when the browser
 * exposes it, with a stats-based fallback that only accepts a pair whose local endpoint matches
 * the endpoint the RUNNER observed — never "the first media transport", which produced
 * plausible-looking but contradictory rows.
 */
async function browserNetworkPath(
  pc: RTCPeerConnection,
  sessionId: string,
  runnerPath: WmaNetworkPath | undefined,
  signal: AbortSignal,
): Promise<WmaNetworkPath> {
  const deadline = Date.now() + BROWSER_NETWORK_INFO_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const statsResult = await raceProbeStep(
      pc.getStats(),
      signal,
      Math.max(0, deadline - Date.now()),
    );
    if (statsResult.timedOut === true) break;
    const report = statsResult.value;
    const stats = new Map<string, any>();
    report.forEach((item: any) => stats.set(item.id, item));

    const sctp = (pc as any).sctp;
    const dtls = sctp?.transport;
    const ice = dtls?.iceTransport;
    const selected =
      ice && typeof ice.getSelectedCandidatePair === "function"
        ? ice.getSelectedCandidatePair()
        : undefined;

    let localCandidate: WmaIceCandidateInfo | undefined;
    let remoteCandidate: WmaIceCandidateInfo | undefined;
    let pairSelection: string | undefined;
    if (selected) {
      const local = selected.local || selected.localCandidate;
      const remote = selected.remote || selected.remoteCandidate;
      if (local && remote) {
        localCandidate = candidateInfo(local);
        remoteCandidate = candidateInfo(remote);
        pairSelection = "browser-sctp-ice-transport";
      }
    }

    const runnerRemoteEndpoint = runnerPath?.remoteCandidate?.endpoint;
    const runnerLocalEndpoint = runnerPath?.localCandidate?.endpoint;
    let pair: any;
    let transport: any;
    if (!localCandidate && runnerRemoteEndpoint && runnerLocalEndpoint) {
      for (const item of stats.values()) {
        if (item.type !== "candidate-pair" || item.state !== "succeeded")
          continue;
        const local = stats.get(item.localCandidateId);
        const remote = stats.get(item.remoteCandidateId);
        if (
          local &&
          remote &&
          candidateInfo(local).endpoint === runnerRemoteEndpoint &&
          candidateInfo(remote).endpoint === runnerLocalEndpoint
        ) {
          pair = item;
          pairSelection = "cross-peer-endpoint-match";
          localCandidate = candidateInfo(local);
          remoteCandidate = candidateInfo(remote);
          for (const maybeTransport of stats.values()) {
            if (
              maybeTransport.type === "transport" &&
              maybeTransport.selectedCandidatePairId === item.id
            ) {
              transport = maybeTransport;
              break;
            }
          }
          break;
        }
      }
    }

    // Candidate-pair stats carry RTT even when the selected pair came from RTCIceTransport.
    if (localCandidate && remoteCandidate && !pair) {
      for (const item of stats.values()) {
        if (item.type !== "candidate-pair" || item.state !== "succeeded")
          continue;
        const local = stats.get(item.localCandidateId);
        const remote = stats.get(item.remoteCandidateId);
        if (
          local &&
          remote &&
          candidateInfo(local).endpoint === localCandidate.endpoint &&
          candidateInfo(remote).endpoint === remoteCandidate.endpoint
        ) {
          pair = item;
          break;
        }
      }
    }

    if (localCandidate && remoteCandidate) {
      return {
        side: "browser",
        sessionId,
        observedAtMs: Date.now(),
        available: true,
        connectionState: pc.connectionState,
        iceConnectionState: pc.iceConnectionState,
        iceRole: ice?.role || transport?.iceRole,
        dtlsState: dtls?.state || transport?.dtlsState,
        pairSelection,
        localCandidate,
        remoteCandidate,
        usesTurn:
          localCandidate.type === "relay" || remoteCandidate.type === "relay",
        browserUsesTurn: localCandidate.type === "relay",
        runnerUsesTurn: remoteCandidate.type === "relay",
        currentRoundTripTimeMs:
          pair && typeof pair.currentRoundTripTime === "number"
            ? pair.currentRoundTripTime * 1000
            : undefined,
        availableOutgoingBitrate: pair?.availableOutgoingBitrate,
      };
    }
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    await probeDelay(Math.min(BROWSER_NETWORK_INFO_POLL_MS, remaining), signal);
  }
  return {
    side: "browser",
    sessionId,
    observedAtMs: Date.now(),
    available: false,
    reason: "browser did not expose the selected SCTP ICE pair",
    connectionState: pc.connectionState,
    iceConnectionState: pc.iceConnectionState,
  };
}

/** The runner reports snake_case over the wire; the client surface is camelCase. */
function normalizeRunnerPath(path: any): WmaNetworkPath {
  const candidate = (value: any): WmaIceCandidateInfo | undefined =>
    value
      ? {
          type: value.type,
          protocol: value.protocol,
          endpoint: value.endpoint,
          address: value.address,
          port: value.port,
          relayProtocol: value.relay_protocol,
          tcpType: value.tcp_type,
          relatedAddress: value.related_address,
          relatedPort: value.related_port,
        }
      : undefined;
  return {
    side: "runner",
    sessionId: path.session_id,
    observedAtMs: path.observed_at_ms,
    available: path.available,
    reason: path.reason,
    connectionState: path.connection_state,
    iceConnectionState: path.ice_connection_state,
    iceRole: path.ice_role,
    dtlsState: path.dtls_state,
    pairSelection: "runner-sctp-nominated-pair",
    localCandidate: candidate(path.local_candidate),
    remoteCandidate: candidate(path.remote_candidate),
    usesTurn: path.uses_turn,
    runnerUsesTurn: path.runner_uses_turn,
    browserUsesTurn: path.browser_uses_turn,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * The WMA transport: a complete SDP offer POSTed to the signalling bridge, media peer-to-peer from
 * the fal runner. This is what every app that generates its own video speaks.
 *
 * Takes the endpoint it opens rather than a set it claims, because it cannot recognize one. Any
 * customer can build an app on this transport, so `fal-ai/wma-outstream` is indistinguishable by
 * name from an endpoint with no realtime path at all. That is also why there is no `supports()`
 * here: whether a model speaks WMA is declared — by the caller naming this extension, or by the
 * model's own `x-fal-realtime` contract — and never inferred from a string.
 *
 * @experimental The `fal.realtime.open()` extension API is experimental and may change in a minor release.
 */
export function wma(endpointId?: string) {
  return defineRealtimeExtension<WmaOptions, WmaRealtimeSession>({
    id: "fal/wma",
    defaultEndpoint: endpointId,
    async open(context, options) {
      if (options.direction === "stopped") {
        throw new Error('WMA direction cannot be "stopped".');
      }
      const iceServers = options.iceServers ?? (await fetchIceServers(context));
      const pc = new RTCPeerConnection({
        iceServers,
        iceTransportPolicy: options.iceTransportPolicy,
      });
      let peerClosed = false;
      const closePeer = () => {
        if (peerClosed) return;
        peerClosed = true;
        pc.close();
      };
      // Resource ownership starts at construction, before addTransceiver/createDataChannel can
      // throw. The later full teardown is registered separately once its dependent state exists.
      context.addCleanup(closePeer);

      // The default that matters: recvonly. A generated stream never needs an inbound track,
      // and asking for one would make the runner negotiate media it will not send.
      // A local track is added through a transceiver so the caller's requested direction reaches
      // SDP. Never add a second media transceiver for the same track.
      const localTracks = options.localStream?.getTracks() ?? [];
      if (localTracks.length > 0) {
        for (const track of localTracks) {
          pc.addTransceiver(track, {
            direction: options.direction ?? "sendrecv",
            streams: [options.localStream!],
          });
        }
      } else {
        pc.addTransceiver("video", {
          direction: options.direction ?? "recvonly",
        });
      }

      /**
       * Observed ICE evidence for failure diagnostics. Candidate counts and `icecandidateerror`
       * identify what was available and which server calls failed without guessing at an unseen NAT
       * or firewall cause. Errors are deduplicated because a retrying server repeats the same line.
       */
      const observed = {
        host: 0,
        srflx: 0,
        relay: 0,
        errors: new Set<string>(),
      };
      pc.addEventListener("icecandidateerror", (event) => {
        const error = event as RTCPeerConnectionIceErrorEvent;
        observed.errors.add(
          `${error.url ?? "unknown server"} → ${error.errorCode} ${error.errorText ?? ""}`.trim(),
        );
      });

      const channel = pc.createDataChannel("control");
      // Published through context.data rather than an option of this extension's own: "a message
      // arrived" means the same thing in every protocol, so the kernel names it once and an
      // application offering two extensions learns one name. See RealtimeOpenOptions.onData.
      //
      // Binary frames are DECODED, not stringified: a data channel delivers ArrayBuffer (or Blob,
      // per browser) for binary sends, and String() would hand the application the literal
      // "[object ArrayBuffer]". onData's contract is a raw string, so bytes decode as UTF-8; a
      // Blob decodes asynchronously, which can reorder around neighboring text frames — a
      // documented trade for not losing the payload entirely.
      // One decoder for every binary frame — a per-frame `new TextDecoder()` is allocation
      // churn at frame rate for identical output.
      const controlFrameDecoder = new TextDecoder();
      // Outstanding network-info queries by request id; responses are reserved JSON intercepted
      // before application data flows through context.data.
      const networkRequests = new Map<
        string,
        {
          resolve: (value: WmaNetworkPath) => void;
          reject: (error: Error) => void;
        }
      >();
      const deliverControlFrame = (raw: string) => {
        try {
          const message = JSON.parse(raw) as {
            type?: string;
            request_id?: string;
            path?: unknown;
          };
          if (message?.type === NETWORK_INFO_RESPONSE_TYPE) {
            // Reserved by TYPE alone: a malformed reserved frame (missing or non-string
            // request_id — a runner bug or version skew) is dropped with a warning, never
            // forwarded as application data the app has no schema for. A late response whose
            // waiter timed out is likewise absorbed here.
            if (typeof message.request_id !== "string") {
              context.diagnostic({
                kind: "warning",
                message: "A malformed reserved network-info frame was dropped.",
              });
              return;
            }
            const request = networkRequests.get(message.request_id);
            if (request) {
              networkRequests.delete(message.request_id);
              try {
                request.resolve(normalizeRunnerPath(message.path));
              } catch (error) {
                request.reject(
                  error instanceof Error
                    ? error
                    : new Error("WMA runner returned invalid network info"),
                );
              }
            }
            return;
          }
        } catch {
          // Application data may be any string; only reserved JSON is intercepted.
        }
        context.data(raw);
      };
      channel.onmessage = (event) => {
        const payload: unknown = event.data;
        if (typeof payload === "string") {
          deliverControlFrame(payload);
          return;
        }
        if (payload instanceof ArrayBuffer || ArrayBuffer.isView(payload)) {
          const bytes =
            payload instanceof ArrayBuffer ? new Uint8Array(payload) : payload;
          deliverControlFrame(controlFrameDecoder.decode(bytes as Uint8Array));
          return;
        }
        if (
          typeof Blob !== "undefined" &&
          payload instanceof Blob &&
          typeof payload.text === "function"
        ) {
          void payload.text().then(
            (text) => deliverControlFrame(text),
            () =>
              context.diagnostic({
                kind: "warning",
                message:
                  "A binary control-channel frame could not be decoded and was dropped.",
              }),
          );
          return;
        }
        context.diagnostic({
          kind: "warning",
          message:
            "A control-channel frame with an unsupported payload type was dropped.",
        });
      };
      const publishedStreams = new WeakSet<MediaStream>();
      pc.ontrack = (event) => {
        const streams =
          event.streams.length > 0
            ? event.streams
            : [new MediaStream([event.track])];
        for (const stream of streams) {
          if (!publishedStreams.has(stream)) {
            publishedStreams.add(stream);
            context.media(stream);
          }
        }
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed") {
          const turnOffered = countTurnServers(iceServers);
          const parts = [
            `ICE could not establish a path (iceConnectionState=${pc.iceConnectionState}).`,
            `Gathered host ${observed.host}, srflx ${observed.srflx}, relay ${observed.relay}` +
              ` from ${turnOffered} TURN server${turnOffered === 1 ? "" : "s"} offered.`,
          ];
          // Named servers with their codes. 701 is a DNS/host-lookup failure and 401/400 on an
          // allocate is the credential being refused — different fixes, and the code is the only
          // thing that distinguishes them.
          parts.push(
            observed.errors.size > 0
              ? `Servers that errored: ${[...observed.errors].join("; ")}.`
              : "No ICE server reported an error.",
          );
          // Stated only when it is true of THIS session, and as an observation rather than a cause.
          if (turnOffered > 0 && observed.relay === 0) {
            parts.push(
              "TURN was configured and no relay candidate was allocated, so a relayed path was " +
                "never available to try.",
            );
          }
          void context.fail(parts.join(" "), {
            ...observed,
            turnOffered,
            errors: [...observed.errors].join("; "),
          });
          return;
        }
        // Detail, not lifecycle. The kernel reports opening/live/failed/closed; the peer connection's
        // own vocabulary is useful for debugging WMA and meaningless as a cross-protocol signal.
        context.diagnostic({
          kind: "progress",
          phase: "connection-state",
          detail: { state: pc.connectionState },
        });
      };

      const pending: string[] = [];
      let resolveControlChannelOpen!: () => void;
      let rejectControlChannelOpen!: (error: Error) => void;
      const controlChannelOpen = new Promise<void>((resolve, reject) => {
        resolveControlChannelOpen = resolve;
        rejectControlChannelOpen = reject;
      });
      // Most callers never query connection info. A channel that dies before opening should not
      // create an unhandled rejection merely because nobody awaited this internal readiness gate.
      void controlChannelOpen.catch(() => undefined);
      let heartbeat: ReturnType<typeof setInterval> | null = null;
      let heartbeatController: AbortController | null = null;
      let heartbeatInFlight = false;
      const networkProbeController = new AbortController();
      let closed = false;
      const teardown = () => {
        if (closed) return;
        closed = true;
        networkProbeController.abort(
          new Error("WMA session closed before the network probe completed"),
        );
        rejectControlChannelOpen(
          new Error("WMA control channel closed before it opened"),
        );
        // Settle outstanding network probes NOW: their reply can no longer arrive over a channel
        // this teardown is closing, their 10s timers must not outlive the session, and a caller
        // awaiting one must hear "closed" promptly rather than a timeout after close() resolved.
        for (const [id, request] of [...networkRequests]) {
          networkRequests.delete(id);
          request.reject(
            new Error("WMA session closed before the network probe completed"),
          );
        }
        pending.length = 0;
        if (heartbeat !== null) clearInterval(heartbeat);
        heartbeatController?.abort();
        heartbeatController = null;
        channel.close();
        closePeer();
      };
      // Registered rather than only called by hand: the client runs cleanups once, in reverse
      // order, when opening fails, the signal aborts, OR the session closes. That covers the
      // abort path, which a local close() alone would leak.
      context.addCleanup(teardown);

      // Trap 2, resolved properly by the managed lifecycle: SCTP state is independent of
      // `pc.connectionState`, so the channel can die while ICE still claims "connected" and
      // every control message is silently dropped. Report it as a failed session rather than
      // laundering transport death into a clean close.
      const channelDied = () => {
        if (closed) return;
        rejectControlChannelOpen(
          new Error("WMA control channel closed before it opened"),
        );
        void context.fail(
          "control data channel closed or errored — SCTP died while ICE may still say connected",
        );
      };
      channel.onclose = channelDied;
      channel.onerror = channelDied;

      // Trap 3.
      // Session messages: open → send now, connecting → queue (bounded, oldest-first), anything
      // else → drop. Request/response probes wait for controlChannelOpen instead.
      const sendPayload = (payload: string) => {
        if (channel.readyState === "open") {
          channel.send(payload);
        } else if (channel.readyState === "connecting") {
          if (pending.length >= MAX_QUEUED_MESSAGES) pending.shift();
          pending.push(payload);
        }
      };
      channel.onopen = () => {
        resolveControlChannelOpen();
        // Guarded like the websocket pacer's drain: a channel can die between the open event
        // queuing and this handler running, and one throwing send must not escape a browser
        // event handler uncaught — nor mask that the remaining queued messages are gone.
        const queued = pending.splice(0);
        for (let i = 0; i < queued.length; i++) {
          try {
            channel.send(queued[i]);
          } catch {
            context.diagnostic({
              kind: "warning",
              message: `The control channel died while flushing; ${queued.length - i} queued message(s) were dropped.`,
            });
            break;
          }
        }
      };

      try {
        const offer = await pc.createOffer();
        // Attach listeners BEFORE setLocalDescription starts gathering — fast host/srflx
        // candidates otherwise fire before the waiter exists and are never counted.
        // Non-trickle signalling needs the kernel's sufficient-set / quiet-period / hard-bound
        // strategy so the one SDP offer contains a usable, settled candidate set.
        const gathering = context.gatherIce(pc, {
          iceServers,
          iceTransportPolicy: options.iceTransportPolicy,
        });
        const [gathered_ice] = await Promise.all([
          gathering,
          pc.setLocalDescription(offer),
        ]);
        observed.host = gathered_ice.host;
        observed.srflx = gathered_ice.srflx;
        observed.relay = gathered_ice.relay;

        if (
          options.iceTransportPolicy === "relay" &&
          gathered_ice.relay === 0
        ) {
          throw new Error(
            "WMA requires a TURN relay, but ICE gathering produced no relay candidate",
          );
        }

        const gathered = pc.localDescription;
        if (!gathered) throw new Error("failed to create WebRTC offer");
        // gatherIce reports progress through application callbacks. A callback may cancel the
        // session synchronously; never create a remote bridge resource after that cancellation.
        throwIfRealtimeAborted(context.signal);

        const sessionController = new AbortController();
        const abortSession = () =>
          sessionController.abort(context.signal.reason);
        if (context.signal.aborted) {
          abortSession();
        } else {
          context.signal.addEventListener("abort", abortSession, {
            once: true,
          });
        }
        const sessionTimeout = setTimeout(
          () => sessionController.abort(),
          SESSION_NEGOTIATION_TIMEOUT_MS,
        );
        let answer: {
          session_id: string;
          sdp: string;
          type: RTCSdpType;
        };
        try {
          // Auth comes from the client's configured credentials rather than a pasted key. The child
          // signal preserves caller cancellation while bounding a bridge that accepts but never
          // answers the negotiation request.
          const response = await context.fetch(`${WMA_URL}/session`, {
            method: "POST",
            signal: sessionController.signal,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              app_id: context.endpointId,
              sdp: gathered.sdp,
              type: gathered.type,
            }),
          });
          if (!response.ok) throw new Error(await readErrorMessage(response));
          answer = (await response.json()) as typeof answer;
        } finally {
          clearTimeout(sessionTimeout);
          context.signal.removeEventListener("abort", abortSession);
        }

        if (context.signal.aborted)
          throw new Error("cancelled before answer applied");
        await pc.setRemoteDescription({ sdp: answer.sdp, type: answer.type });
        // Recheck AFTER the await: a close or abort landing while the remote description was
        // being applied has already run the registered teardown with no heartbeat to clear —
        // creating the interval now would leave a timer firing aborted requests forever, since
        // the late session's close hits the already-latched teardown.
        if (closed || context.signal.aborted) {
          throw new Error("cancelled while applying the answer");
        }

        // Trap 4.
        // A single missed beat is a transient gap the bridge tolerates; a RUN of them is a dead
        // lease. A bridge that restarts answers every beat with 404/410 forever, and treating
        // that as transient left the handle "live" over frozen media with no diagnostic.
        let heartbeatStrikes = 0;
        const HEARTBEAT_MAX_STRIKES = 3;
        heartbeat = setInterval(() => {
          if (heartbeatInFlight) return;
          heartbeatInFlight = true;
          // Only the per-beat timeout lives here: session abort already cancels the request
          // through the kernel, which combines this signal with the session's.
          const controller = new AbortController();
          heartbeatController = controller;
          const heartbeatTimeout = setTimeout(
            () => controller.abort(),
            HEARTBEAT_TIMEOUT_MS,
          );
          context
            .fetch(`${WMA_URL}/session/heartbeat`, {
              method: "POST",
              signal: controller.signal,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ session_id: answer.session_id }),
            })
            .then(async (response) => {
              if (!response.ok) {
                // Drain the body even though it carries nothing useful: the kernel releases each
                // request's signal bookkeeping when the body is consumed, so a degraded bridge
                // returning errors every beat must not retain one combination per heartbeat.
                await response.arrayBuffer().catch(() => undefined);
                heartbeatStrikes++;
                if (
                  heartbeatStrikes >= HEARTBEAT_MAX_STRIKES &&
                  !closed &&
                  !context.signal.aborted
                ) {
                  await context.fail(
                    `WMA heartbeat rejected ${heartbeatStrikes} times in a row (last status ${response.status}) — the session lease is gone`,
                    {
                      consecutiveFailures: heartbeatStrikes,
                      lastStatus: response.status,
                    },
                  );
                }
                return;
              }
              let status: { alive?: boolean };
              try {
                status = (await response.json()) as { alive?: boolean };
              } catch {
                // A 200 whose body is not JSON (captive portal, half-broken rollout) is as dead
                // as a 404 — it must count a strike, not reset the counter and slip past the
                // alive check into the transient-network bucket.
                heartbeatStrikes++;
                if (
                  heartbeatStrikes >= HEARTBEAT_MAX_STRIKES &&
                  !closed &&
                  !context.signal.aborted
                ) {
                  await context.fail(
                    `WMA heartbeat returned unparseable responses ${heartbeatStrikes} times in a row — the session lease is gone`,
                    { consecutiveFailures: heartbeatStrikes },
                  );
                }
                return;
              }
              heartbeatStrikes = 0;
              if (
                status.alive === false &&
                !closed &&
                !context.signal.aborted
              ) {
                await context.fail(
                  "WMA bridge reports that the session is no longer alive",
                );
              }
            })
            .catch(() => {
              // A network error here is indistinguishable from a transient gap; unlike an HTTP
              // rejection it does not count a strike, because the bridge itself said nothing.
            })
            .finally(() => {
              clearTimeout(heartbeatTimeout);
              if (heartbeatController === controller) {
                heartbeatController = null;
              }
              heartbeatInFlight = false;
            });
        }, HEARTBEAT_INTERVAL_MS);

        return {
          sessionId: answer.session_id,
          send(message: WmaControlMessage) {
            // Serialization AFTER the readyState gate: a dead channel drops the message on the
            // next line, and paying full JSON encoding for it wastes CPU exactly when the app
            // is already degraded but input handlers are still firing.
            if (
              channel.readyState !== "open" &&
              channel.readyState !== "connecting"
            ) {
              return;
            }
            sendPayload(JSON.stringify(message));
          },
          async getConnectionInfo(): Promise<WmaConnectionInfo> {
            // The session can exist while SCTP is still connecting. Wait here rather than putting
            // this request/response exchange in the fire-and-forget control queue: its timeout is
            // meaningful only once the request can actually reach the runner.
            if (channel.readyState !== "open") {
              // Bounded like every other wait in this file: a middlebox silently dropping DTLS
              // can hold the channel in "connecting" for minutes without ever reaching a state
              // that rejects controlChannelOpen.
              let openDeadline: ReturnType<typeof setTimeout> | undefined;
              try {
                await Promise.race([
                  controlChannelOpen,
                  new Promise<never>((_, reject) => {
                    openDeadline = setTimeout(
                      () =>
                        reject(
                          new Error(
                            `WMA control channel did not open within ${NETWORK_INFO_TIMEOUT_MS / 1000}s`,
                          ),
                        ),
                      NETWORK_INFO_TIMEOUT_MS,
                    );
                  }),
                ]);
              } finally {
                clearTimeout(openDeadline);
              }
            }
            if (closed || channel.readyState !== "open") {
              throw new Error("WMA control channel is not available");
            }
            const requestId =
              typeof crypto !== "undefined" &&
              typeof crypto.randomUUID === "function"
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
            let timeout: ReturnType<typeof setTimeout> | undefined;
            const runner = new Promise<WmaNetworkPath>((resolve, reject) => {
              timeout = setTimeout(() => {
                const request = networkRequests.get(requestId);
                if (!request) return;
                networkRequests.delete(requestId);
                request.reject(
                  new Error(
                    `runner network info timed out after ${NETWORK_INFO_TIMEOUT_MS / 1000}s`,
                  ),
                );
              }, NETWORK_INFO_TIMEOUT_MS);
              networkRequests.set(requestId, {
                resolve: (value) => {
                  clearTimeout(timeout);
                  resolve(value);
                },
                reject: (error) => {
                  clearTimeout(timeout);
                  reject(error);
                },
              });
            });
            try {
              channel.send(
                JSON.stringify({
                  type: NETWORK_INFO_REQUEST_TYPE,
                  request_id: requestId,
                }),
              );
            } catch (error) {
              const request = networkRequests.get(requestId);
              networkRequests.delete(requestId);
              request?.reject(
                error instanceof Error
                  ? error
                  : new Error("WMA network probe could not be sent"),
              );
            }
            // Runner first: its response comes over this exact data channel and gives the
            // browser probe an endpoint to cross-match when getStats() does not expose an
            // SCTP-to-transport relationship.
            const runnerPath = await runner;
            const browser = await browserNetworkPath(
              pc,
              answer.session_id,
              runnerPath,
              networkProbeController.signal,
            );
            for (const path of [browser, runnerPath]) {
              const local = path.localCandidate;
              const remote = path.remoteCandidate;
              context.diagnostic({
                kind: "progress",
                phase: "network-path",
                detail: {
                  side: path.side,
                  local: local
                    ? `${local.type}/${local.protocol} ${local.endpoint}`
                    : "unavailable",
                  remote: remote
                    ? `${remote.type}/${remote.protocol} ${remote.endpoint}`
                    : "unavailable",
                  usesTurn: path.usesTurn ? "yes" : "no",
                  rttMs:
                    path.currentRoundTripTimeMs === undefined
                      ? "unavailable"
                      : Math.round(path.currentRoundTripTimeMs),
                },
              });
            }
            return { browser, runner: runnerPath };
          },
          close: teardown,
        };
      } catch (exc) {
        teardown();
        throw exc;
      }
    },
  });
}

/*
 * Usage — a pure output stream is the degenerate case, which is the point:
 *
 *   const stream = fal.realtime.open(wma("fal-ai/wma-outstream"), {
 *     onMedia: (s) => { videoEl.srcObject = s },
 *     onState: (s) => { if (s === "failed") console.warn("died") },
 *   });
 *
 * The handle returns synchronously in state "opening" (await `.ready` for the promise style).
 * No `send`, no message schema, no key handling. An interactive world model is the same
 * call plus `onData` and `send({ type: "keys", pressed, activated })`.
 */
