/** A WebRTC media kind the browser should offer to receive from the model. */
export type WmaReceiveTrackKind = "audio" | "video";

/** Optional Opus receive preferences; not a setting for the browser's sender. */
export interface WmaOpusReceiveOptions {
  /** Prefer stereo (true) or mono (false). Omit to keep the browser default. */
  stereo?: boolean;
  /** Receive ceiling in bits/s, an integer from 6000 to 510000, not a target. */
  maxAverageBitrate?: number;
}

/** Optional, connection-time preferences for one receive slot. */
export type WmaReceiveTrackOptions = {
  /**
   * Preferred codec MIME types, in order (for example ["video/H264", "video/VP8"]).
   * Unavailable codecs are skipped with a diagnostic; all browser fallback and repair codecs
   * remain offered. Requires browser support for setCodecPreferences when nonempty.
   */
  codecPreferences?: readonly string[];
} & (
  | { kind: "audio"; opus?: WmaOpusReceiveOptions }
  | { kind: "video"; opus?: never }
);

/** Strings retain the browser defaults; objects opt into per-slot preferences. */
export type WmaReceiveTrack = WmaReceiveTrackKind | WmaReceiveTrackOptions;

/** Validate and snapshot options before any asynchronous ICE discovery. */
export function normalizeWmaReceiveTrack(
  track: WmaReceiveTrack,
): WmaReceiveTrackOptions {
  const value: WmaReceiveTrackOptions =
    typeof track === "string" ? { kind: track } : track;
  if (!value || (value.kind !== "audio" && value.kind !== "video")) {
    throw new TypeError("WMA receive kind must be audio or video.");
  }
  const codecs = value.codecPreferences;
  if (
    codecs !== undefined &&
    (!Array.isArray(codecs) ||
      codecs.some(
        (codec) =>
          typeof codec !== "string" ||
          !new RegExp(`^${value.kind}/[a-z0-9.+_-]+$`, "i").test(codec),
      ))
  ) {
    throw new TypeError(
      "WMA codecPreferences must contain MIME types matching the track kind.",
    );
  }
  const opus = value.opus;
  if (opus !== undefined) {
    if (
      value.kind !== "audio" ||
      !opus ||
      typeof opus !== "object" ||
      Array.isArray(opus)
    ) {
      throw new TypeError(
        "WMA Opus preferences require an audio receive track.",
      );
    }
    if (opus.stereo !== undefined && typeof opus.stereo !== "boolean") {
      throw new TypeError("WMA Opus stereo must be a boolean.");
    }
    const bitrate = opus.maxAverageBitrate;
    if (
      bitrate !== undefined &&
      (!Number.isInteger(bitrate) || bitrate < 6000 || bitrate > 510000)
    ) {
      throw new TypeError(
        "WMA Opus maxAverageBitrate must be an integer from 6000 to 510000 bits/s.",
      );
    }
  }
  const common = {
    ...(codecs !== undefined
      ? { codecPreferences: codecs.map((codec) => codec.toLowerCase()) }
      : {}),
  };
  return value.kind === "audio"
    ? {
        ...common,
        kind: "audio",
        ...(opus !== undefined ? { opus: { ...opus } } : {}),
      }
    : { ...common, kind: "video" };
}

export function applyWmaCodecPreferences(
  transceiver: RTCRtpTransceiver,
  track: WmaReceiveTrackOptions,
  warn: (message: string) => void,
): void {
  const preferred = track.codecPreferences;
  if (!preferred?.length) return;
  if (
    typeof transceiver.setCodecPreferences !== "function" ||
    typeof RTCRtpReceiver === "undefined" ||
    typeof RTCRtpReceiver.getCapabilities !== "function"
  ) {
    throw new Error("WMA codecPreferences are not supported by this browser.");
  }
  const codecs = RTCRtpReceiver.getCapabilities(track.kind)?.codecs ?? [];
  for (const mime of preferred) {
    if (!codecs.some((codec) => codec.mimeType.toLowerCase() === mime)) {
      warn(
        `WMA receive codec ${mime} is unavailable; retaining browser fallbacks.`,
      );
    }
  }
  if (!codecs.some((codec) => preferred.includes(codec.mimeType.toLowerCase())))
    return;
  const rank = (mime: string) => {
    const index = preferred.indexOf(mime.toLowerCase());
    return index === -1 ? preferred.length : index;
  };
  // Retain every profile and repair codec; only their preference order changes.
  transceiver.setCodecPreferences(
    [...codecs].sort((a, b) => rank(a.mimeType) - rank(b.mimeType)),
  );
}

/**
 * Only touch explicitly configured Opus fmtp parameters in the matching receive section.
 * Receive slots are created first, in array order, on this fresh peer connection.
 * Run before setLocalDescription so the browser and the bridge see the same offer.
 */
export function applyWmaOpusPreferences(
  sdp: string,
  tracks: readonly WmaReceiveTrackOptions[],
): string {
  if (
    !tracks.some(
      (track) =>
        track.opus?.stereo !== undefined ||
        track.opus?.maxAverageBitrate !== undefined,
    )
  )
    return sdp;
  const sections = sdp.split(/(?=^m=)/m);
  const offset = sections[0].startsWith("m=") ? 0 : 1;
  tracks.forEach((track, index) => {
    const options = track.opus;
    if (
      !options ||
      (options.stereo === undefined && options.maxAverageBitrate === undefined)
    )
      return;
    const section = sections[offset + index];
    if (!section?.startsWith("m=audio "))
      throw new Error("WMA Opus receive section is missing.");
    const newline = section.includes("\r\n") ? "\r\n" : "\n";
    const lines = section.split(newline);
    const payloads = lines.flatMap((line) => {
      const match = /^a=rtpmap:(\d+) opus\/48000\/2\s*$/i.exec(line);
      return match ? [match[1]] : [];
    });
    if (!payloads.length)
      throw new Error("WMA Opus preferences require an offered Opus codec.");
    const parameters: Record<string, string> = {};
    if (options.stereo !== undefined)
      parameters.stereo = options.stereo ? "1" : "0";
    if (options.maxAverageBitrate !== undefined)
      parameters.maxaveragebitrate = String(options.maxAverageBitrate);
    for (const payload of payloads) {
      const prefix = `a=fmtp:${payload} `;
      const fmtpIndex = lines.findIndex((line) => line.startsWith(prefix));
      const previous =
        fmtpIndex === -1
          ? []
          : lines[fmtpIndex].slice(prefix.length).split(";");
      const retained = previous.filter(
        (parameter) =>
          !Object.prototype.hasOwnProperty.call(
            parameters,
            parameter.split("=")[0].trim().toLowerCase(),
          ),
      );
      const fmtp =
        prefix +
        [
          ...retained,
          ...Object.entries(parameters).map(
            ([key, value]) => `${key}=${value}`,
          ),
        ].join(";");
      if (fmtpIndex !== -1) lines[fmtpIndex] = fmtp;
      else {
        const rtpIndex = lines.findIndex((line) =>
          line.toLowerCase().startsWith(`a=rtpmap:${payload} `),
        );
        lines.splice(rtpIndex + 1, 0, fmtp);
      }
    }
    sections[offset + index] = lines.join(newline);
  });
  return sections.join("");
}
