/**
 * @hua-labs/security
 *
 * Free tier: Encryption, rate limiting, password validation,
 * client identity, and key management.
 *
 * @example
 * ```typescript
 * import { encryptSmart, decryptSmart, createMemoryRateLimiter } from '@hua-labs/security';
 * ```
 */

// Crypto - Types
export type { EncryptionConfig, EncryptedPayload } from './crypto/types';
export { ENCRYPTION_CONSTANTS } from './crypto/types';

// Crypto - Smart Layer
export { encryptSmart, decryptSmart, getEncryptionMethod } from './crypto/smart-encryption';

// Crypto - Legacy PBKDF2
export { pbkdf2Encrypt, pbkdf2Decrypt, isPBKDF2Format } from './crypto/legacy-pbkdf2';

// Crypto - Utilities
export {
  generateSecureKey,
  checkKeyStrength,
  hashSHA256,
  hashSHA512,
  createHMAC,
  verifyHMAC,
  secureCompare,
  hashUserData,
} from './crypto/utils';

// KMS (re-exported for convenience, requires @google-cloud/kms)
export {
  isKMSEnabled,
  envelopeEncrypt,
  envelopeDecrypt,
  isEnvelopeFormat,
  resetKMSClient,
} from './pro/kms/kms-client';

// Rate Limiting
export {
  createMemoryRateLimiter,
  RateLimitExceededError,
} from './rate-limit/memory-rate-limiter';
export type {
  RateLimitResult,
  MemoryRateLimiterConfig,
} from './rate-limit/memory-rate-limiter';

export { createStorageRateLimiter } from './rate-limit/storage-rate-limiter';

export { RATE_LIMIT_PRESETS } from './rate-limit/presets';
export type {
  RateLimitPreset,
  RateLimitPresetName,
} from './rate-limit/presets';

// Password Validation
export { validatePassword } from './password/validator';

// HTTP Client Identity
export {
  getClientIP,
  getUserAgent,
  isAllowedBot,
  isNormalMobileUserAgent,
  isSuspiciousUserAgent,
} from './http/client-identity';
export type { RequestWithHeaders } from './http/client-identity';

// Key Management
export { KeyManager } from './key-management/key-manager';
export type { KeyType, KeyInfo, KeyManagerConfig } from './key-management/key-manager';
