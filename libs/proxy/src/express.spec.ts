import type { Response as ExpressResponse, Request } from "express";
import { createHandler } from "./express";

function exchange(headers: Record<string, string>) {
  const chunks: string[] = [];
  const response = {
    statusCode: 200,
    headersSent: false,
    headers: {} as Record<string, string>,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    setHeader(name: string, value: string) {
      this.headers[name] = value;
    },
    json(data: unknown) {
      this.body = data;
      return this;
    },
    send(data: unknown) {
      this.body = data;
      return this;
    },
    write(chunk: Uint8Array) {
      chunks.push(Buffer.from(chunk).toString());
    },
    end() {
      this.body = chunks.join("");
    },
  };
  const request = { method: "POST", headers, body: { prompt: "hi" } };
  return {
    request: request as unknown as Request,
    response,
    next: jest.fn(),
  };
}

describe("express proxy handler", () => {
  let fetchSpy: jest.SpyInstance;
  let handler: ReturnType<typeof createHandler>;

  beforeEach(() => {
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    fetchSpy = jest.spyOn(globalThis, "fetch");
    handler = createHandler({ resolveFalAuth: async () => "Key secret" });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const call = async (headers: Record<string, string>) => {
    const { request, response, next } = exchange(headers);
    await handler(request, response as unknown as ExpressResponse, next);
    return { response, next };
  };

  it("answers a malformed target URL with 400 instead of rejecting", async () => {
    const { response, next } = await call({ "x-fal-target-url": "not a url" });
    expect(response.statusCode).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });

  it("hands upstream failures to the error middleware", async () => {
    const failure = new TypeError("fetch failed");
    fetchSpy.mockRejectedValue(failure);
    const { next } = await call({
      "x-fal-target-url":
        "https://rest.fal.ai/storage/upload/initiate?storage_type=fal-cdn-v3",
    });
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(failure);
  });

  it("keeps the upstream status and body", async () => {
    fetchSpy.mockResolvedValue(
      new Response('{"detail":"forbidden"}', {
        status: 403,
        headers: { "content-type": "application/json" },
      }),
    );
    const { response } = await call({
      "x-fal-target-url": "https://fal.run/fal-ai/flux",
    });
    expect(response.statusCode).toBe(403);
    expect(response.body).toBe('{"detail":"forbidden"}');
    expect(response.headers["content-type"]).toBe("application/json");
  });
});
