/**
 * 간단한 API - 진짜 한 줄 설정
 * 초보자를 위한 최소한의 설정으로 바로 시작할 수 있는 API
 */

import React from 'react';
import { I18nProvider, I18nConfig } from './easy';

export interface SimpleConfig {
  defaultLanguage?: string;
  fallbackLanguage?: string;
  namespaces?: string[];
  debug?: boolean;
  autoLanguageSync?: boolean;
}

/**
 * 진짜 한 줄로 i18n 설정을 완료하는 함수
 * 
 * @example
 * ```tsx
 * // app/layout.tsx (Next.js App Router)
 * import { createI18nApp } from 'hua-i18n-sdk/simple';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {createI18nApp()({ children })}
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // pages/_app.tsx (Next.js Pages Router)
 * import { createI18nApp } from 'hua-i18n-sdk/simple';
 * 
 * export default function App({ Component, pageProps }) {
 *   return createI18nApp()({ children: <Component {...pageProps} /> });
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // src/App.tsx (Create React App)
 * import { createI18nApp } from 'hua-i18n-sdk/simple';
 * 
 * function App() {
 *   return createI18nApp()({
 *     children: <div>Hello World</div>
 *   });
 * }
 * ```
 */
export function createI18nApp(options: SimpleConfig = {}) {
  const {
    defaultLanguage = 'ko',
    fallbackLanguage = 'en',
    namespaces = ['common'],
    debug = process.env.NODE_ENV === 'development',
    autoLanguageSync = true
  } = options;

  // 기본 설정 생성
  const config: I18nConfig = {
    defaultLanguage,
    fallbackLanguage,
    supportedLanguages: [
      { code: defaultLanguage, name: 'Default', nativeName: 'Default' },
      { code: fallbackLanguage, name: 'Fallback', nativeName: 'Fallback' },
    ],
    namespaces,
    loadTranslations: async (language: string, namespace: string) => {
      try {
        // 기본 번역 파일 경로 시도
        const paths = [
          `../translations/${language}/${namespace}.json`,
          `./translations/${language}/${namespace}.json`,
          `../../translations/${language}/${namespace}.json`,
        ];

        for (const path of paths) {
          try {
            const module = await import(path);
            return module.default;
          } catch (e) {
            // 다음 경로 시도
            continue;
          }
        }

        // 번역 파일을 찾을 수 없는 경우 기본 번역 반환
        return getDefaultTranslations(language, namespace);
      } catch (error) {
        console.warn(`Failed to load translations for ${language}:${namespace}`, error);
        return getDefaultTranslations(language, namespace);
      }
    },
    debug,
    missingKeyHandler: (key: string) => {
      if (debug) {
        console.warn(`Missing translation key: ${key}`);
        return `[MISSING: ${key}]`;
      }
      return key.split('.').pop() || key;
    },
    errorHandler: (error: Error) => {
      if (debug) {
        console.error('Translation error:', error);
      }
    }
  };

  // Provider 컴포넌트 반환
  return function SimpleI18nProvider({ children }: { children: React.ReactNode }) {
    return React.createElement(I18nProvider, { config, children });
  };
}

/**
 * 기본 번역 데이터 (번역 파일이 없을 때 사용)
 */
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
 * 더 간단한 Provider (기본값만 사용)
 */
export function SimpleProvider({ children }: { children: React.ReactNode }) {
  return createI18nApp()({ children });
}

/**
 * 언어별 Provider (언어만 지정)
 */
export function createLanguageProvider(language: string) {
  return createI18nApp({ defaultLanguage: language });
}

/**
 * 디버그 모드 Provider (디버그 모드 활성화)
 */
export function createDebugProvider() {
  return createI18nApp({ debug: true });
} 