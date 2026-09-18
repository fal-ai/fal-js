import { createAgentTransport, segment } from "./transport";
import type { AgentResourceOptions } from "./types";

export type AgentLibraryMediaType = "image" | "video" | "audio" | "3d";

export interface AgentLibraryAsset {
  /** Catalog identity. Use this for library mutations, not artifact or media IDs. */
  assetRecordId?: string | null;
  assetId: string | null;
  vectorId: string;
  requestId: string | null;
  url: string | null;
  type: AgentLibraryMediaType;
  title: string;
  endpoint: string | null;
  createdAt: string | null;
  source: string | null;
  prompt: string | null;
  width: number | null;
  height: number | null;
  size?: number | null;
  contentType: string | null;
  isFavorited: boolean;
  collectionIds: string[];
  tags?: Array<{
    id: string;
    name: string;
    color: string | null;
    createdAt: string;
  }>;
}

export interface AgentLibraryAssetQuery {
  q?: string;
  searchImageUrl?: string;
  searchVideoUrl?: string;
  mediaTypes?: AgentLibraryMediaType[];
  sources?: Array<"upload" | "response">;
  section?: "all-media" | "generated" | "uploads" | "favorites";
  endpoints?: string[];
  collectionId?: string | null;
  recursive?: boolean;
  assetRecordIds?: string[];
  tagIds?: string[];
  tagMode?: "any" | "all";
  sortOrder?: "newest" | "oldest";
  cursor?: string | null;
  limit?: number;
}

export type AgentCollectionFilter =
  | { and: AgentCollectionFilter[] }
  | { or: AgentCollectionFilter[] }
  | {
      field: "endpoint" | "status" | "type" | "source" | "created_at";
      op: "eq" | "neq" | "in" | "gt" | "gte" | "lt" | "lte";
      value: string | number | string[] | number[];
    }
  | {
      semantic: {
        text?: string;
        image_url?: string;
        video_url?: string;
        min_similarity: number;
      };
    };

export interface AgentCollectionInput {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  coverImageUrl?: string;
  filters?: AgentCollectionFilter | null;
  parentCollectionId?: string | null;
}

export interface AgentLibraryCollection {
  id: string;
  type: "manual" | "smart" | "character";
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  coverImageUrl: string | null;
  filters: AgentCollectionFilter | null;
  parentCollectionId: string | null;
  characterIdentifier: string | null;
  isFavorited: boolean;
  createdAt: string;
  updatedAt: string;
  assetCount: number | null;
  previewAssets: Array<{
    id: string;
    type: string;
    url: string;
    createdAt: string;
  }>;
}

export function createAgentLibraryClient(
  request: ReturnType<typeof createAgentTransport>,
) {
  const assets = "/agent/library/assets";
  const collections = "/agent/library/collections";
  const read = <T>(url: string, options: AgentResourceOptions = {}) =>
    request<T>("GET", url, undefined, options);
  const query = (input: object) =>
    `?${new URLSearchParams({ input: JSON.stringify(input) })}`;
  // Native library writes have no idempotency receipt. Never replay an uncertain write.
  const write = <T>(
    method: string,
    url: string,
    input: unknown,
    options: AgentResourceOptions = {},
  ) => request<T>(method, url, input, options, undefined, false, false);
  type Success = { success: true };
  return {
    assets: {
      list: (
        input: AgentLibraryAssetQuery = {},
        options?: AgentResourceOptions,
      ) =>
        read<{
          items: AgentLibraryAsset[];
          nextCursor: string | null;
          totalCount: number;
          scopeTruncated: boolean;
        }>(`${assets}${query(input)}`, options),
      retrieve: (id: string, options?: AgentResourceOptions) =>
        read<AgentLibraryAsset>(`${assets}/${segment(id)}`, options),
      register: (
        input: {
          url: string;
          type: AgentLibraryMediaType;
          size?: number;
          collectionId?: string | null;
          favorite?: boolean;
        },
        options?: AgentResourceOptions,
      ) => write<AgentLibraryAsset>("POST", assets, input, options),
      setFavorite: (
        id: string,
        favorite: boolean,
        options?: AgentResourceOptions,
      ) =>
        write<{ assetRecordId: string; assetId: null; isFavorited: boolean }>(
          "PATCH",
          `${assets}/${segment(id)}/favorite`,
          { favorite },
          options,
        ),
      updatePrompt: (
        id: string,
        prompt: string,
        options?: AgentResourceOptions,
      ) =>
        write<AgentLibraryAsset>(
          "PATCH",
          `${assets}/${segment(id)}/prompt`,
          { prompt },
          options,
        ),
      delete: (id: string, options?: AgentResourceOptions) =>
        write<Success>(
          "DELETE",
          `${assets}/${segment(id)}`,
          undefined,
          options,
        ),
    },
    collections: {
      list: (
        input: {
          limit?: number;
          offset?: number;
          includeCharacters?: boolean;
        } = {},
        options?: AgentResourceOptions,
      ) =>
        read<AgentLibraryCollection[]>(
          `${collections}${query(input)}`,
          options,
        ),
      create: (input: AgentCollectionInput, options?: AgentResourceOptions) =>
        write<AgentLibraryCollection>("POST", collections, input, options),
      update: (
        id: string,
        input: {
          name?: string;
          description?: string | null;
          icon?: string | null;
          color?: string | null;
          coverImageUrl?: string | null;
          filters?: AgentCollectionFilter | null;
        },
        options?: AgentResourceOptions,
      ) =>
        write<AgentLibraryCollection>(
          "PATCH",
          `${collections}/${segment(id)}`,
          input,
          options,
        ),
      move: (
        id: string,
        parentCollectionId: string | null,
        options?: AgentResourceOptions,
      ) =>
        write<AgentLibraryCollection>(
          "PATCH",
          `${collections}/${segment(id)}/move`,
          { parentCollectionId },
          options,
        ),
      setFavorite: (
        id: string,
        favorite: boolean,
        options?: AgentResourceOptions,
      ) =>
        write<AgentLibraryCollection>(
          "PATCH",
          `${collections}/${segment(id)}/favorite`,
          { favorite },
          options,
        ),
      delete: (id: string, options?: AgentResourceOptions) =>
        write<Success>(
          "DELETE",
          `${collections}/${segment(id)}`,
          undefined,
          options,
        ),
      addAsset: (
        id: string,
        assetRecordId: string,
        options?: AgentResourceOptions,
      ) =>
        write<{ collectionId: string; assetRecordId: string }>(
          "PUT",
          `${collections}/${segment(id)}/assets/${segment(assetRecordId)}`,
          undefined,
          options,
        ),
      removeAsset: (
        id: string,
        assetRecordId: string,
        options?: AgentResourceOptions,
      ) =>
        write<Success>(
          "DELETE",
          `${collections}/${segment(id)}/assets/${segment(assetRecordId)}`,
          undefined,
          options,
        ),
    },
  };
}
