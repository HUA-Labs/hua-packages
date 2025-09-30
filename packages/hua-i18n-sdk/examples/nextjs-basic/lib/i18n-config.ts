import { I18nConfig } from 'hua-i18n-sdk';

export const i18nConfig: I18nConfig = {
  defaultLanguage: 'ko',
  fallbackLanguage: 'ko',
  supportedLanguages: [
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'en', name: 'English', nativeName: 'English' },
  ],
  namespaces: ['common', 'demo'],
  loadTranslations: async (language: string, namespace: string) => {
    try {
      const module = await import(`../translations/${language}/${namespace}.json`);
      return module.default;
    } catch (error) {
      console.warn(`Failed to load translations for ${language}:${namespace}`, error);
      return {};
    }
  },
  debug: true, // 디버그 모드 활성화
  missingKeyHandler: (key: string, language: string) => {
    console.log(`[i18n] Missing key handler called for: ${key} in language: ${language}`);
    if (process.env.NODE_ENV === 'development') {
      return `[MISSING: ${key}]`;
    }
    // 프로덕션에서는 키의 마지막 부분만 반환
    return key.split('.').pop() || 'Translation not found';
  },
  errorHandler: (error: any, language: string, namespace: string) => {
    console.error(`Translation error for ${language}:${namespace}:`, error);
  },
};

// 번역 파일들을 미리 로드하여 타입 안전성 제공
export const translations = {
  ko: {
    common: () => import('../translations/ko/common.json'),
    demo: () => import('../translations/ko/demo.json'),
  },
  en: {
    common: () => import('../translations/en/common.json'),
    demo: () => import('../translations/en/demo.json'),
  },
} as const; 