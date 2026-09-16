import { AgentProtocolError } from "./errors";
import type {
  AgentArtifact,
  AgentInputRequest,
  AgentMessage,
  AgentResponse,
  AgentResponseView,
} from "./types";

export function isAgentTerminal(response: AgentResponse): boolean {
  return ["completed", "incomplete", "failed", "cancelled"].includes(
    response.status,
  );
}

export function isAgentStopped(response: AgentResponse): boolean {
  return (
    isAgentTerminal(response) || response.fal.phase === "waiting_for_input"
  );
}

/** Check the envelope before using its cursor or making lifecycle decisions. */
export function validateAgentResponse(
  value: unknown,
): asserts value is AgentResponse {
  const r = value as AgentResponse;
  if (
    !r ||
    typeof r.id !== "string" ||
    ![
      "queued",
      "in_progress",
      "completed",
      "incomplete",
      "failed",
      "cancelled",
    ].includes(r.status) ||
    !Array.isArray(r.output) ||
    !r.fal ||
    typeof r.fal.conversation_id !== "string" ||
    ![
      "queued",
      "running",
      "waiting_for_input",
      "cancelling",
      "finished",
    ].includes(r.fal.phase) ||
    !Number.isSafeInteger(r.fal.sequence_number) ||
    r.fal.sequence_number < 0 ||
    !Array.isArray(r.fal.pending_input_ids) ||
    !Array.isArray(r.fal.final_artifact_ids)
  ) {
    throw new AgentProtocolError(
      "Invalid Agent response envelope or snapshot cursor",
    );
  }
  const ids = new Set<string>();
  for (const item of r.output) {
    if (
      !item ||
      typeof item.id !== "string" ||
      typeof item.type !== "string" ||
      ids.has(item.id)
    ) {
      throw new AgentProtocolError(
        "Invalid or duplicate Agent output item identity",
      );
    }
    ids.add(item.id);
    if (
      item.type === "message" &&
      (!Array.isArray(item.content) ||
        item.content.some(
          (part) =>
            !part ||
            typeof part.type !== "string" ||
            (part.type === "output_text" && typeof part.text !== "string") ||
            (part.type === "fal.block" &&
              typeof part.fallback_text !== "string"),
        ))
    ) {
      throw new AgentProtocolError("Invalid Agent message content");
    }
  }
  for (const id of r.fal.pending_input_ids) {
    const item = r.output.find((item) => item.id === id);
    if (
      item?.type !== "fal.input_request" ||
      item.status !== "pending" ||
      !["clarification", "approval", "selection"].includes(item.kind)
    ) {
      throw new AgentProtocolError(
        "Unsupported or missing pending input request",
      );
    }
  }
  for (const id of r.fal.final_artifact_ids) {
    if (
      !r.output.some((item) => item.id === id && item.type === "fal.artifact")
    ) {
      throw new AgentProtocolError("Missing selected final artifact");
    }
  }
  if (
    r.fal.phase === "waiting_for_input" &&
    r.fal.pending_input_ids.length === 0
  ) {
    throw new AgentProtocolError(
      "Waiting response has no pending input request",
    );
  }
}

export function agentResponseView(response: AgentResponse): AgentResponseView {
  validateAgentResponse(response);
  // Getters remain derived even if the caller changes the plain JSON data.
  return Object.defineProperties(
    { ...response },
    {
      output_text: {
        get(this: AgentResponse) {
          return this.output
            .filter((item): item is AgentMessage => item.type === "message")
            .flatMap((item) => item.content)
            .filter((part) => part.type === "output_text")
            .map((part) => ("text" in part ? part.text : ""))
            .join("");
        },
      },
      artifacts: {
        get(this: AgentResponse) {
          return this.output.filter(
            (item): item is AgentArtifact => item.type === "fal.artifact",
          );
        },
      },
      final_artifacts: {
        get(this: AgentResponse) {
          return this.fal.final_artifact_ids.map(
            (id) => this.output.find((item) => item.id === id) as AgentArtifact,
          );
        },
      },
      pending_inputs: {
        get(this: AgentResponse) {
          return this.fal.pending_input_ids.map(
            (id) =>
              this.output.find((item) => item.id === id) as AgentInputRequest,
          );
        },
      },
    },
  ) as AgentResponseView;
}
