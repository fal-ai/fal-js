import { fetchWithBackupDomain, getBackupUrl } from "./backup-domain";

function connectionError(code: string, syscall?: string): TypeError {
  return Object.assign(new TypeError("fetch failed"), {
    cause: Object.assign(new Error(`${syscall ?? "connect"} ${code}`), {
      code,
      ...(syscall && { syscall }),
    }),
  });
}

describe("proxy backup domains", () => {
  it.each([
    ["https://fal.run/a/b?x=a%2Fb", "https://falrun.com/a/b?x=a%2Fb"],
    ["https://queue.fal.run:8443/a", "https://queue.falrun.com:8443/a"],
    ["https://FAL.RUN/A/b", "https://falrun.com/A/b"],
    ["https://falrun.com/a", undefined],
    ["https://fal.run.example.com/a", undefined],
    ["https://rest.fal.ai/storage/upload/initiate", undefined],
    ["https://constructor/a", undefined],
    ["not a URL", undefined],
  ])("maps %s only when it has an exact primary host", (url, expected) => {
    expect(getBackupUrl(url)).toBe(expected);
  });

  it("retries a connection failure against the backup host with the same init", async () => {
    const response = new Response("ok");
    const fetch = jest
      .fn()
      .mockRejectedValueOnce(connectionError("ENOTFOUND", "getaddrinfo"))
      .mockResolvedValueOnce(response);
    const init = { method: "POST", body: '{"prompt":"test"}' };

    await expect(
      fetchWithBackupDomain(fetch, "https://queue.fal.run/fal-ai/x", init),
    ).resolves.toBe(response);
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "https://queue.falrun.com/fal-ai/x",
      init,
    );
  });

  it("recognizes edge-runtime failures that carry no error code", async () => {
    const response = new Response("ok");
    const fetch = jest
      .fn()
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(response);
    await expect(
      fetchWithBackupDomain(fetch, "https://fal.run/model", {}),
    ).resolves.toBe(response);
  });

  it.each([
    new Error("application failure"),
    Object.assign(new Error("aborted"), { name: "AbortError" }),
    Object.assign(new Error("timed out"), { name: "TimeoutError" }),
    Object.assign(new TypeError("fetch failed"), {
      code: "ENOTFOUND",
      cause: Object.assign(new Error("aborted"), { name: "AbortError" }),
    }),
    connectionError("ECONNRESET"),
    connectionError("UND_ERR_SOCKET"),
    connectionError("ERR_TLS_CERT_ALTNAME_INVALID"),
    connectionError("ETIMEDOUT", "read"),
  ])("does not use the backup domain for %s", async (error) => {
    const fetch = jest.fn().mockRejectedValue(error);
    await expect(
      fetchWithBackupDomain(fetch, "https://fal.run/model", {}),
    ).rejects.toBe(error);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("recognizes a connection code below an unrelated wrapper code", async () => {
    const error = Object.assign(new TypeError("fetch failed"), {
      code: "ERR_NETWORK",
      cause: Object.assign(new Error("getaddrinfo ENOTFOUND"), {
        code: "ENOTFOUND",
      }),
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

  it("keeps a non-connection failure from the backup", async () => {
    const backupError = new Error("backup response failed");
    const fetch = jest
      .fn()
      .mockRejectedValueOnce(connectionError("ENOTFOUND"))
      .mockRejectedValueOnce(backupError);
    await expect(
      fetchWithBackupDomain(fetch, "https://fal.run/model", {}),
    ).rejects.toBe(backupError);
  });

  it("preserves the primary error when the backup also cannot connect", async () => {
    const primaryError = connectionError("ENOTFOUND");
    const fetch = jest
      .fn()
      .mockRejectedValueOnce(primaryError)
      .mockRejectedValueOnce(connectionError("ECONNREFUSED"));
    await expect(
      fetchWithBackupDomain(fetch, "https://fal.run/model", {}),
    ).rejects.toBe(primaryError);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
