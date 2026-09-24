import { createFalClient } from "../client";
import type {
  AgentLibraryEntityInput,
  AgentLibraryEntityType,
} from "./library";

it.each<AgentLibraryEntityType>([
  "character",
  "prop",
  "environment",
  "style",
  "scene",
])(
  "creates a %s without losing its defining references or metadata",
  async (type) => {
    const reference = {
      assetRecordId: "image_1",
      url: "https://fal.media/ref.png",
    };
    const input: AgentLibraryEntityInput =
      type === "character"
        ? {
            type,
            name: "Milo",
            description: "A gray cat",
            referenceImages: [reference.url],
          }
        : {
            type,
            name: "Campaign reference",
            referenceImages: [reference.url],
            metadata: { campaign: "launch" },
          };
    const fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "entity_1",
          type,
          references: [reference],
          metadata: input.metadata ?? null,
        }),
        { headers: { "Content-Type": "application/json" } },
      ),
    );
    const { library } = createFalClient({
      fetch,
    }).agent;
    const entity = await library.entities.create(input);
    expect(fetch.mock.calls[0][0]).toBe(
      "https://fal.ai/api/agent-v2/sdk/agent/library/entities",
    );
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual(input);
    expect(entity.type).toBe(type);
    expect(entity.references).toEqual([reference]);
    expect(entity.metadata).toEqual(input.metadata ?? null);
  },
);

it("routes entity discovery and gallery operations separately from defining reference updates", async () => {
  const fetch = jest.fn().mockImplementation(
    async () =>
      new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      }),
  );
  const { library } = createFalClient({
    fetch,
  }).agent;
  await library.entities.list({
    types: ["prop", "scene"],
    search: "@summer & sun",
    offset: 100,
    limit: 10,
  });
  await library.entities.resolve({
    handles: ["@summer", "hero"],
    types: ["scene", "character"],
  });
  await library.entities.checkHandle({
    handle: "summer",
    excludeId: "entity/1",
  });
  expect(
    fetch.mock.calls
      .slice(0, 3)
      .map(([url]) =>
        JSON.parse(new URL(url).searchParams.get("input") ?? "{}"),
      ),
  ).toEqual([
    {
      types: ["prop", "scene"],
      search: "@summer & sun",
      offset: 100,
      limit: 10,
    },
    { handles: ["@summer", "hero"], types: ["scene", "character"] },
    { handle: "summer", excludeId: "entity/1" },
  ]);
  expect(
    fetch.mock.calls.slice(0, 3).map(([url]) => new URL(url).pathname),
  ).toEqual([
    "/api/agent-v2/sdk/agent/library/entities",
    "/api/agent-v2/sdk/agent/library/entities/resolve",
    "/api/agent-v2/sdk/agent/library/entities/handle",
  ]);
  fetch.mockClear();
  await library.entities.retrieve("entity/1");
  await library.entities.listAssets("entity/1", {
    offset: 20,
    limit: 10,
    includeReferences: true,
  });
  await library.entities.update("entity/1", { referenceImages: ["image_2"] });
  await library.entities.addAsset("entity/1", "gallery/1");
  await library.entities.removeAsset("entity/1", "gallery/1");
  await library.entities.setFavorite("entity/1", true);
  await library.entities.delete("entity/1");
  expect(
    fetch.mock.calls.map(([url, init]) => [
      new URL(url).pathname,
      init.method,
      init.body && JSON.parse(init.body),
    ]),
  ).toEqual([
    ["/api/agent-v2/sdk/agent/library/entities/entity%2F1", "GET", undefined],
    [
      "/api/agent-v2/sdk/agent/library/entities/entity%2F1/assets",
      "GET",
      undefined,
    ],
    [
      "/api/agent-v2/sdk/agent/library/entities/entity%2F1",
      "PATCH",
      { referenceImages: ["image_2"] },
    ],
    [
      "/api/agent-v2/sdk/agent/library/entities/entity%2F1/assets",
      "PUT",
      { assetRef: "gallery/1" },
    ],
    [
      "/api/agent-v2/sdk/agent/library/entities/entity%2F1/assets",
      "DELETE",
      { assetRef: "gallery/1" },
    ],
    [
      "/api/agent-v2/sdk/agent/library/entities/entity%2F1/favorite",
      "PATCH",
      { favorite: true },
    ],
    [
      "/api/agent-v2/sdk/agent/library/entities/entity%2F1",
      "DELETE",
      undefined,
    ],
  ]);
  expect(
    JSON.parse(
      new URL(fetch.mock.calls[1][0]).searchParams.get("input") ?? "{}",
    ),
  ).toEqual({ offset: 20, limit: 10, includeReferences: true });
  await library.collections.list({
    includeCharacters: false,
    includeSmartEntities: true,
  });
  expect(
    JSON.parse(
      new URL(fetch.mock.calls[7][0]).searchParams.get("input") ?? "{}",
    ),
  ).toEqual({ includeCharacters: false, includeSmartEntities: true });
});

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
    "https://fal.ai/api/agent-v2/sdk/agent/library/characters/character%2F1",
  );
  expect(fetch.mock.calls[1][1].method).toBe("PATCH");
  await library.characters.references("character/1");
  expect(fetch.mock.calls[2][0]).toBe(
    "https://fal.ai/api/agent-v2/sdk/agent/library/characters/character%2F1/references",
  );
  await library.characters.checkIdentifier("milo & friends");
  expect(
    JSON.parse(new URL(fetch.mock.calls[3][0]).searchParams.get("input")!),
  ).toEqual({ identifier: "milo & friends" });
  await library.assets.assignTag("asset/1", "tag/1");
  expect(fetch.mock.calls[4][0]).toBe(
    "https://fal.ai/api/agent-v2/sdk/agent/library/assets/asset%2F1/tags/tag%2F1",
  );
  expect(fetch.mock.calls[4][1].method).toBe("PUT");
  await library.assets.removeTag("asset/1", "tag/1");
  expect(fetch.mock.calls[5][1].method).toBe("DELETE");
  await library.tags.update("tag/1", { name: "Launch" });
  expect(fetch.mock.calls[6][0]).toBe(
    "https://fal.ai/api/agent-v2/sdk/agent/library/tags/tag%2F1",
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
  fetch.mockClear();
  await expect(
    library.entities.create({
      type: "prop",
      name: "Mug",
      referenceImages: character.referenceImages,
    }),
  ).rejects.toThrow("Connection lost after commit");
  expect(fetch).toHaveBeenCalledTimes(1);
});
