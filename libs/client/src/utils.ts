export function isUUIDv4(id: string): boolean {
  return (
    typeof id === 'string' &&
    id.length === 36 &&
    id[14] === '4' &&
    ['8', '9', 'a', 'b'].includes(id[19])
  );
}

export function isValidUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname.endsWith('fal.ai');
  } catch (_) {
    return false;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...funcArgs: Parameters<T>) => ReturnType<T> | void {
  let lastFunc: NodeJS.Timeout | null;
  let lastRan: number;

  return (...args: Parameters<T>): ReturnType<T> | void => {
    if (!lastRan) {
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
