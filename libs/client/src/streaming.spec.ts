import { createFalClient } from "./client";

const CREDENTIALS = "test-key-id:test-key-secret";

type FetchMock = jest.Mock<Promise<Response>, [string, RequestInit?]>;

function eventStream(): FetchMock {
  return jest.fn(
    async (_url: string, _init?: RequestInit) =>
      new Response('data: {"partial":true}\n\n', {
        status: 200,
        headers: { "content-type": "text/event-stream" },
      }),
  );
}

function client(fetchMock: FetchMock) {
  return createFalClient({
    credentials: CREDENTIALS,
    fetch: fetchMock as unknown as typeof fetch,
  });
}

describe("stream in client mode", () => {
  it("sends the scoped token only to the fal endpoint", async () => {
    const fetchMock = eventStream();
    const tokenProvider = jest.fn().mockResolvedValue("scoped-jwt-token");

    const stream = await client(fetchMock).stream("fal-ai/fast-sdxl", {
      input: { prompt: "hello" },
      connectionMode: "client",
      tokenProvider,
    });
    await stream.done();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [requestUrl, init] = fetchMock.mock.calls[0];
    const url = new URL(requestUrl);
    expect(url.hostname).toBe("fal.run");
    expect(url.pathname).toBe("/fal-ai/fast-sdxl/stream");
    expect(url.searchParams.get("fal_jwt_token")).toBe("scoped-jwt-token");
    // client mode authenticates with the scoped token, never with the key
    expect(new Headers(init?.headers).get("authorization")).toBeNull();
  });

  it("refuses a suffix-squat URL before minting a token", async () => {
    const fetchMock = eventStream();
    const tokenProvider = jest.fn().mockResolvedValue("scoped-jwt-token");

    await expect(
      client(fetchMock).stream("fal-ai/fast-sdxl", {
        url: "https://evilfal.ai/fal-ai/fast-sdxl/stream",
        connectionMode: "client",
        tokenProvider,
      }),
    ).rejects.toThrow(/Streaming can only connect to fal endpoints/);

    expect(tokenProvider).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("stream in server mode", () => {
  it("dispatches to the fal endpoint with the fal key", async () => {
    const fetchMock = eventStream();

    const stream = await client(fetchMock).stream("fal-ai/fast-sdxl", {
      input: { prompt: "hello" },
    });
    await stream.done();

    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://fal.run/fal-ai/fast-sdxl/stream",
    );
    expect(
      new Headers(fetchMock.mock.calls[0][1]?.headers).get("authorization"),
    ).toBe(`Key ${CREDENTIALS}`);
  });

  it("refuses a URL that is not a fal endpoint", async () => {
    const fetchMock = eventStream();

    await expect(
      client(fetchMock).stream("fal-ai/fast-sdxl", {
        url: "https://evilfal.ai/fal-ai/fast-sdxl/stream",
      }),
    ).rejects.toThrow(/Refusing to send a fal request/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("queue.streamStatus", () => {
  it("streams status from queue.fal.run", async () => {
    const fetchMock = eventStream();

    const stream = await client(fetchMock).queue.streamStatus(
      "fal-ai/fast-sdxl",
      { requestId: "req_123" },
    );
    await stream.done();

    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.hostname).toBe("queue.fal.run");
    expect(url.pathname).toBe(
      "/fal-ai/fast-sdxl/requests/req_123/status/stream",
    );
  });
});
