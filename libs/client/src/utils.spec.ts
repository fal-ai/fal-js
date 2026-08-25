import { ensureEndpointIdFormat, isValidUrl, parseEndpointId } from "./utils";

describe("The utils test suite", () => {
  it("shoud match a current appOwner/appId format", () => {
    const id = "fal-ai/fast-sdxl";
    expect(ensureEndpointIdFormat(id)).toBe(id);
  });

  it("shoud match a current appOwner/appId/path format", () => {
    const id = "fal-ai/fast-sdxl/image-to-image";
    expect(ensureEndpointIdFormat(id)).toBe(id);
  });

  it("should throw on an invalid app id format", () => {
    const id = "just-an-id";
    expect(() => ensureEndpointIdFormat(id)).toThrowError();
  });

  it("should reject URLs that failed validation instead of passing them through", () => {
    // An http:// fal URL fails isValidUrl (https-only); slipping it through as an "endpoint id"
    // would build https://fal.run/http://… — a silently mangled 404. Reject loudly instead.
    expect(() =>
      ensureEndpointIdFormat("http://fal.run/fal-ai/flux"),
    ).toThrowError(/https/);
    expect(() =>
      ensureEndpointIdFormat("https://evil.example/fal-ai/flux"),
    ).toThrowError(/https/);
  });

  it("should parse a current app id", () => {
    const id = "fal-ai/fast-sdxl";
    const parsed = parseEndpointId(id);
    expect(parsed).toEqual({
      owner: "fal-ai",
      alias: "fast-sdxl",
    });
  });

  it("should parse a current app id with path", () => {
    const id = "fal-ai/fast-sdxl/image-to-image";
    const parsed = parseEndpointId(id);
    expect(parsed).toEqual({
      owner: "fal-ai",
      alias: "fast-sdxl",
      path: "image-to-image",
    });
  });

  it("should parse a current app id with namespace", () => {
    const id = "workflows/fal-ai/fast-sdxl";
    const parsed = parseEndpointId(id);
    expect(parsed).toEqual({
      owner: "fal-ai",
      alias: "fast-sdxl",
      namespace: "workflows",
    });
  });

  it("accepts only HTTPS URLs on actual fal domains", () => {
    expect(isValidUrl("https://fal.run/fal-ai/flux")).toBe(true);
    expect(isValidUrl("https://queue.fal.run/fal-ai/flux")).toBe(true);
    expect(isValidUrl("https://api.fal.ai/models")).toBe(true);
    expect(isValidUrl("https://notfal.run/steal")).toBe(false);
    expect(isValidUrl("https://fal.run.attacker.example/steal")).toBe(false);
    expect(isValidUrl("http://fal.run/fal-ai/flux")).toBe(false);
  });
});
