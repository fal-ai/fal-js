import { createParser } from 'eventsource-parser';
import { getTemporaryAuthToken } from './auth';
import { buildUrl } from './function';
import { dispatchRequest } from './request';
import { ApiError, defaultResponseHandler } from './response';
import { storageImpl } from './storage';

type StreamingConnectionMode = 'client' | 'server';

/**
 * The stream API options. It requires the API input and also
 * offers configuration options.
 */
type StreamOptions<Input> = {
  /**
   * The API input payload.
   */
  readonly input?: Input;

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
  readonly method?: 'get' | 'post' | 'put' | 'delete' | string;

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
   * It defaults to `client` when running in the browser or `server` otherwise.
   */
  readonly connectionMode?: StreamingConnectionMode;
};

const EVENT_STREAM_TIMEOUT = 15 * 1000;

type FalStreamEventType = 'data' | 'error' | 'done';

type EventHandler<T = any> = (event: T) => void;

/**
 * The class representing a streaming response. With t
 */
export class FalStream<Input, Output> {
  // properties
  url: string;
  options: StreamOptions<Input>;

  // support for event listeners
  private listeners: Map<FalStreamEventType, EventHandler[]> = new Map();
  private buffer: Output[] = [];

  // local state
  private currentData: Output | undefined = undefined;
  private lastEventTimestamp = 0;
  private streamClosed = false;
  private donePromise: Promise<Output>;

  private abortController = new AbortController();

  constructor(url: string, options: StreamOptions<Input>) {
    this.url = url;
    this.options = options;
    this.donePromise = new Promise<Output>((resolve, reject) => {
      if (this.streamClosed) {
        reject(
          new ApiError({
            message: 'Streaming connection is already closed.',
            status: 400,
            body: undefined,
          })
        );
      }
      this.on('done', (data) => {
        this.streamClosed = true;
        resolve(data);
      });
      this.on('error', (error) => {
        this.streamClosed = true;
        reject(error);
      });
    });
    this.start().catch(this.handleError);
  }

  private start = async () => {
    const { url, options } = this;
    const { input, method = 'post' } = options;
    try {
      dispatchRequest(method.toUpperCase(), url, input, {
        responseHandler: this.handleResponse,
        signal: this.abortController.signal,
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
        this.emit('error', error);
      }
      return;
    }

    const body = response.body;
    if (!body) {
      this.emit(
        'error',
        new ApiError({
          message: 'Response body is empty.',
          status: 400,
          body: undefined,
        })
      );
      return;
    }

    // any response that is not a text/event-stream will be handled as a binary stream
    if (response.headers.get('content-type') !== 'text/event-stream') {
      // pass the binary chunks to this.emit('data', chunk)
      const reader = body.getReader();
      const emitRawChunk = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            this.emit('done', this.currentData);
            return;
          }
          this.currentData = value as Output;
          this.emit('data', value);
          emitRawChunk();
        });
      };
      emitRawChunk();
      return;
    }

    const decoder = new TextDecoder('utf-8');
    const reader = response.body.getReader();

    const parser = createParser((event) => {
      if (event.type === 'event') {
        const data = event.data;

        try {
          const parsedData = JSON.parse(data);
          this.buffer.push(parsedData);
          this.currentData = parsedData;
          this.emit('data', parsedData);

          // also emit 'message'for backwards compatibility
          this.emit('message' as any, parsedData);
        } catch (e) {
          this.emit('error', e);
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
          'error',
          new ApiError({
            message: `Event stream timed out after ${(timeout / 1000).toFixed(0)} seconds with no messages.`,
            status: 408,
          })
        );
      }

      if (!done) {
        readPartialResponse().catch(this.handleError);
      } else {
        this.emit('done', this.currentData);
      }
    };

    readPartialResponse().catch(this.handleError);
    return;
  };

  private handleError = (error: any) => {
    const apiError =
      error instanceof ApiError
        ? error
        : new ApiError({
            message: error.message ?? 'An unknown error occurred',
            status: 500,
          });
    this.emit('error', apiError);
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
    this.on('error', stopAsyncIterator);
    this.on('done', stopAsyncIterator);
    while (running) {
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
   */
  public abort = () => {
    this.abortController.abort();
  };
}

/**
 * Calls a fal app that supports streaming and provides a streaming-capable
 * object as a result, that can be used to get partial results through either
 * `AsyncIterator` or through an event listener.
 *
 * @param endpointId the endpoint id, e.g. `fal-ai/llavav15-13b`.
 * @param options the request options, including the input payload.
 * @returns the `FalStream` instance.
 */
export async function stream<Input = Record<string, any>, Output = any>(
  endpointId: string,
  options: StreamOptions<Input>
): Promise<FalStream<Input, Output>> {
  const queryParams: Record<string, string> = {};
  const connectionMode =
    options.connectionMode ??
    (typeof window === 'undefined' ? 'server' : 'client');
  if (connectionMode === 'client') {
    queryParams['fal_jwt_token'] = await getTemporaryAuthToken(endpointId);
  }
  const url = buildUrl(endpointId, { path: '/stream' });

  const input =
    options.input && options.autoUpload !== false
      ? await storageImpl.transformInput(options.input)
      : options.input;

  const query =
    Object.keys(queryParams).length > 0
      ? '?' + new URLSearchParams(queryParams).toString()
      : '';
  return new FalStream<Input, Output>(url + query, {
    ...options,
    input: input as Input,
  });
}
