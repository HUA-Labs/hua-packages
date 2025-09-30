# 개발자 도구 - hua-i18n-sdk

> **v1.2.0** - 고급 개발자를 위한 디버깅 및 성능 모니터링 도구

## 📋 목차

- [개요](#개요)
- [조건부 로딩](#조건부-로딩)
- [시각적 디버깅](#시각적-디버깅)
- [성능 모니터링](#성능-모니터링)
- [데이터 검증](#데이터-검증)
- [개발자 도구 패널](#개발자-도구-패널)
- [전역 접근](#전역-접근)
- [고급 사용법](#고급-사용법)

---

## 개요

hua-i18n-sdk의 개발자 도구는 번역 시스템의 디버깅과 성능 최적화를 위한 고급 기능들을 제공합니다.

### 🎯 주요 기능

- **시각적 디버깅**: 누락된 번역 키 하이라이트
- **성능 모니터링**: 캐시 히트율, 로딩 시간 추적
- **데이터 검증**: 번역 데이터의 무결성 검사
- **개발자 도구 패널**: 실시간 모니터링 인터페이스

### ⚡ 성능 최적화

- **조건부 로딩**: 개발 환경에서만 로드
- **프로덕션 제외**: 프로덕션 빌드에서는 자동 제외
- **번들 크기 최적화**: 필요할 때만 로드

---

## 조건부 로딩

### 기본 사용법

```tsx
import { createDebugTools, enableDebugTools } from 'hua-i18n-sdk';

// 🛠️ 디버깅 도구 활성화 (개발 환경에서만)
if (process.env.NODE_ENV === 'development') {
  enableDebugTools();
}

// 🔧 수동으로 디버깅 도구 생성
const debugTools = createDebugTools();
if (debugTools) {
  // 디버깅 도구 사용 가능
  console.log('Debug tools loaded');
} else {
  // 프로덕션 환경에서는 null 반환
  console.log('Debug tools not available in production');
}
```

### 환경별 동작

| 환경 | `createDebugTools()` | `enableDebugTools()` | 특징 |
|------|---------------------|---------------------|------|
| **개발** | ✅ DebugTools 객체 | ✅ 활성화 | 모든 기능 사용 가능 |
| **프로덕션** | ❌ null | ⚠️ 경고 메시지 | 자동 비활성화 |

### 번들 크기 영향

```tsx
// 개발 환경 번들
import { createDebugTools } from 'hua-i18n-sdk';
// + ~5KB (디버깅 도구 포함)

// 프로덕션 환경 번들  
import { createDebugTools } from 'hua-i18n-sdk';
// + 0KB (디버깅 도구 제외)
```

---

## 시각적 디버깅

### 누락된 번역 키 하이라이트

```tsx
import { createDebugTools } from 'hua-i18n-sdk';

const debugTools = createDebugTools();
if (debugTools) {
  // 페이지에서 누락된 번역 키를 시각적으로 표시
  debugTools.highlightMissingKeys(document.body);
}
```

**결과:**
- 누락된 번역 키가 노란색 배경으로 하이라이트
- 빨간색 테두리로 강조
- 마우스 오버 시 툴팁으로 키 정보 표시

### 번역 키 툴팁 표시

```tsx
const debugTools = createDebugTools();
if (debugTools) {
  // 모든 번역 키에 툴팁 표시
  debugTools.showTranslationKeys(document.body);
}
```

**결과:**
- 번역된 요소에 마우스 오버 시 키 정보 툴팁
- 실시간으로 키 정보 확인 가능
- 디버깅 중 번역 키 추적 용이

### HTML 구조 요구사항

```tsx
// 번역된 요소에 data-i18n-key 속성 추가
<div data-i18n-key="common.welcome">
  환영합니다
</div>

// 누락된 번역의 경우
<div data-i18n-key="common.missing">
  common.missing  // 키와 텍스트가 동일하면 하이라이트
</div>
```

---

## 성능 모니터링

### 기본 메트릭

```tsx
const debugTools = createDebugTools();
if (debugTools) {
  const metrics = debugTools.performanceMetrics;
  
  console.log('Translation count:', metrics.translationCount);
  console.log('Cache hits:', metrics.cacheHits);
  console.log('Cache misses:', metrics.cacheMisses);
  console.log('Hit rate:', (metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100 + '%');
  console.log('Load times:', metrics.loadTimes);
}
```

### 메트릭 추적

```tsx
// 번역 함수에서 메트릭 업데이트
const startTime = performance.now();
const result = t('common.welcome');
const endTime = performance.now();

const debugTools = createDebugTools();
if (debugTools) {
  debugTools.performanceMetrics.translationCount++;
  debugTools.performanceMetrics.loadTimes.push(endTime - startTime);
}
```

### 성능 분석

```tsx
const debugTools = createDebugTools();
if (debugTools) {
  const metrics = debugTools.performanceMetrics;
  
  // 평균 로딩 시간 계산
  const avgLoadTime = metrics.loadTimes.reduce((a, b) => a + b, 0) / metrics.loadTimes.length;
  
  // 성능 리포트 생성
  const report = {
    totalTranslations: metrics.translationCount,
    cacheHitRate: (metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100,
    averageLoadTime: avgLoadTime,
    slowestLoadTime: Math.max(...metrics.loadTimes)
  };
  
  console.log('Performance Report:', report);
}
```

---

## 데이터 검증

### 번역 데이터 검증

```tsx
const debugTools = createDebugTools();
if (debugTools) {
  const translations = {
    ko: {
      common: {
        welcome: "환영합니다",
        greeting: null,  // 누락된 값
        "": "빈 키",     // 잘못된 키
        welcome: "중복 키"  // 중복 키
      }
    }
  };
  
  const validation = debugTools.validateTranslations(translations);
  
  console.log('Missing keys:', validation.missingKeys);
  // ['ko.common.greeting']
  
  console.log('Invalid keys:', validation.invalidKeys);
  // ['ko.common.']
  
  console.log('Duplicate keys:', validation.duplicateKeys);
  // ['ko.common.welcome']
}
```

### 검증 규칙

| 검증 항목 | 설명 | 예시 |
|-----------|------|------|
| **Missing Keys** | null, undefined 값 | `greeting: null` |
| **Invalid Keys** | 빈 문자열, 잘못된 형식 | `"": "value"` |
| **Duplicate Keys** | 중복된 키 | `welcome: "value1"`, `welcome: "value2"` |

### 자동 검증 설정

```tsx
// 개발 환경에서 자동 검증
if (process.env.NODE_ENV === 'development') {
  const debugTools = createDebugTools();
  if (debugTools) {
    // 번역 데이터 로드 시 자동 검증
    const validation = debugTools.validateTranslations(translations);
    
    if (validation.missingKeys.length > 0) {
      console.warn('Missing translation keys:', validation.missingKeys);
    }
    
    if (validation.duplicateKeys.length > 0) {
      console.error('Duplicate translation keys:', validation.duplicateKeys);
    }
  }
}
```

---

## 개발자 도구 패널

### 패널 열기

```tsx
const debugTools = createDebugTools();
if (debugTools) {
  // 개발자 도구 패널 열기
  debugTools.devTools.open();
}
```

### 패널 기능

| 기능 | 설명 | 위치 |
|------|------|------|
| **성능 메트릭** | 실시간 성능 정보 | 상단 |
| **언어 정보** | 현재 언어 설정 | 중간 |
| **액션 버튼** | 빠른 디버깅 액션 | 하단 |

### 패널 스타일링

```css
/* 개발자 도구 패널 커스터마이징 */
#hua-i18n-devtools {
  /* 기본 스타일 */
  position: fixed;
  top: 20px;
  right: 20px;
  width: 300px;
  background: #1e1e1e;
  color: #fff;
  border-radius: 8px;
  z-index: 10000;
}

/* 다크 테마 호환 */
@media (prefers-color-scheme: dark) {
  #hua-i18n-devtools {
    background: #2d2d2d;
  }
}
```

---

## 전역 접근

### 브라우저 콘솔에서 접근

```tsx
// 전역 객체로 접근
window.__HUA_I18N_DEBUG__

// 사용 예시
window.__HUA_I18N_DEBUG__.devTools.open();
window.__HUA_I18N_DEBUG__.highlightMissingKeys(document.body);
window.__HUA_I18N_DEBUG__.showTranslationKeys(document.body);
```

### 전역 함수 활성화

```tsx
import { enableDebugTools } from 'hua-i18n-sdk';

// 전역 디버깅 도구 활성화
enableDebugTools();

// 브라우저 콘솔에서 사용 가능
// window.__HUA_I18N_DEBUG__ 접근 가능
```

### 전역 함수 비활성화

```tsx
import { disableDebugTools } from 'hua-i18n-sdk';

// 전역 디버깅 도구 비활성화
disableDebugTools();

// window.__HUA_I18N_DEBUG__ 제거됨
```

---

## 고급 사용법

### 커스텀 디버깅 도구

```tsx
import { createDebugTools, DebugTools } from 'hua-i18n-sdk';

// 기존 도구 확장
const baseTools = createDebugTools();
if (baseTools) {
  const customTools: DebugTools = {
    ...baseTools,
    
    // 커스텀 기능 추가
    customValidation: (translations: Record<string, any>) => {
      // 사용자 정의 검증 로직
      return {
        customIssues: [],
        suggestions: []
      };
    },
    
    // 커스텀 시각화
    customHighlight: (container: HTMLElement) => {
      // 사용자 정의 하이라이트 로직
    }
  };
  
  // 커스텀 도구 사용
  customTools.customValidation(translations);
}
```

### 성능 프로파일링

```tsx
const debugTools = createDebugTools();
if (debugTools) {
  // 성능 프로파일링 시작
  const profile = {
    startTime: performance.now(),
    translations: [],
    cacheOperations: []
  };
  
  // 번역 작업 추적
  const originalT = t;
  t = (key: string) => {
    const start = performance.now();
    const result = originalT(key);
    const end = performance.now();
    
    profile.translations.push({
      key,
      duration: end - start,
      timestamp: Date.now()
    });
    
    return result;
  };
  
  // 프로파일링 결과 분석
  setTimeout(() => {
    const totalTime = performance.now() - profile.startTime;
    const avgTime = profile.translations.reduce((sum, t) => sum + t.duration, 0) / profile.translations.length;
    
    console.log('Translation Profile:', {
      totalTranslations: profile.translations.length,
      totalTime,
      averageTime: avgTime,
      slowestTranslation: Math.max(...profile.translations.map(t => t.duration))
    });
  }, 5000);
}
```

### 자동화된 테스트

```tsx
const debugTools = createDebugTools();
if (debugTools) {
  // 자동화된 번역 테스트
  const testTranslations = async () => {
    const testKeys = ['common.welcome', 'common.greeting', 'auth.login'];
    const results = [];
    
    for (const key of testKeys) {
      const start = performance.now();
      const result = t(key);
      const duration = performance.now() - start;
      
      results.push({
        key,
        result,
        duration,
        isFallback: result === key
      });
    }
    
    // 테스트 결과 분석
    const fallbacks = results.filter(r => r.isFallback);
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    
    console.log('Translation Test Results:', {
      totalTests: results.length,
      fallbacks: fallbacks.length,
      averageDuration: avgDuration,
      details: results
    });
  };
  
  // 페이지 로드 후 테스트 실행
  window.addEventListener('load', testTranslations);
}
```

---

## 문제 해결

### 자주 발생하는 문제

#### Q: 디버깅 도구가 로드되지 않아요
A: 개발 환경인지 확인하세요. 프로덕션에서는 자동으로 비활성화됩니다.

#### Q: 성능 메트릭이 업데이트되지 않아요
A: 번역 함수에서 메트릭을 수동으로 업데이트해야 합니다.

#### Q: 개발자 도구 패널이 열리지 않아요
A: CSS z-index 충돌을 확인하세요. 패널의 z-index는 10000입니다.

#### Q: 번역 키 하이라이트가 작동하지 않아요
A: HTML 요소에 `data-i18n-key` 속성이 있는지 확인하세요.

---

## 추가 리소스

- [SDK 레퍼런스](./SDK_REFERENCE.md)
- [환경별 가이드](./ENVIRONMENT_GUIDES.md)
- [개선 계획](./IMPROVEMENT_PLAN.md)
- [GitHub 저장소](https://github.com/HUA-Labs/i18n-sdk) 