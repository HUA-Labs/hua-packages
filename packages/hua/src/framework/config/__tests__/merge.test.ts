/**
 * @hua-labs/hua/framework - Config Merge Tests
 */

import { describe, it, expect } from 'vitest';
import { mergePresetWithConfig, createConfigFromUserConfig } from '../merge';

describe('config/merge', () => {
  describe('mergePresetWithConfig', () => {
    it('should merge with product preset (string)', () => {
      const result = mergePresetWithConfig('product');
      expect(result.preset).toBe('product');
      expect(result.motion?.defaultPreset).toBe('product');
      expect(result.i18n).toBeDefined();
    });

    it('should merge with marketing preset (string)', () => {
      const result = mergePresetWithConfig('marketing');
      expect(result.preset).toBe('marketing');
      expect(result.motion?.defaultPreset).toBe('marketing');
      expect(result.i18n).toBeDefined();
    });

    it('should throw error for invalid preset', () => {
      expect(() => {
        mergePresetWithConfig('invalid' as any);
      }).toThrow('Unknown preset');
    });

    it('should override preset with user config', () => {
      const result = mergePresetWithConfig('product', {
        i18n: {
          defaultLanguage: 'en',
          supportedLanguages: ['en', 'ko'],
        },
      });
      expect(result.i18n?.defaultLanguage).toBe('en');
      expect(result.i18n?.supportedLanguages).toEqual(['en', 'ko']);
    });

    it('should merge with object preset', () => {
      const result = mergePresetWithConfig({ type: 'product' });
      expect(result.preset).toBe('product');
      expect(result.motion?.defaultPreset).toBe('product');
    });

    it('should apply motion override in object preset', () => {
      const result = mergePresetWithConfig({
        type: 'product',
        motion: { duration: 500 },
      });
      expect(result.motion?.duration).toBe(500);
      expect(result.motion?.defaultPreset).toBe('product');
    });

    it('should deep merge nested objects', () => {
      const result = mergePresetWithConfig('product', {
        motion: {
          enableAnimations: false,
        },
      });
      expect(result.motion?.defaultPreset).toBe('product');
      expect(result.motion?.enableAnimations).toBe(false);
    });

    it('should override arrays instead of merging', () => {
      const result = mergePresetWithConfig('product', {
        i18n: {
          supportedLanguages: ['ja'],
          defaultLanguage: 'ja',
        },
      });
      expect(result.i18n?.supportedLanguages).toEqual(['ja']);
    });

    it('should ignore undefined values in user config', () => {
      const result = mergePresetWithConfig('product', {
        motion: {
          enableAnimations: undefined,
        },
      });
      expect(result.motion?.enableAnimations).toBe(true);
    });
  });

  describe('createConfigFromUserConfig', () => {
    it('should return defaults for empty config', () => {
      const result = createConfigFromUserConfig({});
      expect(result.i18n).toBeDefined();
      expect(result.motion).toBeDefined();
      expect(result.state).toBeDefined();
    });

    it('should merge user config with defaults', () => {
      const result = createConfigFromUserConfig({
        i18n: {
          defaultLanguage: 'en',
          supportedLanguages: ['en'],
        },
      });
      expect(result.i18n?.defaultLanguage).toBe('en');
      expect(result.i18n?.fallbackLanguage).toBe('en');
    });

    it('should deep merge nested objects', () => {
      const result = createConfigFromUserConfig({
        motion: {
          enableAnimations: false,
        },
      });
      expect(result.motion?.defaultPreset).toBe('product');
      expect(result.motion?.enableAnimations).toBe(false);
    });

    it('should override arrays', () => {
      const result = createConfigFromUserConfig({
        i18n: {
          supportedLanguages: ['ja', 'en'],
          defaultLanguage: 'ja',
        },
      });
      expect(result.i18n?.supportedLanguages).toEqual(['ja', 'en']);
    });

    it('should provide default state config', () => {
      const result = createConfigFromUserConfig({});
      expect(result.state?.persist).toBe(true);
      expect(result.state?.ssr).toBe(true);
    });
  });
});
