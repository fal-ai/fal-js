// Mirrors libs/client/src/backup-domain.ts. The proxy is published without a
// dependency on @fal-ai/client, so the module is duplicated rather than shared.
// Keep the host map and the connection-failure policy in sync between the two.

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

function isConnectionCode(code: unknown, syscall: unknown): boolean {
  return (
    typeof code === "string" &&
    CONNECTION_ERROR_CODES.has(code) &&
    (typeof syscall !== "string" || CONNECTION_SYSCALLS.has(syscall))
  );
}

// Edge runtimes (Cloudflare Workers, Vercel Edge) reject like browsers do:
// a bare TypeError with no error code.
const TRANSPORT_FAILURE_MESSAGE =
  /fetch failed|failed to fetch|load failed|networkerror when attempting to fetch/i;

function isConnectionError(error: unknown): boolean {
  const seen = new Set<unknown>();
  let sawCode = false;
  let sawConnectionCode = false;
  let current: unknown = error;
  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    const { name, code, syscall, cause } = current as {
      name?: unknown;
      code?: unknown;
      syscall?: unknown;
      cause?: unknown;
    };
    if (name === "AbortError" || name === "TimeoutError") {
      return false;
    }
    sawCode ||= typeof code === "string";
    sawConnectionCode ||= isConnectionCode(code, syscall);
    current = cause;
  }
  // Node reports every failure as TypeError("fetch failed"); a chain that
  // carries codes but none of the connection ones is a post-connect failure.
  if (sawCode) {
    return sawConnectionCode;
  }
  return (
    error instanceof TypeError && TRANSPORT_FAILURE_MESSAGE.test(error.message)
  );
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
