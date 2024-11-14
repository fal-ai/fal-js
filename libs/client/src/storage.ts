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

type CdnAuthToken = {
  base_url: string;
  expires_at: string;
  token: string;
  token_type: string;
};

function isExpired(token: CdnAuthToken): boolean {
  return new Date().getTime() >= new Date(token.expires_at).getTime();
}

interface TokenManager {
  token: CdnAuthToken | null;

  fetchToken(config: RequiredConfig): Promise<CdnAuthToken>;

  getToken(config: RequiredConfig): Promise<CdnAuthToken>;
}

type UploadCdnResponse = {
  access_url: string;
};

const tokenManager: TokenManager = {
  token: null,
  async getToken(config: RequiredConfig) {
    if (!tokenManager.token || isExpired(tokenManager.token)) {
      tokenManager.token = await tokenManager.fetchToken(config);
    }
    return tokenManager.token;
  },
  async fetchToken(config: RequiredConfig): Promise<CdnAuthToken> {
    return dispatchRequest<object, CdnAuthToken>({
      method: "POST",
      targetUrl: `${getRestApiUrl()}/storage/auth/token?storage_type=fal-cdn-v3`,
      config: config,
      input: {},
    });
  },
};

async function uploadFile(file: Blob, config: RequiredConfig) {
  const token = await tokenManager.getToken(config);
  const response = await fetch(`${token.base_url}/files/upload`, {
    method: "POST",
    headers: {
      Authorization: `${token.token_type} ${token.token}`,
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });
  const result: UploadCdnResponse = await response.json();
  return result.access_url;
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
      return await uploadFile(file, config);
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
