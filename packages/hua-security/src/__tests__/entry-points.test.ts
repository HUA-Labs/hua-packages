import { describe, it, expect, vi } from 'vitest';

vi.mock('@google-cloud/kms', () => ({
  KeyManagementServiceClient: vi.fn().mockImplementation(() => ({
    encrypt: vi.fn(),
    decrypt: vi.fn(),
  })),
}));

describe('entry-points', () => {
  describe('@hua-labs/security (index)', () => {
    it('should export crypto utilities', async () => {
      const mod = await import('../index');
      expect(mod.generateSecureKey).toBeTypeOf('function');
      expect(mod.checkKeyStrength).toBeTypeOf('function');
      expect(mod.hashSHA256).toBeTypeOf('function');
      expect(mod.hashSHA512).toBeTypeOf('function');
      expect(mod.createHMAC).toBeTypeOf('function');
      expect(mod.verifyHMAC).toBeTypeOf('function');
      expect(mod.secureCompare).toBeTypeOf('function');
      expect(mod.hashUserData).toBeTypeOf('function');
    });

    it('should export smart encryption', async () => {
      const mod = await import('../index');
      expect(mod.encryptSmart).toBeTypeOf('function');
      expect(mod.decryptSmart).toBeTypeOf('function');
      expect(mod.getEncryptionMethod).toBeTypeOf('function');
    });

    it('should export legacy pbkdf2', async () => {
      const mod = await import('../index');
      expect(mod.pbkdf2Encrypt).toBeTypeOf('function');
      expect(mod.pbkdf2Decrypt).toBeTypeOf('function');
      expect(mod.isPBKDF2Format).toBeTypeOf('function');
    });

    it('should export rate limiter', async () => {
      const mod = await import('../index');
      expect(mod.createMemoryRateLimiter).toBeTypeOf('function');
      expect(mod.RateLimitExceededError).toBeTypeOf('function');
    });

    it('should export storage rate limiter', async () => {
      const mod = await import('../index');
      expect(mod.createStorageRateLimiter).toBeTypeOf('function');
    });

    it('should export rate limit presets', async () => {
      const mod = await import('../index');
      expect(mod.RATE_LIMIT_PRESETS).toBeDefined();
      expect(mod.RATE_LIMIT_PRESETS.default).toBeDefined();
      expect(mod.RATE_LIMIT_PRESETS.auth).toBeDefined();
    });

    it('should export password validator', async () => {
      const mod = await import('../index');
      expect(mod.validatePassword).toBeTypeOf('function');
    });

    it('should export client identity', async () => {
      const mod = await import('../index');
      expect(mod.getClientIP).toBeTypeOf('function');
      expect(mod.getUserAgent).toBeTypeOf('function');
      expect(mod.isAllowedBot).toBeTypeOf('function');
      expect(mod.isNormalMobileUserAgent).toBeTypeOf('function');
      expect(mod.isSuspiciousUserAgent).toBeTypeOf('function');
    });

    it('should export key manager', async () => {
      const mod = await import('../index');
      expect(mod.KeyManager).toBeTypeOf('function');
    });

    it('should export encryption constants', async () => {
      const mod = await import('../index');
      expect(mod.ENCRYPTION_CONSTANTS).toBeDefined();
      expect(mod.ENCRYPTION_CONSTANTS.ALGORITHM).toBe('aes-256-gcm');
    });
  });

  describe('@hua-labs/security/pro', () => {
    it('should export pattern engine', async () => {
      const mod = await import('../pro');
      expect(mod.shouldSkipAnalysis).toBeTypeOf('function');
      expect(mod.matchAbusePatterns).toBeTypeOf('function');
      expect(mod.ABUSE_DETECTION_CONFIG).toBeDefined();
    });

    it('should export token estimator', async () => {
      const mod = await import('../pro');
      expect(mod.estimateOperationTokens).toBeTypeOf('function');
      expect(mod.estimateTokens).toBeTypeOf('function');
      expect(mod.DEFAULT_PRICING).toBeDefined();
      expect(mod.DEFAULT_OUTPUT_MULTIPLIERS).toBeDefined();
    });

    it('should not export anonymizer (removed)', async () => {
      const mod = await import('../pro');
      expect((mod as Record<string, unknown>).anonymizePersonalInfo).toBeUndefined();
    });
  });

  describe('@hua-labs/security/client', () => {
    it('should export captcha functions', async () => {
      const mod = await import('../client');
      expect(mod.InvisibleCaptcha).toBeTypeOf('function');
      expect(mod.initInvisibleCaptcha).toBeTypeOf('function');
      expect(mod.startCaptcha).toBeTypeOf('function');
      expect(mod.stopCaptcha).toBeTypeOf('function');
      expect(mod.checkCaptchaScore).toBeTypeOf('function');
      expect(mod.validateCaptcha).toBeTypeOf('function');
    });
  });

  describe('@hua-labs/security/adapters', () => {
    it('should export StorageAdapter type and RedisAdapter', async () => {
      const mod = await import('../adapters');
      expect(mod.createRedisAdapter).toBeTypeOf('function');
    });

    it('should not export LLMProvider (removed)', async () => {
      const mod = await import('../adapters');
      expect((mod as Record<string, unknown>).LLMProvider).toBeUndefined();
    });
  });
});
