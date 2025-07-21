/**
 * 분석 플러그인 - 번역 사용 통계 추적
 * 누락된 키, 성능, 사용 패턴 등을 분석
 */

import { Plugin, PluginFactory, PluginContext, PluginPriority } from '../types';

export interface AnalyticsPluginOptions {
  trackMissingKeys?: boolean;
  trackPerformance?: boolean;
  trackUsage?: boolean;
  customAnalytics?: (event: string, data: any) => void;
  console?: boolean;
}

export interface AnalyticsData {
  missingKeys: Set<string>;
  performance: {
    totalTime: number;
    averageTime: number;
    calls: number;
  };
  usage: {
    keys: Map<string, number>;
    languages: Map<string, number>;
    namespaces: Map<string, number>;
  };
  errors: Array<{
    timestamp: number;
    error: string;
    context: string;
  }>;
}

export const analyticsPlugin: PluginFactory<AnalyticsPluginOptions> = (options = {}) => {
  const {
    trackMissingKeys = true,
    trackPerformance = true,
    trackUsage = true,
    customAnalytics,
    console: consoleOutput = true
  } = options;

  const analyticsData: AnalyticsData = {
    missingKeys: new Set(),
    performance: {
      totalTime: 0,
      averageTime: 0,
      calls: 0
    },
    usage: {
      keys: new Map(),
      languages: new Map(),
      namespaces: new Map()
    },
    errors: []
  };

  const trackEvent = (event: string, data: any) => {
    if (customAnalytics) {
      customAnalytics(event, data);
    }
    
    if (consoleOutput) {
      console.log(`[Analytics] ${event}:`, data);
    }
  };

  const updatePerformance = (duration: number) => {
    analyticsData.performance.calls++;
    analyticsData.performance.totalTime += duration;
    analyticsData.performance.averageTime = 
      analyticsData.performance.totalTime / analyticsData.performance.calls;
  };

  const updateUsage = (key: string, language: string, namespace: string) => {
    // 키 사용량 추적
    const keyCount = analyticsData.usage.keys.get(key) || 0;
    analyticsData.usage.keys.set(key, keyCount + 1);

    // 언어 사용량 추적
    const langCount = analyticsData.usage.languages.get(language) || 0;
    analyticsData.usage.languages.set(language, langCount + 1);

    // 네임스페이스 사용량 추적
    const nsCount = analyticsData.usage.namespaces.get(namespace) || 0;
    analyticsData.usage.namespaces.set(namespace, nsCount + 1);
  };

  const plugin: Plugin = {
    id: 'analytics',
    name: 'analytics',
    version: '1.0.0',
    // priority: PluginPriority.LOW,
    hooks: {
      beforeTranslate: (context) => {
        if (trackPerformance) {
          context.performance = {
            startTime: Date.now(),
            endTime: 0,
            duration: 0
          };
        }
      },

      afterTranslate: (context) => {
        if (trackPerformance && context.performance) {
          context.performance.endTime = Date.now();
          context.performance.duration = 
            context.performance.endTime - context.performance.startTime;
          
          updatePerformance(context.performance.duration);
        }

        if (trackUsage) {
          updateUsage(context.key, context.language, context.namespace);
        }

        trackEvent('translation_completed', {
          key: context.key,
          language: context.language,
          namespace: context.namespace,
          duration: context.performance?.duration,
          result: context.value
        });
      },

      onError: (context) => {
        const errorData = {
          timestamp: Date.now(),
          error: context.error.message,
          context: `${context.language}:${context.namespace}:${context.key}`
        };

        analyticsData.errors.push(errorData);

        trackEvent('translation_error', errorData);
      },

      onInit: () => {
        trackEvent('analytics_initialized', {
          options: {
            trackMissingKeys,
            trackPerformance,
            trackUsage
          }
        });
      },

      onDestroy: () => {
        // 최종 통계 출력
        const finalStats = {
          totalTranslations: analyticsData.performance.calls,
          averageTime: analyticsData.performance.averageTime,
          missingKeys: Array.from(analyticsData.missingKeys),
          topKeys: Array.from(analyticsData.usage.keys.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10),
          topLanguages: Array.from(analyticsData.usage.languages.entries())
            .sort(([,a], [,b]) => b - a),
          topNamespaces: Array.from(analyticsData.usage.namespaces.entries())
            .sort(([,a], [,b]) => b - a),
          errors: analyticsData.errors.length
        };

        trackEvent('analytics_final_stats', finalStats);
      }
    },
    options: {
      getAnalyticsData: () => ({ ...analyticsData }),
      getStats: () => ({
        totalTranslations: analyticsData.performance.calls,
        averageTime: analyticsData.performance.averageTime,
        missingKeysCount: analyticsData.missingKeys.size,
        errorCount: analyticsData.errors.length,
        topKeys: Array.from(analyticsData.usage.keys.entries())
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5),
        topLanguages: Array.from(analyticsData.usage.languages.entries())
          .sort(([,a], [,b]) => b - a),
        topNamespaces: Array.from(analyticsData.usage.namespaces.entries())
          .sort(([,a], [,b]) => b - a)
      }),
      clearData: () => {
        analyticsData.missingKeys.clear();
        analyticsData.performance = { totalTime: 0, averageTime: 0, calls: 0 };
        analyticsData.usage.keys.clear();
        analyticsData.usage.languages.clear();
        analyticsData.usage.namespaces.clear();
        analyticsData.errors = [];
      }
    }
  };

  return plugin;
}; 