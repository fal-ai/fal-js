import type { RequiredConfig } from "../config";
import { createStorageClient } from "../storage";
import { createAgentTransport, segment, throwIfAborted } from "./transport";
import type {
  AgentConversation,
  AgentMemoryKind,
  AgentProject,
  AgentProjectConversation,
  AgentProjectDocument,
  AgentProjectDocumentInput,
  AgentProjectMemory,
  AgentProjectResources,
  AgentProjectSummary,
  AgentResourceOptions,
} from "./types";

export interface AgentProjectDocumentImport {
  url: string;
  fileName: string;
  /** Optional MIME type. Inferred from the file extension when omitted. */
  contentType?: string;
}

export function createAgentProjectsClient(
  request: ReturnType<typeof createAgentTransport>,
  config: RequiredConfig,
) {
  const path = (id: string) => `/agent/projects/${segment(id)}`;
  const read = <T>(url: string, options: AgentResourceOptions = {}) =>
    request<T>("GET", url, undefined, options);
  // These native resource mutations do not promise response-command idempotency.
  const write = <T>(
    method: string,
    url: string,
    body: unknown,
    options: AgentResourceOptions = {},
  ) => request<T>(method, url, body, options, undefined, false, false);
  type Success = { success: true };
  return {
    list: (options?: AgentResourceOptions) =>
      read<AgentProjectSummary[]>("/agent/projects", options),
    create: (
      input: { name: string; color?: string },
      options?: AgentResourceOptions,
    ) => write<AgentProject>("POST", "/agent/projects", input, options),
    retrieve: (id: string, options?: AgentResourceOptions) =>
      read<AgentProject>(path(id), options),
    update: (
      id: string,
      input: { name?: string; color?: string },
      options?: AgentResourceOptions,
    ) => write<AgentProject>("PATCH", path(id), input, options),
    delete: (id: string, options?: AgentResourceOptions) =>
      write<Success>("DELETE", path(id), undefined, options),
    resources: (id: string, options?: AgentResourceOptions) =>
      read<AgentProjectResources>(`${path(id)}/resources`, options),
    conversations: {
      list: (id: string, options?: AgentResourceOptions) =>
        read<AgentProjectConversation[]>(`${path(id)}/conversations`, options),
      create: (
        id: string,
        input: { title?: string | null } = {},
        options?: AgentResourceOptions,
      ) =>
        write<AgentConversation>(
          "POST",
          `${path(id)}/conversations`,
          input,
          options,
        ),
      add: (id: string, conversation: string, options?: AgentResourceOptions) =>
        write<Success>(
          "PUT",
          `${path(id)}/conversations/${segment(conversation)}`,
          undefined,
          options,
        ),
      remove: (
        id: string,
        conversation: string,
        options?: AgentResourceOptions,
      ) =>
        write<Success>(
          "DELETE",
          `${path(id)}/conversations/${segment(conversation)}`,
          undefined,
          options,
        ),
      setMemoryPrivacy: (
        id: string,
        conversation: string,
        excluded: boolean,
        options?: AgentResourceOptions,
      ) =>
        write<Success>(
          "PATCH",
          `${path(id)}/conversations/${segment(conversation)}/memory`,
          { excluded },
          options,
        ),
    },
    assets: {
      attach: (id: string, assetId: string, options?: AgentResourceOptions) =>
        write<Success>(
          "PUT",
          `${path(id)}/assets/${segment(assetId)}`,
          undefined,
          options,
        ),
      detach: (id: string, assetId: string, options?: AgentResourceOptions) =>
        write<Success>(
          "DELETE",
          `${path(id)}/assets/${segment(assetId)}`,
          undefined,
          options,
        ),
    },
    collections: {
      attach: (
        id: string,
        collectionId: string,
        options?: AgentResourceOptions,
      ) =>
        write<Success>(
          "PUT",
          `${path(id)}/collections/${segment(collectionId)}`,
          undefined,
          options,
        ),
      detach: (
        id: string,
        collectionId: string,
        options?: AgentResourceOptions,
      ) =>
        write<Success>(
          "DELETE",
          `${path(id)}/collections/${segment(collectionId)}`,
          undefined,
          options,
        ),
    },
    documents: {
      upload: async (
        id: string,
        file: File,
        options: AgentResourceOptions = {},
      ) => {
        throwIfAborted(options.signal);
        if (file.size > 25 * 1024 * 1024)
          throw new Error("Documents must be 25 MiB or smaller");
        const url = await createStorageClient({ config }).upload(file);
        throwIfAborted(options.signal);
        return write<AgentProjectDocument>(
          "POST",
          `${path(id)}/documents/import`,
          { url, fileName: file.name, contentType: file.type || undefined },
          options,
        );
      },
      import: (
        id: string,
        input: AgentProjectDocumentImport,
        options?: AgentResourceOptions,
      ) =>
        write<AgentProjectDocument>(
          "POST",
          `${path(id)}/documents/import`,
          input,
          options,
        ),
      list: (id: string, options?: AgentResourceOptions) =>
        read<AgentProjectDocument[]>(`${path(id)}/documents`, options),
      attach: (
        id: string,
        input: AgentProjectDocumentInput,
        options?: AgentResourceOptions,
      ) =>
        write<AgentProjectDocument>(
          "POST",
          `${path(id)}/documents`,
          input,
          options,
        ),
      preview: (id: string, assetId: string, options?: AgentResourceOptions) =>
        read<{ text: string; truncated: boolean }>(
          `${path(id)}/documents/${segment(assetId)}`,
          options,
        ),
      remove: (id: string, assetId: string, options?: AgentResourceOptions) =>
        write<Success>(
          "DELETE",
          `${path(id)}/documents/${segment(assetId)}`,
          undefined,
          options,
        ),
      retry: (id: string, assetId: string, options?: AgentResourceOptions) =>
        write<AgentProjectDocument>(
          "POST",
          `${path(id)}/documents/${segment(assetId)}/retry`,
          undefined,
          options,
        ),
    },
    memory: {
      retrieve: (id: string, options?: AgentResourceOptions) =>
        read<AgentProjectMemory>(`${path(id)}/memory`, options),
      create: (
        id: string,
        input: { kind: AgentMemoryKind; content: string },
        options?: AgentResourceOptions,
      ) =>
        write<{ id: string; supersededId: string | null }>(
          "POST",
          `${path(id)}/memory`,
          input,
          options,
        ),
      update: (
        id: string,
        noteId: string,
        input: {
          content?: string;
          pinned?: boolean;
          status?: "active" | "deleted";
        },
        options?: AgentResourceOptions,
      ) =>
        write<Success>(
          "PATCH",
          `${path(id)}/memory/${segment(noteId)}`,
          input,
          options,
        ),
    },
  };
}
