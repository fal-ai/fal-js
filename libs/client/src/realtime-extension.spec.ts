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
