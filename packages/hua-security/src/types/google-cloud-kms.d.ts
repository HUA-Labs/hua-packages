declare module '@google-cloud/kms' {
  interface EncryptRequest {
    name?: string;
    plaintext?: Buffer | Uint8Array;
  }

  interface DecryptRequest {
    name?: string;
    ciphertext?: Buffer | Uint8Array;
  }

  interface EncryptResponse {
    ciphertext?: Buffer | Uint8Array | null;
  }

  interface DecryptResponse {
    plaintext?: Buffer | Uint8Array | null;
  }

  interface ClientOptions {
    credentials?: Record<string, unknown>;
    keyFilename?: string;
  }

  class KeyManagementServiceClient {
    constructor(options?: ClientOptions);
    encrypt(request: EncryptRequest): Promise<[EncryptResponse]>;
    decrypt(request: DecryptRequest): Promise<[DecryptResponse]>;
  }
}
