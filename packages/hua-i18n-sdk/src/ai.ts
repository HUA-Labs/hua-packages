/**
 * hua-i18n-sdk/ai - AI 기능 전용 엔트리포인트
 * 
 * 이 모듈은 AI 기반 번역 및 자동 번역 기능을 제공합니다.
 * 누락된 번역 키를 자동으로 생성하거나 번역 품질을 개선할 수 있습니다.
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
 * AI 기능용 설정 함수
 * 
 * @example
 * ```tsx
 * // app/layout.tsx (Next.js App Router)
 * import { createAiI18n } from 'hua-i18n-sdk/ai';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {createAiI18n({
 *           enableAutoTranslation: true,
 *           enableMissingKeyGeneration: true,
 *           aiProvider: 'openai',
 *           apiKey: process.env.OPENAI_API_KEY
 *         })({ children })}
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function createAiI18n(options?: {
  defaultLanguage?: string;
  fallbackLanguage?: string;
  namespaces?: string[];
  debug?: boolean;
  enableAutoTranslation?: boolean;
  enableMissingKeyGeneration?: boolean;
  enableTranslationQualityCheck?: boolean;
  aiProvider?: 'openai' | 'anthropic' | 'google' | 'custom';
  apiKey?: string;
  aiOptions?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    retryAttempts?: number;
  };
  qualityThreshold?: number; // 0-1, 번역 품질 임계값
}) {
  const {
    defaultLanguage = 'ko',
    fallbackLanguage = 'en',
    namespaces = ['common'],
    debug = process.env.NODE_ENV === 'development',
    enableAutoTranslation = false,
    enableMissingKeyGeneration = false,
    enableTranslationQualityCheck = false,
    aiProvider = 'openai',
    apiKey,
    aiOptions = {
      model: 'gpt-3.5-turbo',
      temperature: 0.3,
      maxTokens: 1000,
      retryAttempts: 3
    },
    qualityThreshold = 0.8
  } = options || {};

  // AI 번역 함수
  const aiTranslate = async (text: string, fromLanguage: string, toLanguage: string): Promise<string> => {
    if (!enableAutoTranslation || !apiKey) {
      return text;
    }

    try {
      const response = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          text,
          fromLanguage,
          toLanguage,
          provider: aiProvider,
          options: aiOptions
        })
      });

      if (!response.ok) {
        throw new Error(`AI translation failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.translation;
    } catch (error) {
      if (debug) {
        console.error('AI translation error:', error);
      }
      return text; // 원본 텍스트 반환
    }
  };

  // 누락된 키 자동 생성 함수
  const generateMissingKey = async (key: string, context: string, targetLanguage: string): Promise<string> => {
    if (!enableMissingKeyGeneration || !apiKey) {
      return `[MISSING: ${key}]`;
    }

    try {
      const response = await fetch('/api/ai/generate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          key,
          context,
          targetLanguage,
          provider: aiProvider,
          options: aiOptions
        })
      });

      if (!response.ok) {
        throw new Error(`AI key generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.translation;
    } catch (error) {
      if (debug) {
        console.error('AI key generation error:', error);
      }
      return `[MISSING: ${key}]`;
    }
  };

  // 번역 품질 검사 함수
  const checkTranslationQuality = async (
    originalText: string, 
    translatedText: string, 
    fromLanguage: string, 
    toLanguage: string
  ): Promise<{ score: number; suggestions: string[] }> => {
    if (!enableTranslationQualityCheck || !apiKey) {
      return { score: 1.0, suggestions: [] };
    }

    try {
      const response = await fetch('/api/ai/quality-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          originalText,
          translatedText,
          fromLanguage,
          toLanguage,
          provider: aiProvider,
          options: aiOptions
        })
      });

      if (!response.ok) {
        throw new Error(`AI quality check failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        score: result.score,
        suggestions: result.suggestions || []
      };
    } catch (error) {
      if (debug) {
        console.error('AI quality check error:', error);
      }
      return { score: 1.0, suggestions: [] };
    }
  };

  // AI 기능이 포함된 파일 로더
  const aiFileLoader = async (language: string, namespace: string) => {
    try {
      // 동적 import를 사용하여 번역 파일 로드
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

      // AI 번역 활성화된 경우, 영어 번역을 기반으로 자동 번역
      if (enableAutoTranslation && language !== 'en') {
        const englishData = await loadEnglishTranslations(namespace);
        const aiTranslatedData: Record<string, string> = {};

        for (const [key, englishText] of Object.entries(englishData)) {
          if (!(data as Record<string, string>)[key]) {
            const aiTranslation = await aiTranslate(englishText, 'en', language);
            aiTranslatedData[key] = aiTranslation;
          }
        }

        // AI 번역 결과를 기존 데이터와 병합
        data = { ...data, ...aiTranslatedData };
      }

      return data;
    }
    catch (error) {
      console.warn(`Failed to load translation file: ${language}/${namespace}.json`);
      return getDefaultTranslations(language, namespace);
    }
  };

  // 영어 번역 로드 (AI 번역의 기준으로 사용)
  const loadEnglishTranslations = async (namespace: string): Promise<Record<string, string>> => {
    try {
      const possiblePaths = [
        `../translations/en/${namespace}.json`,
        `./translations/en/${namespace}.json`,
        `translations/en/${namespace}.json`,
        `../../translations/en/${namespace}.json`,
      ];

      for (const path of possiblePaths) {
        try {
          const module = await import(path);
          return module.default || module;
        } catch (pathError) {
          continue;
        }
      }

      return getDefaultTranslations('en', namespace);
    } catch (error) {
      return getDefaultTranslations('en', namespace);
    }
  };

  // AI 기능이 포함된 missing key 핸들러
  const aiMissingKeyHandler = async (key: string, language: string, namespace: string) => {
    if (enableMissingKeyGeneration && apiKey) {
      try {
        // 영어 번역을 기준으로 AI 번역 생성
        const englishData = await loadEnglishTranslations(namespace);
        const englishText = (englishData as Record<string, string>)[key];
        
        if (englishText) {
          const aiTranslation = await generateMissingKey(key, englishText, language);
          
          if (debug) {
            console.log(`🤖 [AI] Generated translation for missing key: ${key} -> ${aiTranslation}`);
          }
          
          return aiTranslation;
        }
      } catch (error) {
        if (debug) {
          console.error(`🤖 [AI] Failed to generate translation for key: ${key}`, error);
        }
      }
    }

    if (debug) {
      console.warn(`Missing translation key: ${key}`);
    }
    return `[MISSING: ${key}]`;
  };

  const config: I18nConfig = {
    defaultLanguage,
    fallbackLanguage,
    supportedLanguages: defaultLanguages,
    namespaces,
    loadTranslations: aiFileLoader,
    debug,
    missingKeyHandler: aiMissingKeyHandler as any, // 타입 호환성을 위해 any 사용
    errorHandler: (error: any, language: string, namespace: string) => {
      if (debug) {
        console.error(`Translation error for ${language}:${namespace}:`, error);
      }
    },
    autoLanguageSync: true
  };

  // Provider 컴포넌트 반환
  return function AiI18nProvider({ children }: { children: React.ReactNode }) {
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
 * 자동 번역이 활성화된 Provider
 */
export function createAutoTranslationProvider(apiKey: string, options?: {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}) {
  return createAiI18n({
    enableAutoTranslation: true,
    apiKey,
    aiOptions: options
  });
}

/**
 * 누락된 키 자동 생성이 활성화된 Provider
 */
export function createMissingKeyGeneratorProvider(apiKey: string, options?: {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}) {
  return createAiI18n({
    enableMissingKeyGeneration: true,
    apiKey,
    aiOptions: options
  });
}

/**
 * 번역 품질 검사가 활성화된 Provider
 */
export function createQualityCheckProvider(apiKey: string, qualityThreshold?: number) {
  return createAiI18n({
    enableTranslationQualityCheck: true,
    apiKey,
    qualityThreshold
  });
}

/**
 * 모든 AI 기능이 활성화된 Provider
 */
export function createFullAiProvider(apiKey: string, options?: {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  qualityThreshold?: number;
}) {
  return createAiI18n({
    enableAutoTranslation: true,
    enableMissingKeyGeneration: true,
    enableTranslationQualityCheck: true,
    apiKey,
    aiOptions: {
      model: options?.model,
      temperature: options?.temperature,
      maxTokens: options?.maxTokens
    },
    qualityThreshold: options?.qualityThreshold
  });
}

// AI 유틸리티 함수들
export async function translateWithAI(
  text: string, 
  fromLanguage: string, 
  toLanguage: string, 
  apiKey: string,
  options?: {
    provider?: 'openai' | 'anthropic' | 'google';
    model?: string;
    temperature?: number;
  }
): Promise<string> {
  try {
    const response = await fetch('/api/ai/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        text,
        fromLanguage,
        toLanguage,
        provider: options?.provider || 'openai',
        options: {
          model: options?.model || 'gpt-3.5-turbo',
          temperature: options?.temperature || 0.3
        }
      })
    });

    if (!response.ok) {
      throw new Error(`AI translation failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.translation;
  } catch (error) {
    console.error('AI translation error:', error);
    return text;
  }
}

export async function checkTranslationQuality(
  originalText: string,
  translatedText: string,
  fromLanguage: string,
  toLanguage: string,
  apiKey: string
): Promise<{ score: number; suggestions: string[] }> {
  try {
    const response = await fetch('/api/ai/quality-check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        originalText,
        translatedText,
        fromLanguage,
        toLanguage
      })
    });

    if (!response.ok) {
      throw new Error(`AI quality check failed: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      score: result.score,
      suggestions: result.suggestions || []
    };
  } catch (error) {
    console.error('AI quality check error:', error);
    return { score: 1.0, suggestions: [] };
  }
}

// 핵심 훅들 export
export { useTranslation, useLanguageChange };

// 타입 export
export type { I18nConfig }; 