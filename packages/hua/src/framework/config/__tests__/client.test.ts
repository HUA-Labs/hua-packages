/**
 * @hua-labs/hua/framework - Config Client Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { defineConfig, getConfig, setConfig, resetConfig } from '../client';
import { pluginRegistry } from '../../plugins/registry';
import { resetLicenseCache } from '../../license/loader';
import type { HuaConfig } from '../../types';

describe('config/client', () => {
  beforeEach(() => {
    resetConfig();
    resetLicenseCache();
    pluginRegistry.reset();
  });

  describe('defineConfig', () => {
    it('should define valid config with preset', () => {
      const config = defineConfig({ preset: 'product' });
      expect(config.preset).toBe('product');
      expect(config.i18n).toBeDefined();
      expect(config.motion).toBeDefined();
    });

    it('should define valid config with empty object', () => {
      const config = defineConfig({});
      expect(config.preset).toBe('product');
      expect(config.i18n).toBeDefined();
    });

    it('should throw error for invalid config', () => {
      expect(() => {
        defineConfig({ preset: 'invalid' as any });
      }).toThrow();
    });

    it('should handle plugins registration', () => {
      const testPlugin = {
        name: 'test-plugin-unique',
        version: '1.0.0',
        license: 'free' as const,
        init: vi.fn(),
      };

      defineConfig({
        preset: 'product',
        plugins: [testPlugin],
      });

      // Verify plugin is registered
      const registered = pluginRegistry.get('test-plugin-unique');
      expect(registered).toBeDefined();
      expect(registered?.name).toBe('test-plugin-unique');
    });

    it('should initialize license when provided', () => {
      const config = defineConfig({
        preset: 'product',
        license: { type: 'pro' },
      });

      // License should be initialized (tested in license tests)
      expect(config).toBeDefined();
    });
  });

  describe('getConfig', () => {
    it('should return product defaults when no cache', () => {
      const config = getConfig();
      expect(config.preset).toBe('product');
      expect(config.i18n).toBeDefined();
    });

    it('should return cached config', () => {
      const customConfig: HuaConfig = {
        preset: 'marketing',
        i18n: {
          defaultLanguage: 'en',
          supportedLanguages: ['en'],
        },
        motion: {
          defaultPreset: 'marketing',
          enableAnimations: true,
        },
        state: {
          persist: true,
          ssr: true,
        },
        fileStructure: {
          enforce: false,
        },
      };
      setConfig(customConfig);
      const config = getConfig();
      expect(config.preset).toBe('marketing');
    });
  });

  describe('setConfig', () => {
    it('should set valid config', () => {
      const validConfig: HuaConfig = {
        preset: 'product',
        i18n: {
          defaultLanguage: 'ko',
          supportedLanguages: ['ko', 'en'],
          fallbackLanguage: 'en',
          namespaces: ['common'],
          translationLoader: 'api',
          translationApiPath: '/api/translations',
        },
        motion: {
          defaultPreset: 'product',
          enableAnimations: true,
        },
        state: {
          persist: true,
          ssr: true,
        },
        fileStructure: {
          enforce: false,
        },
      };
      setConfig(validConfig);
      const config = getConfig();
      expect(config).toEqual(validConfig);
    });

    it('should validate config before setting', () => {
      expect(() => {
        setConfig({
          preset: 'invalid' as any,
          i18n: {
            defaultLanguage: 'ko',
            supportedLanguages: ['ko'],
          },
          motion: {
            defaultPreset: 'product',
            enableAnimations: true,
          },
          state: {
            persist: true,
            ssr: true,
          },
          fileStructure: {
            enforce: false,
          },
        });
      }).toThrow();
    });
  });

  describe('resetConfig', () => {
    it('should clear cache', () => {
      const customConfig: HuaConfig = {
        preset: 'marketing',
        i18n: {
          defaultLanguage: 'en',
          supportedLanguages: ['en'],
        },
        motion: {
          defaultPreset: 'marketing',
          enableAnimations: true,
        },
        state: {
          persist: true,
          ssr: true,
        },
        fileStructure: {
          enforce: false,
        },
      };
      setConfig(customConfig);
      resetConfig();
      const config = getConfig();
      expect(config.preset).toBe('product');
    });
  });
});
