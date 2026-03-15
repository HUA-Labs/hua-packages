/**
 * Data encryption/decryption utility
 *
 * App-specific functions (User table PBKDF2 encryption, cache-based functions)
 * KMS encryption uses the @hua-labs/security package
 */

import crypto from "crypto";
import { getServerEnv } from "../env/env";
import { encryptSmart } from "@hua-labs/security";

// ============================================================================
// Re-export from @hua-labs/security package
// ============================================================================

export {
  // Smart Layer (auto-select between KMS + PBKDF2)
  encryptSmart,
  decryptSmart,
  getEncryptionMethod,
  // KMS
  isKMSEnabled,
  envelopeEncrypt,
  envelopeDecrypt,
  isEnvelopeFormat,
  // Utilities
  hashSHA256,
  hashSHA512,
  generateSecureKey,
  checkKeyStrength,
  hashUserData,
} from "@hua-labs/security";

// ============================================================================
// App-specific constants
// ============================================================================

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;

// ============================================================================
// App-specific utility functions
// ============================================================================

/**
 * Validate encryption key
 */
function validateEncryptionKey(key: string): void {
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set.");
  }
  const keyBuffer = Buffer.from(key, "utf-8");
  if (keyBuffer.length < 32) {
    throw new Error("ENCRYPTION_KEY must be at least 32 characters.");
  }
}

/**
 * Derive encryption key (using PBKDF2)
 */
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256");
}

/**
 * Get encryption key from environment variable
 */
function getEncryptionKey(encryptionKey?: string): string {
  const key =
    encryptionKey ||
    (() => {
      try {
        return getServerEnv().ENCRYPTION_KEY;
      } catch {
        return process.env.ENCRYPTION_KEY;
      }
    })();
  if (!key) {
    throw new Error("Encryption key not provided.");
  }
  return key;
}

// ============================================================================
// User table encryption (KMS Envelope Encryption)
// ============================================================================

/**
 * Encrypt user data (KMS)
 *
 * Used to encrypt email, nickname, etc. in the User table
 */
export async function encryptUserData(userData: string): Promise<Buffer> {
  const { encryptSmart } = await import("@hua-labs/security");
  return encryptSmart(userData);
}

/**
 * Decrypt user data (auto-detect KMS + PBKDF2)
 */
export async function decryptUserData(
  encryptedBuffer: Buffer,
): Promise<string> {
  const { decryptSmart } = await import("@hua-labs/security");
  return decryptSmart(encryptedBuffer);
}

// ============================================================================
// Legacy PBKDF2 encryption (deprecated, for fallback)
// ============================================================================

/**
 * Encrypt data (PBKDF2)
 *
 * @deprecated Migration to KMS envelope encryption complete. Use encryptSmart() instead.
 */
export function encryptData(plainText: string, encryptionKey?: string): Buffer {
  try {
    const key = getEncryptionKey(encryptionKey);
    validateEncryptionKey(key);

    const salt = crypto.randomBytes(SALT_LENGTH);
    const derivedKey = deriveKey(key, salt);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);

    let encrypted = cipher.update(plainText, "utf8");
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const authTag = cipher.getAuthTag();

    // Format: [salt(64)] + [iv(16)] + [authTag(16)] + [encryptedData]
    return Buffer.concat([salt, iv, authTag, encrypted]);
  } catch (error) {
    console.error("Error during encryption:", error);
    throw new Error("Encryption failed.", { cause: error });
  }
}

/**
 * Decrypt data (PBKDF2)
 *
 * @deprecated Migration to KMS envelope encryption complete. Use decryptSmart() instead.
 */
export function decryptData(
  encryptedBuffer: Buffer,
  encryptionKey?: string,
): string {
  try {
    const key = getEncryptionKey(encryptionKey);
    validateEncryptionKey(key);

    const salt = encryptedBuffer.subarray(0, SALT_LENGTH);
    const iv = encryptedBuffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const authTag = encryptedBuffer.subarray(
      SALT_LENGTH + IV_LENGTH,
      SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH,
    );
    const encrypted = encryptedBuffer.subarray(
      SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH,
    );

    const derivedKey = deriveKey(key, salt);
    const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString("utf8");
  } catch (error) {
    console.error("Error during decryption:", error);
    if (error instanceof Error && error.message.includes("auth")) {
      throw new Error(
        "Data integrity verification failed: data may have been tampered with.",
        { cause: error },
      );
    }
    throw new Error("Decryption failed.", { cause: error });
  }
}

// ============================================================================
// Cache-based fast encryption (session key caching) - App-specific
// ============================================================================

const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const MAX_CACHE_SIZE = 10000;

interface CachedKey {
  derivedKey: Buffer;
  salt: Buffer;
  expiresAt: number;
  lastUsed: number;
}

const keyCache = new Map<string, CachedKey>();

/**
 * Look up or generate cached derived key
 */
export function getCachedDerivedKey(
  userId: string,
  encryptionKey?: string,
): {
  derivedKey: Buffer;
  salt: Buffer;
  fromCache: boolean;
} {
  const now = Date.now();
  const cached = keyCache.get(userId);

  if (cached && now < cached.expiresAt) {
    cached.lastUsed = now;
    return {
      derivedKey: cached.derivedKey,
      salt: cached.salt,
      fromCache: true,
    };
  }

  const key = getEncryptionKey(encryptionKey);
  validateEncryptionKey(key);

  const salt = cached?.salt || crypto.randomBytes(SALT_LENGTH);
  const derivedKey = deriveKey(key, salt);

  if (keyCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = Array.from(keyCache.entries()).sort(
      (a, b) => a[1].lastUsed - b[1].lastUsed,
    )[0]?.[0];
    if (oldestKey) keyCache.delete(oldestKey);
  }

  keyCache.set(userId, {
    derivedKey,
    salt,
    expiresAt: now + CACHE_TTL,
    lastUsed: now,
  });

  return {
    derivedKey,
    salt,
    fromCache: false,
  };
}

/**
 * Fast encryption (using cached key, PBKDF2 format)
 *
 * @deprecated Migration to KMS envelope encryption complete. Use encryptSmart() instead.
 */
export function encryptFast(plainText: string, userId: string): Buffer {
  const { derivedKey, salt } = getCachedDerivedKey(userId);

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);

  let encrypted = cipher.update(plainText, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([salt, iv, authTag, encrypted]);
}

/**
 * Fast decryption (using cached key)
 *
 * @deprecated Migration to KMS envelope encryption complete. Use decryptSmart() instead.
 */
export function decryptFast(encryptedBuffer: Buffer, userId: string): string {
  const hasEmbeddedSalt =
    encryptedBuffer.length > SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH;

  let salt: Buffer;
  let iv: Buffer;
  let authTag: Buffer;
  let encrypted: Buffer;

  if (hasEmbeddedSalt && encryptedBuffer.length > 96) {
    salt = Buffer.from(encryptedBuffer.subarray(0, SALT_LENGTH));
    iv = Buffer.from(
      encryptedBuffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH),
    );
    authTag = Buffer.from(
      encryptedBuffer.subarray(
        SALT_LENGTH + IV_LENGTH,
        SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH,
      ),
    );
    encrypted = Buffer.from(
      encryptedBuffer.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH),
    );
  } else {
    const cached = keyCache.get(userId);
    if (!cached) {
      throw new Error("No cached key. Use data in the existing format.");
    }
    salt = cached.salt;
    iv = Buffer.from(encryptedBuffer.subarray(0, IV_LENGTH));
    authTag = Buffer.from(
      encryptedBuffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH),
    );
    encrypted = Buffer.from(
      encryptedBuffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH),
    );
  }

  const { derivedKey } = getCachedDerivedKey(userId);
  const cachedSalt = keyCache.get(userId)?.salt;
  let finalKey = derivedKey;

  if (cachedSalt && !salt.equals(cachedSalt)) {
    const key = getEncryptionKey();
    finalKey = deriveKey(key, salt);
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, finalKey, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString("utf8");
}

// ============================================================================
// Cache management (for debugging/testing)
// ============================================================================

export function getEncryptionCacheStats(): {
  size: number;
  maxSize: number;
  ttlMs: number;
} {
  return {
    size: keyCache.size,
    maxSize: MAX_CACHE_SIZE,
    ttlMs: CACHE_TTL,
  };
}

export function invalidateEncryptionCache(userId: string): boolean {
  return keyCache.delete(userId);
}

export function clearEncryptionCache(): void {
  keyCache.clear();
}
