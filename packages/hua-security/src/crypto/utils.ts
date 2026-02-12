/**
 * Encryption utilities
 */

import crypto from 'crypto';

/**
 * Generate a cryptographically secure random key
 *
 * @param length Key length in bytes (default: 32 for 256-bit)
 * @returns Hex-encoded key string
 */
export function generateSecureKey(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Check key strength
 *
 * @param key The key to check
 * @returns Object with strength assessment
 */
export function checkKeyStrength(key: string): {
  isStrong: boolean;
  length: number;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
  hasSpecial: boolean;
  entropy: number;
} {
  const hasUppercase = /[A-Z]/.test(key);
  const hasLowercase = /[a-z]/.test(key);
  const hasNumbers = /[0-9]/.test(key);
  const hasSpecial = /[^A-Za-z0-9]/.test(key);

  // Calculate character set size
  let charsetSize = 0;
  if (hasUppercase) charsetSize += 26;
  if (hasLowercase) charsetSize += 26;
  if (hasNumbers) charsetSize += 10;
  if (hasSpecial) charsetSize += 32;

  // Calculate entropy (bits)
  const entropy = key.length * Math.log2(charsetSize || 1);

  // Consider strong if entropy >= 128 bits
  const isStrong = entropy >= 128;

  return {
    isStrong,
    length: key.length,
    hasUppercase,
    hasLowercase,
    hasNumbers,
    hasSpecial,
    entropy: Math.round(entropy),
  };
}

/**
 * Hash data with SHA-256
 *
 * @param data Data to hash
 * @returns Hex-encoded hash
 */
export function hashSHA256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Hash data with SHA-512
 *
 * @param data Data to hash
 * @returns Hex-encoded hash
 */
export function hashSHA512(data: string): string {
  return crypto.createHash('sha512').update(data).digest('hex');
}

/**
 * Create HMAC signature
 *
 * @param data Data to sign
 * @param secret Secret key
 * @param algorithm Hash algorithm (default: sha256)
 * @returns Hex-encoded HMAC
 */
export function createHMAC(
  data: string,
  secret: string,
  algorithm: 'sha256' | 'sha512' = 'sha256'
): string {
  return crypto.createHmac(algorithm, secret).update(data).digest('hex');
}

/**
 * Verify HMAC signature
 *
 * @param data Original data
 * @param signature HMAC signature to verify
 * @param secret Secret key
 * @param algorithm Hash algorithm (default: sha256)
 * @returns Whether signature is valid
 */
export function verifyHMAC(
  data: string,
  signature: string,
  secret: string,
  algorithm: 'sha256' | 'sha512' = 'sha256'
): boolean {
  try {
    const expected = createHMAC(data, secret, algorithm);
    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/**
 * Hash user data with SHA-256 (wrapper for hashSHA256)
 *
 * Used for searchable hashes of emails, usernames, etc.
 *
 * @param data Data to hash
 * @returns Hex-encoded SHA-256 hash
 * @throws Error if data is empty
 */
export function hashUserData(data: string): string {
  if (!data) {
    throw new Error('Data to hash is required');
  }
  return hashSHA256(data);
}
