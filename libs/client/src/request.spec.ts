import { createConfig } from "./config";
import { dispatchRequest, resolveJsonBody } from "./request";

describe("resolveJsonBody", () => {
  it("appends extraBody under its own key", () => {
    expect(
      resolveJsonBody(
        "post",
        { prompt: "hello", seed: 1 },
        { seed: 2, sync_mode: true },
      ),
    ).toBe(
      JSON.stringify({
        prompt: "hello",
        seed: 1,
        extraBody: { seed: 2, sync_mode: true },
      }),
    );
  });

  it("serializes extraBody under its own key when input is undefined", () => {
    expect(resolveJsonBody("post", undefined, { sync_mode: true })).toBe(
      JSON.stringify({ extraBody: { sync_mode: true } }),
    );
  });

  it("rejects extraBody for GET requests", () => {
    expect(() =>
      resolveJsonBody("get", undefined, { sync_mode: true }),
    ).toThrow("`extraBody` is not supported for GET requests.");
  });

  it("rejects extraBody when input is not a plain object", () => {
    expect(() =>
      resolveJsonBody("post", "raw-body", { sync_mode: true }),
    ).toThrow("`extraBody` can only be used when `input` is a plain object.");
  });
});

describe("dispatchRequest extraBody", () => {
  it("sends the merged JSON body", async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    const config = createConfig({
      credentials: "test-key",
      fetch: fetchMock as typeof fetch,
    });

    await dispatchRequest({
      method: "post",
      targetUrl: "https://fal.run/fal-ai/fast-sdxl",
      input: { prompt: "hello", seed: 1 },
      extraBody: { seed: 2, sync_mode: true },
      config,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1]?.body).toBe(
      JSON.stringify({
        prompt: "hello",
        seed: 1,
        extraBody: { seed: 2, sync_mode: true },
      }),
    );
  });
});
