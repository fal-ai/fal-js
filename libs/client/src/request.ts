import { RequiredConfig } from "./config";
import { ResponseHandler } from "./response";
import {
  calculateBackoffDelay,
  isRetryableError,
  type RetryOptions,
} from "./retry";
import { getUserAgent, isBrowser } from "./runtime";
import { JsonObject, RunOptions, UrlOptions } from "./types/common";
import {
  ensureEndpointIdFormat,
  isPlainObject,
  isValidUrl,
  sleep,
} from "./utils";

const isCloudflareWorkers =
  typeof navigator !== "undefined" &&
  navigator?.userAgent === "Cloudflare-Workers";

type RequestOptions = {
  responseHandler?: ResponseHandler<any>;
  /**
   * Retry configuration for this specific request.
   * If not specified, uses the default retry configuration from the client config.
   */
  retry?: Partial<RetryOptions>;
};

type RequestParams<Input = any> = {
  method?: string;
  targetUrl: string;
  input?: Input;
  extraBody?: JsonObject;
  config: RequiredConfig;
  options?: RequestOptions & RequestInit;
  headers?: Record<string, string>;
};

export function resolveJsonBody<Input>(
  method: string,
  input?: Input,
  extraBody?: JsonObject,
): string | undefined {
  const normalizedMethod = method.toLowerCase();
  if (extraBody === undefined) {
    return normalizedMethod !== "get" && input
      ? JSON.stringify(input)
      : undefined;
  }
  if (normalizedMethod === "get") {
    throw new Error("`extraBody` is not supported for GET requests.");
  }
  if (!isPlainObject(extraBody)) {
    throw new Error("`extraBody` must be a plain JSON object.");
  }
  if (input === undefined) {
    return JSON.stringify(extraBody);
  }
  if (!isPlainObject(input)) {
    throw new Error(
      "`extraBody` can only be used when `input` is a plain object.",
    );
  }
  return JSON.stringify({
    ...(input as JsonObject),
    extraBody,
  });
}

export async function dispatchRequest<Input, Output>(
  params: RequestParams<Input>,
): Promise<Output> {
  const { targetUrl, input, extraBody, config, options = {} } = params;
  const {
    credentials: credentialsValue,
    requestMiddleware,
    responseHandler,
    fetch,
  } = config;

  const retryOptions: RetryOptions = {
    ...config.retry,
    ...(options.retry || {}),
  } as RetryOptions;

  const executeRequest = async (): Promise<Output> => {
    const userAgent = isBrowser() ? {} : { "User-Agent": getUserAgent() };
    const credentials =
      typeof credentialsValue === "function"
        ? credentialsValue()
        : credentialsValue;

    const { method, url, headers } = await requestMiddleware({
      method: (params.method ?? options.method ?? "post").toUpperCase(),
      url: targetUrl,
      headers: params.headers,
    });
    const authHeader = credentials
      ? { Authorization: `Key ${credentials}` }
      : {};
    const requestHeaders = {
      ...authHeader,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...userAgent,
      ...(headers ?? {}),
    } as HeadersInit;

    const {
      responseHandler: customResponseHandler,
      retry: _,
      ...requestInit
    } = options;
    const response = await fetch(url, {
      ...requestInit,
      method,
      headers: {
        ...requestHeaders,
        ...(requestInit.headers ?? {}),
      },
      ...(!isCloudflareWorkers && { mode: "cors" }),
      signal: options.signal,
      body: resolveJsonBody(method, input, extraBody),
    });
    const handleResponse = customResponseHandler ?? responseHandler;
    return await handleResponse(response);
  };

  let lastError: any;
  for (let attempt = 0; attempt <= retryOptions.maxRetries; attempt++) {
    try {
      return await executeRequest();
    } catch (error) {
      lastError = error;

      const shouldNotRetry =
        attempt === retryOptions.maxRetries ||
        !isRetryableError(error, retryOptions.retryableStatusCodes) ||
        options.signal?.aborted;
      if (shouldNotRetry) {
        throw error;
      }

      const delay = calculateBackoffDelay(
        attempt,
        retryOptions.baseDelay,
        retryOptions.maxDelay,
        retryOptions.backoffMultiplier,
        retryOptions.enableJitter,
      );

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Builds the final url to run the function based on its `id` or alias and
 * a the options from `RunOptions<Input>`.
 *
 * @private
 * @param id the function id or alias
 * @param options the run options
 * @returns the final url to run the function
 */
export function buildUrl<Input>(
  id: string,
  options: RunOptions<Input> & UrlOptions = {},
): string {
  const method = (options.method ?? "post").toLowerCase();
  const path = (options.path ?? "").replace(/^\//, "").replace(/\/{2,}/, "/");
  const input = options.input;
  const params = {
    ...(options.query || {}),
    ...(method === "get" ? input : {}),
  };

  const queryParams =
    Object.keys(params).length > 0
      ? `?${new URLSearchParams(params).toString()}`
      : "";

  // if a fal url is passed, just use it
  if (isValidUrl(id)) {
    const url = id.endsWith("/") ? id : `${id}/`;
    return `${url}${path}${queryParams}`;
  }

  const appId = ensureEndpointIdFormat(id);
  const subdomain = options.subdomain ? `${options.subdomain}.` : "";
  const url = `https://${subdomain}fal.run/${appId}/${path}`;
  return `${url.replace(/\/$/, "")}${queryParams}`;
}
