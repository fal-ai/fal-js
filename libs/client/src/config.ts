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
 * Get the current fal serverless client configuration.
 *
 * @returns the current client configuration.
 */
export function getConfig(): RequiredConfig {
  if (typeof configuration === 'undefined') {
    throw new Error('You must configure fal-serverless first.');
  }
  return configuration;
}
