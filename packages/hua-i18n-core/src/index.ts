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
import { I18nConfig, I18nContextType, TranslationParams, TypedTranslationKeys, ResolveStringKey, ResolveArrayKey } from './types';

// Window 객체 타입 확장
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
    __I18N_PERFORMANCE_DATA__?: Record<string, number[]>;
    __I18N_PERFORMANCE_ALERTS__?: Array<{
      id: string;
      type: 'warning' | 'error' | 'info';
      severity: 'low' | 'medium' | 'high' | 'critical';
      message: string;
      metric: string;
      value: number;
      threshold: number;
      timestamp: number;
      resolved: boolean;
    }>;
    __I18N_ANALYTICS_DATA__?: {
      missingKeys?: Set<string> | string[];
      performance?: {
        totalTime: number;
        averageTime: number;
        calls: number;
      };
      usage?: {
        keys?: Map<string, number> | Record<string, number>;
        languages?: Map<string, number> | Record<string, number>;
        namespaces?: Map<string, number> | Record<string, number>;
      };
      errors?: Array<{
        timestamp: number;
        error: string;
        context: string;
      }>;
    };
  }
}

// 기본 언어 설정 (10개 언어 지원)
const defaultLanguages = [
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'en-IN', name: 'English (India)', nativeName: 'English (India)' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
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
  /**
   * SSR에서 전달된 초기 번역 데이터 (네트워크 요청 없이 사용)
   * 형식: { [language]: { [namespace]: { [key]: value } } }
   */
  initialTranslations?: Record<string, Record<string, Record<string, string>>>;
  /**
   * 지원 언어 목록 (LanguageConfig 배열 또는 언어 코드 문자열 배열)
   * 기본값: ['ko', 'en']
   */
  supportedLanguages?: Array<{ code: string; name: string; nativeName: string }> | string[];
  /**
   * 자동 언어 동기화 활성화 여부
   * 기본값: false (Zustand 어댑터 등 외부에서 직접 처리하는 경우)
   */
  autoLanguageSync?: boolean;
  /**
   * 서버사이드 렌더링 시 사용할 기본 URL
   * 환경 변수보다 우선 적용됨
   */
  baseUrl?: string;
  /**
   * 로컬 개발 환경 fallback URL
   * 기본값: 'http://localhost:3010'
   */
  localFallbackBaseUrl?: string;
}) {
  const {
    defaultLanguage = 'ko',
    fallbackLanguage = 'en',
    namespaces = ['common'],
    debug = false,
    loadTranslations,
    translationLoader = 'api',
    translationApiPath = '/api/translations',
    initialTranslations,
    supportedLanguages: providedSupportedLanguages,
    autoLanguageSync = false, // 기본값 false (Zustand 어댑터 등 외부에서 직접 처리)
    baseUrl,
    localFallbackBaseUrl,
  } = options || {};

  // supportedLanguages 처리: string[] 또는 LanguageConfig[] 모두 지원
  let supportedLanguagesConfig: Array<{ code: string; name: string; nativeName: string }>;
  if (providedSupportedLanguages) {
    if (Array.isArray(providedSupportedLanguages) && providedSupportedLanguages.length > 0) {
      // string[]인지 LanguageConfig[]인지 확인
      if (typeof providedSupportedLanguages[0] === 'string') {
        // string[]를 LanguageConfig[]로 변환
        const languageMap: Record<string, { name: string; nativeName: string }> = {
          ko: { name: 'Korean', nativeName: '한국어' },
          en: { name: 'English', nativeName: 'English' },
          ja: { name: 'Japanese', nativeName: '日本語' },
          zh: { name: 'Chinese', nativeName: '中文' },
          es: { name: 'Spanish', nativeName: 'Español' },
          fr: { name: 'French', nativeName: 'Français' },
          de: { name: 'German', nativeName: 'Deutsch' },
          pt: { name: 'Portuguese', nativeName: 'Português' },
          it: { name: 'Italian', nativeName: 'Italiano' },
          ru: { name: 'Russian', nativeName: 'Русский' },
        };
        supportedLanguagesConfig = (providedSupportedLanguages as string[]).map(code => ({
          code,
          name: languageMap[code]?.name || code,
          nativeName: languageMap[code]?.nativeName || code,
        }));
      } else {
        // LanguageConfig[]인 경우 그대로 사용
        supportedLanguagesConfig = providedSupportedLanguages as Array<{ code: string; name: string; nativeName: string }>;
      }
    } else {
      supportedLanguagesConfig = defaultLanguages;
    }
  } else {
    supportedLanguagesConfig = defaultLanguages;
  }

  /**
   * 서버사이드/클라이언트사이드 URL 빌드 함수
   * createApiTranslationLoader의 로직을 참고하여 구현
   */
  const buildUrl = (language: string, namespace: string): string => {
    const safeNamespace = namespace.replace(/[^a-zA-Z0-9-_]/g, '');
    const path = `${translationApiPath}/${language}/${safeNamespace}`;
    
    // 클라이언트 사이드: 상대 경로 사용
    if (typeof window !== 'undefined') {
      return path;
    }
    
    // 서버사이드: 절대 URL 필요
    // 1. baseUrl 옵션이 있으면 우선 사용
    if (baseUrl) {
      return `${baseUrl}${path}`;
    }
    
    // 2. NEXT_PUBLIC_SITE_URL 환경 변수 확인
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return `${process.env.NEXT_PUBLIC_SITE_URL}${path}`;
    }
    
    // 3. VERCEL_URL 환경 변수 확인
    if (process.env.VERCEL_URL) {
      const vercelUrl = process.env.VERCEL_URL.startsWith('http')
        ? process.env.VERCEL_URL
        : `https://${process.env.VERCEL_URL}`;
      return `${vercelUrl}${path}`;
    }
    
    // 4. 로컬 개발 환경 fallback
    const fallbackBase = localFallbackBaseUrl ?? 'http://localhost:3010';
    return `${fallbackBase}${path}`;
  };
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
    supportedLanguages: supportedLanguagesConfig,
    namespaces,
    loadTranslations: translationLoader === 'custom' && loadTranslations 
      ? loadTranslations 
      : defaultFileLoader,
    initialTranslations, // SSR 번역 데이터 전달
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
    errorHandler: (error: unknown, language: string, namespace: string) => {
      if (debug) {
        console.error(`Translation error for ${language}:${namespace}:`, error);
      }
    },
    // autoLanguageSync는 기본적으로 false (Zustand 어댑터 등 외부에서 직접 처리하는 경우)
    // 필요시 options에서 명시적으로 true로 설정 가능
    autoLanguageSync: options?.autoLanguageSync ?? false
  };

  // Provider 컴포넌트 반환
  return function CoreI18nProvider({ children }: { children: React.ReactNode }) {
    return React.createElement(I18nProvider, { config, children });
  };
}

// 기본 번역 데이터는 공통 유틸리티에서 가져옴
import { getDefaultTranslations } from './utils/default-translations';

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
export type { I18nConfig, I18nContextType, TranslationParams, TypedTranslationKeys, ResolveStringKey, ResolveArrayKey };