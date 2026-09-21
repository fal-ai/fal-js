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
    agent: { baseUrl: "https://agent.example/v1" },
    fetch,
  });
  const file = new File(["Brief"], "brief.txt", { type: "text/plain" });
  await agent.projects.documents.upload("project/1", file);
  expect(upload).toHaveBeenCalledWith(file);
  expect(fetch.mock.calls[0][0]).toBe(
    "https://agent.example/v1/agent/projects/project%2F1/documents/import",
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
