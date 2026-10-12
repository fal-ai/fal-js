const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { createRequire } = require("node:module");
const repo = path.resolve(__dirname, "..");
const output = fs.mkdtempSync(
  path.join(require("node:os").tmpdir(), "happy-oyster-sdk-"),
);
const req = createRequire(path.join(repo, "package.json"));
const esbuild = req("esbuild");
const { JSDOM } = req("jsdom");

(async () => {
  const dom = new JSDOM("<video></video>", { url: "http://localhost/" });
  for (const key of [
    "window",
    "document",
    "navigator",
    "HTMLVideoElement",
    "HTMLElement",
    "location",
  ])
    Object.defineProperty(global, key, {
      configurable: true,
      value: dom.window[key],
    });
  global.self = global.window;
  const requested = [];
  global.fetch = async (url) => {
    requested.push(String(url));
    throw new Error("Network disabled in contract check");
  };
  const sourceDir = path.join(repo, "libs/client/src");
  await esbuild.build({
    stdin: {
      contents:
        fs.readFileSync(path.join(sourceDir, "happy-oyster.ts"), "utf8") +
        "\nexport { configureSdkTravel };",
      loader: "ts",
      resolveDir: sourceDir,
    },
    bundle: true,
    platform: "node",
    format: "cjs",
    external: ["@happy-oyster/js-sdk"],
    outfile: path.join(output, "adapter.cjs"),
    logLevel: "silent",
  });
  await esbuild.build({
    entryPoints: [
      path.join(repo, "node_modules/@happy-oyster/js-sdk/lib/index.js"),
    ],
    bundle: true,
    platform: "browser",
    format: "cjs",
    mainFields: ["module", "main"],
    outfile: path.join(output, "vendor.cjs"),
    logLevel: "silent",
  });
  const { configureSdkTravel } = require(path.join(output, "adapter.cjs"));
  const { HappyOysterEngine } = require(path.join(output, "vendor.cjs"));
  const fixtures = [
    {
      type: "configured",
      api_host: "partner.example",
      model: "happyoyster-1.0-adventure",
      world: {
        encrypted_world_id: "enc_1",
        status: "ready",
        first_frame: null,
        name: "World",
        mode: "adventure",
      },
      travel: {
        encrypted_travel_id: "travel-1",
        encrypted_world_id: "enc_1",
        mode: 1,
        creation_model: "simple",
        first_frame: null,
        rtc_config: {
          channel_id: "channel",
          user_id: "user",
          app_id: "app",
          token: "rtc-token",
          nonce: null,
          role: null,
          username: null,
          timestamp: null,
          expire_at: null,
        },
        bgm_url: null,
        version: "wanderV2",
        no_stream_auto_end_timeout_sec: 30,
        max_experience_time_sec: 60,
      },
      control_protocol: "fal-session-v1",
    },
    {
      type: "configured",
      api_host: "partner.example",
      model: "happyoyster-1.0-directing",
      world: {
        encrypted_world_id: "enc_1",
        status: "ready",
        first_frame: null,
        name: "World",
        mode: "directing",
      },
      travel: {
        encrypted_travel_id: "travel-1",
        encrypted_world_id: "enc_1",
        mode: 2,
        creation_model: "simple",
        first_frame: null,
        rtc_config: {
          channel_id: "channel",
          user_id: "user",
          app_id: "app",
          token: "rtc-token",
          nonce: null,
          role: null,
          username: null,
          timestamp: null,
          expire_at: null,
        },
        bgm_url: null,
        version: "storyV2",
        no_stream_auto_end_timeout_sec: 30,
        max_experience_time_sec: null,
      },
      control_protocol: "fal-session-v1",
    },
  ];
  const results = [];
  for (const configured of fixtures) {
    const engine = new HappyOysterEngine({
      APIHost: configured.api_host,
      logLevel: "none",
    });
    const original = engine.backendService.startTravel;
    const operations = [];
    configureSdkTravel(
      engine,
      configured,
      async (operation, input) => {
        operations.push({ operation, input });
        return {
          enabled: true,
          status: "running",
          rtcStatus: "STREAMING",
          accepted: true,
          resumedAtSec: 4,
        };
      },
      new AbortController().signal,
    );
    assert.equal(engine.backendService.getAccessToken(), null);
    assert.notEqual(engine.backendService.startTravel, original);
    const player = engine.createTravel({
      ticket: configured.travel.encrypted_travel_id,
      videoElement: document.querySelector("video"),
    });
    // Exercise the real vendor Travel.start pipeline; only media waiters/network are simulated.
    const waiter = () => ({
      promise: Promise.resolve(),
      cancel() {},
      checkNow() {},
    });
    let connected;
    player.rtcSession.connect = async (rtc, mode) => {
      connected = { rtc, mode };
    };
    player.rtcSession.createRemoteUserWaiter = waiter;
    player.backendStatusController.startPolling = () => {};
    player.noStreamAutoEndGuard.create = waiter;
    player.videoPlayback.createReadyWaiter = waiter;
    player.dataChannelReadyGuard.start = () => {};
    const started = await player.start();
    assert.equal(
      started.encryptedTravelId,
      configured.travel.encrypted_travel_id,
    );
    assert.equal(started.mode, configured.travel.mode);
    assert.equal(
      connected.rtc.channelId,
      configured.travel.rtc_config.channel_id,
    );
    assert.equal(connected.rtc.token, configured.travel.rtc_config.token);
    assert.equal(connected.mode, configured.travel.mode);
    await assert.rejects(
      engine.backendService.startTravel(configured.travel.encrypted_travel_id),
    );
    await engine.backendService.getTravelStatus(started.encryptedTravelId);
    await engine.backendService.sendBackendRequest("pause", {
      body: { encryptedTravelId: started.encryptedTravelId },
    });
    await engine.backendService.sendBackendRequest("resume", {
      body: { encryptedTravelId: started.encryptedTravelId },
    });
    await engine.backendService.rewindTravel({
      encryptedTravelId: started.encryptedTravelId,
      rewindToSec: 4,
    });
    await engine.backendService.sendInstruct({
      encryptedTravelId: started.encryptedTravelId,
      content: "Rain",
    });
    await engine.backendService.sendBackendRequest("end", {
      body: { encryptedTravelId: started.encryptedTravelId },
    });
    assert.deepEqual(
      operations.map((x) => x.operation),
      [
        "feature_gate",
        "status",
        "pause",
        "resume",
        "rewind",
        "instruct",
        "end",
      ],
    );
    assert.equal(engine.backendService.getAccessToken(), null);
    results.push({
      mode: configured.world.mode,
      start: "passed",
      oneUse: "passed",
      rtcSnapshot: "passed",
    });
  }
  assert.equal(
    requested.filter(
      (url) => url.includes("/api/v2/") || url.includes("/openapi/"),
    ).length,
    0,
  );
  const evidence = {
    sdkVersion: "0.1.4",
    realVendorTravelStart: true,
    mediaSimulated: true,
    paidCalls: 0,
    browserEntryRequests: 0,
    results,
  };
  fs.rmSync(output, { recursive: true, force: true });
  console.log(JSON.stringify(evidence));
  dom.window.close();
  process.exit(0);
})().catch((error) => {
  console.error(error.stack);
  process.exit(1);
});
