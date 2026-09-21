import { createFalClient } from "../client";

it("encodes character and tag identities and never replays uncertain writes", async () => {
  const fetch = jest.fn().mockImplementation(() =>
    Promise.resolve(
      new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );
  const { library } = createFalClient({
    credentials: "test-key",
    agent: { baseUrl: "https://agent.example/v1" },
    fetch,
    retry: { maxRetries: 1, baseDelay: 0, maxDelay: 0 },
  }).agent;
  const character = {
    name: "Milo",
    description: "A gray cat",
    referenceImages: ["https://fal.media/milo.png"],
  };
  await library.characters.create({ ...character, identifier: "milo" });
  expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
    ...character,
    identifier: "milo",
  });
  await library.characters.update("character/1", character);
  expect(fetch.mock.calls[1][0]).toBe(
    "https://agent.example/v1/agent/library/characters/character%2F1",
  );
  expect(fetch.mock.calls[1][1].method).toBe("PATCH");
  await library.characters.references("character/1");
  expect(fetch.mock.calls[2][0]).toBe(
    "https://agent.example/v1/agent/library/characters/character%2F1/references",
  );
  await library.characters.checkIdentifier("milo & friends");
  expect(
    JSON.parse(new URL(fetch.mock.calls[3][0]).searchParams.get("input")!),
  ).toEqual({ identifier: "milo & friends" });
  await library.assets.assignTag("asset/1", "tag/1");
  expect(fetch.mock.calls[4][0]).toBe(
    "https://agent.example/v1/agent/library/assets/asset%2F1/tags/tag%2F1",
  );
  expect(fetch.mock.calls[4][1].method).toBe("PUT");
  await library.assets.removeTag("asset/1", "tag/1");
  expect(fetch.mock.calls[5][1].method).toBe("DELETE");
  await library.tags.update("tag/1", { name: "Launch" });
  expect(fetch.mock.calls[6][0]).toBe(
    "https://agent.example/v1/agent/library/tags/tag%2F1",
  );
  expect(JSON.parse(fetch.mock.calls[6][1].body)).toEqual({ name: "Launch" });
  fetch.mockClear();
  fetch.mockRejectedValue(new TypeError("Connection lost after commit"));
  await expect(library.characters.create(character)).rejects.toThrow(
    "Connection lost after commit",
  );
  expect(fetch).toHaveBeenCalledTimes(1);
  fetch.mockClear();
  await expect(library.tags.create({ name: "Launch" })).rejects.toThrow(
    "Connection lost after commit",
  );
  expect(fetch).toHaveBeenCalledTimes(1);
});
