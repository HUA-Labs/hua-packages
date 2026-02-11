/**
 * @hua-labs/hua/framework - Config Schema Tests
 */

import { describe, it, expect } from 'vitest';
import { defaultConfig, validateConfig } from '../schema';

describe('config/schema', () => {
  describe('defaultConfig', () => {
    it('should have required fields', () => {
      expect(defaultConfig).toBeDefined();
      expect(defaultConfig.preset).toBe('product');
      expect(defaultConfig.i18n).toBeDefined();
      expect(defaultConfig.motion).toBeDefined();
      expect(defaultConfig.state).toBeDefined();
    });
  });

  describe('validateConfig', () => {
    it('should return defaults for empty config', () => {
      const result = validateConfig({});
      expect(result.preset).toBe('product');
      expect(result.i18n.defaultLanguage).toBe('ko');
      expect(result.motion.defaultPreset).toBe('product');
    });

    it('should accept valid string preset - product', () => {
      const result = validateConfig({ preset: 'product' });
      expect(result.preset).toBe('product');
    });

    it('should accept valid string preset - marketing', () => {
      const result = validateConfig({ preset: 'marketing' });
      expect(result.preset).toBe('marketing');
    });

    it('should throw error for invalid string preset', () => {
      expect(() => {
        validateConfig({ preset: 'invalid' as any });
      }).toThrow('잘못된 Preset입니다');
    });

    it('should accept valid object preset - product', () => {
      const result = validateConfig({ preset: { type: 'product' } });
      expect(result.preset).toEqual({ type: 'product' });
    });

    it('should accept valid object preset - marketing', () => {
      const result = validateConfig({ preset: { type: 'marketing' } });
      expect(result.preset).toEqual({ type: 'marketing' });
    });

    it('should throw error for invalid object preset type', () => {
      expect(() => {
        validateConfig({ preset: { type: 'invalid' as any } });
      }).toThrow('잘못된 Preset 타입입니다');
    });

    it('should throw error when defaultLanguage not in supportedLanguages', () => {
      expect(() => {
        validateConfig({
          i18n: {
            defaultLanguage: 'ja',
            supportedLanguages: ['ko', 'en'],
          },
        });
      }).toThrow('i18n 설정 오류');
    });

    it('should map motion.style to defaultPreset - smooth', () => {
      const result = validateConfig({
        motion: { style: 'smooth' },
      });
      expect(result.motion.defaultPreset).toBe('product');
    });

    it('should map motion.style to defaultPreset - dramatic', () => {
      const result = validateConfig({
        motion: { style: 'dramatic' },
      });
      expect(result.motion.defaultPreset).toBe('marketing');
    });

    it('should preserve user defaultPreset even if style is provided', () => {
      const result = validateConfig({
        motion: { style: 'smooth', defaultPreset: 'marketing' },
      });
      expect(result.motion.defaultPreset).toBe('marketing');
    });
  });
});
