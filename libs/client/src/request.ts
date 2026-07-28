import { RequiredConfig } from "./config";
import { TARGET_URL_HEADER } from "./middleware";
import { ResponseHandler } from "./response";
import {
  calculateBackoffDelay,
  isRetryableError,
  type RetryOptions,
} from "./retry";
import { getUserAgent, isBrowser } from "./runtime";
import { RunOptions, UrlOptions } from "./types/common";
import {
  ensureEndpointIdFormat,
  isUrlLike,
  isValidUrl,
  parseAbsoluteUrl,
  sleep,
  untrustedUrlError,
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
  config: RequiredConfig;
  options?: RequestOptions & RequestInit;
  headers?: Record<string, string>;
};

type HeaderMap = Record<string, unknown>;

function headerValues(headers: HeaderMap | undefined, name: string): string[] {
  if (!headers) {
    return [];
  }
  return Object.entries(headers)
    .filter(([key]) => key.toLowerCase() === name)
    .flatMap(([, value]) => (Array.isArray(value) ? value : [value]))
    .map((value) => String(value));
}

/**
 * Drops what the URL parser itself ignores: tabs and newlines anywhere, and
 * leading C0 control characters or spaces.
 */
function stripUrlNoise(url: string): string {
  const withoutBreaks = url.replace(/[\t\n\r]/g, "");
  let start = 0;
  while (
    start < withoutBreaks.length &&
    withoutBreaks.charCodeAt(start) <= 32
  ) {
    start++;
  }
  return withoutBreaks.slice(start);
}

/**
 * A URL with no scheme and no authority resolves against the current origin, so
 * it can never hand credentials to a third party. Backslashes are normalized
 * first because the URL parser reads them as slashes.
 */
function isSameOriginUrl(url: string): boolean {
  return !isUrlLike(stripUrlNoise(url).replace(/\\/g, "/"));
}

/**
 * Whether the request goes to the proxy the app configured. An absolute proxy
 * is matched by origin so a proxy that varies the path or query still works —
 * that origin is a server the app already trusts with its key.
 */
function isConfiguredProxy(
  url: string,
  proxyUrl: RequiredConfig["proxyUrl"],
): boolean {
  if (!proxyUrl) {
    return false;
  }
  const configured = typeof proxyUrl === "string" ? proxyUrl : proxyUrl.url;
  if (url === configured) {
    return true;
  }
  const target = parseAbsoluteUrl(url);
  const proxy = parseAbsoluteUrl(configured);
  return (
    target !== undefined &&
    proxy !== undefined &&
    !!proxy.origin &&
    proxy.origin !== "null" &&
    target.origin === proxy.origin
  );
}

/**
 * Verifies that the request the middleware chain produced may carry fal
 * credentials, before the `Authorization` header is built.
 *
 * The logical fal destination — the `x-fal-target-url` header when a proxy is
 * in play, the request URL otherwise — always has to be a fal URL. The
 * transport itself may additionally be the app's own origin or the proxy it
 * configured, which is how the built-in proxy keeps working. Anything else,
 * including a middleware that rewrites the URL to an unrelated host, fails
 * closed.
 */
function assertTrustedRequestTarget(
  { url, headers }: { url: string; headers?: HeaderMap },
  config: RequiredConfig,
): void {
  for (const target of headerValues(headers, TARGET_URL_HEADER)) {
    if (!isValidUrl(target)) {
      throw untrustedUrlError(
        target,
        `The \`${TARGET_URL_HEADER}\` header must point at a fal endpoint.`,
      );
    }
  }
  if (
    isValidUrl(url) ||
    isSameOriginUrl(url) ||
    isConfiguredProxy(url, config.proxyUrl)
  ) {
    return;
  }
  throw untrustedUrlError(
    url,
    "Set `proxyUrl` if requests have to go through a server you control, " +
      "rather than rewriting the URL in a request middleware.",
  );
}

export async function dispatchRequest<Input, Output>(
  params: RequestParams<Input>,
): Promise<Output> {
  const { targetUrl, input, config, options = {} } = params;
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

    const middlewareRequest = await requestMiddleware({
      method: (params.method ?? options.method ?? "post").toUpperCase(),
      url: targetUrl,
      headers: params.headers,
    });

    const {
      responseHandler: customResponseHandler,
      retry: _,
      ...requestInit
    } = options;
    // Read the middleware's output exactly once and send those very values.
    // Re-reading would let an accessor or an unstable `toString` show the
    // guard one destination and `fetch` another.
    const method = String(middlewareRequest.method);
    const url = String(middlewareRequest.url);
    const requestHeaders = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...userAgent,
      ...(middlewareRequest.headers ?? {}),
      ...(requestInit.headers ?? {}),
    };

    assertTrustedRequestTarget({ url, headers: requestHeaders }, config);

    const response = await fetch(url, {
      ...requestInit,
      method,
      headers: {
        ...(credentials ? { Authorization: `Key ${credentials}` } : {}),
        ...requestHeaders,
      } as HeadersInit,
      ...(!isCloudflareWorkers && { mode: "cors" }),
      signal: options.signal,
      body:
        method.toLowerCase() !== "get" && input
          ? JSON.stringify(input)
          : undefined,
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

  // a URL that isn't a fal endpoint is never an endpoint id in disguise
  if (isUrlLike(id)) {
    throw untrustedUrlError(
      id,
      "Pass an endpoint id such as `fal-ai/fast-sdxl` instead.",
    );
  }

  const appId = ensureEndpointIdFormat(id);
  const subdomain = options.subdomain ? `${options.subdomain}.` : "";
  const url = `https://${subdomain}fal.run/${appId}/${path}`;
  const endpointUrl = `${url.replace(/\/$/, "")}${queryParams}`;
  // neither the id nor the subdomain may move the request off fal
  if (!isValidUrl(endpointUrl)) {
    throw untrustedUrlError(endpointUrl, "Check the endpoint id.");
  }
  return endpointUrl;
}
