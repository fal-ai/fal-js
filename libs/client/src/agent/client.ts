import type { RequiredConfig } from "../config";
import { AgentProtocolError, AgentRequestError } from "./errors";
import { reduceAgentEvent } from "./reducer";
import { agentResponseView, isAgentStopped } from "./response";
import { agentEvents } from "./stream";
import {
  createAgentTransport,
  mutationKey,
  observation,
  pause,
  segment,
  throwIfAborted,
} from "./transport";
import type {
  AgentAnswer,
  AgentArtifact,
  AgentConversation,
  AgentConversationItem,
  AgentOperation,
  AgentOperationChange,
  AgentPage,
  AgentPageOptions,
  AgentPlanBlock,
  AgentPlanChange,
  AgentRequest,
  AgentRequestOptions,
  AgentResponse,
  AgentResponseView,
  AgentRunOptions,
  AgentStreamOptions,
} from "./types";

export interface AgentResponsesClient {
  create(
    request: AgentRequest,
    options?: AgentRequestOptions,
  ): Promise<AgentResponseView>;
  retrieve(
    id: string,
    options?: AgentRequestOptions,
  ): Promise<AgentResponseView>;
  wait(id: string, options?: AgentRunOptions): Promise<AgentResponseView>;
  stream(
    id: string,
    options?: AgentStreamOptions,
  ): AsyncIterable<AgentResponseView>;
  answer(
    id: string,
    input: { input_request_id: string; answer: AgentAnswer },
    options?: AgentRequestOptions,
  ): Promise<AgentResponseView>;
  cancel(id: string, options?: AgentRequestOptions): Promise<AgentResponseView>;
}

export interface AgentClient {
  run(
    request: AgentRequest,
    options?: AgentRunOptions,
  ): Promise<AgentResponseView>;
  stream(
    request: AgentRequest,
    options?: AgentStreamOptions,
  ): AsyncIterable<AgentResponseView>;
  readonly responses: AgentResponsesClient;
  readonly conversations: {
    list(options?: AgentPageOptions): Promise<AgentPage<AgentConversation>>;
    retrieve(
      id: string,
      options?: AgentRequestOptions,
    ): Promise<AgentConversation>;
    update(
      id: string,
      change: { title: string },
      options?: AgentRequestOptions,
    ): Promise<AgentConversation>;
    delete(
      id: string,
      options?: AgentRequestOptions,
    ): Promise<{ id: string; deleted: boolean }>;
    items: {
      list(
        id: string,
        options?: AgentPageOptions,
      ): Promise<AgentPage<AgentConversationItem>>;
    };
  };
  readonly plans: {
    retrieve(
      id: string,
      options: AgentRequestOptions & { conversation: string },
    ): Promise<AgentPlanBlock>;
    run(
      id: string,
      input: { conversation: string; expected_revision: number },
      options?: AgentRequestOptions,
    ): Promise<AgentResponseView>;
    update(
      id: string,
      change: {
        conversation: string;
        expected_revision: number;
        changes: AgentPlanChange[];
      },
      options?: AgentRequestOptions,
    ): Promise<AgentPlanBlock>;
  };
  readonly operations: {
    update(
      id: string,
      change: { expected_revision: number; changes: AgentOperationChange[] },
      options?: AgentRequestOptions,
    ): Promise<AgentOperation>;
  };
  readonly artifacts: {
    retrieve(
      id: string,
      options?: AgentRequestOptions & { revision?: number },
    ): Promise<AgentArtifact>;
  };
}

function interval(
  value: number | undefined,
  fallback: number,
  name: string,
): number {
  if (value === undefined) return fallback;
  if (!Number.isFinite(value) || value < 0)
    throw new TypeError(`${name} must be a nonnegative finite number`);
  return value;
}

function pageQuery(options: AgentPageOptions): string {
  const query = new URLSearchParams();
  if (options.cursor) query.set("cursor", options.cursor);
  if (options.limit !== undefined) {
    if (
      !Number.isInteger(options.limit) ||
      options.limit < 1 ||
      options.limit > 100
    )
      throw new TypeError("limit must be an integer between 1 and 100");
    query.set("limit", String(options.limit));
  }
  return query.size ? `?${query}` : "";
}

function localError(
  error: unknown,
  last?: AgentResponseView,
  id?: string,
): AgentRequestError {
  return new AgentRequestError(error, {
    responseId:
      last?.id ??
      id ??
      (error instanceof AgentRequestError ? error.responseId : undefined),
    idempotencyKey:
      error instanceof AgentRequestError ? error.idempotencyKey : undefined,
    lastResponse: last,
  });
}

/** Create the experimental SDK without importing the private Agent runtime. */
export function createAgentClient(config: RequiredConfig): AgentClient {
  const request = createAgentTransport(config);
  const read = <T>(
    path: string,
    options: AgentRequestOptions = {},
    responseId?: string,
  ) => request<T>("GET", path, undefined, options, responseId);
  const mutate = <T>(
    method: string,
    path: string,
    body: unknown,
    options: AgentRequestOptions = {},
    responseId?: string,
  ) =>
    request<T>(
      method,
      path,
      body === undefined ? undefined : JSON.parse(JSON.stringify(body)),
      { ...options, idempotencyKey: mutationKey(options) },
      responseId,
    );
  const snapshot = async (id: string, options: AgentRequestOptions = {}) => {
    try {
      const response = await read<AgentResponse>(
        `/responses/${segment(id)}`,
        options,
        id,
      );
      const view = agentResponseView(response);
      if (view.id !== id)
        throw new AgentProtocolError("Retrieved response has a different ID");
      return view;
    } catch (error) {
      throw localError(error, undefined, id);
    }
  };

  const mutateResponse = async (
    id: string,
    action: string,
    input: unknown,
    options: AgentRequestOptions,
  ) => {
    const idempotencyKey = mutationKey(options);
    try {
      const view = agentResponseView(
        await mutate<AgentResponse>(
          "POST",
          `/responses/${segment(id)}/${action}`,
          input,
          { ...options, idempotencyKey },
          id,
        ),
      );
      if (view.id !== id)
        throw new AgentProtocolError("Updated response has a different ID");
      return view;
    } catch (error) {
      throw new AgentRequestError(error, { responseId: id, idempotencyKey });
    }
  };

  const responses: AgentResponsesClient = {
    async create(input, options = {}) {
      if (input.conversation && input.previous_response_id)
        throw new TypeError(
          "Choose conversation or previous_response_id, not both",
        );
      if (
        input.fal?.max_cost_usd !== undefined &&
        (!Number.isFinite(input.fal.max_cost_usd) || input.fal.max_cost_usd < 0)
      )
        throw new TypeError("max_cost_usd must be a nonnegative finite number");
      const idempotencyKey = mutationKey(options);
      try {
        return agentResponseView(
          await mutate<AgentResponse>(
            "POST",
            "/responses",
            { ...input, background: true },
            { ...options, idempotencyKey },
          ),
        );
      } catch (error) {
        throw new AgentRequestError(error, { idempotencyKey });
      }
    },
    retrieve: snapshot,
    async answer(id, input, options = {}) {
      return mutateResponse(id, "input", input, options);
    },
    async cancel(id, options = {}) {
      return mutateResponse(id, "cancel", {}, options);
    },
    async wait(id, options = {}) {
      const poll = interval(options.pollIntervalMs, 1000, "pollIntervalMs");
      const scope = observation(options);
      let last: AgentResponseView | undefined;
      try {
        for (;;) {
          last = await snapshot(id, { signal: scope.signal });
          if (isAgentStopped(last)) return last;
          await pause(poll, scope.signal);
        }
      } catch (error) {
        throw localError(error, last, id);
      } finally {
        scope.close();
      }
    },
    async *stream(id, options = {}) {
      const reconnectDelay = interval(
        options.reconnectDelayMs,
        500,
        "reconnectDelayMs",
      );
      const maxReconnects = options.maxReconnects ?? 3;
      if (!Number.isInteger(maxReconnects) || maxReconnects < 0)
        throw new TypeError("maxReconnects must be a nonnegative integer");
      const scope = observation(options);
      let current: AgentResponseView | undefined;
      try {
        current = await snapshot(id, { signal: scope.signal });
        yield current;
        let failures = 0;
        while (!isAgentStopped(current)) {
          throwIfAborted(scope.signal);
          const cursor = current.fal.sequence_number;
          try {
            const http = await request<Response>(
              "GET",
              `/responses/${segment(id)}?stream=true&starting_after=${cursor}`,
              undefined,
              { signal: scope.signal },
              id,
              true,
            );
            for await (const event of agentEvents(http, scope.signal)) {
              const next = reduceAgentEvent(current, event);
              if (!next) break;
              if (next === current) continue;
              current = agentResponseView(next);
              yield current;
              if (isAgentStopped(current)) return;
            }
          } catch (error) {
            const status =
              error instanceof AgentRequestError ? error.status : undefined;
            if (
              scope.signal.aborted ||
              error instanceof AgentProtocolError ||
              (error instanceof AgentRequestError &&
                error.cause instanceof AgentProtocolError) ||
              (status !== undefined &&
                ![408, 410, 429, 500, 502, 503, 504].includes(status))
            )
              throw error;
          }
          // EOF, expired cursor, an unknown event, or a gap: reconcile with a
          // snapshot whose cursor covers every included state change.
          const latest = await snapshot(id, { signal: scope.signal });
          if (latest.fal.sequence_number < current.fal.sequence_number)
            throw new AgentProtocolError(
              "Agent snapshot cursor moved backwards",
            );
          if (latest.fal.sequence_number > current.fal.sequence_number) {
            current = latest;
            yield current;
          }
          if (isAgentStopped(current)) return;
          failures = current.fal.sequence_number > cursor ? 0 : failures + 1;
          if (failures > maxReconnects)
            throw new Error(
              "Agent stream disconnected repeatedly; retrieve the response to continue",
            );
          // Backoff also prevents a busy loop on successful empty streams.
          await pause(reconnectDelay, scope.signal);
        }
      } catch (error) {
        throw localError(error, current, id);
      } finally {
        scope.close();
      }
    },
  };

  const client: AgentClient = {
    responses,
    async run(input, options = {}) {
      const scope = observation(options);
      let accepted: AgentResponseView | undefined;
      try {
        accepted = await responses.create(input, {
          ...options,
          timeoutMs: undefined,
          signal: scope.signal,
        });
        options.onAccepted?.(accepted);
        if (isAgentStopped(accepted)) return accepted;
        return await responses.wait(accepted.id, {
          ...options,
          timeoutMs: undefined,
          signal: scope.signal,
        });
      } catch (error) {
        throw localError(
          error,
          error instanceof AgentRequestError
            ? (error.lastResponse ?? accepted)
            : accepted,
        );
      } finally {
        scope.close();
      }
    },
    async *stream(input, options = {}) {
      const scope = observation(options);
      let accepted: AgentResponseView | undefined;
      try {
        accepted = await responses.create(input, {
          ...options,
          timeoutMs: undefined,
          signal: scope.signal,
        });
        options.onAccepted?.(accepted);
        yield accepted;
        if (!isAgentStopped(accepted)) {
          let cursor = accepted.fal.sequence_number;
          for await (const response of responses.stream(accepted.id, {
            ...options,
            timeoutMs: undefined,
            signal: scope.signal,
          })) {
            if (response.fal.sequence_number <= cursor) continue;
            cursor = response.fal.sequence_number;
            yield response;
          }
        }
      } catch (error) {
        throw localError(
          error,
          error instanceof AgentRequestError
            ? (error.lastResponse ?? accepted)
            : accepted,
        );
      } finally {
        scope.close();
      }
    },
    conversations: {
      list: (options = {}) =>
        read(`/conversations${pageQuery(options)}`, options),
      retrieve: (id, options) => read(`/conversations/${segment(id)}`, options),
      update: (id, change, options) =>
        mutate("PATCH", `/conversations/${segment(id)}`, change, options),
      delete: (id, options) =>
        mutate("DELETE", `/conversations/${segment(id)}`, undefined, options),
      items: {
        list: (id, options = {}) =>
          read(
            `/conversations/${segment(id)}/items${pageQuery(options)}`,
            options,
          ),
      },
    },
    plans: {
      retrieve: (id, options) =>
        read(
          `/agent/plans/${segment(id)}?conversation=${encodeURIComponent(options.conversation)}`,
          options,
        ),
      run: async (id, input, options) =>
        agentResponseView(
          await mutate<AgentResponse>(
            "POST",
            `/agent/plans/${segment(id)}/run`,
            input,
            options,
          ),
        ),
      update: (id, change, options) =>
        mutate("PATCH", `/agent/plans/${segment(id)}`, change, options),
    },
    operations: {
      update: (id, change, options) =>
        mutate("PATCH", `/agent/operations/${segment(id)}`, change, options),
    },
    artifacts: {
      retrieve: (id, options = {}) => {
        if (
          options.revision !== undefined &&
          (!Number.isInteger(options.revision) || options.revision < 1)
        )
          throw new TypeError("revision must be a positive integer");
        return read(
          `/agent/artifacts/${segment(id)}${options.revision === undefined ? "" : `?revision=${options.revision}`}`,
          options,
        );
      },
    },
  };
  return client;
}
