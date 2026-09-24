import { createAgentTransport, segment } from "./transport";
import type { AgentJson, AgentResourceOptions } from "./types";

export interface AgentSkillContent {
  name: string;
  description: string;
  body: string;
  references?: Record<string, string>;
}

export interface AgentSkillSource {
  repoUrl: string;
  ref?: string;
  subpath?: string;
}

export interface AgentSkill extends AgentSkillContent {
  id: string;
  origin: "fal" | "user";
  references: Record<string, string>;
  assets: Record<string, string>;
  disabled: boolean;
  shadowed: boolean;
  attribution: string | null;
  sourceRepo: string | null;
  sourceCommitSha: string | null;
  sourcePath: string | null;
  installedAt: string | null;
  updatedAt: string | null;
}

export interface AgentInstalledSkill extends AgentSkillContent {
  id: string;
  references: Record<string, string>;
  assets: Record<string, string>;
  metadata: Record<string, AgentJson>;
  allowedTools: string[] | null;
  sourceRepo: string | null;
  sourceCommitSha: string | null;
  sourcePath: string | null;
  installedAt: string;
  updatedAt: string;
}

export interface AgentSkillImportPreview {
  name: string;
  description: string;
  license?: string;
  sourceRepo: string;
  sourceCommitSha: string;
  sourcePath: string;
  hasScripts: boolean;
  referenceCount: number;
  assetCount: number;
  totalBytes: number;
  warnings: string[];
  nameClash: boolean;
  nameClashRepo: string | null;
  presetClash: boolean;
}

export function createAgentSkillsClient(
  request: ReturnType<typeof createAgentTransport>,
) {
  const write = <T>(
    method: "POST" | "PATCH" | "DELETE",
    path: string,
    input: unknown,
    options?: AgentResourceOptions,
  ) => request<T>(method, path, input, options, undefined, false, false);
  const path = (id: string) => `/agent/skills/${segment(id)}`;
  return {
    list: (
      filter: { search?: string; conversationId?: string } = {},
      options?: AgentResourceOptions,
    ) => {
      const query = new URLSearchParams();
      if (filter.search !== undefined) query.set("search", filter.search);
      if (filter.conversationId !== undefined)
        query.set("conversationId", filter.conversationId);
      return request<AgentSkill[]>(
        "GET",
        `/agent/skills?${query}`,
        undefined,
        options,
      );
    },
    retrieve: (id: string, options?: AgentResourceOptions) =>
      request<AgentSkill>("GET", path(id), undefined, options),
    previewImport: (input: AgentSkillSource, options?: AgentResourceOptions) =>
      write<AgentSkillImportPreview>(
        "POST",
        "/agent/skills/preview-import",
        input,
        options,
      ),
    importFromGithub: (
      input: AgentSkillSource,
      options?: AgentResourceOptions,
    ) =>
      write<AgentInstalledSkill>(
        "POST",
        "/agent/skills/import",
        input,
        options,
      ),
    create: (input: AgentSkillContent, options?: AgentResourceOptions) =>
      write<{ skill: AgentInstalledSkill; presetClash: boolean }>(
        "POST",
        "/agent/skills",
        input,
        options,
      ),
    /** Saving an imported skill detaches it from its GitHub source. */
    save: (
      id: string,
      content: AgentSkillContent,
      options?: AgentResourceOptions,
    ) =>
      write<{ skill: AgentInstalledSkill; presetClash: boolean }>(
        "PATCH",
        path(id),
        content,
        options,
      ),
    checkForUpdates: (id: string, options?: AgentResourceOptions) =>
      write<{
        currentSha: string | null;
        latestSha: string;
        hasUpdate: boolean;
      }>("POST", `${path(id)}/check-updates`, undefined, options),
    update: (id: string, options?: AgentResourceOptions) =>
      write<AgentInstalledSkill>(
        "POST",
        `${path(id)}/update`,
        undefined,
        options,
      ),
    uninstall: (id: string, options?: AgentResourceOptions) =>
      write<{ ok: true }>("DELETE", path(id), undefined, options),
    setEnabled: (
      input: { origin: "fal" | "user"; key: string; enabled: boolean },
      options?: AgentResourceOptions,
    ) =>
      write<{ ok: true }>("POST", "/agent/skills/set-enabled", input, options),
  };
}
