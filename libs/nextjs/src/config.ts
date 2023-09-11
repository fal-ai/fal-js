import type { RequestMiddleware } from '@fal-ai/serverless-client';

export type NextProxyConfig = {
  targetUrl: string;
};

const defaultConfig: NextProxyConfig = {
  targetUrl: '/api/_fal/proxy',
};

export const TARGET_URL_HEADER = 'x-fal-target-url';

export function withNextProxy(
  config: NextProxyConfig = defaultConfig
): RequestMiddleware {
  // when running on the server, we don't need to proxy the request
  if (typeof window === 'undefined') {
    return (requestConfig) => Promise.resolve(requestConfig);
  }
  return (requestConfig) =>
    Promise.resolve({
      ...requestConfig,
      url: config.targetUrl,
      headers: {
        [TARGET_URL_HEADER]: requestConfig.url,
        ...(requestConfig.headers || {}),
      },
    });
}
