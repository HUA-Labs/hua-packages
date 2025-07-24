// 초보자용 엔트리포인트 - 진짜 한 줄로 시작하는 다국어 지원

// 기본 Provider
export { SimpleI18n, I18nProvider } from './easy';

// 간단한 훅들
export { useTranslate, useLanguage, useTranslation, useI18n, useSimpleI18n } from './easy';

// TypeScript 파일 지원 함수들
export { loadTranslationsFromFile, useTranslationsFromFile } from './easy';

// 더 간단한 Provider들
export { 
  SimpleProvider, 
  I18nApp, 
  createI18nApp, 
  createLanguageProvider, 
  createDebugProvider,
  LanguageApp,
  DebugApp
} from './simple'; 