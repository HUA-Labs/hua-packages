/**
 * hua-i18n-sdk/advanced - 고급자 전용 엔트리포인트
 * 
 * 이 모듈은 성능 최적화, 모니터링, 대시보드 등 고급 기능을 필요로 하는 개발자들을 위해 설계되었습니다.
 * 프로덕션 환경에서 i18n 성능을 모니터링하고 최적화할 수 있는 도구들을 제공합니다.
 */

import React from 'react';
import { I18nProvider, useI18n, useTranslation, useLanguageChange, usePreloadTranslations, useAutoLoadNamespace } from './hooks/useI18n';
import { PerformanceMonitor } from './advanced/performance-monitor';
import { AutoOptimizer } from './advanced/auto-optimizer';
import { I18nDashboard } from './advanced/dashboard';
import { AdvancedFeaturesTest } from './advanced/test-component';
import { I18nPluginManager } from './plugins/manager';
import { analyticsPlugin } from './plugins/builtin/analytics';
import { cachePlugin } from './plugins/builtin/cache';
import { I18nConfig } from './types';
import type { 
  PerformanceMetrics, 
  PerformanceAlert, 
  OptimizationSuggestion
} from './advanced/performance-monitor';
import type {
  Plugin,
  PluginFactory,
  PluginContext,
  PluginHooks,
  PluginManager
} from './plugins/types';

// 기본 언어 설정
const defaultLanguages = [
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'en', name: 'English', nativeName: 'English' },
];

/**
 * 고급자용 설정 함수
 * 
 * @example
 * ```tsx
 * // app/layout.tsx (Next.js App Router)
 * import { createAdvancedI18n } from 'hua-i18n-sdk/advanced';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {createAdvancedI18n({
 *           enablePerformanceMonitoring: true,
 *           enableAutoOptimization: true,
 *           enableAnalytics: true,
 *           enableCaching: true
 *         })({ children })}
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function createAdvancedI18n(options?: {
  defaultLanguage?: string;
  fallbackLanguage?: string;
  namespaces?: string[];
  debug?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableAutoOptimization?: boolean;
  enableAnalytics?: boolean;
  enableCaching?: boolean;
  customPlugins?: PluginFactory[];
  performanceThresholds?: {
    translationTime?: number;
    memoryUsage?: number;
    cacheHitRate?: number;
  };
}) {
  const {
    defaultLanguage = 'ko',
    fallbackLanguage = 'en',
    namespaces = ['common'],
    debug = process.env.NODE_ENV === 'development',
    enablePerformanceMonitoring = true,
    enableAutoOptimization = true,
    enableAnalytics = true,
    enableCaching = true,
    customPlugins = [],
    performanceThresholds = {
      translationTime: 10, // ms
      memoryUsage: 50, // MB
      cacheHitRate: 0.8 // 80%
    }
  } = options || {};

  // 플러그인 매니저 설정
  const pluginManager = new I18nPluginManager();
  
  if (enableAnalytics) {
    pluginManager.register(analyticsPlugin());
  }
  
  if (enableCaching) {
    pluginManager.register(cachePlugin());
  }
  
  // 커스텀 플러그인 등록
  customPlugins.forEach(pluginFactory => {
    pluginManager.register(pluginFactory());
  });

  const config: I18nConfig = {
    defaultLanguage,
    fallbackLanguage,
    supportedLanguages: defaultLanguages,
    namespaces,
    loadTranslations: createAdvancedFileLoader(),
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
    autoLanguageSync: true,
    plugins: pluginManager,
    performanceMonitoring: enablePerformanceMonitoring ? {
      enabled: true,
      thresholds: performanceThresholds
    } : undefined,
    autoOptimization: enableAutoOptimization ? {
      enabled: true,
      strategies: ['cache', 'preload', 'lazy']
    } : undefined
  };

  // Provider 컴포넌트 반환
  return function AdvancedI18nProvider({ children }: { children: React.ReactNode }) {
    return React.createElement(I18nProvider, { config, children });
  };
}

// 고급 파일 로더 (캐싱, 재시도, 폴백 지원)
function createAdvancedFileLoader() {
  return async (language: string, namespace: string) => {
    const maxRetries = 3;
    const retryDelay = 1000; // 1초

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
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
        if (attempt === maxRetries) {
          console.warn(`Failed to load translation file after ${maxRetries} attempts: ${language}/${namespace}.json`);
          return getDefaultTranslations(language, namespace);
        }
        
        // 재시도 전 대기
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
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
 * 성능 모니터링이 활성화된 Provider
 */
export function createPerformanceProvider() {
  return createAdvancedI18n({ enablePerformanceMonitoring: true });
}

/**
 * 자동 최적화가 활성화된 Provider
 */
export function createOptimizedProvider() {
  return createAdvancedI18n({ enableAutoOptimization: true });
}

/**
 * 모든 고급 기능이 활성화된 Provider
 */
export function createFullAdvancedProvider() {
  return createAdvancedI18n({
    enablePerformanceMonitoring: true,
    enableAutoOptimization: true,
    enableAnalytics: true,
    enableCaching: true
  });
}

// 고급 훅들 export
export { 
  useTranslation, 
  useLanguageChange, 
  usePreloadTranslations, 
  useAutoLoadNamespace 
};

// 고급 컴포넌트들 export
export { 
  PerformanceMonitor, 
  AutoOptimizer, 
  I18nDashboard, 
  AdvancedFeaturesTest 
};

// 플러그인 시스템 export
export { 
  I18nPluginManager, 
  analyticsPlugin, 
  cachePlugin 
};

// 타입들 export
export type { 
  I18nConfig,
  PerformanceMetrics, 
  PerformanceAlert, 
  OptimizationSuggestion,
  Plugin,
  PluginFactory,
  PluginContext,
  PluginHooks,
  PluginManager
}; 