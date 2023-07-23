export type ResponseHandler<Output> = (response: Response) => Promise<Output>;

export function defaultResponseHandler<Output>(
  response: Response
): Promise<Output> {
  const { status, statusText } = response;
  if (status < 200 || status >= 300) {
    // TODO better error type so handlers can handle accordingly
    throw new Error(statusText);
  }

  const contentType = response.headers.get('Content-Type');
  if (contentType?.includes('application/json')) {
    return response.json();
  }
  if (contentType?.includes('text/html')) {
    return response.text() as Promise<Output>;
  }
  if (contentType?.includes('application/octet-stream')) {
    return response.arrayBuffer() as Promise<Output>;
  }
  // TODO convert to either number or bool automatically
  return response.text() as Promise<Output>;
}
