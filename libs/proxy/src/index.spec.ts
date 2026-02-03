import { createUrlMatcher, DEFAULT_ALLOWED_URL_PATTERNS } from "./config";
import { isAllowedUrl } from "./index";

const FAL_REST_API_URL = "rest.alpha.fal.ai";

describe("createUrlMatcher", () => {
  it("should match exact strings", () => {
    const matcher = createUrlMatcher(["fal.run/exact"]);
    expect(matcher("fal.run/exact")).toBe(true);
    expect(matcher("fal.run/exact/more")).toBe(false);
    expect(matcher("fal.run/other")).toBe(false);
  });

  it("should match single wildcard (*) for path segments", () => {
    const matcher = createUrlMatcher(["fal.run/*/path"]);
    expect(matcher("fal.run/anything/path")).toBe(true);
    expect(matcher("fal.run/other/path")).toBe(true);
    expect(matcher("fal.run/nested/more/path")).toBe(false);
    expect(matcher("fal.run/path")).toBe(false);
  });

  it("should match double wildcard (**) for any path", () => {
    const matcher = createUrlMatcher(["fal.run/**"]);
    expect(matcher("fal.run/")).toBe(true);
    expect(matcher("fal.run/path")).toBe(true);
    expect(matcher("fal.run/nested/path")).toBe(true);
    expect(matcher("fal.run/deeply/nested/path/here")).toBe(true);
  });

  it("should match URLs with query parameters (escaped ?)", () => {
    // Note: ? is a single-char wildcard in picomatch, use \\? for literal
    const matcher = createUrlMatcher([
      "fal.run/path\\?query=value",
      "fal.run/api/**",
    ]);
    expect(matcher("fal.run/path?query=value")).toBe(true);
    expect(matcher("fal.run/pathXquery=value")).toBe(false);
    expect(matcher("fal.run/api/test?foo=bar")).toBe(true);
  });

  it("should match base domain with ** pattern", () => {
    // ** matches zero or more path segments, so fal.run/** matches fal.run
    const matcher = createUrlMatcher(["fal.run/**"]);
    expect(matcher("fal.run")).toBe(true);
    expect(matcher("fal.run/")).toBe(true);
    expect(matcher("fal.run/path")).toBe(true);
  });
});

describe("isAllowedUrl with default patterns", () => {
  describe("fal.run URLs", () => {
    it("should allow fal.run with a path", () => {
      expect(isAllowedUrl("fal.run/some/path")).toBe(true);
    });

    it("should allow fal.run with minimal path", () => {
      expect(isAllowedUrl("fal.run/")).toBe(true);
    });

    it("should allow fal.run with complex paths", () => {
      expect(isAllowedUrl("fal.run/v1/workflows/abc123/run")).toBe(true);
    });

    it("should allow fal.run without a trailing slash (** matches zero or more)", () => {
      expect(isAllowedUrl("fal.run")).toBe(true);
    });
  });

  describe("queue.fal.run URLs", () => {
    it("should allow queue.fal.run with a path", () => {
      expect(isAllowedUrl("queue.fal.run/some/path")).toBe(true);
    });

    it("should allow queue.fal.run with minimal path", () => {
      expect(isAllowedUrl("queue.fal.run/")).toBe(true);
    });

    it("should allow queue.fal.run without a trailing slash (** matches zero or more)", () => {
      expect(isAllowedUrl("queue.fal.run")).toBe(true);
    });
  });

  describe("fal.dev URLs (NOT allowed by default)", () => {
    it("should NOT allow fal.dev with a path", () => {
      expect(isAllowedUrl("fal.dev/some/path")).toBe(false);
    });

    it("should NOT allow queue.fal.dev", () => {
      expect(isAllowedUrl("queue.fal.dev/some/path")).toBe(false);
    });
  });

  describe("fal.ai URLs (NOT allowed by default)", () => {
    it("should NOT allow fal.ai with a path", () => {
      expect(isAllowedUrl("fal.ai/some/path")).toBe(false);
    });

    it("should NOT allow queue.fal.ai", () => {
      expect(isAllowedUrl("queue.fal.ai/some/path")).toBe(false);
    });
  });

  describe("storage upload URLs", () => {
    it("should allow storage upload initiate URL", () => {
      const url = `${FAL_REST_API_URL}/storage/upload/initiate?storage_type=fal-cdn-v3`;
      expect(isAllowedUrl(url)).toBe(true);
    });

    it("should allow storage upload complete-multipart URL", () => {
      const url = `${FAL_REST_API_URL}/storage/upload/complete-multipart?storage_type=fal-cdn-v3`;
      expect(isAllowedUrl(url)).toBe(true);
    });

    it("should NOT allow storage upload with wrong storage_type", () => {
      const url = `${FAL_REST_API_URL}/storage/upload/initiate?storage_type=other`;
      expect(isAllowedUrl(url)).toBe(false);
    });

    it("should NOT allow storage upload without query params", () => {
      const url = `${FAL_REST_API_URL}/storage/upload/initiate`;
      expect(isAllowedUrl(url)).toBe(false);
    });

    it("should NOT allow storage URL with different path", () => {
      const url = `${FAL_REST_API_URL}/storage/download?storage_type=fal-cdn-v3`;
      expect(isAllowedUrl(url)).toBe(false);
    });
  });

  describe("disallowed URLs", () => {
    it("should NOT allow arbitrary domains", () => {
      expect(isAllowedUrl("example.com/path")).toBe(false);
    });

    it("should NOT allow fal.com", () => {
      expect(isAllowedUrl("fal.com/path")).toBe(false);
    });

    it("should NOT allow fal.io", () => {
      expect(isAllowedUrl("fal.io/path")).toBe(false);
    });

    it("should NOT allow subdomains other than queue", () => {
      expect(isAllowedUrl("api.fal.run/path")).toBe(false);
    });

    it("should NOT allow malicious domains that contain fal", () => {
      expect(isAllowedUrl("notfal.run/path")).toBe(false);
      expect(isAllowedUrl("fal.run.evil.com/path")).toBe(false);
    });

    it("should NOT allow empty string", () => {
      expect(isAllowedUrl("")).toBe(false);
    });

    it("should NOT allow URLs with different REST API base", () => {
      expect(
        isAllowedUrl(
          "rest.beta.fal.ai/storage/upload/initiate?storage_type=fal-cdn-v3",
        ),
      ).toBe(false);
    });
  });
});

describe("isAllowedUrl with custom patterns", () => {
  it("should allow fal.ai when pattern is provided", () => {
    const patterns = [...DEFAULT_ALLOWED_URL_PATTERNS, "fal.ai/**"];
    expect(isAllowedUrl("fal.ai/some/path", patterns)).toBe(true);
  });

  it("should allow fal.dev when pattern is provided", () => {
    const patterns = [...DEFAULT_ALLOWED_URL_PATTERNS, "fal.dev/**"];
    expect(isAllowedUrl("fal.dev/some/path", patterns)).toBe(true);
  });

  it("should allow queue.fal.ai when pattern is provided", () => {
    const patterns = [...DEFAULT_ALLOWED_URL_PATTERNS, "queue.fal.ai/**"];
    expect(isAllowedUrl("queue.fal.ai/some/path", patterns)).toBe(true);
  });

  it("should allow specific endpoint patterns", () => {
    const patterns = ["fal.run/my-specific-app/**"];
    expect(isAllowedUrl("fal.run/my-specific-app/run", patterns)).toBe(true);
    expect(isAllowedUrl("fal.run/other-app/run", patterns)).toBe(false);
  });

  it("should work with empty patterns array", () => {
    expect(isAllowedUrl("fal.run/path", [])).toBe(false);
  });
});
