import { createConfig, type RequiredConfig } from "./config";
import { ApiError } from "./response";
import {
  buildObjectLifecycleHeaders,
  createStorageClient,
  DEFAULT_MULTIPART_CHUNK_SIZE,
  getExpirationDurationSeconds,
  MULTIPART_THRESHOLD,
  MultipartUploadError,
  OBJECT_LIFECYCYLE_PREFERENCE_HEADER,
  type UploadProgress,
} from "./storage";

jest.mock("./request", () => {
  const actual = jest.requireActual("./request");
  return {
    ...actual,
    dispatchRequest: jest.fn(),
  };
});

import { dispatchRequest } from "./request";

describe("storage lifecycle settings", () => {
  it("converts expiresIn aliases to duration seconds", () => {
    expect(getExpirationDurationSeconds({ expiresIn: "1h" })).toBe(3600);
    expect(getExpirationDurationSeconds({ expiresIn: "immediate" })).toBe(60);
    expect(
      getExpirationDurationSeconds({ expiresIn: "never" }),
    ).toBeUndefined();
    expect(getExpirationDurationSeconds({ expiresIn: 120 })).toBe(120);
    expect(getExpirationDurationSeconds({})).toBeUndefined();
  });

  it("builds lifecycle headers for immediate expiration", () => {
    const headers = buildObjectLifecycleHeaders({ expiresIn: "immediate" });
    expect(headers).toEqual({
      [OBJECT_LIFECYCYLE_PREFERENCE_HEADER]: JSON.stringify({
        expiration_duration_seconds: 60,
      }),
    });
  });

  it("includes initialAcl in lifecycle headers", () => {
    const headers = buildObjectLifecycleHeaders({
      expiresIn: "immediate",
      initialAcl: {
        default: "forbid",
        rules: [{ user: "usr_123", decision: "allow" }],
      },
    });

    expect(headers).toEqual({
      [OBJECT_LIFECYCYLE_PREFERENCE_HEADER]: JSON.stringify({
        expiration_duration_seconds: 60,
        initial_acl: {
          default: "forbid",
          rules: [{ user: "usr_123", decision: "allow" }],
        },
      }),
    });
  });

  it("maps never to no expiration duration", () => {
    const headers = buildObjectLifecycleHeaders({ expiresIn: "never" });
    expect(headers).toEqual({});
  });

  it("omits lifecycle headers when no lifecycle fields are set", () => {
    expect(buildObjectLifecycleHeaders({})).toEqual({});
  });
});

describe("multipart upload", () => {
  const CHUNK_SIZE = DEFAULT_MULTIPART_CHUNK_SIZE;
  const FILE_SIZE = MULTIPART_THRESHOLD + 1;
  const EXPECTED_PARTS = Math.ceil(FILE_SIZE / CHUNK_SIZE);
  const UPLOAD_URL = "https://cdn.test/upload/abc123?token=t";
  const FILE_URL = "https://cdn.test/files/abc123";

  // A byte at every part boundary marks which offset a chunk was sliced from.
  const largeFile = (() => {
    const data = new Uint8Array(FILE_SIZE);
    for (let offset = 0; offset < FILE_SIZE; offset += CHUNK_SIZE) {
      data[offset] = offset / CHUNK_SIZE + 1;
    }
    return new Blob([data], { type: "video/mp4" });
  })();

  function jsonResponse(
    body: unknown,
    init: { status?: number; etag?: string } = {},
  ): Response {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (init.etag) {
      headers["etag"] = init.etag;
    }
    return new Response(JSON.stringify(body), {
      status: init.status ?? 200,
      headers,
    });
  }

  function partNumberOf(url: string): number {
    return Number(new URL(url).pathname.split("/").pop());
  }

  type PartAttempt = { partNumber: number; size: number; marker: number };

  function createConfigWith(fetchImpl: typeof fetch): RequiredConfig {
    return createConfig({
      credentials: "test-key",
      fetch: fetchImpl,
      retry: { baseDelay: 0, maxDelay: 0, enableJitter: false },
    });
  }

  beforeEach(() => {
    (dispatchRequest as jest.Mock).mockReset();
    (dispatchRequest as jest.Mock).mockResolvedValue({
      upload_url: UPLOAD_URL,
      file_url: FILE_URL,
    });
  });

  it("uploads every part exactly once, one at a time", async () => {
    const attempts: PartAttempt[] = [];
    let inFlight = 0;
    let maxInFlight = 0;
    let completeBody: { parts: { partNumber: number; etag: string }[] } | null =
      null;

    const fetchImpl = jest.fn(async (url: string, init: RequestInit) => {
      if (url.endsWith("/complete?token=t")) {
        completeBody = JSON.parse(init.body as string);
        return jsonResponse({ ok: true });
      }
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      const partNumber = partNumberOf(url);
      const chunk = init.body as Blob;
      const marker = new Uint8Array(await chunk.slice(0, 1).arrayBuffer())[0];
      attempts.push({ partNumber, size: chunk.size, marker });
      // Hold the part open long enough that an overlapping upload would show up
      // in maxInFlight.
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight--;
      return jsonResponse({ partNumber, etag: `"etag-${partNumber}"` });
    }) as unknown as typeof fetch;

    const storage = createStorageClient({
      config: createConfigWith(fetchImpl),
    });
    const url = await storage.upload(largeFile);

    expect(url).toBe(FILE_URL);
    expect(maxInFlight).toBe(1);
    expect(attempts).toHaveLength(EXPECTED_PARTS);
    expect(
      attempts.map((attempt) => attempt.partNumber).sort((a, b) => a - b),
    ).toEqual(Array.from({ length: EXPECTED_PARTS }, (_, i) => i + 1));
    // Nine full chunks plus the single trailing byte.
    const sizeByPart = new Map(
      attempts.map((attempt) => [attempt.partNumber, attempt.size]),
    );
    expect([...sizeByPart.values()].reduce((a, b) => a + b, 0)).toBe(FILE_SIZE);
    for (const attempt of attempts) {
      expect(attempt.marker).toBe(attempt.partNumber);
      expect(attempt.size).toBe(
        attempt.partNumber === EXPECTED_PARTS ? 1 : CHUNK_SIZE,
      );
    }
    expect(completeBody!.parts).toEqual(
      Array.from({ length: EXPECTED_PARTS }, (_, i) => ({
        partNumber: i + 1,
        etag: `"etag-${i + 1}"`,
      })),
    );
  });

  it("surfaces the original error when a part fails with a client error", async () => {
    const attemptsByPart = new Map<number, number>();
    const fetchImpl = jest.fn(async (url: string) => {
      const partNumber = partNumberOf(url);
      attemptsByPart.set(partNumber, (attemptsByPart.get(partNumber) ?? 0) + 1);
      if (partNumber === 1) {
        return jsonResponse(
          { message: "Forbidden", detail: "upload token expired" },
          { status: 403 },
        );
      }
      return jsonResponse({ partNumber, etag: `"etag-${partNumber}"` });
    }) as unknown as typeof fetch;

    const storage = createStorageClient({
      config: createConfigWith(fetchImpl),
    });

    const error = await storage.upload(largeFile).catch((e) => e);

    expect(error).toBeInstanceOf(MultipartUploadError);
    expect(error.partNumber).toBe(1);
    expect(error.message).toContain("part 1");
    expect(error.message).toContain("403");
    expect(error.message).toContain("upload token expired");
    expect(error.cause).toBeInstanceOf(ApiError);
    expect(error.cause.status).toBe(403);
    expect(error.cause.body).toEqual({
      message: "Forbidden",
      detail: "upload token expired",
    });
    // A 403 can never succeed on a repeat, so it must not consume attempts,
    // and the remaining parts must not be dispatched.
    expect(attemptsByPart.get(1)).toBe(1);
    expect(attemptsByPart.size).toBe(1);
  });

  it("retries a transient part failure and completes the upload", async () => {
    let attemptsForPart2 = 0;
    const fetchImpl = jest.fn(async (url: string) => {
      if (url.endsWith("/complete?token=t")) {
        return jsonResponse({ ok: true });
      }
      const partNumber = partNumberOf(url);
      if (partNumber === 2) {
        attemptsForPart2++;
        if (attemptsForPart2 === 1) {
          return jsonResponse({ message: "Slow down" }, { status: 429 });
        }
      }
      return jsonResponse({ partNumber, etag: `"etag-${partNumber}"` });
    }) as unknown as typeof fetch;

    const storage = createStorageClient({
      config: createConfigWith(fetchImpl),
    });

    await expect(storage.upload(largeFile)).resolves.toBe(FILE_URL);
    expect(attemptsForPart2).toBe(2);
  });

  it("reports progress that totals exactly the file size", async () => {
    const fetchImpl = jest.fn(async (url: string) => {
      if (url.endsWith("/complete?token=t")) {
        return jsonResponse({ ok: true });
      }
      const partNumber = partNumberOf(url);
      return jsonResponse({ partNumber, etag: `"etag-${partNumber}"` });
    }) as unknown as typeof fetch;

    const events: UploadProgress[] = [];
    const storage = createStorageClient({
      config: createConfigWith(fetchImpl),
    });
    await storage.upload(largeFile, {
      onUploadProgress: (progress) => events.push(progress),
    });

    expect(events).toHaveLength(EXPECTED_PARTS);
    expect(events[events.length - 1].loaded).toBe(FILE_SIZE);
    expect(events.every((event) => event.total === FILE_SIZE)).toBe(true);
    expect(events.every((event) => event.totalParts === EXPECTED_PARTS)).toBe(
      true,
    );
    expect(
      events.map((event) => event.partNumber).sort((a, b) => a! - b!),
    ).toEqual(Array.from({ length: EXPECTED_PARTS }, (_, i) => i + 1));
    // `loaded` accumulates the bytes of whichever parts finished first.
    expect([...events].sort((a, b) => a.loaded - b.loaded)).toEqual(events);
  });

  it("falls back to the etag response header when the body omits it", async () => {
    let completeBody: { parts: { etag: string }[] } | null = null;
    const fetchImpl = jest.fn(async (url: string, init: RequestInit) => {
      if (url.endsWith("/complete?token=t")) {
        completeBody = JSON.parse(init.body as string);
        return jsonResponse({ ok: true });
      }
      const partNumber = partNumberOf(url);
      return jsonResponse(
        { ok: true },
        { etag: `"header-etag-${partNumber}"` },
      );
    }) as unknown as typeof fetch;

    const storage = createStorageClient({
      config: createConfigWith(fetchImpl),
    });
    await storage.upload(largeFile);

    expect(completeBody!.parts[0].etag).toBe('"header-etag-1"');
  });

  it("fails the upload when a part response carries no etag at all", async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse({ ok: true }),
    ) as unknown as typeof fetch;

    const storage = createStorageClient({
      config: createConfigWith(fetchImpl),
    });

    await expect(storage.upload(largeFile)).rejects.toThrow(
      MultipartUploadError,
    );
  });

  it("surfaces the cause when completing the upload fails", async () => {
    const fetchImpl = jest.fn(async (url: string) => {
      if (url.endsWith("/complete?token=t")) {
        return jsonResponse({ message: "Missing parts" }, { status: 400 });
      }
      const partNumber = partNumberOf(url);
      return jsonResponse({ partNumber, etag: `"etag-${partNumber}"` });
    }) as unknown as typeof fetch;

    const storage = createStorageClient({
      config: createConfigWith(fetchImpl),
    });

    const error = await storage.upload(largeFile).catch((e) => e);

    expect(error).toBeInstanceOf(MultipartUploadError);
    expect(error.message).toContain("Missing parts");
    expect(error.cause).toBeInstanceOf(ApiError);
    expect(error.cause.status).toBe(400);
  });
});

describe("single-shot upload", () => {
  const UPLOAD_URL = "https://cdn.test/upload/small?token=t";
  const FILE_URL = "https://cdn.test/files/small";

  beforeEach(() => {
    (dispatchRequest as jest.Mock).mockReset();
    (dispatchRequest as jest.Mock).mockResolvedValue({
      upload_url: UPLOAD_URL,
      file_url: FILE_URL,
    });
  });

  it("uploads in a single request and reports progress once", async () => {
    const file = new Blob(["hello world"], { type: "text/plain" });
    const fetchImpl = jest.fn(
      async () =>
        new Response("{}", { headers: { "Content-Type": "application/json" } }),
    ) as unknown as typeof fetch;

    const events: UploadProgress[] = [];
    const storage = createStorageClient({
      config: createConfig({ credentials: "test-key", fetch: fetchImpl }),
    });

    await expect(
      storage.upload(file, {
        onUploadProgress: (progress) => events.push(progress),
      }),
    ).resolves.toBe(FILE_URL);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(events).toEqual([{ loaded: file.size, total: file.size }]);
  });

  it("takes the single-shot path at exactly the threshold", async () => {
    // The comparison is `file.size > MULTIPART_THRESHOLD`, so a file of exactly
    // the threshold must NOT be split into parts.
    const file = new Blob([new Uint8Array(MULTIPART_THRESHOLD)], {
      type: "application/octet-stream",
    });
    const fetchImpl = jest.fn(
      async () =>
        new Response("{}", { headers: { "Content-Type": "application/json" } }),
    ) as unknown as typeof fetch;

    const events: UploadProgress[] = [];
    const storage = createStorageClient({
      config: createConfig({ credentials: "test-key", fetch: fetchImpl }),
    });

    await expect(
      storage.upload(file, {
        onUploadProgress: (progress) => events.push(progress),
      }),
    ).resolves.toBe(FILE_URL);
    // One PUT, and no part or complete requests.
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(events).toEqual([
      { loaded: MULTIPART_THRESHOLD, total: MULTIPART_THRESHOLD },
    ]);
    const initiateUrl = (dispatchRequest as jest.Mock).mock.calls[0][0]
      .targetUrl as string;
    expect(initiateUrl).toContain("/storage/upload/initiate?");
    expect(initiateUrl).not.toContain("initiate-multipart");
  });

  it("surfaces the server's rejection of an empty file", async () => {
    // fal-cdn-v3 refuses a zero-length body with
    // 411 "Content length appears to be zero - refusing to proceed",
    // so the upload must reject rather than report a 0/0 success. Progress is
    // only emitted after the response is accepted, so no event fires here.
    const file = new Blob([], { type: "application/octet-stream" });
    const fetchImpl = jest.fn(
      async () =>
        new Response(
          "Content length appears to be zero - refusing to proceed",
          {
            status: 411,
          },
        ),
    ) as unknown as typeof fetch;

    const events: UploadProgress[] = [];
    const storage = createStorageClient({
      config: createConfig({ credentials: "test-key", fetch: fetchImpl }),
    });

    const error = await storage
      .upload(file, { onUploadProgress: (progress) => events.push(progress) })
      .catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(411);
    expect(events).toEqual([]);
  });

  it("works without any options", async () => {
    const file = new Blob(["hello world"], { type: "text/plain" });
    const fetchImpl = jest.fn(
      async () =>
        new Response("{}", { headers: { "Content-Type": "application/json" } }),
    ) as unknown as typeof fetch;

    const storage = createStorageClient({
      config: createConfig({ credentials: "test-key", fetch: fetchImpl }),
    });

    await expect(storage.upload(file)).resolves.toBe(FILE_URL);
  });
});
