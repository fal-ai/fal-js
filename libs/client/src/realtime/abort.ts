export function throwIfRealtimeAborted(signal: AbortSignal): void {
  if (!signal.aborted) return;
  throw (
    signal.reason ??
    new DOMException("Realtime operation aborted", "AbortError")
  );
}
