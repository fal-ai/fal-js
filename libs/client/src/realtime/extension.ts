import type {
  RealtimeConnection,
  RealtimeConnectionHandler,
} from "../realtime";
import type { Result, RunOptions } from "../types/common";

/**
 * The minimum contract for a long-lived realtime session.
 *
 * Extensions may add any model-specific fields and methods they need. The
 * client only standardizes teardown so callers always have one reliable way
 * to release the resources owned by a session.
 */
export interface RealtimeSession {
  close(): void | Promise<void>;
  /**
   * Coarse lifecycle, uniform across every extension.
   *
   * Model-specific OPERATIONS should stay model-specific — `steer()`, `roar()` and `setCommand()` are
   * correctly not universal. "Is this opening, live, or dead" is not model-specific, and leaving it
   * to each adapter means every multi-model application writes an adapter over the adapters: Lucy
   * reports `onConnectionStateChange`, another extension `onConnectionState`, a third a "world
   * status", so rendering one status indicator needs a branch per protocol.
   *
   * Deliberately four values. Anything finer is protocol detail — `negotiating` means something in
   * Lucy and nothing in a world that spends thirty seconds building — and detail belongs in
   * {@link RealtimeDiagnostic}.
   */
  readonly state?: RealtimeState;
}

export type RealtimeState = "opening" | "live" | "failed" | "closed";

/**
 * A structured progress or failure report from an extension.
 *
 * NOT protocol-shaped, on purpose. Useful progress for one model is "world building, 40%" and for
 * another "3 of 4 TURN servers answered"; a `phase` plus a free-form `detail` bag carries both,
 * where an ICE-shaped schema would carry only one.
 *
 * The rule that matters here is cultural rather than typed: **a `failure` reports what was OBSERVED,
 * never what was inferred.** A speculative diagnostic is worse than none, because it gets believed —
 * a message reading "either peer is behind symmetric NAT or blocked UDP" once cost three rounds of
 * debugging on a problem that was a credential thirty seconds too young.
 */
export type RealtimeDiagnostic =
  | {
      kind: "progress";
      phase: string;
      detail?: Record<string, number | string>;
    }
  | {
      kind: "warning";
      message: string;
      detail?: Record<string, number | string>;
    }
  | {
      kind: "failure";
      message: string;
      /** What was measured. Counts, codes, per-server errors — not conclusions. */
      observed?: Record<string, number | string>;
    };

/** Counts of gathered ICE candidates by type, and why gathering stopped. */
export interface IceGatheringResult {
  host: number;
  srflx: number;
  relay: number;
  state: "complete" | "sufficient" | "timeout";
}

export interface IceGatheringOptions {
  /**
   * The servers handed to the peer connection. Used to decide what "sufficient" means: when TURN is
   * configured, a relay candidate is required before the set counts as usable, because that is the
   * entire reason TURN was configured.
   */
  iceServers?: RTCIceServer[];
  /** Hard bound. Reached only when gathering neither completes nor becomes sufficient. */
  timeoutMs?: number;
  /** How long the candidate set must stop changing before it is considered settled. */
  quietPeriodMs?: number;
}

export interface RealtimeExtensionContext {
  /** The endpoint selected by `fal.realtime.open()`. */
  readonly endpointId: string;

  /**
   * Aborted when the caller cancels opening or closes the resulting session.
   * Extensions should pass it to fetch-like work and check it between
   * negotiation steps.
   */
  readonly signal: AbortSignal;

  /**
   * Call any fal endpoint with the same credentials, middleware, storage
   * handling, and retry policy as the parent client.
   */
  run<Input = unknown, Output = unknown>(
    endpointId: string,
    options: RunOptions<Input>,
  ): Promise<Result<Output>>;

  /**
   * Open the existing low-level fal WebSocket connection. This is useful for
   * extensions whose negotiation protocol rides over fal realtime.
   */
  connect<Input = unknown, Output = unknown>(
    endpointId: string,
    handler: RealtimeConnectionHandler<Output>,
  ): RealtimeConnection<Input>;

  /**
   * Register a resource release callback. Callbacks run once, in reverse
   * order, when opening fails, the signal aborts, or the session closes.
   */
  addCleanup(cleanup: () => void | Promise<void>): void;

  /**
   * End the managed session from inside the extension, for example when a
   * provider reports that a remote travel completed.
   */
  close(): Promise<void>;

  /**
   * A credentialed request to fal infrastructure that is NOT an endpoint.
   *
   * `run()` covers fal endpoints and `connect()` covers the fal WebSocket, which leaves a real gap:
   * a shared bridge, a regional relay or a control plane addressed by body rather than path can be
   * reached by neither. The WMA raw path is the first protocol to need it —
   *
   *     POST https://wma.fal.run/session   { app_id, sdp, type }
   *
   * — a different host with the app id as a body parameter. Without this, the only way to ship is for
   * the APPLICATION to inject a credentialed fetch, which hands auth for one leg of the connection
   * back to the caller and is exactly what this API exists to prevent.
   *
   * Applies the parent client's credentials, request middleware and proxy, so a proxied application
   * stays proxied. Returns the raw `Response`: unlike `run()`, this makes no assumption that the
   * other end speaks fal's result envelope.
   */
  fetch(url: string, init?: RequestInit): Promise<Response>;

  /**
   * Wait for ICE gathering to produce a usable candidate set.
   *
   * In the kernel because every extension doing browser WebRTC against a non-trickle signalling
   * channel needs it, and both obvious strategies are wrong: waiting for `complete` pays a dead STUN
   * server's full timeout, while a fixed short cap silently ships a host+srflx-only offer that can
   * never form a relayed path and fails with no error at all.
   *
   * What works is sufficient-set, then a quiet period, under a hard bound. Lucy trickles and does not
   * need this, which is precisely why it belongs here rather than in whichever adapter met the
   * problem first — otherwise the next one writes it again, slightly differently.
   */
  gatherIce(
    pc: RTCPeerConnection,
    options?: IceGatheringOptions,
  ): Promise<IceGatheringResult>;

  /**
   * Report progress or failure to the caller, if it asked to hear about it.
   *
   * Safe to call unconditionally — the kernel drops the event when no `onDiagnostic` was supplied, so
   * an extension never needs to check.
   */
  diagnostic(event: RealtimeDiagnostic): void;
}

/**
 * A customer-installable realtime protocol implementation.
 *
 * The endpoint match is deliberately separate from `open`: fal owns endpoint
 * selection and lifecycle, while the extension owns negotiation and the
 * model-specific session API.
 */
export interface RealtimeExtension<
  Options = unknown,
  Session extends RealtimeSession = RealtimeSession,
> {
  /** Stable diagnostic name, for example `fal/webrtc` or `acme/dragon-world`. */
  readonly id: string;

  /**
   * Endpoint used when the extension is passed directly to `open()` and the
   * options do not override it.
   */
  readonly defaultEndpoint?: string;

  /** Return true when this extension knows how to open the endpoint. */
  supports(endpointId: string): boolean;

  /** Negotiate the model session and return its model-specific facade. */
  open(context: RealtimeExtensionContext, options: Options): Promise<Session>;
}

export type AnyRealtimeExtension = RealtimeExtension<unknown, RealtimeSession>;

export type RealtimeExtensionOptions<Extension> =
  Extension extends RealtimeExtension<infer Options, RealtimeSession>
    ? Options
    : never;

export type RealtimeExtensionSession<Extension> =
  Extension extends RealtimeExtension<unknown, infer Session> ? Session : never;

/**
 * Identity helper that preserves an extension's options and session types.
 */
export function defineRealtimeExtension<
  Options,
  Session extends RealtimeSession,
>(
  extension: RealtimeExtension<Options, Session>,
): RealtimeExtension<Options, Session> {
  return extension;
}
