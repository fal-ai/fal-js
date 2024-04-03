import { getRestApiUrl } from './config';
import { dispatchRequest } from './request';
import { parseAppId } from './utils';

export const TOKEN_EXPIRATION_SECONDS = 120;

/**
 * Get a token to connect to the realtime endpoint.
 */
export async function getTemporaryAuthToken(app: string): Promise<string> {
  const appId = parseAppId(app);
  const token: string | object = await dispatchRequest<any, string>(
    'POST',
    `${getRestApiUrl()}/tokens/`,
    {
      allowed_apps: [appId.alias],
      token_expiration: TOKEN_EXPIRATION_SECONDS,
    }
  );
  // keep this in case the response was wrapped (old versions of the proxy do that)
  // should be safe to remove in the future
  if (typeof token !== 'string' && token['detail']) {
    return token['detail'];
  }
  return token;
}
