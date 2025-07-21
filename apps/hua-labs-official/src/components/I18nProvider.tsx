'use client';
import { I18nProvider as BaseI18nProvider } from 'hua-i18n-sdk';
import { I18nConfig } from 'hua-i18n-sdk';

// JSON 파일을 로드하는 커스텀 로더
const customFileLoader = async (language: string, namespace: string) => {
  try {
    const url = `/translations/${language}/${namespace}.json`;
    const response = await fetch(url);
    
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.warn(`Failed to load translation: ${language}/${namespace}`);
      return {};
    }
  } catch (error) {
    console.warn(`Translation loading error:`, error);
    return {};
  }
};

const config: I18nConfig = {
  defaultLanguage: 'ko',
  fallbackLanguage: 'en',
  supportedLanguages: [
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'en', name: 'English', nativeName: 'English' },
  ],
  namespaces: ['common'],
  loadTranslations: customFileLoader,
  debug: process.env.NODE_ENV === 'development',
  autoLanguageSync: true,
  missingKeyHandler: (key: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Missing translation key: ${key}`);
    }
    return `[MISSING: ${key}]`;
  },
  errorHandler: (error: unknown, language: string, namespace: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Translation error for ${language}:${namespace}:`, error);
    }
  },
};

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  return <BaseI18nProvider config={config}>{children}</BaseI18nProvider>;
}; 