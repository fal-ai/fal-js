/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * The fal realtime wire protocol: URL, framing, and result classification.
 *
 * `connect()` and the `websocket()` extension use these shared functions rather than parallel
 * implementations that can drift. The two differ only in
 * WHEN they open a socket and who owns its lifecycle; if they also differed in what they put on it,
 * offering both would be offering two protocols under one name.
 */
import { decode, encode } from "@msgpack/msgpack";
import { ensureEndpointIdFormat, resolveEndpointPath } from "../utils";

/** Matches `connect()`'s default, and the interval realtime apps were tuned against. */
export const DEFAULT_THROTTLE_INTERVAL = 128;

/** See https://www.rfc-editor.org/rfc/rfc6455.html#section-7.4.1 */
export const WebSocketErrorCodes = {
  NORMAL_CLOSURE: 1000,
  GOING_AWAY: 1001,
};

export type WithRequestId = {
  request_id: string;
};

export type RealtimeUrlParams = {
  token: string;
  maxBuffering?: number;
  path?: string;
};

export function buildRealtimeUrl(
  app: string,
  { token, maxBuffering, path }: RealtimeUrlParams,
): string {
  if (maxBuffering !== undefined && (maxBuffering < 1 || maxBuffering > 60)) {
    throw new Error("The `maxBuffering` must be between 1 and 60 (inclusive)");
  }
  const queryParams = new URLSearchParams({
    fal_jwt_token: token,
  });
  if (maxBuffering !== undefined) {
    queryParams.set("max_buffering", maxBuffering.toFixed(0));
  }
  const appId = ensureEndpointIdFormat(app);
  const resolvedPath = resolveEndpointPath(app, path, "/realtime") ?? "";
  return `wss://fal.run/${appId}${resolvedPath}?${queryParams.toString()}`;
}

/** The endpoint the token is minted for: the app id plus the resolved realtime path. */
export function realtimeTokenScope(app: string, path?: string): string {
  // Deliberately stricter than run()/stream(), which accept full fal URLs: the realtime socket
  // address is DERIVED from the id (wss://fal.run/<id>/...), so a URL can never resolve to a
  // valid socket — the error names that instead of a generic invalid-endpoint.
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(app.trim())) {
    throw new Error(
      'Realtime endpoints take an app id like "owner/app", not a URL — the socket address ' +
        "is derived from the id.",
    );
  }
  return `${ensureEndpointIdFormat(app)}${resolveEndpointPath(app, path, "/realtime") ?? ""}`;
}

export function isUnauthorizedError(message: any): boolean {
  // TODO we need better protocol definition with error codes
  return message["status"] === "error" && message["error"] === "Unauthorized";
}

export function isSuccessfulResult(data: any): boolean {
  return (
    data.status !== "error" &&
    data.type !== "x-fal-message" &&
    !isFalErrorResult(data)
  );
}

export type FalErrorResult = {
  type: "x-fal-error";
  error: string;
  reason: string;
};

export function isFalErrorResult(data: any): data is FalErrorResult {
  return data.type === "x-fal-error";
}

export async function decodeRealtimeMessage(data: any): Promise<any> {
  if (typeof data === "string") {
    return JSON.parse(data);
  }

  const toUint8Array = async (
    value: ArrayBuffer | Uint8Array | Blob,
  ): Promise<Uint8Array> => {
    if (value instanceof Uint8Array) {
      return value;
    }
    if (value instanceof Blob) {
      return new Uint8Array(await value.arrayBuffer());
    }
    return new Uint8Array(value);
  };

  if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
    return decode(await toUint8Array(data));
  }
  if (data instanceof Blob) {
    return decode(await toUint8Array(data));
  }

  return data;
}

export function encodeRealtimeMessage(input: any): Uint8Array | string {
  if (input instanceof Uint8Array) {
    return input;
  }
  if (typeof input === "string") {
    return encode(input);
  }
  return encode(input);
}
