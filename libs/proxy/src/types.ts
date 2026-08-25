export type HeaderValue = string | string[] | undefined | null;

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
  getRequestBody(): Promise<string | undefined>;
  /** @deprecated Use `resolveFalAuth` in `ProxyConfig` instead. */
  resolveApiKey?: () => Promise<string | undefined>;
}
