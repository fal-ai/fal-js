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
import {
  defineRealtimeExtension,
  type RealtimeExtensionContext,
  type RealtimeSession,
} from "./extension";
import { countTurnServers } from "./ice";

const WMA_URL = "https://wma.fal.run";
const HEARTBEAT_INTERVAL_MS = 5_000;
const MAX_QUEUED_MESSAGES = 64;
const DEFAULT_STUN_URL = "stun:stun.l.google.com:19302";

export type WmaControlMessage = object;

export interface WmaOptions {
  /**
   * Endpoint to open. Read by the client as `optionEndpointId ?? extension.defaultEndpoint`,
   * so it belongs in the options type even though `open()`'s signature does not mention it, which
   * is how every extension declares it.
   */
  endpointId?: string;
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

export interface WmaRealtimeSession extends RealtimeSession {
  sessionId: string;
  /** Bounded-queued until the control channel opens; dropped once closing. */
  send(message: WmaControlMessage): void;
  close(): void;
}

export interface IceCandidateCounts {
  host: number;
  srflx: number;
  relay: number;
}
export type IceGatheringState =
  | "gathering"
  | "complete"
  | "sufficient"
  | "timeout";
export interface IceGatheringProgress extends IceCandidateCounts {
  state: IceGatheringState;
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
  try {
    const response = await context.fetch(`${WMA_URL}/ice`, {
      method: "POST",
      signal: context.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id: context.endpointId }),
    });
    if (!response.ok) {
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
  }
  // Fallback to the app's own /ice endpoint.
  try {
    const result = await context.run(`${context.endpointId}/ice`, {
      input: {},
      abortSignal: context.signal,
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

/**
 * The WMA transport: a complete SDP offer POSTed to the signalling bridge, media peer-to-peer from
 * the fal runner. This is what every app that generates its own video speaks.
 *
 * Takes the endpoint it opens rather than a set it claims, because it cannot recognize one. Any
 * customer can build an app on this transport, so `fal-ai/wma-outstream` is indistinguishable by
 * name from an endpoint with no realtime path at all. That is also why there is no `supports()`
 * here: whether a model speaks WMA is declared — by the caller naming this extension, or by the
 * model's own `x-fal-realtime` contract — and never inferred from a string.
 */
export function wma(endpointId?: string) {
  return defineRealtimeExtension<WmaOptions, WmaRealtimeSession>({
    id: "fal/wma",
    defaultEndpoint: endpointId,
    async open(context, options) {
      const iceServers = options.iceServers ?? (await fetchIceServers(context));
      const pc = new RTCPeerConnection({
        iceServers,
        iceTransportPolicy: options.iceTransportPolicy,
      });

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
      channel.onmessage = (event) => context.data(String(event.data));
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

      let heartbeat: ReturnType<typeof setInterval> | null = null;
      let heartbeatInFlight = false;
      let closed = false;
      const teardown = () => {
        if (closed) return;
        closed = true;
        if (heartbeat !== null) clearInterval(heartbeat);
        channel.close();
        pc.close();
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
        void context.fail(
          "control data channel closed or errored — SCTP died while ICE may still say connected",
        );
      };
      channel.onclose = channelDied;
      channel.onerror = channelDied;

      // Trap 3.
      const pending: string[] = [];
      channel.onopen = () => {
        for (const payload of pending.splice(0)) channel.send(payload);
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

        // Auth comes from the client's configured credentials rather than a pasted key.
        // context.signal is honoured per the extension contract: it aborts when the caller
        // cancels opening or closes the session.
        const response = await context.fetch(`${WMA_URL}/session`, {
          method: "POST",
          signal: context.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            app_id: context.endpointId,
            sdp: gathered.sdp,
            type: gathered.type,
          }),
        });
        if (!response.ok) throw new Error(await readErrorMessage(response));

        if (context.signal.aborted)
          throw new Error("cancelled before answer applied");
        const answer = (await response.json()) as {
          session_id: string;
          sdp: string;
          type: RTCSdpType;
        };
        await pc.setRemoteDescription({ sdp: answer.sdp, type: answer.type });

        // Trap 4.
        heartbeat = setInterval(() => {
          if (heartbeatInFlight) return;
          heartbeatInFlight = true;
          context
            .fetch(`${WMA_URL}/session/heartbeat`, {
              method: "POST",
              signal: context.signal,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ session_id: answer.session_id }),
            })
            .catch(() => {
              // Gaps are tolerated by the bridge; a genuinely dead session surfaces
              // through connectionState, so failing loudly here would be noise.
            })
            .finally(() => {
              heartbeatInFlight = false;
            });
        }, HEARTBEAT_INTERVAL_MS);

        return {
          sessionId: answer.session_id,
          send(message: WmaControlMessage) {
            const payload = JSON.stringify(message);
            if (channel.readyState === "open") {
              channel.send(payload);
            } else if (channel.readyState === "connecting") {
              if (pending.length >= MAX_QUEUED_MESSAGES) pending.shift();
              pending.push(payload);
            }
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
 *   const stream = await fal.realtime.open(wma("fal-ai/wma-outstream"), {
 *     onMedia: (s) => { videoEl.srcObject = s },
 *     onState: (s) => { if (s === "failed") console.warn("died") },
 *   });
 *
 * No `send`, no message schema, no key handling. An interactive world model is the same
 * call plus `onData` and `send({ type: "keys", pressed, activated })`.
 */
