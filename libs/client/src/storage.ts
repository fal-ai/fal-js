import { getRestApiUrl, RequiredConfig } from "./config";
import { dispatchRequest } from "./request";
import { ApiError } from "./response";
import { calculateBackoffDelay, isRetryableError } from "./retry";
import { isPlainObject, sleep } from "./utils";

type ObjectExpiration =
  | "never"
  | "immediate"
  | "1h"
  | "1d"
  | "7d"
  | "30d"
  | "1y"
  | number;

type StorageACLDecision = "hide" | "forbid" | "allow";

export interface StorageACLRule {
  user: string;
  decision: StorageACLDecision;
}

export interface StorageACL {
  default?: StorageACLDecision;
  rules?: StorageACLRule[];
}

export const OBJECT_LIFECYCYLE_PREFERENCE_HEADER =
  "x-fal-object-lifecycle-preference";

/**
 * Configuration for object lifecycle and storage behavior.
 */
export interface StorageSettings {
  /**
   * The expiration time for the stored files (images, videos, etc.). You can specify one of the enumerated values or a number of seconds.
   */
  expiresIn?: ObjectExpiration;

  /**
   * Optional ACL configuration applied to the uploaded object.
   */
  initialAcl?: StorageACL;
}

type UploadLifecycleConfig = {
  /**
   * Duration in seconds before the object expires and is deleted.
   * Set to a large value (e.g., 31536000000) for effectively unlimited storage.
   *
   * Common values:
   * - 604800: 7 days
   * - 2592000: 30 days
   * - 31536000: 1 year
   */
  expiration_duration_seconds?: number;

  /**
   * Initial ACL for the uploaded object.
   */
  initial_acl?: StorageACL;
};

const EXPIRATION_VALUES: Record<ObjectExpiration, number | undefined> = {
  never: undefined,
  immediate: 60,
  "1h": 3600,
  "1d": 86400,
  "7d": 604800,
  "30d": 2592000,
  "1y": 31536000,
};

/**
 * Converts an `StorageSettings` to the expiration duration in seconds.
 * @param lifecycle the lifecycle preference
 * @returns the expiration duration in seconds, or undefined if not applicable
 */
export function getExpirationDurationSeconds(
  lifecycle: StorageSettings,
): number | undefined {
  const { expiresIn } = lifecycle;
  if (expiresIn === undefined) {
    return undefined;
  }
  return typeof expiresIn === "number"
    ? expiresIn
    : EXPIRATION_VALUES[expiresIn];
}

function buildUploadLifecycleConfig(
  lifecycle: StorageSettings | undefined,
): UploadLifecycleConfig | undefined {
  if (!lifecycle) {
    return undefined;
  }

  const expirationDurationSeconds = getExpirationDurationSeconds(lifecycle);
  const lifecycleConfig: UploadLifecycleConfig = {};

  if (expirationDurationSeconds !== undefined) {
    lifecycleConfig.expiration_duration_seconds = expirationDurationSeconds;
  }

  if (lifecycle.initialAcl !== undefined) {
    lifecycleConfig.initial_acl = lifecycle.initialAcl;
  }

  return Object.keys(lifecycleConfig).length > 0 ? lifecycleConfig : undefined;
}

/**
 * Builds the headers for the Object Lifecycle preference to be used in API requests.
 * This is used by the queue and run APIs to control the lifecycle of generated objects.
 *
 * @param lifecycle the lifecycle preference
 * @returns a record with the `X-Fal-Object-Lifecycle-Preference` header
 */
export function buildObjectLifecycleHeaders(
  lifecycle: StorageSettings | undefined,
): Record<string, string> {
  const lifecycleConfig = buildUploadLifecycleConfig(lifecycle);
  if (!lifecycleConfig) {
    return {};
  }

  return {
    [OBJECT_LIFECYCYLE_PREFERENCE_HEADER]: JSON.stringify(lifecycleConfig),
  };
}

/**
 * Files larger than this are uploaded in parts.
 */
export const MULTIPART_THRESHOLD = 90 * 1024 * 1024;

export const DEFAULT_MULTIPART_CHUNK_SIZE = 10 * 1024 * 1024;
/**
 * Attempts per part, including the first one.
 */
export const DEFAULT_MULTIPART_PART_ATTEMPTS = 3;

/**
 * Progress of an upload, reported as bytes the server has acknowledged.
 */
export type UploadProgress = {
  /**
   * Bytes acknowledged by the server so far.
   */
  loaded: number;
  /**
   * Total size of the file in bytes.
   */
  total: number;
  /**
   * The part that just completed. Only set for multipart uploads.
   */
  partNumber?: number;
  /**
   * How many parts the file was split into. Only set for multipart uploads.
   */
  totalParts?: number;
};

/**
 * Tuning for the multipart path, used for files over {@link MULTIPART_THRESHOLD}.
 */
export type MultipartOptions = {
  /**
   * Size of each part in bytes.
   * @default 10485760 (10 MB)
   */
  chunkSize?: number;
  /**
   * Attempts per part, including the first one. Only transient failures
   * (network errors, 429, 5xx) consume an attempt.
   * @default 3
   */
  maxAttemptsPerPart?: number;
};

/**
 * Options for uploading a file.
 */
export type UploadOptions = {
  /**
   * Custom lifecycle configuration for the uploaded file.
   * This object will be sent as the X-Fal-Object-Lifecycle header.
   */
  lifecycle?: StorageSettings;

  /**
   * Called as the upload progresses. Single-shot uploads report once, on
   * completion; multipart uploads report once per part. Anything thrown here
   * is ignored so a listener cannot fail the upload.
   */
  onUploadProgress?: (progress: UploadProgress) => void;

  /**
   * Tuning for the multipart path. Ignored for files under
   * {@link MULTIPART_THRESHOLD}.
   */
  multipart?: MultipartOptions;
};

/**
 * Raised when an upload of a file split into parts cannot complete. The
 * failure that caused it is kept in `cause`, and its status and body are
 * summarized in the message.
 */
export class MultipartUploadError extends Error {
  public readonly cause: unknown;
  /**
   * The part that failed, or undefined when the failure was not part-specific.
   */
  public readonly partNumber?: number;

  constructor(message: string, cause: unknown, partNumber?: number) {
    super(`${message}: ${describeError(cause)}`);
    this.name = "MultipartUploadError";
    this.cause = cause;
    this.partNumber = partNumber;
  }
}

function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    const body =
      typeof error.body === "string" ? error.body : JSON.stringify(error.body);
    const details = body && body !== "undefined" ? ` ${body}` : "";
    return `HTTP ${error.status} ${error.message}${details}`;
  }
  return error instanceof Error ? error.message : String(error);
}

function reportProgress(
  onUploadProgress: ((progress: UploadProgress) => void) | undefined,
  progress: UploadProgress,
): void {
  if (!onUploadProgress) {
    return;
  }
  try {
    onUploadProgress(progress);
  } catch {
    // A progress listener is observational and must never fail the upload.
  }
}

/**
 * File support for the client. This interface establishes the contract for
 * uploading files to the server and transforming the input to replace file
 * objects with URLs.
 */
export interface StorageClient {
  /**
   * Upload a file to the server. Returns the URL of the uploaded file.
   *
   * Files over {@link MULTIPART_THRESHOLD} are split into parts and uploaded
   * sequentially.
   *
   * @param file the file to upload
   * @param options optional parameters, such as lifecycle configuration,
   * a progress listener and multipart tuning
   * @returns the URL of the uploaded file
   */
  upload: (file: Blob, options?: UploadOptions) => Promise<string>;

  /**
   * Transform the input to replace file objects with URLs. This is used
   * to transform the input before sending it to the server and ensures
   * that the server receives URLs instead of file objects.
   *
   * @param input the input to transform.
   * @returns the transformed input.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformInput: (input: Record<string, any>) => Promise<Record<string, any>>;
}

type InitiateUploadResult = {
  file_url: string;
  upload_url: string;
};

type InitiateUploadData = {
  file_name: string;
  content_type: string | null;
};

/**
 * Get the file extension from the content type. This is used to generate
 * a file name if the file name is not provided.
 *
 * @param contentType the content type of the file.
 * @returns the file extension or `bin` if the content type is not recognized.
 */
function getExtensionFromContentType(contentType: string): string {
  const [, fileType] = contentType.split("/");
  return fileType.split(/[-;]/)[0] ?? "bin";
}

/**
 * Initiate the upload of a file to the server. This returns the URL to upload
 * the file to and the URL of the file once it is uploaded.
 */
async function initiateUpload(
  file: Blob,
  config: RequiredConfig,
  contentType: string,
  lifecycle?: StorageSettings,
): Promise<InitiateUploadResult> {
  const filename =
    file.name || `${Date.now()}.${getExtensionFromContentType(contentType)}`;

  const headers: Record<string, string> = {};
  const lifecycleConfig = buildUploadLifecycleConfig(lifecycle);
  if (lifecycleConfig) {
    headers["X-Fal-Object-Lifecycle"] = JSON.stringify(lifecycleConfig);
  }

  return await dispatchRequest<InitiateUploadData, InitiateUploadResult>({
    method: "POST",
    // NOTE: We want to test V3 without making it the default at the API level
    targetUrl: `${getRestApiUrl()}/storage/upload/initiate?storage_type=fal-cdn-v3`,
    input: {
      content_type: contentType,
      file_name: filename,
    },
    config,
    headers,
  });
}

/**
 * Initiate the multipart upload of a file to the server. This returns the URL to upload
 * the file to and the URL of the file once it is uploaded.
 */
async function initiateMultipartUpload(
  file: Blob,
  config: RequiredConfig,
  contentType: string,
  lifecycle?: StorageSettings,
): Promise<InitiateUploadResult> {
  const filename =
    file.name || `${Date.now()}.${getExtensionFromContentType(contentType)}`;

  const headers: Record<string, string> = {};
  const lifecycleConfig = buildUploadLifecycleConfig(lifecycle);
  if (lifecycleConfig) {
    headers["X-Fal-Object-Lifecycle"] = JSON.stringify(lifecycleConfig);
  }

  return await dispatchRequest<InitiateUploadData, InitiateUploadResult>({
    method: "POST",
    targetUrl: `${getRestApiUrl()}/storage/upload/initiate-multipart?storage_type=fal-cdn-v3`,
    input: {
      content_type: contentType,
      file_name: filename,
    },
    config,
    headers,
  });
}

type MultipartObject = {
  partNumber: number;
  etag: string;
};

/**
 * Uploads a single part, retrying only failures that can succeed on a repeat
 * (network errors and the configured retryable statuses). A client error is
 * surfaced immediately instead of consuming the remaining attempts.
 */
async function uploadPart(
  uploadUrl: string,
  chunk: Blob,
  partNumber: number,
  config: RequiredConfig,
  maxAttempts: number,
): Promise<MultipartObject> {
  const { fetch, responseHandler, retry } = config;
  const attempts = Math.max(1, maxAttempts);
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const response = await fetch(uploadUrl, {
        method: "PUT",
        body: chunk,
      });
      const part = (await responseHandler(response)) as
        | Partial<MultipartObject>
        | undefined;
      // The CDN returns the etag in the body and repeats it as a header; a
      // proxy or a custom response handler may leave only the header.
      const etag = part?.etag ?? response.headers.get("etag") ?? undefined;
      if (!etag) {
        throw new Error("the response carried no etag");
      }
      return { partNumber, etag };
    } catch (error) {
      lastError = error;
      if (
        attempt === attempts - 1 ||
        !isRetryableError(error, retry.retryableStatusCodes)
      ) {
        break;
      }
      await sleep(
        calculateBackoffDelay(
          attempt,
          retry.baseDelay,
          retry.maxDelay,
          retry.backoffMultiplier,
          retry.enableJitter,
        ),
      );
    }
  }

  throw new MultipartUploadError(
    `Upload of part ${partNumber} failed`,
    lastError,
    partNumber,
  );
}

async function multipartUpload(
  file: Blob,
  config: RequiredConfig,
  options?: UploadOptions,
): Promise<string> {
  const { fetch, responseHandler } = config;
  const { onUploadProgress, multipart } = options ?? {};
  const contentType = file.type || "application/octet-stream";
  const { upload_url: uploadUrl, file_url: url } =
    await initiateMultipartUpload(
      file,
      config,
      contentType,
      options?.lifecycle,
    );

  const chunkSize = Math.max(
    1,
    multipart?.chunkSize ?? DEFAULT_MULTIPART_CHUNK_SIZE,
  );
  const chunks = Math.ceil(file.size / chunkSize);

  const parsedUrl = new URL(uploadUrl);

  let loaded = 0;
  const responses: MultipartObject[] = [];

  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);

    const chunk = file.slice(start, end);

    const partNumber = i + 1;
    // {uploadUrl}/{part_number}?uploadUrlParams=...
    const partUploadUrl = `${parsedUrl.origin}${parsedUrl.pathname}/${partNumber}${parsedUrl.search}`;

    responses.push(
      await uploadPart(
        partUploadUrl,
        chunk,
        partNumber,
        config,
        multipart?.maxAttemptsPerPart ?? DEFAULT_MULTIPART_PART_ATTEMPTS,
      ),
    );

    loaded += end - start;
    reportProgress(onUploadProgress, {
      loaded,
      total: file.size,
      partNumber,
      totalParts: chunks,
    });
  }

  // Complete the upload
  const completeUrl = `${parsedUrl.origin}${parsedUrl.pathname}/complete${parsedUrl.search}`;
  try {
    const response = await fetch(completeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parts: responses.map((mpart) => ({
          partNumber: mpart.partNumber,
          etag: mpart.etag,
        })),
      }),
    });
    await responseHandler(response);
  } catch (error) {
    throw new MultipartUploadError(
      `Completing the upload of ${chunks} parts failed`,
      error,
    );
  }

  return url;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type KeyValuePair = [string, any];

type StorageClientDependencies = {
  config: RequiredConfig;
};

export function createStorageClient({
  config,
}: StorageClientDependencies): StorageClient {
  const ref: StorageClient = {
    upload: async (file: Blob, options?: UploadOptions) => {
      if (file.size > MULTIPART_THRESHOLD) {
        return await multipartUpload(file, config, options);
      }

      const contentType = file.type || "application/octet-stream";

      const { fetch, responseHandler } = config;
      const { upload_url: uploadUrl, file_url: url } = await initiateUpload(
        file,
        config,
        contentType,
        options?.lifecycle,
      );
      const response = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
      });
      await responseHandler(response);
      // `fetch` exposes no send-side progress, so a single-shot upload can only
      // be reported once the server has acknowledged the whole body.
      reportProgress(options?.onUploadProgress, {
        loaded: file.size,
        total: file.size,
      });
      return url;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transformInput: async (input: any): Promise<any> => {
      if (Array.isArray(input)) {
        return Promise.all(input.map((item) => ref.transformInput(item)));
      } else if (input instanceof Blob) {
        return await ref.upload(input);
      } else if (isPlainObject(input)) {
        const inputObject = input as Record<string, any>;
        const promises = Object.entries(inputObject).map(
          async ([key, value]): Promise<KeyValuePair> => {
            return [key, await ref.transformInput(value)];
          },
        );
        const results = await Promise.all(promises);
        return Object.fromEntries(results);
      }
      // Return the input as is if it's neither an object nor a file/blob/data URI
      return input;
    },
  };
  return ref;
}
