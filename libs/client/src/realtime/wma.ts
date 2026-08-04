/**
 * WMA raw-path extension for `fal.realtime.open()`.
 *
 * The third protocol, beside `lucy` (fal WebSocket signalling) and `happyOyster` (a vendor RTC SDK).
 * "Raw" names the path: the browser POSTs a complete SDP offer straight to the WMA signalling bridge
 * and media flows peer-to-peer from the fal runner. That is what every app which GENERATES its own
 * video uses, including a pure output stream, so it is the case the other two do not cover.
 *
 * Ported from an application that ran against a vendored build of this package, which is why it moved
 * here: an extension in one repository and the kernel in another can drift, and they did — the
 * extension began calling `context.diagnostic` before the vendored kernel provided it, producing
 * `e.diagnostic is not a function` at runtime. Living in the same package makes that a compile error.
 *
 * FOUR TRAPS worth knowing about, all of them scar tissue rather than invention:
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

const WMA_URL = "https://wma.fal.run";
const HEARTBEAT_INTERVAL_MS = 5_000;
export const ICE_GATHERING_TIMEOUT_MS = 12_000;
export const ICE_CANDIDATE_QUIET_PERIOD_MS = 1_250;
const MAX_QUEUED_MESSAGES = 64;
const DEFAULT_STUN_URL = "stun:stun.l.google.com:19302";

function countTurnServers(iceServers: RTCIceServer[]): number {
  return iceServers.filter((server) => {
    const urls = Array.isArray(server.urls) ? server.urls : [server.urls];
    return urls.some((url) => /^turns?:/i.test(url));
  }).length;
}

export type WmaControlMessage = object;

export interface WmaOptions {
  /**
   * Endpoint to open. Read by the client as `optionEndpointId ?? extension.defaultEndpoint`,
   * so it belongs in the options type even though `open()`'s signature does not mention it —
   * `lucy` and `happyOyster` both declare it the same way.
   */
  endpointId?: string;
  /**
   * Media direction. `"recvonly"` is the default because it covers every raw-path app
   * built so far — the runner generates, the browser receives. An app that also sends a
   * camera up would pass `"sendrecv"`; that is the only difference between a pure output
   * stream and an interactive one at this layer, which is worth knowing.
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
   * ICE servers. OPTIONAL — when omitted the extension asks the app's own `/ice` endpoint for
   * short-lived TURN credentials, so a restrictive network works with no caller setup.
   *
   * That self-provisioning is the answer to "who fetches ICE servers?", and it is possible
   * because `/ice` IS a fal endpoint, so `context.run` can reach it with the parent client's
   * credentials — unlike the WMA bridge. The browser therefore never sees the Metered secret,
   * only a credential minted for it.
   *
   * Pass this to override (your own TURN provider, or to force STUN for testing).
   */
  iceServers?: RTCIceServer[];
  onTrack?: (stream: MediaStream) => void;
  onMessage?: (raw: string) => void;
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
 * Ask the app for ephemeral TURN credentials.
 *
 * Degrades to STUN rather than failing the connect: an app without Metered configured, or a
 * provider outage, should still work for everyone on a permissive network. The failure is
 * logged rather than swallowed silently, because "no relay" is the difference between working
 * and not for anyone behind blocked UDP.
 */
/*
 * No client-side propagation wait any more. It used to read the credential's age from /ice and sleep
 * the remainder, which worked and put the policy in the wrong place — and could not be right, because
 * the runner's credential cache is per-instance: a browser could wait out the age one runner reported
 * and then negotiate against servers minted by another. The runner holds /ice instead, so by the time
 * these servers arrive they are usable. See the endpoint for the full reasoning.
 */
async function fetchIceServers(
  context: RealtimeExtensionContext,
): Promise<RTCIceServer[]> {
  try {
    const result = await context.run(`${context.endpointId}/ice`, {
      input: {},
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
          source: payload.status ?? "unknown",
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
 * A factory, matching how `lucy` and `happyOyster` are built: it closes over the endpoints it
 * claims so `supports()` can answer honestly.
 *
 * Passing no endpoints accepts any, which is right for this protocol and wrong for the others:
 * `fal-ai/wma-outstream` is indistinguishable by NAME from a non-realtime endpoint, so whether
 * an app speaks the raw path cannot be inferred — only declared by whoever passes the
 * extension explicitly. My first draft returned `false` here on that reasoning, which was a
 * bug: the client validates `supports(endpointId)` even in the explicit form and would have
 * rejected every open.
 */
export function wmaRaw(endpoints: string[] = []) {
  return defineRealtimeExtension<WmaOptions, WmaRealtimeSession>({
    id: "fal/wma-raw",
    defaultEndpoint: endpoints[0],
    supports: (endpointId) =>
      endpoints.length === 0 || endpoints.includes(endpointId),
    async open(context, options) {
      const iceServers = options.iceServers ?? (await fetchIceServers(context));
      const pc = new RTCPeerConnection({ iceServers });

      // The default that matters: recvonly. A generated stream never needs an inbound track,
      // and asking for one would make the runner negotiate media it will not send.
      // addTrack OR addTransceiver, never both. addTrack creates its own transceiver, so doing both
      // negotiates two video m-lines and the runner answers a stream nobody reads.
      const localTracks = options.localStream?.getTracks() ?? [];
      if (localTracks.length > 0) {
        for (const track of localTracks)
          pc.addTrack(track, options.localStream!);
      } else {
        pc.addTransceiver("video", {
          direction: options.direction ?? "recvonly",
        });
      }

      /**
       * What ICE actually did, for the failure message.
       *
       * The old message GUESSED: it said "if relay is 0 and either peer is behind symmetric NAT or
       * blocked UDP…", which sent us chasing a NAT problem for three rounds while the real situation
       * was narrower and visible the whole time — UDP refused on one port, flaky DNS on another, and
       * two transports allocating fine. A diagnostic that speculates is worse than one that says
       * nothing, because it is believed.
       *
       * `icecandidateerror` is where the truth lives: it carries the server URL, an error code and a
       * text, per failing server. Deduplicated, because a retrying server repeats the same line.
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
      channel.onmessage = (event) => options.onMessage?.(String(event.data));
      pc.ontrack = (event) =>
        options.onTrack?.(event.streams[0] ?? new MediaStream([event.track]));
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
          context.diagnostic({
            kind: "failure",
            message: parts.join(" "),
            observed: {
              ...observed,
              turnOffered,
              errors: [...observed.errors].join("; "),
            },
          });
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
      // every control message is silently dropped. Report it AND end the session through
      // `context.close()` — leaving it "open but deaf" is the failure mode worth killing.
      const channelDied = () => {
        if (closed) return;
        context.diagnostic({
          kind: "failure",
          message:
            "control data channel closed or errored — SCTP died while ICE may still say connected",
        });
        void context.close();
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
        // The kernel's implementation. This file carried its own ~60 lines of sufficient-set /
        // quiet-period / hard-bound strategy, which was never WMA-specific — it is what any extension
        // facing a non-trickle signalling channel needs, so it now lives in the client and the counts
        // arrive as diagnostics.
        const gathering = context.gatherIce(pc, { iceServers });
        await pc.setLocalDescription(offer);
        const gathered_ice = await gathering;
        observed.host = gathered_ice.host;
        observed.srflx = gathered_ice.srflx;
        observed.relay = gathered_ice.relay;

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
 *   const stream = await fal.realtime.open(wmaRaw(), {
 *     endpointId: "fal-ai/wma-outstream",
 *     onTrack: (s) => { videoEl.srcObject = s },
 *     onState: (s) => { if (s === "failed") console.warn("died") },
 *   });
 *
 * No `send`, no message schema, no key handling. An interactive world model is the same
 * call plus `onMessage` and `send({ type: "keys", pressed, activated })`.
 */
