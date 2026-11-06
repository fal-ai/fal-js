import { AgentRequestError } from "./errors";
import { agentResponseView } from "./response";
import { createAgentTransport, mutationKey, segment } from "./transport";
import type {
  AgentJson,
  AgentRequestOptions,
  AgentResourceOptions,
  AgentResponse,
  AgentResponseView,
} from "./types";

/** Value type of a template input or of its final output. */
export type AgentTemplateValueType =
  | { kind: "media"; mediaType: string; multiple?: boolean; role?: string }
  | { kind: "scalar"; scalar: string };

export interface AgentTemplateSummary {
  id: string;
  name: string;
  slug: string;
  description?: string;
  currentRevision: number;
  stepCount: number;
  /** Inputs the template asks for on each run. */
  inputs: Array<{ id: string; name: string; type: AgentTemplateValueType }>;
  outputType: AgentTemplateValueType;
  examplePreview?: { url: string; mediaType: string };
  updatedAt: string;
}

export interface AgentTemplatePage {
  items: AgentTemplateSummary[];
  page: number;
  size: number;
  total: number;
  hasAudio: boolean;
}

export interface AgentTemplateQuery {
  query?: string;
  useCase?:
    | "product_ads"
    | "fashion_people"
    | "characters_games"
    | "spaces"
    | "film_stories";
  output?: "image" | "video" | "3d" | "audio";
  sort?: "updated" | "created" | "name";
  /** 1-based page. */
  page?: number;
  /** 1 to 48. */
  limit?: number;
}

/** One input field. Pass its `key` in `templates.run` inputs. */
export interface AgentTemplateInput {
  key: string;
  label: string;
  type: "text" | "number" | "boolean" | "json" | "enum" | "media";
  mediaType?: string;
  multiple?: boolean;
  /** Saved value. An omitted input runs with this value. */
  value?: AgentJson;
  enumOptions?: AgentJson[];
  required?: boolean;
  example?: string;
  exposure: "fixed" | "ask";
}

export interface AgentTemplateStep {
  nodeId: string;
  label: string;
  endpointId: string;
  dependsOn: string[];
}

export interface AgentTemplate {
  id: string;
  name: string;
  slug: string;
  description?: string;
  /** Pass as `version_id` to `templates.run`. */
  versionId: string;
  revision: number;
  outputType: AgentTemplateValueType;
  steps: AgentTemplateStep[];
  inputs: AgentTemplateInput[];
}

export interface AgentTemplateRunInput {
  /** `versionId` from `templates.retrieve`. A changed template is a 409. */
  version_id: string;
  /** Values keyed by input `key`. Media inputs take fal media URLs. */
  inputs?: Record<string, AgentJson>;
}

/** The account's own saved Agent templates. Shared and Explore templates are not listed. */
export function createAgentTemplatesClient(
  request: ReturnType<typeof createAgentTransport>,
) {
  const templates = "/agent/templates";
  const read = <T>(url: string, options: AgentResourceOptions = {}) =>
    request<T>("GET", url, undefined, options);
  return {
    list: (query: AgentTemplateQuery = {}, options?: AgentResourceOptions) =>
      read<AgentTemplatePage>(
        `${templates}?${new URLSearchParams({ input: JSON.stringify(query) })}`,
        options,
      ),
    retrieve: (id: string, options?: AgentResourceOptions) =>
      read<AgentTemplate>(`${templates}/${segment(id)}`, options),
    /** Starts a run. The same idempotency key replays the same run. */
    run: async (
      id: string,
      input: AgentTemplateRunInput,
      options: AgentRequestOptions = {},
    ): Promise<AgentResponseView> => {
      const idempotencyKey = mutationKey(options);
      try {
        return agentResponseView(
          await request<AgentResponse>(
            "POST",
            `${templates}/${segment(id)}/runs`,
            JSON.parse(JSON.stringify(input)),
            { ...options, idempotencyKey },
          ),
        );
      } catch (error) {
        throw new AgentRequestError(error, { idempotencyKey });
      }
    },
  };
}
