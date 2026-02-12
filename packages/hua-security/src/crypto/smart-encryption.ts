/**
 * Smart Encryption Layer
 *
 * Automatically selects encryption method:
 * - If KMS is enabled: use envelope encryption
 * - Otherwise: fall back to PBKDF2
 *
 * For decryption, auto-detects format and uses appropriate method.
 */

import {
  isKMSEnabled,
  envelopeEncrypt,
  envelopeDecrypt,
  isEnvelopeFormat,
} from '../pro/kms/kms-client';
import { pbkdf2Encrypt, pbkdf2Decrypt, isPBKDF2Format } from './legacy-pbkdf2';

/**
 * Encrypt using the best available method
 *
 * - If KMS is enabled: envelope encryption
 * - Otherwise: PBKDF2 (legacy)
 */
export async function encryptSmart(plainText: string): Promise<Buffer> {
  if (isKMSEnabled()) {
    return envelopeEncrypt(plainText);
  }
  return pbkdf2Encrypt(plainText);
}

/**
 * Decrypt with auto-detection of format
 *
 * - Envelope format (0x02 prefix): KMS decryption
 * - Legacy format: PBKDF2 decryption
 */
export async function decryptSmart(data: Buffer): Promise<string> {
  if (isEnvelopeFormat(data)) {
    return envelopeDecrypt(data);
  }
  if (isPBKDF2Format(data)) {
    return pbkdf2Decrypt(data);
  }
  throw new Error('Unknown encryption format');
}

/**
 * Check current encryption method
 */
export function getEncryptionMethod(): 'kms' | 'pbkdf2' {
  return isKMSEnabled() ? 'kms' : 'pbkdf2';
}
