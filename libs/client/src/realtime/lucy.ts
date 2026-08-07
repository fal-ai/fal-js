import type { TokenProvider } from "../auth";
import { defineRealtimeExtension, type RealtimeSession } from "./extension";

const DEFAULT_ENDPOINTS = [
  "decart/lucy-2-5/realtime",
  "decart/lucy-2/realtime",
] as const;

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
];

export type LucyConnectionState = "negotiating" | RTCPeerConnectionState;

export interface LucyRealtimeOptions<Input = Record<string, unknown>> {
  /** Overrides the extension's default endpoint. */
  endpointId?: string;
  /** First model input. Sending it starts the fal WebSocket session. */
  input: Input;
  /** Camera, canvas, or video stream sent to Lucy. */
  localStream?: MediaStream | null;
  /** Used only when the endpoint does not supply STUN/TURN configuration. */
  fallbackIceServers?: RTCIceServer[];
  /** How long to wait for the endpoint's first signaling message. */
  negotiationTimeoutMs?: number;
  /** How long to wait after `ready` for a separate ICE-server message. */
  iceServerGraceMs?: number;
  tokenProvider?: TokenProvider;
  tokenExpirationSeconds?: number;
  abortSignal?: AbortSignal;
  /** Injectable for tests and non-window browser runtimes. */
  peerConnectionFactory?: (
    configuration: RTCConfiguration,
  ) => RTCPeerConnection;
}

export interface LucyRealtimeSession<Input = Record<string, unknown>>
  extends RealtimeSession {
  readonly remoteStream: MediaStream | null;
  send(input: Partial<Input> & Record<string, unknown>): void;
}

type SignalingMessage = {
  type?: string;
  sdp?: string;
  candidate?: RTCIceCandidateInit | null;
  iceServers?: RTCIceServer[];
  ice_servers?: RTCIceServer[];
  iceservers?: RTCIceServer[];
};

export interface LucyRealtimeExtensionConfig {
  endpoints?: readonly string[];
}

/**
 * Lucy's fal-WebSocket + WebRTC signaling protocol.
 *
 * The extension owns SDP/ICE ordering, remote-candidate buffering, and
 * teardown. The application only provides media, observes the remote stream,
 * and sends model controls.
 */
export function lucyRealtime(config: LucyRealtimeExtensionConfig = {}) {
  const endpoints = config.endpoints ?? DEFAULT_ENDPOINTS;

  return defineRealtimeExtension<LucyRealtimeOptions, LucyRealtimeSession>({
    id: "fal/lucy-webrtc",
    defaultEndpoint: endpoints[0],
    supports: (endpointId) => endpoints.includes(endpointId),
    async open(context, options) {
      context.signal.throwIfAborted();
      const createPeerConnection =
        options.peerConnectionFactory ??
        ((configuration: RTCConfiguration) =>
          new RTCPeerConnection(configuration));
      let peer: RTCPeerConnection | null = null;
      const transport: {
        connection?: {
          send(input: Record<string, unknown>): void;
          close(): void;
        };
      } = {};
      let remoteStream: MediaStream | null = null;
      let state: LucyConnectionState = "negotiating";
      let hasRemoteDescription = false;
      let initialized = false;
      let settled = false;
      let iceGraceTimer: ReturnType<typeof setTimeout> | undefined;
      const pendingCandidates: RTCIceCandidateInit[] = [];

      // Reported as PROGRESS DETAIL, not as lifecycle. Lucy's own vocabulary — "negotiating", then
      // the peer connection's states — is meaningful to someone debugging Lucy and meaningless as a
      // cross-protocol signal, so the kernel owns "opening/live/failed/closed" and this carries the
      // specifics underneath it.
      const reportState = (next: LucyConnectionState) => {
        state = next;
        context.diagnostic({
          kind: "progress",
          phase: "connection-state",
          detail: { state: next },
        });
      };
      reportState("negotiating");

      let resolveNegotiation!: () => void;
      let rejectNegotiation!: (error: Error) => void;
      const negotiation = new Promise<void>((resolve, reject) => {
        resolveNegotiation = resolve;
        rejectNegotiation = reject;
      });
      const negotiationTimer = setTimeout(() => {
        rejectNegotiation(
          new Error(
            `Lucy signaling did not become ready within ${
              options.negotiationTimeoutMs ?? 15_000
            }ms`,
          ),
        );
      }, options.negotiationTimeoutMs ?? 15_000);

      const fail = (error: unknown) => {
        const resolved =
          error instanceof Error ? error : new Error(String(error));
        if (!settled) {
          // Before the session exists, the failure travels by rejecting open() — the caller is still
          // awaiting it, so a diagnostic would be a second copy of something they already get.
          rejectNegotiation(resolved);
        } else {
          // After it exists, open() has already resolved and nothing is listening for a throw. This
          // is the case a bespoke onError used to cover, and context.fail covers it uniformly: a
          // failure diagnostic, state "failed", then teardown.
          void context.fail(resolved.message);
        }
      };
      const abortNegotiation = () => {
        fail(
          context.signal.reason ??
            new DOMException("Lucy signaling aborted", "AbortError"),
        );
      };
      context.signal.addEventListener("abort", abortNegotiation, {
        once: true,
      });

      const flushCandidates = async () => {
        if (!peer || !hasRemoteDescription) return;
        for (const candidate of pendingCandidates.splice(0)) {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        }
      };

      const initializePeer = async (iceServers?: RTCIceServer[]) => {
        if (initialized || context.signal.aborted) return;
        initialized = true;
        clearTimeout(iceGraceTimer);
        peer = createPeerConnection({
          iceServers:
            iceServers ?? options.fallbackIceServers ?? DEFAULT_ICE_SERVERS,
        });
        const localStream = options.localStream;
        if (localStream) {
          for (const track of localStream.getTracks()) {
            peer.addTrack(track, localStream);
          }
        } else {
          peer.addTransceiver("video", { direction: "recvonly" });
        }
        peer.ontrack = (event) => {
          if (event.streams[0]) {
            remoteStream = event.streams[0];
            context.media(remoteStream);
          }
        };
        peer.onicecandidate = (event) => {
          if (!event.candidate) return;
          transport.connection?.send({
            type: "icecandidate",
            candidate: {
              candidate: event.candidate.candidate,
              sdpMid: event.candidate.sdpMid,
              sdpMLineIndex: event.candidate.sdpMLineIndex,
            },
          });
        };
        peer.onconnectionstatechange = () => {
          if (!peer) return;
          reportState(peer.connectionState);
          // A dead peer is a FAILURE, a closed one is a teardown. Both used to end up as
          // context.close(), so a caller could not tell a transport that died from a user who
          // disconnected — the distinction a status UI most needs.
          if (peer.connectionState === "failed") {
            void context.fail(
              "Lucy peer connection failed — no candidate pair survived",
              { iceConnectionState: peer.iceConnectionState },
            );
          } else if (peer.connectionState === "closed") {
            void context.close();
          }
        };

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        if (!offer.sdp) throw new Error("Lucy WebRTC offer has no SDP");
        transport.connection?.send({ type: "offer", sdp: offer.sdp });
        resolveNegotiation();
      };

      const handleMessage = async (message: SignalingMessage) => {
        switch (message.type?.toLowerCase()) {
          case "ready": {
            const supplied = message.iceServers ?? message.ice_servers;
            if (supplied) {
              await initializePeer(supplied);
            } else {
              iceGraceTimer = setTimeout(
                () => void initializePeer(),
                options.iceServerGraceMs ?? 1_000,
              );
            }
            break;
          }
          case "iceservers": {
            await initializePeer(
              message.iceServers ?? message.ice_servers ?? message.iceservers,
            );
            break;
          }
          case "answer": {
            if (!peer || !message.sdp) return;
            await peer.setRemoteDescription({
              type: "answer",
              sdp: message.sdp,
            });
            hasRemoteDescription = true;
            await flushCandidates();
            break;
          }
          case "icecandidate": {
            if (!message.candidate) return;
            if (!peer || !hasRemoteDescription) {
              pendingCandidates.push(message.candidate);
            } else {
              await peer.addIceCandidate(
                new RTCIceCandidate(message.candidate),
              );
            }
            break;
          }
          case "error":
            fail(new Error("Lucy signaling endpoint reported an error"));
            break;
        }
      };

      transport.connection = context.connect(context.endpointId, {
        connectionKey: `lucy-${crypto.randomUUID()}`,
        throttleInterval: 0,
        tokenProvider: options.tokenProvider,
        tokenExpirationSeconds: options.tokenExpirationSeconds,
        onResult: (message) => {
          void handleMessage(message as SignalingMessage).catch(fail);
        },
        onError: fail,
      });
      context.addCleanup(() => {
        context.signal.removeEventListener("abort", abortNegotiation);
        clearTimeout(negotiationTimer);
        clearTimeout(iceGraceTimer);
        transport.connection?.close();
        peer?.close();
        peer = null;
        reportState("closed");
      });

      transport.connection.send(options.input as Record<string, unknown>);
      try {
        await negotiation;
        settled = true;
      } finally {
        clearTimeout(negotiationTimer);
      }

      return {
        get remoteStream() {
          return remoteStream;
        },
        send(input) {
          transport.connection?.send(input);
        },
        close() {
          // The client wraps this with the managed, idempotent cleanup.
        },
      };
    },
  });
}
