import { createConfig } from "./config";
import { createRealtimeClient } from "./realtime";
import {
  defineRealtimeExtension,
  type RealtimeExtensionContext,
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

  it("evaluates class session getters against the original instance", async () => {
    class PrivateSession implements RealtimeSession {
      #label = "private";

      get label() {
        return this.#label;
      }

      set label(value: string) {
        this.#label = value;
      }

      send() {
        return this.#label;
      }

      close() {
        // Managed teardown wraps this method.
      }
    }
    const classExtension = defineRealtimeExtension<
      Record<never, never>,
      PrivateSession
    >({
      id: "test/class-session",
      defaultEndpoint: "test/class-session",
      async open() {
        return new PrivateSession();
      },
    });
    const client = createRealtimeClient({
      config: createConfig({ credentials: "test-key" }),
    });

    const session = await client.open(classExtension, {});

    expect(session.label).toBe("private");
    session.label = "updated";
    expect(session.label).toBe("updated");
    expect(session.send).toBe(session.send);
    expect(session.send()).toBe("updated");
  });

  it("manages frozen extension sessions without violating proxy invariants", async () => {
    const extensionClose = jest.fn();
    const frozen = Object.freeze({
      close: extensionClose,
      state: "closed" as const,
      value: 42,
    });
    const frozenExtension = defineRealtimeExtension<
      Record<never, never>,
      typeof frozen
    >({
      id: "test/frozen-session",
      defaultEndpoint: "test/frozen-session",
      async open() {
        return frozen;
      },
    });
    const client = createRealtimeClient({
      config: createConfig({ credentials: "test-key" }),
    });

    const session = await client.open(frozenExtension, {});

    expect(session.value).toBe(42);
    expect(session.state).toBe("live");
    expect(Object.keys(session)).toEqual(["close", "state", "value"]);
    await session.close();
    expect(extensionClose).toHaveBeenCalledTimes(1);
  });

  it("survives a caller freezing, sealing, or preventing extensions on the session", async () => {
    // Object.freeze/seal/preventExtensions make the proxy target non-extensible, and from then on
    // the language requires ownKeys to report exactly the target's own keys. Without mirroring,
    // any of the three throws a TypeError and enumeration is broken afterwards.
    const sessionFor = async (label: string) => {
      const client = createRealtimeClient({
        config: createConfig({ credentials: "test-key" }),
      });
      return client.open(extension(), { label });
    };

    const prevented = await sessionFor("prevented");
    expect(() => Object.preventExtensions(prevented)).not.toThrow();
    expect(Object.keys(prevented).sort()).toEqual(["close", "label"]);
    expect(prevented.label).toBe("prevented");
    expect(Object.isExtensible(prevented)).toBe(false);

    const sealed = await sessionFor("sealed");
    expect(() => Object.seal(sealed)).not.toThrow();
    expect(Object.isSealed(sealed)).toBe(true);
    expect(sealed.state).toBe("live");
    await sealed.close();
    // Sealed but still writable: state keeps reporting the live lifecycle.
    expect(sealed.state).toBe("closed");

    const frozen = await sessionFor("frozen");
    expect(() => Object.freeze(frozen)).not.toThrow();
    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.keys(frozen).sort()).toEqual(["close", "label"]);
    expect(frozen.label).toBe("frozen");
    // close() is the kernel's idempotent teardown even after freezing.
    await frozen.close();
  });

  it("pins a frozen own state property at its frozen value", async () => {
    // An extension session that owns a `state` key mirrors it onto the target when the caller
    // freezes; a non-configurable, non-writable data property must then report that exact value.
    const stateful = defineRealtimeExtension<
      Record<never, never>,
      RealtimeSession & { note: string }
    >({
      id: "test/stateful",
      defaultEndpoint: "test/stateful",
      async open() {
        return { state: "opening", note: "kept", close: jest.fn() };
      },
    });
    const client = createRealtimeClient({
      config: createConfig({ credentials: "test-key" }),
    });
    const session = await client.open(stateful, {});

    Object.freeze(session);
    expect(session.state).toBe("live");
    await session.close();
    expect(session.state).toBe("live");
    expect(session.note).toBe("kept");
  });

  it("forwards property deletion and definition to the extension session", async () => {
    const raw: RealtimeSession & Record<string, unknown> = {
      close: jest.fn(),
      removable: "old",
    };
    const mutableExtension = defineRealtimeExtension<
      Record<never, never>,
      typeof raw
    >({
      id: "test/mutable-session",
      defaultEndpoint: "test/mutable-session",
      async open() {
        return raw;
      },
    });
    const client = createRealtimeClient({
      config: createConfig({ credentials: "test-key" }),
    });
    const session = await client.open(mutableExtension, {});

    expect(delete session.removable).toBe(true);
    expect("removable" in raw).toBe(false);
    Object.defineProperty(session, "fixed", {
      configurable: false,
      enumerable: true,
      value: 42,
      writable: false,
    });

    expect(raw.fixed).toBe(42);
    expect(session.fixed).toBe(42);
    expect(Object.keys(session)).toContain("fixed");
    expect(
      Object.getOwnPropertyDescriptor(session, "fixed")?.configurable,
    ).toBe(false);
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
    let finishLateCleanup!: () => void;
    const lateCleanupDone = new Promise<void>((resolve) => {
      finishLateCleanup = resolve;
    });
    const lateCleanup = jest.fn(() => lateCleanupDone);
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
          context.addCleanup(lateCleanup);
          closeFromAbort = context.close();
        });
        return { close: extensionClose };
      },
    });
    const session = await client.open(reentrant, {});

    const closeFromCaller = session.close();

    expect(closeFromAbort).toBe(closeFromCaller);
    let closeFinished = false;
    void closeFromCaller.then(() => {
      closeFinished = true;
    });
    await Promise.resolve();
    await Promise.resolve();
    expect(lateCleanup).toHaveBeenCalledTimes(1);
    expect(closeFinished).toBe(false);

    finishLateCleanup();
    await closeFromCaller;
    expect(extensionClose).toHaveBeenCalledTimes(1);
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(closeFinished).toBe(true);
  });

  it("does not await teardown through an extension close hook", async () => {
    const cleanup = jest.fn();
    const client = createRealtimeClient({
      config: createConfig({ credentials: "test-key" }),
    });
    const reentrant = defineRealtimeExtension<
      Record<never, never>,
      RealtimeSession
    >({
      id: "test/close-delegation",
      defaultEndpoint: "test/close-delegation",
      async open(context) {
        context.addCleanup(cleanup);
        return { close: () => context.close() };
      },
    });
    const session = await client.open(reentrant, {});

    await session.close();

    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("routes internal class close calls through managed teardown", async () => {
    class SelfClosingSession implements RealtimeSession {
      close = jest.fn();

      stop() {
        return this.close();
      }
    }
    const cleanup = jest.fn();
    const client = createRealtimeClient({
      config: createConfig({ credentials: "test-key" }),
    });
    const selfClosing = defineRealtimeExtension<
      Record<never, never>,
      SelfClosingSession
    >({
      id: "test/self-closing",
      defaultEndpoint: "test/self-closing",
      async open(context) {
        context.addCleanup(cleanup);
        return new SelfClosingSession();
      },
    });
    const session = await client.open(selfClosing, {});

    await session.stop();

    expect(session.state).toBe("closed");
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("preserves private-field receivers for frozen sessions", async () => {
    class FrozenPrivateSession implements RealtimeSession {
      #label = "frozen-private";

      get label() {
        return this.#label;
      }

      readLabel() {
        return this.#label;
      }

      close() {
        // Managed teardown wraps this method.
      }
    }
    const frozen = Object.freeze(
      new FrozenPrivateSession(),
    ) as FrozenPrivateSession;
    const client = createRealtimeClient({
      config: createConfig({ credentials: "test-key" }),
    });
    const frozenExtension = defineRealtimeExtension<
      Record<never, never>,
      FrozenPrivateSession
    >({
      id: "test/frozen-private",
      defaultEndpoint: "test/frozen-private",
      async open() {
        return frozen;
      },
    });
    const session = await client.open(frozenExtension, {});

    expect(session.label).toBe("frozen-private");
    expect(session.readLabel()).toBe("frozen-private");
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
          headers: { "Content-Type": "application/json" },
        });
        expect(response.status).toBe(200);
        return { close: jest.fn() };
      },
    });

    await client.open(probe, {});
    expect(seen).toHaveLength(1);
    expect(seen[0].url).toBe("https://wma.fal.run/session");
    const headers = new Headers(seen[0].init.headers);
    expect(headers.get("authorization")).toBe("Key secret-key");
    expect(headers.get("content-type")).toBe("application/json");
    // Defaults to POST, and the abort signal is wired without the extension asking.
    expect(seen[0].init.method).toBe("POST");
    expect(seen[0].init.signal).toBeDefined();
  });

  it("context.fetch aborts a request-local-signal fetch when the session aborts", async () => {
    // A request-local signal (say, an extension's own fetch timeout) must not displace the managed
    // session signal — aborting open() has to cancel the in-flight request, or open() stays stuck
    // awaiting extension.open() despite the abortSignal contract.
    let fetchStarted!: () => void;
    const started = new Promise<void>((resolve) => {
      fetchStarted = resolve;
    });
    const client = createRealtimeClient({
      config: createConfig({
        credentials: "secret-key",
        fetch: ((_url: string, init: RequestInit = {}) => {
          fetchStarted();
          return new Promise<Response>((_resolve, reject) => {
            init.signal?.addEventListener("abort", () =>
              reject(
                init.signal?.reason ??
                  new DOMException("aborted", "AbortError"),
              ),
            );
          });
        }) as any,
      }),
    });
    const requestLocal = new AbortController();
    const probe = defineRealtimeExtension<
      Record<never, never>,
      RealtimeSession
    >({
      id: "test/fetch-session-abort",
      defaultEndpoint: "test/fetch-session-abort",
      async open(context) {
        await context.fetch("https://wma.fal.run/session", {
          signal: requestLocal.signal,
        });
        return { close: jest.fn() };
      },
    });

    const controller = new AbortController();
    const opening = client.open(probe, { abortSignal: controller.signal });
    const settled = opening.catch((error) => error);
    await started;
    const reason = new Error("session aborted");
    controller.abort(reason);

    expect(await settled).toBe(reason);
    expect(requestLocal.signal.aborted).toBe(false);
  });

  it("keeps a request-local fetch signal combined while the body is consumed", async () => {
    // fetch() resolves at headers, but its signal also cancels later body reads. Detaching the
    // combined signal at resolution would leave a stalled body unaffected by session teardown.
    let observed: AbortSignal | null | undefined;
    const client = createRealtimeClient({
      config: createConfig({
        credentials: "secret-key",
        fetch: (async (_url: string, init: RequestInit = {}) => {
          observed = init.signal;
          return new Response("{}");
        }) as any,
      }),
    });
    const requestLocal = new AbortController();
    const probe = defineRealtimeExtension<
      Record<never, never>,
      RealtimeSession
    >({
      id: "test/fetch-body-abort",
      defaultEndpoint: "test/fetch-body-abort",
      async open(context) {
        await context.fetch("https://wma.fal.run/session", {
          signal: requestLocal.signal,
        });
        return { close: jest.fn() };
      },
    });

    const controller = new AbortController();
    const session = await client.open(probe, {
      abortSignal: controller.signal,
    });
    expect(observed?.aborted).toBe(false);

    controller.abort(new Error("late abort"));
    expect(observed?.aborted).toBe(true);
    await session.close();
  });

  it("does not accumulate session-signal listeners across repeated fetches", async () => {
    // A heartbeat-style extension completes a request every few seconds with a fresh
    // request-local signal that never aborts. The session signal must carry one shared hook for
    // all of them, and consuming the body must release each combination.
    let sessionSignal: AbortSignal | undefined;
    const client = createRealtimeClient({
      config: createConfig({
        credentials: "secret-key",
        fetch: (async () => new Response('{"alive":true}')) as any,
      }),
    });
    const listenersPerBeat: number[] = [];
    const probe = defineRealtimeExtension<
      Record<never, never>,
      RealtimeSession
    >({
      id: "test/heartbeats",
      defaultEndpoint: "test/heartbeats",
      async open(context) {
        sessionSignal = context.signal;
        const added = jest.spyOn(context.signal, "addEventListener");
        for (let beat = 0; beat < 4; beat += 1) {
          const local = new AbortController();
          const response = await context.fetch(
            "https://wma.fal.run/session/heartbeat",
            { signal: local.signal },
          );
          await response.json();
          listenersPerBeat.push(added.mock.calls.length);
        }
        added.mockRestore();
        return { close: jest.fn() };
      },
    });

    const session = await client.open(probe, {});
    // The first request may install the one shared session hook; later requests add nothing.
    expect(listenersPerBeat[3]).toBe(listenersPerBeat[0]);
    await session.close();
    expect(sessionSignal?.aborted).toBe(true);
  });

  it("awaits late cleanups registered by other late cleanups", async () => {
    // A late cleanup that registers another one mid-flight must still be covered by the awaited
    // close(); a single snapshot of the registrations would resolve before the nested one runs.
    let captured!: RealtimeExtensionContext;
    const probe = defineRealtimeExtension<
      Record<never, never>,
      RealtimeSession
    >({
      id: "test/late-cleanups",
      defaultEndpoint: "test/late-cleanups",
      async open(context) {
        captured = context;
        return { close: jest.fn() };
      },
    });
    const client = createRealtimeClient({
      config: createConfig({ credentials: "test-key" }),
    });
    const session = await client.open(probe, {});

    const order: string[] = [];
    const closing = session.close();
    captured.addCleanup(async () => {
      order.push("outer-start");
      await new Promise((resolve) => setTimeout(resolve, 5));
      captured.addCleanup(async () => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        order.push("inner");
      });
      order.push("outer-end");
    });
    await closing;

    expect(order).toEqual(["outer-start", "outer-end", "inner"]);
  });

  it("context.fetch lets FormData generate its multipart boundary", async () => {
    const seen: RequestInit[] = [];
    const client = createRealtimeClient({
      config: createConfig({
        credentials: "secret-key",
        fetch: async (_url, init = {}) => {
          seen.push(init);
          return new Response("{}");
        },
      }),
    });
    const probe = defineRealtimeExtension<
      Record<never, never>,
      RealtimeSession
    >({
      id: "test/form-data",
      defaultEndpoint: "test/form-data",
      async open(context) {
        const body = new FormData();
        body.set("field", "payload");
        await context.fetch("https://wma.fal.run/upload", { body });
        return { close: jest.fn() };
      },
    });

    await client.open(probe, {});

    expect(seen[0].body).toBeInstanceOf(FormData);
    expect(new Headers(seen[0].headers).has("content-type")).toBe(false);
  });

  it("context.gatherIce honors extension-local cancellation", async () => {
    const listeners: Record<string, EventListener[]> = {};
    const pc = {
      iceGatheringState: "gathering" as RTCIceGatheringState,
      addEventListener(type: string, listener: EventListener) {
        (listeners[type] ??= []).push(listener);
      },
      removeEventListener(type: string, listener: EventListener) {
        listeners[type] = (listeners[type] ?? []).filter(
          (candidate) => candidate !== listener,
        );
      },
    };
    const iceController = new AbortController();
    const reason = new Error("extension stopped gathering");
    let gatheringStarted!: () => void;
    const started = new Promise<void>((resolve) => {
      gatheringStarted = resolve;
    });
    const probe = defineRealtimeExtension<
      Record<never, never>,
      RealtimeSession
    >({
      id: "test/local-ice-cancel",
      defaultEndpoint: "test/local-ice-cancel",
      async open(context) {
        const gathering = context.gatherIce(pc as RTCPeerConnection, {
          signal: iceController.signal,
          timeoutMs: 10_000,
        });
        gatheringStarted();
        await gathering;
        return { close: jest.fn() };
      },
    });
    const client = createRealtimeClient({
      config: createConfig({ credentials: "test-key" }),
    });

    const opening = client.open(probe, {});
    await started;
    iceController.abort(reason);

    await expect(opening).rejects.toBe(reason);
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
