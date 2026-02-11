import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { useTranslation, useLanguageChange } from '../hooks/useTranslation';
import { I18nProvider } from '../hooks/useI18n';
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
        'ko:common': { greeting: '안녕하세요' },
        'en:common': { greeting: 'Hello' },
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

describe('useTranslation', () => {
  beforeEach(() => {
    TranslatorFactory.clear();
  });

  it('should return all translation utilities', async () => {
    const config = createMockConfig();
    const { result } = renderHook(() => useTranslation(), {
      wrapper: createWrapper(config),
    });

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    expect(result.current.t).toBeDefined();
    expect(result.current.tPlural).toBeDefined();
    expect(result.current.tArray).toBeDefined();
    expect(result.current.currentLanguage).toBe('ko');
    expect(result.current.setLanguage).toBeDefined();
    expect(result.current.debug).toBeDefined();
  });

  it('should translate using t()', async () => {
    const config = createMockConfig();
    const { result } = renderHook(() => useTranslation(), {
      wrapper: createWrapper(config),
    });

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    expect(result.current.t('common:greeting')).toBe('안녕하세요');
  });

  it('should work without provider (returns defaults)', () => {
    const { result } = renderHook(() => useTranslation());
    expect(result.current.currentLanguage).toBe('ko');
    expect(result.current.isInitialized).toBe(false);
    expect(result.current.t('key')).toBe('key');
  });
});

describe('useLanguageChange', () => {
  beforeEach(() => {
    TranslatorFactory.clear();
  });

  it('should provide language change utilities', async () => {
    const config = createMockConfig();
    const { result } = renderHook(() => useLanguageChange(), {
      wrapper: createWrapper(config),
    });

    expect(result.current.currentLanguage).toBe('ko');
    expect(result.current.changeLanguage).toBeDefined();
    expect(result.current.supportedLanguages).toHaveLength(2);
  });

  it('should warn for unsupported language', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const config = createMockConfig();
    const { result } = renderHook(() => useLanguageChange(), {
      wrapper: createWrapper(config),
    });

    await waitFor(() => {
      // wait for initialization
    });

    result.current.changeLanguage('fr');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('fr'));
    warnSpy.mockRestore();
  });
});
