/**
 * hua-i18n-sdk/debug - 디버그 전용 엔트리포인트
 * 
 * 이 모듈은 개발 중 i18n 문제를 해결하기 위한 디버깅 도구들을 제공합니다.
 * 번역 키 누락, 로딩 실패, 성능 문제 등을 쉽게 진단할 수 있습니다.
 */

import React from 'react';
import { I18nProvider, useI18n, useTranslation, useLanguageChange } from './hooks/useI18n';
import { I18nConfig } from './types';

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
 * import { createDebugI18n } from 'hua-i18n-sdk/debug';
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
      // 동적 import를 사용하여 번역 파일 로드
      const possiblePaths = [
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
          
          const module = await import(path);
          const data = module.default || module;
          
          const endTime = performance.now();
          const loadTime = endTime - startTime;
          
          if (enableConsoleLogging) {
            console.log(`✅ [DEBUG] Successfully loaded ${language}:${namespace} in ${loadTime.toFixed(2)}ms`);
            console.log(`📊 [DEBUG] Translation keys:`, Object.keys(data));
          }
          
          if (enablePerformanceTracking && loadTime > 100) {
            console.warn(`⚠️ [DEBUG] Slow translation load: ${loadTime.toFixed(2)}ms for ${language}:${namespace}`);
          }
          
          return data;
        } catch (pathError) {
          if (enableConsoleLogging) {
            console.log(`❌ [DEBUG] Failed to load from ${path}:`, (pathError as Error).message);
          }
          // 다음 경로 시도
          continue;
        }
      }

      // 모든 경로가 실패하면 기본 번역 반환
      if (enableConsoleLogging) {
        console.warn(`⚠️ [DEBUG] All paths failed for ${language}:${namespace}, using default translations`);
      }
      
      return getDefaultTranslations(language, namespace);
    }
    catch (error) {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      if (enableErrorTracking) {
        console.error(`💥 [DEBUG] Critical error loading ${language}:${namespace} after ${loadTime.toFixed(2)}ms:`, error);
      }
      
      return getDefaultTranslations(language, namespace);
    }
  };

  // 디버그용 missing key 핸들러
  const debugMissingKeyHandler = (key: string, language: string, namespace: string) => {
    if (enableMissingKeyTracking) {
      console.warn(`🔑 [DEBUG] Missing translation key: ${key} (${language}:${namespace})`);
      
      // 스택 트레이스 출력
      if (logLevel === 'debug') {
        console.trace(`📍 [DEBUG] Stack trace for missing key: ${key}`);
      }
    }
    
    return `[MISSING: ${key}]`;
  };

  // 디버그용 에러 핸들러
  const debugErrorHandler = (error: Error, language: string, namespace: string) => {
    if (enableErrorTracking) {
      console.error(`💥 [DEBUG] Translation error for ${language}:${namespace}:`, error);
      
      // 에러 컨텍스트 정보 출력
      console.error(`📋 [DEBUG] Error context:`, {
        language,
        namespace,
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
        timestamp: new Date().toISOString()
      });
    }
  };

  const config: I18nConfig = {
    defaultLanguage,
    fallbackLanguage,
    supportedLanguages: defaultLanguages,
    namespaces,
    loadTranslations: debugFileLoader,
    debug: true, // 항상 디버그 모드 활성화
    missingKeyHandler: debugMissingKeyHandler,
    errorHandler: debugErrorHandler,
    autoLanguageSync: true,
    errorHandling: {
      recoveryStrategy: {
        maxRetries: 3,
        retryDelay: 1000,
        backoffMultiplier: 2,
        shouldRetry: (error) => {
          if (enableConsoleLogging) {
            console.log(`🔄 [DEBUG] Retry decision for error:`, error.message);
          }
          return error.code === 'LOAD_FAILED' || error.code === 'NETWORK_ERROR';
        },
        onRetry: (error, attempt) => {
          if (enableConsoleLogging) {
            console.log(`🔄 [DEBUG] Retrying translation operation (attempt ${attempt}/${error.maxRetries}):`, error.message);
          }
        },
        onMaxRetriesExceeded: (error) => {
          if (enableErrorTracking) {
            console.error(`💥 [DEBUG] Max retries exceeded for translation operation:`, error.message);
          }
        }
      },
      logging: {
        enabled: enableConsoleLogging,
        level: logLevel,
        includeStack: true,
        includeContext: true,
        customLogger: (error) => {
          if (enableConsoleLogging) {
            console.log(`📝 [DEBUG] Custom error logger:`, {
              code: error.code,
              message: error.message,
              language: error.language,
              namespace: error.namespace,
              key: error.key,
              timestamp: error.timestamp
            });
          }
        }
      },
      userFriendlyMessages: true,
      suppressErrors: false
    }
  };

  // Provider 컴포넌트 반환
  return function DebugI18nProvider({ children }: { children: React.ReactNode }) {
    if (enableConsoleLogging) {
      console.log(`🚀 [DEBUG] Initializing debug i18n provider with config:`, {
        defaultLanguage: config.defaultLanguage,
        fallbackLanguage: config.fallbackLanguage,
        namespaces: config.namespaces,
        debug: config.debug
      });
    }
    
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
 * 모든 디버그 기능이 활성화된 Provider
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
 * 콘솔 로깅만 활성화된 Provider
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
 * 성능 추적만 활성화된 Provider
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

// 디버그용 유틸리티 함수들
export function enableDebugMode() {
  if (typeof window !== 'undefined') {
    (window as any).__HUA_I18N_DEBUG__ = true;
    console.log('🔧 [DEBUG] HUA I18N Debug mode enabled');
  }
}

export function disableDebugMode() {
  if (typeof window !== 'undefined') {
    (window as any).__HUA_I18N_DEBUG__ = false;
    console.log('🔧 [DEBUG] HUA I18N Debug mode disabled');
  }
}

export function isDebugModeEnabled(): boolean {
  if (typeof window !== 'undefined') {
    return !!(window as any).__HUA_I18N_DEBUG__;
  }
  return false;
}

// 핵심 훅들 export
export { useTranslation, useLanguageChange };

// 타입 export
export type { I18nConfig }; 