export type Credentials = {
  keyId: string;
  keySecret: string;
  userId: string;
};

export type Config = {
  credentials: Credentials;
  host?: string;
};

export type RequiredConfig = Required<Config>;

const DEFAULT_CONFIG: Partial<Config> = {
  host: 'gateway.shark.fal.ai',
};

let configuration: RequiredConfig | undefined = undefined;

/**
 * Configures the fal serverless client.
 *
 * @param config the new configuration.
 */
export function config(config: Config) {
  configuration = { ...DEFAULT_CONFIG, ...config } as RequiredConfig;
}

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
    typeof process.env.FAL_KEY_SECRET !== 'undefined' &&
    typeof process.env.FAL_USER_ID !== 'undefined'
  );
}

/**
 * Get the current fal serverless client configuration.
 *
 * @returns the current client configuration.
 */
export function getConfig(): RequiredConfig {
  const hasConfig = typeof configuration !== 'undefined';
  if (!hasConfig && hasEnvVariables()) {
    config({
      credentials: {
        keyId: process.env.FAL_KEY_ID,
        keySecret: process.env.FAL_KEY_SECRET,
        userId: process.env.FAL_USER_ID,
      },
    });
  }
  if (!hasConfig || configuration.credentials.keySecret === undefined) {
    throw new Error('You must configure fal serverless first.');
  }
  return configuration;
}
