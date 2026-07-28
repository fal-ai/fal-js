import { createFalClient } from "./client";
import { TARGET_URL_HEADER } from "./middleware";

const CREDENTIALS = "test-key-id:test-key-secret";
const EXPECTED_AUTHORIZATION = `Key ${CREDENTIALS}`;

/**
 * Hosts that end with `fal.ai`/`fal.run` without being fal. These are the
 * suffix squats from SEC-447 — an unanchored suffix test accepts all of them.
 */
const SUFFIX_SQUAT_URLS = [
  "https://evilfal.ai/api/fal/proxy",
  "https://notfal.run/fal-ai/fast-sdxl",
  "https://xfal.ai/fal-ai/fast-sdxl",
  "https://my-fal.run/fal-ai/fast-sdxl",
  "https://fal.ai.evil.com/fal-ai/fast-sdxl",
  "https://fal.run@evil.com/fal-ai/fast-sdxl",
];

type FetchMock = jest.Mock<Promise<Response>, [string, RequestInit?]>;

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function mockFetch(
  handler: (url: string, init?: RequestInit) => unknown = () => ({
    ok: true,
  }),
): FetchMock {
  return jest.fn(async (url: string, init?: RequestInit) =>
    jsonResponse(handler(url, init)),
  );
}

function asConfigFetch(fetchMock: FetchMock): typeof fetch {
  return fetchMock as unknown as typeof fetch;
}

function authorizationsSent(fetchMock: FetchMock): (string | null)[] {
  return fetchMock.mock.calls.map(([, init]) =>
    new Headers(init?.headers).get("authorization"),
  );
}

function headerSent(fetchMock: FetchMock, name: string): string | null {
  const [, init] = fetchMock.mock.calls[0];
  return new Headers(init?.headers).get(name);
}

function fakeBrowser() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.window = { document: {} } as any;
}

describe("credentials are never sent to a non-fal host", () => {
  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).window;
  });

  describe.each(SUFFIX_SQUAT_URLS)("%s", (target) => {
    let fetchMock: FetchMock;

    beforeEach(() => {
      fetchMock = mockFetch();
    });

    const client = () =>
      createFalClient({
        credentials: CREDENTIALS,
        fetch: asConfigFetch(fetchMock),
      });

    it("is refused by run", async () => {
      await expect(
        client().run(target, { input: { prompt: "hello" } }),
      ).rejects.toThrow(/Refusing to send a fal request/);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("is refused by queue.submit", async () => {
      await expect(
        client().queue.submit(target, { input: { prompt: "hello" } }),
      ).rejects.toThrow(/Refusing to send a fal request/);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("is refused by subscribe", async () => {
      await expect(
        client().subscribe(target, { input: { prompt: "hello" } }),
      ).rejects.toThrow(/Refusing to send a fal request/);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("is refused by stream in server mode", async () => {
      await expect(
        client().stream("fal-ai/fast-sdxl", {
          url: target,
          input: { prompt: "hello" },
        }),
      ).rejects.toThrow(/Refusing to send a fal request/);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("is refused by stream in client mode, before a token is minted", async () => {
      const tokenProvider = jest.fn().mockResolvedValue("scoped-jwt-token");

      await expect(
        client().stream("fal-ai/fast-sdxl", {
          url: target,
          input: { prompt: "hello" },
          connectionMode: "client",
          tokenProvider,
        }),
      ).rejects.toThrow(/Refusing to send a fal request/);
      expect(tokenProvider).not.toHaveBeenCalled();
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  it("does not reinterpret a rejected URL as an endpoint id", async () => {
    const fetchMock = mockFetch();
    const client = createFalClient({
      credentials: CREDENTIALS,
      fetch: asConfigFetch(fetchMock),
    });

    await expect(
      client.run("https://evilfal.ai/api/fal/proxy", {
        input: { prompt: "hello" },
      }),
    ).rejects.toThrow(/Pass an endpoint id/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses a middleware that rewrites the request to another host", async () => {
    const fetchMock = mockFetch();
    const client = createFalClient({
      credentials: CREDENTIALS,
      fetch: asConfigFetch(fetchMock),
      requestMiddleware: async (request) => ({
        ...request,
        url: "https://evil.example.com/collect",
      }),
    });

    await expect(
      client.run("fal-ai/fast-sdxl", { input: { prompt: "hello" } }),
    ).rejects.toThrow(/Refusing to send a fal request/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(["//evil.example.com/collect", "/\\evil.example.com/collect"])(
    "refuses a middleware that rewrites the request to %s",
    async (url) => {
      const fetchMock = mockFetch();
      const client = createFalClient({
        credentials: CREDENTIALS,
        fetch: asConfigFetch(fetchMock),
        requestMiddleware: async (request) => ({ ...request, url }),
      });

      await expect(
        client.run("fal-ai/fast-sdxl", { input: { prompt: "hello" } }),
      ).rejects.toThrow(/Refusing to send a fal request/);
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it("refuses a middleware whose logical proxy target is not a fal URL", async () => {
    const fetchMock = mockFetch();
    const client = createFalClient({
      credentials: CREDENTIALS,
      fetch: asConfigFetch(fetchMock),
      requestMiddleware: async (request) => ({
        ...request,
        url: "/api/fal/proxy",
        headers: {
          ...(request.headers ?? {}),
          [TARGET_URL_HEADER]: "https://evilfal.ai/fal-ai/fast-sdxl",
        },
      }),
    });

    await expect(
      client.run("fal-ai/fast-sdxl", { input: { prompt: "hello" } }),
    ).rejects.toThrow(/x-fal-target-url/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses a target URL header smuggled in through queue.submit headers", async () => {
    const fetchMock = mockFetch();
    const client = createFalClient({
      credentials: CREDENTIALS,
      fetch: asConfigFetch(fetchMock),
    });

    await expect(
      client.queue.submit("fal-ai/fast-sdxl", {
        input: { prompt: "hello" },
        headers: { "X-Fal-Target-Url": "https://evilfal.ai/collect" },
      }),
    ).rejects.toThrow(/Refusing to send a fal request/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("never leaks an authorization header on any refused call", async () => {
    const fetchMock = mockFetch();
    const client = createFalClient({
      credentials: CREDENTIALS,
      fetch: asConfigFetch(fetchMock),
    });

    for (const target of SUFFIX_SQUAT_URLS) {
      await expect(
        client.run(target, { input: { prompt: "hello" } }),
      ).rejects.toThrow();
      await expect(
        client.queue.submit(target, { input: { prompt: "hello" } }),
      ).rejects.toThrow();
    }

    expect(authorizationsSent(fetchMock)).toEqual([]);
  });
});

describe("legitimate fal requests still carry credentials", () => {
  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).window;
  });

  it("runs an endpoint id against fal.run", async () => {
    const fetchMock = mockFetch();
    const client = createFalClient({
      credentials: CREDENTIALS,
      fetch: asConfigFetch(fetchMock),
    });

    await client.run("fal-ai/fast-sdxl", { input: { prompt: "hello" } });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("https://fal.run/fal-ai/fast-sdxl");
    expect(authorizationsSent(fetchMock)).toEqual([EXPECTED_AUTHORIZATION]);
  });

  it("submits to queue.fal.run", async () => {
    const fetchMock = mockFetch(() => ({
      status: "IN_QUEUE",
      request_id: "req_123",
    }));
    const client = createFalClient({
      credentials: CREDENTIALS,
      fetch: asConfigFetch(fetchMock),
    });

    await client.queue.submit("fal-ai/fast-sdxl", {
      input: { prompt: "hello" },
    });

    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://queue.fal.run/fal-ai/fast-sdxl",
    );
    expect(authorizationsSent(fetchMock)).toEqual([EXPECTED_AUTHORIZATION]);
  });

  it.each([
    "https://fal.run/fal-ai/fast-sdxl",
    "https://queue.fal.run/fal-ai/fast-sdxl",
    "https://rest.fal.ai/some/endpoint",
  ])("accepts %s as an explicit URL", async (target) => {
    const fetchMock = mockFetch();
    const client = createFalClient({
      credentials: CREDENTIALS,
      fetch: asConfigFetch(fetchMock),
    });

    await client.run(target, { input: { prompt: "hello" } });

    expect(fetchMock.mock.calls[0][0]).toBe(`${target}/`);
    expect(authorizationsSent(fetchMock)).toEqual([EXPECTED_AUTHORIZATION]);
  });

  it("keeps the browser proxy flow working", async () => {
    fakeBrowser();
    const fetchMock = mockFetch();
    const client = createFalClient({
      credentials: CREDENTIALS,
      proxyUrl: "/api/fal/proxy",
      suppressLocalCredentialsWarning: true,
      fetch: asConfigFetch(fetchMock),
    });

    await client.run("fal-ai/fast-sdxl", { input: { prompt: "hello" } });

    expect(fetchMock.mock.calls[0][0]).toBe("/api/fal/proxy");
    expect(headerSent(fetchMock, TARGET_URL_HEADER)).toBe(
      "https://fal.run/fal-ai/fast-sdxl",
    );
    expect(authorizationsSent(fetchMock)).toEqual([EXPECTED_AUTHORIZATION]);
  });

  it("keeps a cross-origin proxy working in any runtime", async () => {
    const fetchMock = mockFetch();
    const client = createFalClient({
      credentials: CREDENTIALS,
      proxyUrl: {
        url: "https://api.example.com/api/fal/proxy",
        when: "always",
      },
      fetch: asConfigFetch(fetchMock),
    });

    await client.run("fal-ai/fast-sdxl", { input: { prompt: "hello" } });

    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://api.example.com/api/fal/proxy",
    );
    expect(headerSent(fetchMock, TARGET_URL_HEADER)).toBe(
      "https://fal.run/fal-ai/fast-sdxl",
    );
    expect(authorizationsSent(fetchMock)).toEqual([EXPECTED_AUTHORIZATION]);
  });

  it("uploads to the presigned storage URL without fal credentials", async () => {
    const uploadUrl = "https://v3.fal.media/files/upload/abc123";
    const fileUrl = "https://v3.fal.media/files/abc123.txt";
    const fetchMock = mockFetch((url) =>
      url.startsWith("https://rest.fal.ai/")
        ? { upload_url: uploadUrl, file_url: fileUrl }
        : {},
    );
    const client = createFalClient({
      credentials: CREDENTIALS,
      fetch: asConfigFetch(fetchMock),
    });

    const result = await client.storage.upload(
      new Blob(["hello"], { type: "text/plain" }),
    );

    expect(result).toBe(fileUrl);
    expect(fetchMock.mock.calls[0][0]).toContain(
      "https://rest.fal.ai/storage/upload/initiate",
    );
    expect(fetchMock.mock.calls[1][0]).toBe(uploadUrl);
    // the initiate call is authenticated, the presigned PUT must not be
    expect(authorizationsSent(fetchMock)).toEqual([
      EXPECTED_AUTHORIZATION,
      null,
    ]);
  });
});
