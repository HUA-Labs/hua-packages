# @hua-labs/i18n-core 문서 인덱스

## 📚 전체 문서 목록

### 시작하기

1. **[빠른 시작 가이드](./I18N_CORE_QUICK_START.md)**
   - 5분 안에 시작하기
   - 기본 설정 및 사용법
   - 간단한 예제

### 핵심 문서

2. **[API 레퍼런스](./I18N_CORE_API_REFERENCE.md)**
   - 모든 API 문서
   - 함수 및 훅 상세 설명
   - 타입 정의
   - 성능 최적화 기능

3. **[로더 가이드](./I18N_CORE_LOADERS.md)**
   - 기본 로더 사용법
   - 커스텀 로더 구현
   - `@hua-labs/i18n-loaders` 패키지
   - 실제 사용 사례 / 테스트 앱 경로

4. **[성능 최적화 가이드](./I18N_CORE_PERFORMANCE_GUIDE.md)**
   - 캐싱 전략
   - 프리로딩 전략
   - 메모리 관리
   - 베스트 프랙티스

### 실제 사용 사례

5. **[PaysByPays 적용 가이드](./I18N_CORE_PAYSBYPAYS_DOCUMENTATION.md)**
   - 실제 프로덕션 적용 사례
   - 9개 네임스페이스, 3개 언어 지원
   - 실제 코드 예제
   - 베스트 프랙티스

### 개발 관련

6. **[개발 플랜](./I18N_CORE_DEVELOPMENT_PLAN.md)**
   - 개발 로드맵
   - 우선순위 및 일정
   - 작업 항목

7. **[분석 및 개발 계획](./I18N_CORE_ANALYSIS_AND_DEVELOPMENT.md)**
   - 현재 상태 분석
   - 개선 방향
   - 개발 계획

---

## 🎯 문서 선택 가이드

### 처음 사용하는 경우
1. [빠른 시작 가이드](./I18N_CORE_QUICK_START.md) → 기본 설정 및 사용법
2. [API 레퍼런스](./I18N_CORE_API_REFERENCE.md) → 상세 API 문서

### 프로덕션 환경 구축
1. [로더 가이드](./I18N_CORE_LOADERS.md) → 커스텀 로더 구현
2. [성능 최적화 가이드](./I18N_CORE_PERFORMANCE_GUIDE.md) → 캐싱 및 프리로딩
3. [PaysByPays 적용 가이드](./I18N_CORE_PAYSBYPAYS_DOCUMENTATION.md) → 실제 사례 참고

### 고급 사용법
1. [API 레퍼런스](./I18N_CORE_API_REFERENCE.md) → 모든 기능 상세 설명
2. [성능 최적화 가이드](./I18N_CORE_PERFORMANCE_GUIDE.md) → 성능 튜닝

### 개발자/기여자
1. [개발 플랜](./I18N_CORE_DEVELOPMENT_PLAN.md) → 개발 로드맵
2. [분석 및 개발 계획](./I18N_CORE_ANALYSIS_AND_DEVELOPMENT.md) → 현재 상태 및 개선 방향

---

## 📖 빠른 참조

### 가장 자주 사용하는 기능

#### 기본 사용
```typescript
import { useTranslation } from '@hua-labs/i18n-core';

const { t } = useTranslation();
t('common:welcome');
```

#### 파라미터 보간
```typescript
const { tWithParams } = useTranslation();
tWithParams('common:time.minutesAgo', { minutes: 5 });
```

#### 언어 변경
```typescript
const { setLanguage } = useTranslation();
setLanguage('en');
```

#### 프리로딩 / 워밍
```typescript
import {
  createApiTranslationLoader,
  preloadNamespaces,
  warmFallbackLanguages
} from '@hua-labs/i18n-loaders';

const loadTranslations = createApiTranslationLoader();
await preloadNamespaces('ko', ['common', 'auth'], loadTranslations);
await warmFallbackLanguages('ko', ['ko', 'en'], ['common'], loadTranslations);
```

#### 캐시 확인
```typescript
import { i18nResourceManager } from '@hua-labs/i18n-core/core/i18n-resource';
const stats = i18nResourceManager.getCacheStats();
```

---

## 🔍 문제 해결

### 번역이 로드되지 않는 경우
- [빠른 시작 가이드 - 문제 해결](./I18N_CORE_QUICK_START.md#문제-해결)
- [로더 가이드 - 트러블슈팅](./I18N_CORE_LOADERS.md#트러블슈팅)

### 성능 문제
- [성능 최적화 가이드 - 트러블슈팅](./I18N_CORE_PERFORMANCE_GUIDE.md#트러블슈팅)

### 고급 사용법
- [API 레퍼런스](./I18N_CORE_API_REFERENCE.md)
- [PaysByPays 적용 가이드](./I18N_CORE_PAYSBYPAYS_DOCUMENTATION.md)

---

**작성일**: 2025년 11월
**버전**: 1.0.0

