import { getRestApiUrl, RequiredConfig } from "./config";
import { dispatchRequest } from "./request";
import { isPlainObject } from "./utils";

/**
 * File support for the client. This interface establishes the contract for
 * uploading files to the server and transforming the input to replace file
 * objects with URLs.
 */
export interface StorageClient {
  /**
   * Upload a file to the server. Returns the URL of the uploaded file.
   * @param file the file to upload
   * @param options optional parameters, such as custom file name
   * @returns the URL of the uploaded file
   */
  upload: (file: Blob) => Promise<string>;

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
  const [_, fileType] = contentType.split("/");
  return fileType.split(/[-;]/)[0] ?? "bin";
}

/**
 * Initiate the upload of a file to the server. This returns the URL to upload
 * the file to and the URL of the file once it is uploaded.
 *
 * @param file the file to upload
 * @returns the URL to upload the file to and the URL of the file once it is uploaded.
 */
async function initiateUpload(
  file: Blob,
  config: RequiredConfig,
): Promise<InitiateUploadResult> {
  const contentType = file.type || "application/octet-stream";
  const filename =
    file.name || `${Date.now()}.${getExtensionFromContentType(contentType)}`;
  return await dispatchRequest<InitiateUploadData, InitiateUploadResult>({
    method: "POST",
    targetUrl: `${getRestApiUrl()}/storage/upload/initiate`,
    input: {
      content_type: contentType,
      file_name: filename,
    },
    config,
  });
}

class CdnToken {
  constructor(
    public token: string,
    public tokenType: string,
    public baseUploadUrl: string,
    public expiresAt: Date,
  ) {}

  isExpired(): boolean {
    return new Date().getTime() >= this.expiresAt.getTime();
  }
}

type AuthTokenRequest = object;
type AuthTokenResponse = {
  token: string;
  token_type: string;
  base_upload_url: string;
  expires_at: string;
};

class CdnTokenManager {
  private token: CdnToken;

  constructor(private config: RequiredConfig) {
    this.token = new CdnToken("", "", "", new Date(0));
  }

  async getToken(): Promise<CdnToken> {
    if (this.token.isExpired()) {
      this.token = await this.fetchToken();
    }
    return this.token;
  }

  private async fetchToken(): Promise<CdnToken> {
    const response = await dispatchRequest<AuthTokenRequest, AuthTokenResponse>({
      method: "POST",
      targetUrl: `${getRestApiUrl()}/storage/auth/token?storage_type=fal-cdn-v3`,
      config: this.config,
    });
    return new CdnToken(
      response.token,
      response.token_type,
      response.base_upload_url,
      new Date(response.expires_at),
    );
  }
}

type UploadCdnResponse = {
  access_url: string;
};

async function uploadCdn(
  file: Blob,
  config: RequiredConfig,
) {
  const tokenManager = new CdnTokenManager(config);
  const token = await tokenManager.getToken();
  const response = await dispatchRequest<Blob, UploadCdnResponse>({
    method: "POST",
    targetUrl: `${token.baseUploadUrl}/files/upload`,
    input: file,
    config,
    headers: {
     Authorization: `${token.tokenType} ${token.token}`,
    },
  });
  return response.access_url;
}

async function uploadLegacy(file: Blob, config: RequiredConfig) {
  const { fetch, responseHandler } = config;
  const { upload_url: uploadUrl, file_url: url } = await initiateUpload(
    file,
    config,
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
    upload: async (file: Blob) => {
      return await uploadCdn(file, config);
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
