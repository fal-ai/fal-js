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
