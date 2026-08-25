import { decode, encode } from "@msgpack/msgpack";
import { createConfig, type RequiredConfig } from "./config";
import { createRealtimeClient } from "./realtime";

jest.mock("./auth", () => {
  const actual = jest.requireActual("./auth");
  return {
    ...actual,
    getTemporaryAuthToken: jest.fn().mockResolvedValue("mock-token"),
  };
});

import { getTemporaryAuthToken } from "./auth";

class MockWebSocket {
  public readonly url: string;
  public onopen?: () => void;
  public onclose?: (event: any) => void;
  public onerror?: (event: any) => void;
  public onmessage?: (event: any) => void;
  public readyState = MockWebSocket.CONNECTING;
  public readonly send = jest.fn();
  public readonly close = jest.fn();

  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSED = 3;

  constructor(url: string) {
    this.url = url;
  }

  triggerOpen() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.();
  }
}

describe("createRealtimeClient", () => {
  let config: RequiredConfig;
  const sockets: MockWebSocket[] = [];
  let connectionId = 0;
  const WebSocketMock = jest.fn().mockImplementation((url: string) => {
    const socket = new MockWebSocket(url);
    sockets.push(socket);
    return socket;
  });

  beforeAll(() => {
    // minimal fetch stub to satisfy createConfig
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    global.fetch = jest.fn(() => {}) as any;
  });

  beforeEach(() => {
    connectionId += 1;
    // Don't fake queueMicrotask — the realtime client uses it to defer
    // state machine sends onto a clean call stack, and it needs to execute
    // naturally via await Promise.resolve() in tests.
    jest.useFakeTimers({ doNotFake: ["queueMicrotask"] });
    sockets.length = 0;
    WebSocketMock.mockClear();
    (getTemporaryAuthToken as jest.Mock).mockClear();
    // Suppress console.warn for deprecation warnings during tests
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, "warn").mockImplementation(() => {});
    // Provide a minimal crypto polyfill for randomUUID used by the client
    (global as any).crypto = {
      randomUUID: () => "00000000-0000-0000-0000-000000000000",
    };
    // @ts-expect-error override global
    global.WebSocket = WebSocketMock;
    config = createConfig({
      credentials: "test-key",
      fetch: global.fetch as any,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("uses the provided path when opening the websocket", async () => {
    const client = createRealtimeClient({ config });
    const connection = client.connect("123-myapp", {
      connectionKey: `test-conn-${connectionId}`,
      clientOnly: false,
      throttleInterval: 0,
      path: "/custom/path",
      onResult: jest.fn(),
      onError: jest.fn(),
    });

    // trigger connection establishment
    connection.send({ foo: "bar" });
    // let the auth token promise resolve and state machine proceed
    await Promise.resolve();
    await Promise.resolve();
    expect(getTemporaryAuthToken).toHaveBeenCalledTimes(1);

    expect(WebSocketMock).toHaveBeenCalledTimes(1);
    const socket = sockets[0];
    expect(socket.url).toBe(
      "wss://fal.run/123/myapp/custom/path?fal_jwt_token=mock-token",
    );
  });

  it("evicts a closed connection and ignores its pending authentication", async () => {
    let resolveToken: (token: string) => void = () => undefined;
    const pendingToken = new Promise<string>((resolve) => {
      resolveToken = resolve;
    });
    const tokenProvider = jest.fn(() => pendingToken);
    const client = createRealtimeClient({ config });
    const connectionKey = `test-conn-${connectionId}`;
    const first = client.connect("123-myapp", {
      connectionKey,
      clientOnly: false,
      throttleInterval: 0,
      tokenProvider,
      onResult: jest.fn(),
    });

    first.send({ prompt: "start" });
    await Promise.resolve();
    expect(tokenProvider).toHaveBeenCalledTimes(1);
    first.close();
    resolveToken("too-late");
    await Promise.resolve();
    await Promise.resolve();
    expect(WebSocketMock).not.toHaveBeenCalled();

    const nextTokenProvider = jest.fn().mockResolvedValue("fresh");
    const second = client.connect("123-myapp", {
      connectionKey,
      clientOnly: false,
      throttleInterval: 0,
      tokenProvider: nextTokenProvider,
      onResult: jest.fn(),
    });
    second.send({ prompt: "restart" });
    await Promise.resolve();
    await Promise.resolve();

    expect(nextTokenProvider).toHaveBeenCalledTimes(1);
    expect(WebSocketMock).toHaveBeenCalledTimes(1);
  });

  it("keeps a reused connection live when an older handle closes", async () => {
    const tokenProvider = jest.fn().mockResolvedValue("shared-token");
    const client = createRealtimeClient({ config });
    const connectionKey = `test-conn-${connectionId}`;
    const first = client.connect("123-myapp", {
      connectionKey,
      clientOnly: false,
      throttleInterval: 0,
      tokenProvider,
      onResult: jest.fn(),
    });
    const second = client.connect("123-myapp", {
      connectionKey,
      clientOnly: false,
      throttleInterval: 0,
      tokenProvider,
      onResult: jest.fn(),
    });

    first.close();
    second.send({ prompt: "still live" });
    await Promise.resolve();
    await Promise.resolve();

    expect(tokenProvider).toHaveBeenCalledTimes(1);
    expect(WebSocketMock).toHaveBeenCalledTimes(1);
    second.close();
  });

  it("prevents an older reused handle from sending into the new owner", async () => {
    const tokenProvider = jest.fn().mockResolvedValue("shared-token");
    const client = createRealtimeClient({ config });
    const connectionKey = `test-conn-${connectionId}`;
    const first = client.connect("123-myapp", {
      connectionKey,
      clientOnly: false,
      throttleInterval: 0,
      tokenProvider,
      onResult: jest.fn(),
    });

    const second = client.connect("123-myapp", {
      connectionKey,
      clientOnly: false,
      throttleInterval: 0,
      tokenProvider,
      onResult: jest.fn(),
    });
    first.send({ prompt: "stale" });
    second.send({ prompt: "current" });
    await Promise.resolve();
    await Promise.resolve();

    expect(tokenProvider).toHaveBeenCalledTimes(1);
    expect(sockets).toHaveLength(1);
    const socket = sockets[0];
    socket.triggerOpen();
    await Promise.resolve();

    expect(socket.send).toHaveBeenCalledTimes(1);
    expect(decode(socket.send.mock.calls[0][0])).toEqual({ prompt: "current" });
    second.close();
  });

  it("lets the latest reused handle close despite a discarded older handle", async () => {
    const tokenProvider = jest.fn().mockResolvedValue("shared-token");
    const client = createRealtimeClient({ config });
    const connectionKey = `test-conn-${connectionId}`;
    const first = client.connect("123-myapp", {
      connectionKey,
      clientOnly: false,
      throttleInterval: 0,
      tokenProvider,
      onResult: jest.fn(),
    });
    const second = client.connect("123-myapp", {
      connectionKey,
      clientOnly: false,
      throttleInterval: 0,
      tokenProvider,
      onResult: jest.fn(),
    });

    second.close();
    first.send({ prompt: "must stay closed" });
    await Promise.resolve();
    await Promise.resolve();

    expect(tokenProvider).not.toHaveBeenCalled();
    expect(WebSocketMock).not.toHaveBeenCalled();
  });

  it("delivers a trailing throttled send across a same-key reuse", async () => {
    // A same-key reuse (a React re-render re-calling connect()) is the SAME logical consumer:
    // its pending trailing sends must survive the re-render, or every send scheduled as a
    // trailing timeout is silently dropped under continuous typing — the leading edge fires
    // only once per connection lifetime, so that is effectively every send after the first.
    const tokenProvider = jest.fn().mockResolvedValue("shared-token");
    const client = createRealtimeClient({ config });
    const connectionKey = `test-conn-${connectionId}`;
    const first = client.connect("123-myapp", {
      connectionKey,
      clientOnly: false,
      throttleInterval: 20,
      tokenProvider,
      onResult: jest.fn(),
    });
    first.send({ prompt: "leading" }); // leading edge goes through immediately
    first.send({ prompt: "trailing" }); // scheduled before the re-render

    const second = client.connect("123-myapp", {
      connectionKey,
      clientOnly: false,
      throttleInterval: 20,
      tokenProvider,
      onResult: jest.fn(),
    });
    jest.advanceTimersByTime(25); // the trailing send fires after the reuse
    await Promise.resolve();
    await Promise.resolve();

    expect(sockets).toHaveLength(1);
    const socket = sockets[0];
    socket.triggerOpen();
    await Promise.resolve();

    // Both frames flow: the reuse did not orphan the pending trailing send.
    const sent = socket.send.mock.calls.map((call: unknown[]) =>
      decode(call[0] as Uint8Array),
    );
    expect(sent).toContainEqual({ prompt: "trailing" });
    second.close();
  });

  it("drops a trailing throttled send after an explicit close", async () => {
    // close() disposes the cache entry, and a trailing fire scheduled before it must not revive
    // the connection or deliver through a machine the caller ended.
    const tokenProvider = jest.fn().mockResolvedValue("shared-token");
    const client = createRealtimeClient({ config });
    const connectionKey = `test-conn-${connectionId}`;
    const connection = client.connect("123-myapp", {
      connectionKey,
      clientOnly: false,
      throttleInterval: 20,
      tokenProvider,
      onResult: jest.fn(),
    });
    connection.send({ prompt: "leading" });
    connection.send({ prompt: "trailing after close" });
    connection.close();
    jest.advanceTimersByTime(25);
    await Promise.resolve();
    await Promise.resolve();

    // close() lands before authentication completes: the disposed machine must not mint a
    // socket at all, and the trailing fire must not revive it.
    expect(sockets).toHaveLength(0);
  });

  it("drops a throttled send that was pending when the connection closed", async () => {
    const tokenProvider = jest.fn(() => new Promise<string>(() => undefined));
    const client = createRealtimeClient({ config });
    const connection = client.connect("123-myapp", {
      connectionKey: `test-conn-${connectionId}`,
      clientOnly: false,
      throttleInterval: 20,
      tokenProvider,
      onResult: jest.fn(),
    });

    connection.send({ prompt: "starts auth" });
    connection.send({ prompt: "must be dropped" });
    await Promise.resolve();
    expect(tokenProvider).toHaveBeenCalledTimes(1);

    connection.close();
    jest.advanceTimersByTime(25);
    await Promise.resolve();

    expect(tokenProvider).toHaveBeenCalledTimes(1);
    expect(WebSocketMock).not.toHaveBeenCalled();
  });

  it("sends msgpack payloads by default", async () => {
    const client = createRealtimeClient({ config });
    const connection = client.connect("123-myapp", {
      connectionKey: `test-conn-${connectionId}`,
      clientOnly: false,
      throttleInterval: 0,
      onResult: jest.fn(),
      onError: jest.fn(),
    });

    connection.send({ foo: "bar" });
    await Promise.resolve();
    await Promise.resolve();

    expect(WebSocketMock).toHaveBeenCalledTimes(1);
    const socket = sockets[0];
    socket.triggerOpen();
    await Promise.resolve();
    connection.send({ foo: "bar" });
    await Promise.resolve();

    expect(socket.send).toHaveBeenCalledTimes(1);
    const payload = socket.send.mock.calls[0][0];
    expect(payload).toBeInstanceOf(Uint8Array);
    expect(decode(payload)).toEqual({ foo: "bar" });
  });

  it("keeps sending strings as msgpack by default", async () => {
    const client = createRealtimeClient({ config });
    const connection = client.connect("123-myapp", {
      connectionKey: `test-conn-${connectionId}`,
      clientOnly: false,
      throttleInterval: 0,
      onResult: jest.fn(),
      onError: jest.fn(),
    });

    connection.send("hello");
    await Promise.resolve();
    await Promise.resolve();

    expect(WebSocketMock).toHaveBeenCalledTimes(1);
    const socket = sockets[0];
    socket.triggerOpen();
    await Promise.resolve();
    connection.send("hello");
    await Promise.resolve();

    expect(socket.send).toHaveBeenCalledTimes(1);
    const payload = socket.send.mock.calls[0][0];
    expect(payload).toBeInstanceOf(Uint8Array);
    expect(decode(payload)).toBe("hello");
  });

  it("sends and receives plain json when custom encode/decode are provided", async () => {
    const onResult = jest.fn();
    const client = createRealtimeClient({ config });
    const connection = client.connect("123-myapp", {
      connectionKey: `test-conn-${connectionId}`,
      clientOnly: false,
      throttleInterval: 0,
      encodeMessage: (input) =>
        typeof input === "string" ? input : JSON.stringify(input),
      decodeMessage: async (data) => {
        if (typeof data === "string") {
          return JSON.parse(data);
        }
        if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
          return JSON.parse(new TextDecoder().decode(data));
        }
        if (data instanceof Blob) {
          return JSON.parse(
            new TextDecoder().decode(new Uint8Array(await data.arrayBuffer())),
          );
        }
        return data;
      },
      onResult,
      onError: jest.fn(),
    });

    connection.send({ foo: "bar" });
    await Promise.resolve();
    await Promise.resolve();

    expect(WebSocketMock).toHaveBeenCalledTimes(1);
    const socket = sockets[0];
    socket.triggerOpen();
    await Promise.resolve();
    connection.send({ foo: "bar" });
    await Promise.resolve();

    expect(socket.send).toHaveBeenCalledWith('{"foo":"bar"}');

    const result = { status: "ok", request_id: "req-1" };
    socket.onmessage?.({ data: JSON.stringify(result) });
    await Promise.resolve();
    expect(onResult).toHaveBeenCalledWith(result);
  });

  it("lets onClose reconnect: the idle transition lands before the callback", async () => {
    // A consumer reacting to a clean remote goodbye by sending again must enter "connecting" —
    // firing onClose while the machine is still "active" would strand the retry in the enqueued
    // slot with no connection ever starting.
    const tokenProvider = jest.fn().mockResolvedValue("shared-token");
    const client = createRealtimeClient({ config });
    const connection: { send: (input: unknown) => void; close: () => void } =
      client.connect("123-myapp", {
        connectionKey: `test-conn-${connectionId}`,
        clientOnly: false,
        throttleInterval: 0,
        tokenProvider,
        onResult: jest.fn(),
        onClose: () => connection.send({ prompt: "reconnect" }),
      });

    connection.send({ prompt: "first" });
    await Promise.resolve();
    await Promise.resolve();
    expect(sockets).toHaveLength(1);
    sockets[0].triggerOpen();
    await Promise.resolve();

    sockets[0].readyState = MockWebSocket.CLOSED;
    sockets[0].onclose?.({ code: 1000, reason: "server done" });
    // The reconnect re-authenticates (the closure expired the token) before opening a socket.
    for (let flushes = 0; flushes < 10; flushes += 1) {
      await Promise.resolve();
    }

    // The reconnect send moved the machine through idle into connecting: a second socket exists.
    expect(sockets.length).toBeGreaterThanOrEqual(2);
    connection.close();
  });

  it("delivers a falsy encoded message queued before the socket opened, without re-encoding", async () => {
    // send() stores the ALREADY-ENCODED payload; a custom encoder can legitimately produce ""
    // (an empty heartbeat frame). Truthiness gates would strand it, and the onopen flush must
    // send the stored value verbatim rather than encoding it a second time.
    const client = createRealtimeClient({ config });
    const connection = client.connect("123-myapp", {
      connectionKey: `test-conn-${connectionId}`,
      clientOnly: false,
      throttleInterval: 0,
      encodeMessage: () => "",
      onResult: jest.fn(),
      onError: jest.fn(),
    });

    connection.send({ ignored: true });
    await Promise.resolve();
    await Promise.resolve();

    expect(WebSocketMock).toHaveBeenCalledTimes(1);
    const socket = sockets[0];
    socket.triggerOpen();
    await Promise.resolve();

    expect(socket.send).toHaveBeenCalledTimes(1);
    expect(socket.send).toHaveBeenCalledWith("");
    connection.close();
  });

  it("falls back to msgpack decode when receiving binary in json mode", async () => {
    const onResult = jest.fn();
    const client = createRealtimeClient({ config });
    const connection = client.connect("123-myapp", {
      connectionKey: `test-conn-${connectionId}`,
      clientOnly: false,
      throttleInterval: 0,
      encodeMessage: (input) =>
        typeof input === "string" ? input : JSON.stringify(input),
      decodeMessage: async (data) => {
        const toUint8Array = async (value: ArrayBuffer | Uint8Array | Blob) => {
          if (value instanceof Uint8Array) return value;
          if (value instanceof Blob)
            return new Uint8Array(await value.arrayBuffer());
          return new Uint8Array(value);
        };
        if (typeof data === "string") {
          return JSON.parse(data);
        }
        if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
          const buffer = await toUint8Array(data);
          try {
            return JSON.parse(new TextDecoder().decode(buffer));
          } catch {
            return decode(buffer);
          }
        }
        if (data instanceof Blob) {
          const buffer = await toUint8Array(data);
          try {
            return JSON.parse(new TextDecoder().decode(buffer));
          } catch {
            return decode(buffer);
          }
        }
        return data;
      },
      onResult,
      onError: jest.fn(),
    });

    connection.send({ foo: "bar" });
    await Promise.resolve();
    await Promise.resolve();

    expect(WebSocketMock).toHaveBeenCalledTimes(1);
    const socket = sockets[0];
    socket.triggerOpen();
    await Promise.resolve();
    connection.send({ foo: "bar" });
    await Promise.resolve();

    const packed = encode({ status: "ok", request_id: "req-2" });
    socket.onmessage?.({ data: packed });
    await Promise.resolve();
    await Promise.resolve();

    expect(onResult).toHaveBeenCalledWith({
      status: "ok",
      request_id: "req-2",
    });
  });

  it("surfaces decode errors to onError", async () => {
    const onError = jest.fn();
    const client = createRealtimeClient({ config });
    const connection = client.connect("123-myapp", {
      connectionKey: `test-conn-${connectionId}`,
      clientOnly: false,
      throttleInterval: 0,
      encodeMessage: (input) =>
        typeof input === "string" ? input : JSON.stringify(input),
      decodeMessage: async (data) => {
        if (typeof data === "string") {
          return JSON.parse(data);
        }
        if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
          return JSON.parse(new TextDecoder().decode(data));
        }
        if (data instanceof Blob) {
          return JSON.parse(
            new TextDecoder().decode(new Uint8Array(await data.arrayBuffer())),
          );
        }
        return data;
      },
      onResult: jest.fn(),
      onError,
    });

    connection.send({ foo: "bar" });
    await Promise.resolve();
    await Promise.resolve();

    expect(WebSocketMock).toHaveBeenCalledTimes(1);
    const socket = sockets[0];
    socket.triggerOpen();
    await Promise.resolve();
    connection.send({ foo: "bar" });
    await Promise.resolve();

    socket.onmessage?.({ data: "not-json" });
    await Promise.resolve();
    await Promise.resolve();

    expect(onError).toHaveBeenCalledTimes(1);
    const errorArg = onError.mock.calls[0][0];
    expect(errorArg.status).toBe(400);
  });

  it("drops a decoded result that finishes after the connection closes", async () => {
    let finishDecode!: (value: unknown) => void;
    const decoded = new Promise((resolve) => {
      finishDecode = resolve;
    });
    const onResult = jest.fn();
    const client = createRealtimeClient({ config });
    const connection = client.connect("123-myapp", {
      connectionKey: `test-conn-${connectionId}`,
      clientOnly: false,
      throttleInterval: 0,
      decodeMessage: () => decoded,
      onResult,
    });

    connection.send({ prompt: "start" });
    await Promise.resolve();
    await Promise.resolve();
    const socket = sockets[0];
    socket.triggerOpen();
    socket.onmessage?.({ data: "pending" });

    connection.close();
    finishDecode({ status: "ok", request_id: "late" });
    await Promise.resolve();
    await Promise.resolve();

    expect(onResult).not.toHaveBeenCalled();
  });

  it("delivers a result decoded across a same-key reuse to the newest callbacks", async () => {
    // A frame whose async decode spans a re-render belongs to the SAME logical stream — it must
    // reach the newest render's onResult, not be silently discarded because the callbacks object
    // identity changed mid-decode.
    let finishDecode!: (value: unknown) => void;
    const decoded = new Promise((resolve) => {
      finishDecode = resolve;
    });
    const firstResult = jest.fn();
    const secondResult = jest.fn();
    const client = createRealtimeClient({ config });
    const connectionKey = `test-conn-${connectionId}`;
    const first = client.connect("123-myapp", {
      connectionKey,
      clientOnly: false,
      throttleInterval: 0,
      decodeMessage: () => decoded,
      onResult: firstResult,
    });

    first.send({ prompt: "start" });
    await Promise.resolve();
    await Promise.resolve();
    const socket = sockets[0];
    socket.triggerOpen();
    socket.onmessage?.({ data: "pending" });

    const second = client.connect("123-myapp", {
      connectionKey,
      clientOnly: false,
      throttleInterval: 0,
      decodeMessage: () => decoded,
      onResult: secondResult,
    });
    finishDecode({ status: "ok", request_id: "in-flight" });
    await Promise.resolve();
    await Promise.resolve();

    expect(firstResult).not.toHaveBeenCalled();
    expect(secondResult).toHaveBeenCalledWith({
      status: "ok",
      request_id: "in-flight",
    });
    second.close();
  });

  it("drops a result decoded after the connection was closed", async () => {
    // The stale case that must STAY dropped: a frame from a machine the caller already ended.
    let finishDecode!: (value: unknown) => void;
    const decoded = new Promise((resolve) => {
      finishDecode = resolve;
    });
    const onResult = jest.fn();
    const client = createRealtimeClient({ config });
    const connection = client.connect("123-myapp", {
      connectionKey: `test-conn-${connectionId}`,
      clientOnly: false,
      throttleInterval: 0,
      decodeMessage: () => decoded,
      onResult,
    });

    connection.send({ prompt: "start" });
    await Promise.resolve();
    await Promise.resolve();
    const socket = sockets[0];
    socket.triggerOpen();
    socket.onmessage?.({ data: "pending" });

    connection.close();
    finishDecode({ status: "ok", request_id: "stale" });
    await Promise.resolve();
    await Promise.resolve();

    expect(onResult).not.toHaveBeenCalled();
  });

  it("uses custom tokenProvider when provided", async () => {
    const customTokenProvider = jest.fn().mockResolvedValue("custom-token");
    const client = createRealtimeClient({ config });
    const connection = client.connect("123-myapp", {
      connectionKey: `test-conn-${connectionId}`,
      clientOnly: false,
      throttleInterval: 0,
      tokenProvider: customTokenProvider,
      onResult: jest.fn(),
      onError: jest.fn(),
    });

    connection.send({ foo: "bar" });
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(customTokenProvider).toHaveBeenCalledTimes(1);
    expect(customTokenProvider).toHaveBeenCalledWith("123/myapp/realtime");
    expect(getTemporaryAuthToken).not.toHaveBeenCalled();

    expect(WebSocketMock).toHaveBeenCalledTimes(1);
    const socket = sockets[0];
    expect(socket.url).toBe(
      "wss://fal.run/123/myapp/realtime?fal_jwt_token=custom-token",
    );
  });

  it("does not call default getTemporaryAuthToken when custom tokenProvider is used", async () => {
    const customTokenProvider = jest.fn().mockResolvedValue("my-custom-token");
    const client = createRealtimeClient({ config });
    const connection = client.connect("456-otherapp", {
      connectionKey: `test-conn-${connectionId}`,
      clientOnly: false,
      throttleInterval: 0,
      tokenProvider: customTokenProvider,
      onResult: jest.fn(),
      onError: jest.fn(),
    });

    connection.send({ test: "data" });
    await Promise.resolve();
    await Promise.resolve();

    expect(customTokenProvider).toHaveBeenCalledWith("456/otherapp/realtime");
    expect(getTemporaryAuthToken).not.toHaveBeenCalled();
  });

  it("handles tokenProvider errors correctly", async () => {
    const tokenError = new Error("Token fetch failed");
    const customTokenProvider = jest.fn().mockRejectedValue(tokenError);
    const onError = jest.fn();
    const client = createRealtimeClient({ config });
    const connection = client.connect("123-myapp", {
      connectionKey: `test-conn-${connectionId}`,
      clientOnly: false,
      throttleInterval: 0,
      tokenProvider: customTokenProvider,
      onResult: jest.fn(),
      onError,
    });

    connection.send({ foo: "bar" });
    for (let turn = 0; turn < 6; turn += 1) await Promise.resolve();

    expect(customTokenProvider).toHaveBeenCalledTimes(1);
    expect(WebSocketMock).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Token fetch failed",
        status: 401,
      }),
    );
  });

  it("allows an onError callback to retry after token acquisition fails", async () => {
    const tokenProvider = jest
      .fn()
      .mockRejectedValueOnce(new Error("first token failed"))
      .mockResolvedValueOnce("recovered-token");
    const client = createRealtimeClient({ config });
    const connectionRef: {
      current?: ReturnType<typeof client.connect>;
    } = {};
    const onError = jest.fn(() =>
      connectionRef.current?.send({ request_id: "attempt-2" }),
    );
    const connection = client.connect("123-myapp", {
      connectionKey: `test-conn-${connectionId}`,
      clientOnly: false,
      throttleInterval: 0,
      tokenProvider,
      onResult: jest.fn(),
      onError,
    });
    connectionRef.current = connection;

    connection.send({ request_id: "attempt-1" });
    for (let turn = 0; turn < 6; turn += 1) await Promise.resolve();

    expect(onError).toHaveBeenCalledTimes(1);
    expect(tokenProvider).toHaveBeenCalledTimes(2);
    expect(WebSocketMock).toHaveBeenCalledTimes(1);
  });

  it("exits authInProgress even when the error callback throws", async () => {
    const tokenProvider = jest
      .fn()
      .mockRejectedValueOnce(new Error("first token failed"))
      .mockResolvedValueOnce("recovered-token");
    const client = createRealtimeClient({ config });
    const connection = client.connect("123-myapp", {
      connectionKey: `test-conn-${connectionId}`,
      clientOnly: false,
      throttleInterval: 0,
      tokenProvider,
      onResult: jest.fn(),
      onError: () => {
        throw new Error("render failed");
      },
    });

    connection.send({ attempt: 1 });
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    connection.send({ attempt: 2 });
    await Promise.resolve();
    await Promise.resolve();

    expect(tokenProvider).toHaveBeenCalledTimes(2);
    expect(WebSocketMock).toHaveBeenCalledTimes(1);
  });

  it("uses default getTemporaryAuthToken when tokenProvider is not provided", async () => {
    const client = createRealtimeClient({ config });
    const connection = client.connect("123-myapp", {
      connectionKey: `test-conn-${connectionId}`,
      clientOnly: false,
      throttleInterval: 0,
      onResult: jest.fn(),
      onError: jest.fn(),
    });

    connection.send({ foo: "bar" });
    await Promise.resolve();
    await Promise.resolve();

    expect(getTemporaryAuthToken).toHaveBeenCalledTimes(1);
    expect(getTemporaryAuthToken).toHaveBeenCalledWith("123-myapp", config);
  });

  it("does not auto-refresh token when custom tokenProvider is used without tokenExpirationSeconds", async () => {
    const customTokenProvider = jest.fn().mockResolvedValue("custom-token");
    const client = createRealtimeClient({ config });
    const connection = client.connect("123-myapp", {
      connectionKey: `test-conn-${connectionId}`,
      clientOnly: false,
      throttleInterval: 0,
      tokenProvider: customTokenProvider,
      // No tokenExpirationSeconds specified
      onResult: jest.fn(),
      onError: jest.fn(),
    });

    connection.send({ foo: "bar" });
    await Promise.resolve();
    await Promise.resolve();

    expect(customTokenProvider).toHaveBeenCalledTimes(1);

    const socket = sockets[0];
    socket.triggerOpen();
    await Promise.resolve();

    // Advance time well past the default refresh interval (108s)
    jest.advanceTimersByTime(150000);
    await Promise.resolve();
    await Promise.resolve();

    // Token should NOT be refreshed since no tokenExpirationSeconds was specified
    expect(customTokenProvider).toHaveBeenCalledTimes(1);
  });

  it("schedules token refresh with custom tokenExpirationSeconds", async () => {
    const setTimeoutSpy = jest.spyOn(global, "setTimeout");
    const customTokenProvider = jest.fn().mockResolvedValue("custom-token");
    const client = createRealtimeClient({ config });
    const connection = client.connect("123-myapp", {
      connectionKey: `test-conn-${connectionId}`,
      clientOnly: false,
      throttleInterval: 0,
      tokenProvider: customTokenProvider,
      tokenExpirationSeconds: 60, // 60 seconds TTL, refresh at 54s (90%)
      onResult: jest.fn(),
      onError: jest.fn(),
    });

    connection.send({ foo: "bar" });
    await Promise.resolve();
    await Promise.resolve();

    expect(customTokenProvider).toHaveBeenCalledTimes(1);

    // Verify setTimeout was called with the correct interval (60 * 0.9 * 1000 = 54000ms)
    const tokenRefreshCall = setTimeoutSpy.mock.calls.find(
      (call) => call[1] === 54000,
    );
    expect(tokenRefreshCall).toBeDefined();

    setTimeoutSpy.mockRestore();
  });
});
