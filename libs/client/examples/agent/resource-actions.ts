import type { AgentResponseView, FalClient } from "../../src/index";

/** Deliberately explicit: this panel exercises public SDK methods, never raw HTTP. */
export function mountResourceActions(
  root: Document,
  client: FalClient,
  context: {
    conversation: () => string | undefined;
    response: () => AgentResponseView | undefined;
    useConversation: (id: string) => void;
    useResponse: (response: AgentResponseView) => void;
    run: (action: () => Promise<void>) => Promise<void>;
  },
) {
  const field = (id: string) => root.getElementById(id) as HTMLInputElement;
  const agent = client.agent;
  const templates = {
    "library.assets.list": { limit: 10 },
    "library.assets.retrieve": {},
    "library.assets.register": { url: "", type: "image" },
    "library.assets.setFavorite": { favorite: true },
    "library.assets.updatePrompt": { prompt: "Updated description" },
    "library.assets.delete": {},
    "library.collections.list": { includeCharacters: false },
    "library.collections.create": { name: "SDK library test" },
    "library.collections.update": { name: "SDK library test renamed" },
    "library.collections.move": { parentCollectionId: null },
    "library.collections.setFavorite": { favorite: true },
    "library.collections.delete": {},
    "library.collections.addAsset": { assetRecordId: "" },
    "library.collections.removeAsset": { assetRecordId: "" },
    "projects.list": {},
    "projects.create": { name: "SDK acceptance test", color: "sky" },
    "projects.context": {},
    "projects.conversations.create": { title: "SDK project test" },
    "projects.conversations.add": {},
    "projects.assets.attach": {},
    "projects.assets.detach": {},
    "projects.collections.attach": {},
    "projects.collections.detach": {},
    "projects.documents.attach": {
      fileName: "sdk-brief.txt",
      text: "Product: Tide cobalt-blue mug. Campaign code: TIDE-417. Use a pale stone background, one orange, and no text in the image.",
    },
    "projects.documents.preview": {},
    "projects.documents.retry": {},
    "projects.documents.remove": {},
    "projects.memory.create": {
      kind: "fact",
      content: "The campaign code is TIDE-417.",
    },
    "projects.memory.update": {
      content: "The campaign code is TIDE-418.",
      pinned: true,
    },
    "settings.load": {},
    "settings.save": {
      changes: { preferences: { aspect_ratio: "1:1" }, preferredModels: {} },
    },
    "settings.generation.load": {},
    "settings.generation.save": {},
    "preferences.retrieve": {},
    "preferences.update": { section: "general", changes: {} },
    "queue.retrieve": {},
    "queue.halt": {},
    "queue.resume": {},
    "queue.reorder": { turnIds: [] },
    "queue.edit": {
      content:
        "Reply with exactly QUEUE TEST OK. Text only; no tools or media.",
    },
    "queue.cancel": {},
    "queue.approval": { requiresApproval: true },
    "queue.run": {},
    "queue.dispatch": {},
    "runs.retrieve": {},
    "runs.retry": {},
    "runs.cancel": {},
    "runs.answer": { input_request_id: "", decision: "approve" },
    generationSummary: {},
    finalArtifacts: { artifact_ids: [] },
  };
  const select = root.getElementById("sdk-action") as HTMLSelectElement;
  for (const name of Object.keys(templates)) select.add(new Option(name, name));
  const writeInput = (value: unknown) => {
    field("sdk-input").value = JSON.stringify(value, null, 2);
  };
  let defaults:
    | Awaited<ReturnType<typeof agent.settings.defaults.retrieve>>
    | undefined;
  let defaultsTarget = "";
  let generation:
    | Awaited<ReturnType<typeof agent.settings.conversations.retrieve>>
    | undefined;
  let generationTarget = "";
  select.onchange = () => {
    if (select.value === "settings.generation.save" && generation)
      writeInput({ settings: generation });
    else writeInput(templates[select.value as keyof typeof templates]);
  };
  select.onchange(new Event("change"));
  root.getElementById("sdk-execute")!.onclick = () =>
    void context.run(async () => {
      const action = select.value;
      const output = root.getElementById("sdk-result")!;
      output.textContent = "Working…";
      try {
        const input = JSON.parse(field("sdk-input").value);
        if (!input || typeof input !== "object" || Array.isArray(input))
          throw new Error("Input must be a JSON object.");
        const required = (value: string | undefined, label: string) => {
          if (!value?.trim()) throw new Error(`Enter ${label} first.`);
          return value.trim();
        };
        const project = () =>
          required(field("sdk-project").value, "a project ID");
        const conversation = () =>
          required(
            context.conversation(),
            "a conversation (create or open one above)",
          );
        const item = () => required(field("sdk-item").value, "an item ID");
        const target = () =>
          field("sdk-scope").value === "project"
            ? { scope: "project" as const, projectId: project() }
            : { scope: "chat" as const, chatId: conversation() };
        let result: unknown;
        switch (action) {
          case "library.assets.list":
            result = await agent.library.assets.list(input);
            break;
          case "library.assets.retrieve":
            result = await agent.library.assets.retrieve(item());
            break;
          case "library.assets.register":
            result = await agent.library.assets.register(input);
            break;
          case "library.assets.setFavorite":
            result = await agent.library.assets.setFavorite(
              item(),
              input.favorite,
            );
            break;
          case "library.assets.updatePrompt":
            result = await agent.library.assets.updatePrompt(
              item(),
              input.prompt,
            );
            break;
          case "library.assets.delete":
            result = await agent.library.assets.delete(item());
            break;
          case "library.collections.list":
            result = await agent.library.collections.list(input);
            break;
          case "library.collections.create": {
            const created = await agent.library.collections.create(input);
            field("sdk-item").value = created.id;
            result = created;
            break;
          }
          case "library.collections.update":
            result = await agent.library.collections.update(item(), input);
            break;
          case "library.collections.move":
            result = await agent.library.collections.move(
              item(),
              input.parentCollectionId,
            );
            break;
          case "library.collections.setFavorite":
            result = await agent.library.collections.setFavorite(
              item(),
              input.favorite,
            );
            break;
          case "library.collections.delete":
            result = await agent.library.collections.delete(item());
            break;
          case "library.collections.addAsset":
            result = await agent.library.collections.addAsset(
              item(),
              required(input.assetRecordId, "a library asset record ID"),
            );
            break;
          case "library.collections.removeAsset":
            result = await agent.library.collections.removeAsset(
              item(),
              required(input.assetRecordId, "a library asset record ID"),
            );
            break;
          case "projects.list":
            result = await agent.projects.list();
            break;
          case "projects.create": {
            const created = await agent.projects.create(input);
            field("sdk-project").value = created.id;
            result = created;
            break;
          }
          case "projects.context": {
            const id = project();
            const [resources, documents, memory, conversations] =
              await Promise.all([
                agent.projects.resources(id),
                agent.projects.documents.list(id),
                agent.projects.memory.retrieve(id),
                agent.projects.conversations.list(id),
              ]);
            result = { resources, documents, memory, conversations };
            break;
          }
          case "projects.conversations.create": {
            const created = await agent.projects.conversations.create(
              project(),
              input,
            );
            // The new chat is idle: project context exists before the first agent turn.
            context.useConversation(created.id);
            result = created;
            break;
          }
          case "projects.conversations.add":
            result = await agent.projects.conversations.add(
              project(),
              conversation(),
            );
            break;
          case "projects.assets.attach":
            result = await agent.projects.assets.attach(project(), item());
            break;
          case "projects.assets.detach":
            result = await agent.projects.assets.detach(project(), item());
            break;
          case "projects.collections.attach":
            result = await agent.projects.collections.attach(project(), item());
            break;
          case "projects.collections.detach":
            result = await agent.projects.collections.detach(project(), item());
            break;
          case "projects.documents.attach": {
            const id = project();
            if (!input.url) {
              if (
                typeof input.text !== "string" ||
                !input.text.trim() ||
                typeof input.fileName !== "string" ||
                !input.fileName.endsWith(".txt")
              )
                throw new Error(
                  "For a text upload, supply text and a .txt fileName. Other formats need an uploaded URL and extracted text.",
                );
              const file = new File([input.text], input.fileName, {
                type: "text/plain",
              });
              input.url = await client.storage.upload(file);
              input.contentType = file.type;
              input.sizeBytes = file.size;
              // Keep the uploaded URL if attachment fails; an explicit retry need not upload again.
              writeInput(input);
            }
            const document = await agent.projects.documents.attach(id, input);
            field("sdk-item").value = document.assetId;
            result = document;
            break;
          }
          case "projects.documents.preview":
            result = await agent.projects.documents.preview(project(), item());
            break;
          case "projects.documents.retry":
            result = await agent.projects.documents.retry(project(), item());
            break;
          case "projects.documents.remove":
            result = await agent.projects.documents.remove(project(), item());
            break;
          case "projects.memory.create": {
            const note = await agent.projects.memory.create(project(), input);
            field("sdk-item").value = note.id;
            result = note;
            break;
          }
          case "projects.memory.update":
            result = await agent.projects.memory.update(
              project(),
              item(),
              input,
            );
            break;
          case "settings.load": {
            const scope = target();
            defaults = await agent.settings.defaults.retrieve(scope);
            defaultsTarget = JSON.stringify(scope);
            result = defaults;
            break;
          }
          case "settings.save": {
            const scope = target();
            if (!defaults || defaultsTarget !== JSON.stringify(scope))
              throw new Error("Load settings for this target before saving.");
            defaults = await agent.settings.defaults.update(scope, {
              ...input,
              expectedLocal: defaults.local,
            });
            result = defaults;
            break;
          }
          case "settings.generation.load": {
            const scope = target();
            generation =
              scope.scope === "project"
                ? await agent.settings.projects.retrieve(scope.projectId)
                : await agent.settings.conversations.retrieve(scope.chatId);
            generationTarget = JSON.stringify(scope);
            writeInput({ settings: generation });
            result = generation;
            break;
          }
          case "settings.generation.save": {
            const scope = target();
            if (!generation || generationTarget !== JSON.stringify(scope))
              throw new Error(
                "Load generation settings for this target before saving.",
              );
            const change = {
              settings: input.settings,
              expectedRevision: generation.revision,
            };
            generation =
              scope.scope === "project"
                ? await agent.settings.projects.update(scope.projectId, change)
                : await agent.settings.conversations.update(
                    scope.chatId,
                    change,
                  );
            result = generation;
            break;
          }
          case "preferences.retrieve":
            result = await agent.preferences.retrieve();
            break;
          case "preferences.update": {
            if (
              !["general", "cost", "skills", "notifications"].includes(
                input.section,
              )
            )
              throw new Error("Choose a supported preference section.");
            result = await agent.preferences.update(
              input.section,
              input.changes,
            );
            break;
          }
          case "queue.retrieve":
            result = await agent.queue.retrieve(conversation());
            break;
          case "queue.halt":
            result = await agent.queue.setHalted(conversation(), true);
            break;
          case "queue.resume":
            result = await agent.queue.setHalted(conversation(), false);
            break;
          case "queue.reorder":
            result = await agent.queue.reorder(conversation(), input.turnIds);
            break;
          case "queue.edit":
            result = await agent.queue.edit(
              conversation(),
              item(),
              input.content,
            );
            break;
          case "queue.cancel":
            result = await agent.queue.cancel(conversation(), item());
            break;
          case "queue.approval":
            result = await agent.queue.setApproval(
              conversation(),
              item(),
              input,
            );
            break;
          case "queue.run":
            result = await agent.queue.run(conversation(), item());
            break;
          case "queue.dispatch":
            result = await agent.queue.dispatch(conversation());
            break;
          case "runs.retrieve":
            result = await agent.runs.retrieve(item(), conversation());
            break;
          case "runs.retry":
            result = await agent.runs.retry(item(), conversation());
            break;
          case "runs.cancel":
            result = await agent.runs.cancel(item(), conversation());
            break;
          case "runs.answer":
            result = await agent.runs.answer(item(), conversation(), input);
            break;
          case "generationSummary":
            result =
              await agent.conversations.generationSummary(conversation());
            break;
          case "finalArtifacts": {
            const response = context.response();
            if (!response) throw new Error("Load a response first.");
            const updated = await agent.responses.selectFinalArtifacts(
              response.id,
              {
                artifact_ids: input.artifact_ids,
                expected_sequence_number: response.fal.sequence_number,
              },
            );
            context.useResponse(updated);
            result = updated;
            break;
          }
          default:
            throw new Error("Choose a supported SDK action.");
        }
        output.textContent = JSON.stringify(result, null, 2);
      } catch (error) {
        output.textContent = `${error instanceof Error ? error.message : String(error)}\nNo automatic retry. Read the resource before repeating a mutation whose result is uncertain.`;
      }
    });
}
