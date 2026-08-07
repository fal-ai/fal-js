import {
  gatherIceCandidates,
  hasTurnServer,
  parseIceCandidateType,
} from "./ice";

/** A peer connection just real enough to drive the gathering strategy. */
function fakePc() {
  const listeners: Record<string, Array<(event: any) => void>> = {};
  return {
    iceGatheringState: "gathering" as RTCIceGatheringState,
    addEventListener: (type: string, fn: any) => {
      (listeners[type] ??= []).push(fn);
    },
    removeEventListener: (type: string, fn: any) => {
      listeners[type] = (listeners[type] ?? []).filter((f) => f !== fn);
    },
    emitCandidate(candidate: string | null) {
      for (const fn of listeners["icecandidate"] ?? []) {
        fn({ candidate: candidate ? { candidate } : null });
      }
    },
    complete() {
      this.iceGatheringState = "complete";
      for (const fn of listeners["icegatheringstatechange"] ?? []) fn({});
    },
  };
}

const line = (type: string) => `candidate:1 1 udp 1 1.2.3.4 1 typ ${type}`;

describe("parseIceCandidateType", () => {
  it("reads the candidate type", () => {
    expect(parseIceCandidateType(line("host"))).toBe("host");
    expect(parseIceCandidateType(line("srflx"))).toBe("srflx");
    expect(parseIceCandidateType(line("relay"))).toBe("relay");
  });

  it("returns null rather than guessing", () => {
    expect(parseIceCandidateType("candidate:1 1 udp 1 1.2.3.4 1")).toBeNull();
  });
});

describe("hasTurnServer", () => {
  it("finds turn and turns among string or array urls", () => {
    expect(hasTurnServer([{ urls: "turn:example:3478" }])).toBe(true);
    expect(hasTurnServer([{ urls: ["stun:a", "turns:b"] }])).toBe(true);
    expect(hasTurnServer([{ urls: "stun:example:19302" }])).toBe(false);
  });
});

describe("gatherIceCandidates", () => {
  it("settles on a sufficient set after the quiet period", async () => {
    const pc = fakePc();
    const done = gatherIceCandidates(pc as any, { quietPeriodMs: 20 });
    pc.emitCandidate(line("host"));
    pc.emitCandidate(line("srflx"));
    const result = await done;
    expect(result).toEqual({
      host: 1,
      srflx: 1,
      relay: 0,
      state: "sufficient",
    });
  });

  it("is NOT sufficient without a relay when TURN is configured", async () => {
    // The case that matters: shipping an offer with no relay candidate while TURN is configured
    // produces a connection that cannot work, and reports nothing about why.
    const pc = fakePc();
    const done = gatherIceCandidates(pc as any, {
      iceServers: [{ urls: "turn:example:3478" }],
      quietPeriodMs: 15,
      timeoutMs: 90,
    });
    pc.emitCandidate(line("host"));
    pc.emitCandidate(line("srflx"));
    const result = await done;
    expect(result.state).toBe("timeout");
    expect(result.relay).toBe(0);
  });

  it("settles once the relay arrives when TURN is configured", async () => {
    const pc = fakePc();
    const done = gatherIceCandidates(pc as any, {
      iceServers: [{ urls: "turn:example:3478" }],
      quietPeriodMs: 15,
    });
    pc.emitCandidate(line("srflx"));
    pc.emitCandidate(line("relay"));
    const result = await done;
    expect(result).toEqual({
      host: 0,
      srflx: 1,
      relay: 1,
      state: "sufficient",
    });
  });

  it("a later candidate restarts the quiet period", async () => {
    const pc = fakePc();
    const done = gatherIceCandidates(pc as any, { quietPeriodMs: 40 });
    pc.emitCandidate(line("srflx"));
    await new Promise((r) => setTimeout(r, 25));
    pc.emitCandidate(line("srflx"));
    const result = await done;
    // Both counted: settling on the first would have put a half-gathered set in the SDP.
    expect(result.srflx).toBe(2);
  });

  it("resolves immediately when gathering already completed", async () => {
    const pc = fakePc();
    pc.iceGatheringState = "complete";
    await expect(gatherIceCandidates(pc as any)).resolves.toEqual({
      host: 0,
      srflx: 0,
      relay: 0,
      state: "complete",
    });
  });

  it("prefers completion over the hard bound", async () => {
    const pc = fakePc();
    const done = gatherIceCandidates(pc as any, { timeoutMs: 500 });
    pc.emitCandidate(line("host"));
    pc.complete();
    expect((await done).state).toBe("complete");
  });
});
