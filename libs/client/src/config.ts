import {
  withMiddleware,
  withProxy,
  type RequestMiddleware,
} from './middleware';
import type { ResponseHandler } from './response';
import { defaultResponseHandler } from './response';

/**
 * Represents the credentials for authentication.
 * The credentials are in the format of "FAL_KEY_ID:FAL_KEY_SECRET".
 */
export type Credentials = `${string}:${string}`;

export type CredentialsResolver = () => Credentials | undefined;

export type Config = {
  credentials?: undefined | Credentials | CredentialsResolver;
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

export const credentialsFromEnv: CredentialsResolver = (): Credentials => {
  if (!hasEnvVariables()) {
    return undefined;
  }

  if (typeof process.env.FAL_KEY !== 'undefined') {
    return process.env.FAL_KEY as Credentials;
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
/**
 * Configures the fal serverless client.
 *
 * @param config - The new configuration. It is an object that can have the following properties:
 * - credentials: The credentials for authentication. They are in the format of "FAL_KEY_ID:FAL_KEY_SECRET". It can also be a function that returns the credentials.
 * - proxyUrl: The URL of the proxy server.
 * - requestMiddleware: A function that can be used to modify the request before it is sent.
 * - responseHandler: A function that can be used to handle the response.
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
