import {
  defineRealtimeExtension,
  wma,
  type RealtimeExtensionContext,
  type RealtimeSession,
  type WmaRealtimeSession,
} from "@fal-ai/client/realtime";
import type {
  HappyOysterEngine,
  SDKConfig,
  Travel,
  TravelStatus,
} from "@happy-oyster/js-sdk";

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
  client: ["configure", "refresh_token", "bind_travel", "travel_ended"],
  server: [
    "configured",
    "token_refreshed",
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
  ticket: string;
  token: string;
  token_expires_in: number;
  world: HappyOysterWorld;
};
type TokenRefreshed = { token: string; token_expires_in: number };

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
const TOKEN_RETRY_MS = 5_000;
const HOST_PATTERN = /^[a-z0-9.-]+(:\d+)?$/i;

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

/**
 * @happy-oyster/js-sdk 0.1.x ignores its documented `model` option and routes
 * every request to the retired combined model. Point the engine's request root
 * at the configured model; SDK builds that honor `model` already match, and
 * builds without this field are left alone.
 */
function routeToModel(engine: object, host: string, model: string): void {
  const service = (engine as { backendService?: { apiBaseUrl?: unknown } })
    .backendService;
  if (!service || typeof service.apiBaseUrl !== "string") return;
  const root = `https://${host}/api/v2/apps/${encodeURIComponent(model)}`;
  if (service.apiBaseUrl !== root) service.apiBaseUrl = root;
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
      let closing = false;
      let completed = false;
      let travelStatus: HappyOysterTravelStatus = "prepare";
      let refreshTimer: ReturnType<typeof setTimeout> | undefined;
      let expiryTimer: ReturnType<typeof setTimeout> | undefined;
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
        // configured/token_refreshed carry credentials: never publish them to
        // onData or diagnostics.
      }

      function request(
        message: Message,
        expected: string,
        cleanup = false,
      ): Promise<Message> {
        const run = queue.then(async () => {
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
          } finally {
            if (pending === current) pending = undefined;
          }
        });
        queue = run.catch(() => undefined);
        return run;
      }

      function stopHold() {
        clearInterval(holdTimer);
        holdTimer = undefined;
      }

      context.addCleanup(async () => {
        closing = true;
        clearTimeout(refreshTimer);
        clearTimeout(expiryTimer);
        stopHold();
        pending?.reject(closedError());
        pending = undefined;
        unsubscribe.splice(0).forEach((off) => off());
        try {
          if (travel)
            await within(
              Promise.resolve().then(() => travel?.end()),
              CLEANUP_TIMEOUT_MS,
              "Happy Oyster travel cleanup",
            ).catch(() => undefined);
          if (binding) await binding.catch(() => undefined);
          if (bound && travelId && control) {
            await request(
              {
                type: "travel_ended",
                encrypted_travel_id: travelId,
                completed,
              },
              "travel_released",
              true,
            ).catch(() => undefined);
          }
        } finally {
          controlController.abort();
          for (const cleanup of controlCleanups.splice(0).reverse()) {
            await Promise.resolve()
              .then(cleanup)
              .catch(() => undefined);
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

      // Fail an unavailable SDK before any billable work.
      const sdk = await import("@happy-oyster/js-sdk");
      active(context.signal);
      context.diagnostic({ kind: "progress", phase: "control-connecting" });
      const childContext: RealtimeExtensionContext = {
        ...context,
        endpointId: `${context.endpointId}/start-session`,
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
      // Billing starts once the app answers with credentials.
      const configured = (await request(
        {
          type: "configure",
          encrypted_world_id: options.worldId,
          ...(options.mode ? { mode: options.mode } : {}),
        },
        "configured",
      )) as unknown as Configured;
      const mode = configured.world?.mode;
      if (
        !configured.ticket ||
        !configured.token ||
        !(
          Number.isFinite(configured.token_expires_in) &&
          configured.token_expires_in > 0
        ) ||
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
          token: configured.token,
          logLevel: "none",
        } as SDKConfig);
        routeToModel(created, configured.api_host, configured.model);
        return created;
      });

      function scheduleRefresh(receivedAt: number, expiresIn: number) {
        positive(expiresIn, "Token lifetime");
        clearTimeout(expiryTimer);
        clearTimeout(refreshTimer);
        const deadline = receivedAt + expiresIn * 1000;
        if (deadline <= Date.now())
          throw new HappyOysterError(
            "Happy Oyster token expired during setup.",
            {
              code: "token",
            },
          );
        expiryTimer = setTimeout(() => {
          void context.fail("Happy Oyster token expired.");
        }, deadline - Date.now());
        const refresh = async () => {
          try {
            const refreshedAt = Date.now();
            const fresh = (await request(
              { type: "refresh_token" },
              "token_refreshed",
            )) as unknown as TokenRefreshed;
            if (closing) return;
            if (!fresh.token) throw new Error("Missing renewed token.");
            engine.updateToken(fresh.token);
            scheduleRefresh(refreshedAt, fresh.token_expires_in);
          } catch {
            // Retry while the current token is still valid; expiry fails the session.
            if (!closing) refreshTimer = setTimeout(refresh, TOKEN_RETRY_MS);
          }
        };
        refreshTimer = setTimeout(
          refresh,
          Math.max(
            1,
            deadline - Date.now() - Math.min(30_000, expiresIn * 250),
          ),
        );
      }
      scheduleRefresh(Date.now(), configured.token_expires_in);

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
          ticket: configured.ticket,
          videoElement: options.videoElement,
          ...(options.maxExperienceTimeSec
            ? { maxExperienceTimeSec: options.maxExperienceTimeSec }
            : {}),
        }),
      );
      travel = player;
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
      try {
        // SDK builds that report travel metadata before RTC connects let the
        // app end a travel whose playback never starts.
        const early = player as unknown as {
          on(
            event: "travelInfoReady",
            handler: (info: { encryptedTravelId?: unknown }) => void,
          ): () => void;
        };
        unsubscribe.push(
          early.on("travelInfoReady", (info) => {
            if (!closing && typeof info?.encryptedTravelId === "string")
              void bind(info.encryptedTravelId).catch(() => undefined);
          }),
        );
      } catch {
        // Older SDK builds reject unknown events; bind after start() instead.
      }
      context.diagnostic({ kind: "progress", phase: "playback-connecting" });
      const started = await within(
        Promise.resolve().then(() => player.start()),
        playbackTimeout,
        "Happy Oyster playback",
        context.signal,
      );
      active(context.signal);
      if (!started.encryptedTravelId || started.mode !== MODE_CODES[mode])
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

      const can = (action: HappyOysterAction) =>
        !closing &&
        !context.signal.aborted &&
        bound &&
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
        await within(
          Promise.resolve().then(call),
          controlTimeout,
          `Happy Oyster ${action}`,
          context.signal,
        );
      }
      let held: Required<HappyOysterCommand> = { ...RELEASE };
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
          if (!isRelease(command)) {
            // The partner model applies one command per generation step, so a
            // held control is re-sent until it changes.
            holdTimer = setInterval(() => {
              if (!can("command")) return stopHold();
              void player.sendCommand(held).catch(() => undefined);
            }, COMMAND_REPEAT_MS);
          }
          await perform("command", () => player.sendCommand(command));
        },
        instruct: async (content) => {
          if (!content.trim() || content.length > 2000)
            throw new HappyOysterError(
              "Instruction must contain 1–2000 characters.",
              { code: "invalid" },
            );
          if (!can("instruct")) throw unavailable("instruct");
          const result = await run<{ accepted?: boolean }>(
            "/travels/instruct",
            { encrypted_travel_id: liveTravelId, content },
          );
          return { accepted: result.accepted === true };
        },
        pause: () => perform("pause", () => player.pause()),
        resume: () => perform("resume", () => player.resume()),
        rewind: (seconds) => {
          if (!Number.isFinite(seconds) || seconds < 0)
            return Promise.reject(
              new HappyOysterError("Rewind position must be nonnegative.", {
                code: "invalid",
              }),
            );
          return perform("rewind", () =>
            player.rewind({ rewindToSec: seconds }),
          );
        },
        close: () => context.close(),
      };
    },
  });
}
