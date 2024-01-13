export function isUUIDv4(id: string): boolean {
  return (
    typeof id === 'string' &&
    id.length === 36 &&
    id[14] === '4' &&
    ['8', '9', 'a', 'b'].includes(id[19])
  );
}

export function ensureAppIdFormat(id: string): string {
  const parts = id.split('/');
  if (parts.length === 2) {
    return id;
  }
  const [, appOwner, appId] = /^([0-9]+)-([a-zA-Z0-9-]+)$/.exec(id);
  if (appOwner && appId) {
    return `${appOwner}/${appId}`;
  }
  throw new Error(
    `Invalid app id: ${id}. Must be in the format <appOwner>/<appId>`
  );
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
  leading = false
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

      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
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
      (stack.includes('node_modules/react-dom/') ||
        stack.includes('node_modules/next/'));
  }
  return isRunningInReact;
}
