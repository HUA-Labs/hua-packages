/**
 * hua-i18n-sdk/core - 핵심 기능 전용 엔트리포인트
 * 
 * 이 모듈은 기본적인 번역 기능만 필요한 경우 사용합니다.
 * 플러그인, 고급 기능, 디버깅 도구 없이 순수한 번역 기능만 제공합니다.
 */

import React from 'react';
import { I18nProvider, useI18n, useTranslation, useLanguageChange } from './hooks/useI18n';
import { Translator, ssrTranslate, serverTranslate } from './core/translator';
import { I18nConfig } from './types';

// 기본 언어 설정
const defaultLanguages = [
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'en', name: 'English', nativeName: 'English' },
];

/**
 * 핵심 기능용 설정 함수
 * 
 * @example
 * ```tsx
 * // app/layout.tsx (Next.js App Router)
 * import { createCoreI18n } from 'hua-i18n-sdk/core';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {createCoreI18n({
 *           defaultLanguage: 'ko',
 *           fallbackLanguage: 'en',
 *           namespaces: ['common', 'auth']
 *         })({ children })}
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function createCoreI18n(options?: {
  defaultLanguage?: string;
  fallbackLanguage?: string;
  namespaces?: string[];
  debug?: boolean;
  loadTranslations?: (language: string, namespace: string) => Promise<Record<string, string>>;
}) {
  const {
    defaultLanguage = 'ko',
    fallbackLanguage = 'en',
    namespaces = ['common'],
    debug = false,
    loadTranslations
  } = options || {};

  // 기본 파일 로더 (사용자 정의 로더가 없을 때 사용)
  const defaultFileLoader = async (language: string, namespace: string) => {
    try {
      // 동적 import를 사용하여 번역 파일 로드
      const possiblePaths = [
        `../translations/${language}/${namespace}.json`,
        `./translations/${language}/${namespace}.json`,
        `translations/${language}/${namespace}.json`,
        `../../translations/${language}/${namespace}.json`,
      ];

      for (const path of possiblePaths) {
        try {
          const module = await import(path);
          return module.default || module;
        } catch (pathError) {
          // 다음 경로 시도
          continue;
        }
      }

      // 모든 경로가 실패하면 기본 번역 반환
      return getDefaultTranslations(language, namespace);
    }
    catch (error) {
      console.warn(`Failed to load translation file: ${language}/${namespace}.json`);
      return getDefaultTranslations(language, namespace);
    }
  };

  const config: I18nConfig = {
    defaultLanguage,
    fallbackLanguage,
    supportedLanguages: defaultLanguages,
    namespaces,
    loadTranslations: loadTranslations || defaultFileLoader,
    debug,
    missingKeyHandler: (key: string) => {
      if (debug) {
        console.warn(`Missing translation key: ${key}`);
        return `[MISSING: ${key}]`;
      }
      return key.split('.').pop() || key;
    },
    errorHandler: (error: any, language: string, namespace: string) => {
      if (debug) {
        console.error(`Translation error for ${language}:${namespace}:`, error);
      }
    },
    autoLanguageSync: true
  };

  // Provider 컴포넌트 반환
  return function CoreI18nProvider({ children }: { children: React.ReactNode }) {
    return React.createElement(I18nProvider, { config, children });
  };
}

// 기본 번역 데이터
function getDefaultTranslations(language: string, namespace: string): Record<string, string> {
  const defaultTranslations: Record<string, Record<string, Record<string, string>>> = {
    ko: {
      common: {
        welcome: "환영합니다",
        greeting: "안녕하세요",
        goodbye: "안녕히 가세요",
        loading: "로딩 중...",
        error: "오류가 발생했습니다",
        success: "성공했습니다",
        cancel: "취소",
        confirm: "확인",
        save: "저장",
        delete: "삭제",
        edit: "편집",
        add: "추가",
        search: "검색",
        filter: "필터",
        sort: "정렬",
        refresh: "새로고침",
        back: "뒤로",
        next: "다음",
        previous: "이전",
        home: "홈",
        about: "소개",
        contact: "연락처",
        settings: "설정",
        profile: "프로필",
        logout: "로그아웃",
        login: "로그인",
        register: "회원가입"
      }
    },
    en: {
      common: {
        welcome: "Welcome",
        greeting: "Hello",
        goodbye: "Goodbye",
        loading: "Loading...",
        error: "An error occurred",
        success: "Success",
        cancel: "Cancel",
        confirm: "Confirm",
        save: "Save",
        delete: "Delete",
        edit: "Edit",
        add: "Add",
        search: "Search",
        filter: "Filter",
        sort: "Sort",
        refresh: "Refresh",
        back: "Back",
        next: "Next",
        previous: "Previous",
        home: "Home",
        about: "About",
        contact: "Contact",
        settings: "Settings",
        profile: "Profile",
        logout: "Logout",
        login: "Login",
        register: "Register"
      }
    }
  };

  return defaultTranslations[language]?.[namespace] || {};
}

/**
 * 가장 기본적인 Provider (최소한의 설정)
 */
export function CoreProvider({ children }: { children: React.ReactNode }) {
  return createCoreI18n()({ children });
}

/**
 * 언어별 Provider (언어만 지정)
 */
export function createLanguageProvider(language: string) {
  return createCoreI18n({ defaultLanguage: language });
}

/**
 * 네임스페이스별 Provider (네임스페이스만 지정)
 */
export function createNamespaceProvider(namespaces: string[]) {
  return createCoreI18n({ namespaces });
}

/**
 * 커스텀 로더 Provider (사용자 정의 번역 로더 사용)
 */
export function createCustomLoaderProvider(
  loadTranslations: (language: string, namespace: string) => Promise<Record<string, string>>
) {
  return createCoreI18n({ loadTranslations });
}

// 핵심 훅들 export
export { useTranslation, useLanguageChange };

// 핵심 클래스/함수들 export
export { Translator, ssrTranslate, serverTranslate };

// 타입 export
export type { I18nConfig }; 