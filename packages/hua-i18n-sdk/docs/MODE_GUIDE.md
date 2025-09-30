# hua-i18n-sdk 모드별 사용 가이드

> **hua-i18n-sdk v1.2.1** - 모드별 엔트리포인트 완전 가이드

---

## 🇰🇷 한국어 | 🇺🇸 [English](#-english)

---

## 🇰🇷 한국어

### 📋 목차

1. [개요](#1-개요)
2. [모드별 엔트리포인트](#2-모드별-엔트리포인트)
3. [사용 시나리오별 가이드](#3-사용-시나리오별-가이드)
4. [마이그레이션 가이드](#4-마이그레이션-가이드)
5. [레거시 시스템 통합](#5-레거시-시스템-통합)

---

### 1. 개요

hua-i18n-sdk는 다양한 사용 시나리오에 맞춰 모드별 엔트리포인트를 제공합니다. 각 모드는 특정 요구사항에 최적화되어 있어, 프로젝트의 복잡도와 필요에 따라 적절한 모드를 선택할 수 있습니다.

#### 🎯 모드 선택 기준

| 모드 | 복잡도 | 사용 시기 | 주요 특징 |
|------|--------|-----------|-----------|
| **easy** | ⭐ | 초보자, 빠른 프로토타입 | 한 줄 설정, 자동 감지 |
| **beginner** | ⭐⭐ | 초보자, 간단한 앱 | 기본 설정, 안정적 |
| **simple** | ⭐⭐ | 중급자, 일반적인 앱 | 간단한 설정, 유연함 |
| **core** | ⭐⭐⭐ | 중급자, 커스텀 필요 | 핵심 기능만, 가벼움 |
| **plugins** | ⭐⭐⭐ | 중급자, 확장성 필요 | 플러그인 시스템 |
| **advanced** | ⭐⭐⭐⭐ | 고급자, 성능 중요 | 성능 모니터링, 최적화 |
| **debug** | ⭐⭐ | 개발자, 문제 해결 | 디버깅 도구 |
| **ai** | ⭐⭐⭐⭐ | 고급자, AI 기능 필요 | AI 번역, 자동 생성 |

---

### 2. 모드별 엔트리포인트

#### 🚀 Easy Mode - 가장 간단한 시작

```tsx
// app/layout.tsx (Next.js App Router)
import { withDefaultConfig } from 'hua-i18n-sdk/easy';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {withDefaultConfig()({ children })}
      </body>
    </html>
  );
}
```

**특징:**
- ✅ 한 줄로 설정 완료
- ✅ 자동 파일 경로 감지
- ✅ 기본 번역 제공
- ✅ 개발 모드 자동 감지

#### 🎯 Beginner Mode - 초보자 친화적

```tsx
// app/layout.tsx (Next.js App Router)
import { createBeginnerI18n } from 'hua-i18n-sdk/beginner';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {createBeginnerI18n({
          defaultLanguage: 'ko',
          fallbackLanguage: 'en',
          namespaces: ['common', 'auth']
        })({ children })}
      </body>
    </html>
  );
}
```

**특징:**
- ✅ 간단한 설정
- ✅ 안정적인 기본값
- ✅ 명확한 에러 메시지
- ✅ 기본 번역 제공

#### 🔧 Simple Mode - 간단하지만 유연

```tsx
// app/layout.tsx (Next.js App Router)
import { createI18nApp } from 'hua-i18n-sdk/simple';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {createI18nApp({
          defaultLanguage: 'ko',
          fallbackLanguage: 'en',
          namespaces: ['common', 'auth', 'dashboard'],
          debug: process.env.NODE_ENV === 'development'
        })({ children })}
      </body>
    </html>
  );
}
```

**특징:**
- ✅ 간단한 설정
- ✅ 유연한 옵션
- ✅ 개발자 친화적
- ✅ 기본 번역 제공

#### ⚡ Core Mode - 핵심 기능만

```tsx
// app/layout.tsx (Next.js App Router)
import { createCoreI18n } from 'hua-i18n-sdk/core';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {createCoreI18n({
          defaultLanguage: 'ko',
          fallbackLanguage: 'en',
          namespaces: ['common'],
          loadTranslations: async (language, namespace) => {
            // 커스텀 로더
            const response = await fetch(`/api/translations/${language}/${namespace}`);
            return response.json();
          }
        })({ children })}
      </body>
    </html>
  );
}
```

**특징:**
- ✅ 핵심 기능만
- ✅ 가벼운 번들 크기
- ✅ 커스텀 로더 지원
- ✅ 최대 성능

#### 🔌 Plugins Mode - 확장 가능

```tsx
// app/layout.tsx (Next.js App Router)
import { createPluginI18n } from 'hua-i18n-sdk/plugins';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {createPluginI18n({
          enableBuiltinPlugins: {
            analytics: true,
            cache: true
          },
          pluginOptions: {
            analytics: {
              trackMissingKeys: true,
              endpoint: '/api/analytics'
            },
            cache: {
              maxSize: 1000,
              ttl: 300000 // 5분
            }
          }
        })({ children })}
      </body>
    </html>
  );
}
```

**특징:**
- ✅ 플러그인 시스템
- ✅ 분석 및 캐싱
- ✅ 확장 가능한 아키텍처
- ✅ 커스텀 플러그인 지원

#### 🚀 Advanced Mode - 고급 기능

```tsx
// app/layout.tsx (Next.js App Router)
import { createAdvancedI18n } from 'hua-i18n-sdk/advanced';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {createAdvancedI18n({
          enablePerformanceMonitoring: true,
          enableAutoOptimization: true,
          enableAnalytics: true,
          enableCaching: true,
          performanceThresholds: {
            translationTime: 10, // ms
            memoryUsage: 50, // MB
            cacheHitRate: 0.8 // 80%
          }
        })({ children })}
      </body>
    </html>
  );
}
```

**특징:**
- ✅ 성능 모니터링
- ✅ 자동 최적화
- ✅ 대시보드
- ✅ 고급 분석

#### 🐛 Debug Mode - 개발자 도구

```tsx
// app/layout.tsx (Next.js App Router)
import { createDebugI18n } from 'hua-i18n-sdk/debug';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {createDebugI18n({
          enableConsoleLogging: true,
          enableMissingKeyTracking: true,
          enablePerformanceTracking: true,
          enableErrorTracking: true,
          logLevel: 'debug'
        })({ children })}
      </body>
    </html>
  );
}
```

**특징:**
- ✅ 상세한 로깅
- ✅ 누락 키 추적
- ✅ 성능 추적
- ✅ 에러 추적

#### 🤖 AI Mode - AI 기능

```tsx
// app/layout.tsx (Next.js App Router)
import { createAiI18n } from 'hua-i18n-sdk/ai';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {createAiI18n({
          enableAutoTranslation: true,
          enableMissingKeyGeneration: true,
          enableTranslationQualityCheck: true,
          aiProvider: 'openai',
          apiKey: process.env.OPENAI_API_KEY,
          aiOptions: {
            model: 'gpt-3.5-turbo',
            temperature: 0.3,
            maxTokens: 1000
          }
        })({ children })}
      </body>
    </html>
  );
}
```

**특징:**
- ✅ AI 자동 번역
- ✅ 누락 키 자동 생성
- ✅ 번역 품질 검사
- ✅ 다중 AI 제공자 지원

---

### 3. 사용 시나리오별 가이드

#### 🎯 시나리오 1: 빠른 프로토타입

**추천 모드:** `easy`

```tsx
import { withDefaultConfig, useTranslation } from 'hua-i18n-sdk/easy';

// 한 줄로 설정
export const I18nProvider = withDefaultConfig();

function App() {
  return (
    <I18nProvider>
      <MyComponent />
    </I18nProvider>
  );
}

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('welcome')}</h1>;
}
```

#### 🎯 시나리오 2: 프로덕션 앱

**추천 모드:** `simple` 또는 `plugins`

```tsx
import { createI18nApp, useTranslation } from 'hua-i18n-sdk/simple';

const I18nProvider = createI18nApp({
  defaultLanguage: 'ko',
  fallbackLanguage: 'en',
  namespaces: ['common', 'auth', 'dashboard'],
  debug: process.env.NODE_ENV === 'development'
});

function App() {
  return (
    <I18nProvider>
      <MyComponent />
    </I18nProvider>
  );
}
```

#### 🎯 시나리오 3: 고성능 앱

**추천 모드:** `advanced`

```tsx
import { createAdvancedI18n, useTranslation } from 'hua-i18n-sdk/advanced';

const I18nProvider = createAdvancedI18n({
  enablePerformanceMonitoring: true,
  enableAutoOptimization: true,
  enableAnalytics: true,
  enableCaching: true
});

function App() {
  return (
    <I18nProvider>
      <MyComponent />
    </I18nProvider>
  );
}
```

#### 🎯 시나리오 4: 개발 중 문제 해결

**추천 모드:** `debug`

```tsx
import { createDebugI18n, useTranslation } from 'hua-i18n-sdk/debug';

const I18nProvider = createDebugI18n({
  enableConsoleLogging: true,
  enableMissingKeyTracking: true,
  enablePerformanceTracking: true
});

function App() {
  return (
    <I18nProvider>
      <MyComponent />
    </I18nProvider>
  );
}
```

#### 🎯 시나리오 5: AI 기능 활용

**추천 모드:** `ai`

```tsx
import { createAiI18n, useTranslation } from 'hua-i18n-sdk/ai';

const I18nProvider = createAiI18n({
  enableAutoTranslation: true,
  enableMissingKeyGeneration: true,
  aiProvider: 'openai',
  apiKey: process.env.OPENAI_API_KEY
});

function App() {
  return (
    <I18nProvider>
      <MyComponent />
    </I18nProvider>
  );
}
```

---

### 4. 마이그레이션 가이드

#### 🔄 기존 분기된 패키지에서 통합 SDK로

**이전 (분기된 패키지):**
```tsx
// 이전 방식 - 여러 패키지 설치 필요
import { I18nProvider } from '@hua-labs/i18n-core';
import { useTranslation } from '@hua-labs/i18n-beginner';
```

**현재 (통합 SDK):**
```tsx
// 현재 방식 - 하나의 패키지로 모든 기능
import { I18nProvider, useTranslation } from 'hua-i18n-sdk/beginner';
```

#### 🔄 모드 간 전환

**Easy → Beginner:**
```tsx
// 이전
import { withDefaultConfig } from 'hua-i18n-sdk/easy';

// 현재
import { createBeginnerI18n } from 'hua-i18n-sdk/beginner';
```

**Simple → Advanced:**
```tsx
// 이전
import { createI18nApp } from 'hua-i18n-sdk/simple';

// 현재
import { createAdvancedI18n } from 'hua-i18n-sdk/advanced';
```

---

### 5. 레거시 시스템 통합

#### 🔧 기존 프로젝트에 통합

**1단계: 패키지 설치**
```bash
npm install hua-i18n-sdk
# 또는
yarn add hua-i18n-sdk
# 또는
pnpm add hua-i18n-sdk
```

**2단계: 적절한 모드 선택**
```tsx
// 레거시 시스템의 복잡도에 따라 모드 선택
import { createBeginnerI18n } from 'hua-i18n-sdk/beginner'; // 간단한 경우
import { createAdvancedI18n } from 'hua-i18n-sdk/advanced'; // 복잡한 경우
```

**3단계: Provider 설정**
```tsx
// app/layout.tsx 또는 _app.tsx
import { createBeginnerI18n } from 'hua-i18n-sdk/beginner';

const I18nProvider = createBeginnerI18n({
  defaultLanguage: 'ko',
  fallbackLanguage: 'en',
  namespaces: ['common']
});

export default function App({ children }) {
  return <I18nProvider>{children}</I18nProvider>;
}
```

**4단계: 컴포넌트에서 사용**
```tsx
import { useTranslation } from 'hua-i18n-sdk/beginner';

function MyComponent() {
  const { t } = useTranslation();
  return <div>{t('welcome')}</div>;
}
```

#### 🔧 점진적 마이그레이션

**1단계: 디버그 모드로 시작**
```tsx
import { createDebugI18n } from 'hua-i18n-sdk/debug';

const I18nProvider = createDebugI18n({
  enableConsoleLogging: true,
  enableMissingKeyTracking: true
});
```

**2단계: 문제 해결 후 적절한 모드로 전환**
```tsx
// 문제가 해결되면 production 모드로 전환
import { createBeginnerI18n } from 'hua-i18n-sdk/beginner';

const I18nProvider = createBeginnerI18n({
  defaultLanguage: 'ko',
  fallbackLanguage: 'en'
});
```

---

### 📚 추가 리소스

- [SDK Reference](./SDK_REFERENCE.md) - 전체 API 문서
- [Advanced Features](./ADVANCED_FEATURES.md) - 고급 기능 가이드
- [Plugin System](./PLUGIN_SYSTEM.md) - 플러그인 시스템 가이드
- [FAQ](./FAQ.md) - 자주 묻는 질문

---

## 🇺🇸 English

### 📋 Table of Contents

1. [Overview](#1-overview)
2. [Mode-specific Entry Points](#2-mode-specific-entry-points)
3. [Usage Scenarios](#3-usage-scenarios)
4. [Migration Guide](#4-migration-guide)
5. [Legacy System Integration](#5-legacy-system-integration)

---

### 1. Overview

hua-i18n-sdk provides mode-specific entry points optimized for different usage scenarios. Each mode is tailored to specific requirements, allowing you to choose the appropriate mode based on your project's complexity and needs.

#### 🎯 Mode Selection Criteria

| Mode | Complexity | When to Use | Key Features |
|------|------------|-------------|--------------|
| **easy** | ⭐ | Beginners, quick prototypes | One-line setup, auto-detection |
| **beginner** | ⭐⭐ | Beginners, simple apps | Default settings, stable |
| **simple** | ⭐⭐ | Intermediate, general apps | Simple setup, flexible |
| **core** | ⭐⭐⭐ | Intermediate, custom needs | Core features only, lightweight |
| **plugins** | ⭐⭐⭐ | Intermediate, extensibility needed | Plugin system |
| **advanced** | ⭐⭐⭐⭐ | Advanced, performance critical | Performance monitoring, optimization |
| **debug** | ⭐⭐ | Developers, troubleshooting | Debugging tools |
| **ai** | ⭐⭐⭐⭐ | Advanced, AI features needed | AI translation, auto-generation |

---

### 2. Mode-specific Entry Points

#### 🚀 Easy Mode - Simplest Start

```tsx
// app/layout.tsx (Next.js App Router)
import { withDefaultConfig } from 'hua-i18n-sdk/easy';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {withDefaultConfig()({ children })}
      </body>
    </html>
  );
}
```

**Features:**
- ✅ One-line setup
- ✅ Auto file path detection
- ✅ Default translations provided
- ✅ Development mode auto-detection

#### 🎯 Beginner Mode - Beginner Friendly

```tsx
// app/layout.tsx (Next.js App Router)
import { createBeginnerI18n } from 'hua-i18n-sdk/beginner';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {createBeginnerI18n({
          defaultLanguage: 'ko',
          fallbackLanguage: 'en',
          namespaces: ['common', 'auth']
        })({ children })}
      </body>
    </html>
  );
}
```

**Features:**
- ✅ Simple configuration
- ✅ Stable defaults
- ✅ Clear error messages
- ✅ Default translations provided

#### 🔧 Simple Mode - Simple but Flexible

```tsx
// app/layout.tsx (Next.js App Router)
import { createI18nApp } from 'hua-i18n-sdk/simple';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {createI18nApp({
          defaultLanguage: 'ko',
          fallbackLanguage: 'en',
          namespaces: ['common', 'auth', 'dashboard'],
          debug: process.env.NODE_ENV === 'development'
        })({ children })}
      </body>
    </html>
  );
}
```

**Features:**
- ✅ Simple configuration
- ✅ Flexible options
- ✅ Developer friendly
- ✅ Default translations provided

#### ⚡ Core Mode - Core Features Only

```tsx
// app/layout.tsx (Next.js App Router)
import { createCoreI18n } from 'hua-i18n-sdk/core';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {createCoreI18n({
          defaultLanguage: 'ko',
          fallbackLanguage: 'en',
          namespaces: ['common'],
          loadTranslations: async (language, namespace) => {
            // Custom loader
            const response = await fetch(`/api/translations/${language}/${namespace}`);
            return response.json();
          }
        })({ children })}
      </body>
    </html>
  );
}
```

**Features:**
- ✅ Core features only
- ✅ Lightweight bundle
- ✅ Custom loader support
- ✅ Maximum performance

#### 🔌 Plugins Mode - Extensible

```tsx
// app/layout.tsx (Next.js App Router)
import { createPluginI18n } from 'hua-i18n-sdk/plugins';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {createPluginI18n({
          enableBuiltinPlugins: {
            analytics: true,
            cache: true
          },
          pluginOptions: {
            analytics: {
              trackMissingKeys: true,
              endpoint: '/api/analytics'
            },
            cache: {
              maxSize: 1000,
              ttl: 300000 // 5 minutes
            }
          }
        })({ children })}
      </body>
    </html>
  );
}
```

**Features:**
- ✅ Plugin system
- ✅ Analytics and caching
- ✅ Extensible architecture
- ✅ Custom plugin support

#### 🚀 Advanced Mode - Advanced Features

```tsx
// app/layout.tsx (Next.js App Router)
import { createAdvancedI18n } from 'hua-i18n-sdk/advanced';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {createAdvancedI18n({
          enablePerformanceMonitoring: true,
          enableAutoOptimization: true,
          enableAnalytics: true,
          enableCaching: true,
          performanceThresholds: {
            translationTime: 10, // ms
            memoryUsage: 50, // MB
            cacheHitRate: 0.8 // 80%
          }
        })({ children })}
      </body>
    </html>
  );
}
```

**Features:**
- ✅ Performance monitoring
- ✅ Auto optimization
- ✅ Dashboard
- ✅ Advanced analytics

#### 🐛 Debug Mode - Developer Tools

```tsx
// app/layout.tsx (Next.js App Router)
import { createDebugI18n } from 'hua-i18n-sdk/debug';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {createDebugI18n({
          enableConsoleLogging: true,
          enableMissingKeyTracking: true,
          enablePerformanceTracking: true,
          enableErrorTracking: true,
          logLevel: 'debug'
        })({ children })}
      </body>
    </html>
  );
}
```

**Features:**
- ✅ Detailed logging
- ✅ Missing key tracking
- ✅ Performance tracking
- ✅ Error tracking

#### 🤖 AI Mode - AI Features

```tsx
// app/layout.tsx (Next.js App Router)
import { createAiI18n } from 'hua-i18n-sdk/ai';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {createAiI18n({
          enableAutoTranslation: true,
          enableMissingKeyGeneration: true,
          enableTranslationQualityCheck: true,
          aiProvider: 'openai',
          apiKey: process.env.OPENAI_API_KEY,
          aiOptions: {
            model: 'gpt-3.5-turbo',
            temperature: 0.3,
            maxTokens: 1000
          }
        })({ children })}
      </body>
    </html>
  );
}
```

**Features:**
- ✅ AI auto translation
- ✅ Missing key auto generation
- ✅ Translation quality check
- ✅ Multiple AI provider support

---

### 3. Usage Scenarios

#### 🎯 Scenario 1: Quick Prototype

**Recommended Mode:** `easy`

```tsx
import { withDefaultConfig, useTranslation } from 'hua-i18n-sdk/easy';

// One-line setup
export const I18nProvider = withDefaultConfig();

function App() {
  return (
    <I18nProvider>
      <MyComponent />
    </I18nProvider>
  );
}

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('welcome')}</h1>;
}
```

#### 🎯 Scenario 2: Production App

**Recommended Mode:** `simple` or `plugins`

```tsx
import { createI18nApp, useTranslation } from 'hua-i18n-sdk/simple';

const I18nProvider = createI18nApp({
  defaultLanguage: 'ko',
  fallbackLanguage: 'en',
  namespaces: ['common', 'auth', 'dashboard'],
  debug: process.env.NODE_ENV === 'development'
});

function App() {
  return (
    <I18nProvider>
      <MyComponent />
    </I18nProvider>
  );
}
```

#### 🎯 Scenario 3: High Performance App

**Recommended Mode:** `advanced`

```tsx
import { createAdvancedI18n, useTranslation } from 'hua-i18n-sdk/advanced';

const I18nProvider = createAdvancedI18n({
  enablePerformanceMonitoring: true,
  enableAutoOptimization: true,
  enableAnalytics: true,
  enableCaching: true
});

function App() {
  return (
    <I18nProvider>
      <MyComponent />
    </I18nProvider>
  );
}
```

#### 🎯 Scenario 4: Development Troubleshooting

**Recommended Mode:** `debug`

```tsx
import { createDebugI18n, useTranslation } from 'hua-i18n-sdk/debug';

const I18nProvider = createDebugI18n({
  enableConsoleLogging: true,
  enableMissingKeyTracking: true,
  enablePerformanceTracking: true
});

function App() {
  return (
    <I18nProvider>
      <MyComponent />
    </I18nProvider>
  );
}
```

#### 🎯 Scenario 5: AI Features

**Recommended Mode:** `ai`

```tsx
import { createAiI18n, useTranslation } from 'hua-i18n-sdk/ai';

const I18nProvider = createAiI18n({
  enableAutoTranslation: true,
  enableMissingKeyGeneration: true,
  aiProvider: 'openai',
  apiKey: process.env.OPENAI_API_KEY
});

function App() {
  return (
    <I18nProvider>
      <MyComponent />
    </I18nProvider>
  );
}
```

---

### 4. Migration Guide

#### 🔄 From Branched Packages to Unified SDK

**Before (Branched Packages):**
```tsx
// Old way - multiple packages needed
import { I18nProvider } from '@hua-labs/i18n-core';
import { useTranslation } from '@hua-labs/i18n-beginner';
```

**Now (Unified SDK):**
```tsx
// New way - all features in one package
import { I18nProvider, useTranslation } from 'hua-i18n-sdk/beginner';
```

#### 🔄 Mode Transitions

**Easy → Beginner:**
```tsx
// Before
import { withDefaultConfig } from 'hua-i18n-sdk/easy';

// Now
import { createBeginnerI18n } from 'hua-i18n-sdk/beginner';
```

**Simple → Advanced:**
```tsx
// Before
import { createI18nApp } from 'hua-i18n-sdk/simple';

// Now
import { createAdvancedI18n } from 'hua-i18n-sdk/advanced';
```

---

### 5. Legacy System Integration

#### 🔧 Integration with Existing Projects

**Step 1: Install Package**
```bash
npm install hua-i18n-sdk
# or
yarn add hua-i18n-sdk
# or
pnpm add hua-i18n-sdk
```

**Step 2: Choose Appropriate Mode**
```tsx
// Choose mode based on legacy system complexity
import { createBeginnerI18n } from 'hua-i18n-sdk/beginner'; // Simple cases
import { createAdvancedI18n } from 'hua-i18n-sdk/advanced'; // Complex cases
```

**Step 3: Setup Provider**
```tsx
// app/layout.tsx or _app.tsx
import { createBeginnerI18n } from 'hua-i18n-sdk/beginner';

const I18nProvider = createBeginnerI18n({
  defaultLanguage: 'ko',
  fallbackLanguage: 'en',
  namespaces: ['common']
});

export default function App({ children }) {
  return <I18nProvider>{children}</I18nProvider>;
}
```

**Step 4: Use in Components**
```tsx
import { useTranslation } from 'hua-i18n-sdk/beginner';

function MyComponent() {
  const { t } = useTranslation();
  return <div>{t('welcome')}</div>;
}
```

#### 🔧 Gradual Migration

**Step 1: Start with Debug Mode**
```tsx
import { createDebugI18n } from 'hua-i18n-sdk/debug';

const I18nProvider = createDebugI18n({
  enableConsoleLogging: true,
  enableMissingKeyTracking: true
});
```

**Step 2: Switch to Appropriate Mode After Troubleshooting**
```tsx
// Switch to production mode after issues are resolved
import { createBeginnerI18n } from 'hua-i18n-sdk/beginner';

const I18nProvider = createBeginnerI18n({
  defaultLanguage: 'ko',
  fallbackLanguage: 'en'
});
```

---

### 📚 Additional Resources

- [SDK Reference](./SDK_REFERENCE.md) - Complete API documentation
- [Advanced Features](./ADVANCED_FEATURES.md) - Advanced features guide
- [Plugin System](./PLUGIN_SYSTEM.md) - Plugin system guide
- [FAQ](./FAQ.md) - Frequently asked questions 