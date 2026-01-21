import { isAllowedUrl } from "./index";

const FAL_REST_API_URL = "https://rest.alpha.fal.ai";

describe("isAllowedUrl", () => {
  describe("fal.run URLs", () => {
    it("should allow fal.run with a path", () => {
      expect(isAllowedUrl("fal.run/some/path")).toBe(true);
    });

    it("should allow fal.run with minimal path", () => {
      expect(isAllowedUrl("fal.run/")).toBe(true);
    });

    it("should allow fal.run with complex paths", () => {
      expect(isAllowedUrl("fal.run/v1/workflows/abc123/run")).toBe(true);
    });

    it("should NOT allow fal.run without a trailing slash", () => {
      expect(isAllowedUrl("fal.run")).toBe(false);
    });
  });

  describe("fal.dev URLs", () => {
    it("should allow fal.dev with a path", () => {
      expect(isAllowedUrl("fal.dev/some/path")).toBe(true);
    });

    it("should allow fal.dev with minimal path", () => {
      expect(isAllowedUrl("fal.dev/")).toBe(true);
    });

    it("should NOT allow fal.dev without a trailing slash", () => {
      expect(isAllowedUrl("fal.dev")).toBe(false);
    });
  });

  describe("queue.fal.* URLs", () => {
    it("should allow queue.fal.run with a path", () => {
      expect(isAllowedUrl("queue.fal.run/some/path")).toBe(true);
    });

    it("should allow queue.fal.dev with a path", () => {
      expect(isAllowedUrl("queue.fal.dev/some/path")).toBe(true);
    });

    it("should allow queue.fal.run with minimal path", () => {
      expect(isAllowedUrl("queue.fal.run/")).toBe(true);
    });

    it("should NOT allow queue.fal.run without a trailing slash", () => {
      expect(isAllowedUrl("queue.fal.run")).toBe(false);
    });
  });

  describe("storage upload URLs", () => {
    it("should allow storage upload initiate URL", () => {
      const url = `${FAL_REST_API_URL}/storage/upload/initiate?storage_type=fal-cdn-v3`;
      expect(isAllowedUrl(url)).toBe(true);
    });

    it("should allow storage upload complete-multipart URL", () => {
      const url = `${FAL_REST_API_URL}/storage/upload/complete-multipart?storage_type=fal-cdn-v3`;
      expect(isAllowedUrl(url)).toBe(true);
    });

    it("should NOT allow storage upload with wrong storage_type", () => {
      const url = `${FAL_REST_API_URL}/storage/upload/initiate?storage_type=other`;
      expect(isAllowedUrl(url)).toBe(false);
    });

    it("should NOT allow storage upload without query params", () => {
      const url = `${FAL_REST_API_URL}/storage/upload/initiate`;
      expect(isAllowedUrl(url)).toBe(false);
    });

    it("should NOT allow storage URL with different path", () => {
      const url = `${FAL_REST_API_URL}/storage/download?storage_type=fal-cdn-v3`;
      expect(isAllowedUrl(url)).toBe(false);
    });
  });

  describe("disallowed URLs", () => {
    it("should NOT allow arbitrary domains", () => {
      expect(isAllowedUrl("example.com/path")).toBe(false);
    });

    it("should NOT allow storage upload with wrong path", () => {
      const url = `${FAL_REST_API_URL}/storage/upload/initiate-multipart?storage_type=fal-cdn-v3`;
      expect(isAllowedUrl(url)).toBe(false);
    });

    it("should NOT allow any REST url other than the ones allowed", () => {
      const url = `${FAL_REST_API_URL}/endpoint/`;
      expect(isAllowedUrl(url)).toBe(false);
    });

    it("should NOT allow fal.com", () => {
      expect(isAllowedUrl("fal.com/path")).toBe(false);
    });

    it("should NOT allow fal.io", () => {
      expect(isAllowedUrl("fal.io/path")).toBe(false);
    });

    it("should NOT allow subdomains other than queue", () => {
      expect(isAllowedUrl("api.fal.run/path")).toBe(false);
    });

    it("should NOT allow malicious domains that contain fal", () => {
      expect(isAllowedUrl("notfal.run/path")).toBe(false);
      expect(isAllowedUrl("fal.run.evil.com/path")).toBe(false);
    });

    it("should NOT allow empty string", () => {
      expect(isAllowedUrl("")).toBe(false);
    });

    it("should NOT allow URLs with different REST API base", () => {
      expect(
        isAllowedUrl(
          "https://rest.beta.fal.ai/storage/upload/initiate?storage_type=fal-cdn-v3",
        ),
      ).toBe(false);
    });
  });
});
