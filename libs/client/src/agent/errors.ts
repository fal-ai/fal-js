import type { AgentResponseView } from "./types";

/** A client/transport error, distinct from a failed accepted Agent response. */
export class AgentRequestError extends Error {
  readonly cause: unknown;
  readonly responseId?: string;
  readonly idempotencyKey?: string;
  readonly lastResponse?: AgentResponseView;
  readonly status?: number;
  /** Stable server error code, such as `idempotency_key_in_use`. */
  readonly code?: string;
  readonly reason?: string;
  /** Server hint for when a retry with the same key can succeed. */
  readonly retryAfterSeconds?: number;

  constructor(
    cause: unknown,
    context: {
      responseId?: string;
      idempotencyKey?: string;
      lastResponse?: AgentResponseView;
    } = {},
  ) {
    const body =
      cause && typeof cause === "object" && "body" in cause
        ? cause.body
        : undefined;
    const detail =
      body && typeof body === "object" && "error" in body
        ? body.error
        : undefined;
    const message =
      detail &&
      typeof detail === "object" &&
      "message" in detail &&
      typeof detail.message === "string"
        ? detail.message
        : undefined;
    super(message ?? (cause instanceof Error ? cause.message : String(cause)));
    this.name = "AgentRequestError";
    this.cause = cause;
    this.responseId = context.responseId;
    this.idempotencyKey = context.idempotencyKey;
    this.lastResponse = context.lastResponse;
    this.status =
      cause && typeof cause === "object" && "status" in cause
        ? (cause as { status: number }).status
        : undefined;
    const field = (name: string) =>
      detail && typeof detail === "object" && name in detail
        ? (detail as Record<string, unknown>)[name]
        : undefined;
    const code = field("code");
    const reason = field("reason");
    const retryAfter = field("retry_after_seconds");
    // Helpers rewrap transport errors to add context; keep the server fields.
    const inner = cause instanceof AgentRequestError ? cause : undefined;
    this.code = typeof code === "string" ? code : inner?.code;
    this.reason = typeof reason === "string" ? reason : inner?.reason;
    this.retryAfterSeconds =
      typeof retryAfter === "number" ? retryAfter : inner?.retryAfterSeconds;
  }
}

export class AgentProtocolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AgentProtocolError";
  }
}
