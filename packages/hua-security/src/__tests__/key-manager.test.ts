import { describe, it, expect, beforeEach } from 'vitest';
import { KeyManager } from '../key-management/key-manager';

describe('KeyManager', () => {
  let manager: KeyManager;

  beforeEach(() => {
    manager = new KeyManager({
      nodeEnv: 'development',
      keys: {
        encryption: 'test-encryption-key-base64-encoded-at-least-32-chars',
        jwt: 'test-jwt-secret-key-base64-encoded-at-least-32-chars',
        api: 'test-api-key',
      },
    });
  });

  describe('getCurrentKey', () => {
    it('should return encryption key', () => {
      expect(manager.getCurrentKey('encryption')).toBe('test-encryption-key-base64-encoded-at-least-32-chars');
    });

    it('should return jwt key', () => {
      expect(manager.getCurrentKey('jwt')).toBe('test-jwt-secret-key-base64-encoded-at-least-32-chars');
    });

    it('should return api key', () => {
      expect(manager.getCurrentKey('api')).toBe('test-api-key');
    });

    it('should throw for unknown key type', () => {
      expect(() => manager.getCurrentKey('unknown' as any)).toThrow();
    });
  });

  describe('validateKeyStrength', () => {
    it('should accept strong key', () => {
      expect(manager.validateKeyStrength('a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6')).toBe(true);
    });

    it('should reject short key', () => {
      expect(manager.validateKeyStrength('short')).toBe(false);
    });

    it('should reject low-entropy key', () => {
      expect(manager.validateKeyStrength('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')).toBe(false);
    });

    it('should accept custom minLength', () => {
      expect(manager.validateKeyStrength('abcdefghij', 10)).toBe(true);
      expect(manager.validateKeyStrength('abcdefghij', 20)).toBe(false);
    });

    it('should reject key with too few unique chars', () => {
      expect(manager.validateKeyStrength('aaaaaaaabbbbbbbbccccccccdddddddd')).toBe(false);
    });
  });

  describe('rotateKey', () => {
    it('should generate new key and preserve previous', () => {
      const oldKey = manager.getCurrentKey('api');
      const newKey = manager.rotateKey('api');

      expect(newKey).not.toBe(oldKey);
      expect(manager.getCurrentKey('api')).toBe(newKey);

      const status = manager.getKeyStatus('api');
      expect(status?.previous).toBe(oldKey);
    });

    it('should throw for unknown key type', () => {
      expect(() => manager.rotateKey('unknown' as any)).toThrow();
    });

    it('should handle double rotation correctly', () => {
      const key1 = manager.getCurrentKey('api');
      const key2 = manager.rotateKey('api');
      const key3 = manager.rotateKey('api');
      expect(key3).not.toBe(key2);
      expect(key3).not.toBe(key1);
      const status = manager.getKeyStatus('api');
      expect(status?.previous).toBe(key2);
      expect(status?.current).toBe(key3);
    });

    it('should generate base64 key on rotation', () => {
      const newKey = manager.rotateKey('encryption');
      expect(newKey.length).toBeGreaterThan(0);
      // base64 of 32 bytes = 44 chars
      expect(newKey.length).toBe(44);
    });

    it('should rotate all key types', () => {
      const types: Array<'encryption' | 'jwt' | 'api'> = ['encryption', 'jwt', 'api'];
      types.forEach(type => {
        const old = manager.getCurrentKey(type);
        const newKey = manager.rotateKey(type);
        expect(newKey).not.toBe(old);
      });
    });
  });

  describe('getKeyStatus', () => {
    it('should return key info', () => {
      const status = manager.getKeyStatus('encryption');
      expect(status).not.toBeNull();
      expect(status?.type).toBe('encryption');
      expect(status?.createdAt).toBeInstanceOf(Date);
    });

    it('should return null for unknown type', () => {
      expect(manager.getKeyStatus('unknown' as any)).toBeNull();
    });

    it('should preserve createdAt after rotation', () => {
      const before = manager.getKeyStatus('api')?.createdAt;
      manager.rotateKey('api');
      const after = manager.getKeyStatus('api')?.createdAt;
      expect(after!.getTime()).toBeGreaterThanOrEqual(before!.getTime());
    });
  });

  describe('getAllKeyStatus', () => {
    it('should return all 3 key types', () => {
      const all = manager.getAllKeyStatus();
      expect(all.size).toBe(3);
      expect(all.has('encryption')).toBe(true);
      expect(all.has('jwt')).toBe(true);
      expect(all.has('api')).toBe(true);
    });

    it('should return a new Map instance', () => {
      const all1 = manager.getAllKeyStatus();
      const all2 = manager.getAllKeyStatus();
      expect(all1).not.toBe(all2);
      expect(all1.size).toBe(all2.size);
    });
  });

  describe('partial keys', () => {
    it('should auto-generate missing keys in development', () => {
      const m = new KeyManager({
        nodeEnv: 'development',
        keys: { encryption: 'only-encryption-key-provided-here-32chars' }
      });
      expect(m.getCurrentKey('jwt')).toBeTruthy();
      expect(m.getCurrentKey('api')).toBeTruthy();
    });
  });

  describe('production mode', () => {
    it('should throw when encryption key is missing in production', () => {
      expect(() => new KeyManager({
        nodeEnv: 'production',
        isBuildTime: false,
      })).toThrow('ENCRYPTION_KEY');
    });

    it('should not throw when KMS is enabled', () => {
      expect(() => new KeyManager({
        nodeEnv: 'production',
        isBuildTime: false,
        isKMSEnabled: () => true,
        keys: { jwt: 'some-jwt-secret' },
      })).not.toThrow();
    });

    it('should not throw during build time', () => {
      expect(() => new KeyManager({
        nodeEnv: 'production',
        isBuildTime: true,
      })).not.toThrow();
    });

    it('should throw when JWT secret missing in production', () => {
      expect(() => new KeyManager({
        nodeEnv: 'production',
        isBuildTime: false,
        keys: { encryption: 'some-enc-key-32chars-long-enough-yes' }
      })).toThrow('NEXTAUTH_SECRET');
    });

    it('should use KMS_MANAGED for encryption when KMS enabled', () => {
      const m = new KeyManager({
        nodeEnv: 'production',
        isBuildTime: false,
        isKMSEnabled: () => true,
        keys: { jwt: 'jwt-secret-here-32chars' }
      });
      expect(m.getCurrentKey('encryption')).toBe('KMS_MANAGED');
    });

    it('should use BUILD_PLACEHOLDER during build', () => {
      const m = new KeyManager({
        nodeEnv: 'production',
        isBuildTime: true
      });
      expect(m.getCurrentKey('encryption')).toBe('BUILD_PLACEHOLDER');
      expect(m.getCurrentKey('jwt')).toBe('BUILD_PLACEHOLDER');
    });
  });
});
