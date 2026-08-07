import { createUrlMatcher, DEFAULT_ALLOWED_URL_PATTERNS } from "./config";
import {
  getEndpoint,
  handleRequest,
  isAllowedEndpoint,
  isAllowedUrl,
} from "./index";

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

  describe("wma.fal.run (admitted by the service-host rule, not this allowlist)", () => {
    // Pins where the decision lives. `handleRequest` short-circuits on fal's service hosts BEFORE
    // consulting the allowlist, so an entry here could never be what admits the bridge — it would
    // read as load-bearing while being dead, and it would not survive a caller narrowing
    // `allowedUrlPatterns` anyway. See "allows the bridge even when allowedUrlPatterns is narrowed".
    it("should NOT be allowed by the default URL patterns", () => {
      expect(isAllowedUrl("wma.fal.run/session")).toBe(false);
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

describe("handleRequest rejection reasons", () => {
  /**
   * A minimal ProxyBehavior that records what handleRequest responded with.
   *
   * The 400 paths all return before any network call, so nothing needs stubbing for them. For the
   * paths that get PAST validation, auth is left unsatisfied on purpose: a 401 then proves the request
   * cleared the endpoint gate, which is exactly what the exemption tests need to show.
   */
  function behaviorFor(targetUrl: string | undefined, method = "POST") {
    const responses: Array<{ status: number; data: unknown }> = [];
    return {
      responses,
      behavior: {
        id: "test",
        method,
        getRequestBody: async () => "{}",
        getHeaders: () => ({}),
        getHeader: (name: string) =>
          name === "x-fal-target-url" ? targetUrl : undefined,
        sendHeader: () => undefined,
        respondWith: (status: number, data: unknown) => {
          responses.push({ status, data });
          return undefined as never;
        },
        sendResponse: async () => undefined as never,
      },
    };
  }

  const run = async (
    targetUrl: string | undefined,
    config: Record<string, unknown> = {},
    method = "POST",
  ) => {
    const { behavior, responses } = behaviorFor(targetUrl, method);
    await handleRequest(
      behavior as never,
      {
        // No credentials available, so anything reaching the auth step stops with 401 rather than
        // attempting a real request.
        allowUnauthorizedRequests: false,
        isAuthenticated: async () => false,
        ...config,
      } as never,
    );
    return responses[0];
  };

  it("names the missing header", async () => {
    expect(await run(undefined)).toEqual({
      status: 400,
      data: "Invalid request: missing x-fal-target-url header",
    });
  });

  it("names allowedUrlPatterns when the host is not permitted", async () => {
    expect(await run("https://evil.example/steal")).toEqual({
      status: 400,
      data: "Invalid request: target URL is not permitted by allowedUrlPatterns",
    });
  });

  it("names allowedEndpoints when the path is not permitted", async () => {
    // The case that cost a debugging round: the URL IS allowlisted and the path is not, which is a
    // different option and a different fix, yet all three used to say "Invalid request".
    expect(
      await run("https://fal.run/someone/other-app", {
        allowedEndpoints: ["me/my-app/**"],
      }),
    ).toEqual({
      status: 400,
      data: "Invalid request: target path is not permitted by allowedEndpoints",
    });
  });

  it("STILL enforces allowedEndpoints for app-serving fal.run hosts", async () => {
    // The security property. Exempting fal's service hosts from the endpoint check must not exempt
    // the hosts that serve customer apps, or allowedEndpoints stops restricting anything on its main
    // path. A suffix rule on `.fal.run` would break exactly this.
    for (const host of ["fal.run", "queue.fal.run"]) {
      expect(
        await run(`https://${host}/someone/other-app`, {
          allowedEndpoints: ["me/my-app/**"],
        }),
      ).toEqual({
        status: 400,
        data: "Invalid request: target path is not permitted by allowedEndpoints",
      });
    }
  });

  it("exempts the WMA signalling bridge from the endpoint check", async () => {
    // Reaches auth (401) rather than being rejected as a bad endpoint (400). `session` is not an app
    // id and can never match one, so applying an app allowlist to it only ever rejects valid traffic.
    expect(
      await run("https://wma.fal.run/session", {
        allowedEndpoints: ["me/my-app/**"],
      }),
    ).toEqual({ status: 401, data: "Unauthorized" });
  });

  it("allows the bridge by default, without any allowlisting", async () => {
    expect(await run("https://wma.fal.run/session/heartbeat")).toEqual({
      status: 401,
      data: "Unauthorized",
    });
  });

  it("allows the bridge even when allowedUrlPatterns is narrowed", async () => {
    // The case a default entry cannot cover: supplying allowedUrlPatterns REPLACES the defaults, so a
    // caller who scopes the proxy to their own apps — the careful configuration — would otherwise lose
    // signalling with no way to know why.
    expect(
      await run("https://wma.fal.run/session", {
        allowedUrlPatterns: ["fal.run/me/my-app/**"],
        allowedEndpoints: ["me/my-app/**"],
      }),
    ).toEqual({ status: 401, data: "Unauthorized" });
  });

  it("does NOT implicitly allow fal.ai, which is not allowed by default today", async () => {
    // The exemption is the enumerated service set, not every fal-owned domain. Widening it to `.fal.ai`
    // would silently start permitting hosts this proxy has always refused.
    expect(await run("https://fal.ai/anything")).toEqual({
      status: 400,
      data: "Invalid request: target URL is not permitted by allowedUrlPatterns",
    });
  });
});
