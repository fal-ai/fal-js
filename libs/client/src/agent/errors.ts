import type { AgentResponseView } from "./types";

/** A client/transport error, distinct from a failed accepted Agent response. */
export class AgentRequestError extends Error {
  readonly cause: unknown;
  readonly responseId?: string;
  readonly idempotencyKey?: string;
  readonly lastResponse?: AgentResponseView;
  readonly status?: number;

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
  }
}

export class AgentProtocolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AgentProtocolError";
  }
}
