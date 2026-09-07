jest.mock("./request", () => {
  const actual = jest.requireActual("./request");
  return {
    ...actual,
    dispatchRequest: jest.fn(),
  };
});

import { createFalClient } from "./client";
import { dispatchRequest } from "./request";

describe("stream headers", () => {
  beforeEach(() => {
    (dispatchRequest as jest.Mock).mockReset();
    (dispatchRequest as jest.Mock).mockResolvedValue(undefined);
  });

  it("includes the packed tags header when tags are provided", async () => {
    const client = createFalClient({ credentials: "test-key" });
    await client.stream("fal-ai/fast-sdxl", {
      input: { prompt: "hello" },
      tags: { team: "design", env: "prod" },
    });

    expect(dispatchRequest).toHaveBeenCalledTimes(1);
    const call = (dispatchRequest as jest.Mock).mock.calls[0][0];
    expect(call.options.headers["x-fal-tags"]).toBe("team=design,env=prod");
  });

  it("omits the tags header when tags are not provided", async () => {
    const client = createFalClient({ credentials: "test-key" });
    await client.stream("fal-ai/fast-sdxl", {
      input: { prompt: "hello" },
    });

    expect(dispatchRequest).toHaveBeenCalledTimes(1);
    const call = (dispatchRequest as jest.Mock).mock.calls[0][0];
    expect(call.options.headers["x-fal-tags"]).toBeUndefined();
  });
});
