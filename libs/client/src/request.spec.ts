import { buildUrl } from "./request";

describe("buildUrl", () => {
  it("builds a fal.run URL from an endpoint id", () => {
    expect(buildUrl("fal-ai/fast-sdxl")).toBe(
      "https://fal.run/fal-ai/fast-sdxl",
    );
  });

  it("builds a queue URL from an endpoint id", () => {
    expect(buildUrl("fal-ai/fast-sdxl", { subdomain: "queue" })).toBe(
      "https://queue.fal.run/fal-ai/fast-sdxl",
    );
  });

  it("keeps an explicit fal URL, appending path and query", () => {
    expect(
      buildUrl("https://queue.fal.run/fal-ai/fast-sdxl", {
        path: "/requests/req_123/status",
        query: { logs: "1" },
      }),
    ).toBe(
      "https://queue.fal.run/fal-ai/fast-sdxl/requests/req_123/status?logs=1",
    );
  });

  it.each([
    "https://evilfal.ai/api/fal/proxy",
    "https://notfal.run/fal-ai/fast-sdxl",
    "https://fal.ai.evil.com/fal-ai/fast-sdxl",
    "https://fal.run@evil.com/fal-ai/fast-sdxl",
    "http://fal.run/fal-ai/fast-sdxl",
    "//evilfal.ai/fal-ai/fast-sdxl",
    "https:/evilfal.ai",
  ])("refuses %s instead of treating it as an endpoint id", (id) => {
    expect(() => buildUrl(id)).toThrow(/Refusing to send a fal request/);
  });

  it("still rejects malformed endpoint ids", () => {
    expect(() => buildUrl("just-an-id")).toThrow(/Invalid app id/);
  });

  it("refuses a subdomain that would move the request off fal", () => {
    expect(() =>
      buildUrl("fal-ai/fast-sdxl", { subdomain: "evil.example.com/x." }),
    ).toThrow(/Refusing to send a fal request/);
  });
});
