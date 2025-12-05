# 숨다이어리 패키지 사용 현황 및 승격 가능 컴포넌트 분석

> **작성일**: 2025-12-05  
> **목적**: 숨다이어리 앱의 패키지 사용 현황 확인 및 UI 패키지로 승격 가능한 컴포넌트 식별

---

## ✅ 패키지 사용 현황 (잘 사용 중)

### 현재 사용 중인 패키지 컴포넌트

#### 기본 UI 컴포넌트
- ✅ `Button` - 전역 사용
- ✅ `Icon` - 전역 사용
- ✅ `Input` - 폼 입력
- ✅ `Textarea` - 텍스트 영역
- ✅ `Label` - 폼 레이블
- ✅ `Select`, `SelectOption` - 드롭다운 선택
- ✅ `Card`, `CardHeader`, `CardTitle`, `CardContent` - 카드 레이아웃
- ✅ `Badge` - 뱃지 표시
- ✅ `Progress` - 진행률 표시
- ✅ `Modal` - 모달 다이얼로그
- ✅ `Avatar` - 아바타 이미지
- ✅ `ConfirmModal` - 확인 모달

#### 레이아웃 컴포넌트
- ✅ `Container` - 컨테이너 레이아웃
- ✅ `Grid` - 그리드 레이아웃
- ✅ `Pagination`, `PaginationWithInfo` - 페이지네이션

#### 피드백 컴포넌트
- ✅ `LoadingSpinner` - 로딩 스피너
- ✅ `Skeleton`, `SkeletonCard` - 스켈레톤 로딩
- ✅ `AlertError` - 에러 알림
- ✅ `useToast`, `ToastProvider` - 토스트 알림

#### 대시보드 컴포넌트
- ✅ `DashboardEmptyState` - 빈 상태 표시
- ✅ `MetricCard` - 메트릭 카드
- ✅ `StatCard` - 통계 카드
- ✅ `InfoCard` - 정보 카드

#### 기타 컴포넌트
- ✅ `Popover` - 팝오버
- ✅ `ScrollToTop` - 스크롤 상단 이동
- ✅ `IconProvider` - 아이콘 프로바이더

### 사용 현황 평가

**✅ 매우 잘 사용 중**
- 모든 기본 UI 컴포넌트를 패키지에서 가져와 사용
- 레이아웃, 피드백, 대시보드 컴포넌트도 적절히 활용
- 커스텀 래퍼 컴포넌트(EmptyState, LoadingState, ErrorMessage)도 패키지 컴포넌트를 기반으로 구현

---

## 🔄 UI 패키지로 승격 가능한 컴포넌트

### 1. ActionToolbar ⭐⭐⭐ (높은 우선순위)

**위치**: `apps/my-app/app/components/common/ActionToolbar.tsx`

**승격 이유**:
- 범용 액션 툴바 컴포넌트로 여러 프로젝트에서 재사용 가능
- 선택 모드, 일괄 액션, 반응형 레이아웃 등 완성도 높은 기능
- 이미 패키지 컴포넌트(Button, Icon)만 사용하여 의존성 깔끔

**현재 기능**:
- 선택 모드 토글
- 전체 선택/해제
- 일반 모드/선택 모드 액션 버튼 분리
- 뱃지 표시
- 반응형 레이아웃 (모바일/데스크톱)
- 로딩 상태 지원

**제안 위치**: `packages/hua-ui/src/components/ActionToolbar.tsx`

**사용 예시**:
```tsx
// 알림 페이지, 로그 관리, 대시보드 등에서 재사용 가능
<ActionToolbar
  isSelectMode={isSelectMode}
  totalCount={items.length}
  selectedCount={selectedIds.size}
  actions={[...]}
  selectModeActions={[...]}
/>
```

---

### 2. SearchHighlight / SearchPreview ⭐⭐ (중간 우선순위)

**위치**: `apps/my-app/app/components/search/search-highlight.tsx`

**승격 이유**:
- 검색 결과 하이라이트는 여러 프로젝트에서 공통으로 필요한 기능
- 텍스트 검색, 검색 결과 표시 등 범용적 사용 가능

**현재 기능**:
- `SearchHighlight`: 텍스트에서 검색어 하이라이트
- `SearchPreview`: 컨텍스트와 함께 검색 결과 미리보기
- `SearchResults`: 검색 결과 카드 형태로 표시

**제안 위치**: `packages/hua-ui/src/components/SearchHighlight.tsx`

**의존성**:
- `@/app/lib/search-utils` 의존성이 있음 → 유틸리티 함수도 함께 승격 필요

**사용 예시**:
```tsx
// 검색 페이지, 목록 필터링 등에서 재사용 가능
<SearchHighlight
  text={diary.content}
  query={searchQuery}
  highlightClassName="bg-yellow-200"
/>
```

---

### 3. StatsCard → 패키지 StatCard로 교체 권장 ⚠️

**위치**: `apps/my-app/app/components/common/StatsCard.tsx`

**현재 상황**:
- 패키지에 이미 `StatCard`가 있으며, 트렌드 기능도 포함되어 있음
- 숨다이어리의 `StatsCard`는 패키지 `StatCard`와 기능이 거의 동일

**권장 사항**:
- 숨다이어리 `StatsCard`를 패키지 `StatCard`로 교체
- 패키지 `StatCard`가 더 많은 variant와 기능을 제공 (gradient, outline, elevated 등)

**교체 예시**:
```tsx
// 기존
import StatsCard from '@/app/components/common/StatsCard';

// 변경
import { StatCard } from '@hua-labs/ui';

<StatCard
  title="총 일기 수"
  value={totalDiaries}
  icon="book"
  color="blue"
  variant="elevated"
  trend={{
    value: 12.5,
    label: "지난 달 대비",
    positive: true
  }}
/>
```

---

## ❌ 승격 불필요한 컴포넌트 (숨다이어리 특화)

### 1. QuestionCard / AnalysisCard
- `InfoCard`를 래핑한 숨다이어리 특화 컴포넌트
- 재사용성 낮음

### 2. ThemeStyleToggle
- 숨다이어리 전용 Paper/Minimal 테마 토글
- 프로젝트 특화 기능

### 3. Calendar 관련 컴포넌트
- `CalendarHeader`, `CalendarGrid`, `CalendarSelectedDayList`
- 캘린더 특화 컴포넌트로 범용성 낮음

### 4. NotificationCard (숨다이어리 버전)
- 패키지에 이미 `NotificationCard`가 있음
- 이 버전은 숨다이어리 API 타입에 특화됨

### 5. EmptyState, LoadingState, ErrorMessage
- 이미 패키지 컴포넌트를 래핑한 래퍼
- 기존 API 호환성 유지를 위한 래퍼이므로 승격 불필요

---

## 📋 권장 사항

### 즉시 승격 권장
1. **ActionToolbar** - 범용성 높고 완성도 높음

### 검토 후 승격
2. **SearchHighlight** - 유틸리티 함수 의존성 해결 후 승격 검토

### 교체 권장
3. **StatsCard** - 패키지 `StatCard`로 교체 (이미 트렌드 기능 포함)

---

## 🎯 다음 단계

1. ✅ **ActionToolbar 승격** (완료)
   - ✅ `packages/hua-ui/src/components/ActionToolbar.tsx` 생성
   - ✅ 타입 정의 및 문서화
   - ✅ 패키지 index.ts에 export 추가
   - ✅ 숨다이어리 앱에서 패키지 import로 변경
   - ✅ 기존 파일을 deprecated re-export로 변경 (하위 호환성)

2. **SearchHighlight 승격 (선택)**
   - `packages/hua-ui/src/lib/search-utils.ts` 생성 (유틸리티 함수)
   - `packages/hua-ui/src/components/SearchHighlight.tsx` 생성
   - 패키지 index.ts에 export 추가

3. **StatCard 교체 (선택)**
   - 숨다이어리 `StatsCard`는 현재 사용되지 않음 (StatsCards는 이미 패키지 StatCard 사용 중)

---

## 📊 요약

- ✅ **패키지 사용 현황**: 매우 우수 (대부분의 UI 컴포넌트를 패키지에서 사용)
- 🔄 **승격 가능 컴포넌트**: 1-2개 (ActionToolbar 우선)
- ❌ **승격 불필요**: 대부분 숨다이어리 특화 컴포넌트

**결론**: 패키지 사용이 매우 잘 되어 있으며, ActionToolbar만 승격하면 충분합니다.

