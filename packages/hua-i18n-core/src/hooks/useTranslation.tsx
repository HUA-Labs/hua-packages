"use client";

import { useI18n } from './useI18n';

/**
 * 간단한 번역 훅 (원본 SDK와 호환)
 * 
 * @example
 * ```tsx
 * import { useTranslation } from '@hua-labs/i18n-core';
 * 
 * function MyComponent() {
 *   const { t, currentLanguage, setLanguage, isLoading, error } = useTranslation();
 *   
 *   return (
 *     <div>
 *       <h1>{t('welcome')}</h1>
 *       <p>Current language: {currentLanguage}</p>
 *       <button onClick={() => setLanguage('en')}>Switch to English</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTranslation() {
  const { t, tArray, currentLanguage, setLanguage, getRawValue, isLoading, error, supportedLanguages, debug, isInitialized } = useI18n();

  return {
    t,
    tArray,
    currentLanguage,
    setLanguage,
    getRawValue,
    isLoading,
    error,
    supportedLanguages,
    debug,
    isInitialized,
  };
}

/**
 * 언어 변경 전용 훅
 */
export function useLanguageChange() {
  const { currentLanguage, setLanguage, supportedLanguages } = useI18n();
  
  const changeLanguage = (language: string) => {
    const supported = supportedLanguages.find(lang => lang.code === language);
    if (supported) {
      setLanguage(language);
    } else {
      console.warn(`Language ${language} is not supported`);
    }
  };

  return {
    currentLanguage,
    changeLanguage,
    supportedLanguages,
  };
} 