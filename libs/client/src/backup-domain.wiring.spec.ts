import { createFalClient } from "./client";
import { createConfig } from "./config";
import { dispatchRequest } from "./request";

function connectionError(code = "ECONNREFUSED", syscall?: string): TypeError {
  return Object.assign(new TypeError("fetch failed"), {
    cause: Object.assign(new Error(`${syscall ?? "connect"} ${code}`), {
      code,
      ...(syscall && { syscall }),
    }),
  });
}

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
  });
}

describe("backup domain wiring", () => {
  it("dispatchRequest falls back to the backup host", async () => {
    const fetch = jest
      .fn()
      .mockRejectedValueOnce(connectionError())
      .mockResolvedValueOnce(jsonResponse({ ok: true }));
    const config = createConfig({
      credentials: "test-key",
      fetch,
      retry: { maxRetries: 1 },
    });

    await expect(
      dispatchRequest({
        targetUrl: "https://queue.fal.run/fal-ai/x?fal_webhook=w",
        input: { prompt: "hi" },
        config,
      }),
    ).resolves.toEqual({ ok: true });

    expect(fetch.mock.calls.map((call) => call[0])).toEqual([
      "https://queue.fal.run/fal-ai/x?fal_webhook=w",
      "https://queue.falrun.com/fal-ai/x?fal_webhook=w",
    ]);
    expect(fetch.mock.calls[1][1].body).toBe('{"prompt":"hi"}');
  });

  it("client-mode streaming falls back with the token query preserved", async () => {
    const fetch = jest
      .fn()
      .mockRejectedValueOnce(connectionError())
      .mockResolvedValueOnce(
        new Response("", { headers: { "content-type": "text/plain" } }),
      );
    const client = createFalClient({ fetch });

    const stream = await client.stream("fal-ai/x", {
      input: { prompt: "hi" },
      connectionMode: "client",
      tokenProvider: async () => "tok",
    });
    await stream.done();

    expect(fetch.mock.calls.map((call) => call[0])).toEqual([
      "https://fal.run/fal-ai/x/stream?fal_jwt_token=tok",
      "https://falrun.com/fal-ai/x/stream?fal_jwt_token=tok",
    ]);
  });

  it("client-mode streaming does not fall back when retries are disabled", async () => {
    const fetch = jest.fn().mockRejectedValueOnce(connectionError());
    const client = createFalClient({ fetch, retry: { maxRetries: 0 } });

    const stream = await client.stream("fal-ai/x", {
      input: { prompt: "hi" },
      connectionMode: "client",
      tokenProvider: async () => "tok",
    });

    await expect(stream.done()).rejects.toThrow("fetch failed");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("falls back to the backup host for submissions by default", async () => {
    const fetch = jest
      .fn()
      .mockRejectedValueOnce(connectionError())
      .mockResolvedValueOnce(jsonResponse({ request_id: "req_2" }));
    const client = createFalClient({ credentials: "test-key", fetch });

    const result = await client.queue.submit("fal-ai/x", {
      input: { prompt: "hi" },
    });

    expect(result.request_id).toBe("req_2");
    expect(fetch.mock.calls.map((call) => call[0])).toEqual([
      "https://queue.fal.run/fal-ai/x",
      "https://queue.falrun.com/fal-ai/x",
    ]);
  });

  it("does not re-issue a failed submission when retries are disabled", async () => {
    const error = connectionError("ETIMEDOUT");
    const fetch = jest
      .fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValue(jsonResponse({ request_id: "req_2" }));
    const client = createFalClient({
      credentials: "test-key",
      fetch,
      retry: { maxRetries: 0, enableJitter: false },
    });

    await expect(
      client.queue.submit("fal-ai/x", { input: { prompt: "hi" } }),
    ).rejects.toBe(error);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe("https://queue.fal.run/fal-ai/x");
  });

  it("does not retry a post-connect transport failure when retries are disabled", async () => {
    const error = connectionError("ECONNRESET", "read");
    const fetch = jest
      .fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValue(jsonResponse({ request_id: "req_2" }));
    const client = createFalClient({
      credentials: "test-key",
      fetch,
      retry: { maxRetries: 0, enableJitter: false },
    });

    await expect(
      client.queue.submit("fal-ai/x", { input: { prompt: "hi" } }),
    ).rejects.toBe(error);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
