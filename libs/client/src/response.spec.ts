import {
  ApiError,
  defaultResponseHandler,
  parseBillableUnits,
  resultResponseHandler,
  ValidationError,
} from "./response";

function jsonResponse(
  body: unknown,
  init: {
    status?: number;
    headers?: Record<string, string>;
  } = {},
): Response {
  const { status = 200, headers = {} } = init;
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

describe("parseBillableUnits", () => {
  it("returns undefined when the header is missing", () => {
    expect(parseBillableUnits(new Headers())).toBeUndefined();
  });

  it("returns undefined when the header is empty", () => {
    expect(
      parseBillableUnits(new Headers({ "x-fal-billable-units": "" })),
    ).toBeUndefined();
  });

  it("parses integer units", () => {
    expect(
      parseBillableUnits(new Headers({ "x-fal-billable-units": "42" })),
    ).toBe(42);
  });

  it("parses zero", () => {
    expect(
      parseBillableUnits(new Headers({ "x-fal-billable-units": "0" })),
    ).toBe(0);
  });

  it("parses fractional units", () => {
    expect(
      parseBillableUnits(new Headers({ "x-fal-billable-units": "3.14159265" })),
    ).toBe(3.14159265);
  });

  it("throws on non-numeric values", () => {
    expect(() =>
      parseBillableUnits(
        new Headers({ "x-fal-billable-units": "not-a-number" }),
      ),
    ).toThrow("Invalid x-fal-billable-units header: not-a-number");
  });
});

describe("resultResponseHandler", () => {
  it("surfaces requestId and billableUnits from response headers", async () => {
    const response = jsonResponse(
      { image: "https://example.com/image.png" },
      {
        headers: {
          "x-fal-request-id": "req_abc",
          "x-fal-billable-units": "1.5",
        },
      },
    );

    const result = await resultResponseHandler<{ image: string }>(response);

    expect(result).toEqual({
      data: { image: "https://example.com/image.png" },
      requestId: "req_abc",
      billableUnits: 1.5,
    });
  });

  it("omits billableUnits when the header is absent", async () => {
    const response = jsonResponse(
      { ok: true },
      { headers: { "x-fal-request-id": "req_no_units" } },
    );

    const result = await resultResponseHandler<{ ok: boolean }>(response);

    expect(result).toEqual({
      data: { ok: true },
      requestId: "req_no_units",
      billableUnits: undefined,
    });
  });
});

describe("defaultResponseHandler errors", () => {
  it("attaches requestId and billableUnits to ApiError", async () => {
    const error = await defaultResponseHandler(
      jsonResponse(
        { message: "Server error" },
        {
          status: 500,
          headers: {
            "x-fal-request-id": "req_err",
            "x-fal-billable-units": "0",
          },
        },
      ),
    ).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 500,
      requestId: "req_err",
      billableUnits: 0,
    });
  });

  it("attaches billableUnits to ValidationError", async () => {
    const error = await defaultResponseHandler(
      jsonResponse(
        { message: "Unprocessable", detail: [] },
        {
          status: 422,
          headers: {
            "x-fal-request-id": "req_422",
            "x-fal-billable-units": "0",
          },
        },
      ),
    ).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ValidationError);
    expect(error).toMatchObject({
      status: 422,
      requestId: "req_422",
      billableUnits: 0,
    });
  });
});
