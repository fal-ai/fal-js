export function ensureEndpointIdFormat(id: string): string {
  const parts = id.split("/");
  if (parts.length > 1) {
    return id;
  }
  const [, appOwner, appId] = /^([0-9]+)-([a-zA-Z0-9-]+)$/.exec(id) || [];
  if (appOwner && appId) {
    return `${appOwner}/${appId}`;
  }
  throw new Error(
    `Invalid app id: ${id}. Must be in the format <appOwner>/<appId>`,
  );
}

const ENDPOINT_NAMESPACES = ["workflows", "comfy"] as const;

type EndpointNamespace = (typeof ENDPOINT_NAMESPACES)[number];

export type EndpointId = {
  readonly owner: string;
  readonly alias: string;
  readonly path?: string;
  readonly namespace?: EndpointNamespace;
};

export function parseEndpointId(id: string): EndpointId {
  const normalizedId = ensureEndpointIdFormat(id);
  const parts = normalizedId.split("/");
  if (ENDPOINT_NAMESPACES.includes(parts[0] as any)) {
    return {
      owner: parts[1],
      alias: parts[2],
      path: parts.slice(3).join("/") || undefined,
      namespace: parts[0] as EndpointNamespace,
    };
  }
  return {
    owner: parts[0],
    alias: parts[1],
    path: parts.slice(2).join("/") || undefined,
  };
}

/**
 * Resolves the endpoint path, normalizing it and applying a default.
 * If no explicit path is provided and the app already ends with the
 * default path, returns undefined to avoid duplication.
 *
 * @param app - The app/endpoint identifier
 * @param path - An explicitly provided path (always used if present)
 * @param defaultPath - The default path to use (e.g. "/realtime")
 * @returns The resolved path, or undefined if the app already includes it
 */
export function resolveEndpointPath(
  app: string,
  path: string | undefined,
  defaultPath: string,
): string | undefined {
  if (path) {
    return `/${path.replace(/^\/+/, "")}`;
  }
  if (app.endsWith(defaultPath)) {
    return undefined;
  }
  return defaultPath;
}

/**
 * The domains fal endpoints live on. Every other destination is untrusted and
 * must never receive fal credentials or scoped tokens.
 */
export const FAL_DOMAINS = ["fal.ai", "fal.run"] as const;

const HOSTNAME_LABEL = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

/**
 * Checks a hostname against {@link FAL_DOMAINS} on dot boundaries, so hosts
 * that merely end with the same characters (`evilfal.ai`, `notfal.run`) and
 * superdomains (`fal.ai.example.com`) are rejected.
 *
 * @param hostname a parsed hostname, i.e. `new URL(url).hostname`. Never the
 * raw `host`, which carries the port, nor the URL string itself.
 * @returns `true` if the hostname is a fal domain or a subdomain of one.
 */
export function isFalHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return FAL_DOMAINS.some((domain) => {
    if (host === domain) {
      return true;
    }
    if (!host.endsWith(`.${domain}`)) {
      return false;
    }
    const subdomain = host.slice(0, -(domain.length + 1));
    return subdomain.split(".").every((label) => HOSTNAME_LABEL.test(label));
  });
}

/**
 * Parses an absolute URL, returning `undefined` when the value isn't one.
 */
export function parseAbsoluteUrl(value: string): URL | undefined {
  try {
    return new URL(value);
  } catch (_) {
    return undefined;
  }
}

/**
 * Parses a URL that may carry fal credentials: it has to use the expected
 * secure protocol and resolve to a fal hostname.
 *
 * The component reads happen inside the `try` because not every runtime ships
 * a spec-complete `URL` — React Native's, for one, is regex-backed.
 *
 * @param value the URL to parse.
 * @param protocol the required protocol, `https:` by default.
 * @returns the parsed URL, or `undefined` if it isn't an allowed fal URL.
 */
export function parseFalUrl(
  value: string,
  protocol = "https:",
): URL | undefined {
  try {
    const url = new URL(value);
    if (url.protocol !== protocol || !isFalHostname(url.hostname)) {
      return undefined;
    }
    return url;
  } catch (_) {
    return undefined;
  }
}

/**
 * Checks whether the given string is a URL of a fal endpoint.
 */
export function isValidUrl(url: string): boolean {
  return parseFalUrl(url) !== undefined;
}

const URL_SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

/**
 * Checks whether a string was meant to be a URL rather than an endpoint id, so
 * a disallowed URL fails loudly instead of being reinterpreted as an id.
 *
 * This looks for a scheme or an authority rather than asking `new URL` to
 * throw: React Native's `URL` accepts a relative string happily, which would
 * turn every endpoint id into a rejected URL there.
 */
export function isUrlLike(value: string): boolean {
  const trimmed = value.trimStart();
  return trimmed.startsWith("//") || URL_SCHEME.test(trimmed);
}

/**
 * Builds the error thrown when a destination that isn't a fal endpoint would
 * have received fal credentials or a scoped token.
 */
export function untrustedUrlError(url: string, hint?: string): Error {
  const domains = FAL_DOMAINS.map((domain) => `https://${domain}`).join(", ");
  return new Error(
    `Refusing to send a fal request to "${url}": only ${domains} and their ` +
      `subdomains can receive fal credentials.${hint ? ` ${hint}` : ""}`,
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
  leading = false,
): (...funcArgs: Parameters<T>) => ReturnType<T> | void {
  let lastFunc: NodeJS.Timeout | null;
  let lastRan: number;

  return (...args: Parameters<T>): ReturnType<T> | void => {
    if (!lastRan && leading) {
      func(...args);
      lastRan = Date.now();
    } else {
      if (lastFunc) {
        clearTimeout(lastFunc);
      }

      lastFunc = setTimeout(
        () => {
          if (Date.now() - lastRan >= limit) {
            func(...args);
            lastRan = Date.now();
          }
        },
        limit - (Date.now() - lastRan),
      );
    }
  };
}

let isRunningInReact: boolean | undefined;

/**
 * Not really the most optimal way to detect if we're running in React,
 * but the idea here is that we can support multiple rendering engines
 * (starting with React), with all their peculiarities, without having
 * to add a dependency or creating custom integrations (e.g. custom hooks).
 *
 * Yes, a bit of magic to make things works out-of-the-box.
 * @returns `true` if running in React, `false` otherwise.
 */
export function isReact() {
  if (isRunningInReact === undefined) {
    const stack = new Error().stack;
    isRunningInReact =
      !!stack &&
      (stack.includes("node_modules/react-dom/") ||
        stack.includes("node_modules/next/"));
  }
  return isRunningInReact;
}

/**
 * Check if a value is a plain object.
 * @param value - The value to check.
 * @returns `true` if the value is a plain object, `false` otherwise.
 */
export function isPlainObject(value: any): boolean {
  return !!value && Object.getPrototypeOf(value) === Object.prototype;
}

/**
 * Utility function to sleep for a given number of milliseconds
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
