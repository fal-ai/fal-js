export type ResponseHandler<Output> = (response: Response) => Promise<Output>;

type ApiErrorArgs = {
  message: string;
  status: number;
  body?: any;
};

export class ApiError extends Error {
  public readonly status: number;
  public readonly body?: any;
  constructor({ message, status, body }: ApiErrorArgs) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export async function defaultResponseHandler<Output>(
  response: Response
): Promise<Output> {
  const { status, statusText } = response;
  const contentType = response.headers.get('Content-Type');
  if (!response.ok) {
    if (contentType?.includes('application/json')) {
      const body = await response.json();
      throw new ApiError({
        message: body.message || statusText,
        status,
        body,
      });
    }
    throw new Error(`HTTP ${status}: ${statusText}`);
  }
  if (contentType?.includes('application/json')) {
    return response.json() as Promise<Output>;
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
