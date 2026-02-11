import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { I18nProvider, useI18n } from '../hooks/useI18n';
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
    loadTranslations: vi.fn().mockImplementation(async (lang: string, ns: string) => {
      const data: Record<string, Record<string, any>> = {
        'ko:common': { greeting: '안녕하세요', welcome: '{name}님 환영합니다' },
        'en:common': { greeting: 'Hello', welcome: 'Welcome {name}' },
      };
      return data[`${lang}:${ns}`] || {};
    }),
    ...overrides,
  };
}

function createWrapper(config: I18nConfig) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(I18nProvider, { config }, children);
  };
}

describe('useI18n', () => {
  beforeEach(() => {
    TranslatorFactory.clear();
  });

  describe('without Provider', () => {
    it('should return default values without error', () => {
      const { result } = renderHook(() => useI18n());

      expect(result.current.currentLanguage).toBe('ko');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isInitialized).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should return key as-is for t() without provider', () => {
      const { result } = renderHook(() => useI18n());
      expect(result.current.t('common:greeting')).toBe('common:greeting');
    });

    it('should return empty array for tArray() without provider', () => {
      const { result } = renderHook(() => useI18n());
      expect(result.current.tArray('common:items')).toEqual([]);
    });

    it('should return default debug utilities', () => {
      const { result } = renderHook(() => useI18n());
      expect(result.current.debug.getCurrentLanguage()).toBe('ko');
      expect(result.current.debug.getSupportedLanguages()).toEqual(['ko', 'en']);
      expect(result.current.debug.isReady()).toBe(false);
    });
  });

  describe('with Provider', () => {
    it('should initialize and provide translations', async () => {
      const config = createMockConfig();
      const { result } = renderHook(() => useI18n(), {
        wrapper: createWrapper(config),
      });

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      // Wait for initialization
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      expect(result.current.currentLanguage).toBe('ko');
    });

    it('should translate keys after initialization', async () => {
      const config = createMockConfig();
      const { result } = renderHook(() => useI18n(), {
        wrapper: createWrapper(config),
      });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // t() should return translated text
      expect(result.current.t('common:greeting')).toBe('안녕하세요');
    });

    it('should change language', async () => {
      const config = createMockConfig();
      const { result } = renderHook(() => useI18n(), {
        wrapper: createWrapper(config),
      });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.setLanguage('en');
      });

      expect(result.current.currentLanguage).toBe('en');
    });

    it('should handle initialTranslations for SSR', async () => {
      const config = createMockConfig({
        initialTranslations: {
          ko: { common: { greeting: 'SSR 안녕' } },
        },
      });
      const { result } = renderHook(() => useI18n(), {
        wrapper: createWrapper(config),
      });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      expect(result.current.t('common:greeting')).toBe('SSR 안녕');
    });

    it('should provide debug utilities', async () => {
      const config = createMockConfig();
      const { result } = renderHook(() => useI18n(), {
        wrapper: createWrapper(config),
      });

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      expect(result.current.debug.getCurrentLanguage()).toBe('ko');
      expect(result.current.debug.getSupportedLanguages()).toContain('ko');
      expect(result.current.debug.isReady()).toBe(true);
    });

    it('should handle translation errors gracefully', async () => {
      // Use a loader that fails once then returns empty - avoids slow retry backoff
      let callCount = 0;
      const config = createMockConfig({
        loadTranslations: vi.fn().mockImplementation(async () => {
          callCount++;
          if (callCount <= 2) throw new Error('Load failed');
          return {};
        }),
      });
      const { result } = renderHook(() => useI18n(), {
        wrapper: createWrapper(config),
      });

      // Should eventually initialize even with errors
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      }, { timeout: 15000 });

      // Should not crash - returns empty/fallback
      expect(result.current.isLoading).toBe(false);
    }, 20000);

    it('should provide supported languages from config', async () => {
      const config = createMockConfig();
      const { result } = renderHook(() => useI18n(), {
        wrapper: createWrapper(config),
      });

      expect(result.current.supportedLanguages).toHaveLength(2);
      expect(result.current.supportedLanguages[0].code).toBe('ko');
    });
  });
});
