import { fetchWithBackupDomain, getBackupUrl } from "./backup-domain";

function connectionError(code: string, syscall?: string): TypeError {
  return Object.assign(new TypeError("fetch failed"), {
    cause: Object.assign(new Error(`${syscall ?? "connect"} ${code}`), {
      code,
      ...(syscall && { syscall }),
    }),
  });
}

describe("backup domains", () => {
  it.each([
    ["https://fal.run/a/b?x=a%2Fb", "https://falrun.com/a/b?x=a%2Fb"],
    ["https://queue.fal.run:8443/a", "https://queue.falrun.com:8443/a"],
    ["https://FAL.RUN/A/b", "https://falrun.com/A/b"],
    ["https://falrun.com/a", undefined],
    ["https://fal.run.example.com/a", undefined],
    ["https://rest.fal.ai/tokens/", undefined],
    ["https://constructor/a", undefined],
    ["not a URL", undefined],
  ])("maps %s only when it has an exact primary host", (url, expected) => {
    expect(getBackupUrl(url)).toBe(expected);
  });

  it.each([
    "ECONNABORTED",
    "ECONNREFUSED",
    "EAI_AGAIN",
    "EHOSTUNREACH",
    "ENETUNREACH",
    "ENOTFOUND",
    "ETIMEDOUT",
    "UND_ERR_CONNECT_TIMEOUT",
  ])("falls back for %s connection failures", async (code) => {
    const primaryError = connectionError(code);
    await expectFallback(primaryError);
  });

  it.each([
    ["ETIMEDOUT", "connect"],
    ["ENOTFOUND", "getaddrinfo"],
  ])("falls back for %s raised by %s", async (code, syscall) => {
    await expectFallback(connectionError(code, syscall));
  });

  async function expectFallback(primaryError: Error) {
    const response = new Response("ok");
    const fetch = jest
      .fn()
      .mockRejectedValueOnce(primaryError)
      .mockResolvedValueOnce(response);
    await expect(
      fetchWithBackupDomain(fetch, "https://fal.run/model?token=secret", {
        method: "POST",
        body: '{"prompt":"test"}',
      }),
    ).resolves.toBe(response);

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      "https://fal.run/model?token=secret",
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "https://falrun.com/model?token=secret",
      expect.objectContaining({
        method: "POST",
        body: '{"prompt":"test"}',
      }),
    );
  }

  it("recognizes browser network failures", async () => {
    const response = new Response("ok");
    const fetch = jest
      .fn()
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(response);
    await expect(
      fetchWithBackupDomain(fetch, "https://queue.fal.run/model", {}),
    ).resolves.toBe(response);
    expect(fetch.mock.calls[1][0]).toBe("https://queue.falrun.com/model");
  });

  it("recognizes a connection code below an unrelated wrapper code", async () => {
    const cause = connectionError("ENOTFOUND");
    const error = Object.assign(new TypeError("fetch failed"), {
      code: "ERR_NETWORK",
      cause,
    });
    const response = new Response("ok");
    const fetch = jest
      .fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(response);
    await expect(
      fetchWithBackupDomain(fetch, "https://fal.run/model", {}),
    ).resolves.toBe(response);
  });

  it.each([
    new Error("application failure"),
    Object.assign(new Error("aborted"), { name: "AbortError" }),
    Object.assign(new Error("timed out"), { name: "TimeoutError" }),
    // Node wraps post-connect failures in the same "fetch failed" TypeError as
    // connection failures; only the cause code tells them apart.
    connectionError("ECONNRESET"),
    connectionError("UND_ERR_SOCKET"),
    connectionError("ERR_TLS_CERT_ALTNAME_INVALID"),
    Object.assign(new TypeError("fetch failed"), {
      code: "ENOTFOUND",
      cause: Object.assign(new Error("aborted"), { name: "AbortError" }),
    }),
    // The same codes raised after connect mean the request may have been
    // delivered; replaying it on another host would run the job twice.
    connectionError("ETIMEDOUT", "read"),
  ])("does not use the backup domain for %s", async (error) => {
    const fetch = jest.fn().mockRejectedValue(error);

    await expect(
      fetchWithBackupDomain(fetch, "https://fal.run/model", {}),
    ).rejects.toBe(error);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("does not use the backup domain after caller cancellation", async () => {
    const controller = new AbortController();
    controller.abort();
    const error = connectionError("ENOTFOUND");
    const fetch = jest.fn().mockRejectedValue(error);

    await expect(
      fetchWithBackupDomain(fetch, "https://fal.run/model", {
        signal: controller.signal,
      }),
    ).rejects.toBe(error);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("preserves the primary error when the backup also cannot connect", async () => {
    const primaryError = connectionError("ENOTFOUND");
    const backupError = connectionError("ECONNREFUSED");
    const fetch = jest
      .fn()
      .mockRejectedValueOnce(primaryError)
      .mockRejectedValueOnce(backupError);
    await expect(
      fetchWithBackupDomain(fetch, "https://fal.run/model", {}),
    ).rejects.toBe(primaryError);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("keeps a non-connection failure from the backup", async () => {
    const primaryError = connectionError("ENOTFOUND");
    const backupError = new Error("backup response failed");
    const fetch = jest
      .fn()
      .mockRejectedValueOnce(primaryError)
      .mockRejectedValueOnce(backupError);
    await expect(
      fetchWithBackupDomain(fetch, "https://fal.run/model", {}),
    ).rejects.toBe(backupError);
  });
});
