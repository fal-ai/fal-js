import { createConfig } from "./config";
import { createRealtimeClient } from "./realtime";
import {
  defineRealtimeExtension,
  type RealtimeSession,
} from "./realtime/extension";

describe("realtime extensions", () => {
  beforeAll(() => {
    global.fetch = jest.fn() as any;
  });

  function extension(cleanup = jest.fn()) {
    return defineRealtimeExtension<
      { endpointId?: string; label: string; abortSignal?: AbortSignal },
      RealtimeSession & { label: string }
    >({
      id: "test/world",
      defaultEndpoint: "test/world",
      supports: (endpointId) => endpointId === "test/world",
      async open(context, options) {
        context.addCleanup(cleanup);
        return {
          label: options.label,
          close: jest.fn(),
        };
      },
    });
  }

  it("opens an explicitly supplied extension with its typed session", async () => {
    const client = createRealtimeClient({
      config: createConfig({ credentials: "test-key" }),
    });
    const world = extension();

    const session = await client.open(world, {
      label: "hello",
    });

    expect(session.label).toBe("hello");
  });

  it("selects an installed extension by endpoint", async () => {
    const world = extension();
    const client = createRealtimeClient({
      config: createConfig({
        credentials: "test-key",
        realtime: { extensions: [world] },
      }),
    });

    const session = await client.open<
      { label: string },
      RealtimeSession & { label: string }
    >("test/world", { label: "installed" });

    expect(session.label).toBe("installed");
  });

  it("runs cleanup exactly once when close is called repeatedly", async () => {
    const cleanup = jest.fn();
    const client = createRealtimeClient({
      config: createConfig({ credentials: "test-key" }),
    });
    const session = await client.open(extension(cleanup), {
      endpointId: "test/world",
      label: "cleanup",
    });

    await session.close();
    await session.close();

    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("does not invoke an extension when opening was already aborted", async () => {
    const controller = new AbortController();
    const reason = new Error("user left");
    controller.abort(reason);
    const world = extension();
    const open = jest.spyOn(world, "open");
    const client = createRealtimeClient({
      config: createConfig({ credentials: "test-key" }),
    });

    await expect(
      client.open(world, {
        label: "aborted",
        abortSignal: controller.signal,
      }),
    ).rejects.toBe(reason);

    expect(open).not.toHaveBeenCalled();
  });

  it("reports a missing installed extension clearly", async () => {
    const client = createRealtimeClient({
      config: createConfig({ credentials: "test-key" }),
    });

    await expect(client.open("unknown/world", {})).rejects.toThrow(
      'No realtime extension is installed for "unknown/world".',
    );
  });

  it("rejects ambiguous installed extensions", async () => {
    const first = extension();
    const second = { ...extension(), id: "test/world-duplicate" };
    const client = createRealtimeClient({
      config: createConfig({
        credentials: "test-key",
        realtime: { extensions: [first, second] },
      }),
    });

    await expect(client.open("test/world", {})).rejects.toThrow(
      'Multiple realtime extensions support "test/world"',
    );
  });
});

describe("realtime extension context additions", () => {
  it("context.fetch attaches the parent client's credentials", async () => {
    // The point of this method existing: the extension makes the call, so the APPLICATION never has
    // to inject a credentialed fetch and never handles a key.
    const seen: Array<{ url: string; init: RequestInit }> = [];
    const client = createRealtimeClient({
      config: createConfig({
        credentials: "secret-key",
        fetch: (async (url: string, init: RequestInit) => {
          seen.push({ url, init });
          return new Response("{}", { status: 200 });
        }) as any,
      }),
    });

    const probe = defineRealtimeExtension<
      Record<string, never>,
      RealtimeSession
    >({
      id: "test/fetch",
      defaultEndpoint: "test/fetch",
      supports: () => true,
      async open(context) {
        const response = await context.fetch("https://wma.fal.run/session", {
          body: JSON.stringify({ app_id: "x" }),
        });
        expect(response.status).toBe(200);
        return { close: jest.fn() };
      },
    });

    await client.open(probe, {});
    expect(seen).toHaveLength(1);
    expect(seen[0].url).toBe("https://wma.fal.run/session");
    expect((seen[0].init.headers as Record<string, string>).Authorization).toBe(
      "Key secret-key",
    );
    // Defaults to POST, and the abort signal is wired without the extension asking.
    expect(seen[0].init.method).toBe("POST");
    expect(seen[0].init.signal).toBeDefined();
  });

  it("routes context.media and context.data to the caller's handlers", async () => {
    const client = createRealtimeClient({
      config: createConfig({ credentials: "k" }),
    });
    const stream = { id: "s" } as unknown as MediaStream;
    const probe = defineRealtimeExtension<
      // Record<never, never>, NOT Record<string, never>. The latter says "every string key maps to
      // never", which makes `Options & RealtimeOpenOptions` contradictory and rejects onMedia/onState/
      // onDiagnostic at the call site — an extension with no product inputs of its own would otherwise
      // be unable to receive any kernel option.
      Record<never, never>,
      RealtimeSession
    >({
      id: "test/channels",
      defaultEndpoint: "test/channels",
      supports: () => true,
      async open(context) {
        context.media(stream);
        context.data('{"a":1}');
        return { close: jest.fn() };
      },
    });

    const media: MediaStream[] = [];
    const data: string[] = [];
    await client.open(probe, {
      onMedia: (value) => media.push(value),
      onData: (value) => data.push(value),
    });
    expect(media).toEqual([stream]);
    expect(data).toEqual(['{"a":1}']);
  });

  it("a throwing media or data handler cannot fail the session", async () => {
    // These fire from inside pc.ontrack and channel.onmessage, where a throw lands in a browser event
    // handler no caller can catch. An application whose render throws must not take the session down,
    // and one unparseable payload must not end a stream that is still delivering frames.
    const client = createRealtimeClient({
      config: createConfig({ credentials: "k" }),
    });
    const probe = defineRealtimeExtension<
      // Record<never, never>, NOT Record<string, never>. The latter says "every string key maps to
      // never", which makes `Options & RealtimeOpenOptions` contradictory and rejects onMedia/onState/
      // onDiagnostic at the call site — an extension with no product inputs of its own would otherwise
      // be unable to receive any kernel option.
      Record<never, never>,
      RealtimeSession
    >({
      id: "test/throwing",
      defaultEndpoint: "test/throwing",
      supports: () => true,
      async open(context) {
        context.media({ id: "s" } as unknown as MediaStream);
        context.data("oops");
        return { close: jest.fn(), reached: true } as never;
      },
    });

    const session = await client.open(probe, {
      onMedia: () => {
        throw new Error("render exploded");
      },
      onData: () => {
        throw new Error("parse exploded");
      },
    });
    // open() resolved at all, which is the assertion: both throws were swallowed at the boundary.
    expect((session as unknown as { reached: boolean }).reached).toBe(true);
    expect(session.state).toBe("live");
  });

  it("omitting the handlers is not an error an extension has to guard", async () => {
    // So an extension can publish unconditionally instead of checking whether anyone is listening —
    // brainrot returns no media at all, and the transform app returns no data.
    const client = createRealtimeClient({
      config: createConfig({ credentials: "k" }),
    });
    const probe = defineRealtimeExtension<
      // Record<never, never>, NOT Record<string, never>. The latter says "every string key maps to
      // never", which makes `Options & RealtimeOpenOptions` contradictory and rejects onMedia/onState/
      // onDiagnostic at the call site — an extension with no product inputs of its own would otherwise
      // be unable to receive any kernel option.
      Record<never, never>,
      RealtimeSession
    >({
      id: "test/silent",
      defaultEndpoint: "test/silent",
      supports: () => true,
      async open(context) {
        context.media({ id: "s" } as unknown as MediaStream);
        context.data("ignored");
        return { close: jest.fn() };
      },
    });
    await expect(client.open(probe, {})).resolves.toBeDefined();
  });

  it("context.fetch does not call the configured fetch as a method", async () => {
    // A RECEIVER-SENSITIVE fetch, because native fetch is one: invoking it as config.fetch(...) sets
    // `this` to the config object and throws "Illegal invocation". The first version of context.fetch
    // did exactly that and every real connect failed, while this suite passed — the other tests inject
    // a plain jest.fn(), which has no opinion about its receiver, so they cannot see the bug.
    const picky = function (this: unknown, _url: string) {
      if (this !== undefined && this !== globalThis) {
        throw new TypeError("Failed to execute 'fetch': Illegal invocation");
      }
      return Promise.resolve(new Response("{}"));
    };
    const client = createRealtimeClient({
      config: createConfig({ credentials: "k", fetch: picky as any }),
    });
    const probe = defineRealtimeExtension<
      Record<string, never>,
      RealtimeSession
    >({
      id: "test/receiver",
      supports: () => true,
      async open(context) {
        await context.fetch("https://wma.fal.run/session");
        return { close: jest.fn() };
      },
    });
    await expect(
      client.open(probe, { endpointId: "test/receiver" } as never),
    ).resolves.toBeDefined();
  });

  it("context.fetch honours the request middleware, so a proxied app stays proxied", async () => {
    let target = "";
    const client = createRealtimeClient({
      config: createConfig({
        credentials: "k",
        requestMiddleware: async (request) => ({
          ...request,
          url: "https://proxy.example/forward",
        }),
        fetch: (async (url: string) => {
          target = url;
          return new Response("{}");
        }) as any,
      }),
    });
    const probe = defineRealtimeExtension<
      Record<string, never>,
      RealtimeSession
    >({
      id: "test/proxy",
      supports: () => true,
      async open(context) {
        await context.fetch("https://wma.fal.run/session");
        return { close: jest.fn() };
      },
    });
    await client.open(probe, { endpointId: "test/proxy" } as never);
    expect(target).toBe("https://proxy.example/forward");
  });

  it("reports a kernel-owned lifecycle the extension cannot contradict", async () => {
    const states: string[] = [];
    const client = createRealtimeClient({
      config: createConfig({ credentials: "k" }),
    });
    const probe = defineRealtimeExtension<
      Record<string, never>,
      RealtimeSession
    >({
      id: "test/state",
      supports: () => true,
      // Claims to be live while the kernel is still opening; the kernel's value wins.
      async open() {
        return { close: jest.fn(), state: "live" as const };
      },
    });
    const session = await client.open(probe, {
      endpointId: "test/state",
      onState: (next: string) => states.push(next),
    } as never);
    expect(session.state).toBe("live");
    await session.close();
    expect(session.state).toBe("closed");
    expect(states).toEqual(["live", "closed"]);
  });

  it("reports failed, not just closed, when opening throws", async () => {
    const states: string[] = [];
    const client = createRealtimeClient({
      config: createConfig({ credentials: "k" }),
    });
    const broken = defineRealtimeExtension<
      Record<string, never>,
      RealtimeSession
    >({
      id: "test/broken",
      supports: () => true,
      async open() {
        throw new Error("negotiation failed");
      },
    });
    await expect(
      client.open(broken, {
        endpointId: "test/broken",
        onState: (next: string) => states.push(next),
      } as never),
    ).rejects.toThrow("negotiation failed");
    // "failed" and nothing after it. Teardown still runs, but reporting it would overwrite the only
    // thing separating a crash from a clean teardown — and "closed" is what a caller would have seen
    // anyway if this reported nothing at all.
    expect(states).toEqual(["failed"]);
  });

  it("context.fail reports failed, not closed, and tears down", async () => {
    // The distinction close() cannot express: a transport that died versus a user who disconnected.
    // Both used to arrive as "closed", which is the pair a status UI most needs to tell apart.
    const states: string[] = [];
    const events: unknown[] = [];
    const cleanup = jest.fn();
    const client = createRealtimeClient({
      config: createConfig({ credentials: "k" }),
    });
    let failFromInside: ((message: string) => Promise<void>) | undefined;
    const probe = defineRealtimeExtension<
      Record<string, never>,
      RealtimeSession
    >({
      id: "test/fail",
      supports: () => true,
      async open(context) {
        context.addCleanup(cleanup);
        failFromInside = (message) => context.fail(message, { relay: 0 });
        return { close: jest.fn() };
      },
    });
    const session = await client.open(probe, {
      endpointId: "test/fail",
      onState: (next: string) => states.push(next),
      onDiagnostic: (event: unknown) => events.push(event),
    } as never);

    await failFromInside!("peer connection died");
    // "failed" LATCHES over the teardown it triggers. It used to be followed immediately by
    // "closed", which made fail() self-defeating: the distinction survived only in the instant
    // between two synchronous calls, so anything rendering from the latest value — a status pill,
    // `session.state` — showed a died session as a clean disconnect.
    expect(states).toEqual(["live", "failed"]);
    expect(events).toEqual([
      {
        kind: "failure",
        message: "peer connection died",
        observed: { relay: 0 },
      },
    ]);
    // Teardown really ran; failing is not a way to leak resources.
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(session.state).toBe("failed");

    // And a close() afterwards cannot launder it into a clean ending.
    await session.close();
    expect(session.state).toBe("failed");
    expect(states).toEqual(["live", "failed"]);
  });

  it("passes diagnostics through, and swallows a throwing callback", async () => {
    const events: unknown[] = [];
    const client = createRealtimeClient({
      config: createConfig({ credentials: "k" }),
    });
    const probe = defineRealtimeExtension<
      Record<string, never>,
      RealtimeSession
    >({
      id: "test/diag",
      supports: () => true,
      async open(context) {
        context.diagnostic({ kind: "progress", phase: "negotiating" });
        context.diagnostic({
          kind: "failure",
          message: "no relay",
          observed: { relay: 0 },
        });
        return { close: jest.fn() };
      },
    });
    const session = await client.open(probe, {
      endpointId: "test/diag",
      onDiagnostic: (event: unknown) => {
        events.push(event);
        throw new Error("a caller's reporting bug must not fail the session");
      },
    } as never);
    expect(events).toEqual([
      { kind: "progress", phase: "negotiating" },
      { kind: "failure", message: "no relay", observed: { relay: 0 } },
    ]);
    await session.close();
  });

  it("an extension may report diagnostics with no onDiagnostic supplied", async () => {
    const client = createRealtimeClient({
      config: createConfig({ credentials: "k" }),
    });
    const probe = defineRealtimeExtension<
      Record<string, never>,
      RealtimeSession
    >({
      id: "test/quiet",
      supports: () => true,
      async open(context) {
        // Must not throw: extensions report unconditionally rather than guarding every call.
        context.diagnostic({ kind: "warning", message: "degraded" });
        return { close: jest.fn() };
      },
    });
    await expect(
      client.open(probe, { endpointId: "test/quiet" } as never),
    ).resolves.toBeDefined();
  });
});
