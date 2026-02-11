import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TranslatorFactory } from '../core/translator-factory';
import { I18nConfig } from '../types';

function createMockConfig(overrides?: Partial<I18nConfig>): I18nConfig {
  return {
    defaultLanguage: 'ko',
    fallbackLanguage: 'en',
    supportedLanguages: [
      { code: 'ko', name: 'Korean', nativeName: '한국어' },
      { code: 'en', name: 'English', nativeName: 'English' },
    ],
    namespaces: ['common'],
    loadTranslations: vi.fn().mockResolvedValue({}),
    ...overrides,
  };
}

describe('TranslatorFactory', () => {
  beforeEach(() => {
    TranslatorFactory.clear();
  });

  describe('create', () => {
    it('should create a new translator instance', () => {
      const config = createMockConfig();
      const translator = TranslatorFactory.create(config);
      expect(translator).toBeDefined();
      expect(TranslatorFactory.getInstanceCount()).toBe(1);
    });

    it('should return same instance for same config', () => {
      const config = createMockConfig();
      const t1 = TranslatorFactory.create(config);
      const t2 = TranslatorFactory.create(config);
      expect(t1).toBe(t2);
      expect(TranslatorFactory.getInstanceCount()).toBe(1);
    });

    it('should create different instances for different configs', () => {
      const config1 = createMockConfig({ defaultLanguage: 'ko' });
      const config2 = createMockConfig({ defaultLanguage: 'en' });
      const t1 = TranslatorFactory.create(config1);
      const t2 = TranslatorFactory.create(config2);
      expect(t1).not.toBe(t2);
      expect(TranslatorFactory.getInstanceCount()).toBe(2);
    });

    it('should evict oldest instance when max reached', () => {
      // MAX_INSTANCES is 10
      for (let i = 0; i < 10; i++) {
        TranslatorFactory.create(createMockConfig({
          defaultLanguage: `lang-${i}`,
          fallbackLanguage: 'en',
        }));
      }
      expect(TranslatorFactory.getInstanceCount()).toBe(10);

      // Adding 11th should evict the first
      TranslatorFactory.create(createMockConfig({
        defaultLanguage: 'lang-10',
        fallbackLanguage: 'en',
      }));
      expect(TranslatorFactory.getInstanceCount()).toBe(10);
    });

    it('should recreate instance when config changes', () => {
      const config1 = createMockConfig({ debug: false });
      const t1 = TranslatorFactory.create(config1);
      const config2 = createMockConfig({ debug: true });
      const t2 = TranslatorFactory.create(config2);
      // Different debug means different config key, so different instance
      expect(t1).not.toBe(t2);
    });
  });

  describe('get', () => {
    it('should return existing instance', () => {
      const config = createMockConfig();
      const created = TranslatorFactory.create(config);
      const retrieved = TranslatorFactory.get(config);
      expect(retrieved).toBe(created);
    });

    it('should return null for non-existing config', () => {
      const config = createMockConfig({ defaultLanguage: 'fr' });
      expect(TranslatorFactory.get(config)).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all instances', () => {
      TranslatorFactory.create(createMockConfig());
      expect(TranslatorFactory.getInstanceCount()).toBe(1);
      TranslatorFactory.clear();
      expect(TranslatorFactory.getInstanceCount()).toBe(0);
    });
  });

  describe('clearConfig', () => {
    it('should clear specific config instance', () => {
      const config1 = createMockConfig({ defaultLanguage: 'ko' });
      const config2 = createMockConfig({ defaultLanguage: 'en' });
      TranslatorFactory.create(config1);
      TranslatorFactory.create(config2);
      expect(TranslatorFactory.getInstanceCount()).toBe(2);
      TranslatorFactory.clearConfig(config1);
      expect(TranslatorFactory.getInstanceCount()).toBe(1);
    });
  });

  describe('debug', () => {
    it('should return debug info', () => {
      TranslatorFactory.create(createMockConfig());
      const info = TranslatorFactory.debug();
      expect(info.instanceCount).toBe(1);
      expect(info.configKeys).toHaveLength(1);
    });
  });
});
