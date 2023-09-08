import type { RequestMiddleware } from './middleware';
import type { ResponseHandler } from './response';
import { defaultResponseHandler } from './response';

export type Credentials = {
  keyId: string;
  keySecret: string;
};

export type CredentialsResolver = () => Credentials;

export type Config = {
  credentials?: Credentials | CredentialsResolver;
  host?: string;
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
    process &&
    process.env &&
    typeof process.env.FAL_KEY_ID !== 'undefined' &&
    typeof process.env.FAL_KEY_SECRET !== 'undefined'
  );
}

export const credentialsFromEnv: CredentialsResolver = () => {
  if (!hasEnvVariables()) {
    return {
      keyId: '',
      keySecret: '',
    };
  }
  if (typeof window !== 'undefined') {
    console.warn(
      "The fal credentials are exposed in the browser's environment. " +
        "That's not recommended for production use cases."
    );
  }

  return {
    keyId: process.env.FAL_KEY_ID || '',
    keySecret: process.env.FAL_KEY_SECRET || '',
  };
};

/**
 * Get the default host for the fal-serverless gateway endpoint.
 * @private
 * @returns the default host. Depending on the platform it can default to
 * the environment variable `FAL_HOST`.
 */
function getDefaultHost(): string {
  const host = 'gateway.shark.fal.ai';
  if (process && process.env) {
    return process.env.FAL_HOST || host;
  }
  return host;
}

const DEFAULT_CONFIG: Partial<Config> = {
  host: getDefaultHost(),
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
}

/**
 * Get the current fal serverless client configuration.
 *
 * @returns the current client configuration.
 */
export function getConfig(): RequiredConfig {
  if (!configuration) {
    console.info('Using default configuration for the fal client');
  }
  return configuration;
}
