import { ApiError } from "./response";
import {
  calculateBackoffDelay,
  DEFAULT_RETRY_OPTIONS,
  DEFAULT_RETRYABLE_STATUS_CODES,
  executeWithRetry,
  isRetryableError,
  type RetryOptions,
} from "./retry";

const BAD_GATEWAY_ERROR = new ApiError({ message: "Bad gateway", status: 502 });

describe("Retry functionality", () => {
  describe("isRetryableError", () => {
    it("should return true for retryable status codes", () => {
      const error = new ApiError({ message: "Server error", status: 504 });
      expect(isRetryableError(error, DEFAULT_RETRYABLE_STATUS_CODES)).toBe(
        true,
      );
    });

    it("should return false for non-retryable status codes", () => {
      const error = new ApiError({ message: "Bad request", status: 400 });
      expect(isRetryableError(error, DEFAULT_RETRYABLE_STATUS_CODES)).toBe(
        false,
      );
    });

    it("should return false for non-ApiError errors", () => {
      const error = new Error("Network error");
      expect(isRetryableError(error, DEFAULT_RETRYABLE_STATUS_CODES)).toBe(
        false,
      );
    });

    it("should return false for user-specified timeout (504 with timeoutType: user)", () => {
      const error = new ApiError({
        message: "Request timed out",
        status: 504,
        timeoutType: "user",
      });
      expect(isRetryableError(error, DEFAULT_RETRYABLE_STATUS_CODES)).toBe(
        false,
      );
    });

    it("should return true for infrastructure timeout (504 without timeoutType)", () => {
      const error = new ApiError({
        message: "Gateway timeout",
        status: 504,
      });
      expect(isRetryableError(error, DEFAULT_RETRYABLE_STATUS_CODES)).toBe(
        true,
      );
    });

    it("should return true for 504 with non-user timeoutType", () => {
      const error = new ApiError({
        message: "Gateway timeout",
        status: 504,
        timeoutType: "infrastructure",
      });
      expect(isRetryableError(error, DEFAULT_RETRYABLE_STATUS_CODES)).toBe(
        true,
      );
    });
  });

  describe("calculateBackoffDelay", () => {
    it("should calculate exponential backoff correctly", () => {
      const delay1 = calculateBackoffDelay(0, 1000, 30000, 2, false);
      const delay2 = calculateBackoffDelay(1, 1000, 30000, 2, false);
      const delay3 = calculateBackoffDelay(2, 1000, 30000, 2, false);

      expect(delay1).toBe(1000);
      expect(delay2).toBe(2000);
      expect(delay3).toBe(4000);
    });

    it("should respect max delay", () => {
      const delay = calculateBackoffDelay(10, 1000, 5000, 2, false);
      expect(delay).toBe(5000);
    });

    it("should add jitter when enabled", () => {
      const delay1 = calculateBackoffDelay(1, 1000, 30000, 2, true);
      const delay2 = calculateBackoffDelay(1, 1000, 30000, 2, true);

      // With jitter, delays should be different (with high probability)
      // and within the expected range
      expect(delay1).toBeGreaterThan(1500); // base 2000 - 25%
      expect(delay1).toBeLessThan(2500); // base 2000 + 25%
      expect(delay2).toBeGreaterThan(1500);
      expect(delay2).toBeLessThan(2500);
    });
  });

  describe("executeWithRetry", () => {
    it("should return result on first success", async () => {
      const operation = jest.fn().mockResolvedValue("success");
      const options: RetryOptions = { ...DEFAULT_RETRY_OPTIONS, maxRetries: 3 };

      const { result, metrics } = await executeWithRetry(operation, options);

      expect(result).toBe("success");
      expect(metrics.totalAttempts).toBe(1);
      expect(metrics.totalDelay).toBe(0);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it("should retry on retryable errors", async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(BAD_GATEWAY_ERROR)
        .mockRejectedValueOnce(BAD_GATEWAY_ERROR)
        .mockResolvedValue("success");

      const options: RetryOptions = {
        ...DEFAULT_RETRY_OPTIONS,
        maxRetries: 3,
        baseDelay: 10, // Short delay for testing
        enableJitter: false,
      };

      const { result, metrics } = await executeWithRetry(operation, options);

      expect(result).toBe("success");
      expect(metrics.totalAttempts).toBe(3);
      expect(metrics.totalDelay).toBe(30); // 10 + 20 = 30ms total delay
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it("should not retry on non-retryable errors", async () => {
      const error = new ApiError({ message: "Bad request", status: 400 });
      const operation = jest.fn().mockRejectedValue(error);

      const options: RetryOptions = { ...DEFAULT_RETRY_OPTIONS, maxRetries: 3 };

      await expect(executeWithRetry(operation, options)).rejects.toThrow(error);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it("should exhaust retries and throw last error", async () => {
      const operation = jest.fn().mockRejectedValue(BAD_GATEWAY_ERROR);

      const options: RetryOptions = {
        ...DEFAULT_RETRY_OPTIONS,
        maxRetries: 2,
        baseDelay: 10,
        enableJitter: false,
      };

      await expect(executeWithRetry(operation, options)).rejects.toThrow(
        BAD_GATEWAY_ERROR,
      );
      expect(operation).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
    });

    it("should call onRetry callback", async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(BAD_GATEWAY_ERROR)
        .mockResolvedValue("success");

      const onRetry = jest.fn();
      const options: RetryOptions = {
        ...DEFAULT_RETRY_OPTIONS,
        maxRetries: 3,
        baseDelay: 10,
        enableJitter: false,
      };

      await executeWithRetry(operation, options, onRetry);

      expect(onRetry).toHaveBeenCalledWith(1, BAD_GATEWAY_ERROR, 10);
    });

    it("should not retry on user-specified timeout", async () => {
      const userTimeoutError = new ApiError({
        message: "Request timed out",
        status: 504,
        timeoutType: "user",
      });
      const operation = jest.fn().mockRejectedValue(userTimeoutError);

      const options: RetryOptions = {
        ...DEFAULT_RETRY_OPTIONS,
        maxRetries: 3,
        baseDelay: 10,
        enableJitter: false,
      };

      await expect(executeWithRetry(operation, options)).rejects.toThrow(
        userTimeoutError,
      );
      // Should NOT retry - only 1 attempt
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });
});
