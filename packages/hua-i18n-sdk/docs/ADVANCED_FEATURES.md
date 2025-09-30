# 고급 기능 - hua-i18n-sdk

> **v1.2.0** - 성능 모니터링, 자동 최적화, 실시간 대시보드

## 📋 목차

- [개요](#개요)
- [성능 모니터링](#성능-모니터링)
- [자동 최적화](#자동-최적화)
- [실시간 대시보드](#실시간-대시보드)
- [통합 사용법](#통합-사용법)
- [고급 설정](#고급-설정)
- [예제](#예제)

---

## 개요

hua-i18n-sdk의 고급 기능은 프로덕션 환경에서 최적의 성능을 보장하기 위한 강력한 도구들을 제공합니다.

### **주요 기능**

- ✅ **실시간 성능 모니터링** - 번역 성능, 캐시 효율성, 메모리 사용량 추적
- ✅ **자동 최적화** - 지능형 성능 최적화 규칙 적용
- ✅ **실시간 대시보드** - React 컴포넌트로 구현된 모니터링 UI
- ✅ **성능 알림** - 임계값 기반 자동 알림 시스템
- ✅ **최적화 제안** - AI 기반 성능 개선 제안

---

## 성능 모니터링

### **기본 사용법**

```tsx
import { PerformanceMonitor } from 'hua-i18n-sdk';

// 모니터 인스턴스 생성
const monitor = new PerformanceMonitor();

// 모니터링 시작 (5초마다 메트릭 수집)
monitor.startMonitoring(5000);

// 메트릭 구독
const unsubscribe = monitor.subscribe((metrics) => {
  console.log('Performance metrics:', metrics);
});

// 모니터링 중지
monitor.stopMonitoring();
```

### **수집되는 메트릭**

```tsx
interface PerformanceMetrics {
  // 번역 성능
  translationTime: {
    average: number;    // 평균 번역 시간
    min: number;        // 최소 번역 시간
    max: number;        // 최대 번역 시간
    p95: number;        // 95퍼센타일
    p99: number;        // 99퍼센타일
  };
  
  // 캐시 성능
  cachePerformance: {
    hitRate: number;    // 캐시 히트율
    missRate: number;   // 캐시 미스율
    evictionRate: number; // 캐시 제거율
    size: number;       // 현재 캐시 크기
    maxSize: number;    // 최대 캐시 크기
  };
  
  // 메모리 사용량
  memoryUsage: {
    current: number;    // 현재 메모리 사용량
    peak: number;       // 피크 메모리 사용량
    average: number;    // 평균 메모리 사용량
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  
  // 번역 키 사용량
  keyUsage: {
    totalKeys: number;    // 전체 키 수
    usedKeys: number;     // 사용된 키 수
    unusedKeys: number;   // 사용되지 않은 키 수
    duplicateKeys: number; // 중복 키 수
    missingKeys: number;   // 누락된 키 수
  };
}
```

### **성능 알림**

```tsx
// 알림 조회
const alerts = monitor.getAlerts();

// 특정 알림 해결
monitor.resolveAlert('alert-id');

// 모든 알림 해결
monitor.resolveAllAlerts();

// 알림 예시
{
  id: 'alert-123',
  type: 'warning',
  severity: 'high',
  message: 'Cache hit rate is below optimal level',
  metric: 'cachePerformance.hitRate',
  value: 0.65,
  threshold: 0.7,
  timestamp: 1640995200000,
  resolved: false
}
```

### **최적화 제안**

```tsx
// 제안 조회
const suggestions = monitor.getSuggestions();

// 제안 예시
{
  id: 'cache-optimization',
  type: 'cache',
  title: 'Increase Cache Size',
  description: 'Cache hit rate is low. Consider increasing cache size.',
  impact: 'high',
  effort: 'low',
  estimatedImprovement: 20,
  implementation: 'Increase maxSize in cache plugin configuration',
  priority: 1
}
```

---

## 자동 최적화

### **기본 사용법**

```tsx
import { AutoOptimizer } from 'hua-i18n-sdk';

// 최적화기 생성 (모니터와 연결)
const optimizer = new AutoOptimizer(monitor, {
  enabled: true,
  autoApply: false,           // 자동 적용 여부
  maxConcurrentOptimizations: 3, // 동시 최적화 수
  optimizationInterval: 30000     // 최적화 간격 (30초)
});

// 자동 최적화 시작
optimizer.start();

// 자동 최적화 중지
optimizer.stop();
```

### **기본 최적화 규칙**

#### **1. 캐시 크기 자동 조정**
```tsx
{
  id: 'auto-cache-size',
  name: 'Auto Cache Size Adjustment',
  condition: (metrics) => {
    return metrics.cachePerformance.hitRate < 0.7 && 
           metrics.cachePerformance.size >= metrics.cachePerformance.maxSize * 0.8;
  },
  action: async () => {
    // 캐시 크기 자동 조정 로직
  }
}
```

#### **2. 메모리 정리**
```tsx
{
  id: 'memory-cleanup',
  name: 'Memory Cleanup',
  condition: (metrics) => {
    return metrics.memoryUsage.trend === 'increasing' && 
           metrics.memoryUsage.current > 30 * 1024 * 1024; // 30MB
  },
  action: async () => {
    // 메모리 정리 로직
  }
}
```

#### **3. 번역 키 최적화**
```tsx
{
  id: 'key-optimization',
  name: 'Translation Key Optimization',
  condition: (metrics) => {
    return metrics.keyUsage.unusedKeys > metrics.keyUsage.usedKeys * 0.2;
  },
  action: async () => {
    // 사용하지 않는 키 제거
  }
}
```

### **커스텀 최적화 규칙**

```tsx
import { OptimizationRule } from 'hua-i18n-sdk';

const customRule: OptimizationRule = {
  id: 'custom-optimization',
  name: 'Custom Optimization',
  description: 'Custom optimization rule',
  priority: 1,
  cooldown: 60000, // 1분 쿨다운
  condition: (metrics) => {
    // 커스텀 조건
    return metrics.translationTime.average > 100;
  },
  action: async () => {
    // 커스텀 최적화 로직
    console.log('Executing custom optimization');
  }
};

// 규칙 추가
optimizer.addRule(customRule);

// 규칙 제거
optimizer.removeRule('custom-optimization');
```

### **수동 최적화 실행**

```tsx
// 특정 규칙 수동 실행
const result = await optimizer.runManualOptimization('auto-cache-size');

// 최적화 결과
console.log(result);
// {
//   id: 'opt-123',
//   ruleId: 'auto-cache-size',
//   success: true,
//   duration: 150,
//   timestamp: 1640995200000
// }
```

### **최적화 통계**

```tsx
const stats = optimizer.getStats();
console.log(stats);
// {
//   totalOptimizations: 15,
//   successfulOptimizations: 14,
//   failedOptimizations: 1,
//   averageDuration: 125,
//   lastOptimization: { ... }
// }
```

---

## 실시간 대시보드

### **기본 사용법**

```tsx
import { I18nDashboard } from 'hua-i18n-sdk';

function App() {
  return (
    <div>
      <h1>My App</h1>
      
      {/* 실시간 대시보드 */}
      <I18nDashboard
        monitor={monitor}
        optimizer={optimizer}
        theme="light"
        showAlerts={true}
        showOptimizations={true}
        refreshInterval={5000}
      />
    </div>
  );
}
```

### **대시보드 기능**

#### **1. 실시간 메트릭**
- 번역 성능 (평균, 최소, 최대, P95, P99)
- 캐시 성능 (히트율, 미스율, 제거율)
- 메모리 사용량 (현재, 피크, 평균, 트렌드)
- 키 사용량 (전체, 사용, 미사용, 누락)

#### **2. 성능 알림**
- 실시간 알림 표시
- 알림 해결 기능
- 심각도별 색상 구분

#### **3. 최적화 결과**
- 최적화 실행 결과
- 성공/실패 상태
- 실행 시간 및 개선 효과

#### **4. 언어별 성능**
- 언어별 로딩 시간
- 사용 빈도
- 에러율

#### **5. 네임스페이스별 성능**
- 네임스페이스별 로딩 시간
- 사용 빈도
- 크기

### **대시보드 커스터마이징**

```tsx
<I18nDashboard
  monitor={monitor}
  optimizer={optimizer}
  className="custom-dashboard"
  theme="dark"
  showAlerts={false}
  showOptimizations={true}
  refreshInterval={10000}
/>
```

---

## 통합 사용법

### **완전한 설정 예제**

```tsx
import React from 'react';
import { 
  createI18nConfig, 
  I18nProvider,
  PerformanceMonitor,
  AutoOptimizer,
  I18nDashboard,
  analyticsPlugin,
  cachePlugin
} from 'hua-i18n-sdk';

// 성능 모니터 생성
const monitor = new PerformanceMonitor();

// 자동 최적화기 생성
const optimizer = new AutoOptimizer(monitor, {
  enabled: true,
  autoApply: false,
  maxConcurrentOptimizations: 3,
  optimizationInterval: 30000
});

// i18n 설정
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
    analyticsPlugin({ trackPerformance: true }),
    cachePlugin({ maxSize: 200, ttl: 600000 })
  ]
});

// 메인 앱 컴포넌트
function App() {
  useEffect(() => {
    // 모니터링 시작
    monitor.startMonitoring(5000);
    
    // 자동 최적화 시작
    optimizer.start();
    
    return () => {
      monitor.stopMonitoring();
      optimizer.stop();
    };
  }, []);

  return (
    <I18nProvider config={config}>
      <div className="app">
        <header>
          <h1>My Internationalized App</h1>
        </header>
        
        <main>
          {/* 앱 콘텐츠 */}
          <MyAppContent />
        </main>
        
        {/* 개발 모드에서만 대시보드 표시 */}
        {process.env.NODE_ENV === 'development' && (
          <aside className="dashboard-sidebar">
            <I18nDashboard
              monitor={monitor}
              optimizer={optimizer}
              theme="light"
              showAlerts={true}
              showOptimizations={true}
            />
          </aside>
        )}
      </div>
    </I18nProvider>
  );
}
```

### **조건부 활성화**

```tsx
// 환경별 설정
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// 개발 환경에서만 고급 기능 활성화
if (isDevelopment) {
  monitor.startMonitoring(5000);
  optimizer.start();
}

// 프로덕션 환경에서는 제한적으로 활성화
if (isProduction) {
  monitor.startMonitoring(30000); // 30초마다
  optimizer.updateConfig({
    enabled: true,
    autoApply: false,
    maxConcurrentOptimizations: 1
  });
}
```

---

## 고급 설정

### **성능 모니터 설정**

```tsx
// 커스텀 알림 임계값
const customAlerts = [
  {
    metric: 'translationTime.average',
    threshold: 50,
    severity: 'medium'
  },
  {
    metric: 'cachePerformance.hitRate',
    threshold: 0.8,
    severity: 'high'
  },
  {
    metric: 'memoryUsage.current',
    threshold: 50 * 1024 * 1024, // 50MB
    severity: 'critical'
  }
];

// 모니터 설정
monitor.updateAlertThresholds(customAlerts);
```

### **자동 최적화 설정**

```tsx
// 최적화 규칙 커스터마이징
optimizer.updateConfig({
  enabled: true,
  autoApply: false,
  maxConcurrentOptimizations: 5,
  optimizationInterval: 60000, // 1분
  rules: [
    // 커스텀 규칙들
  ]
});

// 특정 규칙 비활성화
optimizer.removeRule('memory-cleanup');

// 새로운 규칙 추가
optimizer.addRule({
  id: 'custom-rule',
  name: 'Custom Rule',
  priority: 1,
  cooldown: 120000,
  condition: (metrics) => {
    // 커스텀 조건
    return true;
  },
  action: async () => {
    // 커스텀 액션
  }
});
```

### **대시보드 설정**

```tsx
// 대시보드 테마 및 레이아웃
<I18nDashboard
  monitor={monitor}
  optimizer={optimizer}
  className="custom-dashboard"
  theme="dark"
  showAlerts={true}
  showOptimizations={true}
  refreshInterval={5000}
  layout="compact" // compact, detailed, minimal
  position="bottom-right" // top-left, top-right, bottom-left, bottom-right
  collapsible={true}
  defaultCollapsed={false}
/>
```

---

## 예제

### **Next.js App Router 예제**

```tsx
// app/layout.tsx
import { createI18nConfig, I18nProvider } from 'hua-i18n-sdk';
import { PerformanceMonitor, AutoOptimizer } from 'hua-i18n-sdk';
import { I18nDashboard } from 'hua-i18n-sdk';

// 전역 인스턴스 생성
const monitor = new PerformanceMonitor();
const optimizer = new AutoOptimizer(monitor);

const config = createI18nConfig({
  // ... 설정
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <I18nProvider config={config}>
          {children}
          
          {/* 개발 모드에서만 대시보드 표시 */}
          {process.env.NODE_ENV === 'development' && (
            <I18nDashboard
              monitor={monitor}
              optimizer={optimizer}
              theme="light"
              className="fixed bottom-4 right-4 w-96 h-96 z-50"
            />
          )}
        </I18nProvider>
      </body>
    </html>
  );
}
```

### **Create React App 예제**

```tsx
// src/App.tsx
import React, { useEffect } from 'react';
import { createI18nConfig, I18nProvider } from 'hua-i18n-sdk';
import { PerformanceMonitor, AutoOptimizer } from 'hua-i18n-sdk';
import { I18nDashboard } from 'hua-i18n-sdk';

const monitor = new PerformanceMonitor();
const optimizer = new AutoOptimizer(monitor);

const config = createI18nConfig({
  // ... 설정
});

function App() {
  useEffect(() => {
    // 모니터링 및 최적화 시작
    monitor.startMonitoring(5000);
    optimizer.start();
    
    return () => {
      monitor.stopMonitoring();
      optimizer.stop();
    };
  }, []);

  return (
    <I18nProvider config={config}>
      <div className="App">
        <header className="App-header">
          <h1>My App</h1>
        </header>
        
        <main>
          {/* 앱 콘텐츠 */}
        </main>
        
        {/* 대시보드 */}
        <I18nDashboard
          monitor={monitor}
          optimizer={optimizer}
          theme="light"
          className="dashboard-overlay"
        />
      </div>
    </I18nProvider>
  );
}
```

### **Vite 예제**

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createI18nConfig, I18nProvider } from 'hua-i18n-sdk';
import { PerformanceMonitor, AutoOptimizer } from 'hua-i18n-sdk';
import { I18nDashboard } from 'hua-i18n-sdk';
import App from './App.tsx';

const monitor = new PerformanceMonitor();
const optimizer = new AutoOptimizer(monitor);

const config = createI18nConfig({
  // ... 설정
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider config={config}>
      <App />
      
      {/* 개발 모드에서만 대시보드 */}
      {import.meta.env.DEV && (
        <I18nDashboard
          monitor={monitor}
          optimizer={optimizer}
          theme="dark"
          className="dev-dashboard"
        />
      )}
    </I18nProvider>
  </React.StrictMode>,
);
```

---

## 성능 최적화 팁

### **1. 모니터링 최적화**

```tsx
// 프로덕션에서는 더 긴 간격으로 모니터링
const monitoringInterval = process.env.NODE_ENV === 'production' ? 30000 : 5000;
monitor.startMonitoring(monitoringInterval);
```

### **2. 최적화 규칙 조정**

```tsx
// 프로덕션에서는 보수적인 최적화
if (process.env.NODE_ENV === 'production') {
  optimizer.updateConfig({
    autoApply: false,
    maxConcurrentOptimizations: 1,
    optimizationInterval: 120000 // 2분
  });
}
```

### **3. 대시보드 최적화**

```tsx
// 프로덕션에서는 대시보드 비활성화
{process.env.NODE_ENV === 'development' && (
  <I18nDashboard
    monitor={monitor}
    optimizer={optimizer}
    refreshInterval={10000} // 10초마다 업데이트
  />
)}
```

---

## 추가 리소스

### **공식 문서**
- [SDK 레퍼런스](./SDK_REFERENCE.md)
- [플러그인 시스템](./PLUGIN_SYSTEM.md)
- [FAQ](./FAQ.md)

### **예제 프로젝트**
- [고급 기능 예제](../examples/advanced-features/)
- [성능 모니터링 예제](../examples/performance-monitoring/)
- [자동 최적화 예제](../examples/auto-optimization/)

### **커뮤니티**
- [GitHub Issues](https://github.com/HUA-Labs/i18n-sdk/issues)
- [GitHub Discussions](https://github.com/HUA-Labs/i18n-sdk/discussions)

---

**고급 기능으로 hua-i18n-sdk의 성능을 극대화하세요!** 🚀 