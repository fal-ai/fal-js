import { handleRequest, TARGET_URL_HEADER } from "./index";
import { getProxyUserAgent } from "./runtime";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { name, version } = require("../package.json");

describe("proxy identification", () => {
  it("includes the package version and the adapter id", () => {
    expect(name).toBe("@fal-ai/server-proxy");
    expect(getProxyUserAgent("express")).toBe(`${name}/${version} (express)`);
    expect(getProxyUserAgent("hono")).toBe(`${name}/${version} (hono)`);
  });

  it("is sent upstream and cannot be overridden by the caller", async () => {
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    const fetchSpy = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{}"));
    const headers: Record<string, string> = {
      [TARGET_URL_HEADER]: "https://fal.run/fal-ai/flux",
      "x-fal-client-proxy": "spoofed",
    };
    try {
      await handleRequest(
        {
          id: "test-adapter",
          method: "POST",
          respondWith: () => undefined,
          sendResponse: async () => undefined,
          getHeaders: () => headers,
          getHeader: (header) => headers[header.toLowerCase()],
          sendHeader: () => undefined,
          getRequestBody: async () => "{}",
        },
        { resolveFalAuth: async () => "Key secret" },
      );
      expect(fetchSpy).toHaveBeenCalledWith(
        "https://fal.run/fal-ai/flux",
        expect.objectContaining({
          headers: expect.objectContaining({
            "x-fal-client-proxy": `${name}/${version} (test-adapter)`,
          }),
        }),
      );
    } finally {
      jest.restoreAllMocks();
    }
  });
});
