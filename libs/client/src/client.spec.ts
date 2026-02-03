import { buildUrl } from "./request";

describe("The function test suite", () => {
  it("should build the URL with a function username/app-alias", () => {
    const alias = "fal-ai/text-to-image";
    const url = buildUrl(alias);
    expect(url).toMatch(`fal.run/${alias}`);
  });
});

jest.mock("./request", () => {
  const actual = jest.requireActual("./request");
  return {
    ...actual,
    dispatchRequest: jest.fn(),
  };
});

import { createFalClient } from "./client";
import { dispatchRequest } from "./request";

describe("client.run headers", () => {
  beforeEach(() => {
    (dispatchRequest as jest.Mock).mockReset();
    (dispatchRequest as jest.Mock).mockResolvedValue({
      data: { image: "https://example.com/image.png" },
      requestId: "req_123",
    });
  });

  it("includes startTimeout header when provided", async () => {
    const client = createFalClient({ credentials: "test-key" });
    await client.run("fal-ai/fast-sdxl", {
      input: { prompt: "hello" },
      startTimeout: 30,
    });

    expect(dispatchRequest).toHaveBeenCalledTimes(1);
    const call = (dispatchRequest as jest.Mock).mock.calls[0][0];
    expect(call.headers["x-fal-request-timeout"]).toBe("30");
  });

  it("omits startTimeout header when not provided", async () => {
    const client = createFalClient({ credentials: "test-key" });
    await client.run("fal-ai/fast-sdxl", {
      input: { prompt: "hello" },
    });

    expect(dispatchRequest).toHaveBeenCalledTimes(1);
    const call = (dispatchRequest as jest.Mock).mock.calls[0][0];
    expect(call.headers["x-fal-request-timeout"]).toBeUndefined();
  });

  it("throws error when startTimeout is <= 1 second", async () => {
    const client = createFalClient({ credentials: "test-key" });
    await expect(
      client.run("fal-ai/fast-sdxl", {
        input: { prompt: "hello" },
        startTimeout: 1,
      }),
    ).rejects.toThrow("Timeout must be greater than 1 seconds");

    await expect(
      client.run("fal-ai/fast-sdxl", {
        input: { prompt: "hello" },
        startTimeout: 0,
      }),
    ).rejects.toThrow("Timeout must be greater than 1 seconds");
  });
});
