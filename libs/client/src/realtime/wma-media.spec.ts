import {
  applyWmaCodecPreferences,
  applyWmaOpusPreferences,
  normalizeWmaReceiveTrack,
  type WmaReceiveTrack,
} from "./wma-media";

const audio =
  [
    "m=audio 9 UDP/TLS/RTP/SAVPF 111 0",
    "a=mid:0",
    "a=rtpmap:111 opus/48000/2",
    "a=fmtp:111 minptime=10;useinbandfec=1;sprop-stereo=1;stereo=0",
    "a=rtpmap:0 PCMU/8000",
    "a=recvonly",
  ].join("\r\n") + "\r\n";
const video = "m=video 9 UDP/TLS/RTP/SAVPF 96\r\na=rtpmap:96 VP8/90000\r\n";
const data =
  "m=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\na=sctp-port:5000\r\n";
const music = normalizeWmaReceiveTrack({
  kind: "audio",
  opus: { stereo: true, maxAverageBitrate: 192000 },
});

describe("WMA receive preferences", () => {
  it.each([
    "audio",
    "video",
    { kind: "audio" },
    { kind: "audio", opus: {} },
    { kind: "video", codecPreferences: [] },
  ])(
    "keeps default SDP byte-for-byte and requires no new browser APIs: %p",
    (entry) => {
      const track = normalizeWmaReceiveTrack(entry as WmaReceiveTrack);
      const sdp = "v=0\r\n" + audio + video + data;
      expect(applyWmaOpusPreferences(sdp, [track])).toBe(sdp);
      expect(() =>
        applyWmaCodecPreferences({} as RTCRtpTransceiver, track, jest.fn()),
      ).not.toThrow();
    },
  );

  it("snapshots options so mutations while gathering cannot change the offer", () => {
    const source = {
      kind: "audio" as const,
      opus: { stereo: true },
      codecPreferences: ["audio/OPUS"],
    };
    const normalized = normalizeWmaReceiveTrack(source);
    source.opus.stereo = false;
    source.codecPreferences[0] = "audio/PCMU";
    expect(normalized).toEqual({
      kind: "audio",
      opus: { stereo: true },
      codecPreferences: ["audio/opus"],
    });
  });

  it.each([
    null,
    "text",
    { kind: "video", opus: {} },
    { kind: "audio", opus: [] },
    { kind: "audio", opus: { stereo: 1 } },
    { kind: "audio", codecPreferences: ["video/H264"] },
    { kind: "video", codecPreferences: "video/VP8" },
    ...[0, 5999, 510001, 1.5, NaN, Infinity, "192000"].map(
      (maxAverageBitrate) => ({ kind: "audio", opus: { maxAverageBitrate } }),
    ),
  ])("rejects invalid opt-in settings: %p", (entry) => {
    expect(() => normalizeWmaReceiveTrack(entry as WmaReceiveTrack)).toThrow();
  });

  it.each([6000, 192000, 510000])(
    "accepts RFC bitrate bounds: %i",
    (maxAverageBitrate) => {
      expect(
        normalizeWmaReceiveTrack({ kind: "audio", opus: { maxAverageBitrate } })
          .opus?.maxAverageBitrate,
      ).toBe(maxAverageBitrate);
    },
  );

  it.each(["\r\n", "\n"])(
    "edits only the requested audio slot, preserving other media and Opus parameters (%p)",
    (newline) => {
      const sdp = ("v=0\r\n" + video + audio + audio + data).replace(
        /\r\n/g,
        newline,
      );
      const result = applyWmaOpusPreferences(sdp, [
        { kind: "video" },
        music,
        { kind: "audio" },
      ]);
      const expected = sdp.replace(
        "sprop-stereo=1;stereo=0",
        "sprop-stereo=1;stereo=1;maxaveragebitrate=192000",
      );
      expect(result).toBe(expected);
      expect(
        applyWmaOpusPreferences(result, [
          { kind: "video" },
          music,
          { kind: "audio" },
        ]),
      ).toBe(result);
    },
  );

  it("adds missing fmtp and supports separate preferences on multiple audio slots", () => {
    const bare = audio.replace(/^a=fmtp:.*\r\n/m, "");
    const result = applyWmaOpusPreferences(bare + audio, [
      music,
      { kind: "audio", opus: { stereo: false } },
    ]);
    expect(result).toContain(
      "a=rtpmap:111 opus/48000/2\r\na=fmtp:111 stereo=1;maxaveragebitrate=192000\r\n",
    );
    expect(result.endsWith(audio)).toBe(true);
  });

  it("preserves an unspecified bitrate or stereo preference, including a sendrecv slot", () => {
    const sdp = audio
      .replace("stereo=0\r", "stereo=0;maxaveragebitrate=64000\r")
      .replace("a=recvonly", "a=sendrecv");
    expect(
      applyWmaOpusPreferences(sdp, [{ kind: "audio", opus: { stereo: true } }]),
    ).toBe(
      sdp.replace(
        ";stereo=0;maxaveragebitrate=64000",
        ";maxaveragebitrate=64000;stereo=1",
      ),
    );
    expect(
      applyWmaOpusPreferences(audio, [
        { kind: "audio", opus: { maxAverageBitrate: 192000 } },
      ]),
    ).toContain("sprop-stereo=1;stereo=0;maxaveragebitrate=192000");
  });

  it("fails explicitly rather than claiming Opus settings worked without Opus", () => {
    expect(() => applyWmaOpusPreferences(video, [music])).toThrow(
      "section is missing",
    );
    expect(() =>
      applyWmaOpusPreferences(
        "m=audio 9 UDP/TLS/RTP/SAVPF 0\r\na=rtpmap:0 PCMU/8000\r\n",
        [music],
      ),
    ).toThrow("offered Opus");
  });
});

describe("WMA codec ordering", () => {
  const originalReceiver = global.RTCRtpReceiver;
  afterEach(() => {
    global.RTCRtpReceiver = originalReceiver;
  });
  const codecs = [
    { mimeType: "video/VP8", clockRate: 90000 },
    { mimeType: "video/rtx", clockRate: 90000 },
    {
      mimeType: "video/H264",
      clockRate: 90000,
      sdpFmtpLine: "profile-level-id=42e01f",
    },
    {
      mimeType: "video/H264",
      clockRate: 90000,
      sdpFmtpLine: "profile-level-id=64001f",
    },
    { mimeType: "video/red", clockRate: 90000 },
    { mimeType: "video/ulpfec", clockRate: 90000 },
  ];
  function receiver() {
    global.RTCRtpReceiver = {
      getCapabilities: jest.fn(() => ({ codecs })),
    } as unknown as typeof RTCRtpReceiver;
    const setCodecPreferences = jest.fn();
    return {
      transceiver: { setCodecPreferences } as unknown as RTCRtpTransceiver,
      setCodecPreferences,
    };
  }
  it("reorders MIME preferences without losing profiles, fallback or repair codecs", () => {
    const { transceiver, setCodecPreferences } = receiver();
    const warn = jest.fn();
    applyWmaCodecPreferences(
      transceiver,
      normalizeWmaReceiveTrack({
        kind: "video",
        codecPreferences: ["video/H264", "video/AV1", "video/VP8"],
      }),
      warn,
    );
    expect(setCodecPreferences).toHaveBeenCalledWith([
      codecs[2],
      codecs[3],
      codecs[0],
      codecs[1],
      codecs[4],
      codecs[5],
    ]);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("video/av1 is unavailable"),
    );
    expect(codecs[0].mimeType).toBe("video/VP8");
  });
  it("leaves browser defaults when no preferred codec is available", () => {
    const { transceiver, setCodecPreferences } = receiver();
    applyWmaCodecPreferences(
      transceiver,
      { kind: "video", codecPreferences: ["video/av1"] },
      jest.fn(),
    );
    expect(setCodecPreferences).not.toHaveBeenCalled();
  });
  it("reports unsupported browser APIs only for an explicit preference", () => {
    expect(() =>
      applyWmaCodecPreferences(
        {} as RTCRtpTransceiver,
        { kind: "video", codecPreferences: ["video/vp8"] },
        jest.fn(),
      ),
    ).toThrow("not supported");
  });
});
