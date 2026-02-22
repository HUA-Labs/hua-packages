# 배열 타입 번역 키 접근 가이드

## 문제 상황

번역 파일에 배열 타입의 데이터가 있을 때 (예: `month_names`, `day_names`), `t()` 함수는 문자열만 반환하므로 배열에 직접 접근할 수 없습니다.

**번역 파일 예시**:
```json
{
  "month_names": ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
  "day_names": ["월", "화", "수", "목", "금", "토", "일"]
}
```

## 현재 해결 방법

### 방법 1: `useI18n`의 `debug.getAllTranslations()` 사용 (현재 사용 중)

```typescript
import { useI18n } from '@hua-labs/i18n-core';
import { useAppStore } from '@/app/store/useAppStore';

function CalendarComponent() {
  const { debug } = useI18n();
  const { language } = useAppStore();
  
  // 모든 번역 데이터 가져오기
  const allTranslations = debug.getAllTranslations();
  const commonTranslations = (allTranslations[language]?.common || allTranslations['ko']?.common || {}) as Record<string, unknown>;
  
  // 배열 데이터 접근
  const monthNames = (Array.isArray(commonTranslations.month_names) 
    ? commonTranslations.month_names 
    : []) as string[];
  const dayNames = (Array.isArray(commonTranslations.day_names) 
    ? commonTranslations.day_names 
    : []) as string[];
  
  return (
    <div>
      {monthNames.map((month, index) => (
        <span key={index}>{month}</span>
      ))}
    </div>
  );
}
```

**장점**:
- 현재 패키지에서 바로 사용 가능
- 모든 번역 데이터에 접근 가능

**단점**:
- `debug` API는 디버그 목적으로 설계됨
- 타입 안전성이 부족함 (`Record<string, unknown>`)
- 언어 변경 시 수동으로 처리 필요
- `useAppStore` 같은 외부 상태 관리에 의존

### 방법 2: 직접 import (권장하지 않음)

```typescript
import * as commonKo from '@/app/lib/translations/ko/common.json';
import * as commonEn from '@/app/lib/translations/en/common.json';

function CalendarComponent() {
  const { language } = useAppStore();
  const commonTranslations = language === 'en' ? commonEn : commonKo;
  const monthNames = commonTranslations.month_names;
}
```

**단점**:
- 번역 파일을 직접 import해야 함
- 언어 변경 시 동적으로 처리하기 어려움
- 번역 파일 구조 변경 시 컴포넌트 수정 필요

## 권장 개선 사항

### 1. 패키지에 `getNamespace()` API 추가

```typescript
// 제안하는 API
const { getNamespace } = useI18n();

// 사용 예시
const commonTranslations = getNamespace('common');
const monthNames = commonTranslations.month_names as string[];
```

**구현 예시**:
```typescript
// packages/hua-i18n-core/src/hooks/useI18n.tsx
function useI18n(): I18nContextType {
  // ...
  return {
    t,
    tAsync,
    tSync,
    currentLanguage,
    setLanguage,
    debug: {
      // ...
      getNamespace: (namespace: string) => {
        const lang = currentLanguage;
        const allTranslations = translator?.debug()?.allTranslations || {};
        return (allTranslations[lang]?.[namespace] || {}) as Record<string, unknown>;
      },
    },
  };
}
```

### 2. 타입 안전성 개선

```typescript
// 번역 파일 타입 정의
interface CommonTranslations {
  month_names: string[];
  day_names: string[];
  // ... 기타 키들
}

// 타입 안전한 접근
const commonTranslations = getNamespace('common') as CommonTranslations;
const monthNames = commonTranslations.month_names; // 타입 안전!
```

### 3. 문서화 개선

- `api-reference.md`에 배열 타입 번역 키 접근 방법 추가
- `quick-start.md`에 실제 사용 사례 추가
- 타입 정의 가이드 추가

## 임시 해결책 (현재 사용 중)

현재는 `debug.getAllTranslations()`를 사용하되, 다음을 권장합니다:

1. **타입 가드 사용**:
```typescript
const monthNames = Array.isArray(commonTranslations.month_names) 
  ? commonTranslations.month_names 
  : [];
```

2. **Fallback 처리**:
```typescript
const commonTranslations = allTranslations[language]?.common 
  || allTranslations['ko']?.common 
  || {};
```

3. **타입 단언**:
```typescript
const commonTranslations = (allTranslations[language]?.common || {}) as Record<string, unknown>;
```

## 향후 개선 계획

- [ ] `getNamespace()` API 추가
- [ ] 타입 안전성 개선
- [ ] 문서화 보완
- [ ] 배열 타입 번역 키 접근 가이드 추가

