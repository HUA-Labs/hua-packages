/**
 * 분석 플러그인 - 번역 사용량 추적
 */

import { Plugin, PluginFactory } from '../types';

export interface AnalyticsData {
  translations: {
    [key: string]: {
      count: number;
      lastUsed: number;
      languages: string[];
    };
  };
  languages: {
    [language: string]: {
      usageCount: number;
      lastUsed: number;
      namespaces: string[];
    };
  };
  namespaces: {
    [namespace: string]: {
      usageCount: number;
      lastUsed: number;
      languages: string[];
    };
  };
  errors: Array<{
    timestamp: number;
    type: string;
    message: string;
    context: Record<string, unknown>;
  }>;
}

export function analyticsPlugin(): Plugin {
  let analyticsData: AnalyticsData = {
    translations: {},
    languages: {},
    namespaces: {},
    errors: []
  };

  // 로컬 스토리지에서 데이터 로드
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('i18n-analytics');
      if (stored) {
        analyticsData = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load analytics data from localStorage:', error);
    }
  }

  // 데이터 저장 함수
  const saveData = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('i18n-analytics', JSON.stringify(analyticsData));
      } catch (error) {
        console.warn('Failed to save analytics data to localStorage:', error);
      }
    }
  };

  return {
    name: 'analytics',
    version: '1.0.0',
    description: 'Tracks translation usage and provides analytics',
    hooks: {
      afterTranslate: (context) => {
        const { key, value, language, namespace } = context;
        const now = Date.now();

        // 번역 키 추적
        if (key && value) {
          if (!analyticsData.translations[key]) {
            analyticsData.translations[key] = {
              count: 0,
              lastUsed: now,
              languages: []
            };
          }
          
          analyticsData.translations[key].count++;
          analyticsData.translations[key].lastUsed = now;
          
          if (!analyticsData.translations[key].languages.includes(language)) {
            analyticsData.translations[key].languages.push(language);
          }
        }

        // 언어 사용량 추적
        if (language) {
          if (!analyticsData.languages[language]) {
            analyticsData.languages[language] = {
              usageCount: 0,
              lastUsed: now,
              namespaces: []
            };
          }
          
          analyticsData.languages[language].usageCount++;
          analyticsData.languages[language].lastUsed = now;
          
          if (namespace && !analyticsData.languages[language].namespaces.includes(namespace)) {
            analyticsData.languages[language].namespaces.push(namespace);
          }
        }

        // 네임스페이스 사용량 추적
        if (namespace) {
          if (!analyticsData.namespaces[namespace]) {
            analyticsData.namespaces[namespace] = {
              usageCount: 0,
              lastUsed: now,
              languages: []
            };
          }
          
          analyticsData.namespaces[namespace].usageCount++;
          analyticsData.namespaces[namespace].lastUsed = now;
          
          if (language && !analyticsData.namespaces[namespace].languages.includes(language)) {
            analyticsData.namespaces[namespace].languages.push(language);
          }
        }

        saveData();
      },

      onTranslateError: (context) => {
        const { error, language, namespace, key } = context;
        
        analyticsData.errors.push({
          timestamp: Date.now(),
          type: 'translation_error',
          message: error.message,
          context: {
            language,
            namespace,
            key,
            stack: error.stack
          }
        });

        // 최대 100개 에러까지만 유지
        if (analyticsData.errors.length > 100) {
          analyticsData.errors = analyticsData.errors.slice(-100);
        }

        saveData();
      },

      onLanguageChange: (context) => {
        const { language } = context;
        const now = Date.now();

        if (language) {
          if (!analyticsData.languages[language]) {
            analyticsData.languages[language] = {
              usageCount: 0,
              lastUsed: now,
              namespaces: []
            };
          }
          
          analyticsData.languages[language].lastUsed = now;
        }

        saveData();
      }
    },
    priority: 5,
    enabled: true,
    config: {
      maxErrors: 100,
      saveInterval: 1000
    }
  };
}

// 분석 데이터 조회 함수들
export function getAnalyticsData(): AnalyticsData {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('i18n-analytics');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load analytics data:', error);
    }
  }
  
  return {
    translations: {},
    languages: {},
    namespaces: {},
    errors: []
  };
}

export function clearAnalyticsData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('i18n-analytics');
  }
}

export function getMostUsedTranslations(limit: number = 10): Array<{ key: string; count: number }> {
  const data = getAnalyticsData();
  return Object.entries(data.translations)
    .map(([key, info]) => ({ key, count: info.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getMostUsedLanguages(limit: number = 5): Array<{ language: string; usageCount: number }> {
  const data = getAnalyticsData();
  return Object.entries(data.languages)
    .map(([language, info]) => ({ language, usageCount: info.usageCount }))
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, limit);
}

export function getRecentErrors(limit: number = 10): Array<{ timestamp: number; message: string; context: Record<string, unknown> }> {
  const data = getAnalyticsData();
  return data.errors
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit)
    .map(error => ({
      timestamp: error.timestamp,
      message: error.message,
      context: error.context
    }));
} 