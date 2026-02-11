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

    expect(customTokenProvider).toHaveBeenCalledTimes(1);
    expect(customTokenProvider).toHaveBeenCalledWith("123-myapp");
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

    expect(customTokenProvider).toHaveBeenCalledWith("456-otherapp");
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
    await Promise.resolve();
    await Promise.resolve();

    expect(customTokenProvider).toHaveBeenCalledTimes(1);
    expect(WebSocketMock).not.toHaveBeenCalled();
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
