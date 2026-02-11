import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Translator } from '../core/translator';
import { I18nConfig } from '../types';

// Helper to create a mock config
function createMockConfig(overrides?: Partial<I18nConfig>): I18nConfig {
  return {
    defaultLanguage: 'ko',
    fallbackLanguage: 'en',
    supportedLanguages: [
      { code: 'ko', name: 'Korean', nativeName: '한국어' },
      { code: 'en', name: 'English', nativeName: 'English' },
    ],
    namespaces: ['common'],
    loadTranslations: vi.fn().mockImplementation(async (lang: string, ns: string) => {
      const translations: Record<string, Record<string, any>> = {
        'ko:common': {
          greeting: '안녕하세요',
          welcome: '{name}님 환영합니다',
          nested: { deep: { key: '중첩된 값' } },
          items: ['사과', '바나나', '체리'],
          total_count: { one: '총 {count}개', other: '총 {count}개' },
        },
        'en:common': {
          greeting: 'Hello',
          welcome: 'Welcome {name}',
          nested: { deep: { key: 'nested value' } },
          items: ['apple', 'banana', 'cherry'],
          total_count: { one: '{count} item', other: '{count} items' },
        },
      };
      return translations[`${lang}:${ns}`] || {};
    }),
    ...overrides,
  };
}

describe('Translator', () => {
  let translator: Translator;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('should throw for invalid config', () => {
      expect(() => new Translator({} as any)).toThrow('Invalid I18nConfig');
    });

    it('should create with valid config', () => {
      const config = createMockConfig();
      translator = new Translator(config);
      expect(translator.getCurrentLanguage()).toBe('ko');
    });

    it('should use initialTranslations if provided', () => {
      const config = createMockConfig({
        initialTranslations: {
          ko: { common: { greeting: '안녕하세요' } },
        },
      });
      translator = new Translator(config);
      expect(translator.isReady()).toBe(true);
      expect(translator.translate('common:greeting')).toBe('안녕하세요');
    });
  });

  describe('initialize', () => {
    it('should load translations for default and fallback languages', async () => {
      const config = createMockConfig();
      translator = new Translator(config);
      await translator.initialize();
      expect(translator.isReady()).toBe(true);
      expect(config.loadTranslations).toHaveBeenCalledWith('ko', 'common');
      expect(config.loadTranslations).toHaveBeenCalledWith('en', 'common');
    });

    it('should skip if already initialized', async () => {
      const config = createMockConfig();
      translator = new Translator(config);
      await translator.initialize();
      const callCount = (config.loadTranslations as any).mock.calls.length;
      await translator.initialize();
      expect((config.loadTranslations as any).mock.calls.length).toBe(callCount);
    });

    it('should handle load failure gracefully', async () => {
      const config = createMockConfig({
        loadTranslations: vi.fn().mockRejectedValue(new Error('Network error')),
      });
      translator = new Translator(config);

      // Run initialize with fake timers - advance past all retry backoff delays
      const initPromise = translator.initialize();
      // Retry backoff: 2^1*1000=2s, 2^2*1000=4s, 2^3*1000=8s per namespace
      // Multiple namespaces × 2 languages, so advance generously
      await vi.advanceTimersByTimeAsync(60_000);
      await initPromise;

      // After retries fail, translator uses empty fallback data
      const debugInfo = translator.debug() as any;
      expect(debugInfo.isInitialized).toBe(true);
    });

    it('should skip initialTranslations namespaces during initialize', async () => {
      const loadFn = vi.fn().mockImplementation(async (lang: string, ns: string) => {
        // Return translations for fallback language
        if (lang === 'en' && ns === 'common') {
          return { greeting: 'Hello' };
        }
        return {};
      });
      const config = createMockConfig({
        loadTranslations: loadFn,
        // Don't provide initialTranslations in constructor
        // so initialize() actually runs
      });
      translator = new Translator(config);

      // Manually set some initial data BEFORE calling initialize
      // This simulates SSR scenario where data is set but initialize hasn't been called
      translator['allTranslations'] = {
        ko: { common: { greeting: '안녕하세요' } }
      };
      translator['loadedNamespaces'].add('ko:common');

      await translator.initialize();

      // ko:common should be skipped since it's already in allTranslations
      const koCommonCalls = loadFn.mock.calls.filter(
        ([lang, ns]: [string, string]) => lang === 'ko' && ns === 'common'
      );
      expect(koCommonCalls).toHaveLength(0);

      // en:common should be loaded since it's the fallback language
      const enCommonCalls = loadFn.mock.calls.filter(
        ([lang, ns]: [string, string]) => lang === 'en' && ns === 'common'
      );
      expect(enCommonCalls).toHaveLength(1);

      // Verify that ko:common translation is available
      expect(translator.translate('common:greeting', 'ko')).toBe('안녕하세요');
      // Verify that en:common was loaded
      expect(translator.translate('common:greeting', 'en')).toBe('Hello');
    });
  });

  describe('translate', () => {
    beforeEach(async () => {
      const config = createMockConfig();
      translator = new Translator(config);
      await translator.initialize();
    });

    it('should translate a simple key', () => {
      expect(translator.translate('common:greeting')).toBe('안녕하세요');
    });

    it('should translate with namespace:key format', () => {
      expect(translator.translate('common:greeting')).toBe('안녕하세요');
    });

    it('should use common namespace as default', () => {
      expect(translator.translate('greeting')).toBe('안녕하세요');
    });

    it('should interpolate params with {key} format', () => {
      expect(translator.translate('common:welcome', { name: '철수' })).toBe('철수님 환영합니다');
    });

    it('should translate nested keys with dot notation', () => {
      expect(translator.translate('common:nested.deep.key')).toBe('중첩된 값');
    });

    it('should fallback to fallback language when key not found in current language', async () => {
      // Add a key that only exists in English
      const config = createMockConfig({
        loadTranslations: vi.fn().mockImplementation(async (lang: string, ns: string) => {
          if (lang === 'en' && ns === 'common') return { english_only: 'Only in English' };
          if (lang === 'ko' && ns === 'common') return {};
          return {};
        }),
      });
      translator = new Translator(config);
      await translator.initialize();
      expect(translator.translate('common:english_only')).toBe('Only in English');
    });

    it('should return empty string in production for missing key', () => {
      expect(translator.translate('common:nonexistent')).toBe('');
    });

    it('should accept language override as second parameter (string)', () => {
      expect(translator.translate('common:greeting', 'en')).toBe('Hello');
    });

    it('should accept params and language override', () => {
      expect(translator.translate('common:welcome', { name: 'John' }, 'en')).toBe('Welcome John');
    });
  });

  describe('tPlural', () => {
    beforeEach(async () => {
      const config = createMockConfig();
      translator = new Translator(config);
      await translator.initialize();
    });

    it('should select "one" for count=1 in English', () => {
      expect(translator.tPlural('common:total_count', 1, {}, 'en')).toBe('1 item');
    });

    it('should select "other" for count>1 in English', () => {
      expect(translator.tPlural('common:total_count', 5, {}, 'en')).toBe('5 items');
    });

    it('should use "other" for Korean (no singular form)', () => {
      expect(translator.tPlural('common:total_count', 1)).toBe('총 1개');
      expect(translator.tPlural('common:total_count', 5)).toBe('총 5개');
    });

    it('should return empty string for missing key in non-debug mode', () => {
      expect(translator.tPlural('common:nonexistent', 1)).toBe('');
    });
  });

  describe('tArray', () => {
    beforeEach(async () => {
      const config = createMockConfig();
      translator = new Translator(config);
      await translator.initialize();
    });

    it('should return string array', () => {
      expect(translator.tArray('common:items')).toEqual(['사과', '바나나', '체리']);
    });

    it('should return empty array for non-array key', () => {
      expect(translator.tArray('common:greeting')).toEqual([]);
    });

    it('should return empty array for missing key', () => {
      expect(translator.tArray('common:nonexistent')).toEqual([]);
    });

    it('should return array for specific language', () => {
      expect(translator.tArray('common:items', 'en')).toEqual(['apple', 'banana', 'cherry']);
    });
  });

  describe('getRawValue', () => {
    beforeEach(async () => {
      const config = createMockConfig();
      translator = new Translator(config);
      await translator.initialize();
    });

    it('should return raw string', () => {
      expect(translator.getRawValue('common:greeting')).toBe('안녕하세요');
    });

    it('should return raw array', () => {
      expect(translator.getRawValue('common:items')).toEqual(['사과', '바나나', '체리']);
    });

    it('should return raw plural object', () => {
      const raw = translator.getRawValue('common:total_count') as any;
      expect(raw).toEqual({ one: '총 {count}개', other: '총 {count}개' });
    });

    it('should return undefined for missing key', () => {
      expect(translator.getRawValue('common:nonexistent')).toBeUndefined();
    });

    it('should return nested value', () => {
      expect(translator.getRawValue('common:nested.deep.key')).toBe('중첩된 값');
    });
  });

  describe('setLanguage', () => {
    it('should change current language', async () => {
      const config = createMockConfig();
      translator = new Translator(config);
      await translator.initialize();
      translator.setLanguage('en');
      expect(translator.getCurrentLanguage()).toBe('en');
    });

    it('should not change if same language', async () => {
      const config = createMockConfig();
      translator = new Translator(config);
      await translator.initialize();
      const callback = vi.fn();
      translator.onLanguageChanged(callback);
      translator.setLanguage('ko');
      expect(callback).not.toHaveBeenCalled();
    });

    it('should notify language change listeners', async () => {
      const config = createMockConfig();
      translator = new Translator(config);
      await translator.initialize();
      const callback = vi.fn();
      translator.onLanguageChanged(callback);
      translator.setLanguage('en');
      expect(callback).toHaveBeenCalledWith('en');
    });
  });

  describe('clearCache', () => {
    it('should clear cache and reset stats', async () => {
      const config = createMockConfig();
      translator = new Translator(config);
      await translator.initialize();
      translator.translate('common:greeting');
      translator.clearCache();
      const debugInfo = translator.debug() as any;
      expect(debugInfo.cacheStats.hits).toBe(0);
      expect(debugInfo.cacheStats.misses).toBe(0);
    });
  });

  describe('callback management', () => {
    it('should register and unregister translation loaded callbacks', async () => {
      const config = createMockConfig();
      translator = new Translator(config);
      await translator.initialize();
      const callback = vi.fn();
      const unsubscribe = translator.onTranslationLoaded(callback);
      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('should register and unregister language changed callbacks', async () => {
      const config = createMockConfig();
      translator = new Translator(config);
      const callback = vi.fn();
      const unsubscribe = translator.onLanguageChanged(callback);
      translator.setLanguage('en');
      expect(callback).toHaveBeenCalled();
      callback.mockClear();
      unsubscribe();
      translator.setLanguage('ko');
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('debug', () => {
    it('should return debug info', async () => {
      const config = createMockConfig();
      translator = new Translator(config);
      await translator.initialize();
      const info = translator.debug() as any;
      expect(info.isInitialized).toBe(true);
      expect(info.currentLanguage).toBe('ko');
      expect(info.loadedNamespaces).toContain('ko:common');
      expect(info.loadedNamespaces).toContain('en:common');
    });
  });

  describe('hydrateFromSSR', () => {
    it('should set translations and mark as initialized', () => {
      const config = createMockConfig();
      translator = new Translator(config);
      translator.hydrateFromSSR({
        ko: { common: { greeting: 'SSR 안녕' } },
      });
      expect(translator.isReady()).toBe(true);
      expect(translator.translate('common:greeting')).toBe('SSR 안녕');
    });
  });
});

// Test ssrTranslate standalone function
import { ssrTranslate, serverTranslate } from '../core/translator';

describe('ssrTranslate', () => {
  const translations = {
    ko: {
      common: {
        greeting: '안녕하세요',
        nested: { deep: 'SSR 중첩' },
      },
    },
    en: {
      common: {
        greeting: 'Hello',
        english_only: 'Only in English',
      },
    },
  };

  it('should translate with current language', () => {
    expect(ssrTranslate({ translations, key: 'common:greeting', language: 'ko' })).toBe('안녕하세요');
  });

  it('should fallback to fallback language', () => {
    expect(ssrTranslate({ translations, key: 'common:english_only', language: 'ko' })).toBe('Only in English');
  });

  it('should use missingKeyHandler for missing keys', () => {
    expect(ssrTranslate({
      translations,
      key: 'common:nonexistent',
      language: 'ko',
      missingKeyHandler: (k) => `[MISSING: ${k}]`,
    })).toBe('[MISSING: common:nonexistent]');
  });

  it('should handle nested keys', () => {
    expect(ssrTranslate({ translations, key: 'common:nested.deep', language: 'ko' })).toBe('SSR 중첩');
  });
});

describe('serverTranslate', () => {
  const translations = {
    ko: { common: { title: '제목' } },
    en: { common: { title: 'Title' } },
  };

  it('should translate basic key', () => {
    expect(serverTranslate({ translations, key: 'common:title', language: 'ko' })).toBe('제목');
  });

  it('should use cache when provided', () => {
    const cache = new Map<string, string>();
    serverTranslate({ translations, key: 'common:title', language: 'ko', options: { cache } });
    expect(cache.has('ko:common:title')).toBe(true);
    // Second call should hit cache
    const result = serverTranslate({ translations, key: 'common:title', language: 'ko', options: { cache } });
    expect(result).toBe('제목');
  });

  it('should fallback to fallback language', () => {
    const result = serverTranslate({ translations, key: 'common:title', language: 'ja', fallbackLanguage: 'en' });
    expect(result).toBe('Title');
  });
});
