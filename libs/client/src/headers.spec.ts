import {
  buildTagsHeaders,
  buildTimeoutHeaders,
  MAX_TAG_PAIRS,
  MAX_TAG_VALUE_LENGTH,
  MAX_TAGS_SIZE_BYTES,
  MIN_REQUEST_TIMEOUT_SECONDS,
  REQUEST_TIMEOUT_HEADER,
  TAGS_HEADER,
  validateTagsHeader,
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

  describe("validateTagsHeader", () => {
    it("should pack the pairs into a single header value", () => {
      expect(validateTagsHeader({ team: "design", env: "prod" })).toBe(
        "team=design,env=prod",
      );
    });

    it("should lowercase keys and keep the last value for duplicates", () => {
      expect(validateTagsHeader({ Team: "design", TEAM: "growth" })).toBe(
        "team=growth",
      );
    });

    it("should trim keys and values, matching what the server stores", () => {
      expect(validateTagsHeader({ "  Team  ": "  design  " })).toBe(
        "team=design",
      );
    });

    it("should apply length limits to the trimmed value", () => {
      const padded = ` ${"d".repeat(MAX_TAG_VALUE_LENGTH)} `;
      expect(validateTagsHeader({ team: padded })).toBe(
        `team=${"d".repeat(MAX_TAG_VALUE_LENGTH)}`,
      );
    });

    it("should throw for keys outside the allowed charset", () => {
      expect(() => validateTagsHeader({ "team name": "design" })).toThrow(
        'Tag key "team name" must match',
      );
    });

    it("should throw for reserved keys", () => {
      expect(() => validateTagsHeader({ "fal.internal": "1" })).toThrow(
        "reserved",
      );
    });

    it("should throw for values with commas or control characters", () => {
      expect(() => validateTagsHeader({ team: "design,growth" })).toThrow(
        'Tag value for "team" must be printable ASCII without commas',
      );
      expect(() => validateTagsHeader({ team: "des\nign" })).toThrow(
        'Tag value for "team" must be printable ASCII without commas',
      );
    });

    it("should throw for values over the length limit", () => {
      expect(() =>
        validateTagsHeader({ team: "d".repeat(MAX_TAG_VALUE_LENGTH + 1) }),
      ).toThrow(`at most ${MAX_TAG_VALUE_LENGTH} characters`);
    });

    it("should throw for more than the maximum number of pairs", () => {
      const tags = Object.fromEntries(
        Array.from({ length: MAX_TAG_PAIRS + 1 }, (_, i) => [`k${i}`, "v"]),
      );
      expect(() => validateTagsHeader(tags)).toThrow(
        `at most ${MAX_TAG_PAIRS} pairs`,
      );
    });

    it("should throw when the total size exceeds the limit", () => {
      const tags = Object.fromEntries(
        Array.from({ length: MAX_TAG_PAIRS }, (_, i) => [
          `k${i}`,
          "v".repeat(MAX_TAG_VALUE_LENGTH),
        ]),
      );
      expect(() => validateTagsHeader(tags)).toThrow(
        `at most ${MAX_TAGS_SIZE_BYTES} bytes`,
      );
    });
  });

  describe("buildTagsHeaders", () => {
    it("should return empty object when tags are undefined or empty", () => {
      expect(buildTagsHeaders(undefined)).toEqual({});
      expect(buildTagsHeaders({})).toEqual({});
    });

    it("should return the packed tags header", () => {
      expect(buildTagsHeaders({ team: "design", env: "prod" })).toEqual({
        [TAGS_HEADER]: "team=design,env=prod",
      });
    });

    it("should throw for invalid tags", () => {
      expect(() => buildTagsHeaders({ team: "design,growth" })).toThrow(
        "printable ASCII",
      );
    });
  });
});
