import { ValidationErrorInfo } from "./types";

export type ResponseHandler<Output> = (response: Response) => Promise<Output>;

type ApiErrorArgs = {
  message: string;
  status: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
};

export class ApiError<Body> extends Error {
  public readonly status: number;
  public readonly body: Body;
  constructor({ message, status, body }: ApiErrorArgs) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type ValidationErrorBody = {
  detail: ValidationErrorInfo[];
};

export class ValidationError extends ApiError<ValidationErrorBody> {
  constructor(args: ApiErrorArgs) {
    super(args);
    this.name = "ValidationError";
  }

  get fieldErrors(): ValidationErrorInfo[] {
    // NOTE: this is a hack to support both FastAPI/Pydantic errors
    // and some custom 422 errors that might not be in the Pydantic format.
    if (typeof this.body.detail === "string") {
      return [
        {
          loc: ["body"],
          msg: this.body.detail,
          type: "value_error",
        },
      ];
    }
    return this.body.detail || [];
  }

  getFieldErrors(field: string): ValidationErrorInfo[] {
    return this.fieldErrors.filter(
      (error) => error.loc[error.loc.length - 1] === field,
    );
  }
}

export async function defaultResponseHandler<Output>(
  response: Response,
): Promise<Output> {
  const { status, statusText } = response;
  const contentType = response.headers.get("Content-Type") ?? "";
  if (!response.ok) {
    if (contentType.includes("application/json")) {
      const body = await response.json();
      const ErrorType = status === 422 ? ValidationError : ApiError;
      throw new ErrorType({
        message: body.message || statusText,
        status,
        body,
      });
    }
    throw new ApiError({ message: `HTTP ${status}: ${statusText}`, status });
  }
  if (contentType.includes("application/json")) {
    return response.json() as Promise<Output>;
  }
  if (contentType.includes("text/html")) {
    return response.text() as Promise<Output>;
  }
  if (contentType.includes("application/octet-stream")) {
    return response.arrayBuffer() as Promise<Output>;
  }
  // TODO convert to either number or bool automatically
  return response.text() as Promise<Output>;
}
