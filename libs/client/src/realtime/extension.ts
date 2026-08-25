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
 *
 * @experimental The `fal.realtime.open()` extension API is experimental and may change in a minor release.
 */
export interface RealtimeSession {
  close(): void | Promise<void>;
  /**
   * Coarse lifecycle, uniform across every extension.
   *
   * An extension's own OPERATIONS stay its own: they carry meaning only inside their protocol, and
   * nothing is gained by forcing them into a shared shape. "Is this opening, live, or dead" is the
   * opposite — every protocol has it, each names it in its own vocabulary, and leaving it to the
   * extensions makes an application that renders a single status indicator branch per protocol.
   *
   * Deliberately four values. Anything finer is protocol detail: a state that is meaningful while one
   * protocol negotiates may not exist in another that spends thirty seconds building before it can
   * stream at all. Detail belongs in {@link RealtimeDiagnostic}.
   *
   * OPTIONAL here because no extension has to implement it — the kernel supplies it on the session
   * it hands back, so what `open()` returns always has one. See {@link ManagedRealtimeSession}.
   */
  readonly state?: RealtimeState;
}

/**
 * `opening` → `live` → (`failed` | `closed`).
 *
 * Both endings are TERMINAL and neither is reachable from the other: a session that failed reports
 * `"failed"` forever, and does not decay into `"closed"` as its resources are released. Teardown
 * happens either way, so reporting it would overwrite the only thing that separates "the transport
 * died" from "the user pressed disconnect".
 *
 * @experimental The `fal.realtime.open()` extension API is experimental and may change in a minor release.
 */
export type RealtimeState = "opening" | "live" | "failed" | "closed";

/**
 * What `fal.realtime.open()` returns: the extension's own session, wrapped by the kernel.
 *
 * Returned SYNCHRONOUSLY, in state `"opening"`, while negotiation runs eagerly behind it. The
 * caller can hold the handle, render from `state`, and call `send()` immediately — queued sends
 * are flushed in order the moment the session is live. Extension-specific members materialize
 * when the session does; before that they read as `undefined`. `ready` is for the caller that
 * wants the awaited style anyway.
 *
 * The wrapper is why `state` is required here and optional on {@link RealtimeSession} — an
 * extension returns whatever it likes and the kernel adds the members it alone can guarantee: a
 * `close()` that is idempotent and runs the registered cleanups, and a `state` readable at any time.
 *
 * @experimental The `fal.realtime.open()` extension API is experimental and may change in a minor release.
 */
export type ManagedRealtimeSession<Session extends RealtimeSession> = Omit<
  Session,
  // `then` is omitted because the handle is deliberately never thenable — the kernel serves
  // undefined for it at runtime so `await handle`, Promise.all(), and `ready`'s resolution treat
  // the handle as a value; the type must not offer what the runtime hides.
  "state" | "close" | "send" | "then"
> &
  (Session extends { send: (...args: infer Args) => unknown }
    ? {
        /**
         * Fire-and-forget, whatever the extension's own `send` returns. A send issued while the
         * session is still opening is queued and delivered later, so there is no extension return
         * value to hand back at the call site — the type says so rather than pretending. Delivery
         * failures surface as diagnostics.
         */
        send: (...args: Args) => void;
      }
    : Record<never, never>) & {
    readonly state: RealtimeState;
    /**
     * Always a promise, whatever the extension declared. The kernel substitutes its own idempotent
     * teardown for the extension's `close`, and that teardown awaits every registered cleanup — so a
     * caller that awaits this knows the resources are actually released, which is not something an
     * extension returning `void` could promise. Calling it while the session is still opening
     * cancels the negotiation.
     */
    close(): Promise<void>;
    /**
     * Resolves with this same handle once the session is live; rejects with the failure when
     * opening fails or is aborted. Optional — every failure it can carry also reaches `onError`
     * and `onState("failed")`, so a caller living entirely on callbacks never needs to touch it,
     * and an ignored `ready` never becomes an unhandled rejection.
     */
    readonly ready: Promise<ManagedRealtimeSession<Session>>;
  };

/**
 * Options the KERNEL reads, accepted alongside whatever an extension declares.
 *
 * Separate from an extension's own `Options` because they belong to different owners: the extension
 * defines its product inputs, the kernel defines cancellation and reporting. Declaring them here is
 * what makes them reachable through the typed `open(extension, options)` overload, which otherwise
 * types the options bag as the extension's alone and rejects every kernel option at the call site.
 *
 * An extension with NO options of its own must declare `Record<never, never>`, not
 * `Record<string, never>`. The latter asserts that every string key maps to `never`, which makes
 * `Options & RealtimeOpenOptions` contradictory and rejects `onMedia`, `onState` and `onDiagnostic`
 * at the call site — leaving an extension that takes no product inputs unable to receive any kernel
 * option at all.
 *
 * @experimental The `fal.realtime.open()` extension API is experimental and may change in a minor release.
 */
export interface RealtimeOpenOptions {
  /** Cancels opening, and closes the session if it is already open. */
  abortSignal?: AbortSignal;
  /** Coarse lifecycle transitions, uniform across every extension. */
  onState?: (state: RealtimeState) => void;
  /**
   * The terminal failure, delivered once: the error that failed opening, the abort reason, or the
   * transport failure an extension reported through `context.fail()`.
   *
   * This is the failure channel for the synchronous `open()` shape — there is no returned promise
   * whose rejection could carry it, and requiring every caller to attach to `ready` would turn an
   * optional convenience into an obligation.
   */
  onError?: (error: unknown) => void;
  /** Progress and failure reports. See {@link RealtimeDiagnostic}. */
  onDiagnostic?: (event: RealtimeDiagnostic) => void;
  /**
   * Inbound media, once per stream, for any extension that returns some.
   *
   * Named HERE rather than per extension because "a remote stream arrived" is one concept, and left
   * to the extensions it acquires one name per protocol — every one of them defensible, none of them
   * shared. An application offering two extensions then needs a branch to do the single thing it
   * actually wants, which is attach a video element. Same tax `onState` removes for lifecycle.
   *
   * Not every extension calls it. An app can send a camera up and get its answer back as data with no
   * inbound media at all, which is why this is optional on both sides rather than part of opening.
   */
  onMedia?: (stream: MediaStream) => void;
  /**
   * Inbound application data, once per message.
   *
   * Deliberately a string rather than a parsed object: the kernel cannot know a model's schema, and
   * pretending otherwise would put one protocol's vocabulary in the transport. The extension delivers;
   * the application parses and validates.
   *
   * Declared for every extension rather than only the ones that obviously need it, because "media up,
   * data down" is a shape any of them can take, and an extension whose surface omits this cannot
   * express it even when its protocol allows it.
   */
  onData?: (raw: string) => void;
}

/**
 * A structured progress or failure report from an extension.
 *
 * NOT protocol-shaped, on purpose. Useful progress for one model is "world building, 40%" and for
 * another "3 of 4 TURN servers answered"; a `phase` plus a free-form `detail` bag carries both,
 * where an ICE-shaped schema would carry only one.
 *
 * The rule that matters here is cultural rather than typed: **a `failure` reports what was OBSERVED,
 * never what was inferred.** A speculative diagnostic is worse than none, because it gets believed: a
 * message naming symmetric NAT or blocked UDP sends whoever reads it into the network, and the cause
 * of a connection that gathered no relay candidate is at least as often a credential or a
 * misconfigured server. Report the counts and the errors; let the reader conclude.
 *
 * @experimental The `fal.realtime.open()` extension API is experimental and may change in a minor release.
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

/**
 * Counts of gathered ICE candidates by type, and why gathering stopped.
 *
 * @experimental The `fal.realtime.open()` extension API is experimental and may change in a minor release.
 */
export interface IceGatheringResult {
  host: number;
  srflx: number;
  relay: number;
  state: "complete" | "sufficient" | "timeout";
}

/** @experimental The `fal.realtime.open()` extension API is experimental and may change in a minor release. */
export interface IceGatheringOptions {
  /**
   * The servers handed to the peer connection. Used to decide what "sufficient" means: when TURN is
   * configured, a relay candidate is required before the set counts as usable, because that is the
   * entire reason TURN was configured.
   */
  iceServers?: RTCIceServer[];
  /**
   * The candidate policy used by the peer connection. Relay-only gathering is sufficient as soon
   * as a relay candidate settles; it intentionally cannot produce a server-reflexive candidate.
   */
  iceTransportPolicy?: RTCIceTransportPolicy;
  /** Hard bound. Reached only when gathering neither completes nor becomes sufficient. */
  timeoutMs?: number;
  /** How long the candidate set must stop changing before it is considered settled. */
  quietPeriodMs?: number;
  /** Cancel gathering immediately and remove its listeners and timers. */
  signal?: AbortSignal;
}

/** @experimental The `fal.realtime.open()` extension API is experimental and may change in a minor release. */
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
   * handling, and retry policy as the parent client. This is just for getting ICE servers
   * from the app's own /ice endpoint in case the bridge is not available.
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
   * provider reports that the remote session finished on its own.
   */
  close(): Promise<void>;

  /**
   * A credentialed request to fal infrastructure that is NOT an endpoint.
   *
   * `run()` covers fal endpoints and `connect()` covers the fal WebSocket, which leaves a real gap:
   * a shared signalling bridge, a regional relay or a control plane addressed by body rather than
   * path — say `POST https://<service>.fal.run/session` carrying the app id as a body parameter — is
   * reachable through neither. Without this, the only way to reach one is for the APPLICATION to
   * inject a credentialed fetch, which hands auth for one leg of the connection back to the caller
   * and is exactly what this API exists to prevent.
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
   * What works is sufficient-set, then a quiet period, under a hard bound. An extension that trickles
   * its candidates has no use for it, which is precisely why it belongs here rather than inside
   * whichever extension meets the problem first — otherwise the next one writes it again, slightly
   * differently.
   */
  gatherIce(
    pc: RTCPeerConnection,
    options?: IceGatheringOptions,
  ): Promise<IceGatheringResult>;

  /**
   * End the session because it FAILED, as opposed to being closed.
   *
   * `close()` alone cannot express this. A dead peer connection or an expired lease is not a clean
   * teardown, but the kernel only sees a close request and reports "closed" — so a caller cannot
   * distinguish "the user pressed disconnect" from "the transport died", which are the two cases a
   * status UI most needs to tell apart.
   *
   * Emits a failure diagnostic, moves the state to "failed", then tears down.
   */
  fail(
    message: string,
    observed?: Record<string, number | string>,
  ): Promise<void>;

  /**
   * Report progress or failure to the caller, if it asked to hear about it.
   *
   * Safe to call unconditionally — the kernel drops the event when no `onDiagnostic` was supplied, so
   * an extension never needs to check.
   */
  diagnostic(event: RealtimeDiagnostic): void;
  /**
   * Publish an inbound stream to `onMedia`.
   *
   * A kernel channel like {@link RealtimeExtensionContext.diagnostic}, not an option the extension
   * reads, so the name is fixed in one place and a fourth extension cannot invent a fifth spelling.
   */
  media(stream: MediaStream): void;
  /** Publish one inbound message to `onData`. Raw; parsing belongs to the application. */
  data(raw: string): void;
}

/**
 * A customer-installable realtime protocol implementation.
 *
 * Which extension opens a session is the caller's decision, made at the call site by naming one. The
 * kernel owns lifecycle; the extension owns negotiation and the model-specific session API.
 *
 * @experimental The `fal.realtime.open()` extension API is experimental and may change in a minor release.
 */
export interface RealtimeExtension<
  Options = unknown,
  Session extends RealtimeSession = RealtimeSession,
> {
  /** Stable diagnostic name, for example `fal/webrtc` or `acme/dragon-world`. */
  readonly id: string;

  /**
   * Endpoint opened when the options do not name one.
   */
  readonly defaultEndpoint?: string;

  /**
   * Reject an endpoint this extension knows it cannot open.
   *
   * A guard, not a router. It exists for the extension that owns a closed set of endpoints — Lucy
   * ships two — so a mistyped or stale id fails at the call site instead of partway through a
   * negotiation that was never going to succeed.
   *
   * Optional because most protocols have no such set. Any customer can build an app on the WMA
   * transport, so no list of ids describes it, and an extension in that position should say nothing
   * rather than assert something it cannot know.
   */
  supports?(endpointId: string): boolean;

  /** Negotiate the model session and return its model-specific facade. */
  open(context: RealtimeExtensionContext, options: Options): Promise<Session>;
}

/** @experimental The `fal.realtime.open()` extension API is experimental and may change in a minor release. */
export type AnyRealtimeExtension = RealtimeExtension<unknown, RealtimeSession>;

/** @experimental The `fal.realtime.open()` extension API is experimental and may change in a minor release. */
export type RealtimeExtensionOptions<Extension> =
  Extension extends RealtimeExtension<infer Options, RealtimeSession>
    ? Options
    : never;

/** @experimental The `fal.realtime.open()` extension API is experimental and may change in a minor release. */
export type RealtimeExtensionSession<Extension> =
  Extension extends RealtimeExtension<unknown, infer Session> ? Session : never;

/**
 * Identity helper that preserves an extension's options and session types.
 *
 * @experimental The `fal.realtime.open()` extension API is experimental and may change in a minor release.
 */
export function defineRealtimeExtension<
  Options,
  Session extends RealtimeSession,
>(
  extension: RealtimeExtension<Options, Session>,
): RealtimeExtension<Options, Session> {
  return extension;
}
