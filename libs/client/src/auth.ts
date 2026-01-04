import { getRestApiUrl, RequiredConfig } from "./config";
import { dispatchRequest } from "./request";
import { parseEndpointId } from "./utils";

export const TOKEN_EXPIRATION_SECONDS = 120;

/**
 * Get a token to connect to the realtime endpoint.
 */
export async function getTemporaryAuthToken(
  app: string,
  config: RequiredConfig,
  tokenExpirationSeconds = TOKEN_EXPIRATION_SECONDS,
): Promise<string> {
  const appId = parseEndpointId(app);
  const token: string | object = await dispatchRequest<any, string>({
    method: "POST",
    targetUrl: `${getRestApiUrl()}/tokens/`,
    config,
    input: {
      allowed_apps: [appId.alias],
      token_expiration: tokenExpirationSeconds,
    },
  });
  // keep this in case the response was wrapped (old versions of the proxy do that)
  // should be safe to remove in the future
  if (typeof token !== "string" && token["detail"]) {
    return token["detail"];
  }
  return token;
}
