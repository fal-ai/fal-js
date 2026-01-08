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
  });

  it("uses the provided path when opening the websocket", async () => {
    const client = createRealtimeClient({ config });
    const connection = client.connect("123-myapp", {
      path: "/custom/path",
      onResult: jest.fn(),
      onError: jest.fn(),
    });

    // trigger connection establishment
    connection.send({ foo: "bar" });
    // let the auth token promise resolve and state machine proceed
    await Promise.resolve();
    await Promise.resolve();

    expect(WebSocketMock).toHaveBeenCalledTimes(1);
    const socket = sockets[0];
    expect(socket.url).toBe(
      "wss://fal.run/123/myapp/custom/path?fal_jwt_token=mock-token",
    );
  });
});
