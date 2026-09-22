import { createAgentTransport, segment } from "./transport";
import type { AgentResourceOptions } from "./types";

export interface AgentConnectorApp {
  slug: string;
  name: string;
  description: string;
  category: string;
  tools?: string[];
  logoPath?: string;
}
export interface AgentConnector {
  id: string;
  appSlug: string;
  accountId: string;
  enabled: boolean;
  status: "connected" | "revoked" | "error";
  createdAt: string;
  app: AgentConnectorApp | null;
}
export function createAgentConnectorsClient(
  request: ReturnType<typeof createAgentTransport>,
) {
  const write = <T>(
    method: "POST" | "DELETE",
    path: string,
    input: unknown,
    options?: AgentResourceOptions,
  ) =>
    request<T>(
      method,
      `/agent/connectors${path}`,
      input,
      options,
      undefined,
      false,
      false,
    );
  return {
    apps: (options?: AgentResourceOptions) =>
      request<{ configured: boolean; apps: AgentConnectorApp[] }>(
        "GET",
        "/agent/connectors/apps",
        undefined,
        options,
      ),
    list: (
      filter: { reconcile?: boolean } = {},
      options?: AgentResourceOptions,
    ) =>
      request<AgentConnector[]>(
        "GET",
        `/agent/connectors?reconcile=${filter.reconcile === true}`,
        undefined,
        options,
      ),
    beginConnect: (
      input: { appSlug: string },
      options?: AgentResourceOptions,
    ) =>
      write<{
        token: string;
        expiresAt: string;
        connectLinkUrl: string;
        appSlug: string;
      }>("POST", "/begin", input, options),
    completeConnect: (
      input: { appSlug: string; accountId: string },
      options?: AgentResourceOptions,
    ) => write<AgentConnector>("POST", "/complete", input, options),
    setEnabled: (
      id: string,
      enabled: boolean,
      options?: AgentResourceOptions,
    ) =>
      write<AgentConnector>(
        "POST",
        `/${segment(id)}/enabled`,
        { enabled },
        options,
      ),
    disconnect: (id: string, options?: AgentResourceOptions) =>
      write<{ id: string }>("DELETE", `/${segment(id)}`, undefined, options),
  };
}
