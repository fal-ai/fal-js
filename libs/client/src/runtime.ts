/* eslint-disable @typescript-eslint/no-var-requires */

export function isBrowser(): boolean {
  return (
    typeof window !== "undefined" && typeof window.document !== "undefined"
  );
}

let memoizedUserAgent: string | null = null;

export function getUserAgent(): string {
  if (memoizedUserAgent !== null) {
    return memoizedUserAgent;
  }
  const packageInfo = require("../package.json");
  memoizedUserAgent = `${packageInfo.name}/${packageInfo.version}`;
  return memoizedUserAgent;
}
