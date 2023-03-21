type Credentials = {
  keyId: string;
  keySecret: string;
};

type Config = {
  credentials: Credentials;
  host?: string;
};

type RequiredConfig = Required<Config>;

const DEFAULT_CONFIG: Partial<Config> = {
  host: 'https://gateway.shark.fal.ai',
};

let configuration: RequiredConfig | undefined = undefined;

export function config(config: Config) {
  configuration = { ...config, ...DEFAULT_CONFIG } as RequiredConfig;
}

export function getConfig(): RequiredConfig {
  if (typeof configuration === 'undefined') {
    throw new Error('You must configure koldstart first.');
  }
  return configuration;
}
