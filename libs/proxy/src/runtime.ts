/* eslint-disable @typescript-eslint/no-var-requires */

let memoizedProduct: string | null = null;

/**
 * Builds the value the proxy identifies itself with on upstream requests, as a
 * user-agent style product token followed by the adapter in use.
 *
 * @param adapterId the id of the framework adapter handling the request.
 * @returns e.g. `@fal-ai/server-proxy/1.3.0 (nextjs-app-router)`.
 */
export function getProxyUserAgent(adapterId: string): string {
  if (memoizedProduct === null) {
    const packageInfo = require("../package.json");
    memoizedProduct = `${packageInfo.name}/${packageInfo.version}`;
  }
  return `${memoizedProduct} (${adapterId})`;
}
