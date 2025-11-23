/**
 * hua-i18n-sdk/plugins - 플러그인 시스템 전용 엔트리포인트
 * 
 * 이 모듈은 플러그인 기능을 활용하고 싶은 경우 사용합니다.
 * 분석, 캐싱, 커스텀 플러그인 등을 쉽게 추가할 수 있습니다.
 */

import React from 'react';
import { I18nProvider, useI18n, useTranslation, useLanguageChange } from './hooks/useI18n';
import { I18nPluginManager } from './plugins/manager';
import { analyticsPlugin } from './plugins/builtin/analytics';
import { cachePlugin } from './plugins/builtin/cache';
import { I18nConfig } from './types';
import type { 
  Plugin, 
  PluginFactory, 
  PluginContext, 
  PluginHooks, 
  PluginManager,
  PluginPriority
} from './plugins/types';

// 기본 언어 설정
const defaultLanguages = [
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'en', name: 'English', nativeName: 'English' },
];

/**
 * 플러그인 시스템용 설정 함수
 * 
 * @example
 * ```tsx
 * // app/layout.tsx (Next.js App Router)
 * import { createPluginI18n } from 'hua-i18n-sdk/plugins';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {createPluginI18n({
 *           plugins: [
 *             analyticsPlugin({ trackMissingKeys: true }),
 *             cachePlugin({ maxSize: 1000, ttl: 300000 })
 *           ]
 *         })({ children })}
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function createPluginI18n(options?: {
  defaultLanguage?: string;
  fallbackLanguage?: string;
  namespaces?: string[];
  debug?: boolean;
  plugins?: PluginFactory[];
  enableBuiltinPlugins?: {
    analytics?: boolean;
    cache?: boolean;
  };
  pluginOptions?: {
    analytics?: {
      trackMissingKeys?: boolean;
      trackPerformance?: boolean;
      endpoint?: string;
    };
    cache?: {
      maxSize?: number;
      ttl?: number;
      strategy?: 'lru' | 'fifo';
    };
  };
}) {
  const {
    defaultLanguage = 'ko',
    fallbackLanguage = 'en',
    namespaces = ['common'],
    debug = process.env.NODE_ENV === 'development',
    plugins = [],
    enableBuiltinPlugins = {
      analytics: true,
      cache: true
    },
    pluginOptions = {}
  } = options || {};

  // 플러그인 매니저 설정
  const pluginManager = new I18nPluginManager();
  
  // 내장 플러그인 등록
  if (enableBuiltinPlugins.analytics) {
    pluginManager.register(analyticsPlugin(pluginOptions.analytics));
  }
  
  if (enableBuiltinPlugins.cache) {
    pluginManager.register(cachePlugin(pluginOptions.cache));
  }
  
  // 커스텀 플러그인 등록
  plugins.forEach(pluginFactory => {
    pluginManager.register(pluginFactory());
  });

  // 플러그인 시스템용 파일 로더
  const pluginFileLoader = async (language: string, namespace: string) => {
    const context: PluginContext = {
      config: {} as I18nConfig, // 실제 config는 나중에 설정됨
      language,
      namespace,
      key: '',
      performance: {
        startTime: performance.now(),
        endTime: 0,
        duration: 0
      }
    };

    try {
      // beforeLoad 훅 실행
      await pluginManager.executeHook('beforeLoad', context);

      // 번역 파일 로드
      const possiblePaths = [
        `../translations/${language}/${namespace}.json`,
        `./translations/${language}/${namespace}.json`,
        `translations/${language}/${namespace}.json`,
        `../../translations/${language}/${namespace}.json`,
      ];

      let data = {};
      for (const path of possiblePaths) {
        try {
          const module = await import(path);
          data = module.default || module;
          break;
        } catch (pathError) {
          continue;
        }
      }

      // 기본 번역으로 폴백
      if (Object.keys(data).length === 0) {
        data = getDefaultTranslations(language, namespace);
      }

      // 성능 측정 완료
      context.performance!.endTime = performance.now();
      context.performance!.duration = context.performance!.endTime - context.performance!.startTime;

      // afterLoad 훅 실행
      await pluginManager.executeHook('afterLoad', { ...context, data } as any);

      return data;
    }
    catch (error) {
      // 성능 측정 완료
      context.performance!.endTime = performance.now();
      context.performance!.duration = context.performance!.endTime - context.performance!.startTime;
      context.error = error as Error;

      // onError 훅 실행
      await pluginManager.executeHook('onError', { ...context, error: error as Error });

      return getDefaultTranslations(language, namespace);
    }
  };

  const config: I18nConfig = {
    defaultLanguage,
    fallbackLanguage,
    supportedLanguages: defaultLanguages,
    namespaces,
    loadTranslations: pluginFileLoader,
    debug,
    missingKeyHandler: (key: string) => {
      if (debug) {
        console.warn(`Missing translation key: ${key}`);
      }
      return `[MISSING: ${key}]`;
    },
    errorHandler: (error: any, language: string, namespace: string) => {
      if (debug) {
        console.error(`Translation error for ${language}:${namespace}:`, error);
      }
    },
    autoLanguageSync: true,
    plugins: pluginManager
  };

  // Provider 컴포넌트 반환
  return function PluginI18nProvider({ children }: { children: React.ReactNode }) {
    // 플러그인 초기화
    React.useEffect(() => {
      const initContext: PluginContext = {
        config,
        language: defaultLanguage,
        namespace: namespaces[0] || 'common',
        key: ''
      };
      
      pluginManager.executeHook('onInit', initContext);

      return () => {
        pluginManager.executeHook('onDestroy', initContext);
      };
    }, []);

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
 * 분석 플러그인이 활성화된 Provider
 */
export function createAnalyticsProvider(options?: {
  trackMissingKeys?: boolean;
  trackPerformance?: boolean;
  endpoint?: string;
}) {
  return createPluginI18n({
    enableBuiltinPlugins: {
      analytics: true,
      cache: false
    },
    pluginOptions: {
      analytics: options
    }
  });
}

/**
 * 캐시 플러그인이 활성화된 Provider
 */
export function createCacheProvider(options?: {
  maxSize?: number;
  ttl?: number;
  strategy?: 'lru' | 'fifo';
}) {
  return createPluginI18n({
    enableBuiltinPlugins: {
      analytics: false,
      cache: true
    },
    pluginOptions: {
      cache: options
    }
  });
}

/**
 * 모든 내장 플러그인이 활성화된 Provider
 */
export function createFullPluginProvider() {
  return createPluginI18n({
    enableBuiltinPlugins: {
      analytics: true,
      cache: true
    }
  });
}

/**
 * 커스텀 플러그인만 사용하는 Provider
 */
export function createCustomPluginProvider(plugins: PluginFactory[]) {
  return createPluginI18n({
    enableBuiltinPlugins: {
      analytics: false,
      cache: false
    },
    plugins
  });
}

// 플러그인 시스템 export
export { 
  I18nPluginManager, 
  analyticsPlugin, 
  cachePlugin 
};
export { gptTranslatorPlugin } from './plugins/builtin/gpt-translator';

// 플러그인 타입들 export
export type { 
  Plugin, 
  PluginFactory, 
  PluginContext, 
  PluginHooks, 
  PluginManager,
  PluginPriority
};

// 핵심 훅들 export
export { useTranslation, useLanguageChange };

// 타입 export
export type { I18nConfig }; 