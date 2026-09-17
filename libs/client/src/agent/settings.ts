import { createAgentTransport, segment } from "./transport";
import type {
  AgentDefaultsTarget,
  AgentDefaultsUpdate,
  AgentDefaultsView,
  AgentGenerationSettings,
  AgentModel,
  AgentModelCapabilities,
  AgentPreferences,
  AgentResourceOptions,
} from "./types";

export function createAgentSettingsClient(
  request: ReturnType<typeof createAgentTransport>,
) {
  const read = <T>(path: string, options: AgentResourceOptions = {}) =>
    request<T>("GET", path, undefined, options);
  const patch = <T>(
    path: string,
    input: unknown,
    options: AgentResourceOptions = {},
  ) => request<T>("PATCH", path, input, options, undefined, false, false);
  const defaultsPath = (target: AgentDefaultsTarget) =>
    `/agent/settings/defaults?${new URLSearchParams(target)}`;
  return {
    models: {
      listAgentModels: (options?: AgentResourceOptions) =>
        read<
          Array<{
            id: string;
            label: string;
            tag?: "recommended" | "experimental";
          }>
        >("/agent/models/agent", options),
      list: (
        filter: {
          keywords?: string;
          categories?: string[];
          page?: number;
          limit?: number;
        } = {},
        options?: AgentResourceOptions,
      ) => {
        const query = new URLSearchParams();
        if (filter.keywords) query.set("keywords", filter.keywords);
        for (const category of filter.categories ?? [])
          query.append("category", category);
        if (filter.page !== undefined) query.set("page", String(filter.page));
        if (filter.limit !== undefined)
          query.set("limit", String(filter.limit));
        return read<{
          items: AgentModel[];
          total?: number | null;
          page?: number;
          size?: number;
          pages?: number | null;
        }>(`/agent/models?${query}`, options);
      },
      capabilities: (endpointId: string, options?: AgentResourceOptions) =>
        read<AgentModelCapabilities>(
          `/agent/settings/capabilities?${new URLSearchParams({ endpointId })}`,
          options,
        ),
    },
    settings: {
      defaults: {
        retrieve: (
          target: AgentDefaultsTarget,
          options?: AgentResourceOptions,
        ) => read<AgentDefaultsView>(defaultsPath(target), options),
        update: (
          target: AgentDefaultsTarget,
          input: AgentDefaultsUpdate,
          options?: AgentResourceOptions,
        ) => patch<AgentDefaultsView>(defaultsPath(target), input, options),
      },
      conversations: {
        retrieve: (id: string, options?: AgentResourceOptions) =>
          read<AgentGenerationSettings>(
            `/agent/settings/conversations/${segment(id)}`,
            options,
          ),
        update: (
          id: string,
          input: {
            settings: AgentGenerationSettings;
            expectedRevision: number;
          },
          options?: AgentResourceOptions,
        ) =>
          patch<AgentGenerationSettings>(
            `/agent/settings/conversations/${segment(id)}`,
            input,
            options,
          ),
      },
      projects: {
        retrieve: (id: string, options?: AgentResourceOptions) =>
          read<AgentGenerationSettings>(
            `/agent/settings/projects/${segment(id)}`,
            options,
          ),
        update: (
          id: string,
          input: {
            settings: AgentGenerationSettings;
            expectedRevision: number;
          },
          options?: AgentResourceOptions,
        ) =>
          patch<AgentGenerationSettings>(
            `/agent/settings/projects/${segment(id)}`,
            input,
            options,
          ),
      },
    },
    preferences: {
      retrieve: (options?: AgentResourceOptions) =>
        read<AgentPreferences>("/agent/preferences", options),
      update: <S extends "general" | "cost" | "skills" | "notifications">(
        section: S,
        input: Partial<AgentPreferences[S]>,
        options?: AgentResourceOptions,
      ) =>
        patch<AgentPreferences>(
          `/agent/preferences/${segment(section)}`,
          input,
          options,
        ),
    },
  };
}
