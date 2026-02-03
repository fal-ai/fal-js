import {
  buildTimeoutHeaders,
  MIN_REQUEST_TIMEOUT_SECONDS,
  REQUEST_TIMEOUT_HEADER,
  validateTimeoutHeader,
} from "./headers";

describe("headers utilities", () => {
  describe("validateTimeoutHeader", () => {
    it("should return string value for valid timeout", () => {
      expect(validateTimeoutHeader(5)).toBe("5");
      expect(validateTimeoutHeader(30)).toBe("30");
      expect(validateTimeoutHeader(2.5)).toBe("2.5");
    });

    it("should throw for timeout <= MIN_REQUEST_TIMEOUT_SECONDS", () => {
      expect(() => validateTimeoutHeader(MIN_REQUEST_TIMEOUT_SECONDS)).toThrow(
        `Timeout must be greater than ${MIN_REQUEST_TIMEOUT_SECONDS} seconds`,
      );
      expect(() => validateTimeoutHeader(0)).toThrow(
        `Timeout must be greater than ${MIN_REQUEST_TIMEOUT_SECONDS} seconds`,
      );
      expect(() => validateTimeoutHeader(-1)).toThrow(
        `Timeout must be greater than ${MIN_REQUEST_TIMEOUT_SECONDS} seconds`,
      );
    });

    it("should throw for NaN timeout", () => {
      expect(() => validateTimeoutHeader(NaN)).toThrow(
        "Timeout must be a number",
      );
    });

    it("should throw for non-number timeout", () => {
      expect(() => validateTimeoutHeader("5" as unknown as number)).toThrow(
        "Timeout must be a number",
      );
      expect(() => validateTimeoutHeader(null as unknown as number)).toThrow(
        "Timeout must be a number",
      );
    });
  });

  describe("buildTimeoutHeaders", () => {
    it("should return empty object when timeout is undefined", () => {
      expect(buildTimeoutHeaders(undefined)).toEqual({});
    });

    it("should return headers object with timeout header for valid timeout", () => {
      expect(buildTimeoutHeaders(5)).toEqual({
        [REQUEST_TIMEOUT_HEADER]: "5",
      });
      expect(buildTimeoutHeaders(30)).toEqual({
        [REQUEST_TIMEOUT_HEADER]: "30",
      });
    });

    it("should throw for invalid timeout values", () => {
      expect(() => buildTimeoutHeaders(1)).toThrow(
        `Timeout must be greater than ${MIN_REQUEST_TIMEOUT_SECONDS} seconds`,
      );
      expect(() => buildTimeoutHeaders(0)).toThrow(
        `Timeout must be greater than ${MIN_REQUEST_TIMEOUT_SECONDS} seconds`,
      );
    });
  });
});
