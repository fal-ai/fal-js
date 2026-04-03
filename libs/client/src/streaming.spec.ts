import { createConfig, type RequiredConfig } from "./config";
import type { StorageClient } from "./storage";
import { createStreamingClient } from "./streaming";

jest.mock("./auth", () => {
  const actual = jest.requireActual("./auth");
  return {
    ...actual,
    getTemporaryAuthToken: jest.fn().mockResolvedValue("mock-token"),
  };
});

jest.mock("./request", () => {
  const actual = jest.requireActual("./request");
  return {
    ...actual,
    dispatchRequest: jest.fn(),
  };
});

import { dispatchRequest } from "./request";

describe("stream extraBody", () => {
  let storage: StorageClient;

  beforeEach(() => {
    (dispatchRequest as jest.Mock).mockReset();
    (dispatchRequest as jest.Mock).mockResolvedValue(undefined);
    storage = {
      upload: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transformInput: async (input: any) => input,
    };
  });

  it("forwards extraBody in server connection mode", async () => {
    const config: RequiredConfig = createConfig({
      credentials: "test-key",
      fetch: jest.fn() as any,
    });
    const client = createStreamingClient({ config, storage });

    const stream = await client.stream("fal-ai/fast-sdxl", {
      input: { prompt: "hello", seed: 1 },
      extraBody: { seed: 2, sync_mode: true },
      connectionMode: "server",
    });

    await Promise.resolve();

    expect(dispatchRequest).toHaveBeenCalledTimes(1);
    const call = (dispatchRequest as jest.Mock).mock.calls[0][0];
    expect(call.input).toEqual({ prompt: "hello", seed: 1 });
    expect(call.extraBody).toEqual({ seed: 2, sync_mode: true });

    stream.abort();
  });

  it("uses the merged body in client connection mode", async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      new Response("", {
        status: 200,
        headers: { "content-type": "text/event-stream" },
      }),
    );
    const config: RequiredConfig = createConfig({
      credentials: "test-key",
      fetch: fetchMock as typeof fetch,
    });
    const client = createStreamingClient({ config, storage });

    const stream = await client.stream("fal-ai/fast-sdxl", {
      input: { prompt: "hello", seed: 1 },
      extraBody: { seed: 2, sync_mode: true },
      connectionMode: "client",
      tokenProvider: async () => "mock-token",
    });

    await stream.done();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1]?.body).toBe(
      JSON.stringify({
        prompt: "hello",
        seed: 1,
        extraBody: { seed: 2, sync_mode: true },
      }),
    );
  });
});
