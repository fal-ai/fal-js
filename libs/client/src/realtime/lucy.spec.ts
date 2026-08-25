import type { RealtimeConnectionHandler } from "../realtime";
import type { RealtimeExtensionContext } from "./extension";
import { lucyRealtime } from "./lucy";
import { fakeExtensionContext } from "./testing";

describe("lucyRealtime", () => {
  beforeEach(() => {
    (global as any).crypto = { randomUUID: () => "lucy-test" };
  });

  it("negotiates WebRTC after the endpoint supplies ICE servers", async () => {
    let handler: RealtimeConnectionHandler<Record<string, unknown>> | undefined;
    const send = jest.fn();
    const close = jest.fn();
    const fail = jest.fn();
    const controller = new AbortController();
    const cleanups: Array<() => void | Promise<void>> = [];
    const diagnostics: unknown[] = [];
    const peer = {
      addTransceiver: jest.fn(),
      createOffer: jest.fn().mockResolvedValue({ sdp: "local-offer" }),
      setLocalDescription: jest.fn().mockResolvedValue(undefined),
      setRemoteDescription: jest.fn().mockResolvedValue(undefined),
      close: jest.fn(),
      connectionState: "connecting",
      ontrack: null,
      onicecandidate: null,
      onconnectionstatechange: null,
    } as unknown as RTCPeerConnection;
    const context = fakeExtensionContext({
      endpointId: "decart/lucy-2-5/realtime",
      signal: controller.signal,
      run: jest.fn(),
      connect: ((_endpointId: string, nextHandler: typeof handler) => {
        handler = nextHandler;
        return { send, close };
        // Cast narrowed to this member: the mock cannot express connect's generics. The surrounding
        // compiler-checked context ensures required members cannot disappear from the fake.
      }) as RealtimeExtensionContext["connect"],
      addCleanup: (cleanup: () => void | Promise<void>) =>
        cleanups.push(cleanup),
      close: jest.fn(),
      diagnostic: (event: unknown) => diagnostics.push(event),
      fail,
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
    await Promise.resolve();
    await Promise.resolve();
    handler?.onResult({
      type: "answer",
      sdp: "remote-answer",
      request_id: "answer",
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

    controller.abort();
    await Promise.all(cleanups.map((cleanup) => cleanup()));
    session.send({ prompt: "must stay closed" });
    expect(close).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledTimes(2);
    expect(fail).not.toHaveBeenCalled();
    expect(peer.close).toHaveBeenCalledTimes(1);
    // Lucy's own vocabulary is progress detail; the uniform lifecycle belongs to the kernel, and
    // this spec drives open() directly so there is no kernel here to ask.
    expect(diagnostics).toContainEqual({
      kind: "progress",
      phase: "connection-state",
      detail: { state: "closed" },
    });
  });

  it("reports an error frame that lands right after the answer resolves", async () => {
    // The failure window: the answer resolves the negotiation promise, but open()'s awaiting
    // continuation has not run yet. An error frame handled in that microtask gap must reach
    // context.fail — rejecting the already-resolved negotiation promise is a silent no-op.
    let handler: RealtimeConnectionHandler<Record<string, unknown>> | undefined;
    const fail = jest.fn(async () => undefined);
    const peer = {
      addTransceiver: jest.fn(),
      createOffer: jest.fn().mockResolvedValue({ sdp: "local-offer" }),
      setLocalDescription: jest.fn().mockResolvedValue(undefined),
      setRemoteDescription: jest.fn().mockResolvedValue(undefined),
      close: jest.fn(),
      connectionState: "connecting",
      ontrack: null,
      onicecandidate: null,
      onconnectionstatechange: null,
    } as unknown as RTCPeerConnection;
    const context = fakeExtensionContext({
      endpointId: "decart/lucy-2-5/realtime",
      connect: ((_endpointId: string, nextHandler: typeof handler) => {
        handler = nextHandler;
        return { send: jest.fn(), close: jest.fn() };
      }) as RealtimeExtensionContext["connect"],
      fail,
    });

    const opening = lucyRealtime().open(context, {
      endpointId: context.endpointId,
      input: { prompt: "x" },
      peerConnectionFactory: () => peer,
    });
    handler?.onResult({
      type: "iceServers",
      iceServers: [],
      request_id: "ready",
    });
    await Promise.resolve();
    await Promise.resolve();
    handler?.onResult({
      type: "answer",
      sdp: "remote-answer",
      request_id: "answer",
    });
    await opening;
    // An error frame after the negotiation settled must reach context.fail — `settled` flips at
    // promise-settle time, so no microtask window exists where rejecting the already-resolved
    // negotiation promise would swallow the failure silently.
    handler?.onResult({ type: "error", request_id: "boom" });
    await Promise.resolve();
    await Promise.resolve();

    expect(fail).toHaveBeenCalledWith(
      "Lucy signaling endpoint reported an error",
    );
  });

  it("publishes its remote stream through context.media", async () => {
    // Inbound media goes through the kernel's channel, never an option of this extension's own, so
    // that an app offering more than one protocol has one name for it rather than one per protocol.
    let handler: RealtimeConnectionHandler<Record<string, unknown>> | undefined;
    const seen: MediaStream[] = [];
    const peer = {
      addTransceiver: jest.fn(),
      createOffer: jest.fn().mockResolvedValue({ sdp: "local-offer" }),
      setLocalDescription: jest.fn().mockResolvedValue(undefined),
      setRemoteDescription: jest.fn().mockResolvedValue(undefined),
      close: jest.fn(),
      connectionState: "connecting",
      ontrack: null,
      onicecandidate: null,
      onconnectionstatechange: null,
    } as unknown as RTCPeerConnection;
    const context = fakeExtensionContext({
      endpointId: "decart/lucy-2-5/realtime",
      run: jest.fn(),
      connect: ((_endpointId: string, nextHandler: typeof handler) => {
        handler = nextHandler;
        return { send: jest.fn(), close: jest.fn() };
      }) as RealtimeExtensionContext["connect"],
      media: (stream: MediaStream) => void seen.push(stream),
    });

    const opening = lucyRealtime().open(context, {
      endpointId: context.endpointId,
      input: { prompt: "anything" },
      peerConnectionFactory: () => peer,
    });
    handler?.onResult({
      type: "iceServers",
      iceServers: [],
      request_id: "ready",
    });
    await Promise.resolve();
    await Promise.resolve();
    handler?.onResult({
      type: "answer",
      sdp: "remote-answer",
      request_id: "answer",
    });
    await opening;

    const stream = { id: "lucy-remote" } as unknown as MediaStream;
    const secondStream = {
      id: "lucy-remote-secondary",
    } as unknown as MediaStream;
    (peer.ontrack as unknown as (event: unknown) => void)({
      streams: [stream, secondStream],
    });
    (peer.ontrack as unknown as (event: unknown) => void)({
      streams: [stream, secondStream],
    });
    expect(seen).toEqual([stream, secondStream]);
  });

  it("synthesizes a stream for a streamless remote track", async () => {
    let handler: RealtimeConnectionHandler<Record<string, unknown>> | undefined;
    const seen: MediaStream[] = [];
    const containedTracks: unknown[] = [];
    (global as unknown as { MediaStream: unknown }).MediaStream = class {
      constructor(tracks: unknown[]) {
        containedTracks.push(...tracks);
      }
    };
    const peer = {
      addTransceiver: jest.fn(),
      createOffer: jest.fn().mockResolvedValue({ sdp: "local-offer" }),
      setLocalDescription: jest.fn().mockResolvedValue(undefined),
      setRemoteDescription: jest.fn().mockResolvedValue(undefined),
      close: jest.fn(),
      connectionState: "connecting",
      ontrack: null,
      onicecandidate: null,
      onconnectionstatechange: null,
    } as unknown as RTCPeerConnection;
    const context = fakeExtensionContext({
      endpointId: "decart/lucy-2-5/realtime",
      connect: ((_endpointId: string, nextHandler: typeof handler) => {
        handler = nextHandler;
        return { send: jest.fn(), close: jest.fn() };
      }) as RealtimeExtensionContext["connect"],
      media: (stream: MediaStream) => void seen.push(stream),
    });

    const opening = lucyRealtime().open(context, {
      endpointId: context.endpointId,
      input: { prompt: "anything" },
      peerConnectionFactory: () => peer,
    });
    handler?.onResult({
      type: "iceServers",
      iceServers: [],
      request_id: "ready",
    });
    await Promise.resolve();
    await Promise.resolve();
    handler?.onResult({
      type: "answer",
      sdp: "remote-answer",
      request_id: "answer",
    });
    await opening;

    const track = { kind: "video" };
    (peer.ontrack as unknown as (event: unknown) => void)({
      streams: [],
      track,
    });
    expect(seen).toHaveLength(1);
    expect(containedTracks).toEqual([track]);
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

  it("honors an abort issued synchronously from the negotiating diagnostic", async () => {
    // The initial "negotiating" report fires after open()'s throwIfAborted but before the
    // negotiation abort listener exists, and an AbortSignal does not replay its event. Without the
    // recheck, negotiation waits out its timeout and reports that instead of the caller's reason.
    const controller = new AbortController();
    const reason = new Error("aborted mid-diagnostic");
    const context = fakeExtensionContext({
      endpointId: "decart/lucy-2-5/realtime",
      signal: controller.signal,
      connect: (() => ({
        send: jest.fn(),
        close: jest.fn(),
      })) as unknown as RealtimeExtensionContext["connect"],
      diagnostic: () => controller.abort(reason),
    });

    const opening = lucyRealtime().open(context, {
      input: { prompt: "make it cinematic" },
    });

    await expect(opening).rejects.toBe(reason);
  });

  it("rejects when fallback peer initialization fails", async () => {
    const failure = new Error("could not create an offer");
    let handler: RealtimeConnectionHandler<Record<string, unknown>> | undefined;
    const peer = {
      addTransceiver: jest.fn(),
      createOffer: jest.fn().mockRejectedValue(failure),
      close: jest.fn(),
      connectionState: "connecting",
      ontrack: null,
      onicecandidate: null,
      onconnectionstatechange: null,
    } as unknown as RTCPeerConnection;
    const context = fakeExtensionContext({
      endpointId: "decart/lucy-2-5/realtime",
      connect: ((_endpointId: string, nextHandler: typeof handler) => {
        handler = nextHandler;
        return { send: jest.fn(), close: jest.fn() };
      }) as RealtimeExtensionContext["connect"],
    });

    const opening = lucyRealtime().open(context, {
      input: { prompt: "anything" },
      iceServerGraceMs: 0,
      peerConnectionFactory: () => peer,
    });
    handler?.onResult({ type: "ready", request_id: "ready" });

    await expect(opening).rejects.toBe(failure);
  });

  it("keeps waiting when ICE servers arrive without an SDP answer", async () => {
    let handler: RealtimeConnectionHandler<Record<string, unknown>> | undefined;
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
      connect: ((_endpointId: string, nextHandler: typeof handler) => {
        handler = nextHandler;
        return { send: jest.fn(), close: jest.fn() };
      }) as RealtimeExtensionContext["connect"],
    });

    const opening = lucyRealtime().open(context, {
      input: { prompt: "anything" },
      negotiationTimeoutMs: 1,
      peerConnectionFactory: () => peer,
    });
    handler?.onResult({
      type: "iceServers",
      iceServers: [],
      request_id: "ready",
    });

    await expect(opening).rejects.toThrow(
      "Lucy signaling did not return an SDP answer within 1ms",
    );
  });
});
