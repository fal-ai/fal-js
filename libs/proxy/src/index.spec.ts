import { Readable } from "stream";
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

  it("recompiles a cached matcher when its pattern array changes", () => {
    const patterns = ["fal.run/owner/app"];
    expect(isAllowedUrl("fal.run/owner/app", patterns)).toBe(true);

    patterns.splice(0, 1, "fal.run/owner/other-app");

    expect(isAllowedUrl("fal.run/owner/app", patterns)).toBe(false);
    expect(isAllowedUrl("fal.run/owner/other-app", patterns)).toBe(true);
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

  it("recompiles a cached endpoint matcher when its patterns change", () => {
    const patterns = ["owner/app"];
    expect(isAllowedEndpoint("owner/app", patterns)).toBe(true);

    patterns.splice(0, 1, "owner/other-app");

    expect(isAllowedEndpoint("owner/app", patterns)).toBe(false);
    expect(isAllowedEndpoint("owner/other-app", patterns)).toBe(true);
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

describe("serializeParsedBody", () => {
  it("re-encodes a parsed form body as form data, not JSON", async () => {
    // The proxy forwards the request's content-type verbatim, so a body the framework parsed from
    // application/x-www-form-urlencoded must be re-encoded the same way — JSON bytes labeled as
    // form data cannot be parsed upstream.
    const { serializeParsedBody } = await import("./utils");
    expect(
      serializeParsedBody(
        { prompt: "a cat", seed: "42" },
        "application/x-www-form-urlencoded",
      ),
    ).toBe("prompt=a+cat&seed=42");
    expect(
      serializeParsedBody(
        { prompt: "a cat" },
        "application/x-www-form-urlencoded; charset=utf-8",
      ),
    ).toBe("prompt=a+cat");
    // JSON stays JSON, strings and bytes pass through, empty stays empty.
    expect(serializeParsedBody({ a: 1 }, "application/json")).toBe('{"a":1}');
    expect(serializeParsedBody({ a: 1 }, undefined)).toBe('{"a":1}');
    expect(
      serializeParsedBody("raw", "application/x-www-form-urlencoded"),
    ).toBe("raw");
    const bytes = new Uint8Array([1, 2]);
    expect(serializeParsedBody(bytes, "multipart/form-data")).toBe(bytes);
    // ArrayBuffer is part of ProxyRequestBody and must pass through, not stringify to "{}".
    const buffer = new Uint8Array([3, 4]).buffer;
    expect(serializeParsedBody(buffer, "application/octet-stream")).toBe(
      buffer,
    );
    expect(serializeParsedBody(undefined, "application/json")).toBeUndefined();
    // Every JSON-typed string lacks decidable provenance (raw text vs parsed value, parseable
    // or not) and fails loudly; adapters that KNOW their parser re-encode before this helper.
    // An UNPARSEABLE string is decidably a parsed top-level value and re-encodes; any PARSEABLE
    // string is ambiguous under json strict:false (raw text vs quoted string value) and fails
    // loudly rather than silently changing the upstream value's type. Non-JSON types pass raw.
    expect(serializeParsedBody("hello", "text/plain")).toBe("hello");
    for (const ambiguous of [
      "hello",
      '{"a":1}',
      '"quoted"',
      "123",
      "null",
      "[1,2]",
    ]) {
      expect(() => serializeParsedBody(ambiguous, "application/json")).toThrow(
        /unambiguous/,
      );
    }
    // Parsed JSON null is a real body; null under other types still reads as absent.
    expect(serializeParsedBody(null, "application/json")).toBe("null");
    expect(serializeParsedBody(null, "application/json; charset=utf-8")).toBe(
      "null",
    );
    expect(serializeParsedBody(null, "multipart/form-data")).toBeUndefined();
    expect(serializeParsedBody(null, undefined)).toBeUndefined();
    // Structured-suffix JSON media types carry JSON payloads too (RFC 6839).
    expect(serializeParsedBody(null, "application/ld+json")).toBe("null");
    expect(
      serializeParsedBody(null, "application/hal+json; charset=utf-8"),
    ).toBe("null");
    // Prefix lookalikes are NOT JSON documents: json-seq is a record-separated sequence.
    expect(serializeParsedBody(null, "application/json-seq")).toBeUndefined();
  });

  it("preserves repeated URL-encoded fields", async () => {
    // Parsers represent `tag=a&tag=b` as { tag: ["a", "b"] }; the record-constructor form of
    // URLSearchParams would collapse that to tag=a%2Cb and change the upstream semantics.
    const { serializeParsedBody } = await import("./utils");
    expect(
      serializeParsedBody(
        { tag: ["a", "b"], solo: "x" },
        "application/x-www-form-urlencoded",
      ),
    ).toBe("tag=a&tag=b&solo=x");
    expect(
      serializeParsedBody(
        { keep: "yes", missing: undefined, empty: null },
        "application/x-www-form-urlencoded",
      ),
    ).toBe("keep=yes");
  });

  it("rejects parsed multipart bodies instead of JSON-encoding them", async () => {
    // multer/formidable populate request.body with an object after consuming the stream; the
    // bytes and boundary framing are unrecoverable, and JSON under a multipart header would be
    // corruption, not forwarding.
    const { serializeParsedBody } = await import("./utils");
    expect(() =>
      serializeParsedBody(
        { field: "value" },
        "multipart/form-data; boundary=----x",
      ),
    ).toThrow(/multipart/);
  });

  it("re-encodes nested URL-encoded fields with bracket notation", async () => {
    // express.urlencoded({ extended: true }) parses user[name]=alice into nested objects;
    // stringifying those would forward user=%5Bobject+Object%5D.
    const { serializeParsedBody } = await import("./utils");
    expect(
      serializeParsedBody(
        { user: { name: "alice", tags: ["a", "b"] } },
        "application/x-www-form-urlencoded",
      ),
    ).toBe("user%5Bname%5D=alice&user%5Btags%5D=a&user%5Btags%5D=b");
    // Arrays of structured values keep their indices, or two objects collapse into one on
    // reparse; scalar arrays stay repeated keys.
    expect(
      serializeParsedBody(
        { users: [{ name: "alice" }, { name: "bob" }] },
        "application/x-www-form-urlencoded",
      ),
    ).toBe("users%5B0%5D%5Bname%5D=alice&users%5B1%5D%5Bname%5D=bob");
  });

  it("rejects parsed objects whose declared media type cannot be reconstructed", async () => {
    const { serializeParsedBody } = await import("./utils");

    expect(() => serializeParsedBody({ value: 1 }, "application/xml")).toThrow(
      /application\/xml/,
    );
    expect(() => serializeParsedBody({ value: 1 }, "application/cbor")).toThrow(
      /application\/cbor/,
    );
  });

  it("rejects parsed bodies whose declared charset is not UTF-8", async () => {
    const { serializeParsedBody } = await import("./utils");

    expect(() =>
      serializeParsedBody("é", "text/plain; charset=iso-8859-1"),
    ).toThrow(/iso-8859-1/);
    expect(() =>
      serializeParsedBody({ value: "é" }, 'application/json; charset="utf-16"'),
    ).toThrow(/utf-16/);
    expect(serializeParsedBody("é", "text/plain; charset=utf-8")).toBe("é");
  });
});

describe("readUnconsumedRequestBody", () => {
  it("caps raw-stream buffering instead of holding unbounded bodies in memory", async () => {
    const { readUnconsumedRequestBody } = await import("./utils");
    async function* endless() {
      for (;;) yield new Uint8Array(1024 * 1024);
    }
    await expect(
      readUnconsumedRequestBody(endless(), 4 * 1024 * 1024),
    ).rejects.toThrow(/exceeded/);
  });

  it("marks body-limit errors as HTTP 413", async () => {
    const { readUnconsumedRequestBody } = await import("./utils");
    async function* body() {
      yield new Uint8Array([1, 2]);
    }

    await expect(readUnconsumedRequestBody(body(), 1)).rejects.toMatchObject({
      status: 413,
      statusCode: 413,
    });
  });

  it("caps Fetch-API request streams before forwarding them", async () => {
    const { readWebRequestBody } = await import("./utils");
    const request = new Request("https://proxy.test", {
      method: "POST",
      body: new Uint8Array([1, 2]),
    });

    await expect(
      (
        readWebRequestBody as (
          request: Request,
          maxBytes: number,
        ) => Promise<unknown>
      )(request, 1),
    ).rejects.toMatchObject({
      status: 413,
    });
  });
});

describe("proxy body limit configuration", () => {
  it("rejects values that would disable or make the byte bound ambiguous", async () => {
    const { resolveProxyConfig } = await import("./config");
    const safeConfig = {
      allowedEndpoints: ["owner/app"],
      allowUnauthorizedRequests: false,
    };

    for (const maxRequestBodyBytes of [NaN, Infinity, -1, 1.5]) {
      expect(() =>
        resolveProxyConfig({ ...safeConfig, maxRequestBodyBytes }),
      ).toThrow(/non-negative safe integer/);
    }
    expect(
      resolveProxyConfig({ ...safeConfig, maxRequestBodyBytes: 0 })
        .maxRequestBodyBytes,
    ).toBe(0);
  });
});

describe("createHandler (express) body handling", () => {
  function expressRequest(options: {
    readable: boolean;
    body: unknown;
    contentType?: string;
    chunks?: Uint8Array[];
  }) {
    return {
      method: "POST",
      readable: options.readable,
      body: options.body,
      headers: {
        "x-fal-target-url": "https://fal.run/owner/app",
        ...(options.contentType ? { "content-type": options.contentType } : {}),
      },
      async *[Symbol.asyncIterator]() {
        for (const chunk of options.chunks ?? []) yield chunk;
      },
    };
  }
  function expressResponse() {
    return {
      setHeader: jest.fn(),
      status: jest.fn(() => ({ json: jest.fn(), send: jest.fn() })),
      write: jest.fn(),
      end: jest.fn(),
    };
  }

  it("forwards the raw stream when a global parser skipped the body", async () => {
    // body-parser stamps req.body = {} on EVERY request before its content-type check, so a
    // multipart POST through app.use(express.json()) arrives here as {} with the stream UNREAD.
    // The stream, not req.body, decides: raw multipart bytes must be forwarded, not a throw
    // blaming a multipart parser that does not exist (and not an empty body).
    const { createHandler } = await import("./express");
    const handler = createHandler({
      allowUnauthorizedRequests: false,
      isAuthenticated: async () => true,
      resolveFalAuth: async () => "Key secret",
    });
    const payload = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x80, 0x00, 0xff]);
    const request = expressRequest({
      readable: true,
      body: {}, // body-parser's untouched stamp
      contentType: "multipart/form-data; boundary=x",
      chunks: [payload],
    });
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response("{}"));
    try {
      await handler(request as never, expressResponse() as never, jest.fn());
      const sent = fetchMock.mock.calls[0][1]?.body as Uint8Array;
      expect(new Uint8Array(sent)).toEqual(payload);
    } finally {
      fetchMock.mockRestore();
    }
  });

  it("uses parser output once the stream was actually consumed", async () => {
    const { createHandler } = await import("./express");
    const handler = createHandler({
      allowUnauthorizedRequests: false,
      isAuthenticated: async () => true,
      resolveFalAuth: async () => "Key secret",
    });
    const request = expressRequest({
      readable: false, // express.json() read the stream
      body: { prompt: "hello" },
      contentType: "application/json",
    });
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response("{}"));
    try {
      await handler(request as never, expressResponse() as never, jest.fn());
      expect(fetchMock.mock.calls[0][1]?.body).toBe('{"prompt":"hello"}');
    } finally {
      fetchMock.mockRestore();
    }
  });

  it("rejects parser-decoded text with a non-UTF-8 charset", async () => {
    const { createHandler } = await import("./express");
    const request = expressRequest({
      readable: false,
      body: "é",
      contentType: "text/plain; charset=iso-8859-1",
    });
    const next = jest.fn();
    const fetchMock = jest.spyOn(global, "fetch");
    try {
      await createHandler({
        allowUnauthorizedRequests: false,
        isAuthenticated: async () => true,
        resolveFalAuth: async () => "Key secret",
      })(request as never, expressResponse() as never, next);

      expect(fetchMock).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(/iso-8859-1/),
        }),
      );
    } finally {
      fetchMock.mockRestore();
    }
  });

  it("rejects a partially consumed request instead of forwarding its tail", async () => {
    const { createHandler } = await import("./express");
    const request = new Readable({ read: jest.fn() }) as Readable & {
      method: string;
      body: unknown;
      headers: Record<string, string>;
    };
    request.push(Buffer.from("abc"));
    request.push(Buffer.from("def"));
    request.push(null);
    request.method = "POST";
    request.body = undefined;
    request.headers = {
      "x-fal-target-url": "https://fal.run/owner/app",
      "content-type": "application/octet-stream",
      "content-length": "6",
    };
    expect(request.read(3)?.toString()).toBe("abc");
    expect(request.readable).toBe(true);
    expect(request.readableDidRead).toBe(true);

    const next = jest.fn();
    const fetchMock = jest.spyOn(global, "fetch");
    try {
      await createHandler({
        allowUnauthorizedRequests: false,
        isAuthenticated: async () => true,
        resolveFalAuth: async () => "Key secret",
      })(request as never, expressResponse() as never, next);

      expect(fetchMock).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringMatching(/consumed/) }),
      );
    } finally {
      fetchMock.mockRestore();
    }
  });
});

describe("createRouteHandler (hono) body handling", () => {
  it("replays cached JSON through Hono middleware", async () => {
    const { Hono } = await import("hono");
    const { createRouteHandler } = await import("./hono");
    const app = new Hono();
    app.use("/proxy", async (context, next) => {
      await context.req.json();
      await next();
    });
    app.post(
      "/proxy",
      createRouteHandler({
        allowUnauthorizedRequests: false,
        isAuthenticated: async () => true,
        resolveFalAuth: async () => "Key secret",
      }),
    );

    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response("{}"));
    try {
      const response = await app.request("http://local.test/proxy", {
        method: "POST",
        headers: {
          "x-fal-target-url": "https://fal.run/owner/app",
          "content-type": "application/json",
        },
        body: '{ "prompt": "hello" }',
      });

      expect(response.status).toBe(200);
      expect(fetchMock.mock.calls[0][1]?.body).toEqual(
        new TextEncoder().encode('{"prompt":"hello"}').buffer,
      );
    } finally {
      fetchMock.mockRestore();
    }
  });

  it("preserves cached multipart bytes when middleware cached arrayBuffer first", async () => {
    const { Hono } = await import("hono");
    const { createRouteHandler } = await import("./hono");
    const app = new Hono();
    app.use("/proxy", async (context, next) => {
      await context.req.arrayBuffer();
      await next();
    });
    app.post(
      "/proxy",
      createRouteHandler({
        allowUnauthorizedRequests: false,
        isAuthenticated: async () => true,
        resolveFalAuth: async () => "Key secret",
      }),
    );

    const form = new FormData();
    form.append("field", "value");
    const request = new Request("http://local.test/proxy", {
      method: "POST",
      headers: { "x-fal-target-url": "https://fal.run/owner/app" },
      body: form,
    });
    const originalContentType = request.headers.get("content-type");
    const originalBody = new Uint8Array(await request.clone().arrayBuffer());
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response("{}"));
    try {
      const response = await app.request(request);

      expect(response.status).toBe(200);
      const forwarded = fetchMock.mock.calls[0][1];
      expect(
        (forwarded?.headers as Record<string, string>)["content-type"],
      ).toBe(originalContentType);
      expect(new Uint8Array(forwarded?.body as ArrayBuffer)).toEqual(
        originalBody,
      );
    } finally {
      fetchMock.mockRestore();
    }
  });

  it("preserves cached multipart bytes when middleware cached a Blob", async () => {
    const { Hono } = await import("hono");
    const { createRouteHandler } = await import("./hono");
    const app = new Hono();
    app.use("/proxy", async (context, next) => {
      await context.req.blob();
      await next();
    });
    app.post(
      "/proxy",
      createRouteHandler({
        allowUnauthorizedRequests: false,
        isAuthenticated: async () => true,
        resolveFalAuth: async () => "Key secret",
      }),
    );

    const form = new FormData();
    form.append("field", "value");
    const request = new Request("http://local.test/proxy", {
      method: "POST",
      headers: { "x-fal-target-url": "https://fal.run/owner/app" },
      body: form,
    });
    const originalBody = new Uint8Array(await request.clone().arrayBuffer());
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response("{}"));
    try {
      const response = await app.request(request);

      expect(response.status).toBe(200);
      expect(
        new Uint8Array(fetchMock.mock.calls[0][1]?.body as ArrayBuffer),
      ).toEqual(originalBody);
    } finally {
      fetchMock.mockRestore();
    }
  });

  it("rejects cached FormData whose original multipart boundary is gone", async () => {
    const { Hono } = await import("hono");
    const { createRouteHandler } = await import("./hono");
    const app = new Hono();
    app.use("/proxy", async (context, next) => {
      await context.req.formData();
      await next();
    });
    app.onError((error, context) => context.text(error.message, 500));
    app.post(
      "/proxy",
      createRouteHandler({
        allowUnauthorizedRequests: false,
        isAuthenticated: async () => true,
        resolveFalAuth: async () => "Key secret",
      }),
    );

    const form = new FormData();
    form.append("field", "value");
    const fetchMock = jest.spyOn(global, "fetch");
    try {
      const response = await app.request("http://local.test/proxy", {
        method: "POST",
        headers: { "x-fal-target-url": "https://fal.run/owner/app" },
        body: form,
      });

      expect(response.status).toBe(500);
      await expect(response.text()).resolves.toMatch(/multipart.*consumed/i);
      expect(fetchMock).not.toHaveBeenCalled();
    } finally {
      fetchMock.mockRestore();
    }
  });
});

describe("createPageRouterHandler body handling", () => {
  it("fails loudly for multipart bodies Next's parser already corrupted", async () => {
    // Next's default bodyParser drains EVERY request and stringifies unknown content types
    // through UTF-8, so a multipart body reaching the adapter as a string is irreversibly
    // corrupted — forwarding it would hand the upstream garbage under a valid boundary.
    const { createPageRouterHandler } = await import("./nextjs");
    const handler = createPageRouterHandler({
      allowUnauthorizedRequests: false,
      isAuthenticated: async () => true,
      resolveFalAuth: async () => "Key secret",
    });
    const headers: Record<string, string> = {
      "x-fal-target-url": "https://fal.run/owner/app",
      "content-type": "multipart/form-data; boundary=x",
    };
    const request = {
      method: "POST",
      body: "already�corrupted",
      headers,
    };
    const response = {
      setHeader: jest.fn(),
      status: jest.fn(() => ({ json: jest.fn(), send: jest.fn() })),
    };

    await expect(handler(request as never, response as never)).rejects.toThrow(
      /bodyParser: false/,
    );
  });

  it("re-encodes a parsed top-level JSON string body", async () => {
    // Next PARSES application/json, so a string body is a JSON string VALUE; forwarding it
    // verbatim would send invalid JSON (hello instead of "hello") under a JSON content type.
    const { createPageRouterHandler } = await import("./nextjs");
    const handler = createPageRouterHandler({
      allowUnauthorizedRequests: false,
      isAuthenticated: async () => true,
      resolveFalAuth: async () => "Key secret",
    });
    const request = {
      method: "POST",
      body: "hello",
      headers: {
        "x-fal-target-url": "https://wma.fal.run/session",
        "content-type": "application/json",
      },
    };
    const response = {
      setHeader: jest.fn(),
      status: jest.fn(() => ({ json: jest.fn(), send: jest.fn() })),
    };
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response("{}"));
    try {
      await handler(request as never, response as never);
      expect(fetchMock.mock.calls[0][1]?.body).toBe('"hello"');
    } finally {
      fetchMock.mockRestore();
    }
  });

  it("does not double-encode structured-suffix JSON that Next leaves as raw text", async () => {
    const { createPageRouterHandler } = await import("./nextjs");
    const handler = createPageRouterHandler({
      allowUnauthorizedRequests: false,
      isAuthenticated: async () => true,
      resolveFalAuth: async () => "Key secret",
    });
    const request = {
      method: "POST",
      body: '{"title":"bad request"}',
      headers: {
        "x-fal-target-url": "https://fal.run/owner/app",
        "content-type": "application/problem+json",
      },
    };
    const response = {
      setHeader: jest.fn(),
      status: jest.fn(() => ({ json: jest.fn(), send: jest.fn() })),
    };
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response("{}"));
    try {
      await handler(request as never, response as never);
      expect(fetchMock.mock.calls[0][1]?.body).toBe('{"title":"bad request"}');
    } finally {
      fetchMock.mockRestore();
    }
  });

  it("forwards a binary upstream response as exact bytes", async () => {
    // A forwarded accept header can make the upstream answer with binary (an image, an
    // octet-stream); text() would UTF-8-decode and corrupt it before it reaches the caller.
    const { createPageRouterHandler } = await import("./nextjs");
    const handler = createPageRouterHandler({
      allowUnauthorizedRequests: false,
      isAuthenticated: async () => true,
      resolveFalAuth: async () => "Key secret",
    });
    const request = {
      method: "GET",
      body: undefined,
      headers: {
        "x-fal-target-url": "https://fal.run/owner/app",
        accept: "image/png",
      },
    };
    const send = jest.fn();
    const response = {
      setHeader: jest.fn(),
      status: jest.fn(() => ({ json: jest.fn(), send })),
    };
    // Invalid UTF-8 on purpose: a lone continuation byte (0x80) becomes U+FFFD through text().
    const payload = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x80, 0x00, 0xff]);
    const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue(
      new Response(payload, {
        headers: { "content-type": "image/png" },
      }),
    );
    try {
      await handler(request as never, response as never);
      const sent = send.mock.calls[0][0] as Buffer;
      expect(Buffer.isBuffer(sent)).toBe(true);
      expect(new Uint8Array(sent)).toEqual(payload);
    } finally {
      fetchMock.mockRestore();
    }
  });

  it("fails loudly for untyped bodies Next decoded as text", async () => {
    // Binary posted without a content-type is text-decoded by Next's default parser too — and a
    // forwarded string would then be labeled application/json by the string default.
    const { createPageRouterHandler } = await import("./nextjs");
    const handler = createPageRouterHandler({
      allowUnauthorizedRequests: false,
      isAuthenticated: async () => true,
      resolveFalAuth: async () => "Key secret",
    });
    const request = {
      method: "POST",
      body: "already�mangled",
      headers: { "x-fal-target-url": "https://fal.run/owner/app" },
    };
    const response = {
      setHeader: jest.fn(),
      status: jest.fn(() => ({ json: jest.fn(), send: jest.fn() })),
    };

    await expect(handler(request as never, response as never)).rejects.toThrow(
      /bodyParser: false/,
    );
  });

  it("rejects text Next decoded with a non-UTF-8 charset", async () => {
    const { createPageRouterHandler } = await import("./nextjs");
    const handler = createPageRouterHandler({
      allowUnauthorizedRequests: false,
      isAuthenticated: async () => true,
      resolveFalAuth: async () => "Key secret",
    });
    const request = {
      method: "POST",
      body: "é",
      headers: {
        "x-fal-target-url": "https://fal.run/owner/app",
        "content-type": "text/plain; charset=iso-8859-1",
      },
    };
    const response = {
      setHeader: jest.fn(),
      status: jest.fn(() => ({ json: jest.fn(), send: jest.fn() })),
    };
    const fetchMock = jest.spyOn(global, "fetch");
    try {
      await expect(
        handler(request as never, response as never),
      ).rejects.toThrow(/iso-8859-1/);
      expect(fetchMock).not.toHaveBeenCalled();
    } finally {
      fetchMock.mockRestore();
    }
  });
});

describe("createRouteHandler (Next app router) body handling", () => {
  it("returns 413 before fetch when a raw body exceeds maxRequestBodyBytes", async () => {
    const { createRouteHandler } = await import("./nextjs");
    const { POST } = createRouteHandler({
      maxRequestBodyBytes: 1,
      allowUnauthorizedRequests: false,
      isAuthenticated: async () => true,
      resolveFalAuth: async () => "Key secret",
    });
    const request = new Request("http://local.test/api/fal/proxy", {
      method: "POST",
      headers: {
        "x-fal-target-url": "https://fal.run/owner/app",
        "content-type": "application/octet-stream",
      },
      body: new Uint8Array([1, 2]),
    });
    const fetchMock = jest.spyOn(global, "fetch");
    try {
      const response = await POST(request as never);

      expect(response.status).toBe(413);
      expect(fetchMock).not.toHaveBeenCalled();
    } finally {
      fetchMock.mockRestore();
    }
  });
});

describe("readUnconsumedRequestBody", () => {
  const streamOf = (chunks: Array<string | Uint8Array>) =>
    (async function* () {
      for (const chunk of chunks) {
        yield chunk;
      }
    })();

  it("concatenates raw stream chunks byte-identical", async () => {
    const { readUnconsumedRequestBody } = await import("./utils");
    const body = await readUnconsumedRequestBody(
      streamOf([new Uint8Array([0xff, 0x00]), new Uint8Array([0xd8])]),
    );
    expect(body).toEqual(new Uint8Array([0xff, 0x00, 0xd8]));
  });

  it("encodes string chunks and treats an empty stream as no body", async () => {
    const { readUnconsumedRequestBody } = await import("./utils");
    expect(await readUnconsumedRequestBody(streamOf(["ab", "c"]))).toEqual(
      new TextEncoder().encode("abc"),
    );
    expect(await readUnconsumedRequestBody(streamOf([]))).toBeUndefined();
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
  function behaviorFor(
    targetUrl: string | undefined,
    method = "POST",
    requestBody: string | Uint8Array = "{}",
  ) {
    const responses: Array<{ status: number; data: unknown }> = [];
    return {
      responses,
      behavior: {
        id: "test",
        method,
        getRequestBody: async () => requestBody,
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
    requestBody: string | Uint8Array = "{}",
  ) => {
    const { behavior, responses } = behaviorFor(targetUrl, method, requestBody);
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

  it("preserves multipart boundaries when forwarding a request body", async () => {
    const boundary = "multipart/form-data; boundary=----fal-test-boundary";
    const { behavior } = behaviorFor(
      "https://fal.run/owner/app",
      "POST",
      "------fal-test-boundary--",
    );
    behavior.getHeaders = () => ({ "content-type": boundary });
    behavior.getHeader = (name: string) => {
      if (name === "x-fal-target-url") return "https://fal.run/owner/app";
      if (name.toLowerCase() === "content-type") return boundary;
      return undefined;
    };
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response("{}"));
    try {
      await handleRequest(behavior as never, {
        allowUnauthorizedRequests: false,
        isAuthenticated: async () => true,
        resolveFalAuth: async () => "secret",
      });
      expect(fetchMock).toHaveBeenCalledWith(
        "https://fal.run/owner/app",
        expect.objectContaining({
          headers: expect.objectContaining({ "content-type": boundary }),
        }),
      );
    } finally {
      fetchMock.mockRestore();
    }
  });

  it("forwards a binary request body byte-identical", async () => {
    // Multipart file parts are binary. A body that ever passes through a string corrupts the bytes
    // that are not valid UTF-8, so the proxy must hand fetch exactly what the adapter read.
    const binary = new Uint8Array([0xff, 0x00, 0xd8, 0x88, 0x01]);
    const { behavior } = behaviorFor(
      "https://fal.run/owner/app",
      "POST",
      binary,
    );
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response("{}"));
    try {
      await handleRequest(behavior as never, {
        allowUnauthorizedRequests: false,
        isAuthenticated: async () => true,
        resolveFalAuth: async () => "secret",
      });
      expect(fetchMock).toHaveBeenCalledWith(
        "https://fal.run/owner/app",
        expect.objectContaining({ body: binary }),
      );
      expect(fetchMock.mock.calls[0][1]?.body).toBe(binary);
    } finally {
      fetchMock.mockRestore();
    }
  });

  it("forwards an allowlist of request headers, never ambient credentials", async () => {
    // Applications authenticate their own proxy route with custom headers no denylist can
    // enumerate; forwarding is therefore allowlist-only. x-fal-* and accept travel by default, a
    // provider header travels only when named in forwardRequestHeaders, and credentials addressed
    // to the proxy host never travel — even ambient infra headers stay behind.
    const incoming: Record<string, string> = {
      "x-fal-target-url": "https://wma.fal.run/session",
      accept: "text/event-stream",
      "x-provider-ticket": "abc",
      "x-session-token": "user-secret",
      "x-forwarded-for": "10.0.0.1",
      authorization: "Bearer proxy-user-token",
      cookie: "session=1",
    };
    const makeBehavior = () => {
      const { behavior } = behaviorFor("https://wma.fal.run/session");
      behavior.getHeaders = () => incoming;
      behavior.getHeader = (name: string) => incoming[name.toLowerCase()];
      return behavior;
    };
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response("{}"));
    try {
      await handleRequest(makeBehavior() as never, {
        allowUnauthorizedRequests: false,
        isAuthenticated: async () => true,
        resolveFalAuth: async () => "Key secret",
      });
      let sent = fetchMock.mock.calls[0][1]?.headers as Record<string, string>;
      expect(sent["x-fal-target-url"]).toBe("https://wma.fal.run/session");
      expect(sent.accept).toBe("text/event-stream");
      expect(sent.authorization).toBe("Key secret");
      // Not allowlisted: custom and ambient headers stay behind by default.
      expect(sent["x-provider-ticket"]).toBeUndefined();
      expect(sent["x-session-token"]).toBeUndefined();
      expect(sent["x-forwarded-for"]).toBeUndefined();
      expect(sent.cookie).toBeUndefined();

      fetchMock.mockClear();
      await handleRequest(makeBehavior() as never, {
        allowUnauthorizedRequests: false,
        isAuthenticated: async () => true,
        resolveFalAuth: async () => "Key secret",
        forwardRequestHeaders: ["x-provider-ticket", "cookie"],
      });
      sent = fetchMock.mock.calls[0][1]?.headers as Record<string, string>;
      // The named provider header now travels; proxy-host credentials never do, even when named.
      expect(sent["x-provider-ticket"]).toBe("abc");
      expect(sent["x-session-token"]).toBeUndefined();
      expect(sent.cookie).toBeUndefined();

      // content-encoding is end-to-end metadata for the raw-bytes path: never forwarded by
      // default, forwardable when the operator names it.
      incoming["content-encoding"] = "gzip";
      fetchMock.mockClear();
      await handleRequest(makeBehavior() as never, {
        allowUnauthorizedRequests: false,
        isAuthenticated: async () => true,
        resolveFalAuth: async () => "Key secret",
      });
      sent = fetchMock.mock.calls[0][1]?.headers as Record<string, string>;
      expect(sent["content-encoding"]).toBeUndefined();

      fetchMock.mockClear();
      await handleRequest(makeBehavior() as never, {
        allowUnauthorizedRequests: false,
        isAuthenticated: async () => true,
        resolveFalAuth: async () => "Key secret",
        forwardRequestHeaders: ["content-encoding"],
      });
      sent = fetchMock.mock.calls[0][1]?.headers as Record<string, string>;
      // The behavior's body is a STRING here — parser output, already inflated — so even an
      // explicitly forwarded content-encoding is stripped; it only describes raw byte bodies.
      expect(sent["content-encoding"]).toBeUndefined();

      fetchMock.mockClear();
      const rawBehavior = behaviorFor(
        "https://wma.fal.run/session",
        "POST",
        new Uint8Array([0x1f, 0x8b, 0x08]),
      ).behavior;
      rawBehavior.getHeaders = () => incoming;
      rawBehavior.getHeader = (name: string) => incoming[name.toLowerCase()];
      await handleRequest(rawBehavior as never, {
        allowUnauthorizedRequests: false,
        isAuthenticated: async () => true,
        resolveFalAuth: async () => "Key secret",
        forwardRequestHeaders: ["content-encoding"],
      });
      sent = fetchMock.mock.calls[0][1]?.headers as Record<string, string>;
      expect(sent["content-encoding"]).toBe("gzip");

      // A parser-produced buffer (express.raw output) is already inflated too — the brand from
      // serializeParsedBody must strip the header even though the body is bytes, not a string.
      fetchMock.mockClear();
      const { serializeParsedBody } = await import("./utils");
      const parsedBytes = serializeParsedBody(
        new Uint8Array([0x7b, 0x7d]),
        "application/octet-stream",
      ) as Uint8Array;
      const parsedByteBehavior = behaviorFor(
        "https://wma.fal.run/session",
        "POST",
        parsedBytes,
      ).behavior;
      parsedByteBehavior.getHeaders = () => incoming;
      parsedByteBehavior.getHeader = (name: string) =>
        incoming[name.toLowerCase()];
      await handleRequest(parsedByteBehavior as never, {
        allowUnauthorizedRequests: false,
        isAuthenticated: async () => true,
        resolveFalAuth: async () => "Key secret",
        forwardRequestHeaders: ["content-encoding"],
      });
      sent = fetchMock.mock.calls[0][1]?.headers as Record<string, string>;
      expect(sent["content-encoding"]).toBeUndefined();
      delete incoming["content-encoding"];
    } finally {
      fetchMock.mockRestore();
    }
  });

  it("omits content-type when the incoming request omitted it", async () => {
    // Fetch generates no content type for raw binary bodies; the proxy defaulting one to JSON
    // would make upstream endpoints parse valid bytes as JSON. Present headers pass through
    // untouched, absent ones stay absent.
    const { behavior } = behaviorFor(
      "https://fal.run/owner/app",
      "POST",
      new Uint8Array([0xff, 0x00]),
    );
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response("{}"));
    try {
      await handleRequest(behavior as never, {
        allowUnauthorizedRequests: false,
        isAuthenticated: async () => true,
        resolveFalAuth: async () => "Key secret",
      });
      const sent = fetchMock.mock.calls[0][1]?.headers as Record<
        string,
        string
      >;
      expect("content-type" in sent).toBe(false);
    } finally {
      fetchMock.mockRestore();
    }
  });

  it("defaults string bodies to application/json when no content-type came in", async () => {
    // Bare fetch(proxy, { body: JSON.stringify(x) }) callers relied on the proxy's historical
    // JSON rewrite (the browser would otherwise have labeled the body text/plain). Binary bodies
    // stay label-free; string bodies keep the JSON default.
    const { behavior } = behaviorFor(
      "https://fal.run/owner/app",
      "POST",
      '{"prompt":"a cat"}',
    );
    const fetchMock = jest
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response("{}"));
    try {
      await handleRequest(behavior as never, {
        allowUnauthorizedRequests: false,
        isAuthenticated: async () => true,
        resolveFalAuth: async () => "Key secret",
      });
      const sent = fetchMock.mock.calls[0][1]?.headers as Record<
        string,
        string
      >;
      expect(sent["content-type"]).toBe("application/json");
    } finally {
      fetchMock.mockRestore();
    }
  });

  it("extracts the WMA app id from a bytes body", async () => {
    // Adapters now hand over raw bytes; the app-id gate decodes them for parsing while the
    // forwarded body stays untouched. Auth is satisfied and no fal credential is configured, so a
    // 401 from the credential step proves the gate accepted the decoded id — a rejected id would
    // have returned 400 before it.
    const body = new TextEncoder().encode(
      JSON.stringify({ app_id: "me/my-app/world" }),
    );
    const config = {
      allowedEndpoints: ["me/my-app/**"],
      isAuthenticated: async () => true,
      // No credential, so an accepted app id stops at the credential 401 instead of fetching.
      resolveFalAuth: async () => undefined,
    };
    expect(
      await run("https://wma.fal.run/session", config, "POST", body),
    ).toEqual({ status: 401, data: "Unauthorized" });
    expect(
      await run(
        "https://wma.fal.run/session",
        config,
        "POST",
        new TextEncoder().encode(JSON.stringify({ app_id: "someone/else" })),
      ),
    ).toEqual({
      status: 400,
      data: "Invalid request: target path is not permitted by allowedEndpoints",
    });
  });

  it("returns 413 when the app-scoped service body exceeds the adapter limit", async () => {
    const { RequestBodyTooLargeError } = await import("./utils");
    const { behavior, responses } = behaviorFor("https://wma.fal.run/session");
    behavior.getRequestBody = async () => {
      throw new RequestBodyTooLargeError(1);
    };

    await handleRequest(behavior as never, {
      allowedEndpoints: ["owner/app"],
      allowUnauthorizedRequests: false,
      isAuthenticated: async () => true,
      resolveFalAuth: async () => "Key secret",
    });

    expect(responses[0]).toMatchObject({ status: 413 });
  });

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

  it("rejects non-POST methods on fal service hosts", async () => {
    // The allowlist bypass must not become a method-shaped hole: endpoint policy is POST-only,
    // so a GET/PUT/DELETE to the bridge would otherwise forward credentialed with no check.
    for (const method of ["GET", "PUT", "PATCH", "DELETE"]) {
      expect(
        await run(
          "https://wma.fal.run/session",
          { isAuthenticated: async () => true },
          method,
        ),
      ).toEqual({
        status: 400,
        data: "Invalid request: fal service hosts only accept POST",
      });
    }
  });

  it("rejects unknown fal service routes (default-deny)", async () => {
    // A route added upstream must be added HERE deliberately — unknown spellings, matrix
    // parameters, embedded NULs, and plain unknown paths all refuse rather than forward.
    for (const path of [
      "/upload",
      "/session;x=1",
      "/session%00",
      "/session/v2",
    ]) {
      expect(
        await run(`https://wma.fal.run${path}`, {
          isAuthenticated: async () => true,
        }),
      ).toEqual({
        status: 400,
        data: "Invalid request: unknown fal service route",
      });
    }
  });

  it("allows the session-scoped heartbeat without an app id under restriction", async () => {
    expect(
      await run("https://wma.fal.run/session/heartbeat", {
        allowedEndpoints: ["me/my-app/**"],
        isAuthenticated: async () => true,
        resolveFalAuth: async () => undefined,
      }),
    ).toEqual({ status: 401, data: "Unauthorized" }); // passed policy, stopped only by no key
  });

  it("rejects duplicate app_id keys in an app-scoped service body", async () => {
    // JSON parsers disagree about which duplicate wins; the allowlist verdict must not depend
    // on the proxy's parser agreeing with the upstream's.
    expect(
      await run(
        "https://wma.fal.run/session",
        {
          allowedEndpoints: ["me/my-app/**"],
          isAuthenticated: async () => true,
        },
        "POST",
        '{"app_id":"me/my-app","app_id":"someone/other-app"}',
      ),
    ).toEqual({
      status: 400,
      data: "Invalid request: target path is not permitted by allowedEndpoints",
    });
  });

  it("rejects duplicate app_id keys written with JSON escapes", async () => {
    for (const body of [
      '{"app_id":"blocked/app","app_\\u0069d":"owner/app"}',
      '{"app_\\u0069d":"blocked/app","app_id":"owner/app"}',
    ]) {
      expect(
        await run(
          "https://wma.fal.run/session",
          {
            allowedEndpoints: ["owner/app"],
            isAuthenticated: async () => true,
          },
          "POST",
          body,
        ),
      ).toEqual({
        status: 400,
        data: "Invalid request: target path is not permitted by allowedEndpoints",
      });
    }
  });

  it("lets operators refuse service hosts entirely with serviceHosts: []", async () => {
    expect(
      await run("https://wma.fal.run/session", {
        serviceHosts: [],
        isAuthenticated: async () => true,
      }),
    ).toEqual({
      status: 400,
      data: "Invalid request: target URL is not permitted by allowedUrlPatterns",
    });
  });

  it("rejects a malformed target URL as a 400, not a 500", async () => {
    expect(
      await run("not a url at all", { isAuthenticated: async () => true }),
    ).toEqual({
      status: 400,
      data: "Invalid request: x-fal-target-url is not a valid absolute URL",
    });
  });

  it("rejects an unauthenticated caller before revealing endpoint policy", async () => {
    // Auth runs FIRST: an unauthenticated caller must not learn which endpoints this proxy
    // permits by reading which check rejected them.
    expect(
      await run("https://fal.run/someone/other-app", {
        allowedEndpoints: ["me/my-app/**"],
      }),
    ).toEqual({ status: 401, data: "Unauthorized" });
  });

  it("names allowedEndpoints when the path is not permitted", async () => {
    // The URL is allowlisted but the path is not. Naming the failed policy tells the caller whether
    // to update host permissions, endpoint permissions, or request construction.
    expect(
      await run("https://fal.run/someone/other-app", {
        allowedEndpoints: ["me/my-app/**"],
        isAuthenticated: async () => true,
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
          isAuthenticated: async () => true,
        }),
      ).toEqual({
        status: 400,
        data: "Invalid request: target path is not permitted by allowedEndpoints",
      });
    }
  });

  it("checks the WMA app id instead of treating its route as an app path", async () => {
    // Reaches auth (401) because the body app_id is allowed. The literal `session` path is bridge
    // infrastructure and is not itself an endpoint id.
    expect(
      await run(
        "https://wma.fal.run/session",
        { allowedEndpoints: ["me/my-app/**"] },
        "POST",
        JSON.stringify({ app_id: "me/my-app/world" }),
      ),
    ).toEqual({ status: 401, data: "Unauthorized" });
  });

  it("authenticates before reading an app-scoped WMA body", async () => {
    const { behavior, responses } = behaviorFor(
      "https://wma.fal.run/session",
      "POST",
      JSON.stringify({ app_id: "me/my-app" }),
    );
    const getRequestBody = jest.spyOn(behavior, "getRequestBody");

    await handleRequest(
      behavior as never,
      {
        allowedEndpoints: ["me/my-app/**"],
        allowUnauthorizedRequests: false,
        isAuthenticated: async () => false,
      } as never,
    );

    expect(responses[0]).toEqual({ status: 401, data: "Unauthorized" });
    expect(getRequestBody).not.toHaveBeenCalled();
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
      await run(
        "https://wma.fal.run/session",
        {
          allowedUrlPatterns: ["fal.run/me/my-app/**"],
          allowedEndpoints: ["me/my-app/**"],
        },
        "POST",
        JSON.stringify({ app_id: "me/my-app/world" }),
      ),
    ).toEqual({ status: 401, data: "Unauthorized" });
  });

  it("enforces allowedEndpoints against WMA request app_id values", async () => {
    for (const path of ["ice", "session"]) {
      expect(
        await run(
          `https://wma.fal.run/${path}`,
          {
            allowedEndpoints: ["me/my-app/**"],
            isAuthenticated: async () => true,
          },
          "POST",
          JSON.stringify({ app_id: "someone/other-app" }),
        ),
      ).toEqual({
        status: 400,
        data: "Invalid request: target path is not permitted by allowedEndpoints",
      });
    }
  });

  it("enforces WMA app identity through percent-encoded route spellings", async () => {
    expect(
      await run(
        "https://wma.fal.run/%73ession",
        {
          allowedEndpoints: ["me/my-app/**"],
          isAuthenticated: async () => true,
        },
        "POST",
        JSON.stringify({ app_id: "someone/other-app" }),
      ),
    ).toEqual({
      status: 400,
      data: "Invalid request: target path is not permitted by allowedEndpoints",
    });
  });

  it("rejects an app-scoped WMA request with no app_id when endpoints are restricted", async () => {
    expect(
      await run(
        "https://wma.fal.run/session",
        {
          allowedEndpoints: ["me/my-app/**"],
          isAuthenticated: async () => true,
        },
        "POST",
        "{}",
      ),
    ).toEqual({
      status: 400,
      data: "Invalid request: target path is not permitted by allowedEndpoints",
    });
  });

  it("does not exempt the bridge host over plaintext HTTP", async () => {
    expect(
      await run("http://wma.fal.run/session", {
        allowedUrlPatterns: ["fal.run/me/my-app/**"],
        allowedEndpoints: ["me/my-app/**"],
      }),
    ).toEqual({
      status: 400,
      data: "Invalid request: target URL is not permitted by allowedUrlPatterns",
    });
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
