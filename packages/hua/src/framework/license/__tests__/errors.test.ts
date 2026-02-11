/**
 * @hua-labs/hua/framework - License Errors Tests
 */

import { describe, it, expect } from 'vitest';
import { createLicenseError } from '../errors';

describe('license/errors', () => {
  describe('createLicenseError', () => {
    it('should create error for Pro feature', () => {
      const error = createLicenseError('motion-pro');
      expect(error).toContain('Motion Pro');
      expect(error).toContain('Pro');
      expect(error).not.toContain('Enterprise');
    });

    it('should create error for Enterprise feature', () => {
      const error = createLicenseError('white-labeling');
      expect(error).toContain('White Labeling');
      expect(error).toContain('Enterprise');
    });

    it('should show current license in error', () => {
      const error = createLicenseError('motion-pro', 'pro');
      expect(error).toContain('현재 라이선스');
      expect(error).toContain('Current license');
      expect(error).toContain('Pro');
    });

    it('should include guide URL', () => {
      const error = createLicenseError('motion-pro');
      expect(error).toContain('https://github.com/HUA-Labs/hua-platform');
    });
  });
});
