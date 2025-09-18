/**
 * @hua-labs/i18n-debug - 디버그 전용 엔트리포인트
 * 
 * 이 모듈은 개발 중 i18n 문제를 해결하기 위한 디버깅 도구들을 제공합니다.
 * 번역 키 누락, 로딩 실패, 성능 문제 등을 쉽게 진단할 수 있습니다.
 */

import React from 'react';
import { I18nProvider, useI18n, useTranslation, useLanguageChange } from '@hua-labs/i18n-core';
import { I18nConfig } from '@hua-labs/i18n-core';

// 기본 언어 설정
const defaultLanguages = [
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'en', name: 'English', nativeName: 'English' },
];

/**
 * 디버그용 설정 함수
 * 
 * @example
 * ```tsx
 * // app/layout.tsx (Next.js App Router)
 * import { createDebugI18n } from '@hua-labs/i18n-debug';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {createDebugI18n({
 *           enableConsoleLogging: true,
 *           enableMissingKeyTracking: true,
 *           enablePerformanceTracking: true
 *         })({ children })}
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function createDebugI18n(options?: {
  defaultLanguage?: string;
  fallbackLanguage?: string;
  namespaces?: string[];
  enableConsoleLogging?: boolean;
  enableMissingKeyTracking?: boolean;
  enablePerformanceTracking?: boolean;
  enableErrorTracking?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}) {
  const {
    defaultLanguage = 'ko',
    fallbackLanguage = 'en',
    namespaces = ['common'],
    enableConsoleLogging = true,
    enableMissingKeyTracking = true,
    enablePerformanceTracking = true,
    enableErrorTracking = true,
    logLevel = 'debug'
  } = options || {};

  // 디버그용 파일 로더 (상세한 로깅 포함)
  const debugFileLoader = async (language: string, namespace: string) => {
    const startTime = performance.now();
    
    if (enableConsoleLogging) {
      console.log(`🔍 [DEBUG] Loading translations for ${language}:${namespace}`);
    }

    try {
      // 안전한 방식으로 번역 파일 로드 시도
      let data: Record<string, string> | null = null;
      
      // 클라이언트 사이드에서만 동적 import 시도
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
            if (enableConsoleLogging) {
              console.log(`🔍 [DEBUG] Trying path: ${path}`);
            }
            
            // 동적 import 대신 fetch 사용
            const response = await fetch(path);
            if (response.ok) {
              data = await response.json();
              break;
            }
          } catch (pathError) {
            if (enableConsoleLogging) {
              console.log(`❌ [DEBUG] Failed to load from path: ${path}`);
            }
            continue;
          }
        }
      }
      
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      if (data) {
        if (enableConsoleLogging) {
          console.log(`✅ [DEBUG] Successfully loaded ${language}:${namespace} in ${loadTime.toFixed(2)}ms`);
          console.log(`📊 [DEBUG] Translation keys:`, Object.keys(data));
        }
        
        if (enablePerformanceTracking && loadTime > 100) {
          console.warn(`⚠️ [DEBUG] Slow translation load: ${loadTime.toFixed(2)}ms for ${language}:${namespace}`);
        }
        
        return data;
      }

      // 모든 경로가 실패하면 기본 번역 반환
      if (enableConsoleLogging) {
        console.warn(`⚠️ [DEBUG] All paths failed for ${language}:${namespace}, using default translations`);
      }
      return getDefaultTranslations(language, namespace);
    }
    catch (error) {
      if (enableErrorTracking) {
        console.error(`💥 [DEBUG] Critical error loading ${language}:${namespace}:`, error);
      }
      console.warn(`Failed to load translation file: ${language}/${namespace}.json`);
      return getDefaultTranslations(language, namespace);
    }
  };

  // 디버그용 누락 키 핸들러
  const debugMissingKeyHandler = (key: string, language: string, namespace: string) => {
    if (enableMissingKeyTracking) {
      // console.warn(`🔍 [DEBUG] Missing translation key: ${key} in ${language}/${namespace}`);
      
      // 누락된 키를 추적
      if (typeof window !== 'undefined') {
        const missingKeys = window.__I18N_DEBUG_MISSING_KEYS__ || {};
        missingKeys[`${language}:${namespace}`] = missingKeys[`${language}:${namespace}`] || [];
        missingKeys[`${language}:${namespace}`].push(key);
        window.__I18N_DEBUG_MISSING_KEYS__ = missingKeys;
      }
    }
    
    return `[MISSING: ${key}]`;
  };

  // 디버그용 에러 핸들러
  const debugErrorHandler = (error: Error, language: string, namespace: string) => {
    if (enableErrorTracking) {
      console.error(`💥 [DEBUG] Translation error for ${language}:${namespace}:`, error);
      
      // 에러를 추적
      if (typeof window !== 'undefined') {
        const errors = window.__I18N_DEBUG_ERRORS__ || [];
        errors.push({
          timestamp: new Date().toISOString(),
          language,
          namespace,
          error: error.message,
          stack: error.stack
        });
        window.__I18N_DEBUG_ERRORS__ = errors;
      }
    }
  };

  const config: I18nConfig = {
    defaultLanguage,
    fallbackLanguage,
    supportedLanguages: defaultLanguages,
    namespaces,
    loadTranslations: debugFileLoader,
    debug: true,
    missingKeyHandler: debugMissingKeyHandler,
    errorHandler: debugErrorHandler,
    autoLanguageSync: true
  };

  // Provider 컴포넌트 반환
  return function DebugI18nProvider({ children }: { children: React.ReactNode }) {
    // 즉시 디버그 모드 활성화 (렌더링 시점에)
    if (typeof window !== 'undefined') {
      // 전역 변수 강제 설정
      window.__I18N_DEBUG_MODE__ = true;
      window.__I18N_DEBUG_MISSING_KEYS__ = window.__I18N_DEBUG_MISSING_KEYS__ || {};
      window.__I18N_DEBUG_ERRORS__ = window.__I18N_DEBUG_ERRORS__ || [];
      
      if (enableConsoleLogging) {
        console.log('🔍 [DEBUG] i18n debug mode enabled (immediate)');
        console.log('🔍 [DEBUG] window.__I18N_DEBUG_MODE__ =', window.__I18N_DEBUG_MODE__);
        console.log('🔍 [DEBUG] window.__I18N_DEBUG_MISSING_KEYS__ =', window.__I18N_DEBUG_MISSING_KEYS__);
        console.log('🔍 [DEBUG] window.__I18N_DEBUG_ERRORS__ =', window.__I18N_DEBUG_ERRORS__);
        console.log('🔍 [DEBUG] Debug features:', {
          consoleLogging: enableConsoleLogging,
          missingKeyTracking: enableMissingKeyTracking,
          performanceTracking: enablePerformanceTracking,
          errorTracking: enableErrorTracking,
          logLevel
        });
      }
    }
    
    // 추가 확인을 위한 useEffect
    React.useEffect(() => {
      if (typeof window !== 'undefined') {
        // useEffect에서도 다시 한번 확인 및 설정
        window.__I18N_DEBUG_MODE__ = true;
        window.__I18N_DEBUG_MISSING_KEYS__ = window.__I18N_DEBUG_MISSING_KEYS__ || {};
        window.__I18N_DEBUG_ERRORS__ = window.__I18N_DEBUG_ERRORS__ || [];
        
        if (enableConsoleLogging) {
          console.log('🔍 [DEBUG] DebugI18nProvider useEffect triggered');
          console.log('🔍 [DEBUG] window.__I18N_DEBUG_MODE__ =', window.__I18N_DEBUG_MODE__);
          console.log('🔍 [DEBUG] window.__I18N_DEBUG_MISSING_KEYS__ =', window.__I18N_DEBUG_MISSING_KEYS__);
          console.log('🔍 [DEBUG] window.__I18N_DEBUG_ERRORS__ =', window.__I18N_DEBUG_ERRORS__);
        }
      }
    }, [enableConsoleLogging]);
    
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
 * 완전한 디버그 Provider (모든 디버그 기능 활성화)
 */
export function createFullDebugProvider() {
  return createDebugI18n({
    enableConsoleLogging: true,
    enableMissingKeyTracking: true,
    enablePerformanceTracking: true,
    enableErrorTracking: true,
    logLevel: 'debug'
  });
}

/**
 * 콘솔 로깅 전용 Provider
 */
export function createConsoleDebugProvider() {
  return createDebugI18n({
    enableConsoleLogging: true,
    enableMissingKeyTracking: false,
    enablePerformanceTracking: false,
    enableErrorTracking: false,
    logLevel: 'info'
  });
}

/**
 * 성능 추적 전용 Provider
 */
export function createPerformanceDebugProvider() {
  return createDebugI18n({
    enableConsoleLogging: false,
    enableMissingKeyTracking: false,
    enablePerformanceTracking: true,
    enableErrorTracking: false,
    logLevel: 'warn'
  });
}

/**
 * 디버그 모드 활성화
 */
export function enableDebugMode() {
  if (typeof window !== 'undefined') {
    window.__I18N_DEBUG_MODE__ = true;
    console.log('🔍 [DEBUG] i18n debug mode enabled');
  }
}

/**
 * 디버그 모드 비활성화
 */
export function disableDebugMode() {
  if (typeof window !== 'undefined') {
    window.__I18N_DEBUG_MODE__ = false;
    console.log('🔍 [DEBUG] i18n debug mode disabled');
  }
}

/**
 * 디버그 모드 상태 확인
 */
export function isDebugModeEnabled(): boolean {
  if (typeof window !== 'undefined') {
    return window.__I18N_DEBUG_MODE__ === true;
  }
  return false;
}

// 디버그 훅들 export
export { useTranslation, useLanguageChange };

// Provider export
export { I18nProvider };

// 타입 export
export type { I18nConfig };

// 전역 타입 선언
declare global {
  interface Window {
    __I18N_DEBUG_MODE__?: boolean;
    __I18N_DEBUG_MISSING_KEYS__?: Record<string, string[]>;
    __I18N_DEBUG_ERRORS__?: Array<{
      timestamp: string;
      language: string;
      namespace: string;
      error: string;
      stack?: string;
    }>;
  }
} 