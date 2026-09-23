import type {
  AgentClient,
  AgentLibraryEntityInput,
  AgentLibraryEntityType,
} from "@fal-ai/client";

/** Use uploaded fal URLs or owned image targets. This only edits the library. */
export async function createLibraryEntities(
  library: AgentClient["library"],
  references: Record<AgentLibraryEntityType, string>,
) {
  const inputs: AgentLibraryEntityInput[] = [
    {
      type: "character",
      name: "Milo",
      handle: "milo",
      description: "A gray cat with green eyes.",
      referenceImages: [references.character],
    },
    {
      type: "prop",
      name: "Blue mug",
      handle: "blue-mug",
      metadata: { material: "ceramic" },
      referenceImages: [references.prop],
    },
    {
      type: "environment",
      name: "Studio",
      handle: "studio",
      referenceImages: [references.environment],
    },
    {
      type: "style",
      name: "Soft daylight",
      handle: "soft-daylight",
      referenceImages: [references.style],
    },
    {
      type: "scene",
      name: "Morning coffee",
      handle: "morning-coffee",
      referenceImages: [references.scene],
    },
  ];
  for (const input of inputs) {
    const entity = await library.entities.create(input);
    console.log(entity.type, entity.id, entity.references);
  }
  // These are account-scoped lookups, not a new generation or conversation.
  return library.entities.resolve({
    handles: inputs.map((input) => input.handle ?? input.name),
  });
}

export async function addEntityGalleryMedia(
  library: AgentClient["library"],
  entityId: string,
  assetRecordId: string,
) {
  await library.entities.addAsset(entityId, assetRecordId);
  const entity = await library.entities.retrieve(entityId);
  const gallery = await library.entities.listAssets(entityId);
  // Linking media does not replace the images that define the entity.
  return { references: entity.references, gallery };
}
