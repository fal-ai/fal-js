import { TARGET_URL_HEADER, withProxy, type RequestConfig } from "./middleware";

const PROXY_URL = "https://example.com/api/fal/proxy";
const ORIGIN_URL = "https://queue.fal.run/fal-ai/flux/text-to-image";

function makeRequest(headers?: RequestConfig["headers"]): RequestConfig {
  return {
    url: ORIGIN_URL,
    method: "POST",
    headers,
  };
}

function fakeBrowser() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.window = { document: {} } as any;
}

function clearBrowser() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (global as any).window;
}

describe("withProxy", () => {
  afterEach(() => {
    clearBrowser();
  });

  describe("default (browser-only) behavior", () => {
    it("rewrites the request URL in a browser environment", async () => {
      fakeBrowser();
      const middleware = withProxy({ targetUrl: PROXY_URL });
      const result = await middleware(makeRequest());

      expect(result.url).toBe(PROXY_URL);
      expect(result.headers?.[TARGET_URL_HEADER]).toBe(ORIGIN_URL);
    });

    it("passes requests through unchanged outside a browser", async () => {
      const middleware = withProxy({ targetUrl: PROXY_URL });
      const result = await middleware(makeRequest());

      expect(result.url).toBe(ORIGIN_URL);
      expect(result.headers?.[TARGET_URL_HEADER]).toBeUndefined();
    });

    it("evaluates the runtime per call, not at construction", async () => {
      const middleware = withProxy({ targetUrl: PROXY_URL });

      const serverResult = await middleware(makeRequest());
      expect(serverResult.url).toBe(ORIGIN_URL);

      fakeBrowser();
      const browserResult = await middleware(makeRequest());
      expect(browserResult.url).toBe(PROXY_URL);
    });
  });

  describe("when: 'always'", () => {
    it("rewrites the request URL outside a browser", async () => {
      const middleware = withProxy({ targetUrl: PROXY_URL, when: "always" });
      const result = await middleware(makeRequest());

      expect(result.url).toBe(PROXY_URL);
      expect(result.headers?.[TARGET_URL_HEADER]).toBe(ORIGIN_URL);
    });

    it("rewrites the request URL in a browser", async () => {
      fakeBrowser();
      const middleware = withProxy({ targetUrl: PROXY_URL, when: "always" });
      const result = await middleware(makeRequest());

      expect(result.url).toBe(PROXY_URL);
    });
  });

  describe("when: predicate", () => {
    it("rewrites when the predicate returns true", async () => {
      const middleware = withProxy({
        targetUrl: PROXY_URL,
        when: ({ isBrowser }) => !isBrowser,
      });
      const result = await middleware(makeRequest());

      expect(result.url).toBe(PROXY_URL);
      expect(result.headers?.[TARGET_URL_HEADER]).toBe(ORIGIN_URL);
    });

    it("skips when the predicate returns false", async () => {
      fakeBrowser();
      const middleware = withProxy({
        targetUrl: PROXY_URL,
        when: ({ isBrowser }) => !isBrowser,
      });
      const result = await middleware(makeRequest());

      expect(result.url).toBe(ORIGIN_URL);
    });

    it("receives the correct runtime env flags", async () => {
      const seen: boolean[] = [];
      const middleware = withProxy({
        targetUrl: PROXY_URL,
        when: ({ isBrowser }) => {
          seen.push(isBrowser);
          return true;
        },
      });

      await middleware(makeRequest());
      fakeBrowser();
      await middleware(makeRequest());

      expect(seen).toEqual([false, true]);
    });
  });

  describe("re-entrancy", () => {
    it("passes through when the target URL header is already set", async () => {
      fakeBrowser();
      const middleware = withProxy({ targetUrl: PROXY_URL, when: "always" });
      const result = await middleware(
        makeRequest({ [TARGET_URL_HEADER]: "https://other.example/api" }),
      );

      expect(result.url).toBe(ORIGIN_URL);
      expect(result.headers?.[TARGET_URL_HEADER]).toBe(
        "https://other.example/api",
      );
    });
  });
});
