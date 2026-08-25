import { fakeExtensionContext } from "./testing";
import { wma } from "./wma";

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

describe("wma", () => {
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

  it("gets bridge ICE before creating the offer, then reaches the bridge through context.fetch", async () => {
    // The extension needs a credentialed request to a host that is not a fal endpoint, so bridge
    // access belongs to the shared context rather than application-supplied fetch plumbing.
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
        if (url.endsWith("/ice")) {
          return new Response(
            JSON.stringify({
              ice_servers: [
                { urls: "turn:bridge", username: "u", credential: "p" },
              ],
              status: "turn",
              credential_age_seconds: 31,
            }),
          );
        }
        return new Response(
          JSON.stringify({ session_id: "s-1", sdp: "answer", type: "answer" }),
        );
      },
    });

    const session = await wma("me/my-world").open(context, {
      endpointId: "me/my-world",
    });

    expect(calls).toHaveLength(2);
    expect(calls[0].url).toBe("https://wma.fal.run/ice");
    expect(JSON.parse(String(calls[0].body))).toEqual({
      app_id: "me/my-world",
    });
    expect(calls[1].url).toBe("https://wma.fal.run/session");
    expect(JSON.parse(String(calls[1].body))).toEqual({
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

  it("falls back to an app-local /ice route when bridge ICE is unavailable", async () => {
    const { peer } = install();
    const events: unknown[] = [];
    const context = fakeExtensionContext({
      endpointId: "me/my-world",
      run: (async () => ({
        data: {
          ice_servers: [{ urls: "turn:app", username: "u", credential: "p" }],
          status: "turn",
        },
        requestId: "r",
      })) as never,
      diagnostic: (event) => events.push(event),
      fetch: async (url: string) => {
        if (url.endsWith("/ice")) return new Response("down", { status: 503 });
        return new Response(
          JSON.stringify({ session_id: "s", sdp: "a", type: "answer" }),
        );
      },
    });

    await wma().open(context, { endpointId: "me/my-world" });
    expect(peer.addTransceiver).toHaveBeenCalled();
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          phase: "ice-servers",
          detail: expect.objectContaining({
            source: "bridge-unavailable; trying app fallback",
          }),
        }),
        expect.objectContaining({
          phase: "ice-servers",
          detail: expect.objectContaining({
            source: "app-fallback",
            status: "turn",
          }),
        }),
      ]),
    );
  });

  it("times out stalled bridge ICE discovery before app fallback", async () => {
    jest.useFakeTimers();
    try {
      install();
      const bridgeSignals: AbortSignal[] = [];
      const run = jest.fn(async () => ({
        data: {
          ice_servers: [{ urls: "turn:app", username: "u", credential: "p" }],
          status: "turn",
        },
        requestId: "r",
      }));
      const context = fakeExtensionContext({
        endpointId: "me/my-world",
        run: run as never,
        fetch: async (url: string, init?: RequestInit) => {
          if (!url.endsWith("/ice")) {
            return new Response(
              JSON.stringify({ session_id: "s", sdp: "a", type: "answer" }),
            );
          }
          const signal = init?.signal as AbortSignal;
          bridgeSignals.push(signal);
          return new Promise<Response>((_resolve, reject) => {
            signal.addEventListener(
              "abort",
              () => reject(new DOMException("aborted", "AbortError")),
              { once: true },
            );
          });
        },
      });

      const opening = wma().open(context, { endpointId: "me/my-world" });
      await Promise.resolve();
      expect(bridgeSignals).toHaveLength(1);
      jest.advanceTimersByTime(5_000);
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();

      const session = await opening;
      expect(bridgeSignals[0].aborted).toBe(true);
      expect(run).toHaveBeenCalledWith("me/my-world/ice", {
        input: {},
        abortSignal: expect.any(AbortSignal),
      });
      await session.close();
    } finally {
      jest.useRealTimers();
    }
  });

  it("times out stalled app-local ICE before STUN fallback", async () => {
    jest.useFakeTimers();
    try {
      install();
      jest.spyOn(console, "warn").mockImplementation(() => undefined);
      const appSignals: AbortSignal[] = [];
      const context = fakeExtensionContext({
        endpointId: "me/my-world",
        run: (async (
          _endpoint: string,
          options: { abortSignal: AbortSignal },
        ) => {
          appSignals.push(options.abortSignal);
          return new Promise((_resolve, reject) => {
            options.abortSignal.addEventListener(
              "abort",
              () => reject(new DOMException("aborted", "AbortError")),
              { once: true },
            );
          });
        }) as never,
        fetch: async (url: string) => {
          if (url.endsWith("/ice")) {
            return new Response("down", { status: 503 });
          }
          return new Response(
            JSON.stringify({ session_id: "s", sdp: "a", type: "answer" }),
          );
        },
      });

      const opening = wma().open(context, { endpointId: "me/my-world" });
      await Promise.resolve();
      await Promise.resolve();
      expect(appSignals).toHaveLength(1);
      jest.advanceTimersByTime(5_000);
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();

      const session = await opening;
      expect(appSignals[0].aborted).toBe(true);
      expect(global.RTCPeerConnection).toHaveBeenCalledWith({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        iceTransportPolicy: undefined,
      });
      await session.close();
    } finally {
      jest.useRealTimers();
    }
  });

  it("falls back to app-managed ICE when the bridge withholds managed TURN", async () => {
    install();
    const events: unknown[] = [];
    const run = jest.fn(async () => ({
      data: {
        ice_servers: [{ urls: "turn:app", username: "u", credential: "p" }],
        status: "turn",
      },
      requestId: "r",
    }));
    const context = fakeExtensionContext({
      endpointId: "partner/my-world",
      run: run as never,
      diagnostic: (event) => events.push(event),
      fetch: async (url: string) =>
        new Response(
          url.endsWith("/ice")
            ? JSON.stringify({ ice_servers: [], status: "app_managed" })
            : JSON.stringify({ session_id: "s", sdp: "a", type: "answer" }),
        ),
    });

    await wma().open(context, { endpointId: "partner/my-world" });

    expect(run).toHaveBeenCalledWith("partner/my-world/ice", {
      input: {},
      abortSignal: expect.any(AbortSignal),
    });
    expect(global.RTCPeerConnection).toHaveBeenCalledWith({
      iceServers: [{ urls: "turn:app", username: "u", credential: "p" }],
      iceTransportPolicy: undefined,
    });
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          phase: "ice-servers",
          detail: { source: "app-managed; trying app fallback" },
        }),
      ]),
    );
  });

  it("times out a stalled session negotiation request", async () => {
    jest.useFakeTimers();
    try {
      install();
      const sessionSignals: AbortSignal[] = [];
      const context = fakeExtensionContext({
        endpointId: "me/my-world",
        fetch: async (url: string, init?: RequestInit) => {
          if (url.endsWith("/ice")) {
            return new Response(
              JSON.stringify({
                ice_servers: [{ urls: "stun:example" }],
                status: "stun_only",
              }),
            );
          }
          const signal = init?.signal as AbortSignal;
          sessionSignals.push(signal);
          return new Promise<Response>((_resolve, reject) => {
            signal.addEventListener(
              "abort",
              () => reject(new DOMException("aborted", "AbortError")),
              { once: true },
            );
          });
        },
      });

      const opening = wma().open(context, {
        endpointId: "me/my-world",
        iceServers: [{ urls: "stun:example" }],
      });
      for (let turn = 0; turn < 10 && sessionSignals.length === 0; turn++) {
        await Promise.resolve();
      }
      expect(sessionSignals).toHaveLength(1);

      jest.advanceTimersByTime(120_000);
      await expect(opening).rejects.toThrow(/aborted/i);
      expect(sessionSignals[0].aborted).toBe(true);
    } finally {
      jest.useRealTimers();
    }
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

    await wma().open(context, {
      endpointId: "me/my-world",
      iceTransportPolicy: "relay",
    });
    expect(gatherIce).toHaveBeenCalledTimes(1);
    // The servers must reach it, or "sufficient" cannot know a relay is required.
    expect(gatherIce.mock.calls[0][1]).toEqual({
      iceServers: [{ urls: "turn:example", username: "u", credential: "p" }],
      iceTransportPolicy: "relay",
    });
  });

  it("can require a TURN relay path", async () => {
    install();
    const context = fakeExtensionContext({
      endpointId: "me/my-world",
      gatherIce: async () => ({
        host: 0,
        srflx: 0,
        relay: 1,
        state: "sufficient",
      }),
      fetch: async (url: string) =>
        new Response(
          url.endsWith("/ice")
            ? JSON.stringify({
                ice_servers: [
                  {
                    urls: "turn:example",
                    username: "fixture-user",
                    credential: "fixture-credential",
                  },
                ],
                status: "turn",
              })
            : JSON.stringify({ session_id: "s", sdp: "a", type: "answer" }),
        ),
    });

    await wma().open(context, {
      endpointId: "me/my-world",
      iceTransportPolicy: "relay",
    });

    expect(global.RTCPeerConnection).toHaveBeenCalledWith({
      iceServers: [
        {
          urls: "turn:example",
          username: "fixture-user",
          credential: "fixture-credential",
        },
      ],
      iceTransportPolicy: "relay",
    });
  });

  it("does not start a relay-only session without a gathered relay candidate", async () => {
    install();
    const fetch = jest.fn(
      async (url: string) =>
        new Response(
          url.endsWith("/ice")
            ? JSON.stringify({
                ice_servers: [
                  {
                    urls: "turn:example",
                    username: "fixture-user",
                    credential: "fixture-credential",
                  },
                ],
                status: "turn",
              })
            : JSON.stringify({ session_id: "s", sdp: "a", type: "answer" }),
        ),
    );
    const context = fakeExtensionContext({
      endpointId: "me/my-world",
      fetch,
      gatherIce: async () => ({
        host: 0,
        srflx: 0,
        relay: 0,
        state: "timeout",
      }),
    });

    await expect(
      wma().open(context, {
        endpointId: "me/my-world",
        iceTransportPolicy: "relay",
      }),
    ).rejects.toThrow("ICE gathering produced no relay candidate");
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      "https://wma.fal.run/ice",
      expect.any(Object),
    );
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

    await wma().open(context, { endpointId: "me/my-world" });
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

  it("does not start app ICE fallback after bridge discovery is aborted", async () => {
    install();
    const controller = new AbortController();
    const reason = new Error("user cancelled");
    const run = jest.fn();
    const context = fakeExtensionContext({
      endpointId: "me/my-world",
      signal: controller.signal,
      run: run as never,
      fetch: async (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            "abort",
            () => reject(init.signal?.reason),
            { once: true },
          );
        }),
    });

    const opening = wma().open(context, { endpointId: "me/my-world" });
    controller.abort(reason);

    await expect(opening).rejects.toBe(reason);
    expect(run).not.toHaveBeenCalled();
    expect(global.RTCPeerConnection).not.toHaveBeenCalled();
  });

  it("observes ICE gathering when setting the local description fails", async () => {
    const { peer } = install();
    const localFailure = new Error("local description failed");
    const gatherFailure = new Error("gathering aborted");
    peer.setLocalDescription.mockRejectedValue(localFailure);
    let rejectGathering: (error: Error) => void = () => undefined;
    const gathering = new Promise<never>((_resolve, reject) => {
      rejectGathering = reject;
    });
    const context = fakeExtensionContext({
      endpointId: "me/my-world",
      gatherIce: () => gathering,
      fetch: async () =>
        new Response(JSON.stringify({ ice_servers: [{ urls: "stun:x" }] })),
    });

    const opening = wma().open(context, { endpointId: "me/my-world" });
    await expect(opening).rejects.toBe(localFailure);
    rejectGathering(gatherFailure);
    await Promise.resolve();
  });

  it("reports peer and control-channel transport death through context.fail", async () => {
    const { peer, channel } = install();
    const fail = jest.fn(async () => undefined);
    const context = fakeExtensionContext({
      endpointId: "me/my-world",
      fail,
      fetch: async (url: string) =>
        new Response(
          url.endsWith("/ice")
            ? JSON.stringify({ ice_servers: [{ urls: "stun:x" }] })
            : JSON.stringify({ session_id: "s", sdp: "a", type: "answer" }),
        ),
    });
    await wma().open(context, { endpointId: "me/my-world" });

    peer.connectionState = "failed";
    peer.onconnectionstatechange?.();
    expect(fail).toHaveBeenCalledWith(
      expect.stringContaining("ICE could not establish a path"),
      expect.objectContaining({ host: 0, srflx: 0, relay: 0 }),
    );

    channel.onclose?.();
    expect(fail).toHaveBeenCalledWith(
      expect.stringContaining("control data channel closed or errored"),
    );
  });

  it("fails when the bridge heartbeat reports that the session is gone", async () => {
    jest.useFakeTimers();
    try {
      const { channel } = install();
      const fail = jest.fn(async () => undefined);
      const context = fakeExtensionContext({
        endpointId: "me/my-world",
        fail,
        fetch: async (url: string) => {
          if (url.endsWith("/ice")) {
            return new Response(
              JSON.stringify({ ice_servers: [{ urls: "stun:x" }] }),
            );
          }
          if (url.endsWith("/heartbeat")) {
            return {
              ok: true,
              json: async () => ({ alive: false }),
            } as Response;
          }
          return new Response(
            JSON.stringify({ session_id: "s", sdp: "a", type: "answer" }),
          );
        },
      });
      const session = await wma().open(context, {
        endpointId: "me/my-world",
      });

      jest.advanceTimersByTime(5_000);
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();

      expect(fail).toHaveBeenCalledWith(
        "WMA bridge reports that the session is no longer alive",
      );
      await session.close();
      expect(channel.close).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });

  it("drains the body of a non-OK heartbeat response", async () => {
    // The kernel releases each request's signal bookkeeping when the body is consumed, so a
    // degraded bridge answering every beat with an error must not retain one combination per
    // heartbeat for the life of the session.
    jest.useFakeTimers();
    try {
      install();
      const drained = jest.fn(async () => new ArrayBuffer(0));
      const context = fakeExtensionContext({
        endpointId: "me/my-world",
        fetch: async (url: string) => {
          if (url.endsWith("/ice")) {
            return new Response(
              JSON.stringify({ ice_servers: [{ urls: "stun:x" }] }),
            );
          }
          if (url.endsWith("/heartbeat")) {
            return {
              ok: false,
              status: 503,
              arrayBuffer: drained,
            } as unknown as Response;
          }
          return new Response(
            JSON.stringify({ session_id: "s", sdp: "a", type: "answer" }),
          );
        },
      });
      const session = await wma().open(context, {
        endpointId: "me/my-world",
      });

      jest.advanceTimersByTime(5_000);
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();

      expect(drained).toHaveBeenCalledTimes(1);
      await session.close();
    } finally {
      jest.useRealTimers();
    }
  });

  it("ignores a dead heartbeat response that finishes after close", async () => {
    jest.useFakeTimers();
    try {
      install();
      let finishHeartbeat!: (status: { alive: boolean }) => void;
      const heartbeatStatus = new Promise<{ alive: boolean }>((resolve) => {
        finishHeartbeat = resolve;
      });
      const heartbeatJson = jest.fn(() => heartbeatStatus);
      const fail = jest.fn(async () => undefined);
      const context = fakeExtensionContext({
        endpointId: "me/my-world",
        fail,
        fetch: async (url: string) => {
          if (url.endsWith("/ice")) {
            return new Response(
              JSON.stringify({ ice_servers: [{ urls: "stun:x" }] }),
            );
          }
          if (url.endsWith("/heartbeat")) {
            return { ok: true, json: heartbeatJson } as unknown as Response;
          }
          return new Response(
            JSON.stringify({ session_id: "s", sdp: "a", type: "answer" }),
          );
        },
      });
      const session = await wma().open(context, {
        endpointId: "me/my-world",
      });

      jest.advanceTimersByTime(5_000);
      await Promise.resolve();
      await Promise.resolve();
      expect(heartbeatJson).toHaveBeenCalledTimes(1);

      await session.close();
      finishHeartbeat({ alive: false });
      await Promise.resolve();
      await Promise.resolve();

      expect(fail).not.toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });

  it("times out a stalled heartbeat and retries on the next tick", async () => {
    jest.useFakeTimers();
    try {
      install();
      const heartbeatSignals: AbortSignal[] = [];
      const context = fakeExtensionContext({
        endpointId: "me/my-world",
        fetch: async (url: string, init?: RequestInit) => {
          if (url.endsWith("/ice")) {
            return new Response(
              JSON.stringify({ ice_servers: [{ urls: "stun:x" }] }),
            );
          }
          if (!url.endsWith("/heartbeat")) {
            return new Response(
              JSON.stringify({ session_id: "s", sdp: "a", type: "answer" }),
            );
          }
          const signal = init?.signal as AbortSignal;
          heartbeatSignals.push(signal);
          return new Promise<Response>((_resolve, reject) => {
            signal.addEventListener(
              "abort",
              () => reject(new DOMException("aborted", "AbortError")),
              { once: true },
            );
          });
        },
      });
      const session = await wma().open(context, {
        endpointId: "me/my-world",
      });

      jest.advanceTimersByTime(5_000);
      await Promise.resolve();
      expect(heartbeatSignals).toHaveLength(1);
      expect(heartbeatSignals[0].aborted).toBe(false);

      jest.advanceTimersByTime(3_999);
      expect(heartbeatSignals[0].aborted).toBe(false);
      jest.advanceTimersByTime(1);
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      expect(heartbeatSignals[0].aborted).toBe(true);

      jest.advanceTimersByTime(1_000);
      await Promise.resolve();
      expect(heartbeatSignals).toHaveLength(2);
      await session.close();
      expect(heartbeatSignals[1].aborted).toBe(true);
    } finally {
      jest.useRealTimers();
    }
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
      wma().open(context, { endpointId: "me/my-world" }),
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

    const session = await wma().open(context, {
      endpointId: "me/transform",
      localStream: stream,
      direction: "sendonly",
    });

    expect(peer.addTrack).not.toHaveBeenCalled();
    expect(peer.addTransceiver).toHaveBeenCalledWith(track, {
      direction: "sendonly",
      streams: [stream],
    });
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
    await wma().open(context, { endpointId: "me/out" });
    expect(peer.addTransceiver).toHaveBeenCalledWith("video", {
      direction: "recvonly",
    });
  });

  it("publishes inbound media and data through the KERNEL, not its own options", async () => {
    // Guards the seam rather than the behaviour. An extension that published these through options of
    // its own would compile and work, and would force an application offering two protocols to branch
    // per protocol to do one thing: attach a video element.
    const { peer, channel } = install();
    const seenMedia: MediaStream[] = [];
    const seenData: string[] = [];
    const context = fakeExtensionContext({
      endpointId: "me/world",
      run: (async () => ({
        data: { ice_servers: [{ urls: "stun:x" }] },
        requestId: "r",
      })) as never,
      fetch: async () =>
        new Response(
          JSON.stringify({ session_id: "s", sdp: "a", type: "answer" }),
        ),
      media: (stream: MediaStream) => void seenMedia.push(stream),
      data: (raw: string) => void seenData.push(raw),
    });

    await wma().open(context, { endpointId: "me/world" });

    const stream = { id: "remote" } as unknown as MediaStream;
    const secondStream = { id: "remote-secondary" } as unknown as MediaStream;
    (peer.ontrack as (event: unknown) => void)({
      streams: [stream, secondStream],
      track: {},
    });
    (peer.ontrack as (event: unknown) => void)({
      streams: [stream, secondStream],
      track: {},
    });
    expect(seenMedia).toEqual([stream, secondStream]);

    channel.onmessage?.({ data: '{"type":"session_info"}' });
    channel.onmessage?.({ data: '{"type":"pong","ts":1}' });
    expect(seenData).toEqual([
      '{"type":"session_info"}',
      '{"type":"pong","ts":1}',
    ]);
  });

  it("synthesises a stream when the track arrives without one", async () => {
    // Some implementations deliver `track` with an empty `streams`. Dropping the media entirely in
    // that case would be a silent black video.
    //
    // MediaStream is stubbed because jsdom has none — every browser does, so this is a gap in the
    // test environment rather than in the code. Worth stating: the construction happens INSIDE
    // pc.ontrack, before the kernel's error guard can wrap it, so an environment that provides
    // RTCPeerConnection without MediaStream would throw where no caller can catch it.
    const tracks: unknown[] = [];
    (global as unknown as { MediaStream: unknown }).MediaStream = class {
      constructor(input: unknown[]) {
        tracks.push(...input);
      }
    };
    const { peer } = install();
    const seen: MediaStream[] = [];
    const context = fakeExtensionContext({
      endpointId: "me/world",
      run: (async () => ({
        data: { ice_servers: [{ urls: "stun:x" }] },
        requestId: "r",
      })) as never,
      fetch: async () =>
        new Response(
          JSON.stringify({ session_id: "s", sdp: "a", type: "answer" }),
        ),
      media: (stream: MediaStream) => void seen.push(stream),
    });
    await wma().open(context, { endpointId: "me/world" });
    const track = { kind: "video" };
    (peer.ontrack as (event: unknown) => void)({ streams: [], track });
    expect(seen).toHaveLength(1);
    expect(tracks).toEqual([track]);
  });

  it("claims no endpoints, and opens the one it was given", async () => {
    // An endpoint's NAME cannot reveal whether it speaks this transport, so this extension states no
    // constraint at all rather than asserting one it cannot back up.
    expect(wma().supports).toBeUndefined();
    expect(wma("me/my-world").defaultEndpoint).toBe("me/my-world");
    expect(wma().defaultEndpoint).toBeUndefined();
  });
});
