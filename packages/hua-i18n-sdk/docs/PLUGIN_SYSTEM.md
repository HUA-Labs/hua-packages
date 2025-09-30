# 플러그인 시스템 - hua-i18n-sdk

> **v1.2.0** - 확장 가능한 아키텍처를 위한 플러그인 시스템

## 📋 목차

- [개요](#개요)
- [기본 사용법](#기본-사용법)
- [내장 플러그인](#내장-플러그인)
- [커스텀 플러그인](#커스텀-플러그인)
- [플러그인 API](#플러그인-api)
- [고급 기능](#고급-기능)
- [예제](#예제)

---

## 개요

hua-i18n-sdk의 플러그인 시스템은 SDK의 기능을 확장할 수 있는 강력한 아키텍처를 제공합니다.

### **주요 특징**

- ✅ **확장 가능한 아키텍처** - 새로운 기능을 쉽게 추가
- ✅ **우선순위 시스템** - 플러그인 실행 순서 제어
- ✅ **훅 시스템** - 번역 프로세스의 각 단계에 개입
- ✅ **타입 안전성** - TypeScript로 완벽한 타입 지원
- ✅ **에러 처리** - 플러그인 에러 격리 및 복구

### **플러그인 훅**

```tsx
interface PluginHooks {
  beforeLoad?: (context) => void;        // 번역 로드 전
  afterLoad?: (context) => void;         // 번역 로드 후
  beforeTranslate?: (context) => void;   // 번역 전
  afterTranslate?: (context) => void;    // 번역 후
  onError?: (context) => void;           // 에러 발생 시
  onLanguageChange?: (context) => void;  // 언어 변경 시
  onNamespaceChange?: (context) => void; // 네임스페이스 변경 시
  onInit?: (context) => void;            // 초기화 시
  onDestroy?: (context) => void;         // 정리 시
}
```

---

## 기본 사용법

### **플러그인 등록**

```tsx
import { createI18nConfig, I18nProvider } from 'hua-i18n-sdk';
import { analyticsPlugin, cachePlugin } from 'hua-i18n-sdk';

const config = createI18nConfig({
  defaultLanguage: 'ko',
  fallbackLanguage: 'en',
  supportedLanguages: [
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'en', name: 'English', nativeName: 'English' },
  ],
  namespaces: ['common'],
  loadTranslations: async (language: string, namespace: string) => {
    const module = await import(`../translations/${language}/${namespace}.json`);
    return module.default;
  },
  // 플러그인 등록
  plugins: [
    analyticsPlugin({ trackMissingKeys: true }),
    cachePlugin({ maxSize: 100, ttl: 300000 })
  ]
});

export default function Layout({ children }) {
  return <I18nProvider config={config}>{children}</I18nProvider>;
}
```

### **플러그인 매니저 직접 사용**

```tsx
import { I18nPluginManager, analyticsPlugin, cachePlugin } from 'hua-i18n-sdk';

const pluginManager = new I18nPluginManager();

// 플러그인 등록
pluginManager.register(analyticsPlugin({ trackPerformance: true }));
pluginManager.register(cachePlugin({ maxSize: 50 }));

// 플러그인 상태 확인
const status = pluginManager.getStatus();
console.log('Active plugins:', status.pluginList);
```

---

## 내장 플러그인

### **1. 분석 플러그인 (Analytics)**

번역 사용 통계를 추적하고 분석합니다.

```tsx
import { analyticsPlugin } from 'hua-i18n-sdk';

const analytics = analyticsPlugin({
  trackMissingKeys: true,    // 누락된 키 추적
  trackPerformance: true,    // 성능 추적
  trackUsage: true,          // 사용 패턴 추적
  customAnalytics: (event, data) => {
    // 커스텀 분석 로직
    console.log(`[Custom Analytics] ${event}:`, data);
  },
  console: true              // 콘솔 출력
});
```

**추적 데이터:**
```tsx
// 플러그인에서 통계 조회
const stats = analytics.options.getStats();
console.log(stats);
// {
//   totalTranslations: 150,
//   averageTime: 12.5,
//   missingKeysCount: 3,
//   errorCount: 1,
//   topKeys: [['common.welcome', 25], ['common.greeting', 20]],
//   topLanguages: [['ko', 100], ['en', 50]],
//   topNamespaces: [['common', 150]]
// }
```

### **2. 캐시 플러그인 (Cache)**

번역 데이터를 캐싱하여 성능을 향상시킵니다.

```tsx
import { cachePlugin } from 'hua-i18n-sdk';

const cache = cachePlugin({
  maxSize: 100,              // 최대 캐시 크기
  ttl: 300000,               // 캐시 유효 시간 (5분)
  strategy: 'lru',           // 캐시 전략 (lru, fifo, lfu)
  persist: true,             // 브라우저 저장소에 저장
  storage: 'localStorage',   // 저장소 타입
  keyPrefix: 'i18n_cache_'   // 키 접두사
});
```

**캐시 전략:**
- **LRU (Least Recently Used)**: 가장 오래전에 사용된 항목 제거
- **FIFO (First In First Out)**: 먼저 들어온 항목부터 제거
- **LFU (Least Frequently Used)**: 가장 적게 사용된 항목 제거

**캐시 통계:**
```tsx
const cacheStats = cache.options.getCacheStats();
console.log(cacheStats);
// {
//   size: 15,
//   maxSize: 100,
//   hitRate: 0.85,
//   strategy: 'lru',
//   ttl: 300000,
//   persist: true
// }
```

---

## 커스텀 플러그인

### **기본 플러그인 구조**

```tsx
import { Plugin, PluginFactory, PluginContext, PluginPriority } from 'hua-i18n-sdk';

export interface MyPluginOptions {
  enabled?: boolean;
  logLevel?: 'info' | 'warn' | 'error';
}

export const myPlugin: PluginFactory<MyPluginOptions> = (options = {}) => {
  const { enabled = true, logLevel = 'info' } = options;

  const plugin: Plugin = {
    name: 'my-custom-plugin',
    version: '1.0.0',
    priority: PluginPriority.NORMAL,
    hooks: {
      beforeTranslate: (context) => {
        if (!enabled) return;
        
        console.log(`[${logLevel}] Translating: ${context.key}`);
      },

      afterTranslate: (context) => {
        if (!enabled) return;
        
        console.log(`[${logLevel}] Translated: ${context.key} -> ${context.value}`);
      },

      onError: (context) => {
        console.error(`[${logLevel}] Translation error:`, context.error);
      },

      onInit: () => {
        console.log(`[${logLevel}] My plugin initialized`);
      },

      onDestroy: () => {
        console.log(`[${logLevel}] My plugin destroyed`);
      }
    },
    options: {
      // 커스텀 메서드
      getStatus: () => ({ enabled, logLevel }),
      setLogLevel: (level: 'info' | 'warn' | 'error') => {
        options.logLevel = level;
      }
    }
  };

  return plugin;
};
```

### **고급 플러그인 예제**

```tsx
import { Plugin, PluginFactory, PluginContext, PluginPriority } from 'hua-i18n-sdk';

export interface ValidationPluginOptions {
  strict?: boolean;
  reportMissing?: boolean;
  customRules?: Array<(key: string, value: string) => boolean>;
}

export const validationPlugin: PluginFactory<ValidationPluginOptions> = (options = {}) => {
  const { strict = false, reportMissing = true, customRules = [] } = options;
  
  const validationErrors: Array<{ key: string; error: string; timestamp: number }> = [];

  const validateTranslation = (key: string, value: string): boolean => {
    // 기본 검증 규칙
    const rules = [
      (k: string, v: string) => v.length > 0, // 빈 문자열 금지
      (k: string, v: string) => !v.includes('{{}}'), // 미완성 템플릿 금지
      (k: string, v: string) => v.trim().length > 0, // 공백만 있는 문자열 금지
      ...customRules
    ];

    for (const rule of rules) {
      if (!rule(key, value)) {
        validationErrors.push({
          key,
          error: `Validation failed for key: ${key}`,
          timestamp: Date.now()
        });
        return false;
      }
    }

    return true;
  };

  const plugin: Plugin = {
    name: 'validation',
    version: '1.0.0',
    priority: PluginPriority.HIGH,
    hooks: {
      afterTranslate: (context) => {
        if (!context.value) return;

        const isValid = validateTranslation(context.key, context.value);
        
        if (!isValid && strict) {
          throw new Error(`Translation validation failed for key: ${context.key}`);
        }
      },

      onError: (context) => {
        validationErrors.push({
          key: context.key,
          error: context.error.message,
          timestamp: Date.now()
        });
      },

      onDestroy: () => {
        if (reportMissing && validationErrors.length > 0) {
          console.warn('Validation errors found:', validationErrors);
        }
      }
    },
    options: {
      getValidationErrors: () => [...validationErrors],
      clearErrors: () => {
        validationErrors.length = 0;
      },
      addRule: (rule: (key: string, value: string) => boolean) => {
        customRules.push(rule);
      }
    }
  };

  return plugin;
};
```

---

## 플러그인 API

### **Plugin 인터페이스**

```tsx
interface Plugin {
  name: string;              // 플러그인 이름 (고유해야 함)
  version: string;           // 플러그인 버전
  hooks: PluginHooks;        // 훅 함수들
  options?: Record<string, any>; // 커스텀 옵션
}
```

### **PluginContext 인터페이스**

```tsx
interface PluginContext {
  config: I18nConfig;        // i18n 설정
  language: string;          // 현재 언어
  namespace: string;         // 현재 네임스페이스
  key: string;              // 번역 키
  value?: string;           // 번역 값
  error?: Error;            // 에러 정보
  performance?: {           // 성능 정보
    startTime: number;
    endTime: number;
    duration: number;
  };
}
```

### **PluginManager 메서드**

```tsx
interface PluginManager {
  register(plugin: Plugin): void;                    // 플러그인 등록
  unregister(pluginName: string): void;              // 플러그인 등록 해제
  getPlugin(pluginName: string): Plugin | undefined; // 플러그인 조회
  getAllPlugins(): Plugin[];                         // 모든 플러그인 조회
  executeHook(hookName, context): Promise<void>;     // 훅 실행
  getStatus(): PluginStatus;                         // 상태 조회
}
```

---

## 고급 기능

### **플러그인 우선순위**

```tsx
enum PluginPriority {
  LOW = 0,        // 낮은 우선순위
  NORMAL = 50,    // 일반 우선순위
  HIGH = 100,     // 높은 우선순위
  CRITICAL = 200  // 최고 우선순위
}

// 우선순위가 높은 플러그인이 먼저 실행됨
const criticalPlugin = {
  name: 'critical',
  priority: PluginPriority.CRITICAL,
  hooks: { /* ... */ }
};
```

### **플러그인 체인**

```tsx
// 플러그인들이 순차적으로 실행되어 데이터를 변환
const transformPlugin = {
  name: 'transform',
  hooks: {
    afterTranslate: (context) => {
      // 번역 결과를 변환
      context.value = context.value?.toUpperCase();
    }
  }
};

const formatPlugin = {
  name: 'format',
  hooks: {
    afterTranslate: (context) => {
      // 포맷팅 적용
      context.value = `[${context.value}]`;
    }
  }
};
```

### **조건부 플러그인**

```tsx
const conditionalPlugin = {
  name: 'conditional',
  hooks: {
    beforeTranslate: (context) => {
      // 특정 조건에서만 실행
      if (context.language === 'ko' && context.key.startsWith('common.')) {
        // 한국어 common 네임스페이스에만 적용
        console.log('Applying Korean-specific logic');
      }
    }
  }
};
```

---

## 예제

### **실제 사용 예제**

```tsx
// app/layout.tsx
import { createI18nConfig, I18nProvider } from 'hua-i18n-sdk';
import { analyticsPlugin, cachePlugin } from 'hua-i18n-sdk';
import { validationPlugin } from './plugins/validation';

const config = createI18nConfig({
  defaultLanguage: 'ko',
  fallbackLanguage: 'en',
  supportedLanguages: [
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'en', name: 'English', nativeName: 'English' },
  ],
  namespaces: ['common', 'auth', 'dashboard'],
  loadTranslations: async (language: string, namespace: string) => {
    const module = await import(`../translations/${language}/${namespace}.json`);
    return module.default;
  },
  plugins: [
    // 성능 최적화
    cachePlugin({
      maxSize: 200,
      ttl: 600000, // 10분
      strategy: 'lru',
      persist: true
    }),
    
    // 분석 및 모니터링
    analyticsPlugin({
      trackMissingKeys: true,
      trackPerformance: true,
      customAnalytics: (event, data) => {
        // 외부 분석 서비스로 전송
        if (window.gtag) {
          window.gtag('event', event, data);
        }
      }
    }),
    
    // 검증
    validationPlugin({
      strict: process.env.NODE_ENV === 'production',
      reportMissing: true
    })
  ]
});

export default function RootLayout({ children }) {
  return <I18nProvider config={config}>{children}</I18nProvider>;
}
```

### **플러그인 개발 가이드**

```tsx
// plugins/my-plugin.ts
import { Plugin, PluginFactory, PluginContext } from 'hua-i18n-sdk';

export interface MyPluginOptions {
  featureFlag?: boolean;
  apiEndpoint?: string;
}

export const myPlugin: PluginFactory<MyPluginOptions> = (options = {}) => {
  const { featureFlag = false, apiEndpoint = '/api/translations' } = options;

  const plugin: Plugin = {
    name: 'my-custom-plugin',
    version: '1.0.0',
    hooks: {
      beforeLoad: async (context) => {
        if (!featureFlag) return;
        
        // API에서 번역 데이터 가져오기
        try {
          const response = await fetch(`${apiEndpoint}/${context.language}/${context.namespace}`);
          if (response.ok) {
            const data = await response.json();
            context.value = data; // 로드 중단
          }
        } catch (error) {
          console.warn('Failed to load from API:', error);
        }
      },

      afterTranslate: (context) => {
        // 번역 완료 후 처리
        if (featureFlag) {
          console.log(`[MyPlugin] Translated: ${context.key} -> ${context.value}`);
        }
      }
    },
    options: {
      isEnabled: () => featureFlag,
      setFeatureFlag: (enabled: boolean) => {
        options.featureFlag = enabled;
      }
    }
  };

  return plugin;
};
```

---

## 모범 사례

### **1. 플러그인 설계 원칙**

- **단일 책임**: 하나의 플러그인은 하나의 기능만 담당
- **의존성 최소화**: 다른 플러그인에 의존하지 않도록 설계
- **에러 격리**: 플러그인 에러가 전체 시스템에 영향을 주지 않도록
- **성능 고려**: 플러그인이 성능에 미치는 영향 최소화

### **2. 플러그인 테스트**

```tsx
// plugins/__tests__/my-plugin.test.ts
import { myPlugin } from '../my-plugin';

describe('MyPlugin', () => {
  it('should initialize correctly', () => {
    const plugin = myPlugin({ featureFlag: true });
    expect(plugin.name).toBe('my-custom-plugin');
    expect(plugin.hooks.beforeLoad).toBeDefined();
  });

  it('should handle errors gracefully', async () => {
    const plugin = myPlugin({ featureFlag: true });
    const context = {
      config: {},
      language: 'ko',
      namespace: 'common',
      key: 'test'
    };

    // 에러가 발생해도 시스템이 중단되지 않아야 함
    await expect(plugin.hooks.beforeLoad?.(context)).resolves.not.toThrow();
  });
});
```

### **3. 플러그인 배포**

```json
// package.json
{
  "name": "hua-i18n-sdk-my-plugin",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "hua-i18n-sdk": "^1.2.0"
  },
  "keywords": [
    "i18n",
    "plugin",
    "translation",
    "hua-i18n-sdk"
  ]
}
```

---

## 추가 리소스

### **공식 문서**
- [SDK 레퍼런스](./SDK_REFERENCE.md)
- [API 문서](./API_REFERENCE.md)

### **커뮤니티**
- [플러그인 갤러리](https://github.com/HUA-Labs/i18n-sdk-plugins)
- [플러그인 개발 가이드](https://github.com/HUA-Labs/i18n-sdk/wiki/Plugin-Development)

### **예제 프로젝트**
- [플러그인 예제](../examples/plugins/)
- [고급 플러그인](../examples/advanced-plugins/)

---

**플러그인 시스템으로 hua-i18n-sdk를 확장해보세요!** 🚀 