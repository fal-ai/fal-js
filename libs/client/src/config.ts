import {
  withMiddleware,
  withProxy,
  type RequestMiddleware,
} from './middleware';
import type { ResponseHandler } from './response';
import { defaultResponseHandler } from './response';

export type CredentialsResolver = () => string | undefined;

export type Config = {
  credentials?: undefined | string | CredentialsResolver;
  proxyUrl?: string;
  requestMiddleware?: RequestMiddleware;
  responseHandler?: ResponseHandler<any>;
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
  configuration = { ...DEFAULT_CONFIG, ...config } as RequiredConfig;
  if (config.proxyUrl) {
    configuration = {
      ...configuration,
      requestMiddleware: withMiddleware(
        configuration.requestMiddleware,
        withProxy({ targetUrl: config.proxyUrl })
      ),
    };
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
    return { ...DEFAULT_CONFIG } as RequiredConfig;
  }
  return configuration;
}

/**
 * @returns the URL of the fal serverless rest api endpoint.
 */
export function getRestApiUrl(): string {
  return 'https://rest.alpha.fal.ai';
}
