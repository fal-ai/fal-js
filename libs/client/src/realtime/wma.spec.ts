import { fakeExtensionContext } from "./testing";
import { wmaRaw } from "./wma";

/** A peer connection just real enough to drive the raw-path handshake. */
function fakePeer() {
  const listeners: Record<string, Array<(event: unknown) => void>> = {};
  const channel = {
    label: "control",
    readyState: "connecting" as RTCDataChannelState,
    send: jest.fn(),
    close: jest.fn(),
    onopen: undefined as (() => void) | undefined,
    onmessage: undefined as ((event: { data: string }) => void) | undefined,
    onclose: undefined as (() => void) | undefined,
    onerror: undefined as (() => void) | undefined,
  };
  return {
    channel,
    peer: {
      iceGatheringState: "complete" as RTCIceGatheringState,
      connectionState: "new" as RTCPeerConnectionState,
      iceConnectionState: "new" as RTCIceConnectionState,
      localDescription: { sdp: "local-offer", type: "offer" as RTCSdpType },
      addTransceiver: jest.fn(),
      createDataChannel: jest.fn(() => channel),
      addTrack: jest.fn(),
      createOffer: jest.fn(async () => ({ sdp: "local-offer", type: "offer" })),
      setLocalDescription: jest.fn(async () => undefined),
      setRemoteDescription: jest.fn(async () => undefined),
      close: jest.fn(),
      addEventListener: (type: string, fn: (event: unknown) => void) => {
        (listeners[type] ??= []).push(fn);
      },
      removeEventListener: () => undefined,
      onconnectionstatechange: undefined as (() => void) | undefined,
      ontrack: undefined as unknown,
    },
  };
}

describe("wmaRaw", () => {
  const originalPeerConnection = global.RTCPeerConnection;

  afterEach(() => {
    global.RTCPeerConnection = originalPeerConnection;
    jest.restoreAllMocks();
  });

  function install() {
    const { peer, channel } = fakePeer();
    global.RTCPeerConnection = jest.fn(() => peer) as never;
    return { peer, channel };
  }

  it("reaches the bridge through context.fetch, never a caller-supplied one", async () => {
    // The reason this extension can live in the client at all: it needs a credentialed request to a
    // host that is not a fal endpoint, and it no longer asks the application for one.
    const { channel } = install();
    const calls: Array<{ url: string; body: unknown }> = [];
    const context = fakeExtensionContext({
      endpointId: "me/my-world",
      run: (async () => ({
        data: { ice_servers: [{ urls: "stun:example" }], status: "turn" },
        requestId: "r",
      })) as never,
      fetch: async (url: string, init?: RequestInit) => {
        calls.push({ url, body: init?.body });
        return new Response(
          JSON.stringify({ session_id: "s-1", sdp: "answer", type: "answer" }),
        );
      },
    });

    const session = await wmaRaw(["me/my-world"]).open(context, {
      endpointId: "me/my-world",
    });

    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe("https://wma.fal.run/session");
    expect(JSON.parse(String(calls[0].body))).toEqual({
      app_id: "me/my-world",
      sdp: "local-offer",
      type: "offer",
    });
    expect(session.sessionId).toBe("s-1");
    // Bounded queue rather than a lost message: callers enable input on "connected", which precedes
    // the channel opening.
    session.send({ type: "keys", pressed: ["W"] });
    expect(channel.send).not.toHaveBeenCalled();
    channel.readyState = "open";
    channel.onopen?.();
    expect(channel.send).toHaveBeenCalledWith(
      '{"type":"keys","pressed":["W"]}',
    );
  });

  it("asks the kernel to gather ICE rather than reimplementing it", async () => {
    install();
    const gatherIce = jest.fn(
      async (_pc: RTCPeerConnection, _options?: unknown) => ({
        host: 1,
        srflx: 1,
        relay: 2,
        state: "sufficient" as const,
      }),
    );
    const context = fakeExtensionContext({
      endpointId: "me/my-world",
      gatherIce,
      run: (async () => ({
        data: {
          ice_servers: [
            { urls: "turn:example", username: "u", credential: "p" },
          ],
        },
        requestId: "r",
      })) as never,
      fetch: async () =>
        new Response(
          JSON.stringify({ session_id: "s", sdp: "a", type: "answer" }),
        ),
    });

    await wmaRaw().open(context, { endpointId: "me/my-world" });
    expect(gatherIce).toHaveBeenCalledTimes(1);
    // The servers must reach it, or "sufficient" cannot know a relay is required.
    expect(gatherIce.mock.calls[0][1]).toEqual({
      iceServers: [{ urls: "turn:example", username: "u", credential: "p" }],
    });
  });

  it("degrades to STUN and says so when /ice is unavailable", async () => {
    install();
    const events: unknown[] = [];
    const context = fakeExtensionContext({
      endpointId: "me/my-world",
      run: (async () => {
        throw new Error("ice endpoint exploded");
      }) as never,
      diagnostic: (event) => events.push(event),
      fetch: async () =>
        new Response(
          JSON.stringify({ session_id: "s", sdp: "a", type: "answer" }),
        ),
    });
    jest.spyOn(console, "warn").mockImplementation(() => undefined);

    await wmaRaw().open(context, { endpointId: "me/my-world" });
    // Reported, not swallowed: "no relay" is the difference between working and not for anyone behind
    // blocked UDP, so a silent fallback to STUN is the one thing this must never do.
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "progress",
          phase: "ice-servers",
          detail: expect.objectContaining({
            source: expect.stringContaining("ice-endpoint-failed"),
          }),
        }),
      ]),
    );
  });

  it("surfaces a bridge error message instead of a bare status code", async () => {
    install();
    const context = fakeExtensionContext({
      endpointId: "me/my-world",
      run: (async () => ({
        data: { ice_servers: [{ urls: "stun:x" }] },
        requestId: "r",
      })) as never,
      fetch: async () =>
        new Response(JSON.stringify({ detail: "app is not deployed" }), {
          status: 422,
        }),
    });
    await expect(
      wmaRaw().open(context, { endpointId: "me/my-world" }),
    ).rejects.toThrow("app is not deployed");
  });

  it("adds local tracks instead of a recvonly transceiver, and never both", async () => {
    // Both would negotiate two video m-lines, and the runner would answer a stream nobody reads.
    const { peer } = install();
    const track = { kind: "video", stop: jest.fn() };
    const stream = { getTracks: () => [track] } as unknown as MediaStream;
    const context = fakeExtensionContext({
      endpointId: "me/transform",
      run: (async () => ({
        data: { ice_servers: [{ urls: "stun:x" }] },
        requestId: "r",
      })) as never,
      fetch: async () =>
        new Response(
          JSON.stringify({ session_id: "s", sdp: "a", type: "answer" }),
        ),
    });

    const session = await wmaRaw().open(context, {
      endpointId: "me/transform",
      localStream: stream,
    });

    expect(peer.addTransceiver).not.toHaveBeenCalled();
    expect(
      (peer as never as { addTrack: jest.Mock }).addTrack,
    ).toHaveBeenCalledWith(track, stream);
    // The caller owns the camera. Closing the session must not turn their device off.
    await session.close();
    expect(track.stop).not.toHaveBeenCalled();
  });

  it("falls back to a recvonly transceiver with no local stream", async () => {
    const { peer } = install();
    const context = fakeExtensionContext({
      endpointId: "me/out",
      run: (async () => ({
        data: { ice_servers: [{ urls: "stun:x" }] },
        requestId: "r",
      })) as never,
      fetch: async () =>
        new Response(
          JSON.stringify({ session_id: "s", sdp: "a", type: "answer" }),
        ),
    });
    await wmaRaw().open(context, { endpointId: "me/out" });
    expect(peer.addTransceiver).toHaveBeenCalledWith("video", {
      direction: "recvonly",
    });
  });

  it("accepts any endpoint when none are declared", async () => {
    // Deliberate: an endpoint's NAME cannot reveal whether it speaks the raw path, so only the
    // application passing the extension can. Returning false here rejected every open.
    expect(wmaRaw().supports("anything/at-all")).toBe(true);
    expect(wmaRaw(["only/this"]).supports("only/this")).toBe(true);
    expect(wmaRaw(["only/this"]).supports("something/else")).toBe(false);
  });
});
