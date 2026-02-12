/**
 * GCP Cloud KMS Client
 *
 * Envelope Encryption pattern:
 * 1. Generate random DEK (Data Encryption Key)
 * 2. Encrypt data with DEK (AES-256-GCM)
 * 3. Wrap DEK with KMS KEK (Key Encryption Key)
 * 4. Store: wrappedDEK + iv + authTag + ciphertext
 *
 * Environment variables:
 * - GCP_KMS_KEY_NAME: projects/{project}/locations/{location}/keyRings/{ring}/cryptoKeys/{key}
 * - GCP_KMS_CREDENTIALS: Service account JSON (base64 encoded) or file path
 */

import { KeyManagementServiceClient } from '@google-cloud/kms';
import crypto from 'crypto';
import { ENCRYPTION_CONSTANTS } from '../../crypto/types';

const { ALGORITHM, IV_LENGTH, AUTH_TAG_LENGTH, DEK_LENGTH, ENVELOPE_VERSION } =
  ENCRYPTION_CONSTANTS;

let kmsClient: KeyManagementServiceClient | null = null;

/**
 * Check if KMS is enabled
 */
export function isKMSEnabled(): boolean {
  return Boolean(getKMSKeyName());
}

/**
 * Get KMS key name (resource path)
 */
function getKMSKeyName(): string | undefined {
  try {
    return process.env.GCP_KMS_KEY_NAME;
  } catch {
    return undefined;
  }
}

/**
 * Get KMS client singleton
 */
function getKMSClient(): KeyManagementServiceClient {
  if (kmsClient) return kmsClient;

  const credentials = process.env.GCP_KMS_CREDENTIALS;

  if (credentials) {
    // base64 encoded service account JSON
    try {
      const parsed = JSON.parse(
        Buffer.from(credentials, 'base64').toString('utf-8')
      );
      kmsClient = new KeyManagementServiceClient({ credentials: parsed });
    } catch {
      // Try as JSON file path
      kmsClient = new KeyManagementServiceClient({
        keyFilename: credentials,
      });
    }
  } else {
    // Application Default Credentials (auto in GCP environments)
    kmsClient = new KeyManagementServiceClient();
  }

  return kmsClient;
}

/**
 * Wrap DEK with KMS (encrypt)
 */
async function wrapDEK(dek: Buffer): Promise<Buffer> {
  const keyName = getKMSKeyName();
  if (!keyName) throw new Error('GCP_KMS_KEY_NAME is not set');

  const client = getKMSClient();
  const [result] = await client.encrypt({
    name: keyName,
    plaintext: dek,
  });

  if (!result.ciphertext) {
    throw new Error('KMS encrypt response missing ciphertext');
  }

  return Buffer.from(result.ciphertext as Uint8Array);
}

/**
 * Unwrap DEK with KMS (decrypt)
 */
async function unwrapDEK(wrappedDEK: Buffer): Promise<Buffer> {
  const keyName = getKMSKeyName();
  if (!keyName) throw new Error('GCP_KMS_KEY_NAME is not set');

  const client = getKMSClient();
  const [result] = await client.decrypt({
    name: keyName,
    ciphertext: wrappedDEK,
  });

  if (!result.plaintext) {
    throw new Error('KMS decrypt response missing plaintext');
  }

  return Buffer.from(result.plaintext as Uint8Array);
}

/**
 * Encrypt with Envelope Encryption
 *
 * Format: version(1) + wrappedDEK_len(2, big-endian) + wrappedDEK + iv(16) + authTag(16) + ciphertext
 *
 * @returns Buffer
 */
export async function envelopeEncrypt(plainText: string): Promise<Buffer> {
  // 1. Generate random DEK
  const dek = crypto.randomBytes(DEK_LENGTH);

  // 2. Encrypt data with DEK (AES-256-GCM)
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, dek, iv);

  let encrypted = cipher.update(plainText, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag();

  // 3. Wrap DEK with KMS
  const wrappedDEK = await wrapDEK(dek);

  // 4. Combine
  const wrappedDEKLen = Buffer.alloc(2);
  wrappedDEKLen.writeUInt16BE(wrappedDEK.length, 0);

  return Buffer.concat([
    Buffer.from([ENVELOPE_VERSION]),
    wrappedDEKLen,
    wrappedDEK,
    iv,
    authTag,
    encrypted,
  ]);
}

/**
 * Decrypt with Envelope Encryption
 */
export async function envelopeDecrypt(data: Buffer): Promise<string> {
  // 1. Parse
  let offset = 0;

  const version = data[offset];
  offset += 1;

  if (version !== ENVELOPE_VERSION) {
    throw new Error(`Unsupported envelope version: ${version}`);
  }

  const wrappedDEKLen = data.readUInt16BE(offset);
  offset += 2;

  const wrappedDEK = data.subarray(offset, offset + wrappedDEKLen);
  offset += wrappedDEKLen;

  const iv = data.subarray(offset, offset + IV_LENGTH);
  offset += IV_LENGTH;

  const authTag = data.subarray(offset, offset + AUTH_TAG_LENGTH);
  offset += AUTH_TAG_LENGTH;

  const encrypted = data.subarray(offset);

  // 2. Unwrap DEK with KMS
  const dek = await unwrapDEK(wrappedDEK);

  // 3. Decrypt data with DEK
  const decipher = crypto.createDecipheriv(ALGORITHM, dek, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString('utf8');
}

/**
 * Check if data is in envelope format
 *
 * First byte is ENVELOPE_VERSION (0x02) for envelope format.
 * Legacy format has first 64 bytes as random salt.
 */
export function isEnvelopeFormat(data: Buffer): boolean {
  return data.length > 3 && data[0] === ENVELOPE_VERSION;
}

/**
 * Reset KMS client (for testing)
 */
export function resetKMSClient(): void {
  if (process.env.NODE_ENV === 'production') {
    console.warn('[security] resetKMSClient should not be called in production');
    return;
  }
  kmsClient = null;
}
