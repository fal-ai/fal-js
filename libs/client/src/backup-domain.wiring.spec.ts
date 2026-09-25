import { createFalClient } from "./client";
import { createConfig } from "./config";
import { dispatchRequest } from "./request";

function connectionError(): TypeError {
  return Object.assign(new TypeError("fetch failed"), {
    cause: Object.assign(new Error("connect ECONNREFUSED"), {
      code: "ECONNREFUSED",
      syscall: "connect",
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
      retry: { maxRetries: 0 },
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
});
