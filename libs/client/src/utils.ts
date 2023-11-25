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
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...funcArgs: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null;

  return (...args: Parameters<T>): void => {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}
