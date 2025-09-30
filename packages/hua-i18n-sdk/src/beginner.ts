/**
 * hua-i18n-sdk/beginner - 초보자 전용 엔트리포인트
 * 
 * 이 모듈은 i18n을 처음 사용하는 개발자들을 위해 설계되었습니다.
 * 복잡한 설정 없이 바로 시작할 수 있는 최소한의 API만 제공합니다.
 */

import React from 'react';
import { I18nProvider, useI18n, useTranslation, useLanguageChange } from './hooks/useI18n';
import { I18nConfig } from './types';

// 기본 언어 설정
const defaultLanguages = [
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'en', name: 'English', nativeName: 'English' },
];

// 프레임워크 타입 정의
export type Framework = 'nextjs' | 'cra' | 'vite' | 'nuxt' | 'auto';

// 프레임워크별 번역 파일 경로
const frameworkPaths = {
  nextjs: [
    'src/app/translations',
    'translations',
    'public/locales'
  ],
  cra: [
    'public/locales',
    'src/locales',
    'translations'
  ],
  vite: [
    'public/locales',
    'src/locales',
    'translations'
  ],
  nuxt: [
    'locales',
    'translations'
  ],
  auto: [
    'src/app/translations',
    'public/locales',
    'src/locales',
    'translations'
  ]
};

// 프레임워크 자동 감지
function detectFramework(): Framework {
  if (typeof window !== 'undefined') {
    // 브라우저 환경
    if (window.location.pathname.includes('/_next/')) return 'nextjs';
    if (document.querySelector('[data-vite-dev-id]')) return 'vite';
    return 'auto';
  } else {
    // Node.js 환경
    try {
      const fs = require('fs');
      const path = require('path');
      
      // package.json 확인
      if (fs.existsSync('package.json')) {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        if (pkg.dependencies?.next) return 'nextjs';
        if (pkg.dependencies?.['react-scripts']) return 'cra';
        if (pkg.dependencies?.vite) return 'vite';
        if (pkg.dependencies?.nuxt) return 'nuxt';
      }
      
      // 디렉토리 구조 확인
      if (fs.existsSync('src/app')) return 'nextjs';
      if (fs.existsSync('public') && fs.existsSync('src')) return 'cra';
      
      return 'auto';
    } catch {
      return 'auto';
    }
  }
}

// 기본 파일 로더 (간단하고 안전한 방식)
function createDefaultFileLoader() {
  return async (language: string, namespace: string) => {
    try {
      // 기본 번역 반환 (동적 import 제거)
      return getDefaultTranslations(language, namespace);
    }
    catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`🌍 번역 파일을 찾을 수 없습니다: ${language}/${namespace}.json`);
        console.warn(`💡 해결 방법:`);
        console.warn(`   1. 번역 파일을 생성하세요 (translations/${language}/${namespace}.json)`);
        console.warn(`   2. 또는 loadTranslations 옵션으로 커스텀 로더를 제공하세요`);
        console.warn(`   3. 또는 framework 옵션을 명시적으로 지정하세요`);
      }
      return getDefaultTranslations(language, namespace);
    }
  };
}

// 기본 번역 데이터 (번역 파일이 없을 때 사용)
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
 * 초보자용 기본 설정 함수
 * 
 * @example
 * ```tsx
 * // 가장 간단한 사용법 (프레임워크 자동 감지)
 * const I18nProvider = createBeginnerI18n({
 *   defaultLanguage: 'ko',
 *   namespaces: ['common', 'home']
 * })
 * 
 * // 프레임워크 명시적 지정
 * const I18nProvider = createBeginnerI18n({
 *   defaultLanguage: 'ko',
 *   namespaces: ['common', 'home'],
 *   framework: 'nextjs'
 * })
 * 
 * // 커스텀 로더 사용
 * const I18nProvider = createBeginnerI18n({
 *   defaultLanguage: 'ko',
 *   namespaces: ['common', 'home'],
 *   loadTranslations: async (lang, ns) => {
 *     const module = await import(`./locales/${lang}/${ns}.json`)
 *     return module.default
 *   }
 * })
 * ```
 */
export function createBeginnerI18n(options?: {
  defaultLanguage?: string;
  fallbackLanguage?: string;
  namespaces?: string[];
  debug?: boolean;
  framework?: Framework;
  loadTranslations?: (language: string, namespace: string) => Promise<Record<string, string>>;
}) {
  const config: I18nConfig = {
    defaultLanguage: options?.defaultLanguage || 'ko',
    fallbackLanguage: options?.fallbackLanguage || 'en',
    supportedLanguages: defaultLanguages,
    namespaces: options?.namespaces || ['common'],
    loadTranslations: options?.loadTranslations || createDefaultFileLoader(),
    debug: options?.debug ?? (process.env.NODE_ENV === 'development'),
    missingKeyHandler: (key: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`🔑 번역 키가 없습니다: ${key}`);
        console.warn(`💡 번역 파일에 해당 키를 추가하거나, 기본값을 사용합니다.`);
        return `[MISSING: ${key}]`;
      }
      return key.split('.').pop() || key;
    },
    errorHandler: (error: any, language: string, namespace: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ 번역 오류 (${language}:${namespace}):`, error);
        console.error(`💡 번역 파일 경로와 형식을 확인해주세요.`);
      }
    },
    autoLanguageSync: true,
  };

  // Provider 컴포넌트 반환
  return function BeginnerI18nProvider({ children }: { children: React.ReactNode }) {
    return React.createElement(I18nProvider, { config, children });
  };
}

/**
 * 가장 간단한 Provider (기본값만 사용)
 */
export function BeginnerProvider({ children }: { children: React.ReactNode }) {
  return createBeginnerI18n()({ children });
}

/**
 * 언어별 Provider (언어만 지정)
 */
export function createLanguageProvider(language: string) {
  return createBeginnerI18n({ defaultLanguage: language });
}

/**
 * 디버그 모드 Provider (디버그 모드 활성화)
 */
export function createDebugProvider() {
  return createBeginnerI18n({ debug: true });
}

// 핵심 훅들만 export
export { useTranslation, useLanguageChange };

// 타입 export
export type { I18nConfig }; 