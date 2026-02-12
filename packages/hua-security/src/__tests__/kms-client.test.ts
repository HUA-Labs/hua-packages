import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Create shared mock functions
const mockEncrypt = vi.fn();
const mockDecrypt = vi.fn();

// Mock @google-cloud/kms before importing
vi.mock('@google-cloud/kms', () => {
  return {
    KeyManagementServiceClient: class MockKMSClient {
      encrypt = mockEncrypt;
      decrypt = mockDecrypt;
    }
  };
});

import { isKMSEnabled, isEnvelopeFormat, resetKMSClient, envelopeEncrypt, envelopeDecrypt } from '../pro/kms/kms-client';
import { ENCRYPTION_CONSTANTS } from '../crypto/types';

// Get the mock functions
const getMocks = () => {
  return { mockEncrypt, mockDecrypt };
};

describe('kms-client', () => {
  afterEach(() => {
    delete process.env.GCP_KMS_KEY_NAME;
    delete process.env.GCP_KMS_CREDENTIALS;
    resetKMSClient();
    vi.clearAllMocks();
  });

  describe('isKMSEnabled', () => {
    it('should return false when not set', () => {
      delete process.env.GCP_KMS_KEY_NAME;
      expect(isKMSEnabled()).toBe(false);
    });
    it('should return true when set', () => {
      process.env.GCP_KMS_KEY_NAME = 'projects/test/locations/us/keyRings/test/cryptoKeys/test';
      expect(isKMSEnabled()).toBe(true);
    });
    it('should return false for empty string', () => {
      process.env.GCP_KMS_KEY_NAME = '';
      expect(isKMSEnabled()).toBe(false);
    });
  });

  describe('isEnvelopeFormat', () => {
    it('should detect envelope format', () => {
      const data = Buffer.alloc(100);
      data[0] = ENCRYPTION_CONSTANTS.ENVELOPE_VERSION;
      expect(isEnvelopeFormat(data)).toBe(true);
    });
    it('should reject non-envelope', () => {
      const data = Buffer.alloc(100);
      expect(isEnvelopeFormat(data)).toBe(false);
    });
    it('should reject small buffer', () => {
      const data = Buffer.alloc(2);
      data[0] = ENCRYPTION_CONSTANTS.ENVELOPE_VERSION;
      expect(isEnvelopeFormat(data)).toBe(false);
    });
    it('should reject empty buffer', () => {
      expect(isEnvelopeFormat(Buffer.alloc(0))).toBe(false);
    });
  });

  describe('envelopeEncrypt', () => {
    it('should encrypt using KMS', async () => {
      process.env.GCP_KMS_KEY_NAME = 'projects/test/locations/us/keyRings/test/cryptoKeys/test';
      const { mockEncrypt } = getMocks();
      const wrappedKey = Buffer.from('wrapped-dek-data-here');
      mockEncrypt.mockResolvedValueOnce([{ ciphertext: wrappedKey }]);

      const result = await envelopeEncrypt('Hello World');
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result[0]).toBe(ENCRYPTION_CONSTANTS.ENVELOPE_VERSION);
      expect(mockEncrypt).toHaveBeenCalledOnce();
    });

    it('should throw when KMS key name not set', async () => {
      delete process.env.GCP_KMS_KEY_NAME;
      await expect(envelopeEncrypt('test')).rejects.toThrow('GCP_KMS_KEY_NAME');
    });

    it('should throw when KMS returns no ciphertext', async () => {
      process.env.GCP_KMS_KEY_NAME = 'projects/test/locations/us/keyRings/test/cryptoKeys/test';
      const { mockEncrypt } = getMocks();
      mockEncrypt.mockResolvedValueOnce([{ ciphertext: null }]);
      await expect(envelopeEncrypt('test')).rejects.toThrow('missing ciphertext');
    });
  });

  describe('envelopeDecrypt', () => {
    it('should decrypt KMS envelope', async () => {
      process.env.GCP_KMS_KEY_NAME = 'projects/test/locations/us/keyRings/test/cryptoKeys/test';
      const { mockEncrypt, mockDecrypt } = getMocks();

      // First encrypt
      const wrappedKey = Buffer.alloc(32, 0xAB);
      mockEncrypt.mockResolvedValueOnce([{ ciphertext: wrappedKey }]);
      const encrypted = await envelopeEncrypt('Secret message');

      // Reset client to clear singleton, then decrypt
      resetKMSClient();

      // For decrypt, mock must return the original DEK
      // We need the actual DEK that was used - extract it from the encrypt call
      const encryptCall = mockEncrypt.mock.calls[0][0];
      const originalDEK = encryptCall.plaintext;

      mockDecrypt.mockResolvedValueOnce([{ plaintext: originalDEK }]);
      const decrypted = await envelopeDecrypt(encrypted);
      expect(decrypted).toBe('Secret message');
    });

    it('should throw for unsupported version', async () => {
      const data = Buffer.alloc(100);
      data[0] = 0x99; // wrong version
      await expect(envelopeDecrypt(data)).rejects.toThrow('Unsupported envelope version');
    });

    it('should throw when KMS key name not set for decrypt', async () => {
      const data = Buffer.alloc(100);
      data[0] = ENCRYPTION_CONSTANTS.ENVELOPE_VERSION;
      data.writeUInt16BE(10, 1); // wrappedDEK length
      delete process.env.GCP_KMS_KEY_NAME;
      await expect(envelopeDecrypt(data)).rejects.toThrow('GCP_KMS_KEY_NAME');
    });

    it('should throw when KMS returns no plaintext', async () => {
      process.env.GCP_KMS_KEY_NAME = 'projects/test/locations/us/keyRings/test/cryptoKeys/test';
      const { mockDecrypt } = getMocks();
      mockDecrypt.mockResolvedValueOnce([{ plaintext: null }]);

      const data = Buffer.alloc(100);
      data[0] = ENCRYPTION_CONSTANTS.ENVELOPE_VERSION;
      data.writeUInt16BE(10, 1);
      await expect(envelopeDecrypt(data)).rejects.toThrow('missing plaintext');
    });
  });

  describe('resetKMSClient', () => {
    it('should allow creating new client after reset', () => {
      // Just verify it doesn't throw
      expect(() => resetKMSClient()).not.toThrow();
    });
  });

  describe('credential handling', () => {
    it('should accept base64 credentials', async () => {
      process.env.GCP_KMS_KEY_NAME = 'projects/test/locations/us/keyRings/test/cryptoKeys/test';
      const creds = { client_email: 'test@test.iam.gserviceaccount.com', private_key: 'key' };
      process.env.GCP_KMS_CREDENTIALS = Buffer.from(JSON.stringify(creds)).toString('base64');

      const { mockEncrypt } = getMocks();
      mockEncrypt.mockResolvedValueOnce([{ ciphertext: Buffer.from('wrapped') }]);

      // Should not throw - will use parsed credentials
      await envelopeEncrypt('test');
      expect(mockEncrypt).toHaveBeenCalled();
      delete process.env.GCP_KMS_CREDENTIALS;
    });

    it('should fall back to file path for invalid base64', async () => {
      process.env.GCP_KMS_KEY_NAME = 'projects/test/locations/us/keyRings/test/cryptoKeys/test';
      process.env.GCP_KMS_CREDENTIALS = '/path/to/credentials.json';

      const { mockEncrypt } = getMocks();
      mockEncrypt.mockResolvedValueOnce([{ ciphertext: Buffer.from('wrapped') }]);

      await envelopeEncrypt('test');
      expect(mockEncrypt).toHaveBeenCalled();
      delete process.env.GCP_KMS_CREDENTIALS;
    });
  });
});
