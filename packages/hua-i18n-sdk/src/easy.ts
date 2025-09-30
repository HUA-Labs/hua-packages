/**
 * hua-i18n-sdk/easy - 초보자 친화적 엔트리포인트
 * 
 * 이 모듈은 초보자들이 쉽게 시작할 수 있도록 설계되었습니다.
 * 복잡한 설정 없이 바로 사용할 수 있는 함수들만 제공합니다.
 */

import React from 'react';
import { I18nProvider, useI18n, useTranslation, useLanguageChange } from './hooks/useI18n';
import { ssrTranslate, simpleSsrTranslate, fileSsrTranslate } from './core/translator';
import { I18nConfig } from './types';

// 기본 언어 설정
const defaultLanguages = [
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'en', name: 'English', nativeName: 'English' },
];

// Next.js 환경 감지 (개선된 버전)
function isNextJSEnvironment() {
  // 서버사이드에서 Next.js 환경 감지
  if (typeof process !== 'undefined') {
    // Next.js 관련 환경변수 확인
    if (process.env.NEXT_PUBLIC_APP_ENV !== undefined) return true;
    if (process.env.NEXT_RUNTIME !== undefined) return true;
    
    // package.json에서 Next.js 의존성 확인
    try {
      const packageJson = require(process.cwd() + '/package.json');
      if (packageJson.dependencies?.next || packageJson.devDependencies?.next) {
        return true;
      }
    } catch (e) {
      // package.json을 읽을 수 없는 경우 무시
    }
  }
  
  // 클라이언트사이드에서 Next.js 환경 감지
  if (typeof window !== 'undefined') {
    return (window as any).__NEXT_DATA__ !== undefined ||
           (window as any).__NEXT_SSG_DATA__ !== undefined;
  }
  
  return false;
}

// 기본 파일 로더 (SSR 환경 고려, 네임스페이스 분기 지원)
function createDefaultFileLoader() {
  return async (language: string, namespace: string) => {
    console.log(`🔍 Loading translations for ${language}:${namespace}`);
    
    try {
      // 1. 클라이언트사이드에서 fetch 시도 (우선순위 1)
      if (typeof window !== 'undefined') {
        try {
          // 먼저 네임스페이스별 파일 시도
          console.log(`🔍 Trying client fetch: /translations/${language}/${namespace}.json`);
          const response = await fetch(`/translations/${language}/${namespace}.json`);
          if (response.ok) {
            const data = await response.json();
            console.log(`✅ Successfully loaded via client fetch`);
            console.log(`✅ Data keys:`, Object.keys(data));
            return data;
          } else {
            console.log(`❌ Client fetch failed with status:`, response.status);
          }

          // 네임스페이스 파일이 없으면 common.json에서 해당 섹션 찾기
          console.log(`🔍 Trying client fetch: /translations/${language}/common.json`);
          const commonResponse = await fetch(`/translations/${language}/common.json`);
          if (commonResponse.ok) {
            const commonData = await commonResponse.json();
            if (commonData[namespace]) {
              console.log(`✅ Found namespace ${namespace} in common.json via fetch`);
              console.log(`✅ Common namespace keys:`, Object.keys(commonData[namespace]));
              return commonData[namespace];
            }
          }
        } catch (fetchError) {
          console.log(`❌ Client fetch error:`, (fetchError as Error).message);
        }
      }

      // 2. 동적 import 시도 (마지막 수단 - 클라이언트에서만)
      if (typeof window !== 'undefined') {
        try {
          const possibleImportPaths = [
            `../translations/${language}/${namespace}.json`,
            `./translations/${language}/${namespace}.json`,
            `translations/${language}/${namespace}.json`,
            `../../translations/${language}/${namespace}.json`,
          ];

          console.log(`🔍 Trying client imports:`, possibleImportPaths);

          for (const importPath of possibleImportPaths) {
            try {
              const module = await import(importPath);
              const data = module.default || module;
              console.log(`✅ Successfully loaded via client import:`, importPath);
              console.log(`✅ Data keys:`, Object.keys(data));
              return data;
            } catch (importError) {
              console.log(`❌ Client import failed for ${importPath}:`, (importError as Error).message);
            }
          }
        } catch (importError) {
          console.log(`❌ All client imports failed:`, (importError as Error).message);
        }
      }

      // 모든 방법이 실패하면 빈 객체 반환
      console.warn(`❌ Failed to load translation file: ${language}/${namespace}.json - all methods failed`);
      return {};
    }
    catch (error) {
      console.warn(`❌ Critical error loading translation file:`, error);
      return {};
    }
  };
}

// 초보자용 기본 설정 함수
export function withDefaultConfig(options?: {
  defaultLanguage?: string;
  fallbackLanguage?: string;
  namespaces?: string[];
  debug?: boolean;
  autoLanguageSync?: boolean;
}) {
  const config: I18nConfig = {
    defaultLanguage: options?.defaultLanguage || 'ko',
    fallbackLanguage: options?.fallbackLanguage || 'en',
    supportedLanguages: defaultLanguages,
    namespaces: options?.namespaces || ['common'],
    loadTranslations: createDefaultFileLoader(),
    debug: options?.debug ?? (process.env.NODE_ENV === 'development'),
    missingKeyHandler: (key: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${key}`);
        return `[MISSING: ${key}]`;
      }
      return key;
    },
    errorHandler: (error: any, language: string, namespace: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.error(`Translation error for ${language}:${namespace}:`, error);
      }
    },
    // 자동 언어 전환 이벤트 처리 (기본값: true)
    autoLanguageSync: options?.autoLanguageSync ?? true,
  };

  // Provider 컴포넌트 반환
  return function DefaultI18nProvider({ children }: { children: React.ReactNode }) {
    const { I18nProvider } = require('./hooks/useI18n');
    return React.createElement(I18nProvider, { config }, children);
  };
}

// 간단한 번역 훅들만 export
export { useTranslation, useLanguageChange };

// SSR 전용 번역 함수 export
export { ssrTranslate, simpleSsrTranslate, fileSsrTranslate };

// 타입 export
export type { I18nConfig }; 