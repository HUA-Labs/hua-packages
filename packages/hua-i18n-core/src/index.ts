/**
 * @hua-labs/i18n-core - 핵심 기능 전용 엔트리포인트
 * 
 * 이 모듈은 기본적인 번역 기능만 필요한 경우 사용합니다.
 * 플러그인, 고급 기능, 디버깅 도구 없이 순수한 번역 기능만 제공합니다.
 */

import React from 'react';
import { I18nProvider, useI18n } from './hooks/useI18n';
import { useTranslation, useLanguageChange } from './hooks/useTranslation';
import { Translator, ssrTranslate, serverTranslate } from './core/translator';
import { I18nConfig } from './types';

// Window 객체 타입 확장
declare global {
  interface Window {
    __I18N_DEBUG_MODE__?: boolean;
    __I18N_DEBUG_MISSING_KEYS__?: Record<string, string[]>;
    __I18N_DEBUG_ERRORS__?: any[];
  }
}

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
 * import { createCoreI18n } from '@hua-labs/i18n-core';
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
  /**
   * 번역 파일 로딩 방식 설정
   * - 'api': API route를 통해 동적 로드 (기본값, 권장)
   * - 'static': 정적 파일 경로에서 로드
   * - 'custom': loadTranslations 함수 사용
   */
  translationLoader?: 'api' | 'static' | 'custom';
  /**
   * API route 경로 (translationLoader가 'api'일 때 사용)
   * 기본값: '/api/translations'
   */
  translationApiPath?: string;
}) {
  const {
    defaultLanguage = 'ko',
    fallbackLanguage = 'en',
    namespaces = ['common'],
    debug = false,
    loadTranslations,
    translationLoader = 'api',
    translationApiPath = '/api/translations'
  } = options || {};

  // API route 기반 로더 (기본값, 권장)
  const apiRouteLoader = async (language: string, namespace: string) => {
    try {
      // 클라이언트 사이드에서만 동적 로드
      if (typeof window !== 'undefined') {
        const apiUrl = `${translationApiPath}/${language}/${namespace}`;
        const response = await fetch(apiUrl);
        
        if (response.ok) {
          const data = await response.json();
          if (debug) {
            console.log(`✅ Loaded translation from API: ${language}/${namespace}`);
          }
          return data;
        } else if (response.status === 404) {
          if (debug) {
            console.warn(`⚠️ Translation not found in API: ${language}/${namespace}`);
          }
        }
      }
      
      // SSR 또는 API 실패 시 기본 번역 반환
      return getDefaultTranslations(language, namespace);
    } catch (error) {
      if (debug) {
        console.warn(`Failed to load translation from API: ${language}/${namespace}`, error);
      }
      return getDefaultTranslations(language, namespace);
    }
  };

  // 정적 파일 로더 (하위 호환성)
  const staticFileLoader = async (language: string, namespace: string) => {
    try {
      let data: Record<string, string> | null = null;
      
      // 클라이언트 사이드에서만 동적 로드 시도
      if (typeof window !== 'undefined') {
        const possiblePaths = [
          `/translations/${language}/${namespace}.json`,
          `../translations/${language}/${namespace}.json`,
          `./translations/${language}/${namespace}.json`,
          `translations/${language}/${namespace}.json`,
          `../../translations/${language}/${namespace}.json`,
        ];

        for (const path of possiblePaths) {
          try {
            const response = await fetch(path);
            if (response.ok) {
              data = await response.json();
              if (debug) {
                console.log(`✅ Loaded translation from static path: ${path}`);
              }
              break;
            }
          } catch (pathError) {
            continue;
          }
        }
      }

      if (data) {
        return data;
      }

      return getDefaultTranslations(language, namespace);
    } catch (error) {
      if (debug) {
        console.warn(`Failed to load translation file: ${language}/${namespace}.json`);
      }
      return getDefaultTranslations(language, namespace);
    }
  };

  // 기본 파일 로더 선택
  const defaultFileLoader = translationLoader === 'api' 
    ? apiRouteLoader 
    : translationLoader === 'static'
    ? staticFileLoader
    : loadTranslations || apiRouteLoader;

  const config: I18nConfig = {
    defaultLanguage,
    fallbackLanguage,
    supportedLanguages: defaultLanguages,
    namespaces,
    loadTranslations: translationLoader === 'custom' && loadTranslations 
      ? loadTranslations 
      : defaultFileLoader,
    debug,
    missingKeyHandler: (key: string, language?: string, namespace?: string) => {
      if (debug) {
        console.warn(`Missing translation key: ${key}`);
        
        // Debug SDK와 연동하여 누락 키 추적
        if (typeof window !== 'undefined' && window.__I18N_DEBUG_MISSING_KEYS__) {
          const missingKeys = window.__I18N_DEBUG_MISSING_KEYS__;
          const keyPath = `${language || 'unknown'}:${namespace || 'unknown'}`;
          missingKeys[keyPath] = missingKeys[keyPath] || [];
          if (!missingKeys[keyPath].includes(key)) {
            missingKeys[keyPath].push(key);
          }
        }
        
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
export { useTranslation, useLanguageChange, useI18n };

// Provider export
export { I18nProvider };

// 핵심 클래스/함수들 export
export { Translator, ssrTranslate, serverTranslate };

// 타입 export
export type { I18nConfig }; 