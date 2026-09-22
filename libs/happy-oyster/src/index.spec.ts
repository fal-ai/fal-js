import { wma, type RealtimeExtensionContext } from "@fal-ai/client/realtime";
import { HappyOysterEngine } from "@happy-oyster/js-sdk";
import { createConfig } from "../../client/src/config";
import { createRealtimeClient } from "../../client/src/realtime";
import { happyOyster } from "./index";

jest.mock("@fal-ai/client/realtime", () => ({
  defineRealtimeExtension: (extension: unknown) => extension,
  wma: jest.fn(),
}));
jest.mock("@happy-oyster/js-sdk", () => ({ HappyOysterEngine: jest.fn() }));

const ID = "fal-ai/happy-oyster-wma";
const world = {
  encrypted_world_id: "world",
  status: "ready",
  mode: "adventure" as const,
};
const configured = {
  type: "configured",
  api_base_url: "https://example.maas.aliyuncs.com/api/v2/apps/ho",
  ticket: "private-ticket",
  token: "private-token",
  token_expires_in: 60,
  world,
};

async function advanceTime(ms: number) {
  const flush = () =>
    new Promise<void>((resolve) =>
      jest.requireActual("timers").setImmediate(resolve),
    );
  await flush();
  jest.advanceTimersByTime(ms);
  await flush();
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

function setup(mode: "adventure" | "directing" = "adventure") {
  let controlContext!: RealtimeExtensionContext;
  const callbacks: Record<string, (value: never) => void> = {};
  const off = jest.fn();
  const travel = {
    on: jest.fn((event: string, callback: (value: never) => void) => {
      callbacks[event] = callback;
      return off;
    }),
    onError: jest.fn((callback: (value: never) => void) => {
      callbacks.error = callback;
      return off;
    }),
    can: jest.fn(() => true),
    start: jest.fn(async () => ({
      encryptedTravelId: "travel",
      mode: mode === "adventure" ? 1 : 2,
    })),
    end: jest.fn(async () => undefined),
    sendCommand: jest.fn(async () => undefined),
    sendInstruct: jest.fn(async () => undefined),
    pause: jest.fn(async () => undefined),
    resume: jest.fn(async () => undefined),
    rewind: jest.fn(async () => ({ resumedAtSec: 0 })),
  };
  const engine = {
    createTravel: jest.fn(() => travel),
    updateToken: jest.fn(),
  };
  (HappyOysterEngine as unknown as jest.Mock).mockImplementation(() => engine);
  const controlCleanup = jest.fn();
  const send = jest.fn((message: Record<string, unknown>) => {
    const response =
      message.type === "configure"
        ? { ...configured, world: { ...world, mode } }
        : {
            type:
              message.type === "bind_travel"
                ? "travel_bound"
                : "travel_released",
            encrypted_travel_id: message.encrypted_travel_id,
          };
    controlContext.data(JSON.stringify(response));
  });
  const open = jest.fn(async (context: RealtimeExtensionContext) => {
    controlContext = context;
    context.addCleanup(controlCleanup);
    return { send, close: jest.fn() };
  });
  (wma as jest.Mock).mockReturnValue({ open });
  const run = jest.fn(async (endpoint: string) => {
    const data = endpoint.endsWith("/worlds/build-status")
      ? { ...world, mode }
      : endpoint.endsWith("/session/provision")
        ? { provision_capability: "private-capability", expires_in: 600 }
        : { token: "renewed-token", expires_in: 60 };
    return { data, requestId: "request" };
  });
  const client = createRealtimeClient({
    config: createConfig({ credentials: "test" }),
    getClient: () => ({ run }) as never,
  });
  const videoElement = {} as HTMLVideoElement;
  const onData = jest.fn();
  const onError = jest.fn();
  const onDiagnostic = jest.fn();
  const start = (extra = {}) =>
    client.open(happyOyster(), {
      worldId: "world",
      videoElement,
      onData,
      onError,
      onDiagnostic,
      ...extra,
    });
  return {
    start,
    run,
    open,
    send,
    travel,
    engine,
    controlCleanup,
    off,
    onData,
    onError,
    onDiagnostic,
    callbacks,
    receive: (msg: object) => controlContext.data(JSON.stringify(msg)),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
});

it("opens data-only WMA, binds exact travel, and keeps credentials private", async () => {
  const f = setup();
  const handle = f.start();
  const { session } = await handle.ready;
  expect(f.open.mock.calls[0][0].endpointId).toBe(`${ID}/start-session`);
  expect((f.open.mock.calls as unknown[][])[0][1]).toEqual({ receive: [] });
  expect(f.send.mock.calls.map(([m]) => m.type)).toEqual([
    "configure",
    "bind_travel",
  ]);
  expect(f.send).toHaveBeenCalledWith({
    type: "bind_travel",
    encrypted_travel_id: "travel",
  });
  expect(handle.state).toBe("live");
  expect(session.mode).toBe("adventure");
  expect(f.onData).not.toHaveBeenCalled();
  expect(JSON.stringify(f.onDiagnostic.mock.calls)).not.toMatch(
    /private-token|private-ticket|private-capability/,
  );
  await handle.close();
  expect(f.travel.end).toHaveBeenCalledTimes(1);
  expect(f.send).toHaveBeenLastCalledWith({
    type: "travel_ended",
    encrypted_travel_id: "travel",
    completed: false,
  });
  expect(f.controlCleanup).toHaveBeenCalledTimes(1);
  expect(f.off).toHaveBeenCalledTimes(3);
  expect(jest.getTimerCount()).toBe(0);
  await handle.close();
  expect(f.travel.end).toHaveBeenCalledTimes(1);
});

it("gates mode-specific actions and replaces held commands including release", async () => {
  const f = setup();
  const handle = f.start();
  const { session } = await handle.ready;
  await session.command({ translation: "Front" });
  await session.command({});
  expect(f.travel.sendCommand).toHaveBeenLastCalledWith({
    translation: "None",
    rotation: "None",
    interaction: "None",
  });
  expect(session.can("instruct")).toBe(false);
  await expect(session.instruct("Rain")).rejects.toThrow("unavailable");
  f.travel.can.mockReturnValue(false);
  await expect(session.command({})).rejects.toThrow("unavailable");
  await handle.close();
  expect(session.can("command")).toBe(false);
});

it("exposes Directing controls without exposing the vendor session", async () => {
  const f = setup("directing");
  const handle = f.start();
  const { session } = await handle.ready;
  expect(session.can("command")).toBe(false);
  await session.instruct("Rain");
  await session.pause();
  await session.resume();
  await session.rewind(5);
  expect(f.travel.sendInstruct).toHaveBeenCalledWith({ content: "Rain" });
  expect(f.travel.rewind).toHaveBeenCalledWith({ rewindToSec: 5 });
  await expect(session.rewind(-1)).rejects.toThrow("nonnegative");
  await expect(session.instruct(" ")).rejects.toThrow("1–2000");
  await handle.close();
});

it("renews tokens during playback and cancels renewal when closed", async () => {
  const f = setup();
  const handle = f.start();
  await handle.ready;
  await advanceTime(50_000);
  expect(f.run).toHaveBeenCalledWith(
    `${ID}/tokens/issue`,
    expect.objectContaining({
      input: { provision_capability: "private-capability" },
    }),
  );
  expect(f.engine.updateToken).toHaveBeenCalledWith("renewed-token");
  await handle.close();
  const count = f.run.mock.calls.length;
  await advanceTime(100_000);
  expect(f.run).toHaveBeenCalledTimes(count);
});

it("ends both sessions when token renewal fails", async () => {
  const f = setup();
  const handle = f.start();
  await handle.ready;
  f.run.mockRejectedValueOnce(new Error("secret response"));
  await advanceTime(50_000);
  expect(handle.state).toBe("failed");
  await handle.close();
  expect(f.travel.end).toHaveBeenCalledTimes(1);
  expect(JSON.stringify(f.onDiagnostic.mock.calls)).not.toContain(
    "secret response",
  );
});

it("bounds a stalled token refresh by the existing token expiry", async () => {
  const f = setup();
  const handle = f.start();
  await handle.ready;
  f.run.mockReturnValueOnce(new Promise(() => undefined));
  await advanceTime(60_000);
  expect(handle.state).toBe("failed");
  await handle.close();
  expect(f.controlCleanup).toHaveBeenCalledTimes(1);
});

it("waits for the matching bind acknowledgement before reporting live", async () => {
  const f = setup();
  const original = f.send.getMockImplementation();
  if (!original) throw new Error("Missing control mock");
  f.send.mockImplementation((message) => {
    if (message.type !== "bind_travel") original(message);
  });
  const handle = f.start();
  await advanceTime(1);
  f.receive({ type: "travel_bound", encrypted_travel_id: "wrong-travel" });
  expect(handle.state).toBe("opening");
  f.receive({ type: "travel_bound", encrypted_travel_id: "travel" });
  await handle.ready;
  await handle.close();
});

it("cleans up on a rejected bind and never retries that mutation", async () => {
  const f = setup();
  const original = f.send.getMockImplementation();
  if (!original) throw new Error("Missing control mock");
  f.send.mockImplementation((message) => {
    if (message.type === "bind_travel")
      f.receive({ type: "error", code: "BIND_CONFLICT", message: "secret" });
    else original(message);
  });
  const handle = f.start();
  await expect(handle.ready).rejects.toThrow();
  await handle.close();
  expect(f.travel.end).toHaveBeenCalledTimes(1);
  expect(
    f.send.mock.calls.filter(([m]) => m.type === "bind_travel"),
  ).toHaveLength(1);
  expect(f.controlCleanup).toHaveBeenCalledTimes(1);
});

it("cleans up cancelled SDK startup even when start resolves late", async () => {
  const f = setup();
  const gate = deferred<{ encryptedTravelId: string; mode: number }>();
  f.travel.start.mockReturnValue(gate.promise);
  const handle = f.start();
  await advanceTime(1);
  await handle.close();
  gate.resolve({ encryptedTravelId: "late-travel", mode: 1 });
  await expect(handle.ready).rejects.toThrow();
  await advanceTime(1);
  expect(f.travel.end).toHaveBeenCalledTimes(1);
  expect(f.send.mock.calls.some(([m]) => m.type === "bind_travel")).toBe(false);
  expect(jest.getTimerCount()).toBe(0);
});

it("does not provision or open playback after cancelling world polling", async () => {
  const f = setup();
  f.run.mockResolvedValue({
    data: { ...world, status: "generating" },
    requestId: "request",
  });
  const handle = f.start();
  await advanceTime(1);
  await handle.close();
  await expect(handle.ready).rejects.toThrow();
  expect(f.open).not.toHaveBeenCalled();
  expect(f.travel.start).not.toHaveBeenCalled();
  expect(jest.getTimerCount()).toBe(0);
});

it("fails an ambiguous control timeout and closes without replay", async () => {
  const f = setup();
  f.send.mockImplementation(() => undefined);
  const handle = f.start({ controlTimeoutMs: 20 });
  await advanceTime(21);
  await expect(handle.ready).rejects.toThrow("timed out");
  await handle.close();
  expect(f.send).toHaveBeenCalledTimes(1);
  expect(f.controlCleanup).toHaveBeenCalledTimes(1);
});

it("reports natural completion as closed and releases the bound travel", async () => {
  const f = setup();
  const handle = f.start();
  await handle.ready;
  f.callbacks.statusChanged("completed" as never);
  await handle.close();
  expect(handle.state).toBe("closed");
  expect(f.send).toHaveBeenLastCalledWith(
    expect.objectContaining({ type: "travel_ended", completed: true }),
  );
});

it("derives all HTTP and control routes from a private deployment root", async () => {
  const f = setup();
  const handle = f.start({ endpointId: "owner/preview" });
  await handle.ready;
  expect(f.open.mock.calls[0][0].endpointId).toBe(
    "owner/preview/start-session",
  );
  expect(
    f.run.mock.calls.every(([endpoint]) =>
      endpoint.startsWith("owner/preview/"),
    ),
  ).toBe(true);
  await handle.close();
});

it("still releases the server binding when partner cleanup throws synchronously", async () => {
  const f = setup();
  const handle = f.start();
  await handle.ready;
  f.travel.end.mockImplementation(() => {
    throw new Error("partner failed");
  });
  await handle.close();
  expect(f.send).toHaveBeenLastCalledWith(
    expect.objectContaining({ type: "travel_ended" }),
  );
  expect(f.controlCleanup).toHaveBeenCalledTimes(1);
});

it("bounds stalled partner cleanup and falls back to disconnect on a lost release reply", async () => {
  const f = setup();
  const handle = f.start();
  await handle.ready;
  f.travel.end.mockReturnValue(new Promise(() => undefined));
  f.send.mockImplementation(() => undefined);
  const closing = handle.close();
  await advanceTime(5000);
  expect(f.send).toHaveBeenLastCalledWith(
    expect.objectContaining({ type: "travel_ended" }),
  );
  await advanceTime(5000);
  await closing;
  expect(f.controlCleanup).toHaveBeenCalledTimes(1);
  expect(jest.getTimerCount()).toBe(0);
});

it("sanitizes synchronous partner action failures", async () => {
  const f = setup();
  const handle = f.start();
  const { session } = await handle.ready;
  f.travel.sendCommand.mockImplementation(() => {
    throw new Error("private-token");
  });
  await expect(session.command({})).rejects.toThrow(
    "Happy Oyster command failed.",
  );
  await handle.close();
});

it("does not expose provisioning response details in session errors", async () => {
  const f = setup();
  const original = f.run.getMockImplementation();
  if (!original) throw new Error("Missing HTTP mock");
  f.run.mockImplementation((endpoint) =>
    endpoint.endsWith("/session/provision")
      ? Promise.reject(new Error("private-token"))
      : original(endpoint),
  );
  const handle = f.start();
  await expect(handle.ready).rejects.toThrow(
    "Happy Oyster /session/provision failed.",
  );
  await handle.close();
  expect(String(f.onError.mock.calls[0][0])).not.toContain("private-token");
  expect(f.controlCleanup).toHaveBeenCalledTimes(1);
});
