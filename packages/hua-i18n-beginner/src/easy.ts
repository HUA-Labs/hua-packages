/**
 * hua-i18n-sdk/easy - 초보자 친화적 엔트리포인트
 * 
 * 이 모듈은 초보자들이 쉽게 시작할 수 있도록 설계되었습니다.
 * 복잡한 설정 없이 바로 사용할 수 있는 함수들만 제공합니다.
 */

import React from 'react';

// 기본 언어 설정
const defaultLanguages = [
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'en', name: 'English', nativeName: 'English' },
];

// 기본 타입 정의
export interface I18nConfig {
  defaultLanguage: string;
  fallbackLanguage: string;
  supportedLanguages: Array<{ code: string; name: string; nativeName: string }>;
  namespaces: string[];
  loadTranslations: (language: string, namespace: string) => Promise<Record<string, any>>;
  debug?: boolean;
  missingKeyHandler?: (key: string) => string;
  errorHandler?: (error: any, language: string, namespace: string) => void;
  autoLanguageSync?: boolean;
}

// 기본 Provider 컴포넌트
export const I18nProvider = ({ config, children }: { config: I18nConfig; children: React.ReactNode }) => {
  return <>{children}</>;
};

// 기본 훅들
export const useTranslation = () => {
  return {
    t: (key: string) => key,
    language: 'ko',
    changeLanguage: (lang: string) => console.log('Language changed to:', lang)
  };
};

export const useLanguageChange = () => {
  return {
    changeLanguage: (lang: string) => console.log('Language changed to:', lang)
  };
}; 