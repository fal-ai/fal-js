import type {
  HappyOysterEngine,
  SDKConfig,
  Travel,
  TravelStatus,
} from "@happy-oyster/js-sdk";
import { loadHappyOysterSdk } from "./happy-oyster-sdk.cjs";
import {
  defineRealtimeExtension,
  wma,
  type RealtimeExtensionContext,
  type RealtimeSession,
  type WmaRealtimeSession,
} from "./realtime/index";

export type HappyOysterMode = "adventure" | "directing";
export type HappyOysterAction =
  | "command"
  | "instruct"
  | "pause"
  | "resume"
  | "rewind";
/** The partner travel's playback status. */
export type HappyOysterTravelStatus = Exclude<TravelStatus, "idle">;

/** Adventure command vocabularies accepted by the partner SDK. */
export const ADVENTURE_TRANSLATIONS = [
  "Front",
  "Back",
  "Left",
  "Right",
  "Front_Left",
  "Front_Right",
  "Back_Left",
  "Back_Right",
  "None",
] as const;
export const ADVENTURE_ROTATIONS = [
  "Mouse_Up",
  "Mouse_Down",
  "Mouse_Left",
  "Mouse_Right",
  "Mouse_Up_Left",
  "Mouse_Up_Right",
  "Mouse_Down_Left",
  "Mouse_Down_Right",
  "None",
] as const;
export const ADVENTURE_INTERACTIONS = [
  "Jump",
  "Attack",
  "Crouch",
  "Sprint",
  "None",
] as const;

/**
 * The WMA data-channel messages this adapter exchanges. A client can check
 * that a deployment's AsyncAPI contract publishes them before connecting.
 */
export const HAPPY_OYSTER_MESSAGES = {
  client: ["configure", "travel_request", "bind_travel", "travel_ended"],
  server: [
    "configured",
    "travel_response",
    "travel_bound",
    "travel_released",
    "error",
  ],
} as const;

export type HappyOysterCommand = {
  translation?: (typeof ADVENTURE_TRANSLATIONS)[number];
  rotation?: (typeof ADVENTURE_ROTATIONS)[number];
  interaction?: (typeof ADVENTURE_INTERACTIONS)[number];
};

/** World snapshot returned by the app, in its wire (snake_case) shape. */
export interface HappyOysterWorld {
  encrypted_world_id: string;
  status: string;
  mode: HappyOysterMode | null;
  name?: string | null;
  first_frame?: string | null;
}

export interface HappyOysterOptions {
  /** An existing world or the encrypted_world_id returned by /worlds/create. */
  worldId: string;
  /**
   * The world's mode. Optional for worlds created through fal, whose mode the
   * app has on record; required for worlds created elsewhere.
   */
  mode?: HappyOysterMode;
  /** The vendor player owns this element's playback for the session lifetime. */
  videoElement: HTMLVideoElement;
  /** Adventure only: the partner's experience limit (60, 90, or 120 seconds). */
  maxExperienceTimeSec?: 60 | 90 | 120;
  /** Maximum wait for world generation. Defaults to five minutes. */
  worldReadyTimeoutMs?: number;
  /** Maximum wait for the WMA control connection. Defaults to one minute. */
  connectTimeoutMs?: number;
  /** Maximum wait for each control acknowledgement. Defaults to 30 seconds. */
  controlTimeoutMs?: number;
  /** Maximum wait for partner playback to start. Defaults to two minutes. */
  playbackTimeoutMs?: number;
  onFirstFrame?: (url: string) => void;
  onTravelStatus?: (status: HappyOysterTravelStatus) => void;
}

export interface HappyOysterSession extends RealtimeSession {
  readonly worldId: string;
  readonly travelId: string;
  readonly mode: HappyOysterMode;
  readonly world: HappyOysterWorld;
  readonly travelStatus: HappyOysterTravelStatus;
  can(action: HappyOysterAction): boolean;
  /**
   * Holds these Adventure controls, re-sending them while held, until the next
   * call replaces them. Omitted controls are released; `{}` releases all.
   */
  command(input: HappyOysterCommand): Promise<void>;
  /** Sends a moderated Directing instruction through the fal app. */
  instruct(content: string): Promise<{ accepted: boolean }>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  rewind(seconds: number): Promise<void>;
}

/**
 * A client-safe Happy Oyster failure. `code` is the app's control error code,
 * or `http` with `status` for a fal request. Messages never contain
 * credentials.
 */
export class HappyOysterError extends Error {
  readonly code: string;
  readonly status?: number;
  readonly retryable: boolean;

  constructor(
    message: string,
    options: { code: string; status?: number; retryable?: boolean },
  ) {
    super(message);
    this.name = "HappyOysterError";
    this.code = options.code;
    this.status = options.status;
    this.retryable = options.retryable ?? false;
  }
}

type Message = Record<string, unknown>;
type Configured = {
  api_host: string;
  model: string;
  control_protocol: "fal-session-v1";
  world: HappyOysterWorld;
  travel: {
    encrypted_travel_id: string;
    encrypted_world_id: string;
    mode: 1 | 2;
    creation_model: "simple" | "scriptlist";
    first_frame: string | null;
    bgm_url: string | null;
    version: string;
    no_stream_auto_end_timeout_sec: number;
    max_experience_time_sec: 60 | 90 | 120 | null;
    rtc_config: {
      channel_id: string;
      user_id: string;
      app_id: string;
      token: string;
      nonce?: string | null;
      role?: "pub" | "sub" | "relay" | null;
      username?: string | null;
      timestamp?: number | null;
      expire_at?: string | null;
    };
  };
};

const actions = {
  command: "sendCommand",
  instruct: "sendInstruct",
  pause: "pause",
  resume: "resume",
  rewind: "rewind",
} as const;
const RELEASE = {
  translation: "None",
  rotation: "None",
  interaction: "None",
} as const;
const MODE_CODES = { adventure: 1, directing: 2 } as const;
const CLEANUP_TIMEOUT_MS = 5_000;
const WORLD_POLL_MS = 2_000;
/** Held commands are re-sent at the partner reference client's cadence. */
const COMMAND_REPEAT_MS = 50;
const HOST_PATTERN = /^[a-z0-9.-]+(:\d+)?$/i;
/** The partner SDK shares one RTC engine across players in a browser page. */
let activePlaybackLease: object | undefined;

function positive(value: number, name: string): number {
  if (!Number.isFinite(value) || value <= 0)
    throw new Error(`${name} must be positive.`);
  return value;
}

function closedError(): HappyOysterError {
  return new HappyOysterError("Happy Oyster session closed.", {
    code: "closed",
  });
}

function active(signal: AbortSignal): void {
  if (signal.aborted) throw closedError();
}

function initializePlayer<T>(create: () => T): T {
  try {
    return create();
  } catch {
    // Vendor errors may include session credentials in their message or cause.
    throw new HappyOysterError("Happy Oyster player initialization failed.", {
      code: "playback",
    });
  }
}

/** Resolve or reject within `ms`; failures become `label` errors unless typed. */
function within<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
  signal?: AbortSignal,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const finish = (error?: Error, value?: T) => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      if (error) reject(error);
      else resolve(value as T);
    };
    const abort = () => finish(closedError());
    const timer = setTimeout(
      () =>
        finish(
          new HappyOysterError(`${label} timed out.`, {
            code: "timeout",
            retryable: true,
          }),
        ),
      ms,
    );
    promise.then(
      (value) => finish(undefined, value),
      (error) =>
        finish(
          error instanceof HappyOysterError
            ? error
            : new HappyOysterError(`${label} failed.`, { code: "failed" }),
        ),
    );
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) abort();
  });
}

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(closedError());
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, ms);
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
  });
}

/** A client-safe error for a failed fal request: status plus the app's own message. */
function requestError(path: string, error: unknown): HappyOysterError {
  const status =
    typeof (error as { status?: unknown })?.status === "number"
      ? (error as { status: number }).status
      : undefined;
  const detail = (error as { body?: { detail?: unknown } })?.body?.detail;
  const first = Array.isArray(detail) ? detail[0] : undefined;
  const reason =
    typeof detail === "string"
      ? detail
      : typeof first?.msg === "string"
        ? first.msg
        : undefined;
  // 4xx details are the app's own validation messages; they never echo inputs.
  const message =
    status !== undefined && status >= 400 && status < 500 && reason
      ? reason
      : `Happy Oyster ${path} failed.`;
  return new HappyOysterError(message, {
    code: "http",
    status,
    retryable: status === undefined || status >= 500,
  });
}

/** Route SDK 0.1.4 to the configured model and join its runner-created travel. */
function configureSdkTravel(
  engine: object,
  configured: Configured,
  operation: (name: string, input?: Message) => Promise<Message>,
  signal: AbortSignal,
): void {
  const service = (
    engine as {
      backendService?: {
        apiBaseUrl?: unknown;
        startTravel?: unknown;
        get?: unknown;
        post?: unknown;
      };
      ensureSdkFeatureEnabled?: unknown;
    }
  ).backendService;
  if (
    !service ||
    typeof service.apiBaseUrl !== "string" ||
    typeof service.startTravel !== "function" ||
    typeof service.get !== "function" ||
    typeof service.post !== "function" ||
    typeof (engine as { ensureSdkFeatureEnabled?: unknown })
      .ensureSdkFeatureEnabled !== "function"
  )
    throw new HappyOysterError(
      "Happy Oyster SDK cannot join a runner-created travel. Install @happy-oyster/js-sdk@0.1.4.",
      { code: "sdk_unavailable" },
    );
  // No usable HTTP credential enters the SDK. All backend IO is replaced
  // on this instance; RTC media and commands keep the vendor transport.
  service.apiBaseUrl = "https://happy-oyster.invalid";
  const travelId = configured.travel.encrypted_travel_id;
  const invalid = () =>
    new HappyOysterError("Unsupported Happy Oyster SDK operation.", {
      code: "sdk_unavailable",
    });
  // SDK 0.1.4 treats a PAUSED poll during RTC reconnection as a new pause
  // and never restores its local state when STREAMING arrives. After resume,
  // wait briefly for a fresh provider status instead of returning that stale
  // transition. Preserve actual terminal states and bound the wait.
  let resumeUntil = 0;
  service.get = async (
    path: string,
    options: { signal?: AbortSignal } = {},
  ) => {
    const url = new URL(path, "https://happy-oyster.invalid");
    if (
      url.origin !== "https://happy-oyster.invalid" ||
      url.pathname !== "/openapi/v1/travels/status" ||
      url.searchParams.get("encryptedTravelId") !== travelId
    )
      throw invalid();
    while (!signal.aborted) {
      active(signal);
      if (options.signal?.aborted) throw closedError();
      const result = await operation("status");
      active(signal);
      if (options.signal?.aborted) throw closedError();
      if (
        !resumeUntil ||
        result.status !== "running" ||
        result.rtcStatus !== "PAUSED" ||
        Date.now() >= resumeUntil
      ) {
        resumeUntil = 0;
        return result;
      }
      await delay(500, signal);
    }
    throw closedError();
  };
  service.post = async (path: string, body: Message) => {
    if (path === "/openapi/v1/sdk/feature-gate")
      return operation("feature_gate");
    if (body.encryptedTravelId !== travelId) throw invalid();
    switch (path) {
      case "/openapi/v1/travels/pause":
        resumeUntil = 0;
        return operation("pause");
      case "/openapi/v1/travels/resume": {
        const result = await operation("resume");
        resumeUntil = Date.now() + 15_000;
        return result;
      }
      case "/openapi/v1/travels/end":
        resumeUntil = 0;
        return operation("end");
      case "/openapi/v1/travels/rewind": {
        const result = await operation("rewind", {
          rewind_to_sec: body.rewindToSec,
        });
        resumeUntil = Date.now() + 15_000;
        return result;
      }
      case "/openapi/v1/travels/instruct":
        return operation("instruct", { content: body.content });
      default:
        throw invalid();
    }
  };
  (
    engine as { ensureSdkFeatureEnabled: () => Promise<void> }
  ).ensureSdkFeatureEnabled = async () => {
    const gate = await operation("feature_gate");
    if (gate.enabled === false)
      throw new HappyOysterError(
        "Happy Oyster SDK is disabled by the provider.",
        { code: "sdk_unavailable" },
      );
  };
  // SDK 0.1.4 has no public existing-travel API. Its private entry hook
  // supplies the runner snapshot without a second, browser-side exchange.
  let joined = false;
  service.startTravel = async (id: string) => {
    const travel = configured.travel;
    if (joined || id !== travel.encrypted_travel_id)
      throw new HappyOysterError(
        "Happy Oyster travel can only be joined once.",
        { code: "invalid" },
      );
    joined = true;
    const rtc = travel.rtc_config;
    return {
      encryptedTravelId: travel.encrypted_travel_id,
      encryptedWorldId: travel.encrypted_world_id,
      mode: travel.mode,
      creationModel: travel.creation_model,
      firstFrame: travel.first_frame,
      playUrl: null,
      bgmUrl: travel.bgm_url,
      version: travel.version,
      noStreamAutoEndTimeoutSec: travel.no_stream_auto_end_timeout_sec,
      maxExperienceTimeSec: travel.max_experience_time_sec,
      rtcConfig: {
        channelId: rtc.channel_id,
        userId: rtc.user_id,
        appId: rtc.app_id,
        token: rtc.token,
        nonce: rtc.nonce ?? undefined,
        role: rtc.role ?? undefined,
        username: rtc.username ?? undefined,
        timestamp: rtc.timestamp ?? undefined,
        expireAt: rtc.expire_at ?? undefined,
      },
    };
  };
}

/** Retire SDK 0.1.4's shared RTC engine before a Directing rejoin. */
function sdkRtcReset(player: object): () => Promise<void> {
  const rtc = (player as { rtcSession?: { disconnect?: unknown } }).rtcSession;
  if (!rtc || typeof rtc.disconnect !== "function")
    throw new HappyOysterError(
      "Happy Oyster SDK cannot reset playback. Install @happy-oyster/js-sdk@0.1.4.",
      { code: "sdk_unavailable" },
    );
  const disconnect = rtc.disconnect as () => Promise<void>;
  return () => disconnect.call(rtc);
}

function isRelease(command: Required<HappyOysterCommand>): boolean {
  return (
    command.translation === "None" &&
    command.rotation === "None" &&
    command.interaction === "None"
  );
}

function validateCommand(
  input: HappyOysterCommand,
): Required<HappyOysterCommand> {
  const command = { ...RELEASE, ...input };
  if (
    !(ADVENTURE_TRANSLATIONS as readonly string[]).includes(
      command.translation,
    ) ||
    !(ADVENTURE_ROTATIONS as readonly string[]).includes(command.rotation) ||
    !(ADVENTURE_INTERACTIONS as readonly string[]).includes(command.interaction)
  )
    throw new HappyOysterError("Unknown Happy Oyster command.", {
      code: "invalid",
    });
  return command;
}

/**
 * Browser-only adapter for the Happy Oyster WMA app. WMA carries partner
 * credentials, travel binding and cleanup as plain AsyncAPI messages;
 * Alibaba's SDK carries media and is loaded lazily. The endpoint must be the
 * WMA app root, not the legacy REST-session app.
 * @experimental
 */
export function happyOyster() {
  return defineRealtimeExtension<HappyOysterOptions, HappyOysterSession>({
    id: "fal/happy-oyster",
    defaultEndpoint: "fal-ai/happy-oyster-wma",
    async open(context, options) {
      active(context.signal);
      if (!/^[\w-]+\/[\w-]+$/.test(context.endpointId))
        throw new Error("Use the Happy Oyster WMA app root as endpointId.");
      if (!options.worldId?.trim() || !options.videoElement)
        throw new Error("worldId and videoElement are required.");
      if (options.mode && !(options.mode in MODE_CODES))
        throw new Error("mode must be adventure or directing.");
      if (
        options.maxExperienceTimeSec !== undefined &&
        ![60, 90, 120].includes(options.maxExperienceTimeSec)
      )
        throw new Error("maxExperienceTimeSec must be 60, 90, or 120.");
      const worldTimeout = positive(
        options.worldReadyTimeoutMs ?? 300_000,
        "worldReadyTimeoutMs",
      );
      const connectTimeout = positive(
        options.connectTimeoutMs ?? 60_000,
        "connectTimeoutMs",
      );
      const controlTimeout = positive(
        options.controlTimeoutMs ?? 30_000,
        "controlTimeoutMs",
      );
      const playbackTimeout = positive(
        options.playbackTimeoutMs ?? 120_000,
        "playbackTimeoutMs",
      );
      // Assigned after cleanup registration, whose closure must also handle early failure.
      // eslint-disable-next-line prefer-const
      let control: WmaRealtimeSession | undefined;
      // Assigned after cleanup registration, whose closure must also handle early failure.
      // eslint-disable-next-line prefer-const
      let travel: Travel | undefined;
      let travelId: string | undefined;
      let binding: Promise<void> | undefined;
      let bound = false;
      let releasing: Promise<Message> | undefined;
      let closing = false;
      let controlTimedOut = false;
      let completed = false;
      const playbackLease = {};
      let ending: Promise<unknown> | undefined;
      let endSettled = false;
      let controlCleanupComplete = false;
      let travelStatus: HappyOysterTravelStatus = "prepare";
      let holdTimer: ReturnType<typeof setInterval> | undefined;
      const controlController = new AbortController();
      const controlCleanups: Array<() => void | Promise<void>> = [];
      const unsubscribe: Array<() => void> = [];
      let pending:
        | {
            expected: string;
            id?: string;
            resolve: (message: Message) => void;
            reject: (error: Error) => void;
          }
        | undefined;
      // Control requests are serialized: the app answers each one in order and
      // an error reply carries no correlation id.
      let queue: Promise<unknown> = Promise.resolve();

      function receive(raw: string) {
        if (controlTimedOut) return;
        let message: Message;
        try {
          message = JSON.parse(raw);
        } catch {
          return;
        }
        if (!message || typeof message !== "object") return;
        if (message.type === "error") {
          pending?.reject(
            new HappyOysterError(
              typeof message.message === "string" && message.message
                ? message.message
                : "Happy Oyster control request rejected.",
              {
                code: typeof message.code === "string" ? message.code : "error",
                retryable: message.retryable === true,
              },
            ),
          );
        } else if (
          pending &&
          message.type === pending.expected &&
          (!pending.id || message.encrypted_travel_id === pending.id)
        ) {
          pending.resolve(message);
        }
        // configured carries RTC credentials: never publish it to
        // onData or diagnostics.
      }

      function request(
        message: Message,
        expected: string,
        cleanup = false,
      ): Promise<Message> {
        const run = queue.then(async () => {
          if (controlTimedOut)
            throw new HappyOysterError(
              "Happy Oyster control channel timed out.",
              { code: "control" },
            );
          if (!control)
            throw new HappyOysterError(
              "Happy Oyster control channel is not available.",
              { code: "control" },
            );
          let rejectReply!: (error: Error) => void;
          const reply = new Promise<Message>((resolve, reject) => {
            rejectReply = reject;
            pending = {
              expected,
              id:
                typeof message.encrypted_travel_id === "string"
                  ? message.encrypted_travel_id
                  : undefined,
              resolve,
              reject,
            };
          });
          const current = pending;
          // Attach the rejection handler before send(), including synchronous send failures.
          const result = within(
            reply,
            cleanup ? CLEANUP_TIMEOUT_MS : controlTimeout,
            "Happy Oyster control request",
            cleanup ? undefined : context.signal,
          );
          try {
            try {
              control.send(message);
            } catch {
              rejectReply(
                new HappyOysterError("Happy Oyster control request failed.", {
                  code: "control",
                }),
              );
            }
            return await result;
          } catch (error) {
            if (
              !cleanup &&
              error instanceof HappyOysterError &&
              error.code === "timeout"
            ) {
              // Replies have no request IDs. Reusing this channel could assign
              // a late reply to a different request, so disconnect instead.
              controlTimedOut = true;
              void context.fail("Happy Oyster control request timed out.");
            }
            throw error;
          } finally {
            if (pending === current) pending = undefined;
          }
        });
        queue = run.catch(() => undefined);
        return run;
      }

      function releaseTravel(id: string): Promise<Message> {
        // SDK end and our fallback teardown share one request, including when
        // vendor cleanup outlives its bounded wait. Disconnect is the fallback
        // if release fails; never queue a duplicate on this uncorrelated channel.
        releasing ??= request(
          { type: "travel_ended", encrypted_travel_id: id, completed },
          "travel_released",
          closing,
        );
        return releasing;
      }

      function stopHold() {
        clearInterval(holdTimer);
        holdTimer = undefined;
      }

      function releasePlaybackLease() {
        if (
          controlCleanupComplete &&
          (!ending || endSettled) &&
          activePlaybackLease === playbackLease
        )
          activePlaybackLease = undefined;
      }

      context.addCleanup(async () => {
        closing = true;
        stopHold();
        pending?.reject(closedError());
        pending = undefined;
        for (const off of unsubscribe.splice(0)) {
          try {
            off();
          } catch {
            // One vendor disposer must not prevent playback/billing teardown.
          }
        }
        try {
          if (travel) {
            ending ??= Promise.resolve().then(() => travel?.end());
            const settled = () => {
              endSettled = true;
              releasePlaybackLease();
            };
            // A bounded wait does not cancel vendor work. A late end can still
            // disconnect the shared RTC engine, so retain its lease until settled.
            void ending.then(settled, settled);
            await within(
              ending,
              CLEANUP_TIMEOUT_MS,
              "Happy Oyster travel cleanup",
            ).catch(() => undefined);
          }
          if (binding) await binding.catch(() => undefined);
          if (bound && travelId && control && !controlTimedOut) {
            await releaseTravel(travelId).catch(() => undefined);
          }
        } finally {
          try {
            controlController.abort();
            for (const cleanup of controlCleanups.splice(0).reverse()) {
              await Promise.resolve()
                .then(cleanup)
                .catch(() => undefined);
            }
          } finally {
            controlCleanupComplete = true;
            releasePlaybackLease();
          }
        }
      });

      async function run<T>(
        path: string,
        input: Record<string, unknown>,
      ): Promise<T> {
        active(context.signal);
        const result = await context
          .run<
            Record<string, unknown>,
            T
          >(`${context.endpointId}${path}`, { input, abortSignal: context.signal })
          .catch((error) => {
            throw requestError(path, error);
          });
        active(context.signal);
        return result.data;
      }

      context.diagnostic({ kind: "progress", phase: "world-building" });
      const worldDeadline = Date.now() + worldTimeout;
      while (!context.signal.aborted) {
        const remaining = worldDeadline - Date.now();
        if (remaining <= 0)
          throw new HappyOysterError(
            "Happy Oyster world generation timed out.",
            {
              code: "timeout",
            },
          );
        const world = await within(
          run<HappyOysterWorld>("/worlds/build-status", {
            encrypted_world_id: options.worldId,
            ...(options.mode ? { mode: options.mode } : {}),
          }),
          remaining,
          "Happy Oyster world generation",
          context.signal,
        );
        if (world.encrypted_world_id !== options.worldId)
          throw new HappyOysterError(
            "Happy Oyster returned a different world.",
            {
              code: "invalid",
            },
          );
        if (world.status === "ready") break;
        if (world.status !== "generating")
          throw new HappyOysterError("Happy Oyster world generation failed.", {
            code: "world_failed",
          });
        await delay(
          Math.min(WORLD_POLL_MS, Math.max(1, worldDeadline - Date.now())),
          context.signal,
        );
      }

      active(context.signal);

      if (activePlaybackLease)
        throw new HappyOysterError(
          "Another Happy Oyster session is active or still cleaning up on this page. Close it or wait for cleanup before retrying; reload the page or use another tab if cleanup stalls.",
          { code: "busy" },
        );
      activePlaybackLease = playbackLease;
      // Fail an unavailable SDK before any billable work.
      const sdk = await loadHappyOysterSdk().catch(() => {
        throw new HappyOysterError(
          "Happy Oyster SDK is unavailable. Install @happy-oyster/js-sdk@0.1.4.",
          { code: "sdk_unavailable" },
        );
      });
      active(context.signal);
      context.diagnostic({ kind: "progress", phase: "control-connecting" });
      const childContext: RealtimeExtensionContext = {
        ...context,
        // WMA receives the app root; the bridge appends /start-session itself.
        endpointId: context.endpointId,
        signal: controlController.signal,
        addCleanup: (cleanup) => {
          if (closing) {
            void Promise.resolve()
              .then(cleanup)
              .catch(() => undefined);
          } else controlCleanups.push(cleanup);
        },
        data: receive,
        media: () => undefined,
        fail: () => context.fail("Happy Oyster control connection failed."),
      };
      control = await within(
        wma().open(childContext, { receive: [] }),
        connectTimeout,
        "Happy Oyster control connection",
        context.signal,
      );
      active(context.signal);
      context.diagnostic({ kind: "progress", phase: "configuring" });
      // Billing starts when the runner grants the RTC snapshot.
      const configured = (await request(
        {
          type: "configure",
          encrypted_world_id: options.worldId,
          ...(options.mode ? { mode: options.mode } : {}),
          ...(options.maxExperienceTimeSec
            ? { max_experience_time_sec: options.maxExperienceTimeSec }
            : {}),
        },
        "configured",
      )) as unknown as Configured;
      const mode = configured.world?.mode;
      if (
        !configured.travel?.encrypted_travel_id ||
        configured.travel.encrypted_world_id !== options.worldId ||
        configured.travel.mode !== MODE_CODES[mode as HappyOysterMode] ||
        !configured.travel.rtc_config?.channel_id ||
        !configured.travel.rtc_config?.user_id ||
        !configured.travel.rtc_config?.token ||
        configured.control_protocol !== "fal-session-v1" ||
        !configured.model ||
        !HOST_PATTERN.test(configured.api_host ?? "") ||
        configured.world?.encrypted_world_id !== options.worldId ||
        (mode !== "adventure" && mode !== "directing") ||
        (options.mode !== undefined && options.mode !== mode)
      )
        throw new HappyOysterError(
          "Happy Oyster returned invalid session configuration.",
          { code: "invalid" },
        );
      const engine: HappyOysterEngine = initializePlayer(() => {
        const created = new sdk.HappyOysterEngine({
          APIHost: configured.api_host,
          model: configured.model,
          logLevel: "none",
        } as SDKConfig);
        configureSdkTravel(
          created,
          configured,
          async (name, input = {}) => {
            if (name === "end") {
              await releaseTravel(configured.travel.encrypted_travel_id);
              return {
                encryptedTravelId: configured.travel.encrypted_travel_id,
                status: "completed",
              };
            }
            if (closing) throw closedError();
            const reply = await request(
              { type: "travel_request", operation: name, ...input },
              "travel_response",
            );
            const data = reply.data as Message;
            if (!data || typeof data !== "object")
              throw new HappyOysterError("Invalid travel response.", {
                code: "invalid",
              });
            // The runner publishes typed snake_case fields; the vendor expects camelCase.
            return Object.fromEntries(
              Object.entries(data).map(([key, value]) => [
                key.replace(/_([a-z])/g, (_, letter: string) =>
                  letter.toUpperCase(),
                ),
                value,
              ]),
            );
          },
          context.signal,
        );
        return created;
      });

      const bind = (id: string): Promise<void> => {
        binding ??= request(
          { type: "bind_travel", encrypted_travel_id: id },
          "travel_bound",
        ).then(() => {
          bound = true;
          travelId = id;
        });
        return binding;
      };

      const player = initializePlayer(() =>
        engine.createTravel({
          ticket: configured.travel.encrypted_travel_id,
          videoElement: options.videoElement,
          ...(options.maxExperienceTimeSec
            ? { maxExperienceTimeSec: options.maxExperienceTimeSec }
            : {}),
        }),
      );
      travel = player;
      const resetRtc = mode === "directing" ? sdkRtcReset(player) : undefined;
      const setStatus = (status: TravelStatus) => {
        if (status === "idle" || closing) return;
        travelStatus = status;
        context.diagnostic({
          kind: "progress",
          phase: "travel-status",
          detail: { status },
        });
        try {
          options.onTravelStatus?.(status);
        } catch {
          // A consumer callback must not interrupt the partner event loop.
        }
        if (status === "completed") {
          completed = true;
          void context.close();
        }
      };
      unsubscribe.push(
        player.on("statusChanged", setStatus),
        player.on("firstFrameGenerated", (frame) => {
          if (!closing) {
            try {
              options.onFirstFrame?.(frame);
            } catch {
              // A consumer callback must not interrupt the partner event loop.
            }
          }
        }),
        player.onError(() => {
          if (!closing) void context.fail("Happy Oyster playback failed.");
        }),
      );
      await bind(configured.travel.encrypted_travel_id);
      context.diagnostic({ kind: "progress", phase: "playback-connecting" });
      const started = await within(
        Promise.resolve().then(() => player.start()),
        playbackTimeout,
        "Happy Oyster playback",
        context.signal,
      );
      active(context.signal);
      if (
        started.encryptedTravelId !== configured.travel.encrypted_travel_id ||
        started.mode !== MODE_CODES[mode]
      )
        throw new HappyOysterError("Happy Oyster returned an invalid travel.", {
          code: "invalid",
        });
      await bind(started.encryptedTravelId);
      if (travelId !== started.encryptedTravelId)
        throw new HappyOysterError("Happy Oyster bound a different travel.", {
          code: "invalid",
        });
      active(context.signal);
      const liveTravelId = started.encryptedTravelId;

      let rejoining = false;
      let playbackActionPending = false;
      const can = (action: HappyOysterAction) =>
        !closing &&
        !context.signal.aborted &&
        bound &&
        !rejoining &&
        !playbackActionPending &&
        (mode === "adventure" ? action === "command" : action !== "command") &&
        player.can(actions[action]);
      const unavailable = (action: HappyOysterAction) =>
        new HappyOysterError(`Happy Oyster ${action} is unavailable.`, {
          code: "unavailable",
        });
      async function perform(
        action: HappyOysterAction,
        call: () => Promise<unknown>,
      ): Promise<void> {
        if (!can(action)) throw unavailable(action);
        playbackActionPending = action !== "command";
        try {
          await within(
            Promise.resolve().then(call),
            controlTimeout,
            `Happy Oyster ${action}`,
            context.signal,
          );
        } catch (error) {
          if (error instanceof HappyOysterError && error.code === "timeout") {
            // SDK work may still finish later. Retire this session instead of
            // allowing another action to race an ambiguous timed-out operation.
            void context.fail(`Happy Oyster ${action} timed out.`);
          }
          throw error;
        } finally {
          playbackActionPending = false;
        }
      }
      async function rejoin(
        action: "resume" | "rewind",
        call: () => Promise<unknown>,
      ): Promise<void> {
        if (!can(action)) throw unavailable(action);
        rejoining = true;
        let allowJoin = true;
        let resetStarted = false;
        try {
          await within(
            Promise.resolve().then(async () => {
              active(context.signal);
              // Retire the old singleton before the SDK creates its next join.
              resetStarted = true;
              await resetRtc!();
              if (!allowJoin) throw closedError();
              active(context.signal);
              return call();
            }),
            controlTimeout,
            `Happy Oyster ${action}`,
            context.signal,
          );
        } catch (error) {
          if (resetStarted) {
            // Playback may already be disconnected. End the session on every
            // failure, abort vendor work and prevent retries on a broken player.
            void context.fail(`Happy Oyster ${action} failed after RTC reset.`);
          }
          throw error;
        } finally {
          // A bounded action may return before slow vendor cleanup settles.
          // Never start a new join after its caller already saw a timeout.
          allowJoin = false;
          rejoining = false;
        }
      }
      let held: Required<HappyOysterCommand> = { ...RELEASE };
      let repeatPending = false;
      let commandQueue: Promise<unknown> = Promise.resolve();
      function sendCommand(
        command: Required<HappyOysterCommand>,
      ): Promise<unknown> {
        const sending = commandQueue.then(() => {
          active(context.signal);
          // Superseded queued input must not reactivate an older hold.
          if (held !== command) return;
          return player.sendCommand(command);
        });
        commandQueue = sending.catch(() => undefined);
        return sending;
      }
      return {
        worldId: options.worldId,
        travelId: liveTravelId,
        mode,
        world: configured.world,
        get travelStatus() {
          return travelStatus;
        },
        can,
        command: async (input) => {
          const command = validateCommand(input);
          stopHold();
          held = command;
          if (!can("command")) {
            if (isRelease(command)) return;
            throw unavailable("command");
          }
          await perform("command", () => sendCommand(command));
          if (held === command && can("command") && !isRelease(command)) {
            // The partner model applies one command per generation step, so a
            // held control is re-sent until it changes.
            holdTimer = setInterval(() => {
              if (!can("command")) return stopHold();
              if (repeatPending) return;
              repeatPending = true;
              void Promise.resolve()
                .then(() => sendCommand(held))
                .catch(() => undefined)
                .finally(() => {
                  repeatPending = false;
                });
            }, COMMAND_REPEAT_MS);
          }
        },
        instruct: async (content) => {
          if (!content.trim() || content.length > 2000)
            throw new HappyOysterError(
              "Instruction must contain 1–2000 characters.",
              { code: "invalid" },
            );
          if (!can("instruct")) throw unavailable("instruct");
          const reply = await request(
            { type: "travel_request", operation: "instruct", content },
            "travel_response",
          );
          const result = reply.data as { accepted?: boolean };
          return { accepted: result.accepted === true };
        },
        pause: () => perform("pause", () => player.pause()),
        resume: () => rejoin("resume", () => player.resume()),
        rewind: (seconds) => {
          if (!Number.isFinite(seconds) || seconds < 0)
            return Promise.reject(
              new HappyOysterError("Rewind position must be nonnegative.", {
                code: "invalid",
              }),
            );
          return rejoin("rewind", () =>
            player.rewind({ rewindToSec: seconds }),
          );
        },
        close: () => context.close(),
      };
    },
  });
}
