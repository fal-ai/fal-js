import type { RealtimeExtensionContext } from "./extension";
import { happyOysterRealtime, type HappyOysterTravel } from "./happy-oyster";

describe("happyOysterRealtime", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("owns control-plane setup, held commands, and teardown", async () => {
    const calls: string[] = [];
    const cleanups: Array<() => void | Promise<void>> = [];
    let statusChanged: ((status: "running") => void) | undefined;
    const travel = {
      on: jest.fn((event: string, handler: (value: any) => void) => {
        if (event === "statusChanged") statusChanged = handler;
        return jest.fn();
      }),
      can: jest.fn().mockReturnValue(true),
      start: jest.fn(async () => {
        statusChanged?.("running");
        return { encryptedTravelId: "travel-1" };
      }),
      sendCommand: jest.fn().mockResolvedValue(undefined),
      sendInstruct: jest.fn().mockResolvedValue(undefined),
      pause: jest.fn().mockResolvedValue(undefined),
      resume: jest.fn().mockResolvedValue(undefined),
      rewind: jest.fn().mockResolvedValue({ resumedAtSec: 4 }),
      end: jest.fn().mockResolvedValue(undefined),
    } as unknown as HappyOysterTravel;
    const engine = {
      updateToken: jest.fn(),
      createTravel: jest.fn(() => travel),
    };
    const context = {
      endpointId: "alibaba/happy-oyster",
      signal: new AbortController().signal,
      run: jest.fn(async (endpointId: string) => {
        const path = endpointId.replace("alibaba/happy-oyster", "");
        calls.push(path);
        if (path === "/worlds/build-status") {
          return {
            data: {
              encrypted_world_id: "world-1",
              status: "ready",
              first_frame: null,
              name: "World",
              mode: "adventure",
            },
          };
        }
        if (path === "/session") {
          return {
            data: {
              session_id: "session-1",
              heartbeat_interval_sec: 20,
              connection: {
                api_base_url: "https://oyster.example/api/v2/apps/1",
                ticket: "ticket",
                token: "token",
                token_expires_in: 60,
                world: {
                  encrypted_world_id: "world-1",
                  status: "ready",
                  first_frame: null,
                  name: "World",
                  mode: "adventure",
                },
              },
            },
          };
        }
        return { data: { bound: true, closed: true } };
      }),
      connect: jest.fn(),
      addCleanup: (cleanup: () => void | Promise<void>) =>
        cleanups.push(cleanup),
      close: jest.fn(),
      // The extension reports through these now, so a fake context without them throws at runtime —
      // which the `as unknown as` cast on this object hides from the compiler.
      diagnostic: jest.fn(),
      fail: jest.fn(),
    } as unknown as RealtimeExtensionContext;
    const extension = happyOysterRealtime({
      loadEngine: async () => engine,
      commandResendMs: 300,
    });

    const session = await extension.open(context, {
      endpointId: context.endpointId,
      world: { attach: "world-1" },
      videoElement: {} as HTMLVideoElement,
    });

    expect(calls.slice(0, 3)).toEqual([
      "/worlds/build-status",
      "/session",
      "/session/bind-travel",
    ]);
    expect(session.travelId).toBe("travel-1");

    session.setCommand({ translation: "Front" });
    expect(travel.sendCommand).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(600);
    expect(travel.sendCommand).toHaveBeenCalledTimes(3);
    session.setCommand(null);
    expect(travel.sendCommand).toHaveBeenLastCalledWith({
      translation: "None",
      rotation: "None",
      interaction: "None",
    });

    await Promise.all(cleanups.map((cleanup) => cleanup()));
    expect(travel.end).toHaveBeenCalledTimes(1);
    expect(calls).toContain("/session/close");
  });
});
