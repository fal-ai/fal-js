import { createFalClient } from "./client";
import { createConfig } from "./config";
import { buildUrl, dispatchRequest } from "./request";

type Call = { url: string; headers: Headers };

function recordingFetch() {
  const calls: Call[] = [];
  const fetch = (async (url: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(url), headers: new Headers(init?.headers) });
    return new Response("{}", {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof globalThis.fetch;
  return { calls, fetch };
}

const INVALID_SUBDOMAINS = [
  "evil.example#",
  "evil.example/",
  "evil.example?",
  "user@evil.example",
  "evil.example:8443",
  "evil.example\\",
  "evil.example\t",
  "evil.example\n",
  "evil.example ",
  "evil.example%2f",
  "evil_example",
  "[::1]",
];

// Not well-formed host names, but made only of host name characters: they are let through
// because they cannot move the request off fal.run.
const MALFORMED_SUBDOMAINS = [
  "-queue",
  "queue-",
  "queue.",
  ".queue",
  "a..b",
  ".",
  "a".repeat(64),
];

describe("buildUrl", () => {
  it("builds fal.run URLs with and without a subdomain", () => {
    expect(buildUrl("fal-ai/flux")).toBe("https://fal.run/fal-ai/flux");
    expect(buildUrl("fal-ai/flux", { subdomain: "" })).toBe(
      "https://fal.run/fal-ai/flux",
    );
    expect(buildUrl("fal-ai/flux", { subdomain: "queue" })).toBe(
      "https://queue.fal.run/fal-ai/flux",
    );
    expect(
      buildUrl("fal-ai/flux", {
        subdomain: "queue",
        path: "/requests/abc/status",
        query: { logs: "1" },
      }),
    ).toBe("https://queue.fal.run/fal-ai/flux/requests/abc/status?logs=1");
  });

  it("accepts host names made of several labels", () => {
    expect(buildUrl("fal-ai/flux", { subdomain: "eu-1.queue" })).toBe(
      "https://eu-1.queue.fal.run/fal-ai/flux",
    );
    expect(buildUrl("fal-ai/flux", { subdomain: "a".repeat(63) })).toBe(
      `https://${"a".repeat(63)}.fal.run/fal-ai/flux`,
    );
  });

  it.each(INVALID_SUBDOMAINS)("rejects the subdomain %j", (subdomain) => {
    expect(() => buildUrl("fal-ai/flux", { subdomain })).toThrow(
      /Invalid subdomain/,
    );
  });

  it.each(MALFORMED_SUBDOMAINS)(
    "keeps the malformed subdomain %j under fal.run",
    (subdomain) => {
      const { protocol, hostname, port, pathname } = new URL(
        buildUrl("fal-ai/flux", { subdomain }),
      );
      expect(protocol).toBe("https:");
      expect(port).toBe("");
      expect(hostname.endsWith(".fal.run")).toBe(true);
      expect(pathname).toBe("/fal-ai/flux");
    },
  );

  it("rejects subdomains that are not strings", () => {
    for (const subdomain of [["evil.example/"], { toString: () => "x/" }, 1]) {
      expect(() =>
        buildUrl("fal-ai/flux", { subdomain: subdomain as never }),
      ).toThrow(/Invalid subdomain/);
    }
  });

  it("only ever returns fal URLs", () => {
    for (const subdomain of ["queue", "eu-1.queue", undefined]) {
      const { protocol, hostname, port } = new URL(
        buildUrl("fal-ai/flux", { subdomain }),
      );
      expect(protocol).toBe("https:");
      expect(port).toBe("");
      expect(hostname === "fal.run" || hostname.endsWith(".fal.run")).toBe(
        true,
      );
    }
  });
});

describe("client.run", () => {
  it.each(INVALID_SUBDOMAINS)(
    "does not send a request for the subdomain %j",
    async (subdomain) => {
      const { calls, fetch } = recordingFetch();
      const client = createFalClient({ credentials: "test-key", fetch });
      await expect(
        client.run("fal-ai/flux", { input: {}, subdomain } as never),
      ).rejects.toThrow(/Invalid subdomain/);
      expect(calls).toHaveLength(0);
    },
  );
});

describe("dispatchRequest credentials", () => {
  const send = async (
    targetUrl: string,
    overrides: Parameters<typeof createConfig>[0] = {},
  ) => {
    const { calls, fetch } = recordingFetch();
    const config = createConfig({
      credentials: "test-key",
      fetch,
      retry: { maxRetries: 0 },
      ...overrides,
    });
    await dispatchRequest({ targetUrl, config, input: {} });
    expect(calls).toHaveLength(1);
    return calls[0];
  };

  it.each([
    "https://fal.run/fal-ai/flux",
    "https://queue.fal.run/fal-ai/flux/requests/abc/status",
    "https://rest.fal.ai/tokens/",
  ])("sends the key to %s", async (targetUrl) => {
    const call = await send(targetUrl);
    expect(call.url).toBe(targetUrl);
    expect(call.headers.get("authorization")).toBe("Key test-key");
  });

  it.each([
    "https://evil.example/fal-ai/flux",
    "https://evil.example/.fal.run/fal-ai/flux",
    "https://notfal.run/fal-ai/flux",
    "https://fal.run.evil.example/fal-ai/flux",
    "https://fal.run:8443/fal-ai/flux",
    "http://fal.run/fal-ai/flux",
  ])("does not send the key to %s", async (targetUrl) => {
    const call = await send(targetUrl);
    expect(call.headers.has("authorization")).toBe(false);
  });

  it("keeps the key on fal requests routed through a proxy", async () => {
    const call = await send("https://fal.run/fal-ai/flux", {
      proxyUrl: { url: "https://app.example/api/fal/proxy", when: "always" },
    });
    expect(call.url).toBe("https://app.example/api/fal/proxy");
    expect(call.headers.get("x-fal-target-url")).toBe(
      "https://fal.run/fal-ai/flux",
    );
    expect(call.headers.get("authorization")).toBe("Key test-key");
  });
});
