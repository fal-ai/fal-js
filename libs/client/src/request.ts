import { RequiredConfig } from "./config";
import { ResponseHandler } from "./response";
import { getUserAgent, isBrowser } from "./runtime";
import { RunOptions, UrlOptions } from "./types";
import { ensureEndpointIdFormat, isValidUrl } from "./utils";

const isCloudflareWorkers =
  typeof navigator !== "undefined" &&
  navigator?.userAgent === "Cloudflare-Workers";

type RequestOptions = {
  responseHandler?: ResponseHandler<any>;
};

type RequestParams<Input = any> = {
  method?: string;
  targetUrl: string;
  input?: Input;
  config: RequiredConfig;
  options?: RequestOptions & RequestInit;
  headers?: Record<string, string>;
};

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
  const authHeader = credentials ? { Authorization: `Key ${credentials}` } : {};
  const requestHeaders = {
    ...authHeader,
    Accept: "application/json",
    "Content-Type": "application/json",
    ...userAgent,
    ...(headers ?? {}),
  } as HeadersInit;

  const { responseHandler: customResponseHandler, ...requestInit } = options;
  const response = await fetch(url, {
    ...requestInit,
    method,
    headers: {
      ...requestHeaders,
      ...(requestInit.headers ?? {}),
    },
    ...(!isCloudflareWorkers && { mode: "cors" }),
    body:
      method.toLowerCase() !== "get" && input
        ? JSON.stringify(input)
        : undefined,
  });
  const handleResponse = customResponseHandler ?? responseHandler;
  return await handleResponse(response);
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
