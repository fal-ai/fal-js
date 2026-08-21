import { decode, encode } from "@msgpack/msgpack";
import { fakeExtensionContext } from "./testing";
import { websocket } from "./websocket";

/** A socket that opens only when a test says so, which is the whole point of the extension. */
class FakeWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  static last: FakeWebSocket | undefined;

  readyState = FakeWebSocket.CONNECTING;
  sent: Array<Uint8Array | string> = [];
  closedWith: number | undefined;

  onopen: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: ((event: { code: number; reason: string }) => void) | null = null;
  onmessage: ((event: { data: unknown }) => void) | null = null;

  constructor(readonly url: string) {
    FakeWebSocket.last = this;
  }

  open() {
    this.readyState = FakeWebSocket.OPEN;
    this.onopen?.();
  }

  receive(payload: unknown) {
    this.onmessage?.({ data: encode(payload) });
  }

  serverClose(code: number, reason = "") {
    this.readyState = FakeWebSocket.CLOSED;
    this.onclose?.({ code, reason });
  }

  send(frame: Uint8Array | string) {
    this.sent.push(frame);
  }

  close(code?: number) {
    this.closedWith = code;
    this.readyState = FakeWebSocket.CLOSED;
  }
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("websocket", () => {
  const original = global.WebSocket;

  beforeEach(() => {
    FakeWebSocket.last = undefined;
    global.WebSocket = FakeWebSocket as never;
  });

  afterEach(() => {
    global.WebSocket = original;
    jest.restoreAllMocks();
  });

  const tokenProvider = jest.fn(async () => "a-token");

  function start(overrides: Record<string, unknown> = {}) {
    const context = fakeExtensionContext({ endpointId: "fal-ai/fast-sdxl" });
    const onResult = jest.fn();
    const session = websocket().open(context, {
      tokenProvider,
      onResult,
      ...overrides,
    });
    // Swallowed so a rejection in a test that expects one does not trip the runner first.
    session.catch(() => undefined);
    return { context, onResult, session };
  }

  it("does not resolve until the socket is open", async () => {
    const { session } = start();
    await flush();

    let settled = false;
    void session.then(() => (settled = true));
    await flush();
    // The difference from connect(), which hands back a sendable object immediately and buffers.
    expect(settled).toBe(false);

    FakeWebSocket.last?.open();
    await expect(session).resolves.toMatchObject({
      send: expect.any(Function),
    });
  });

  it("rejects a handshake that fails instead of buffering into a dead socket", async () => {
    const { session } = start();
    await flush();
    FakeWebSocket.last?.onerror?.();

    await expect(session).rejects.toThrow(
      /Could not open a realtime connection/,
    );
  });

  it("reports a handshake the server closes rather than errors", async () => {
    const { session } = start();
    await flush();
    FakeWebSocket.last?.serverClose(1008, "policy violation");

    await expect(session).rejects.toThrow(/policy violation/);
  });

  it("mints the token for the realtime path and carries it in the url", async () => {
    const { session } = start();
    await flush();
    FakeWebSocket.last?.open();
    await session;

    expect(tokenProvider).toHaveBeenCalledWith("fal-ai/fast-sdxl/realtime");
    const url = new URL(FakeWebSocket.last?.url ?? "");
    expect(url.protocol).toBe("wss:");
    expect(url.pathname).toBe("/fal-ai/fast-sdxl/realtime");
    expect(url.searchParams.get("fal_jwt_token")).toBe("a-token");
  });

  it("delivers decoded results and drops what is not one", async () => {
    const { session, onResult } = start();
    await flush();
    const ws = FakeWebSocket.last!;
    ws.open();
    await session;

    ws.receive({ request_id: "r1", images: [] });
    ws.receive({ type: "x-fal-message", message: "queued" });
    ws.receive({ type: "x-fal-error", error: "TIMEOUT", reason: "idle" });
    await flush();

    expect(onResult).toHaveBeenCalledTimes(1);
    expect(onResult).toHaveBeenCalledWith({ request_id: "r1", images: [] });
  });

  it("fails the session when the server rejects the token", async () => {
    const fail = jest.fn(async () => undefined);
    const context = fakeExtensionContext({
      endpointId: "fal-ai/fast-sdxl",
      fail,
    });
    const session = websocket().open(context, {
      tokenProvider,
      onResult: jest.fn(),
    });
    await flush();
    const ws = FakeWebSocket.last!;
    ws.open();
    await session;

    ws.receive({ status: "error", error: "Unauthorized" });
    await flush();

    // connect() would reconnect on the next send; here the caller can see it died.
    expect(fail).toHaveBeenCalledWith("realtime connection is unauthorized");
  });

  it("separates a clean close from a transport that died", async () => {
    for (const [code, expected] of [
      [1000, "close"],
      [1006, "fail"],
    ] as const) {
      const close = jest.fn(async () => undefined);
      const fail = jest.fn(async () => undefined);
      const context = fakeExtensionContext({ close, fail });
      const session = websocket().open(context, {
        tokenProvider,
        onResult: jest.fn(),
      });
      await flush();
      const ws = FakeWebSocket.last!;
      ws.open();
      await session;

      ws.serverClose(code);
      expect(close).toHaveBeenCalledTimes(expected === "close" ? 1 : 0);
      expect(fail).toHaveBeenCalledTimes(expected === "fail" ? 1 : 0);
    }
  });

  it("sends the first input immediately, and nothing once the socket is gone", async () => {
    // Short enough that the trailing call below lands inside the test rather than after it.
    const { session } = start({ throttleInterval: 10 });
    await flush();
    const ws = FakeWebSocket.last!;
    ws.open();
    const live = await session;

    live.send({ prompt: "a cat" });
    // Leading edge: a realtime app's first keystroke must not wait out the interval.
    expect(ws.sent).toHaveLength(1);
    expect(decode(ws.sent[0] as Uint8Array)).toEqual({ prompt: "a cat" });

    ws.serverClose(1006);
    live.send({ prompt: "a dog" });
    // Deferred by the throttle, and still dropped when it fires: a trailing call cannot resurrect a
    // socket the transport has already given up on.
    await new Promise((resolve) => setTimeout(resolve, 40));
    expect(ws.sent).toHaveLength(1);
  });

  it("stops opening when the caller aborts", async () => {
    const controller = new AbortController();
    const context = fakeExtensionContext({ signal: controller.signal });
    const session = websocket().open(context, {
      tokenProvider,
      onResult: jest.fn(),
    });
    await flush();
    controller.abort(new Error("caller went away"));

    await expect(session).rejects.toThrow("caller went away");
  });

  it("stops opening when token acquisition is still pending", async () => {
    const controller = new AbortController();
    const context = fakeExtensionContext({ signal: controller.signal });
    const pendingToken = jest.fn(() => new Promise<string>(() => undefined));
    const session = websocket().open(context, {
      tokenProvider: pendingToken,
      onResult: jest.fn(),
    });
    const reason = new Error("caller left during auth");

    controller.abort(reason);

    await expect(session).rejects.toBe(reason);
    expect(FakeWebSocket.last).toBeUndefined();
  });

  it("claims no endpoints, and opens the one it was given", () => {
    expect(websocket("fal-ai/fast-sdxl").supports).toBeUndefined();
    expect(websocket("fal-ai/fast-sdxl").defaultEndpoint).toBe(
      "fal-ai/fast-sdxl",
    );
  });
});
