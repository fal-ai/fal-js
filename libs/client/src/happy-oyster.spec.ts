import { HappyOysterEngine } from "@happy-oyster/js-sdk";
import { createConfig } from "./config";
import {
  HAPPY_OYSTER_MESSAGES,
  happyOyster,
  HappyOysterError,
} from "./happy-oyster";
import { createRealtimeClient } from "./realtime";
import { wma, type RealtimeExtensionContext } from "./realtime/index";

jest.mock("./realtime/index", () => ({
  defineRealtimeExtension: (extension: unknown) => extension,
  wma: jest.fn(),
}));
jest.mock("@happy-oyster/js-sdk", () => ({ HappyOysterEngine: jest.fn() }));
jest.mock("./happy-oyster-sdk.cjs", () => ({
  loadHappyOysterSdk: () => import("@happy-oyster/js-sdk"),
}));

const ID = "fal-ai/happy-oyster-wma";
const LEGACY_ROOT =
  "https://example.maas.aliyuncs.com/api/v2/apps/happyoyster-1.0";
const world = {
  encrypted_world_id: "world",
  status: "ready",
  mode: "adventure" as const,
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
    ensureSdkFeatureEnabled: jest.fn(),
    backendService: {
      apiBaseUrl: LEGACY_ROOT,
      startTravel: jest.fn(),
      get: jest.fn(),
      post: jest.fn(),
    },
  };
  (HappyOysterEngine as unknown as jest.Mock).mockImplementation(() => engine);
  const controlCleanup = jest.fn();
  const replies: Record<string, (message: Record<string, unknown>) => object> =
    {
      configure: () => ({
        type: "configured",
        api_host: "example.maas.aliyuncs.com",
        model: `happyoyster-1.0-${mode}`,
        control_protocol: "fal-session-v1",
        world: { ...world, mode },
        travel: {
          encrypted_travel_id: "travel",
          encrypted_world_id: "world",
          mode: mode === "adventure" ? 1 : 2,
          creation_model: "simple",
          first_frame: null,
          bgm_url: null,
          version: mode === "adventure" ? "wanderV2" : "storyV2",
          no_stream_auto_end_timeout_sec: 30,
          max_experience_time_sec: mode === "adventure" ? 60 : null,
          rtc_config: {
            channel_id: "channel",
            user_id: "user",
            app_id: "app",
            token: "private-rtc-token",
          },
        },
      }),
      travel_request: () => ({
        type: "travel_response",
        data: { accepted: true, enabled: true, rtc_status: "STREAMING" },
      }),
      bind_travel: (message) => ({
        type: "travel_bound",
        encrypted_travel_id: message.encrypted_travel_id,
      }),
      travel_ended: (message) => ({
        type: "travel_released",
        encrypted_travel_id: message.encrypted_travel_id,
        completed: message.completed,
      }),
    };
  const send = jest.fn((message: Record<string, unknown>) => {
    const reply = replies[message.type as string];
    if (reply) controlContext.data(JSON.stringify(reply(message)));
  });
  const open = jest.fn(async (context: RealtimeExtensionContext) => {
    controlContext = context;
    context.addCleanup(controlCleanup);
    return { send, close: jest.fn() };
  });
  (wma as jest.Mock).mockReturnValue({ open });
  const run = jest.fn(
    async (endpoint: string, options?: { input?: object }) => {
      const data = endpoint.endsWith("/worlds/build-status")
        ? { ...world, mode }
        : { ...(options?.input ?? {}), accepted: true };
      return { data, requestId: "request" };
    },
  );
  const client = createRealtimeClient({
    config: createConfig({ credentials: "test" }),
    getClient: () => ({ run }) as never,
  });
  const videoElement = {} as HTMLVideoElement;
  const onData = jest.fn();
  const onError = jest.fn();
  const onDiagnostic = jest.fn();
  const onTravelStatus = jest.fn();
  const start = (extra = {}) =>
    client.open(happyOyster(), {
      worldId: "world",
      videoElement,
      onData,
      onError,
      onDiagnostic,
      onTravelStatus,
      ...extra,
    });
  const sent = () => send.mock.calls.map(([message]) => message.type);
  return {
    start,
    run,
    open,
    send,
    sent,
    replies,
    travel,
    engine,
    controlCleanup,
    off,
    onData,
    onError,
    onDiagnostic,
    onTravelStatus,
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

it("configures data-only WMA, binds the exact travel, and keeps credentials private", async () => {
  const f = setup();
  const handle = f.start();
  const { session } = await handle.ready;
  expect(f.open.mock.calls[0][0].endpointId).toBe(ID);
  expect((f.open.mock.calls as unknown[][])[0][1]).toEqual({ receive: [] });
  expect(f.send.mock.calls[0][0]).toEqual({
    type: "configure",
    encrypted_world_id: "world",
  });
  expect(f.sent()).toEqual(["configure", "bind_travel"]);
  expect(f.send).toHaveBeenCalledWith({
    type: "bind_travel",
    encrypted_travel_id: "travel",
  });
  expect(HappyOysterEngine).toHaveBeenCalledWith({
    APIHost: "example.maas.aliyuncs.com",
    model: "happyoyster-1.0-adventure",
    logLevel: "none",
  });
  // The SDK request root follows the configured model, not the retired one.
  expect(f.engine.backendService.apiBaseUrl).toBe(
    "https://happy-oyster.invalid",
  );
  expect(f.engine.createTravel).toHaveBeenCalledWith({
    ticket: "travel",
    videoElement: expect.anything(),
  });
  expect(handle.state).toBe("live");
  expect(session.mode).toBe("adventure");
  expect(session.travelId).toBe("travel");
  expect(session.world.encrypted_world_id).toBe("world");
  expect(f.onData).not.toHaveBeenCalled();
  expect(JSON.stringify(f.onDiagnostic.mock.calls)).not.toMatch(
    /private-token|private-rtc-token/,
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

it("rejects a concurrent opening before configure and allows one after closing", async () => {
  const f = setup();
  const configured = f.replies.configure({});
  delete f.replies.configure;
  const first = f.start();
  await advanceTime(1);
  expect(f.sent()).toEqual(["configure"]);
  expect(first.state).toBe("opening");

  const g = setup();
  const blocked = g.start();
  await expect(blocked.ready).rejects.toMatchObject({ code: "busy" });
  await blocked.close();
  expect(g.open).not.toHaveBeenCalled();
  expect(g.send).not.toHaveBeenCalled();
  expect(g.engine.createTravel).not.toHaveBeenCalled();
  expect(f.travel.end).not.toHaveBeenCalled();

  // Restore the first opening's player factory after preparing the other mock.
  (HappyOysterEngine as unknown as jest.Mock).mockImplementation(
    () => f.engine,
  );
  f.receive(configured);
  await first.ready;
  expect(first.state).toBe("live");
  await first.close();

  const h = setup();
  const next = h.start();
  await next.ready;
  await next.close();
});

it("holds the playback lease through both player and control cleanup", async () => {
  const f = setup();
  const first = f.start();
  await first.ready;
  const end = deferred<undefined>();
  f.travel.end.mockReturnValue(end.promise);
  delete f.replies.travel_ended;
  const closing = first.close();
  await advanceTime(1);

  const g = setup();
  const duringPlayerCleanup = g.start();
  await expect(duringPlayerCleanup.ready).rejects.toMatchObject({
    code: "busy",
  });
  await duringPlayerCleanup.close();
  expect(g.send).not.toHaveBeenCalled();

  end.resolve(undefined);
  await advanceTime(1);
  expect(f.sent()).toContain("travel_ended");
  const h = setup();
  const duringControlCleanup = h.start();
  await expect(duringControlCleanup.ready).rejects.toMatchObject({
    code: "busy",
  });
  await duringControlCleanup.close();
  expect(h.send).not.toHaveBeenCalled();

  f.receive({ type: "travel_released", encrypted_travel_id: "travel" });
  await closing;
  const i = setup();
  const next = i.start();
  await next.ready;
  await next.close();
  expect(jest.getTimerCount()).toBe(0);
});

it.each(["resolve", "reject"] as const)(
  "keeps a timed-out player cleanup quarantined until its actual end settles (%s)",
  async (outcome) => {
    const f = setup();
    const first = f.start();
    await first.ready;
    const end = deferred<undefined>();
    f.travel.end.mockReturnValue(end.promise);
    const closing = first.close();
    await advanceTime(5_000);
    await closing;
    expect(first.state).toBe("closed");
    expect(f.controlCleanup).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);

    // The public close is bounded, but the old player can still affect RTC.
    await advanceTime(300_000);
    const g = setup();
    const blocked = g.start();
    await expect(blocked.ready).rejects.toMatchObject({ code: "busy" });
    await blocked.close();
    expect(g.open).not.toHaveBeenCalled();
    expect(g.engine.createTravel).not.toHaveBeenCalled();

    if (outcome === "resolve") end.resolve(undefined);
    else end.reject(new Error("Late partner cleanup failure."));
    await advanceTime(1);
    const h = setup();
    const next = h.start();
    await next.ready;
    await next.close();
    expect(f.travel.end).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
  },
);

it("releases the playback lease after failed setup", async () => {
  const f = setup();
  f.replies.configure = () => ({
    type: "error",
    code: "CONFIGURE_FAILED",
    message: "Configuration failed.",
  });
  const failed = f.start();
  await expect(failed.ready).rejects.toMatchObject({
    code: "CONFIGURE_FAILED",
  });
  await failed.close();

  const g = setup();
  const next = g.start();
  await next.ready;
  await next.close();
  expect(jest.getTimerCount()).toBe(0);
});

it("forwards an explicit mode and rejects a world of the other mode", async () => {
  const f = setup("directing");
  const handle = f.start({ mode: "directing", maxExperienceTimeSec: 90 });
  await handle.ready;
  expect(f.run.mock.calls[0][1]).toEqual(
    expect.objectContaining({
      input: { encrypted_world_id: "world", mode: "directing" },
    }),
  );
  expect(f.send.mock.calls[0][0]).toEqual({
    type: "configure",
    encrypted_world_id: "world",
    mode: "directing",
    max_experience_time_sec: 90,
  });
  expect(f.engine.createTravel).toHaveBeenCalledWith(
    expect.objectContaining({ maxExperienceTimeSec: 90 }),
  );
  await handle.close();

  const g = setup("directing");
  const mismatched = g.start({ mode: "adventure" });
  await expect(mismatched.ready).rejects.toThrow(
    "invalid session configuration",
  );
  expect(g.engine.createTravel).not.toHaveBeenCalled();
  await mismatched.close();
});

it("holds Adventure commands until they are replaced or released", async () => {
  const f = setup();
  const handle = f.start();
  const { session } = await handle.ready;
  await session.command({ translation: "Front" });
  expect(f.travel.sendCommand).toHaveBeenLastCalledWith({
    translation: "Front",
    rotation: "None",
    interaction: "None",
  });
  await advanceTime(160);
  expect(f.travel.sendCommand.mock.calls.length).toBeGreaterThanOrEqual(4);
  await session.command({});
  const calls = f.travel.sendCommand.mock.calls.length;
  expect(f.travel.sendCommand).toHaveBeenLastCalledWith({
    translation: "None",
    rotation: "None",
    interaction: "None",
  });
  await advanceTime(500);
  expect(f.travel.sendCommand).toHaveBeenCalledTimes(calls);
  await expect(session.command({ translation: "Up" as never })).rejects.toThrow(
    "Unknown Happy Oyster command.",
  );
  expect(session.can("instruct")).toBe(false);
  await expect(session.instruct("Rain")).rejects.toThrow("unavailable");
  f.travel.can.mockReturnValue(false);
  // Releasing is always safe; holding needs a running Adventure travel.
  await session.command({});
  await expect(session.command({ rotation: "Mouse_Left" })).rejects.toThrow(
    "unavailable",
  );
  await handle.close();
  expect(session.can("command")).toBe(false);
  expect(jest.getTimerCount()).toBe(0);
});

it("stops re-sending a held command once the travel cannot take it", async () => {
  const f = setup();
  const handle = f.start();
  const { session } = await handle.ready;
  await session.command({ interaction: "Sprint" });
  f.travel.can.mockReturnValue(false);
  await advanceTime(60);
  const calls = f.travel.sendCommand.mock.calls.length;
  await advanceTime(500);
  expect(f.travel.sendCommand).toHaveBeenCalledTimes(calls);
  await handle.close();
});

it("sends Directing instructions through the moderated fal endpoint", async () => {
  const f = setup("directing");
  const handle = f.start();
  const { session } = await handle.ready;
  expect(session.can("command")).toBe(false);
  await expect(session.instruct("Rain")).resolves.toEqual({ accepted: true });
  expect(f.send).toHaveBeenLastCalledWith({
    type: "travel_request",
    operation: "instruct",
    content: "Rain",
  });
  expect(f.travel.sendInstruct).not.toHaveBeenCalled();
  await session.pause();
  await session.resume();
  await session.rewind(5);
  expect(f.travel.rewind).toHaveBeenCalledWith({ rewindToSec: 5 });
  await expect(session.rewind(-1)).rejects.toThrow("nonnegative");
  await expect(session.instruct(" ")).rejects.toThrow("1–2000");
  f.replies.travel_request = () => ({
    type: "error",
    code: "TRAVEL_REQUEST_REJECTED",
    message: "Content policy violation.",
  });
  const rejected = session.instruct("Rain again");
  await expect(rejected).rejects.toThrow("Content policy violation.");
  await expect(rejected).rejects.toMatchObject({
    code: "TRAVEL_REQUEST_REJECTED",
  });
  await handle.close();
});

it("never installs or renews an HTTP token", async () => {
  const f = setup();
  const handle = f.start();
  await handle.ready;
  await advanceTime(240_000);
  expect(f.engine.updateToken).not.toHaveBeenCalled();
  expect(f.sent()).not.toContain("refresh_token");
  expect(HappyOysterEngine).toHaveBeenCalledWith(
    expect.not.objectContaining({ token: expect.anything() }),
  );
  await handle.close();
});

it("routes SDK HTTP operations through the active WMA connection", async () => {
  const f = setup("directing");
  const handle = f.start();
  await handle.ready;
  const backend = f.engine.backendService;
  await expect(
    backend.get("/openapi/v1/travels/status?encryptedTravelId=travel"),
  ).resolves.toMatchObject({ rtcStatus: "STREAMING" });
  await backend.post("/openapi/v1/travels/pause", {
    encryptedTravelId: "travel",
  });
  await backend.post("/openapi/v1/travels/resume", {
    encryptedTravelId: "travel",
  });
  await backend.post("/openapi/v1/travels/rewind", {
    encryptedTravelId: "travel",
    rewindToSec: 4,
  });
  await f.engine.ensureSdkFeatureEnabled();
  expect(f.send).toHaveBeenCalledWith({
    type: "travel_request",
    operation: "rewind",
    rewind_to_sec: 4,
  });
  expect(f.send).toHaveBeenCalledWith({
    type: "travel_request",
    operation: "feature_gate",
  });
  await handle.close();
  await expect(
    backend.get("/openapi/v1/travels/status?encryptedTravelId=travel"),
  ).rejects.toThrow("closed");
});

it("waits through stale PAUSED status after resume without changing provider data", async () => {
  const f = setup("directing");
  const handle = f.start();
  await handle.ready;
  const backend = f.engine.backendService;
  await backend.post("/openapi/v1/travels/resume", {
    encryptedTravelId: "travel",
  });
  let rtcStatus = "PAUSED";
  f.replies.travel_request = () => ({
    type: "travel_response",
    data: { status: "running", rtc_status: rtcStatus },
  });
  const resolved = jest.fn();
  const pending = backend
    .get("/openapi/v1/travels/status?encryptedTravelId=travel")
    .then(resolved);
  await advanceTime(500);
  expect(resolved).not.toHaveBeenCalled();
  rtcStatus = "STREAMING";
  await advanceTime(500);
  await pending;
  expect(resolved).toHaveBeenCalledWith({
    status: "running",
    rtcStatus: "STREAMING",
  });
  // A later real pause is never hidden by the old resume transition.
  rtcStatus = "PAUSED";
  await expect(
    backend.get("/openapi/v1/travels/status?encryptedTravelId=travel"),
  ).resolves.toMatchObject({ rtcStatus: "PAUSED" });
  await handle.close();
});

it("bounds the resume transition and immediately preserves terminal status", async () => {
  const f = setup("directing");
  const handle = f.start();
  await handle.ready;
  const backend = f.engine.backendService;
  await backend.post("/openapi/v1/travels/resume", {
    encryptedTravelId: "travel",
  });
  f.replies.travel_request = () => ({
    type: "travel_response",
    data: { status: "running", rtc_status: "PAUSED" },
  });
  const pending = backend.get(
    "/openapi/v1/travels/status?encryptedTravelId=travel",
  );
  await advanceTime(15_000);
  await expect(pending).resolves.toMatchObject({ rtcStatus: "PAUSED" });
  await backend.post("/openapi/v1/travels/resume", {
    encryptedTravelId: "travel",
  });
  f.replies.travel_request = () => ({
    type: "travel_response",
    data: { status: "completed", rtc_status: "PAUSED" },
  });
  await expect(
    backend.get("/openapi/v1/travels/status?encryptedTravelId=travel"),
  ).resolves.toMatchObject({ status: "completed" });
  await handle.close();
});

it("cancels a pending resume status wait when the session closes", async () => {
  const f = setup("directing");
  const handle = f.start();
  await handle.ready;
  const backend = f.engine.backendService;
  await backend.post("/openapi/v1/travels/resume", {
    encryptedTravelId: "travel",
  });
  f.replies.travel_request = () => ({
    type: "travel_response",
    data: { status: "running", rtc_status: "PAUSED" },
  });
  const pending = backend.get(
    "/openapi/v1/travels/status?encryptedTravelId=travel",
  );
  const rejected = expect(pending).rejects.toThrow("closed");
  await advanceTime(0);
  await handle.close();
  await rejected;
});

it("rejects unexpected vendor routes and other travel identities", async () => {
  const f = setup();
  const handle = f.start();
  await handle.ready;
  const backend = f.engine.backendService;
  const count = f.send.mock.calls.length;
  await expect(
    backend.get("/openapi/v1/travels/status?encryptedTravelId=other"),
  ).rejects.toThrow("Unsupported");
  await expect(
    backend.get(
      "https://attacker.test/openapi/v1/travels/status?encryptedTravelId=travel",
    ),
  ).rejects.toThrow("Unsupported");
  await expect(
    backend.post("/api/v1/services/aigc/text-generation/generation", {
      encryptedTravelId: "travel",
      model: "qwen-turbo",
    }),
  ).rejects.toThrow("Unsupported");
  await expect(
    backend.post("/openapi/v1/travels/resume", { encryptedTravelId: "other" }),
  ).rejects.toThrow("Unsupported");
  expect(f.send.mock.calls.length).toBe(count);
  await handle.close();
});

it("honors the provider SDK feature gate through fal", async () => {
  const f = setup();
  const handle = f.start();
  await handle.ready;
  f.replies.travel_request = () => ({
    type: "travel_response",
    data: { enabled: false },
  });
  await expect(f.engine.ensureSdkFeatureEnabled()).rejects.toThrow(
    "disabled by the provider",
  );
  await handle.close();
});

it("waits for the matching bind acknowledgement before reporting live", async () => {
  const f = setup();
  delete f.replies.bind_travel;
  const handle = f.start();
  await advanceTime(1);
  f.receive({ type: "travel_bound", encrypted_travel_id: "wrong-travel" });
  expect(handle.state).toBe("opening");
  f.receive({ type: "travel_bound", encrypted_travel_id: "travel" });
  await handle.ready;
  await handle.close();
});

it("acknowledges the runner travel before playback can start or fail", async () => {
  const f = setup();
  const gate = deferred<{ encryptedTravelId: string; mode: number }>();
  f.travel.start.mockReturnValue(gate.promise);
  const handle = f.start();
  await advanceTime(1);
  expect(f.sent()).toEqual(["configure", "bind_travel"]);
  gate.resolve({ encryptedTravelId: "travel", mode: 1 });
  await handle.ready;
  expect(f.sent().filter((type) => type === "bind_travel")).toHaveLength(1);
  await handle.close();
});

it("joins the existing travel once without exchanging a browser ticket", async () => {
  const f = setup();
  const originalEntry = f.engine.backendService.startTravel;
  const handle = f.start();
  await handle.ready;
  const entry = f.engine.backendService.startTravel;
  await expect(entry("wrong")).rejects.toMatchObject({ code: "invalid" });
  await expect(entry("travel")).resolves.toMatchObject({
    encryptedTravelId: "travel",
    encryptedWorldId: "world",
    mode: 1,
    rtcConfig: { channelId: "channel", token: "private-rtc-token" },
  });
  await expect(entry("travel")).rejects.toMatchObject({ code: "invalid" });
  expect(originalEntry).not.toHaveBeenCalled();
  expect(f.sent()).toEqual(["configure", "bind_travel"]);
  await handle.close();
  expect(f.off).toHaveBeenCalledTimes(3);
});

it("reports a rejected configure with the app's code and message", async () => {
  const f = setup();
  f.replies.configure = () => ({
    type: "error",
    code: "CONFIGURE_REJECTED",
    message: "Happy Oyster: World is not ready to enter (code 403002)",
    retryable: false,
  });
  const handle = f.start();
  await expect(handle.ready).rejects.toMatchObject({
    name: "HappyOysterError",
    code: "CONFIGURE_REJECTED",
    message: "Happy Oyster: World is not ready to enter (code 403002)",
  });
  expect(f.onError.mock.calls[0][0]).toBeInstanceOf(HappyOysterError);
  await handle.close();
  expect(HappyOysterEngine).not.toHaveBeenCalled();
  expect(f.controlCleanup).toHaveBeenCalledTimes(1);
});

it("cleans up on a rejected bind and never retries that mutation", async () => {
  const f = setup();
  f.replies.bind_travel = () => ({
    type: "error",
    code: "BIND_CONFLICT",
    message: "this WMA session is already bound to another travel",
  });
  const handle = f.start();
  await expect(handle.ready).rejects.toMatchObject({ code: "BIND_CONFLICT" });
  await handle.close();
  expect(f.travel.end).toHaveBeenCalledTimes(1);
  expect(f.sent().filter((type) => type === "bind_travel")).toHaveLength(1);
  expect(f.sent()).not.toContain("travel_ended");
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
  expect(f.sent()).toEqual(["configure", "bind_travel", "travel_ended"]);
  expect(f.send).toHaveBeenLastCalledWith({
    type: "travel_ended",
    encrypted_travel_id: "travel",
    completed: false,
  });
  expect(jest.getTimerCount()).toBe(0);
});

it("does not connect or configure after cancelling world polling", async () => {
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

it("waits for a generating world, then fails a failed build", async () => {
  const f = setup();
  f.run
    .mockResolvedValueOnce({
      data: { ...world, status: "generating" },
      requestId: "request",
    })
    .mockResolvedValueOnce({
      data: { ...world, status: "failed" },
      requestId: "request",
    });
  const handle = f.start();
  await advanceTime(2_000);
  await expect(handle.ready).rejects.toMatchObject({ code: "world_failed" });
  expect(f.run).toHaveBeenCalledTimes(2);
  expect(f.open).not.toHaveBeenCalled();
});

it("keeps fal status and the app's 4xx message without raw errors", async () => {
  const f = setup();
  f.run.mockRejectedValueOnce(
    Object.assign(new Error("private-token"), {
      status: 403,
      body: { detail: "Happy Oyster isn't enabled for this account." },
    }),
  );
  const handle = f.start();
  await expect(handle.ready).rejects.toMatchObject({
    code: "http",
    status: 403,
    message: "Happy Oyster isn't enabled for this account.",
  });
  const g = setup();
  g.run.mockRejectedValueOnce(
    Object.assign(new Error("private-token"), { status: 500, body: {} }),
  );
  const failed = g.start();
  await expect(failed.ready).rejects.toThrow(
    "Happy Oyster /worlds/build-status failed.",
  );
  expect(String(g.onError.mock.calls[0][0])).not.toContain("private-token");
});

it("bounds a control connection that never opens", async () => {
  const f = setup();
  f.open.mockReturnValue(new Promise(() => undefined));
  const handle = f.start({ connectTimeoutMs: 1_000 });
  await advanceTime(1_001);
  await expect(handle.ready).rejects.toThrow("timed out");
  expect(f.send).not.toHaveBeenCalled();
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

it("settles a timed-out binding before disconnect cleanup completes", async () => {
  const f = setup();
  delete f.replies.bind_travel;
  const handle = f.start({ controlTimeoutMs: 20 });
  await advanceTime(21);
  await expect(handle.ready).rejects.toThrow("control request timed out");
  await handle.close();
  expect(handle.state).toBe("failed");
  expect(f.travel.end).toHaveBeenCalledTimes(1);
  expect(f.sent()).toEqual(["configure", "bind_travel"]);
  expect(f.controlCleanup).toHaveBeenCalledTimes(1);
  expect(jest.getTimerCount()).toBe(0);
});

it("reports natural completion as closed and releases the bound travel", async () => {
  const f = setup();
  const handle = f.start();
  const { session } = await handle.ready;
  f.callbacks.statusChanged("running" as never);
  expect(session.travelStatus).toBe("running");
  f.callbacks.statusChanged("completed" as never);
  await handle.close();
  expect(handle.state).toBe("closed");
  expect(f.onTravelStatus.mock.calls.map(([status]) => status)).toEqual([
    "running",
    "completed",
  ]);
  expect(f.send).toHaveBeenLastCalledWith(
    expect.objectContaining({ type: "travel_ended", completed: true }),
  );
});

it("derives all HTTP and control routes from a private deployment root", async () => {
  const f = setup("directing");
  const handle = f.start({ endpointId: "owner/preview" });
  const { session } = await handle.ready;
  await session.instruct("Rain");
  expect(f.open.mock.calls[0][0].endpointId).toBe("owner/preview");
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
  const end = deferred<undefined>();
  f.travel.end.mockReturnValue(end.promise);
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
  end.resolve(undefined);
  await advanceTime(1);
});

it("contains synchronous failures while repeating a held command", async () => {
  const f = setup();
  const handle = f.start();
  const { session } = await handle.ready;
  await session.command({ translation: "Front" });
  f.travel.sendCommand.mockImplementation(() => {
    throw new Error("private-token");
  });
  await expect(advanceTime(100)).resolves.toBeUndefined();
  expect(f.travel.sendCommand).toHaveBeenCalledTimes(3);
  await handle.close();
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

it("publishes the message names it exchanges", async () => {
  const f = setup();
  const handle = f.start();
  await handle.ready;
  await handle.close();
  const types = new Set(f.sent());
  expect(
    HAPPY_OYSTER_MESSAGES.client.filter((type) => !types.has(type)),
  ).toEqual(["travel_request"]);
  expect(HAPPY_OYSTER_MESSAGES.server).toEqual(
    expect.arrayContaining(["configured", "travel_bound", "travel_released"]),
  );
});
