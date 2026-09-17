/** Experimental Agent contract. Requires a backend implementing agent/README.md. */
export type AgentStatus =
  | "queued"
  | "in_progress"
  | "completed"
  | "incomplete"
  | "failed"
  | "cancelled";

export type AgentJson =
  | null
  | boolean
  | number
  | string
  | AgentJson[]
  | { [key: string]: AgentJson };

export interface AgentFailure {
  code: string;
  message: string;
}

export type AgentPlanStep = {
  id: string;
  label: string;
  detail?: string;
  endpoint_id?: string;
  model_pinned?: boolean;
  requires_approval?: boolean;
};

export interface AgentBlock {
  type: "fal.block";
  id: string;
  /** Unknown block kinds retain a readable fallback. */
  kind: string;
  revision: number;
  fallback_text: string;
  data: AgentJson;
}

export interface AgentPlanBlock extends Omit<AgentBlock, "data"> {
  kind: "plan";
  data: { title?: string; steps: AgentPlanStep[] };
}

export interface AgentText {
  type: "output_text";
  text: string;
  annotations: AgentJson[];
}

export interface AgentMessage {
  id: string;
  type: "message";
  role: "assistant";
  status: "in_progress" | "completed" | "incomplete";
  content: Array<AgentText | AgentBlock>;
}

export interface AgentOperation {
  id: string;
  type: "fal.operation";
  kind: string;
  name: string;
  status: "queued" | "in_progress" | "completed" | "failed" | "cancelled";
  parent_id?: string;
  /** Present when this operation supports versioned user edits. */
  revision?: number;
  capabilities?: Array<"rename" | "move_after">;
  artifact_ids: string[];
  error: AgentFailure | null;
  progress?: { completed: number; total?: number; message?: string };
}

export interface AgentArtifact {
  id: string;
  type: "fal.artifact";
  kind: "media" | "file" | "data" | "composition";
  media_type?: "image" | "video" | "audio" | "3d";
  revision: number;
  produced_by?: string;
  files?: Array<{
    role: string;
    url: string;
    mime_type: string;
    url_expires_at?: string | null;
  }>;
  data?: AgentJson;
  metadata?: Record<string, AgentJson>;
}

export interface AgentQuestion {
  id: string;
  text: string;
  multiple: boolean;
  options: Array<{ id: string; label: string; description?: string }>;
  allow_text: boolean;
}

interface InputRequestBase {
  id: string;
  type: "fal.input_request";
  status: "pending" | "answered" | "rejected" | "expired" | "cancelled";
  prompt: string;
  expires_at?: string;
}

export type AgentInputRequest = InputRequestBase &
  (
    | { kind: "clarification"; questions: AgentQuestion[] }
    | {
        kind: "approval";
        target: { item_id: string; revision: number };
        accepted_answers: Array<"approve" | "reject" | "request_changes">;
      }
    | { kind: "selection"; artifact_ids: string[]; multiple: boolean }
  );

export type AgentAnswer =
  | {
      kind: "answers";
      answers: Array<{
        question_id: string;
        selected_option_ids: string[];
        text?: string;
      }>;
    }
  | {
      kind: "approval";
      decision: "approve" | "reject" | "request_changes";
      text?: string;
    }
  | { kind: "selection"; artifact_ids: string[] };

export type AgentOutputItem =
  | AgentMessage
  | AgentOperation
  | AgentArtifact
  | AgentInputRequest;

export interface AgentResponse {
  id: string;
  status: AgentStatus;
  output: AgentOutputItem[];
  error: AgentFailure | null;
  usage: {
    input_tokens?: number;
    output_tokens?: number;
    cost?: {
      currency: "USD";
      estimated?: number | null;
      reserved?: number | null;
      settled?: number | null;
    };
  } | null;
  fal: {
    conversation_id: string;
    phase:
      | "queued"
      | "running"
      | "waiting_for_input"
      | "cancelling"
      | "finished";
    /** Cursor for all changes reflected in this atomic snapshot. */
    sequence_number: number;
    pending_input_ids: string[];
    final_artifact_ids: string[];
  };
}

/** Derived views are computed from output and never sent back to the server. */
export interface AgentResponseView extends AgentResponse {
  readonly output_text: string;
  readonly artifacts: AgentArtifact[];
  readonly final_artifacts: AgentArtifact[];
  readonly pending_inputs: AgentInputRequest[];
}

export type AgentInputContent =
  | { type: "input_text"; text: string }
  | { type: "input_image"; image_url: string }
  | { type: "input_file"; file_url: string; mime_type?: string }
  | { type: "fal.input_artifact"; artifact_id: string; revision?: number };

export type AgentRequest = {
  input: string | Array<{ role: "user"; content: AgentInputContent[] }>;
  instructions?: string;
  fal?: {
    max_cost_usd?: number;
    on_ambiguity?: "ask" | "assume" | "fail";
  };
} & (
  | { conversation?: string; previous_response_id?: never }
  | { conversation?: never; previous_response_id?: string }
);

export interface AgentRequestOptions {
  /** Aborts local observation/request only, never server execution. */
  signal?: AbortSignal;
  /** Local deadline for the entire helper, including retries and waiting. */
  timeoutMs?: number;
  /** Reuse across process restarts to recover one logical mutation. */
  idempotencyKey?: string;
}

export interface AgentRunOptions extends AgentRequestOptions {
  pollIntervalMs?: number;
  /** Called once after acceptance, before the helper begins observing. */
  onAccepted?: (response: AgentResponseView) => void;
}

export interface AgentStreamOptions extends AgentRunOptions {
  /** Maximum consecutive failed/disconnected observation attempts. */
  maxReconnects?: number;
  reconnectDelayMs?: number;
}

export interface AgentConfig {
  /** Explicit opt-in: URL ending in /v1 of a compatible draft server. */
  baseUrl: string;
}

export interface AgentPage<T> {
  data: T[];
  next_cursor: string | null;
}

export interface AgentPageOptions extends AgentRequestOptions {
  cursor?: string;
  limit?: number;
}

export interface AgentConversation {
  id: string;
  title: string | null;
  active_response_ids: string[];
}

export type AgentConversationItem = {
  id: string;
  response_id: string | null;
  sequence_number: number;
} & (
  | { type: "input"; input: AgentRequest["input"] }
  | {
      type: "answer";
      input_request_id: string;
      answer: AgentAnswer;
    }
  | { type: "output"; item: AgentOutputItem }
);

export type AgentPlanChange =
  | { type: "rename_plan"; title: string }
  | { type: "rename_step"; step_id: string; label: string }
  | { type: "remove_step"; step_id: string }
  | { type: "reorder_steps"; step_ids: string[] }
  | {
      type: "add_step";
      after_step_id?: string;
      step: Omit<AgentPlanStep, "id" | "detail">;
    }
  | { type: "set_checkpoint"; step_id: string; requires_approval: boolean }
  | { type: "pin_model"; step_id: string; endpoint_id: string | null };

export type AgentOperationChange =
  | { type: "rename"; label: string }
  | { type: "move_after"; operation_id: string | null };

/** Draft SSE wire envelope; unknown events trigger authoritative resync. */
export interface AgentEvent {
  type: string;
  sequence_number: number;
  response_id: string;
  response?: AgentResponse;
  item?: AgentOutputItem;
  output_index?: number;
  item_id?: string;
  content_index?: number;
  part?: AgentText | AgentBlock;
  delta?: string;
}
