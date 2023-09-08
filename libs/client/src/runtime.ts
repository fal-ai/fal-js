export function isBrowser(): boolean {
  return (
    typeof window !== 'undefined' && typeof window.document !== 'undefined'
  );
}

let memoizedUserAgent: string | null = null;

export function getUserAgent(): string {
  if (memoizedUserAgent !== null) {
    return memoizedUserAgent;
  }
  const packageInfo = require('../package.json');
  const os = require('os');
  memoizedUserAgent = `${packageInfo.name}/${
    packageInfo.version
  } ${os.platform()}-${os.arch()} ${process.release.name}-${process.version}`;
  return memoizedUserAgent;
}
