import { inspectErrorChain, isTransportFailureMessage } from "./retry";

// A Map, not an object: hostnames like "constructor" must not hit prototype keys.
const BACKUP_HOSTS = new Map([
  ["fal.run", "falrun.com"],
  ["queue.fal.run", "queue.falrun.com"],
]);

export function getBackupUrl(url: string): string | undefined {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }
  const backup = BACKUP_HOSTS.get(parsed.hostname);
  if (!backup) {
    return undefined;
  }
  parsed.hostname = backup;
  return parsed.href;
}

// DNS and connection-establishment failures only. A failure after the
// connection exists means the gateway was reachable, so switching hosts would
// replay a delivered request. Several of these codes are also raised by later
// syscalls (`read ETIMEDOUT`), hence the syscall check in isConnectionError.
const CONNECTION_ERROR_CODES = new Set([
  "ECONNABORTED",
  "ECONNREFUSED",
  "EAI_AGAIN",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "ENOTFOUND",
  "ETIMEDOUT",
  "UND_ERR_CONNECT_TIMEOUT",
]);

const CONNECTION_SYSCALLS = new Set(["connect", "getaddrinfo"]);

function isConnectionCode({
  code,
  syscall,
}: {
  code: string;
  syscall?: string;
}): boolean {
  return (
    CONNECTION_ERROR_CODES.has(code) &&
    (syscall === undefined || CONNECTION_SYSCALLS.has(syscall))
  );
}

function isConnectionError(error: unknown): boolean {
  const { cancelled, codes } = inspectErrorChain(error);
  if (cancelled) {
    return false;
  }
  if (codes.length > 0) {
    // Node reports every failure as TypeError("fetch failed"); a chain that
    // carries codes but none of the connection ones is a post-connect failure.
    return codes.some(isConnectionCode);
  }
  // Browsers expose network failures without DNS or connection error codes.
  return isTransportFailureMessage(error);
}

export async function fetchWithBackupDomain(
  fetch: typeof globalThis.fetch,
  url: string,
  init: RequestInit,
): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (error) {
    const backup = getBackupUrl(url);
    if (!backup || init.signal?.aborted || !isConnectionError(error)) {
      throw error;
    }
    try {
      return await fetch(backup, init);
    } catch (backupError) {
      if (isConnectionError(backupError)) {
        throw error;
      }
      throw backupError;
    }
  }
}
