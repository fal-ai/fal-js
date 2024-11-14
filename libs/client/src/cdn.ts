import { getRestApiUrl, RequiredConfig } from "./config";
import { dispatchRequest } from "./request";
import { StorageClient } from "./storage";
import { isPlainObject } from "./utils";

type AuthTokenRequest = {};

/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
type AuthTokenResponse = {
  token: string;
  created_at: string;
  expires_at: string;
  token_type?: string;
  base_url?: string;
};

/**
 * Auth Token
 * @returns AuthTokenResponse Successful Response
 * @throws ApiError
 */
async function authToken(
  storage_type: string,
  config: RequiredConfig,
): Promise<AuthTokenResponse> {
  return await dispatchRequest<AuthTokenRequest, AuthTokenResponse>({
    method: "POST",
    targetUrl: `${getRestApiUrl()}/storage/auth/token?storage_type=${storage_type}`,
    input: {},
    config,
  });
}

type CDNUploadResponse = {
  access_url: string;
  uploaded: boolean;
};

/**
 * CDN Direct Upload
 * @returns CDNUploadResponse Successful Response
 */
async function cdnDirectUpload(
  token: CDNToken,
  file: Blob,
  config: RequiredConfig,
): Promise<CDNUploadResponse> {
  const { fetch, responseHandler } = config;
  const response = await fetch(`${token.baseUploadUrl}/files/upload`, {
    method: "POST",
    body: file,
    headers: {
      Authorization: `${token.tokenType} ${token.token}`,
    },
  });

  return await responseHandler(response);
}

class CDNToken {
  public token: string;
  public tokenType: string;
  public baseUploadUrl: string;
  public expiresAt: Date;

  constructor(tokenResponse: AuthTokenResponse) {
    this.token = tokenResponse.token;
    this.tokenType = tokenResponse.token_type ?? "Bearer";

    if (tokenResponse.base_url === undefined) {
      throw new Error("base_url is required");
    }

    this.baseUploadUrl = tokenResponse.base_url ?? "";
    this.expiresAt = new Date(tokenResponse.expires_at);
  }

  isExpired(): boolean {
    return new Date().getTime() >= this.expiresAt.getTime();
  }
}

class CDNTokenManager {
  private token?: CDNToken;
  private storageType: string = "fal-cdn-v3";

  constructor(private config: RequiredConfig) {}

  async get(): Promise<CDNToken> {
    if (!this.token) {
      this.token = await this.fetch();
    } else if (this.token.isExpired()) {
      this.token = await this.fetch();
    }

    return this.token;
  }

  private async fetch(): Promise<CDNToken> {
    const response = await authToken(this.storageType, this.config);
    return new CDNToken(response);
  }
}

class CDNStorageCLient implements StorageClient {
  private tokenManager: CDNTokenManager;

  constructor(private config: RequiredConfig) {
    this.tokenManager = new CDNTokenManager(config);
  }

  async upload(file: Blob): Promise<string> {
    const token = await this.tokenManager.get();
    const upload = await cdnDirectUpload(token, file, this.config);

    return upload.access_url;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // NOTE: Copy from the storage client
  async transformInput(input: any): Promise<any> {
    if (Array.isArray(input)) {
      return Promise.all(input.map((item) => this.transformInput(item)));
    } else if (input instanceof Blob) {
      return await this.upload(input);
    } else if (isPlainObject(input)) {
      const inputObject = input as Record<string, any>;
      const promises = Object.entries(inputObject).map(
        async ([key, value]): Promise<KeyValuePair> => {
          return [key, await this.transformInput(value)];
        },
      );
      const results = await Promise.all(promises);
      return Object.fromEntries(results);
    }
    // Return the input as is if it's neither an object nor a file/blob/data URI
    return input;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type KeyValuePair = [string, any];

type StorageClientDependencies = {
  config: RequiredConfig;
};

export function createCDNClient({
  config,
}: StorageClientDependencies): StorageClient {
  return new CDNStorageCLient(config);
}
