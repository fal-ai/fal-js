/** Experimental Agent contract. Requires a compatible Agent runtime. */
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
        accepted_answers: Array<"approve" | "reject">;
      }
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
      decision: "approve" | "reject";
    };

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

export type AgentPlanUpdate = {
  conversation: string;
  expected_revision: number;
  title?: string;
  steps: Array<{
    id?: string;
    label: string;
    endpoint_id?: string | null;
    model_pinned: boolean;
    requires_approval: boolean;
  }>;
};

/** Draft SSE wire envelope; unknown events trigger authoritative resync. */
export interface AgentEvent {
  type: string;
  sequence_number: number;
  response_id: string;
  response?: AgentResponse;
}

/** Resource mutations are sent once; reconcile uncertain results before retrying. */
export type AgentResourceOptions = Pick<
  AgentRequestOptions,
  "signal" | "timeoutMs"
>;
export interface AgentProject {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}
export interface AgentProjectSummary extends AgentProject {
  chatCount: number;
  assetCount: number;
  attachedAssetCount: number;
  attachedCollectionCount: number;
  attachedCharacterCount: number;
  attachedResourceCount: number;
  assetsByType: { image: number; video: number; audio: number; "3d": number };
  updatedAt: string;
  coverMedia: Array<{ id: string; type: string; url: string }>;
}
export interface AgentProjectConversation {
  id: string;
  title: string | null;
  mediaCount: number;
  updatedAt: string;
}
export interface AgentProjectResources {
  attachedMedia: Array<{
    id: string;
    assetId: string;
    vectorId: string | null;
    type: string;
    source: string;
    url: string;
    title: string | null;
    prompt: string | null;
    createdAt: string;
  }>;
  collections: Array<Record<string, AgentJson>>;
  characters: Array<Record<string, AgentJson>>;
  smartEntities: Array<Record<string, AgentJson>>;
  generatedMedia: Array<Record<string, AgentJson>>;
}
export interface AgentProjectDocumentInput {
  url: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  /** Extracted text, using the same upload/extraction flow as the Agent. */
  text: string;
  pageCount?: number | null;
  truncated?: boolean;
}
export interface AgentProjectDocument {
  id: string;
  assetId: string;
  fileName: string;
  slug: string;
  url: string;
  contentType: string;
  sizeBytes: number;
  charCount: number;
  pageCount: number | null;
  truncated: boolean;
  summary: string | null;
  status: string;
  error: string | null;
  chunkCount: number;
  createdAt: string;
}
export type AgentMemoryKind =
  | "decision"
  | "fact"
  | "preference"
  | "style"
  | "entity";
export interface AgentProjectMemory {
  primer: string | null;
  primerUpdatedAt: string | null;
  notes: Array<{
    id: string;
    kind: AgentMemoryKind | null;
    content: string;
    pinned: boolean;
    sourceChatId: string | null;
    createdAt: string;
  }>;
}

export type AgentGenerationTask =
  | "text-to-image"
  | "text-to-video"
  | "image-to-video"
  | "music"
  | "text-to-speech"
  | "sound-effects"
  | "image-to-3d";
export type AgentGenerationPreferences = {
  aspect_ratio?:
    | "1:1"
    | "16:9"
    | "9:16"
    | "4:3"
    | "3:4"
    | "3:2"
    | "2:3"
    | "21:9";
  resolution?: "720p" | "1080p" | "2K" | "4K";
  duration?: number;
  generate_audio?: boolean;
};
export type AgentGenerationDefaults = {
  preferences: {
    [K in keyof AgentGenerationPreferences]?:
      | AgentGenerationPreferences[K]
      | null;
  };
  preferredModels: Partial<Record<AgentGenerationTask, string | null>>;
};
export type AgentGenerationSettings = {
  version: 1;
  revision: number;
  groups: Partial<
    Record<
      AgentGenerationTask,
      {
        model?: string;
        fields: Record<
          string,
          {
            value:
              | string
              | number
              | boolean
              | string[]
              | { width: number; height: number };
            sourceEndpointId: string;
            label: string;
          }
        >;
      }
    >
  >;
  preferences?: AgentGenerationPreferences;
  preferredModels?: Partial<Record<AgentGenerationTask, string>>;
  preferredModelOverrides?: AgentGenerationDefaults["preferredModels"];
  defaults?: AgentGenerationDefaults;
  reviewBeforeGenerating: boolean;
};
export type AgentDefaultsTarget =
  | { scope: "personal" }
  | { scope: "project"; projectId: string }
  | { scope: "chat"; chatId: string };
export type AgentDefaultsUpdate = {
  changes?: AgentGenerationDefaults;
  inherit?: {
    preferences?: Array<keyof AgentGenerationPreferences>;
    preferredModels?: AgentGenerationTask[];
  };
  expectedLocal: AgentGenerationDefaults;
};
export type AgentDefaultsSource =
  | "personal"
  | "project"
  | "chat"
  | "generation"
  | "auto";
export type AgentDefaultsSources = {
  preferences: Partial<
    Record<keyof AgentGenerationPreferences, AgentDefaultsSource>
  >;
  preferredModels: Partial<Record<AgentGenerationTask, AgentDefaultsSource>>;
};
export type AgentDefaultsView = {
  local: AgentGenerationDefaults;
  inherited: AgentGenerationSettings;
  effective: AgentGenerationSettings;
  sources: AgentDefaultsSources;
  inheritedSources: AgentDefaultsSources;
  revision: number;
  projectId: string | null;
};
export type AgentModel = {
  id: string;
  modelId: string;
  title: string;
  category: string;
  shortDescription: string;
  thumbnailUrl: string | null;
  modelLabId?: string;
  isFavorited: boolean;
};
export type AgentModelCapabilities = {
  endpointId: string;
  label: string;
  category: string;
  modelLabId?: string;
  fields: Array<{
    name: string;
    label: string;
    type: AgentJson;
    description: string;
    required: boolean;
    defaultValue?: string | number | boolean;
    [key: string]: AgentJson | undefined;
  }>;
};
export type AgentPreferences = {
  general: {
    preferredName: string;
    profession:
      | "product_management"
      | "engineering"
      | "human_resources"
      | "finance"
      | "marketing"
      | "sales"
      | "operations"
      | "data_science"
      | "design"
      | "legal"
      | "other"
      | null;
    defaultModel: string | null;
    liveVoice?:
      | "quartz"
      | "ripple"
      | "vesper"
      | "willow"
      | "stone"
      | "gleam"
      | "meridian"
      | "bossa"
      | "tempo"
      | "beacon"
      | "delta"
      | "cinder"
      | null;
    sequencerEnabled?: boolean;
    knowledgeEnabled?: boolean;
  };
  cost: {
    confirmImage: boolean;
    confirmVideo: boolean;
    confirmAudio: boolean;
    confirm3d: boolean;
    alwaysConfirmAudio: boolean;
    alwaysConfirm3d: boolean;
    safetyCapUsd: number;
  };
  skills: {
    enabled: boolean;
    disabledPresetNames: string[];
    disabledFalSkillIds: string[];
    disabledSkillIds: string[];
  };
  notifications: { turnComplete: boolean };
  preferredModels?: Partial<Record<AgentGenerationTask, string>>;
  generationPreferences?: AgentGenerationPreferences;
};

export type AgentQueueItem = {
  turnId: string;
  qlane: "user" | "drawer";
  kind: "prompt" | "continuation";
  prompt?: string;
  stepLabel?: string;
  position: number;
  requiresApproval: boolean;
  parked: boolean;
  halted: boolean;
  planStep?: {
    planBlockId: string;
    planExecutionId: string;
    planStepId: string;
    planStepOrder: number;
  };
};
export type AgentQueueDispatch = {
  promoted: boolean;
  turnId?: string;
  assistantMessageId?: string;
  requeued?: boolean;
  reason?: string;
};
export type AgentRunView = {
  operation: AgentOperation;
  artifacts: AgentArtifact[];
  input_requests: AgentInputRequest[];
};

/** Billed generation costs only. Unpriced requests and LLM usage are not included in totals. */
export type AgentGenerationSummary = {
  counts: { image: number; video: number; audio: number; model3d: number };
  costsNanoUsd: {
    image: number;
    video: number;
    audio: number;
    model3d: number;
  };
  models: Array<{
    endpointId: string;
    modality: "image" | "video" | "audio" | "model3d" | null;
    count: number;
    costNanoUsd: number;
    title: string | null;
    modelLabId: string | null;
  }>;
  totalCount: number;
  totalCostNanoUsd: number;
  pricedRequestCount: number;
  unpricedRequestCount: number;
};
