export type HeaderValue = string | string[] | undefined | null;

/**
 * The raw request payload a framework adapter hands to the proxy.
 *
 * Bytes, not only text: a multipart body (a `FormData` upload) is binary, and decoding it to a
 * string corrupts file parts before they reach fal. Adapters should return the request's bytes
 * (`ArrayBuffer` or `Uint8Array`, which includes Node's `Buffer`) whenever the framework exposes
 * them; a string remains valid for adapters that only ever see parsed JSON.
 */
export type ProxyRequestBody = string | ArrayBuffer | Uint8Array | undefined;

/**
 * The proxy behavior that is passed to the proxy handler. This is a subset of
 * request objects that are used by different frameworks, like Express and NextJS.
 */
export interface ProxyBehavior<ResponseType> {
  id: string;
  method: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  respondWith(status: number, data: string | any): ResponseType;
  sendResponse(response: Response): Promise<ResponseType>;
  getHeaders(): Record<string, HeaderValue>;
  getHeader(name: string): HeaderValue;
  sendHeader(name: string, value: string): void;
  getRequestBody(): Promise<ProxyRequestBody>;
  /** @deprecated Use `resolveFalAuth` in `ProxyConfig` instead. */
  resolveApiKey?: () => Promise<string | undefined>;
}
