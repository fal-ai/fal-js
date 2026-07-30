import { defineRealtimeExtension, type RealtimeSession } from "./extension";

const DEFAULT_ENDPOINT = "alibaba/happy-oyster";
const DEFAULT_BUILD_POLL_MS = 4_000;
const DEFAULT_COMMAND_RESEND_MS = 300;
const DEFAULT_TOKEN_GRANT_SECONDS = 60;
const DEFAULT_TOKEN_REFRESH_MARGIN_SECONDS = 15;

export type HappyOysterWorldMode = "adventure" | "directing";
export type HappyOysterTravelStatus =
  | "idle"
  | "prepare"
  | "running"
  | "paused"
  | "completed";

export interface HappyOysterWorld {
  encrypted_world_id: string;
  status: "generating" | "ready" | "failed";
  first_frame: string | null;
  name: string | null;
  mode: HappyOysterWorldMode | null;
}

export interface HappyOysterCreateWorld {
  mode: HappyOysterWorldMode;
  prompt: string;
  perspective?: "first_person" | "third_person";
  resolution?: "480p" | "720p";
  first_frame_image_url?: string;
}

export type HappyOysterWorldSelection =
  | { create: HappyOysterCreateWorld }
  | { attach: string };

export interface HappyOysterAdventureCommand {
  translation?: string;
  rotation?: string;
  interaction?: string;
}

export type HappyOysterTravelAction =
  | "sendCommand"
  | "sendInstruct"
  | "pause"
  | "resume"
  | "rewind";

export interface HappyOysterTravel {
  on(
    event: "statusChanged",
    handler: (status: HappyOysterTravelStatus) => void,
  ): () => void;
  on(
    event: "firstFrameGenerated",
    handler: (frame: string) => void,
  ): () => void;
  on(event: "error", handler: (error: unknown) => void): () => void;
  can(action: HappyOysterTravelAction): boolean;
  start(): Promise<{ encryptedTravelId: string }>;
  sendCommand(command: HappyOysterAdventureCommand): Promise<void>;
  sendInstruct(input: { content: string }): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  rewind(input: { rewindToSec: number }): Promise<{ resumedAtSec: number }>;
  end(): Promise<void>;
}

export interface HappyOysterEngine {
  updateToken(token: string): void;
  createTravel(input: {
    ticket: string;
    videoElement: HTMLVideoElement;
  }): HappyOysterTravel;
}

export interface HappyOysterEngineConfig {
  apiHost: string;
  token: string;
}

export interface HappyOysterExtensionConfig {
  endpoint?: string;
  loadEngine(config: HappyOysterEngineConfig): Promise<HappyOysterEngine>;
  buildPollMs?: number;
  commandResendMs?: number;
  tokenGrantSeconds?: number;
  tokenRefreshMarginSeconds?: number;
}

export type HappyOysterPhase =
  | "creating_world"
  | "building_world"
  | "world_ready"
  | "starting_session"
  | "connecting_travel"
  | "streaming"
  | "ended";

export interface HappyOysterRealtimeOptions {
  endpointId?: string;
  world: HappyOysterWorldSelection;
  videoElement: HTMLVideoElement;
  abortSignal?: AbortSignal;
  onPhaseChange?: (phase: HappyOysterPhase) => void;
  onWorldStatus?: (world: HappyOysterWorld) => void;
  onTravelStatus?: (status: HappyOysterTravelStatus) => void;
  onFirstFrame?: (frame: string) => void;
  onError?: (error: unknown) => void;
}

export interface HappyOysterArtifacts {
  encrypted_travel_id: string;
  compose_status: "ready" | "partial" | "processing" | null;
  video: Record<string, unknown>;
}

export interface HappyOysterRealtimeSession extends RealtimeSession {
  readonly world: HappyOysterWorld;
  readonly travelId: string;
  readonly travelStatus: HappyOysterTravelStatus;
  can(action: HappyOysterTravelAction): boolean;
  /**
   * Set held movement state. Active commands are re-sent on the provider's
   * chunk cadence; `null` releases the held command.
   */
  setCommand(command: HappyOysterAdventureCommand | null): void;
  instruct(content: string): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  rewind(rewindToSec: number): Promise<{ resumedAtSec: number }>;
  artifacts(): Promise<HappyOysterArtifacts>;
}

interface StartSessionResponse {
  session_id: string;
  heartbeat_interval_sec: number;
  connection: {
    api_base_url: string;
    ticket: string;
    token: string;
    token_expires_in: number;
    world: HappyOysterWorld;
  };
}

function apiHostFrom(apiBaseUrl: string): string {
  try {
    return new URL(apiBaseUrl).host;
  } catch {
    return apiBaseUrl.replace(/^\/+/, "").split("/")[0];
  }
}

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, ms);
    const abort = () => {
      clearTimeout(timer);
      reject(signal.reason ?? new Error("Realtime open aborted"));
    };
    signal.addEventListener("abort", abort, { once: true });
  });
}

/**
 * Happy Oyster's persistent-world + vendor-RTC lifecycle.
 *
 * The provider SDK remains replaceable and is loaded by the application.
 * This extension owns the fal control plane, polling, credentials, heartbeat,
 * held-input behavior, binding, and complete teardown.
 */
export function happyOysterRealtime(config: HappyOysterExtensionConfig) {
  const endpoint = config.endpoint ?? DEFAULT_ENDPOINT;
  const buildPollMs = config.buildPollMs ?? DEFAULT_BUILD_POLL_MS;
  const commandResendMs = config.commandResendMs ?? DEFAULT_COMMAND_RESEND_MS;
  const tokenGrantSeconds =
    config.tokenGrantSeconds ?? DEFAULT_TOKEN_GRANT_SECONDS;
  const tokenRefreshMarginSeconds =
    config.tokenRefreshMarginSeconds ?? DEFAULT_TOKEN_REFRESH_MARGIN_SECONDS;

  return defineRealtimeExtension<
    HappyOysterRealtimeOptions,
    HappyOysterRealtimeSession
  >({
    id: "fal/happy-oyster",
    defaultEndpoint: endpoint,
    supports: (endpointId) => endpointId === endpoint,
    async open(context, options) {
      let world: HappyOysterWorld;
      let sessionId: string | null = null;
      let travelId: string | null = null;
      let travelStatus: HappyOysterTravelStatus = "idle";
      let travel: HappyOysterTravel | null = null;
      let engine: HappyOysterEngine | null = null;
      const heartbeatTimer: {
        current?: ReturnType<typeof setInterval>;
      } = {};
      let tokenTimer: ReturnType<typeof setTimeout> | undefined;
      let commandTimer: ReturnType<typeof setInterval> | undefined;
      let heldCommand: HappyOysterAdventureCommand | null = null;
      const unsubscribers: Array<() => void> = [];

      const throwIfAborted = () => {
        if (context.signal.aborted) {
          throw (
            context.signal.reason ??
            new DOMException("Happy Oyster session aborted", "AbortError")
          );
        }
      };
      const call = async <Output>(
        path: string,
        input: Record<string, unknown>,
        allowAfterAbort = false,
      ): Promise<Output> => {
        const result = await context.run<Record<string, unknown>, Output>(
          `${context.endpointId}${path}`,
          {
            input,
            abortSignal: allowAfterAbort ? undefined : context.signal,
          },
        );
        if (!allowAfterAbort) throwIfAborted();
        return result.data;
      };
      const reportPhase = (phase: HappyOysterPhase) => {
        options.onPhaseChange?.(phase);
      };
      const reportWorld = (next: HappyOysterWorld) => {
        world = next;
        options.onWorldStatus?.(next);
      };
      const reportTravel = (next: HappyOysterTravelStatus) => {
        travelStatus = next;
        options.onTravelStatus?.(next);
      };

      context.addCleanup(async () => {
        clearInterval(heartbeatTimer.current);
        clearTimeout(tokenTimer);
        clearInterval(commandTimer);
        for (const unsubscribe of unsubscribers.splice(0)) unsubscribe();
        const activeTravel = travel;
        travel = null;
        if (activeTravel) {
          try {
            await activeTravel.end();
          } catch {
            // The fal session reaper remains the final safety net.
          }
        }
        const activeSessionId = sessionId;
        sessionId = null;
        if (activeSessionId) {
          try {
            await call("/session/close", { session_id: activeSessionId }, true);
          } catch {
            // Expired or already-closed sessions need no further action.
          }
        }
        reportPhase("ended");
      });

      throwIfAborted();
      if ("create" in options.world) {
        reportPhase("creating_world");
        world = await call<HappyOysterWorld>("/worlds/create", {
          ...options.world.create,
        });
      } else {
        reportPhase("building_world");
        world = await call<HappyOysterWorld>("/worlds/build-status", {
          encrypted_world_id: options.world.attach,
        });
      }
      reportWorld(world);

      while (world.status === "generating") {
        reportPhase("building_world");
        await wait(buildPollMs, context.signal);
        reportWorld(
          await call<HappyOysterWorld>("/worlds/build-status", {
            encrypted_world_id: world.encrypted_world_id,
          }),
        );
      }
      if (world.status !== "ready") {
        throw new Error("Happy Oyster world build failed");
      }
      reportPhase("world_ready");

      reportPhase("starting_session");
      const tokenMintedAt = Date.now();
      const started = await call<StartSessionResponse>("/session", {
        session_params: {
          encrypted_world_id: world.encrypted_world_id,
          token_expire_seconds: tokenGrantSeconds,
        },
      });
      sessionId = started.session_id;
      reportWorld(started.connection.world);

      heartbeatTimer.current = setInterval(
        () => {
          if (!sessionId) return;
          void call<{ alive: boolean }>("/session/heartbeat", {
            session_id: sessionId,
          })
            .then((beat) => {
              if (!beat.alive) void context.close();
            })
            .catch(() => {
              // A later heartbeat retries transient control-plane failures.
            });
        },
        Math.max(1, started.heartbeat_interval_sec) * 1_000,
      );

      const scheduleTokenRefresh = (
        expiresAt: number,
        retryDelayMs?: number,
      ) => {
        clearTimeout(tokenTimer);
        const delay =
          retryDelayMs ??
          Math.max(
            1_000,
            expiresAt - Date.now() - tokenRefreshMarginSeconds * 1_000,
          );
        tokenTimer = setTimeout(async () => {
          if (!travel || !engine) return;
          try {
            const mintedAt = Date.now();
            const fresh = await call<{
              token: string;
              expires_in: number;
            }>("/tokens/issue", {
              expire_in_seconds: tokenGrantSeconds,
            });
            engine.updateToken(fresh.token);
            scheduleTokenRefresh(mintedAt + fresh.expires_in * 1_000);
          } catch (error) {
            options.onError?.(error);
            if (Date.now() < expiresAt) {
              scheduleTokenRefresh(expiresAt, 2_000);
            }
          }
        }, delay);
      };

      reportPhase("connecting_travel");
      engine = await config.loadEngine({
        apiHost: apiHostFrom(started.connection.api_base_url),
        token: started.connection.token,
      });
      throwIfAborted();
      const createdTravel = engine.createTravel({
        ticket: started.connection.ticket,
        videoElement: options.videoElement,
      });
      travel = createdTravel;
      unsubscribers.push(
        createdTravel.on("statusChanged", (status) => {
          reportTravel(status);
          if (status === "running") reportPhase("streaming");
          if (status === "completed") void context.close();
        }),
        createdTravel.on("firstFrameGenerated", (frame) => {
          options.onFirstFrame?.(frame);
        }),
        createdTravel.on("error", (error) => {
          options.onError?.(error);
        }),
      );
      const startedTravel = await createdTravel.start();
      if (context.signal.aborted) {
        try {
          await createdTravel.end();
        } catch {
          // The managed cleanup path may already have ended this travel.
        }
        throwIfAborted();
      }
      travelId = startedTravel.encryptedTravelId;
      scheduleTokenRefresh(
        tokenMintedAt + started.connection.token_expires_in * 1_000,
      );
      try {
        await call("/session/bind-travel", {
          session_id: sessionId,
          encrypted_travel_id: travelId,
        });
      } catch {
        // Binding is a server-side safety net; local cleanup remains primary.
      }

      const sendHeldCommand = () => {
        const currentTravel = travel;
        if (!currentTravel || !heldCommand) return;
        void currentTravel.sendCommand(heldCommand).catch(() => {
          // The cadence retries dropped command chunks.
        });
      };

      return {
        get world() {
          return world;
        },
        get travelId() {
          return travelId as string;
        },
        get travelStatus() {
          return travelStatus;
        },
        can(action) {
          return travel?.can(action) ?? false;
        },
        setCommand(command) {
          heldCommand = command;
          clearInterval(commandTimer);
          if (!travel?.can("sendCommand")) return;
          if (!command) {
            void travel.sendCommand({
              translation: "None",
              rotation: "None",
              interaction: "None",
            });
            return;
          }
          sendHeldCommand();
          commandTimer = setInterval(sendHeldCommand, commandResendMs);
        },
        async instruct(content) {
          const trimmed = content.trim();
          if (!travel || !trimmed) return;
          await travel.sendInstruct({ content: trimmed });
        },
        async pause() {
          await travel?.pause();
        },
        async resume() {
          await travel?.resume();
        },
        async rewind(rewindToSec) {
          if (!travel) throw new Error("Happy Oyster travel is not active");
          return travel.rewind({ rewindToSec });
        },
        artifacts() {
          return call<HappyOysterArtifacts>("/travels/artifacts", {
            encrypted_travel_id: travelId,
          });
        },
        close() {
          // The client wraps this with the managed, idempotent cleanup.
        },
      };
    },
  });
}
