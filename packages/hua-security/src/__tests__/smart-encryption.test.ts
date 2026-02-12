import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

// Mock @google-cloud/kms before importing smart-encryption
vi.mock('@google-cloud/kms', () => {
  return {
    KeyManagementServiceClient: class MockKMSClient {
      encrypt = vi.fn();
      decrypt = vi.fn();
    }
  };
});

import { encryptSmart, decryptSmart, getEncryptionMethod } from '../crypto/smart-encryption';

describe('smart-encryption', () => {
  beforeAll(() => {
    delete process.env.GCP_KMS_KEY_NAME;
    process.env.ENCRYPTION_KEY = 'test-encryption-key-that-is-at-least-32-characters-long';
  });

  afterAll(() => {
    delete process.env.ENCRYPTION_KEY;
  });

  it('should use pbkdf2 when KMS disabled', () => {
    expect(getEncryptionMethod()).toBe('pbkdf2');
  });

  it('should encrypt and decrypt', async () => {
    const text = 'Hello, World!';
    expect(await decryptSmart(await encryptSmart(text))).toBe(text);
  });

  it('should handle unicode', async () => {
    const text = '일기 🌸';
    expect(await decryptSmart(await encryptSmart(text))).toBe(text);
  });

  it('should produce non-deterministic ciphertext', async () => {
    const a = await encryptSmart('test');
    const b = await encryptSmart('test');
    expect(a.equals(b)).toBe(false);
  });

  it('should handle empty string', async () => {
    const encrypted = await encryptSmart('');
    expect(await decryptSmart(encrypted)).toBe('');
  });

  it('should handle long content', async () => {
    const text = '한국어 테스트 '.repeat(1000);
    expect(await decryptSmart(await encryptSmart(text))).toBe(text);
  });

  it('should handle special characters', async () => {
    const text = '!@#$%^&*(){}[]|\\:";\'<>?,./~`';
    expect(await decryptSmart(await encryptSmart(text))).toBe(text);
  });

  it('should handle emoji', async () => {
    const text = '😀🎉🌸💕';
    expect(await decryptSmart(await encryptSmart(text))).toBe(text);
  });

  it('should handle multiline', async () => {
    const text = 'line1\nline2\nline3';
    expect(await decryptSmart(await encryptSmart(text))).toBe(text);
  });

  it('should throw for unknown format', async () => {
    const buf = Buffer.alloc(10, 0xff);
    await expect(decryptSmart(buf)).rejects.toThrow('Unknown encryption format');
  });

  it('should return buffer from encrypt', async () => {
    const result = await encryptSmart('test');
    expect(Buffer.isBuffer(result)).toBe(true);
  });

  it('should produce buffer longer than plaintext', async () => {
    const result = await encryptSmart('test');
    expect(result.length).toBeGreaterThan(4);
  });

  it('should handle JSON content', async () => {
    const json = JSON.stringify({ key: 'value', num: 42 });
    expect(await decryptSmart(await encryptSmart(json))).toBe(json);
  });

  it('should handle CJK characters', async () => {
    const text = '漢字テスト日本語';
    expect(await decryptSmart(await encryptSmart(text))).toBe(text);
  });

  it('should fail to decrypt with wrong key', async () => {
    const encrypted = await encryptSmart('test');
    const origKey = process.env.ENCRYPTION_KEY;
    process.env.ENCRYPTION_KEY = 'different-key-that-is-also-32-chars-or-more';
    await expect(decryptSmart(encrypted)).rejects.toThrow();
    process.env.ENCRYPTION_KEY = origKey;
  });
});
