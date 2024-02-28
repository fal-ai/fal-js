import { createParser } from 'eventsource-parser';
import { getTemporaryAuthToken } from './auth';
import { buildUrl } from './function';
import { ApiError } from './response';
import { storageImpl } from './storage';

type StreamOptions<Input> = {
  input: Input;
  autoUpload?: boolean;
};

const EVENT_STREAM_TIMEOUT = 15 * 1000;

type FalStreamEventType = 'message' | 'error' | 'done';

type EventHandler = (event: any) => void;

class FalStream<Input, Output> {
  // properties
  url: string;
  input: Input;

  // support for event listeners
  private listeners: Map<FalStreamEventType, EventHandler[]> = new Map();
  private buffer: Output[] = [];

  // local state
  private currentData: Output | undefined = undefined;
  private lastEventTimestamp = 0;
  private streamClosed = false;
  private donePromise: Promise<Output>;

  constructor(url: string, input: Input) {
    this.url = url;
    this.input = input;
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
    this.start();
  }

  private start = async () => {
    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          accept: 'text/event-stream',
          'content-type': 'application/json',
        },
        body: JSON.stringify(this.input),
      });
      this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  };

  private handleResponse = async (response: Response) => {
    if (!response.ok) {
      this.emit(
        'error',
        new ApiError({
          message: response.statusText,
          status: response.status,
          body: undefined,
        })
      );
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
    const decoder = new TextDecoder('utf-8');
    const reader = response.body.getReader();

    const parser = createParser((event) => {
      if (event.type === 'event') {
        const data = event.data;

        try {
          const parsedData = JSON.parse(data);
          this.buffer.push(parsedData);
          this.currentData = parsedData;
          this.emit('message', parsedData);
        } catch (e) {
          this.emit('error', e);
        }
      }
    });

    const readPartialResponse = async () => {
      const { value, done } = await reader.read();
      this.lastEventTimestamp = Date.now();

      parser.feed(decoder.decode(value));

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
    // TODO convert error to ApiError
    this.emit('error', error);
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

      await new Promise((resolve) => setTimeout(resolve, 16));

      if (Date.now() - this.lastEventTimestamp > EVENT_STREAM_TIMEOUT) {
        running = false;
        this.emit(
          'error',
          new ApiError({
            message:
              'Event stream timed out after 15 seconds with no messages.',
            status: 408,
            body: undefined,
          })
        );
      }
    }
  }

  public done = async () => {
    return this.donePromise;
  };
}

export async function stream<Input = Record<string, any>, Output = any>(
  appId: string,
  options: StreamOptions<Input>
) {
  const token = await getTemporaryAuthToken(appId);
  const url = buildUrl(appId, { path: '/stream' });

  const input =
    options.input && options.autoUpload !== false
      ? await storageImpl.transformInput(options.input)
      : options.input;

  const queryParams = new URLSearchParams({
    fal_jwt_token: token,
  });

  return new FalStream<Input, Output>(`${url}?${queryParams}`, input as Input);
}
