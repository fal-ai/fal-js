import type { RealtimeConnectionHandler } from "../realtime";
import { fakeExtensionContext } from "./testing";
import type { RealtimeExtensionContext } from "./extension";
import { lucyRealtime } from "./lucy";

describe("lucyRealtime", () => {
  beforeEach(() => {
    (global as any).crypto = { randomUUID: () => "lucy-test" };
  });

  it("negotiates WebRTC after the endpoint supplies ICE servers", async () => {
    let handler: RealtimeConnectionHandler<Record<string, unknown>> | undefined;
    const send = jest.fn();
    const close = jest.fn();
    const cleanups: Array<() => void | Promise<void>> = [];
    const diagnostics: unknown[] = [];
    const peer = {
      addTransceiver: jest.fn(),
      createOffer: jest.fn().mockResolvedValue({ sdp: "local-offer" }),
      setLocalDescription: jest.fn().mockResolvedValue(undefined),
      close: jest.fn(),
      connectionState: "connecting",
      ontrack: null,
      onicecandidate: null,
      onconnectionstatechange: null,
    } as unknown as RTCPeerConnection;
    const context = fakeExtensionContext({
      endpointId: "decart/lucy-2-5/realtime",
      signal: new AbortController().signal,
      run: jest.fn(),
      connect: ((_endpointId: string, nextHandler: typeof handler) => {
        handler = nextHandler;
        return { send, close };
        // Cast narrowed to this member: the mock cannot express connect's generics, and casting the
        // whole context is what let four missing methods through in the first place.
      }) as RealtimeExtensionContext["connect"],
      addCleanup: (cleanup: () => void | Promise<void>) =>
        cleanups.push(cleanup),
      close: jest.fn(),
      diagnostic: (event: unknown) => diagnostics.push(event),
      fail: jest.fn(),
    });

    const opening = lucyRealtime().open(context, {
      endpointId: context.endpointId,
      input: { prompt: "make it cinematic" },
      peerConnectionFactory: () => peer,
    });
    handler?.onResult({
      type: "iceServers",
      iceServers: [],
      request_id: "ready",
    });
    const session = await opening;

    expect(send).toHaveBeenNthCalledWith(1, {
      prompt: "make it cinematic",
    });
    expect(send).toHaveBeenNthCalledWith(2, {
      type: "offer",
      sdp: "local-offer",
    });
    expect(peer.addTransceiver).toHaveBeenCalledWith("video", {
      direction: "recvonly",
    });

    await Promise.all(cleanups.map((cleanup) => cleanup()));
    expect(close).toHaveBeenCalledTimes(1);
    expect(peer.close).toHaveBeenCalledTimes(1);
    // Lucy's own vocabulary is progress DETAIL now; the uniform lifecycle belongs to the kernel, and
    // this spec drives open() directly so there is no kernel here to ask.
    expect(diagnostics).toContainEqual({
      kind: "progress",
      phase: "connection-state",
      detail: { state: "closed" },
    });
  });

  it("rejects immediately when signaling is aborted", async () => {
    const controller = new AbortController();
    const reason = new Error("user left");
    let handler: RealtimeConnectionHandler<Record<string, unknown>> | undefined;
    const cleanups: Array<() => void | Promise<void>> = [];
    const diagnostics: unknown[] = [];
    const context = fakeExtensionContext({
      endpointId: "decart/lucy-2-5/realtime",
      signal: controller.signal,
      run: jest.fn(),
      connect: ((_endpointId: string, nextHandler: typeof handler) => {
        handler = nextHandler;
        return { send: jest.fn(), close: jest.fn() };
      }) as RealtimeExtensionContext["connect"],
      addCleanup: (cleanup: () => void | Promise<void>) =>
        cleanups.push(cleanup),
      close: jest.fn(),
      diagnostic: (event: unknown) => diagnostics.push(event),
      fail: jest.fn(),
    });

    const opening = lucyRealtime().open(context, {
      input: { prompt: "make it cinematic" },
    });
    controller.abort(reason);

    await expect(opening).rejects.toBe(reason);
    await Promise.all(cleanups.map((cleanup) => cleanup()));
    expect(handler).toBeDefined();
  });
});
