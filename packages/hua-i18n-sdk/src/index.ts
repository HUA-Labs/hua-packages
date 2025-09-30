import React from 'react';

// 🚨 DEPRECATION WARNING 🚨
console.warn(`
🚨 DEPRECATION WARNING 🚨
@hua-labs/i18n-sdk is deprecated and will be removed in v2.0.0

Please migrate to the new domain-specific packages:

📦 For beginners:
   npm install @hua-labs/i18n-beginner
   import { useTranslation } from '@hua-labs/i18n-beginner'

📦 For advanced users:
   npm install @hua-labs/i18n-advanced
   import { useTranslation } from '@hua-labs/i18n-advanced'

📦 For core functionality:
   npm install @hua-labs/i18n-core
   import { useTranslation } from '@hua-labs/i18n-core'

📦 For AI features:
   npm install @hua-labs/i18n-ai
   import { useTranslation } from '@hua-labs/i18n-ai'

📦 For debug tools:
   npm install @hua-labs/i18n-debug
   import { useTranslation } from '@hua-labs/i18n-debug'

📦 For plugins:
   npm install @hua-labs/i18n-plugins
   import { useTranslation } from '@hua-labs/i18n-plugins'

🔗 Migration guide: https://github.com/HUA-Labs/hua-platform#migration
`);

// Types
export * from './types';
// Core
export { Translator, ssrTranslate, serverTranslate } from './core/translator';
// Simple API
export { createI18nApp, SimpleProvider, createLanguageProvider, createDebugProvider } from './simple';
// Plugin System
export { I18nPluginManager } from './plugins/manager';
export { analyticsPlugin } from './plugins/builtin/analytics';
export { cachePlugin } from './plugins/builtin/cache';
export type { Plugin, PluginFactory, PluginContext, PluginHooks, PluginManager } from './plugins/types';
// Advanced Features
export { PerformanceMonitor } from './advanced/performance-monitor';
export { AutoOptimizer } from './advanced/auto-optimizer';
export { I18nDashboard } from './advanced/dashboard';
export { AdvancedFeaturesTest } from './advanced/test-component';
export type { 
  PerformanceMetrics, 
  PerformanceAlert, 
  OptimizationSuggestion
} from './advanced/performance-monitor';
// Hooks
export { I18nProvider, useI18n, useTranslation, useLanguageChange, usePreloadTranslations, useAutoLoadNamespace } from './hooks/useI18n';

// 기본 설정 헬퍼 함수들
export function createI18nConfig(config: any) {
    return config;
}

// 초보자용 기본 설정 함수
export function withDefaultConfig(options?: {
    defaultLanguage?: string;
    fallbackLanguage?: string;
    namespaces?: string[];
    debug?: boolean;
    autoLanguageSync?: boolean;
}) {
    const defaultLanguages = [
        { code: 'ko', name: 'Korean', nativeName: '한국어' },
        { code: 'en', name: 'English', nativeName: 'English' },
    ];

    const config = createI18nConfig({
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
    });

    // Provider 컴포넌트 반환
    return function DefaultI18nProvider({ children }: { children: React.ReactNode }) {
        const { I18nProvider } = require('./hooks/useI18n');
        return React.createElement(I18nProvider, { config }, children);
    };
}

// 기본 파일 로더 (translations/ko/common.json 형태)
function createDefaultFileLoader() {
    return async (language: string, namespace: string) => {
        try {
            // 동적 import를 사용하여 번역 파일 로드
            // 테스트 환경에서는 상대 경로가 다를 수 있으므로 여러 경로 시도
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

            // 모든 경로가 실패하면 빈 객체 반환
            console.warn(`Failed to load translation file: ${language}/${namespace}.json`);
            return {};
        }
        catch (error) {
            console.warn(`Failed to load translation file: translations/${language}/${namespace}.json`);
            return {};
        }
    };
}

// 간단한 설정 함수들
export function createSimpleConfig(options: any) {
    const supportedLanguages = [
        { code: 'ko', name: 'Korean', nativeName: '한국어' },
        { code: 'en', name: 'English', nativeName: 'English' },
    ];
    return createI18nConfig({
        defaultLanguage: options.defaultLanguage,
        fallbackLanguage: options.fallbackLanguage || 'en',
        supportedLanguages,
        namespaces: ['common'],
        loadTranslations: options.loadTranslations,
        debug: options.debug || false,
    });
}

// 파일 기반 번역 로더 (일반적인 사용 사례)
export function createFileLoader(basePath: string) {
    return async (language: string, namespace: string) => {
        try {
            // 동적 import를 사용하여 번역 파일 로드
            const module = await import(`${basePath}/${language}/${namespace}.json`);
            return module.default || module;
        }
        catch (error) {
            console.warn(`Failed to load translation file: ${basePath}/${language}/${namespace}.json`);
            return {};
        }
    };
}

// API 기반 번역 로더
export function createApiLoader(apiUrl: string, apiKey?: string) {
    return async (language: string, namespace: string) => {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (apiKey) {
                headers['Authorization'] = `Bearer ${apiKey}`;
            }
            const response = await fetch(`${apiUrl}/translations/${language}/${namespace}`, {
                headers,
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            console.warn(`Failed to load translations from API: ${apiUrl}/translations/${language}/${namespace}`);
            return {};
        }
    };
}

// 개발용 설정 (디버그 모드 활성화)
export function createDevConfig(config: any) {
    return {
        ...config,
        debug: true,
        missingKeyHandler: (key: string) => `[MISSING: ${key}]`,
        errorHandler: (error: any, language: string, namespace: string) => {
            console.error(`Translation error for ${language}:${namespace}:`, error);
        },
    };
} 