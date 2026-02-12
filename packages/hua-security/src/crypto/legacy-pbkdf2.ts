/**
 * Legacy PBKDF2 encryption for backward compatibility
 *
 * Format: salt(64) + iv(16) + authTag(16) + ciphertext
 *
 * DEPRECATED: Use envelope encryption with KMS instead.
 * This is kept for decrypting existing data during migration.
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SALT_LENGTH = 64;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const PBKDF2_ITERATIONS = 100000;

/**
 * Get encryption key from environment
 */
function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY is not set');
  }
  return key;
}

/**
 * Derive key from password using PBKDF2
 */
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(
    password,
    salt,
    PBKDF2_ITERATIONS,
    KEY_LENGTH,
    'sha256'
  );
}

/**
 * Encrypt with PBKDF2 (legacy)
 *
 * @deprecated Use envelopeEncrypt instead
 */
export function pbkdf2Encrypt(plainText: string): Buffer {
  const password = getEncryptionKey();
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = deriveKey(password, salt);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plainText, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([salt, iv, authTag, encrypted]);
}

/**
 * Decrypt with PBKDF2 (legacy)
 */
export function pbkdf2Decrypt(data: Buffer): string {
  const password = getEncryptionKey();

  const salt = data.subarray(0, SALT_LENGTH);
  const iv = data.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = data.subarray(
    SALT_LENGTH + IV_LENGTH,
    SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH
  );
  const encrypted = data.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);

  const key = deriveKey(password, salt);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString('utf8');
}

/**
 * Check if data is in legacy PBKDF2 format
 *
 * Legacy format starts with 64-byte random salt (not 0x02)
 */
export function isPBKDF2Format(data: Buffer): boolean {
  // Minimum size: salt(64) + iv(16) + authTag(16) + ciphertext (can be empty)
  return data.length >= 96 && data[0] !== 0x02;
}
