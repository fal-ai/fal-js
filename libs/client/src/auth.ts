import { getRestApiUrl, RequiredConfig } from "./config";
import { dispatchRequest } from "./request";
import { parseEndpointId } from "./utils";

/**
 * A function that provides a temporary authentication token.
 * @param app - The app/endpoint identifier, including the path (e.g. "fal-ai/myapp/realtime")
 * @returns A promise that resolves to the token string
 */
export type TokenProvider = (app: string) => Promise<string>;

export const TOKEN_EXPIRATION_SECONDS = 120;

/**
 * Get a token to connect to the realtime endpoint.
 */
export async function getTemporaryAuthToken(
  app: string,
  config: RequiredConfig,
): Promise<string> {
  const appId = parseEndpointId(app);
  const token: string | object = await dispatchRequest<any, string>({
    method: "POST",
    targetUrl: `${getRestApiUrl()}/tokens/`,
    config,
    input: {
      allowed_apps: [appId.alias],
      token_expiration: TOKEN_EXPIRATION_SECONDS,
    },
  });
  // keep this in case the response was wrapped (old versions of the proxy do that)
  // should be safe to remove in the future
  if (typeof token !== "string" && token["detail"]) {
    return token["detail"];
  }
  return token;
}
