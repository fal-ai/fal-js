import { getRestApiUrl, RequiredConfig } from "./config";
import { dispatchRequest } from "./request";
import { isPlainObject } from "./utils";

/**
 * Configuration for object lifecycle and storage behavior.
 */
export interface ObjectLifecyclePreference {
  /**
   * Duration in seconds before the object expires and is deleted.
   * Set to a large value (e.g., 31536000000) for effectively unlimited storage.
   *
   * Common values:
   * - 604800: 7 days
   * - 2592000: 30 days
   * - 31536000: 1 year
   * - 31536000000: ~1000 years (effectively unlimited)
   */
  expiration_duration_seconds?: number;

  /**
   * Whether to allow I/O storage for this object.
   * @default undefined (uses account default)
   */
  allow_io_storage?: boolean;
}

/**
 * Helper constants for common lifecycle durations.
 */
export const LIFECYCLE_DURATIONS = {
  ONE_DAY: 86400,
  ONE_WEEK: 604800,
  ONE_MONTH: 2592000,
  ONE_YEAR: 31536000,
  UNLIMITED: 31536000000, // ~1000 years
} as const;

/**
 * Options for uploading a file.
 */
export type UploadOptions = {
  /**
   * Custom lifecycle configuration for the uploaded file.
   * This object will be sent as the X-Fal-Object-Lifecycle header.
   */
  lifecycle?: ObjectLifecyclePreference;
};

/**
 * File support for the client. This interface establishes the contract for
 * uploading files to the server and transforming the input to replace file
 * objects with URLs.
 */
export interface StorageClient {
  /**
   * Upload a file to the server. Returns the URL of the uploaded file.
   * @param file the file to upload
   * @param options optional parameters, such as lifecycle configuration
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
  lifecycle?: ObjectLifecyclePreference,
): Promise<InitiateUploadResult> {
  const filename =
    file.name || `${Date.now()}.${getExtensionFromContentType(contentType)}`;

  const headers: Record<string, string> = {};
  if (lifecycle) {
    headers["X-Fal-Object-Lifecycle"] = JSON.stringify(lifecycle);
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
  lifecycle?: ObjectLifecyclePreference,
): Promise<InitiateUploadResult> {
  const filename =
    file.name || `${Date.now()}.${getExtensionFromContentType(contentType)}`;

  const headers: Record<string, string> = {};
  if (lifecycle) {
    headers["X-Fal-Object-Lifecycle"] = JSON.stringify(lifecycle);
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

async function partUploadRetries(
  uploadUrl: string,
  chunk: Blob,
  config: RequiredConfig,
  tries = 3,
): Promise<MultipartObject> {
  if (tries === 0) {
    throw new Error("Part upload failed, retries exhausted");
  }

  const { fetch, responseHandler } = config;

  try {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: chunk,
    });

    return (await responseHandler(response)) as MultipartObject;
  } catch (error) {
    return await partUploadRetries(uploadUrl, chunk, config, tries - 1);
  }
}

async function multipartUpload(
  file: Blob,
  config: RequiredConfig,
  lifecycle?: ObjectLifecyclePreference,
): Promise<string> {
  const { fetch, responseHandler } = config;
  const contentType = file.type || "application/octet-stream";
  const { upload_url: uploadUrl, file_url: url } =
    await initiateMultipartUpload(file, config, contentType, lifecycle);

  // Break the file into 10MB chunks
  const chunkSize = 10 * 1024 * 1024;
  const chunks = Math.ceil(file.size / chunkSize);

  const parsedUrl = new URL(uploadUrl);

  const responses: MultipartObject[] = [];

  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);

    const chunk = file.slice(start, end);

    const partNumber = i + 1;
    // {uploadUrl}/{part_number}?uploadUrlParams=...
    const partUploadUrl = `${parsedUrl.origin}${parsedUrl.pathname}/${partNumber}${parsedUrl.search}`;

    responses.push(await partUploadRetries(partUploadUrl, chunk, config));
  }

  // Complete the upload
  const completeUrl = `${parsedUrl.origin}${parsedUrl.pathname}/complete${parsedUrl.search}`;
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
      const lifecycle = options?.lifecycle;

      // Check for 90+ MB file size to do multipart upload
      if (file.size > 90 * 1024 * 1024) {
        return await multipartUpload(file, config, lifecycle);
      }

      const contentType = file.type || "application/octet-stream";

      const { fetch, responseHandler } = config;
      const { upload_url: uploadUrl, file_url: url } = await initiateUpload(
        file,
        config,
        contentType,
        lifecycle,
      );
      const response = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
      });
      await responseHandler(response);
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
