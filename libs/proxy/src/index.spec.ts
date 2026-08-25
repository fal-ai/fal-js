import { createUrlMatcher, DEFAULT_ALLOWED_URL_PATTERNS } from "./config";
import { getEndpoint, isAllowedEndpoint, isAllowedUrl } from "./index";

const FAL_REST_API_URL = "rest.fal.ai";

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

describe("getEndpoint", () => {
  it("should extract endpoint from fal.run URL", () => {
    expect(getEndpoint("https://fal.run/fal-ai/flux-dev")).toBe(
      "fal-ai/flux-dev",
    );
  });

  it("should extract endpoint from URL with nested path", () => {
    expect(getEndpoint("https://fal.run/fal-ai/flux/dev")).toBe(
      "fal-ai/flux/dev",
    );
  });

  it("should extract endpoint from URL with deeper nesting", () => {
    expect(getEndpoint("https://fal.run/provider/app/path/to/endpoint")).toBe(
      "provider/app/path/to/endpoint",
    );
  });

  it("should handle queue URLs", () => {
    expect(
      getEndpoint("https://queue.fal.run/fal-ai/flux-dev/requests/abc123"),
    ).toBe("fal-ai/flux-dev/requests/abc123");
  });

  it("should handle URLs with query parameters", () => {
    expect(
      getEndpoint("https://fal.run/fal-ai/flux-dev?some_param=value"),
    ).toBe("fal-ai/flux-dev");
  });

  it("should handle root path", () => {
    expect(getEndpoint("https://fal.run/")).toBe("");
  });
});

describe("isAllowedEndpoint", () => {
  describe("exact matches", () => {
    it("should match exact endpoint", () => {
      expect(isAllowedEndpoint("fal-ai/flux-dev", ["fal-ai/flux-dev"])).toBe(
        true,
      );
    });

    it("should NOT match different endpoint", () => {
      expect(isAllowedEndpoint("fal-ai/other", ["fal-ai/flux-dev"])).toBe(
        false,
      );
    });

    it("should NOT match partial endpoint", () => {
      expect(
        isAllowedEndpoint("fal-ai/flux-dev/extra", ["fal-ai/flux-dev"]),
      ).toBe(false);
    });
  });

  describe("single wildcard (*) patterns", () => {
    it("should match any single segment with *", () => {
      expect(isAllowedEndpoint("fal-ai/flux-dev", ["fal-ai/*"])).toBe(true);
      expect(isAllowedEndpoint("fal-ai/fast-sdxl", ["fal-ai/*"])).toBe(true);
    });

    it("should NOT match nested paths with single *", () => {
      expect(isAllowedEndpoint("fal-ai/flux/dev", ["fal-ai/*"])).toBe(false);
    });

    it("should match provider wildcard", () => {
      expect(isAllowedEndpoint("fal-ai/flux-dev", ["*/flux-dev"])).toBe(true);
      expect(isAllowedEndpoint("other-provider/flux-dev", ["*/flux-dev"])).toBe(
        true,
      );
    });
  });

  describe("double wildcard (**) patterns", () => {
    it("should match any path depth with **", () => {
      expect(isAllowedEndpoint("fal-ai/flux-dev", ["fal-ai/**"])).toBe(true);
      expect(isAllowedEndpoint("fal-ai/flux/dev", ["fal-ai/**"])).toBe(true);
      expect(
        isAllowedEndpoint("fal-ai/flux/dev/extra/path", ["fal-ai/**"]),
      ).toBe(true);
    });

    it("should match provider base with **", () => {
      expect(isAllowedEndpoint("fal-ai", ["fal-ai/**"])).toBe(true);
    });

    it("should match nested provider patterns", () => {
      expect(
        isAllowedEndpoint("provider/app/v1/endpoint", ["provider/app/**"]),
      ).toBe(true);
      expect(
        isAllowedEndpoint("provider/other/v1/endpoint", ["provider/app/**"]),
      ).toBe(false);
    });
  });

  describe("multiple patterns", () => {
    const patterns = ["fal-ai/**", "runware/*", "specific/endpoint"];

    it("should match any of multiple patterns", () => {
      expect(isAllowedEndpoint("fal-ai/flux-dev", patterns)).toBe(true);
      expect(isAllowedEndpoint("runware/fast-sdxl", patterns)).toBe(true);
      expect(isAllowedEndpoint("specific/endpoint", patterns)).toBe(true);
    });

    it("should NOT match if no pattern matches", () => {
      expect(isAllowedEndpoint("other-provider/model", patterns)).toBe(false);
      expect(isAllowedEndpoint("runware/nested/path", patterns)).toBe(false);
    });
  });

  describe("empty patterns (backwards compatibility)", () => {
    it("should allow any endpoint when patterns is empty", () => {
      expect(isAllowedEndpoint("fal-ai/flux-dev", [])).toBe(true);
      expect(isAllowedEndpoint("any/random/endpoint", [])).toBe(true);
      expect(isAllowedEndpoint("", [])).toBe(true);
    });
  });

  describe("real-world endpoint examples", () => {
    it("should handle fal-ai endpoints", () => {
      const patterns = ["fal-ai/**"];
      expect(isAllowedEndpoint("fal-ai/flux/dev", patterns)).toBe(true);
      expect(isAllowedEndpoint("fal-ai/flux/schnell", patterns)).toBe(true);
      expect(isAllowedEndpoint("fal-ai/fast-sdxl", patterns)).toBe(true);
      expect(isAllowedEndpoint("fal-ai/lora", patterns)).toBe(true);
    });

    it("should restrict to specific model families", () => {
      const patterns = ["fal-ai/flux/**", "fal-ai/fast-*"];
      expect(isAllowedEndpoint("fal-ai/flux/dev", patterns)).toBe(true);
      expect(isAllowedEndpoint("fal-ai/flux/schnell", patterns)).toBe(true);
      expect(isAllowedEndpoint("fal-ai/fast-sdxl", patterns)).toBe(true);
      expect(isAllowedEndpoint("fal-ai/lora", patterns)).toBe(false);
    });

    it("should handle queue request paths", () => {
      // Queue URLs have the format: fal-ai/model/requests/request-id
      const patterns = ["fal-ai/**"];
      expect(
        isAllowedEndpoint("fal-ai/flux-dev/requests/abc123", patterns),
      ).toBe(true);
      expect(
        isAllowedEndpoint("fal-ai/flux-dev/requests/abc123/status", patterns),
      ).toBe(true);
    });
  });
});
