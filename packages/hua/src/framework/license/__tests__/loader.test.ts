/**
 * @hua-labs/hua/framework - License Loader Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadLicense, resetLicenseCache } from '../loader';

describe('license/loader', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    resetLicenseCache();
  });

  afterEach(() => {
    process.env = originalEnv;
    resetLicenseCache();
  });

  describe('loadLicense', () => {
    it('should return Free license by default', () => {
      const license = loadLicense();
      expect(license.type).toBe('free');
      expect(license.valid).toBe(true);
      expect(license.features).toContain('core');
    });

    it('should load Pro license from config', () => {
      const license = loadLicense({ type: 'pro' });
      expect(license.type).toBe('pro');
      expect(license.valid).toBe(true);
      expect(license.features).toContain('motion-pro');
    });

    it('should load Enterprise license from config', () => {
      const license = loadLicense({ type: 'enterprise' });
      expect(license.type).toBe('enterprise');
      expect(license.valid).toBe(true);
      expect(license.features).toContain('white-labeling');
    });

    it('should validate Pro API key', () => {
      const license = loadLicense({ apiKey: 'pro_test_key' });
      expect(license.type).toBe('pro');
      expect(license.apiKey).toBe('pro_test_key');
      expect(license.valid).toBe(true);
    });

    it('should validate Enterprise API key', () => {
      const license = loadLicense({ apiKey: 'enterprise_test_key' });
      expect(license.type).toBe('enterprise');
      expect(license.apiKey).toBe('enterprise_test_key');
      expect(license.valid).toBe(true);
    });

    it('should return Free for invalid API key', () => {
      const license = loadLicense({ apiKey: 'invalid_key' });
      expect(license.type).toBe('free');
      expect(license.valid).toBe(true);
    });

    it('should prioritize environment variable HUA_LICENSE_KEY', () => {
      process.env.HUA_LICENSE_KEY = 'pro_env_key';
      const license = loadLicense({ type: 'free' });
      expect(license.type).toBe('pro');
      expect(license.apiKey).toBe('pro_env_key');
    });

    it('should cache license on second call', () => {
      const first = loadLicense({ type: 'pro' });
      const second = loadLicense({ type: 'free' });
      expect(second.type).toBe('pro');
      expect(first).toBe(second);
    });
  });

  describe('resetLicenseCache', () => {
    it('should clear cache', () => {
      loadLicense({ type: 'pro' });
      resetLicenseCache();
      const license = loadLicense({ type: 'free' });
      expect(license.type).toBe('free');
    });
  });
});
