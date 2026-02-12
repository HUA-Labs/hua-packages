import { describe, it, expect } from 'vitest';
import { generateSecureKey, checkKeyStrength, hashSHA256, hashSHA512, hashUserData, createHMAC, verifyHMAC, secureCompare } from '../crypto/utils';

describe('utils', () => {
  describe('generateSecureKey', () => {
    it('should generate correct length', () => {
      expect(generateSecureKey(32)).toHaveLength(64);
      expect(generateSecureKey()).toHaveLength(64);
    });
    it('should generate unique keys', () => {
      expect(generateSecureKey()).not.toBe(generateSecureKey());
    });
    it('should generate 16-byte key (32 hex chars)', () => {
      expect(generateSecureKey(16)).toHaveLength(32);
    });
    it('should generate 64-byte key (128 hex chars)', () => {
      expect(generateSecureKey(64)).toHaveLength(128);
    });
    it('should only contain hex chars', () => {
      expect(generateSecureKey()).toMatch(/^[0-9a-f]+$/);
    });
    it('should default to 32 bytes (64 hex)', () => {
      expect(generateSecureKey()).toHaveLength(64);
    });
  });

  describe('checkKeyStrength', () => {
    it('should detect weak keys', () => {
      expect(checkKeyStrength('short').isStrong).toBe(false);
    });
    it('should detect strong keys', () => {
      expect(checkKeyStrength(generateSecureKey()).isStrong).toBe(true);
    });
    it('should report correct entropy for hex key', () => {
      const result = checkKeyStrength(generateSecureKey());
      expect(result.entropy).toBeGreaterThan(128);
    });
    it('should detect all character types', () => {
      const result = checkKeyStrength('aB1!');
      expect(result.hasUppercase).toBe(true);
      expect(result.hasLowercase).toBe(true);
      expect(result.hasNumbers).toBe(true);
      expect(result.hasSpecial).toBe(true);
    });
    it('should report correct length', () => {
      expect(checkKeyStrength('test').length).toBe(4);
    });
    it('should handle empty string', () => {
      const result = checkKeyStrength('');
      expect(result.isStrong).toBe(false);
      expect(result.length).toBe(0);
    });
  });

  describe('hashSHA256', () => {
    it('should produce consistent hash', () => {
      expect(hashSHA256('test')).toBe(hashSHA256('test'));
    });
    it('should produce 64-char hex', () => {
      expect(hashSHA256('test')).toHaveLength(64);
    });
    it('should match known hash', () => {
      expect(hashSHA256('hello')).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
    });
    it('should hash unicode correctly', () => {
      expect(hashSHA256('안녕하세요')).toHaveLength(64);
      expect(hashSHA256('안녕하세요')).toBe(hashSHA256('안녕하세요'));
    });
    it('should hash empty string', () => {
      expect(hashSHA256('')).toHaveLength(64);
    });
  });

  describe('hashSHA512', () => {
    it('should produce 128-char hex', () => {
      expect(hashSHA512('test')).toHaveLength(128);
    });
    it('should produce consistent hash', () => {
      expect(hashSHA512('test')).toBe(hashSHA512('test'));
    });
    it('should produce different hash from sha256', () => {
      expect(hashSHA512('test')).not.toBe(hashSHA256('test'));
    });
  });

  describe('hashUserData', () => {
    it('should hash data', () => {
      expect(hashUserData('user@example.com')).toHaveLength(64);
    });
    it('should throw for empty', () => {
      expect(() => hashUserData('')).toThrow();
    });
  });

  describe('HMAC', () => {
    it('should create and verify', () => {
      const hmac = createHMAC('data', 'secret');
      expect(verifyHMAC('data', hmac, 'secret')).toBe(true);
      expect(verifyHMAC('data', hmac, 'wrong')).toBe(false);
    });
    it('should create sha512 HMAC', () => {
      const hmac = createHMAC('data', 'secret', 'sha512');
      expect(hmac).toHaveLength(128);
    });
    it('should verify sha512 HMAC', () => {
      const hmac = createHMAC('data', 'secret', 'sha512');
      expect(verifyHMAC('data', hmac, 'secret', 'sha512')).toBe(true);
    });
    it('should return false for invalid hex signature', () => {
      expect(verifyHMAC('data', 'not-valid-hex!!!', 'secret')).toBe(false);
    });
    it('should return false for wrong length signature', () => {
      expect(verifyHMAC('data', 'abcd', 'secret')).toBe(false);
    });
    it('should return false for tampered data', () => {
      const hmac = createHMAC('data', 'secret');
      expect(verifyHMAC('tampered', hmac, 'secret')).toBe(false);
    });
  });

  describe('secureCompare', () => {
    it('should compare strings', () => {
      expect(secureCompare('test', 'test')).toBe(true);
      expect(secureCompare('test', 'other')).toBe(false);
    });
    it('should return false for different lengths', () => {
      expect(secureCompare('abc', 'abcd')).toBe(false);
    });
    it('should handle empty strings', () => {
      expect(secureCompare('', '')).toBe(true);
    });
    it('should compare unicode strings', () => {
      expect(secureCompare('안녕', '안녕')).toBe(true);
      expect(secureCompare('안녕', '안뇽')).toBe(false);
    });
  });
});
