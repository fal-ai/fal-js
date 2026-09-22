import {
  defineRealtimeExtension,
  wma,
  type RealtimeExtensionContext,
  type RealtimeSession,
  type WmaRealtimeSession,
} from "@fal-ai/client/realtime";
import type { Travel, TravelStatus } from "@happy-oyster/js-sdk";

export type HappyOysterMode = "adventure" | "directing";
export type HappyOysterAction =
  | "command"
  | "instruct"
  | "pause"
  | "resume"
  | "rewind";
export type HappyOysterCommand = {
  translation?:
    | "Front"
    | "Back"
    | "Left"
    | "Right"
    | "Front_Left"
    | "Front_Right"
    | "Back_Left"
    | "Back_Right"
    | "None";
  rotation?:
    | "Mouse_Up"
    | "Mouse_Down"
    | "Mouse_Left"
    | "Mouse_Right"
    | "Mouse_Up_Left"
    | "Mouse_Up_Right"
    | "Mouse_Down_Left"
    | "Mouse_Down_Right"
    | "None";
  interaction?: "Jump" | "Attack" | "Crouch" | "Sprint" | "None";
};

export interface HappyOysterOptions {
  /** An existing world or the encrypted_world_id returned by /worlds/create. */
  worldId: string;
  /** The vendor player owns this element's playback for the session lifetime. */
  videoElement: HTMLVideoElement;
  /** Billable token grant, in seconds (1–1800). Defaults to 60. */
  tokenExpireSeconds?: number;
  /** Maximum wait for world generation. Defaults to five minutes. */
  worldReadyTimeoutMs?: number;
  /** Maximum wait for each control acknowledgement. Defaults to 15 seconds. */
  controlTimeoutMs?: number;
  /** Maximum wait for partner playback to start. Defaults to two minutes. */
  playbackTimeoutMs?: number;
  onFirstFrame?: (url: string) => void;
}

export interface HappyOysterSession extends RealtimeSession {
  readonly worldId: string;
  readonly travelId: string;
  readonly mode: HappyOysterMode;
  can(action: HappyOysterAction): boolean;
  /** Replaces the entire held command state; {} releases all controls. */
  command(input: HappyOysterCommand): Promise<void>;
  instruct(content: string): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  rewind(seconds: number): Promise<void>;
}

type Message = Record<string, unknown>;
type World = {
  encrypted_world_id: string;
  status: string;
  mode: HappyOysterMode | null;
};
type Configured = {
  api_base_url: string;
  ticket: string;
  token: string;
  token_expires_in: number;
  world: World;
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
const CLEANUP_TIMEOUT_MS = 5_000;

function positive(value: number, name: string): number {
  if (!Number.isFinite(value) || value <= 0)
    throw new Error(`${name} must be positive.`);
  return value;
}

function active(signal: AbortSignal): void {
  if (signal.aborted) throw new Error("Happy Oyster session closed.");
}

function initializePlayer<T>(create: () => T): T {
  try {
    return create();
  } catch {
    // Vendor errors may include session credentials in their message or cause.
    throw new Error("Happy Oyster player initialization failed.");
  }
}

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
    const abort = () => finish(new Error("Happy Oyster session closed."));
    const timer = setTimeout(
      () => finish(new Error(`${label} timed out.`)),
      ms,
    );
    promise.then(
      (value) => finish(undefined, value),
      () => finish(new Error(`${label} failed.`)),
    );
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) abort();
  });
}

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(new Error("Happy Oyster session closed."));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, ms);
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) abort();
  });
}

/**
 * Browser-only adapter for the happy-oyster/1 external-session contract.
 * WMA carries control/cleanup; Alibaba's SDK carries media and is loaded lazily.
 * The endpoint must be the WMA app root, not the legacy REST-session app.
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
      const tokenSeconds = options.tokenExpireSeconds ?? 60;
      if (
        !Number.isInteger(tokenSeconds) ||
        tokenSeconds < 1 ||
        tokenSeconds > 1800
      )
        throw new Error(
          "tokenExpireSeconds must be an integer from 1 to 1800.",
        );
      const worldTimeout = positive(
        options.worldReadyTimeoutMs ?? 300_000,
        "worldReadyTimeoutMs",
      );
      const controlTimeout = positive(
        options.controlTimeoutMs ?? 15_000,
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
      // Assigned after cleanup registration, whose closure must also handle early failure.
      // eslint-disable-next-line prefer-const
      let travelId: string | undefined;
      let bound = false;
      let closing = false;
      let completed = false;
      let refreshTimer: ReturnType<typeof setTimeout> | undefined;
      let expiryTimer: ReturnType<typeof setTimeout> | undefined;
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

      function receive(raw: string) {
        let message: Message;
        try {
          message = JSON.parse(raw);
        } catch {
          return;
        }
        if (!message || typeof message !== "object") return;
        if (message.type === "error") {
          pending?.reject(new Error("Happy Oyster control request rejected."));
        } else if (
          pending &&
          message.type === pending.expected &&
          (!pending.id || message.encrypted_travel_id === pending.id)
        ) {
          pending.resolve(message);
        }
        // configured contains credentials: never publish it to onData or diagnostics.
      }

      async function request(
        message: Message,
        expected: string,
        cleanup = false,
      ): Promise<Message> {
        if (pending || !control)
          throw new Error("Happy Oyster control channel is not available.");
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
            rejectReply(new Error("Happy Oyster control request failed."));
          }
          return await result;
        } finally {
          if (pending === current) pending = undefined;
        }
      }

      context.addCleanup(async () => {
        closing = true;
        clearTimeout(refreshTimer);
        clearTimeout(expiryTimer);
        pending?.reject(new Error("Happy Oyster session closed."));
        pending = undefined;
        unsubscribe.splice(0).forEach((off) => off());
        try {
          if (travel)
            await within(
              Promise.resolve().then(() => travel?.end()),
              CLEANUP_TIMEOUT_MS,
              "Happy Oyster travel cleanup",
            ).catch(() => undefined);
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
          .catch(() => {
            throw new Error(`Happy Oyster ${path} failed.`);
          });
        active(context.signal);
        return result.data;
      }

      context.diagnostic({ kind: "progress", phase: "world-building" });
      const worldDeadline = Date.now() + worldTimeout;
      while (!context.signal.aborted) {
        const remaining = worldDeadline - Date.now();
        if (remaining <= 0)
          throw new Error("Happy Oyster world generation timed out.");
        const world = await within(
          run<World>("/worlds/build-status", {
            encrypted_world_id: options.worldId,
          }),
          remaining,
          "Happy Oyster world generation",
          context.signal,
        );
        if (world.encrypted_world_id !== options.worldId)
          throw new Error("Happy Oyster returned a different world.");
        if (world.status === "ready") break;
        if (world.status !== "generating")
          throw new Error("Happy Oyster world is not ready.");
        await delay(
          Math.min(2000, Math.max(1, worldDeadline - Date.now())),
          context.signal,
        );
      }

      active(context.signal);

      // Fail an unavailable SDK before purchasing a token grant.
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
      control = await wma().open(childContext, { receive: [] });
      active(context.signal);
      context.diagnostic({ kind: "progress", phase: "session-provisioning" });
      const mintedAt = Date.now();
      const provision = await run<{
        provision_capability: string;
        expires_in: number;
      }>("/session/provision", {
        encrypted_world_id: options.worldId,
        token_expire_seconds: tokenSeconds,
      });
      if (!provision.provision_capability)
        throw new Error("Happy Oyster provisioning returned no capability.");
      const configured = (await request(
        {
          type: "configure",
          provision_capability: provision.provision_capability,
          encrypted_world_id: options.worldId,
          token_expire_seconds: tokenSeconds,
        },
        "configured",
      )) as unknown as Configured;
      if (
        !configured.ticket ||
        !configured.token ||
        configured.world?.encrypted_world_id !== options.worldId ||
        !["adventure", "directing"].includes(configured.world?.mode ?? "")
      )
        throw new Error("Happy Oyster returned invalid session configuration.");
      const mode = configured.world.mode as HappyOysterMode;
      const apiUrl = new URL(configured.api_base_url);
      if (apiUrl.protocol !== "https:" || apiUrl.username || apiUrl.password)
        throw new Error("Happy Oyster requires an HTTPS API host.");
      const engine = initializePlayer(
        () =>
          new sdk.HappyOysterEngine({
            APIHost: apiUrl.host,
            token: configured.token,
            logLevel: "none",
          }),
      );

      function scheduleRefresh(startedAt: number, expiresIn: number) {
        positive(expiresIn, "Token lifetime");
        clearTimeout(expiryTimer);
        const deadline = startedAt + expiresIn * 1000;
        if (deadline <= Date.now())
          throw new Error("Happy Oyster token expired during setup.");
        expiryTimer = setTimeout(() => {
          void context.fail("Happy Oyster token expired.");
        }, deadline - Date.now());
        refreshTimer = setTimeout(
          async () => {
            try {
              const refreshStartedAt = Date.now();
              const fresh = await run<{ token: string; expires_in: number }>(
                "/tokens/issue",
                { provision_capability: provision.provision_capability },
              );
              if (closing) return;
              if (!fresh.token) throw new Error("Missing renewed token.");
              engine.updateToken(fresh.token);
              scheduleRefresh(refreshStartedAt, fresh.expires_in);
            } catch {
              if (!closing)
                void context.fail("Happy Oyster token renewal failed.");
            }
          },
          Math.max(
            1,
            deadline - Date.now() - Math.min(10_000, expiresIn * 200),
          ),
        );
      }
      scheduleRefresh(mintedAt, configured.token_expires_in);
      const player = initializePlayer(() =>
        engine.createTravel({
          ticket: configured.ticket,
          videoElement: options.videoElement,
        }),
      );
      travel = player;
      unsubscribe.push(
        player.on("statusChanged", (status: TravelStatus) => {
          if (closing) return;
          context.diagnostic({
            kind: "progress",
            phase: "travel-status",
            detail: { status },
          });
          if (status === "completed") {
            completed = true;
            void context.close();
          }
        }),
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
      context.diagnostic({ kind: "progress", phase: "playback-connecting" });
      const started = await within(
        Promise.resolve().then(() => player.start()),
        playbackTimeout,
        "Happy Oyster playback",
        context.signal,
      );
      active(context.signal);
      travelId = started.encryptedTravelId;
      if (!travelId || started.mode !== (mode === "adventure" ? 1 : 2))
        throw new Error("Happy Oyster returned an invalid travel.");
      await request(
        { type: "bind_travel", encrypted_travel_id: travelId },
        "travel_bound",
      );
      bound = true;
      active(context.signal);

      const can = (action: HappyOysterAction) =>
        !closing &&
        !context.signal.aborted &&
        bound &&
        (mode === "adventure" ? action === "command" : action !== "command") &&
        player.can(actions[action]);
      async function perform(
        action: HappyOysterAction,
        call: () => Promise<unknown>,
      ): Promise<void> {
        if (!can(action))
          throw new Error(`Happy Oyster ${action} is unavailable.`);
        await within(
          Promise.resolve().then(call),
          controlTimeout,
          `Happy Oyster ${action}`,
          context.signal,
        );
      }
      return {
        worldId: options.worldId,
        travelId,
        mode,
        can,
        command: (input) =>
          perform("command", () =>
            player.sendCommand({ ...RELEASE, ...input }),
          ),
        instruct: (content) => {
          if (!content.trim() || content.length > 2000)
            return Promise.reject(
              new Error("Instruction must contain 1–2000 characters."),
            );
          return perform("instruct", () => player.sendInstruct({ content }));
        },
        pause: () => perform("pause", () => player.pause()),
        resume: () => perform("resume", () => player.resume()),
        rewind: (seconds) => {
          if (!Number.isFinite(seconds) || seconds < 0)
            return Promise.reject(
              new Error("Rewind position must be nonnegative."),
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
