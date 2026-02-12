import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { pbkdf2Encrypt, pbkdf2Decrypt, isPBKDF2Format } from '../crypto/legacy-pbkdf2';

describe('legacy-pbkdf2', () => {
  const originalKey = process.env.ENCRYPTION_KEY;

  beforeAll(() => {
    process.env.ENCRYPTION_KEY = 'test-encryption-key-that-is-at-least-32-characters-long';
  });

  afterAll(() => {
    if (originalKey) process.env.ENCRYPTION_KEY = originalKey;
    else delete process.env.ENCRYPTION_KEY;
  });

  it('should encrypt and decrypt', () => {
    const text = 'Hello, World!';
    expect(pbkdf2Decrypt(pbkdf2Encrypt(text))).toBe(text);
  });

  it('should handle unicode', () => {
    const text = '안녕하세요 🌸';
    expect(pbkdf2Decrypt(pbkdf2Encrypt(text))).toBe(text);
  });

  it('should produce different ciphertext', () => {
    const e1 = pbkdf2Encrypt('test');
    const e2 = pbkdf2Encrypt('test');
    expect(e1.equals(e2)).toBe(false);
  });

  it('should throw when ENCRYPTION_KEY missing', () => {
    const key = process.env.ENCRYPTION_KEY;
    delete process.env.ENCRYPTION_KEY;
    expect(() => pbkdf2Encrypt('test')).toThrow('ENCRYPTION_KEY is not set');
    process.env.ENCRYPTION_KEY = key;
  });

  it('should handle empty string', () => {
    expect(pbkdf2Decrypt(pbkdf2Encrypt(''))).toBe('');
  });

  it('should handle long content', () => {
    const text = 'a'.repeat(10000);
    expect(pbkdf2Decrypt(pbkdf2Encrypt(text))).toBe(text);
  });

  it('should handle special chars', () => {
    const text = '!@#$%^&*()';
    expect(pbkdf2Decrypt(pbkdf2Encrypt(text))).toBe(text);
  });

  it('should produce buffer of expected minimum size', () => {
    const result = pbkdf2Encrypt('test');
    expect(result.length).toBeGreaterThanOrEqual(96); // salt(64) + iv(16) + authTag(16)
  });

  it('should fail decrypt with corrupted authTag', () => {
    const encrypted = pbkdf2Encrypt('test');
    encrypted[70] = encrypted[70] ^ 0xff; // corrupt byte in authTag region
    expect(() => pbkdf2Decrypt(encrypted)).toThrow();
  });

  it('should fail decrypt with corrupted ciphertext', () => {
    const encrypted = pbkdf2Encrypt('test');
    encrypted[encrypted.length - 1] = encrypted[encrypted.length - 1] ^ 0xff;
    expect(() => pbkdf2Decrypt(encrypted)).toThrow();
  });

  it('should handle JSON content', () => {
    const json = JSON.stringify({ test: true });
    expect(pbkdf2Decrypt(pbkdf2Encrypt(json))).toBe(json);
  });

  it('should handle multiline', () => {
    const text = 'line1\nline2\nline3';
    expect(pbkdf2Decrypt(pbkdf2Encrypt(text))).toBe(text);
  });

  describe('isPBKDF2Format', () => {
    it('should detect PBKDF2', () => {
      expect(isPBKDF2Format(pbkdf2Encrypt('test'))).toBe(true);
    });
    it('should reject envelope format', () => {
      const data = Buffer.alloc(100);
      data[0] = 0x02;
      expect(isPBKDF2Format(data)).toBe(false);
    });
    it('should reject too-small buffers', () => {
      expect(isPBKDF2Format(Buffer.alloc(50))).toBe(false);
    });
    it('should accept exactly 96 bytes', () => {
      const buf = Buffer.alloc(96);
      buf[0] = 0x01;
      expect(isPBKDF2Format(buf)).toBe(true);
    });
  });
});
