import { isAuthorizationHeaderPresent } from "./config";
import { fromHeaders, handleRequest, TARGET_URL_HEADER } from "./index";
import type { HeaderValue, ProxyBehavior } from "./types";

type Result = {
  status: number;
  body: unknown;
  headers: Record<string, string>;
};

function behaviorFor(
  targetUrl: string,
  method = "POST",
  requestHeaders: Record<string, HeaderValue> = {},
) {
  const headers: Record<string, HeaderValue> = {
    [TARGET_URL_HEADER]: targetUrl,
    ...requestHeaders,
  };
  const sent: Record<string, string> = {};
  const behavior: ProxyBehavior<Promise<Result> | Result> = {
    id: "test",
    method,
    respondWith: (status, body) => ({ status, body, headers: sent }),
    sendResponse: async (response) => ({
      status: response.status,
      body: await response.text(),
      headers: fromHeaders(response.headers) as Record<string, string>,
    }),
    getHeaders: () => headers,
    // Node-style adapters report a missing header as `undefined`.
    getHeader: (name) => headers[name.toLowerCase()],
    sendHeader: (name, value) => {
      sent[name] = value;
    },
    getRequestBody: async () => "{}",
  };
  return { behavior, sent };
}

const config = {
  allowUnauthorizedRequests: true,
  resolveFalAuth: async () => "Key secret",
};

describe("proxy request validation", () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest
      .spyOn(globalThis, "fetch")
      .mockImplementation(async () => new Response("{}"));
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const run = async (
    targetUrl: string,
    method = "POST",
    extraConfig: Record<string, unknown> = {},
    requestHeaders: Record<string, HeaderValue> = {},
  ) => {
    const { behavior } = behaviorFor(targetUrl, method, requestHeaders);
    return handleRequest(behavior, { ...config, ...extraConfig });
  };

  describe("target URL", () => {
    it.each([
      ["a malformed URL", "not a url"],
      ["plain HTTP", "http://fal.run/fal-ai/flux"],
      ["a non-HTTP scheme", "ftp://fal.run/fal-ai/flux"],
      ["an embedded username", "https://user@fal.run/fal-ai/flux"],
      ["an embedded password", "https://:pass@fal.run/fal-ai/flux"],
      ["an encoded slash", "https://fal.run/fal-ai/flux/..%2f..%2fother/app"],
      ["an encoded backslash", "https://fal.run/fal-ai/flux/..%5C..%5Cother"],
    ])("rejects %s without contacting the upstream", async (_, targetUrl) => {
      expect(await run(targetUrl)).toMatchObject({ status: 400 });
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("forwards a valid HTTPS target", async () => {
      expect(await run("https://fal.run/fal-ai/flux")).toMatchObject({
        status: 200,
      });
      expect(fetchSpy).toHaveBeenCalledWith(
        "https://fal.run/fal-ai/flux",
        expect.objectContaining({
          headers: expect.objectContaining({ authorization: "Key secret" }),
        }),
      );
    });
  });

  describe("default authentication check", () => {
    it.each([undefined, null, "", []])(
      "treats a %p authorization header as missing",
      async (value) => {
        const { behavior } = behaviorFor("https://fal.run/fal-ai/flux");
        behavior.getHeader = () => value as HeaderValue;
        expect(await isAuthorizationHeaderPresent(behavior)).toBe(false);
      },
    );

    it("accepts a present authorization header", async () => {
      const { behavior } = behaviorFor("https://fal.run/fal-ai/flux", "POST", {
        authorization: "Key user",
      });
      expect(await isAuthorizationHeaderPresent(behavior)).toBe(true);
    });

    it("returns 401 when the header is missing and unauthorized requests are disallowed", async () => {
      const { behavior } = behaviorFor("https://fal.run/fal-ai/flux");
      expect(
        await handleRequest(behavior, { allowUnauthorizedRequests: false }),
      ).toMatchObject({ status: 401 });
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  describe("allowedEndpoints", () => {
    const restricted = { allowedEndpoints: ["fal-ai/flux/dev"] };

    it.each(["GET", "PUT", "PATCH", "DELETE", "POST"])(
      "rejects %s to an endpoint outside the allowlist",
      async (method) => {
        for (const host of ["fal.run", "queue.fal.run"]) {
          expect(
            await run(`https://${host}/someone/other-app`, method, restricted),
          ).toMatchObject({ status: 400 });
        }
        expect(fetchSpy).not.toHaveBeenCalled();
      },
    );

    it("allows any method on an allowed endpoint", async () => {
      for (const method of ["GET", "POST"]) {
        expect(
          await run("https://fal.run/fal-ai/flux/dev", method, restricted),
        ).toMatchObject({ status: 200 });
      }
    });

    it.each([
      ["GET", "fal-ai/flux/requests/abc-123"],
      ["GET", "fal-ai/flux/requests/abc-123/status"],
      ["GET", "fal-ai/flux/requests/abc-123/status/stream"],
      ["PUT", "fal-ai/flux/requests/abc-123/cancel"],
    ])("allows queue route %s %s of an allowed app", async (method, path) => {
      expect(
        await run(`https://queue.fal.run/${path}?logs=1`, method, restricted),
      ).toMatchObject({ status: 200 });
    });

    it("allows queue routes of namespaced and wildcard patterns", async () => {
      for (const [pattern, path] of [
        ["workflows/me/my-flow", "workflows/me/my-flow/requests/abc/status"],
        ["fal-ai/**", "fal-ai/flux/requests/abc/status"],
        ["fal-ai/*", "fal-ai/flux/requests/abc/status"],
        ["**", "anyone/anything/requests/abc/status"],
      ]) {
        expect(
          await run(`https://queue.fal.run/${path}`, "GET", {
            allowedEndpoints: [pattern],
          }),
        ).toMatchObject({ status: 200 });
      }
    });

    it.each([
      ["GET", "someone/other-app/requests/abc-123/status"],
      ["PUT", "someone/other-app/requests/abc-123/cancel"],
      ["GET", "fal-ai/other/requests/abc-123"],
      ["GET", "workflows/fal-ai/flux/requests/abc-123"],
      ["GET", "fal-ai/flux/requests/abc-123/unknown"],
      ["GET", "fal-ai/flux/extra/requests/abc-123/status"],
      // Queue routes are never submitted with POST, so POST keeps the strict path match.
      ["POST", "fal-ai/flux/requests/abc-123/status"],
    ])("rejects queue route %s %s", async (method, path) => {
      expect(
        await run(`https://queue.fal.run/${path}`, method, restricted),
      ).toMatchObject({ status: 400 });
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("keeps every endpoint allowed when no patterns are configured", async () => {
      expect(
        await run("https://fal.run/someone/other-app", "GET"),
      ).toMatchObject({ status: 200 });
    });
  });

  describe("upstream response", () => {
    it("does not follow redirects", async () => {
      fetchSpy.mockImplementation(
        async () =>
          new Response(null, {
            status: 307,
            headers: { location: "http://169.254.169.254/latest/meta-data" },
          }),
      );
      const result = await run("https://fal.run/fal-ai/flux", "GET");
      expect(result).toMatchObject({ status: 502 });
      expect(result.headers).not.toHaveProperty("location");
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        "https://fal.run/fal-ai/flux",
        expect.objectContaining({ redirect: "manual" }),
      );
    });

    it("forwards only the allowed response headers", async () => {
      fetchSpy.mockImplementation(
        async () =>
          new Response("<script>alert(1)</script>", {
            status: 403,
            headers: {
              "content-type": "text/html",
              "x-fal-request-id": "req-1",
              "retry-after": "3",
              "set-cookie": "session=attacker; Path=/",
              "cache-control": "public, s-maxage=86400",
              "content-security-policy": "default-src *",
              "access-control-allow-origin": "*",
              "content-encoding": "gzip",
              location: "https://example.com",
            },
          }),
      );
      const { behavior, sent } = behaviorFor("https://fal.run/fal-ai/flux");
      const result = await handleRequest(behavior, config);
      const expected = {
        "content-type": "text/html",
        "x-fal-request-id": "req-1",
        "retry-after": "3",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
      };
      expect(result.status).toBe(403);
      // Headers on the response handed to passthrough adapters...
      expect(result.headers).toEqual(expected);
      // ...and the ones sent through `sendHeader` for Node-style adapters.
      expect(sent).toEqual(expected);
    });
  });
});
