import { createFalClient } from "../client";
import { createStorageClient } from "../storage";

jest.mock("../storage", () => ({
  ...jest.requireActual("../storage"),
  createStorageClient: jest.fn(),
}));

it("uploads documents through shared storage then imports their hosted URL", async () => {
  const upload = jest.fn().mockResolvedValue("https://fal.media/brief.txt");
  jest
    .mocked(createStorageClient)
    .mockReturnValue({ upload, transformInput: jest.fn() });
  const fetch = jest
    .fn()
    .mockResolvedValue(
      new Response(JSON.stringify({ id: "document", status: "pending" })),
    );
  const { agent } = createFalClient({
    credentials: "test-key",
    fetch,
  });
  const file = new File(["Brief"], "brief.txt", { type: "text/plain" });
  await agent.projects.documents.upload("project/1", file);
  expect(upload).toHaveBeenCalledWith(file);
  expect(fetch.mock.calls[0][0]).toBe(
    "https://fal.ai/api/agent-v2/sdk/agent/projects/project%2F1/documents/import",
  );
  expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
    url: "https://fal.media/brief.txt",
    fileName: "brief.txt",
    contentType: "text/plain",
  });
  upload.mockClear();
  const oversized = new File(
    [new Uint8Array(25 * 1024 * 1024 + 1)],
    "large.txt",
  );
  await expect(
    agent.projects.documents.upload("project", oversized),
  ).rejects.toThrow("25 MiB");
  expect(upload).not.toHaveBeenCalled();
});

it.each(["abort", "timeout"])(
  "stops document upload on %s without importing the document",
  async (mode) => {
    jest
      .mocked(createStorageClient)
      .mockImplementation(jest.requireActual("../storage").createStorageClient);
    const controller = new AbortController();
    const fetch = jest
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            file_url: "https://fal.media/brief.txt",
            upload_url: "https://upload.fal.media/brief.txt",
          }),
          { headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockImplementationOnce((_url, init) => {
        const pending = new Promise((_resolve, reject) => {
          init.signal.addEventListener("abort", () =>
            reject(init.signal.reason),
          );
        });
        if (mode === "abort") queueMicrotask(() => controller.abort());
        return pending;
      });
    const { agent } = createFalClient({
      credentials: "test-key",
      fetch,
    });
    await expect(
      agent.projects.documents.upload(
        "project",
        new File(["Brief"], "brief.txt"),
        { signal: controller.signal, timeoutMs: 30 },
      ),
    ).rejects.toMatchObject({
      name: mode === "abort" ? "AbortError" : "TimeoutError",
    });
    expect(fetch.mock.calls.map(([, init]) => init.method)).toEqual([
      "POST",
      "PUT",
    ]);
  },
);

it("surfaces failed upload initiation without retrying or importing", async () => {
  jest
    .mocked(createStorageClient)
    .mockImplementation(jest.requireActual("../storage").createStorageClient);
  const fetch = jest
    .fn()
    .mockImplementation(
      async () => new Response("Unavailable", { status: 503 }),
    );
  const { agent } = createFalClient({
    credentials: "test-key",
    fetch,
    retry: { maxRetries: 2, baseDelay: 0, maxDelay: 0 },
  });
  await expect(
    agent.projects.documents.upload(
      "project",
      new File(["Brief"], "brief.txt"),
    ),
  ).rejects.toMatchObject({ status: 503 });
  expect(fetch).toHaveBeenCalledTimes(1);
});
