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

export function isValidUrl(url: string) {
  try {
    const { host } = new URL(url);
    return /(fal\.(ai|run))$/.test(host);
  } catch (_) {
    return false;
  }
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
