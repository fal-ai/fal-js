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
