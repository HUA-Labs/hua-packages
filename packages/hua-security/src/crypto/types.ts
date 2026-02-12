/**
 * Encryption configuration
 */
export interface EncryptionConfig {
  /**
   * GCP KMS key resource name
   * Format: projects/{project}/locations/{location}/keyRings/{ring}/cryptoKeys/{key}
   */
  kmsKeyName?: string;

  /**
   * GCP service account credentials (base64 encoded JSON or file path)
   */
  kmsCredentials?: string;
}

/**
 * Encryption algorithm constants
 */
export const ENCRYPTION_CONSTANTS = {
  ALGORITHM: 'aes-256-gcm',
  IV_LENGTH: 16,
  AUTH_TAG_LENGTH: 16,
  DEK_LENGTH: 32, // 256 bits
  ENVELOPE_VERSION: 0x02,
} as const;

/**
 * Encryption result with metadata
 */
export interface EncryptedPayload {
  data: Buffer;
  version: number;
  isEnvelope: boolean;
}
