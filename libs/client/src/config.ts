import {
  withMiddleware,
  withProxy,
  type RequestMiddleware,
} from './middleware';
import type { ResponseHandler } from './response';
import { defaultResponseHandler } from './response';

export type CredentialsResolver = () => string | undefined;

type FetchType = typeof fetch;

export function resolveDefaultFetch(): FetchType {
  if (typeof fetch === 'undefined') {
    throw new Error(
      'Your environment does not support fetch. Please provide your own fetch implementation.'
    );
  }
  return fetch;
}

export type Config = {
  /**
   * The credentials to use for the fal serverless client. When using the
   * client in the browser, it's recommended to use a proxy server to avoid
   * exposing the credentials in the client's environment.
   *
   * By default it tries to use the `FAL_KEY` environment variable, when
   * `process.env` is defined.
   *
   * @see https://fal.ai/docs/model-endpoints/server-side
   * @see #suppressLocalCredentialsWarning
   */
  credentials?: undefined | string | CredentialsResolver;
  /**
   * Suppresses the warning when the fal credentials are exposed in the
   * browser's environment. Make sure you understand the security implications
   * before enabling this option.
   */
  suppressLocalCredentialsWarning?: boolean;
  /**
   * The URL of the proxy server to use for the client requests. The proxy
   * server should forward the requests to the fal serverless rest api.
   */
  proxyUrl?: string;
  /**
   * The request middleware to use for the client requests. By default it
   * doesn't apply any middleware.
   */
  requestMiddleware?: RequestMiddleware;
  /**
   * The response handler to use for the client requests. By default it uses
   * a built-in response handler that returns the JSON response.
   */
  responseHandler?: ResponseHandler<any>;
  /**
   * The fetch implementation to use for the client requests. By default it uses
   * the global `fetch` function.
   */
  fetch?: FetchType;
};

export type RequiredConfig = Required<Config>;

/**
 * Checks if the required FAL environment variables are set.
 *
 * @returns `true` if the required environment variables are set,
 * `false` otherwise.
 */
function hasEnvVariables(): boolean {
  return (
    typeof process !== 'undefined' &&
    process.env &&
    (typeof process.env.FAL_KEY !== 'undefined' ||
      (typeof process.env.FAL_KEY_ID !== 'undefined' &&
        typeof process.env.FAL_KEY_SECRET !== 'undefined'))
  );
}

export const credentialsFromEnv: CredentialsResolver = () => {
  if (!hasEnvVariables()) {
    return undefined;
  }

  if (typeof process.env.FAL_KEY !== 'undefined') {
    return process.env.FAL_KEY;
  }

  return `${process.env.FAL_KEY_ID}:${process.env.FAL_KEY_SECRET}`;
};

const DEFAULT_CONFIG: Partial<Config> = {
  credentials: credentialsFromEnv,
  suppressLocalCredentialsWarning: false,
  requestMiddleware: (request) => Promise.resolve(request),
  responseHandler: defaultResponseHandler,
};

let configuration: RequiredConfig;

/**
 * Configures the fal serverless client.
 *
 * @param config the new configuration.
 */
export function config(config: Config) {
  configuration = {
    ...DEFAULT_CONFIG,
    ...config,
    fetch: config.fetch ?? resolveDefaultFetch(),
  } as RequiredConfig;
  if (config.proxyUrl) {
    configuration = {
      ...configuration,
      requestMiddleware: withMiddleware(
        withProxy({ targetUrl: config.proxyUrl }),
        configuration.requestMiddleware
      ),
    };
  }
  const { credentials, suppressLocalCredentialsWarning } = configuration;
  if (
    typeof window !== 'undefined' &&
    credentials &&
    !suppressLocalCredentialsWarning
  ) {
    console.warn(
      "The fal credentials are exposed in the browser's environment. " +
        "That's not recommended for production use cases."
    );
  }
}

/**
 * Get the current fal serverless client configuration.
 *
 * @returns the current client configuration.
 */
export function getConfig(): RequiredConfig {
  if (!configuration) {
    console.info('Using default configuration for the fal client');
    return {
      ...DEFAULT_CONFIG,
      fetch: resolveDefaultFetch(),
    } as RequiredConfig;
  }
  return configuration;
}

/**
 * @returns the URL of the fal serverless rest api endpoint.
 */
export function getRestApiUrl(): string {
  return 'https://rest.alpha.fal.ai';
}
