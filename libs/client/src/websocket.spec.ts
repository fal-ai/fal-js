import { createConfig, type RequiredConfig } from "./config";
import { createWebSocketClient } from "./websocket";

jest.mock("./auth", () => {
  const actual = jest.requireActual("./auth");
  return {
    ...actual,
    getTemporaryAuthToken: jest.fn().mockResolvedValue("mock-token"),
  };
});

import { getTemporaryAuthToken } from "./auth";

type Listener = (event?: any) => void;

class MockWebSocket {
  public readonly url: string;
  public readonly send = jest.fn();
  public readonly close = jest.fn();
  private listeners: Record<string, Set<Listener>> = {
    open: new Set(),
    error: new Set(),
    message: new Set(),
    close: new Set(),
  };

  constructor(url: string) {
    this.url = url;
  }

  addEventListener(type: string, listener: Listener) {
    this.listeners[type]?.add(listener);
  }

  removeEventListener(type: string, listener: Listener) {
    this.listeners[type]?.delete(listener);
  }

  trigger(type: string, event?: any) {
    this.listeners[type]?.forEach((listener) => listener(event));
  }
}

describe("createWebSocketClient", () => {
  let config: RequiredConfig;
  const sockets: MockWebSocket[] = [];
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
    jest.useFakeTimers();
    sockets.length = 0;
    WebSocketMock.mockClear();
    (getTemporaryAuthToken as jest.Mock).mockClear();
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
  });

  it("builds the correct websocket url with path and maxBuffering", async () => {
    const client = createWebSocketClient({ config });
    const connectPromise = client.connect("123-myapp", {
      path: "/custom/path",
      maxBuffering: 10,
    });

    // allow async token resolution to schedule the socket
    await Promise.resolve();

    expect(WebSocketMock).toHaveBeenCalledTimes(1);
    const socket = sockets[0];
    // Allow the open handler to resolve the promise
    socket.trigger("open");
    const connection = await connectPromise;

    expect(socket.url).toBe(
      "wss://fal.run/123/myapp/custom/path?fal_jwt_token=mock-token&max_buffering=10",
    );
    expect(connection.raw).toBe(socket);
  });

  it("passes tokenExpirationSeconds to getTemporaryAuthToken", async () => {
    const client = createWebSocketClient({ config });
    const promise = client.connect("123-myapp", {
      tokenExpirationSeconds: 999,
    });
    await Promise.resolve();
    const socket = sockets[0];
    socket.trigger("open");
    await promise;

    expect(getTemporaryAuthToken).toHaveBeenCalledWith(
      "123-myapp",
      config,
      999,
    );
  });

  it("returns a no-op connection when clientOnly is true in non-browser env", async () => {
    const client = createWebSocketClient({ config });
    const connection = await client.connect("123-myapp", {
      clientOnly: true,
    });

    expect(WebSocketMock).not.toHaveBeenCalled();
    expect(connection.raw).toBeUndefined();
    expect(() => connection.send("x")).not.toThrow();
    expect(() => connection.close()).not.toThrow();
    expect(connection.withRaw(() => "value")).toBeUndefined();
  });

  it("rejects when maxBuffering is out of range", async () => {
    const client = createWebSocketClient({ config });
    await expect(
      client.connect("123-myapp", { maxBuffering: 0 }),
    ).rejects.toThrow(/maxBuffering/);
    expect(WebSocketMock).not.toHaveBeenCalled();
  });

  it("rejects on open timeout", async () => {
    const client = createWebSocketClient({ config });
    const connectPromise = client.connect("123-myapp", {
      openTimeoutMs: 50,
    });

    await Promise.resolve();
    jest.advanceTimersByTime(51);

    await expect(connectPromise).rejects.toMatchObject({ status: 408 });
    expect(WebSocketMock).toHaveBeenCalledTimes(1);
    expect(sockets[0].close).toHaveBeenCalled();
  });

  it("invokes withRaw callback when socket is available", async () => {
    const client = createWebSocketClient({ config });
    const promise = client.connect("123-myapp");
    await Promise.resolve();
    const socket = sockets[0];
    socket.trigger("open");
    const connection = await promise;

    const result = connection.withRaw((ws) => {
      ws.send("hello");
      return "ok";
    });

    expect(result).toBe("ok");
    expect(socket.send).toHaveBeenCalledWith("hello");
  });
});
