import { createConfig } from "./config";
import { REQUEST_SOURCE_HEADER } from "./headers";
import { dispatchRequest } from "./request";

describe("dispatchRequest request source header", () => {
  function captureFetch() {
    const calls: RequestInit[] = [];
    const fetch = (async (_url: string, init: RequestInit) => {
      calls.push(init);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          "content-type": "application/json",
          "x-fal-request-id": "req_1",
        },
      });
    }) as unknown as typeof globalThis.fetch;
    return { calls, fetch };
  }

  function headersOf(init: RequestInit): Record<string, string> {
    return init.headers as Record<string, string>;
  }

  it("defaults the request source to sdk", async () => {
    const { calls, fetch } = captureFetch();
    const config = createConfig({
      credentials: "test-key",
      fetch,
      responseHandler: async (response) => response,
    });

    await dispatchRequest({
      targetUrl: "https://fal.run/fal-ai/fast-sdxl",
      input: { prompt: "hello" },
      config,
    });

    expect(headersOf(calls[0])[REQUEST_SOURCE_HEADER]).toBe("sdk");
  });

  it("lets requestMiddleware override the request source", async () => {
    const { calls, fetch } = captureFetch();
    const config = createConfig({
      credentials: "test-key",
      fetch,
      responseHandler: async (response) => response,
      requestMiddleware: async (request) => ({
        ...request,
        headers: {
          ...(request.headers ?? {}),
          [REQUEST_SOURCE_HEADER]: "web_app",
        },
      }),
    });

    await dispatchRequest({
      targetUrl: "https://fal.run/fal-ai/fast-sdxl",
      input: { prompt: "hello" },
      config,
    });

    expect(headersOf(calls[0])[REQUEST_SOURCE_HEADER]).toBe("web_app");
  });
});
