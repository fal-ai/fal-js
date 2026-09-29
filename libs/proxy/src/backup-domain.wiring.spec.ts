import { handleRequest, TARGET_URL_HEADER } from "./index";
import type { ProxyBehavior } from "./types";

function connectionError(): TypeError {
  return Object.assign(new TypeError("fetch failed"), {
    cause: Object.assign(new Error("connect ECONNREFUSED"), {
      code: "ECONNREFUSED",
      syscall: "connect",
    }),
  });
}

function behaviorFor(targetUrl: string): ProxyBehavior<string> {
  const headers: Record<string, string> = {
    [TARGET_URL_HEADER]: targetUrl,
    authorization: "Key user",
  };
  return {
    id: "test",
    method: "POST",
    respondWith: (status, data) => `${status}:${data}`,
    sendResponse: async (response) =>
      `${response.status}:${await response.text()}`,
    getHeaders: () => headers,
    getHeader: (name) => headers[name.toLowerCase()] ?? null,
    sendHeader: () => undefined,
    getRequestBody: async () => '{"prompt":"hi"}',
  };
}

describe("proxy backup domain wiring", () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("forwards to the backup host when the gateway cannot be reached", async () => {
    fetchSpy
      .mockRejectedValueOnce(connectionError())
      .mockResolvedValueOnce(new Response("ok", { status: 200 }));

    const result = await handleRequest(
      behaviorFor("https://queue.fal.run/fal-ai/x/requests/abc/status"),
      { resolveFalAuth: async () => "Key server" },
    );

    expect(result).toBe("200:ok");
    expect(fetchSpy.mock.calls.map((call) => call[0])).toEqual([
      "https://queue.fal.run/fal-ai/x/requests/abc/status",
      "https://queue.falrun.com/fal-ai/x/requests/abc/status",
    ]);
    expect(fetchSpy.mock.calls[1][1].body).toBe('{"prompt":"hi"}');
  });

  it("rejects disallowed targets before any fetch", async () => {
    const result = await handleRequest(
      behaviorFor("https://queue.falrun.com/fal-ai/x"),
      { resolveFalAuth: async () => "Key server" },
    );
    expect(result).toBe("400:Invalid request");
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
