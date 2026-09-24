import { createAgentTransport, segment } from "./transport";
import type { AgentConversation, AgentResourceOptions } from "./types";

export type AgentConversationSharePolicy = {
  id: string;
  /** Null or empty recipient lists allow anyone with the share link. */
  policy: {
    version: 1;
    accounts: (
      | { id: string; allUsers: true }
      | { id: string; emails: string[] }
    )[];
    emails: string[];
  } | null;
  expiresAt: string | null;
};

export type AgentConversationSharingInput = {
  allowedAccountIds?: string[];
  emails?: string[];
  scopedAccountId?: string;
  scopedEmails?: string[];
  /** ISO 8601 timestamp. Omit or pass null to remove expiration. */
  expiresAt?: string | null;
};

export function createAgentConversationActionsClient(
  request: ReturnType<typeof createAgentTransport>,
) {
  const path = (id: string) => `/conversations/${segment(id)}`;
  return {
    /** Copy settled history. Project placement completes asynchronously. */
    fork: (
      id: string,
      input: { atMessageId?: string; createProject?: boolean } = {},
      options: AgentResourceOptions = {},
    ) =>
      request<AgentConversation>(
        "POST",
        `${path(id)}/fork`,
        input,
        options,
        undefined,
        false,
        false,
      ),
    sharing: {
      retrieve: (id: string, options: AgentResourceOptions = {}) =>
        request<AgentConversationSharePolicy | null>(
          "GET",
          `${path(id)}/sharing`,
          undefined,
          options,
        ),
      /** Replace the policy. Empty recipients make the link public. */
      update: (
        id: string,
        input: AgentConversationSharingInput,
        options: AgentResourceOptions = {},
      ) =>
        request<AgentConversationSharePolicy>(
          "PATCH",
          `${path(id)}/sharing`,
          input,
          options,
          undefined,
          false,
          false,
        ),
    },
  };
}
