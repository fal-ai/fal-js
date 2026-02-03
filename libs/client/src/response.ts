import { RequiredConfig } from "./config";
import { REQUEST_TIMEOUT_TYPE_HEADER } from "./headers";
import { Result, ValidationErrorInfo } from "./types/common";

export type ResponseHandler<Output> = (response: Response) => Promise<Output>;

const REQUEST_ID_HEADER = "x-fal-request-id";

export type ResponseHandlerCreator<Output> = (
  config: RequiredConfig,
) => ResponseHandler<Output>;

type ApiErrorArgs = {
  message: string;
  status: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
  requestId?: string;
  /**
   * The type of timeout that occurred. If "user", this was a user-specified
   * timeout via startTimeout and should NOT be retried.
   */
  timeoutType?: string;
};

export class ApiError<Body> extends Error {
  public readonly status: number;
  public readonly body: Body;
  public readonly requestId: string;
  public readonly timeoutType?: string;
  constructor({ message, status, body, requestId, timeoutType }: ApiErrorArgs) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    this.requestId = requestId || "";
    this.timeoutType = timeoutType;
  }

  /**
   * Returns true if this error was caused by a user-specified timeout
   * (via startTimeout parameter). These errors should NOT be retried.
   */
  get isUserTimeout(): boolean {
    return this.status === 504 && this.timeoutType === "user";
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
  const requestId = response.headers.get(REQUEST_ID_HEADER) || undefined;
  const timeoutType =
    response.headers.get(REQUEST_TIMEOUT_TYPE_HEADER) || undefined;
  if (!response.ok) {
    if (contentType.includes("application/json")) {
      const body = await response.json();
      const ErrorType = status === 422 ? ValidationError : ApiError;
      throw new ErrorType({
        message: body.message || statusText,
        status,
        body,
        requestId,
        timeoutType,
      });
    }
    throw new ApiError({
      message: `HTTP ${status}: ${statusText}`,
      status,
      requestId,
      timeoutType,
    });
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

export async function resultResponseHandler<Output>(
  response: Response,
): Promise<Result<Output>> {
  const data = await defaultResponseHandler<Output>(response);
  return {
    data,
    requestId: response.headers.get(REQUEST_ID_HEADER) || "",
  } satisfies Result<Output>;
}
