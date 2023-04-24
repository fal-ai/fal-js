export function isUUIDv4(id: string): boolean {
  return (
    typeof id === 'string' &&
    id.length === 36 &&
    id[14] === '4' &&
    ['8', '9', 'a', 'b'].includes(id[19])
  );
}
