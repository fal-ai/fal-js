import { createParser } from "eventsource-parser";
import { getTemporaryAuthToken } from "./auth";
import { RequiredConfig } from "./config";
import { buildUrl, dispatchRequest } from "./request";
import { ApiError, defaultResponseHandler } from "./response";
import { type StorageClient } from "./storage";
import { EndpointType, InputType, OutputType } from "./types/client";

export type StreamingConnectionMode = "client" | "server";

const CONTENT_TYPE_EVENT_STREAM = "text/event-stream";

/**
 * The stream API options. It requires the API input and also
 * offers configuration options.
 */
export type StreamOptions<Input> = {
  /**
   * The endpoint URL. If not provided, it will be generated from the
   * `endpointId` and the `queryParams`.
   */
  readonly url?: string;

  /**
   * The API input payload.
   */
  readonly input?: Input;

  /**
   * The query parameters to be sent with the request.
   */
  readonly queryParams?: Record<string, string>;

  /**
   * The maximum time interval in milliseconds between stream chunks. Defaults to 15s.
   */
  readonly timeout?: number;

  /**
   * Whether it should auto-upload File-like types to fal's storage
   * or not.
   */
  readonly autoUpload?: boolean;

  /**
   * The HTTP method, defaults to `post`;
   */
  readonly method?: "get" | "post" | "put" | "delete" | string;

  /**
   * The content type the client accepts as response.
   * By default this is set to `text/event-stream`.
   */
  readonly accept?: string;

  /**
   * The streaming connection mode. This is used to determine
   * whether the streaming will be done from the browser itself (client)
   * or through your own server, either when running on NodeJS or when
   * using a proxy that supports streaming.
   *
   * It defaults to `server`. Set to `client` if your server proxy doesn't
   * support streaming.
   */
  readonly connectionMode?: StreamingConnectionMode;

  /**
   * The signal to abort the request.
   */
  readonly signal?: AbortSignal;
};

const EVENT_STREAM_TIMEOUT = 15 * 1000;

type FalStreamEventType = "data" | "error" | "done";

type EventHandler<T = any> = (event: T) => void;

/**
 * The class representing a streaming response. With t
 */
export class FalStream<Input, Output> {
  // properties
  config: RequiredConfig;
  endpointId: string;
  url: string;
  options: StreamOptions<Input>;

  // support for event listeners
  private listeners: Map<FalStreamEventType, EventHandler[]> = new Map();
  private buffer: Output[] = [];

  // local state
  private currentData: Output | undefined = undefined;
  private lastEventTimestamp = 0;
  private streamClosed = false;
  private _requestId: string | null = null;
  private donePromise: Promise<Output>;

  private abortController = new AbortController();

  constructor(
    endpointId: string,
    config: RequiredConfig,
    options: StreamOptions<Input>,
  ) {
    this.endpointId = endpointId;
    this.config = config;
    this.url =
      options.url ??
      buildUrl(endpointId, {
        path: "/stream",
        query: options.queryParams,
      });
    this.options = options;
    this.donePromise = new Promise<Output>((resolve, reject) => {
      if (this.streamClosed) {
        reject(
          new ApiError({
            message: "Streaming connection is already closed.",
            status: 400,
            body: undefined,
          }),
        );
      }
      this.signal.addEventListener("abort", () => {
        resolve(this.currentData ?? ({} as Output));
      });
      this.on("done", (data) => {
        this.streamClosed = true;
        resolve(data);
      });
      this.on("error", (error) => {
        this.streamClosed = true;
        reject(error);
      });
    });
    // if a abort signal was passed, sync it with the internal one
    if (options.signal) {
      options.signal.addEventListener("abort", () => {
        this.abortController.abort();
      });
    }

    // start the streaming request
    this.start().catch(this.handleError);
  }

  private start = async () => {
    const { endpointId, options } = this;
    const { input, method = "post", connectionMode = "server" } = options;
    try {
      if (connectionMode === "client") {
        // if we are in the browser, we need to get a temporary token
        // to authenticate the request
        const token = await getTemporaryAuthToken(endpointId, this.config);
        const { fetch } = this.config;
        const parsedUrl = new URL(this.url);
        parsedUrl.searchParams.set("fal_jwt_token", token);
        const response = await fetch(parsedUrl.toString(), {
          method: method.toUpperCase(),
          headers: {
            accept: options.accept ?? CONTENT_TYPE_EVENT_STREAM,
            "content-type": "application/json",
          },
          body: input && method !== "get" ? JSON.stringify(input) : undefined,
          signal: this.abortController.signal,
        });
        this._requestId = response.headers.get("x-fal-request-id");
        return await this.handleResponse(response);
      }
      return await dispatchRequest({
        method: method.toUpperCase(),
        targetUrl: this.url,
        input,
        config: this.config,
        options: {
          headers: {
            accept: options.accept ?? CONTENT_TYPE_EVENT_STREAM,
          },
          responseHandler: async (response) => {
            this._requestId = response.headers.get("x-fal-request-id");
            return await this.handleResponse(response);
          },
          signal: this.abortController.signal,
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  };

  private handleResponse = async (response: Response) => {
    if (!response.ok) {
      try {
        // we know the response failed, call the response handler
        // so the exception gets converted to ApiError correctly
        await defaultResponseHandler(response);
      } catch (error) {
        this.emit("error", error);
      }
      return;
    }

    const body = response.body;
    if (!body) {
      this.emit(
        "error",
        new ApiError({
          message: "Response body is empty.",
          status: 400,
          body: undefined,
        }),
      );
      return;
    }

    const isEventStream = (
      response.headers.get("content-type") ?? ""
    ).startsWith(CONTENT_TYPE_EVENT_STREAM);
    // any response that is not a text/event-stream will be handled as a binary stream
    if (!isEventStream) {
      const reader = body.getReader();
      const emitRawChunk = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            this.emit("done", this.currentData);
            return;
          }
          this.currentData = value as Output;
          this.emit("data", value);
          emitRawChunk();
        });
      };
      emitRawChunk();
      return;
    }

    const decoder = new TextDecoder("utf-8");
    const reader = response.body.getReader();

    const parser = createParser((event) => {
      if (event.type === "event") {
        const data = event.data;

        try {
          const parsedData = JSON.parse(data);
          this.buffer.push(parsedData);
          this.currentData = parsedData;
          this.emit("data", parsedData);

          // also emit 'message'for backwards compatibility
          this.emit("message" as any, parsedData);
        } catch (e) {
          this.emit("error", e);
        }
      }
    });

    const timeout = this.options.timeout ?? EVENT_STREAM_TIMEOUT;

    const readPartialResponse = async () => {
      const { value, done } = await reader.read();
      this.lastEventTimestamp = Date.now();

      parser.feed(decoder.decode(value));

      if (Date.now() - this.lastEventTimestamp > timeout) {
        this.emit(
          "error",
          new ApiError({
            message: `Event stream timed out after ${(timeout / 1000).toFixed(0)} seconds with no messages.`,
            status: 408,
          }),
        );
      }

      if (!done) {
        readPartialResponse().catch(this.handleError);
      } else {
        this.emit("done", this.currentData);
      }
    };

    readPartialResponse().catch(this.handleError);
    return;
  };

  private handleError = (error: any) => {
    // In case AbortError is thrown but the signal is marked as aborted
    // it means the user called abort() and we should not emit an error
    // as it's expected behavior
    // See note on: https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort
    if (error.name === "AbortError" || this.signal.aborted) {
      return;
    }
    const apiError =
      error instanceof ApiError
        ? error
        : new ApiError({
            message: error.message ?? "An unknown error occurred",
            status: 500,
          });
    this.emit("error", apiError);
    return;
  };

  public on = (type: FalStreamEventType, listener: EventHandler) => {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)?.push(listener);
  };

  private emit = (type: FalStreamEventType, event: any) => {
    const listeners = this.listeners.get(type) || [];
    for (const listener of listeners) {
      listener(event);
    }
  };

  async *[Symbol.asyncIterator]() {
    let running = true;
    const stopAsyncIterator = () => (running = false);
    this.on("error", stopAsyncIterator);
    this.on("done", stopAsyncIterator);
    while (running || this.buffer.length > 0) {
      const data = this.buffer.shift();
      if (data) {
        yield data;
      }

      // the short timeout ensures the while loop doesn't block other
      // frames getting executed concurrently
      await new Promise((resolve) => setTimeout(resolve, 16));
    }
  }

  /**
   * Gets a reference to the `Promise` that indicates whether the streaming
   * is done or not. Developers should always call this in their apps to ensure
   * the request is over.
   *
   * An alternative to this, is to use `on('done')` in case your application
   * architecture works best with event listeners.
   *
   * @returns the promise that resolves when the request is done.
   */
  public done = async () => this.donePromise;

  /**
   * Aborts the streaming request.
   *
   * **Note:** This method is noop in case the request is already done.
   *
   * @param reason optional cause for aborting the request.
   */
  public abort = (reason?: string | Error) => {
    if (!this.streamClosed) {
      this.abortController.abort(reason);
    }
  };

  /**
   * Gets the `AbortSignal` instance that can be used to listen for abort events.
   *
   * **Note:** this signal is internal to the `FalStream` instance. If you pass your
   * own abort signal, the `FalStream` will listen to it and abort it appropriately.
   *
   * @returns the `AbortSignal` instance.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
   */
  public get signal() {
    return this.abortController.signal;
  }

  /**
   * Gets the request id of the streaming request.
   *
   * @returns the request id.
   */
  public get requestId() {
    return this._requestId;
  }
}

/**
 * The streaming client interface.
 */
export interface StreamingClient {
  /**
   * Calls a fal app that supports streaming and provides a streaming-capable
   * object as a result, that can be used to get partial results through either
   * `AsyncIterator` or through an event listener.
   *
   * @param endpointId the endpoint id, e.g. `fal-ai/llavav15-13b`.
   * @param options the request options, including the input payload.
   * @returns the `FalStream` instance.
   */
  stream<Id extends EndpointType>(
    endpointId: Id,
    options: StreamOptions<InputType<Id>>,
  ): Promise<FalStream<InputType<Id>, OutputType<Id>>>;
}

type StreamingClientDependencies = {
  config: RequiredConfig;
  storage: StorageClient;
};

export function createStreamingClient({
  config,
  storage,
}: StreamingClientDependencies): StreamingClient {
  return {
    async stream<Id extends EndpointType>(
      endpointId: Id,
      options: StreamOptions<InputType<Id>>,
    ) {
      const input = options.input
        ? await storage.transformInput(options.input)
        : undefined;
      return new FalStream<InputType<Id>, OutputType<Id>>(endpointId, config, {
        ...options,
        input: input as InputType<Id>,
      });
    },
  };
}
