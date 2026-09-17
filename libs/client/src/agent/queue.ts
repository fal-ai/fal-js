import { createAgentTransport, segment } from "./transport";
import type {
  AgentQueueDispatch,
  AgentQueueItem,
  AgentResourceOptions,
  AgentRunView,
} from "./types";

export function createAgentQueueClient(
  request: ReturnType<typeof createAgentTransport>,
) {
  const path = (conversation: string) =>
    `/agent/queues/${segment(conversation)}`;
  const runPath = (id: string, conversation: string, action = "") =>
    `/agent/runs/${segment(id)}${action ? `/${action}` : ""}?${new URLSearchParams({ conversation })}`;
  const read = <T>(url: string, options: AgentResourceOptions = {}) =>
    request<T>("GET", url, undefined, options);
  // Retry can submit another paid attempt. A lost acknowledgement must surface.
  const post = <T>(
    url: string,
    input: unknown,
    options: AgentResourceOptions = {},
  ) => request<T>("POST", url, input, options, undefined, false, false);
  return {
    queue: {
      retrieve: (conversation: string, options?: AgentResourceOptions) =>
        read<{ items: AgentQueueItem[]; active_turn_ids: string[] }>(
          path(conversation),
          options,
        ),
      setHalted: (
        conversation: string,
        halted: boolean,
        options?: AgentResourceOptions,
      ) =>
        post<{ updatedCount: number; dispatch: AgentQueueDispatch | null }>(
          `${path(conversation)}/halt`,
          { halted },
          options,
        ),
      reorder: (
        conversation: string,
        turnIds: string[],
        options?: AgentResourceOptions,
      ) =>
        post<{ success: boolean }>(
          `${path(conversation)}/reorder`,
          { turnIds },
          options,
        ),
      dispatch: (conversation: string, options?: AgentResourceOptions) =>
        post<AgentQueueDispatch>(
          `${path(conversation)}/dispatch`,
          undefined,
          options,
        ),
      edit: (
        conversation: string,
        turnId: string,
        content: string,
        options?: AgentResourceOptions,
      ) =>
        post<{ success: boolean }>(
          `${path(conversation)}/turns/${segment(turnId)}/edit`,
          { content },
          options,
        ),
      cancel: (
        conversation: string,
        turnId: string,
        options?: AgentResourceOptions,
      ) =>
        post<{ success: boolean }>(
          `${path(conversation)}/turns/${segment(turnId)}/cancel`,
          undefined,
          options,
        ),
      setApproval: (
        conversation: string,
        turnId: string,
        input: { requiresApproval: boolean; approveCheckpoints?: boolean },
        options?: AgentResourceOptions,
      ) =>
        post<{ updated: boolean; dispatch: AgentQueueDispatch | null }>(
          `${path(conversation)}/turns/${segment(turnId)}/approval`,
          input,
          options,
        ),
      run: (
        conversation: string,
        turnId: string,
        options?: AgentResourceOptions,
      ) =>
        post<AgentQueueDispatch>(
          `${path(conversation)}/turns/${segment(turnId)}/run`,
          undefined,
          options,
        ),
    },
    runs: {
      retrieve: (
        id: string,
        conversation: string,
        options?: AgentResourceOptions,
      ) => read<AgentRunView>(runPath(id, conversation), options),
      retry: (
        id: string,
        conversation: string,
        options?: AgentResourceOptions,
      ) =>
        post<{
          mediaId: string;
          runId: string;
          attempt: number;
          requestId: string;
          approvalRequired?: boolean;
        }>(runPath(id, conversation, "retry"), undefined, options),
      cancel: (
        id: string,
        conversation: string,
        options?: AgentResourceOptions,
      ) =>
        post<{ cancelled: boolean }>(
          runPath(id, conversation, "cancel"),
          undefined,
          options,
        ),
      answer: (
        id: string,
        conversation: string,
        input: { input_request_id: string; decision: "approve" | "reject" },
        options?: AgentResourceOptions,
      ) =>
        post<{
          submittedCount?: number;
          failedCount?: number;
          cancelledCount?: number;
        }>(runPath(id, conversation, "answer"), input, options),
    },
  };
}
