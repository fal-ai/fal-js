import { getConfig } from './config';
import { dispatchRequest } from './request';

export type UploadOptions = {
  filename?: string;
};

/**
 * File support for the client. This interface establishes the contract for
 * uploading files to the server and transforming the input to replace file
 * objects with URLs.
 */
export interface StorageSupport {
  /**
   * Upload a file to the server. Returns the URL of the uploaded file.
   * @param file the file to upload
   * @param options optional parameters, such as custom file name
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

function isDataUri(uri: string): boolean {
  // avoid uri parsing if it doesn't start with data:
  if (!uri.startsWith('data:')) {
    return false;
  }
  try {
    const url = new URL(uri);
    return url.protocol === 'data:';
  } catch (_) {
    return false;
  }
}

type UploadSignatureResponse = {
  signature: string;
};

type UploadSignatureData = {
  file_name: string;
  file_size: number;
};

async function createUploadSignature(file: Blob): Promise<string> {
  const { signature } = await dispatchRequest<
    UploadSignatureData,
    UploadSignatureResponse
  >('POST', 'https://rest.alpha.fal.ai/storage/upload/signature', {
    file_name: file.name,
    file_size: file.size,
  });
  return signature;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type KeyValuePair = [string, any];

export const storageImpl: StorageSupport = {
  upload: async (file: Blob, options?: UploadOptions) => {
    const signature = await createUploadSignature(file);

    const { filename } = options || {};
    const formData = new FormData();
    formData.append('file', file, filename ?? file.name);
    const response = await fetch(
      'https://rest.alpha.fal.ai/storage/upload/signed',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Signature ${signature}`,
          ContentType: 'multipart/form-data',
        },
        body: formData,
      }
    );
    const { responseHandler } = getConfig();
    const { url } = await responseHandler(response);
    return url;
  },

  transformInput: async (input: Record<string, any>) => {
    const promises = Object.entries(input).map(async ([key, value]) => {
      if (
        value instanceof Blob ||
        (typeof value === 'string' && isDataUri(value))
      ) {
        let blob = value;
        // if string is a data uri, convert to blob
        if (typeof value === 'string' && isDataUri(value)) {
          const response = await fetch(value);
          blob = await response.blob();
        }
        const url = await storageImpl.upload(blob as Blob);
        return [key, url];
      }
      return [key, value] as KeyValuePair;
    });
    const results = await Promise.all(promises);
    return Object.fromEntries(results);
  },
};
