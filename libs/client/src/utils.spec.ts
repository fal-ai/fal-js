import {
  ensureEndpointIdFormat,
  isFalHostname,
  isUrlLike,
  isValidUrl,
  parseEndpointId,
  parseFalUrl,
} from "./utils";

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
});

describe("isFalHostname", () => {
  it.each(["fal.ai", "fal.run", "queue.fal.run", "rest.fal.ai", "a.b.fal.ai"])(
    "accepts the fal host %s",
    (hostname) => {
      expect(isFalHostname(hostname)).toBe(true);
    },
  );

  it.each([
    // suffix squats: the whole point of SEC-447
    "evilfal.ai",
    "notfal.run",
    "xfal.ai",
    "my-fal.run",
    // superdomains
    "fal.ai.evil.com",
    "fal.run.evil.com",
    // empty labels and trailing dots never resolve to fal
    ".fal.run",
    "..fal.run",
    "fal.run.",
    // punycode homograph (Cyrillic "а" in "fаl.run")
    "xn--fl-7kc.run",
    "fal.dev",
    "fal.ai.",
    "",
  ])("rejects %s", (hostname) => {
    expect(isFalHostname(hostname)).toBe(false);
  });
});

describe("isValidUrl", () => {
  it.each([
    "https://fal.run",
    "https://fal.run/fal-ai/fast-sdxl",
    "https://queue.fal.run/fal-ai/fast-sdxl",
    "https://rest.fal.ai/storage/upload/initiate",
    // the URL parser lower-cases the host, and a port doesn't change it
    "https://FAL.RUN/fal-ai/fast-sdxl",
    "https://fal.run:8443/fal-ai/fast-sdxl",
  ])("accepts %s", (url) => {
    expect(isValidUrl(url)).toBe(true);
  });

  it.each([
    "https://evilfal.ai/api/fal/proxy",
    "https://notfal.run/fal-ai/fast-sdxl",
    "https://fal.ai.evil.com/fal-ai/fast-sdxl",
    // userinfo tricks: the host is evil.com, not fal.run
    "https://fal.run@evil.com/",
    "https://fal.run%2f@evil.com/",
    // a single slash still parses as an absolute URL
    "https:/evilfal.ai",
    // insecure and non-http protocols
    "http://fal.run/fal-ai/fast-sdxl",
    "ws://fal.run/fal-ai/fast-sdxl",
    "wss://fal.run/fal-ai/fast-sdxl",
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    // not absolute URLs at all
    "//evilfal.ai/x",
    "fal-ai/fast-sdxl",
    "/api/fal/proxy",
    "",
  ])("rejects %s", (url) => {
    expect(isValidUrl(url)).toBe(false);
  });

  it("only accepts the requested protocol", () => {
    expect(parseFalUrl("wss://fal.run/x", "wss:")?.hostname).toBe("fal.run");
    expect(parseFalUrl("wss://evilfal.ai/x", "wss:")).toBeUndefined();
    expect(parseFalUrl("https://fal.run/x", "wss:")).toBeUndefined();
  });
});

describe("isUrlLike", () => {
  it.each([
    "https://fal.run/x",
    "https://evilfal.ai/x",
    "https:/evilfal.ai",
    "//evilfal.ai/x",
    "  //evilfal.ai/x",
    "javascript:alert(1)",
  ])("treats %s as a URL", (value) => {
    expect(isUrlLike(value)).toBe(true);
  });

  it.each([
    "fal-ai/fast-sdxl",
    "workflows/fal-ai/fast-sdxl",
    "110602490-lcm",
    "fal-ai/fast-sdxl/image-to-image",
  ])("treats %s as an endpoint id", (value) => {
    expect(isUrlLike(value)).toBe(false);
  });
});
