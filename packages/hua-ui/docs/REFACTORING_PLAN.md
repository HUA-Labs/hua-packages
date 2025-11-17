# HUA UI 컴포넌트 리팩토링 계획

> 작성일: 2025-01-XX  
> 목표: 중복 코드 제거, 더 직관적이고 사용하기 좋은 컴포넌트 시스템 구축

## 📋 목차

1. [현재 상황 분석](#현재-상황-분석)
2. [리팩토링 목표](#리팩토링-목표)
3. [주요 문제점](#주요-문제점)
4. [리팩토링 전략](#리팩토링-전략)
5. [구현 계획](#구현-계획)
6. [마이그레이션 가이드](#마이그레이션-가이드)

## 현재 상황 분석

### 발견된 중복 코드 패턴

1. **색상 클래스 중복**
   - `StatCard`, `QuickActionCard`, `MetricCard`, `SummaryCard` 등에서 동일한 `colorClasses` 객체 반복
   - 각 컴포넌트마다 8개 색상(blue, purple, green, orange, red, indigo, pink, gray) 정의
   - 약 200+ 줄의 중복 코드

2. **Variant 패턴 중복**
   - `variant` prop 처리 로직이 여러 컴포넌트에서 반복
   - `default`, `gradient`, `outline`, `elevated` 등 유사한 variant 정의

3. **Size 패턴 중복**
   - `sm`, `md`, `lg` 등의 size 정의가 여러 컴포넌트에서 반복

4. **타입 정의 분산**
   - 공통 타입이 각 컴포넌트 파일에 분산되어 있음
   - 재사용 가능한 타입이 없음

5. **스타일 유틸리티 중복**
   - 다크 모드 처리 로직 반복
   - 그라데이션 생성 로직 반복

## 리팩토링 목표

### 1. 코드 중복 제거
- 공통 색상 시스템 중앙화
- 공통 variant 시스템 중앙화
- 공통 size 시스템 중앙화

### 2. 더 직관적인 API
- 일관된 prop 네이밍
- 명확한 타입 정의
- 자동완성 지원 강화

### 3. 유지보수성 향상
- 단일 소스 원칙 (Single Source of Truth)
- 테스트 용이성
- 문서화 개선

### 4. 성능 최적화
- 불필요한 재계산 방지
- 번들 크기 최적화

## 주요 문제점

### 문제 1: 색상 시스템 중복

**현재:**
```tsx
// StatCard.tsx
const colorClasses = {
  blue: { default: "...", gradient: "...", ... },
  purple: { default: "...", gradient: "...", ... },
  // ... 8개 색상 × 7개 variant = 56개 정의
};

// QuickActionCard.tsx
const colorClasses = {
  blue: { gradient: "...", outline: "...", ... },
  // ... 동일한 패턴 반복
};
```

**문제점:**
- 색상 추가 시 모든 컴포넌트 수정 필요
- 일관성 유지 어려움
- 코드 중복으로 인한 버그 위험

### 문제 2: 타입 정의 분산

**현재:**
```tsx
// 각 컴포넌트마다 개별 정의
type Color = "blue" | "purple" | ...;
type Variant = "default" | "gradient" | ...;
```

**문제점:**
- 타입 불일치 가능성
- 확장 시 여러 파일 수정 필요

### 문제 3: 스타일 로직 중복

**현재:**
```tsx
// 각 컴포넌트마다
const isGradient = variant === "gradient";
const isTextWhite = isGradient;
// ... 반복
```

## 리팩토링 전략

### Phase 1: 공통 인프라 구축

1. **공통 타입 시스템** (`src/lib/types/`)
   - `Color`, `Variant`, `Size` 등 공통 타입 정의
   - 컴포넌트별 확장 타입 정의

2. **공통 색상 시스템** (`src/lib/styles/colors.ts`)
   - 중앙화된 색상 팔레트
   - 색상 유틸리티 함수
   - 다크 모드 지원

3. **공통 스타일 유틸리티** (`src/lib/styles/variants.ts`)
   - Variant 스타일 생성 함수
   - Size 스타일 생성 함수
   - 재사용 가능한 스타일 조합

### Phase 2: 컴포넌트 리팩토링

1. **Dashboard 컴포넌트 그룹**
   - `StatCard`, `QuickActionCard`, `MetricCard`, `SummaryCard`
   - 공통 베이스 컴포넌트 추출

2. **기본 컴포넌트 그룹**
   - `Button`, `Badge`, `Card`
   - 공통 패턴 적용

3. **Form 컴포넌트 그룹**
   - `Input`, `Select`, `Checkbox`, `Radio`
   - 일관된 스타일 시스템 적용

### Phase 3: 문서화 및 마이그레이션

1. **API 문서 업데이트**
2. **마이그레이션 가이드 작성**
3. **예제 코드 업데이트**

## 구현 계획

### 1단계: 공통 타입 시스템 구축

**파일 구조:**
```
src/lib/
  types/
    common.ts          # 공통 타입 정의
    colors.ts          # 색상 관련 타입
    variants.ts        # Variant 관련 타입
  styles/
    colors.ts          # 색상 시스템 구현
    variants.ts         # Variant 시스템 구현
    utils.ts           # 스타일 유틸리티
```

**주요 작업:**
- [ ] 공통 타입 정의 (`Color`, `Variant`, `Size`)
- [ ] 색상 팔레트 정의
- [ ] Variant 팩토리 함수 생성
- [ ] 다크 모드 지원 유틸리티

### 2단계: Dashboard 컴포넌트 리팩토링

**우선순위:**
1. `StatCard` - 가장 많이 사용, 중복 코드 많음
2. `QuickActionCard` - StatCard와 유사한 패턴
3. `MetricCard` - StatCard 확장
4. `SummaryCard` - 독립적이지만 패턴 유사

**작업 내용:**
- [ ] 공통 색상 시스템 적용
- [ ] 공통 variant 시스템 적용
- [ ] 중복 코드 제거
- [ ] 타입 안정성 개선

### 3단계: 기본 컴포넌트 리팩토링

**우선순위:**
1. `Button` - 가장 기본적인 컴포넌트
2. `Badge` - 간단한 구조
3. `Card` - 기본 레이아웃 컴포넌트

### 4단계: 문서화

- [ ] API 문서 업데이트
- [ ] 사용 예제 작성
- [ ] 마이그레이션 가이드 작성
- [ ] CHANGELOG 작성

## 마이그레이션 가이드

### Breaking Changes

**예상되는 변경사항:**
1. 일부 prop 네이밍 변경 (더 직관적으로)
2. 타입 정의 위치 변경 (import 경로 변경)
3. 내부 구현 변경 (하지만 API는 유지)

### 마이그레이션 전략

1. **점진적 마이그레이션**
   - 기존 API 유지하면서 내부 리팩토링
   - Deprecation 경고 추가
   - 다음 메이저 버전에서 제거

2. **코드 모드 제공**
   - 자동 마이그레이션 스크립트
   - 마이그레이션 가이드 문서

## 성공 지표

- [ ] 코드 중복 80% 이상 감소
- [ ] 타입 안정성 100% 달성
- [ ] 모든 컴포넌트 테스트 커버리지 90% 이상
- [ ] 번들 크기 10% 이상 감소
- [ ] 개발자 경험 개선 (자동완성, 타입 체크)

## 타임라인

- **Week 1**: 공통 인프라 구축
- **Week 2**: Dashboard 컴포넌트 리팩토링
- **Week 3**: 기본 컴포넌트 리팩토링
- **Week 4**: 문서화 및 테스트

## 참고사항

- 기존 API 호환성 최대한 유지
- 점진적 마이그레이션 지원
- 테스트 코드 작성 필수
- 문서화와 함께 진행

