# 숨다 서비스 특화 UI 컴포넌트 문서

> **작성일**: 2025-12-05  
> **목적**: 숨다 서비스(숨다이어리, 숨챗)의 디자인 리팩토링을 위한 컴포넌트 분석 및 패키지 활용 가이드  
> **우선순위**: 🎯 **숨다이어리** (메인 프로덕트) → 숨챗 (보조 서비스)  
> **현재 상태**: ✅ 기능 구현 완료 → 🎨 **디자인 리팩토링 단계**

---

## 🎯 문서의 진짜 목적

**숨다 서비스의 UI 리팩토링을 위한 단일 진실의 출처(Single Source of Truth) 문서이며, 패키지(`@hua-labs/ui`)와 앱(`my-app`/`my-chat`)의 컴포넌트 책임 구분을 명확히 한다.**

이 문서는 개발자가 어떤 컴포넌트를 패키지에서 가져올 수 있고, 어떤 컴포넌트를 서비스 내부에서 리팩토링해야 하는지, 그리고 각 컴포넌트에 어떤 테마와 폰트를 적용해야 하는지를 한눈에 파악할 수 있도록 설계되었습니다.

---

## ⛳ Final TODO (숨다이어리 Phase 1 - 10 Steps)

> **실행 가능한 최종 TODO**: 실제 개발을 시작할 때 이 순서대로 진행하세요.

1. **Paper / Minimal Theme 구조 확정**
   - ThemeProvider 설정 및 테마 전환 로직 구현

2. **프리텐다드 global 적용 + 고운바탕 @font-face 설정**
   - `pnpm add pretendard` 설치
   - 고운바탕 TTF 파일 다운로드 및 `@font-face` 설정

3. **Input/Textarea/Button/Card 기본 스타일 통일**
   - 패키지 컴포넌트 기본 스타일 확인 및 테마 variant 적용

4. **DiaryWritePage 리팩토링**
   - Paper Theme 적용, 고운바탕 본문 폰트 적용

5. **EmotionAnalysisDisplay 레이아웃 개편**
   - 패키지 `Card`, `Grid`, `Container`로 재구성

6. **MetricCard/StatsCards 패키지 컴포넌트로 교체**
   - 🟢 표시된 컴포넌트들을 직접 교체

7. **Header/BottomNavigation 재구축**
   - 패키지 `Navigation`, `Button`, `Icon` 활용

8. **Empty/Loading/Error → 패키지 컴포넌트로 통일**
   - `EmptyState`, `LoadingSpinner`, `Alert` 교체

9. **DiaryList 레이아웃 최소 버전 재정렬**
   - 패키지 `Grid`, `Card`, `Pagination` 적용

10. **Calendar 구조 기반 설계 (UI는 간단 버전)**
    - Phase 1.5로 끌어올려 유지비 감소 (선택사항)

---

## 🏗️ 기본 레이아웃 참조 구조

> **레이아웃 구조**: 모든 컴포넌트가 이 구조 안에서 잘 끼워 맞춰지도록 설계되었습니다.

```
Layout
│
├── Header (Navigation)
│   ├── Logo
│   ├── Navigation Items
│   ├── Notification Badge
│   └── Profile Dropdown
│
├── Container
│   └── PageContent
│       ├── Breadcrumb (선택)
│       ├── Page Header
│       └── Main Content
│           ├── Paper Theme 영역
│           │   ├── DiaryWritePage
│           │   ├── EmotionAnalysis
│           │   └── DiaryList
│           │
│           └── Minimal Theme 영역
│               ├── Dashboard
│               ├── StatsCards
│               └── Settings
│
└── BottomNavigation (mobile only)
    ├── Home
    ├── Diary
    ├── Calendar
    └── Profile
```

### 레이아웃 컴포넌트 역할

- **Header**: 전역 네비게이션, 알림, 프로필 관리
- **Container**: 페이지 너비 제한 및 중앙 정렬
- **PageContent**: 페이지별 콘텐츠 영역
- **BottomNavigation**: 모바일 전용 하단 네비게이션

### 테마 적용 영역

- **Paper Theme**: `PageContent` 내 감성 중심 화면
- **Minimal Theme**: `PageContent` 내 기능 중심 화면
- 테마는 페이지 단위 또는 섹션 단위로 적용 가능

---

## 📋 개요

이 문서는 `packages/hua-ui`의 범용 컴포넌트를 활용하여 **기존에 구현된 서비스 특화 UI 컴포넌트들을 리팩토링**하기 위한 가이드입니다.

> **⚠️ 중요**: 
> - ✅ **기능은 이미 구현되어 있음**
> - 🎨 **현재는 디자인 리팩토링 단계**
> - 📦 **패키지 컴포넌트로 교체 및 개선**
> - 🥇 **숨다이어리**를 메인 프로덕트로 우선 리팩토링

### 범위
- ✅ **서비스 특화 컴포넌트**: 비즈니스 로직이 포함된, 재사용 불가능한 컴포넌트
- ❌ **범용 컴포넌트**: `packages/hua-ui`에 포함되어야 할 범용 UI 컴포넌트

### 컴포넌트 리팩토링 상태 표시
- 🟢 **패키지로 교체 가능**: 기존 컴포넌트를 패키지 컴포넌트로 직접 교체
- 🟡 **패키지 기반 리팩토링**: 패키지 컴포넌트를 활용하여 기존 컴포넌트 개선
- 🔴 **리팩토링 필요**: 기존 컴포넌트를 패키지 스타일로 재구현 필요

---

## 🎯 서비스별 컴포넌트 분류

> **우선순위**: 🥇 **숨다이어리** (메인 프로덕트) → 🥈 숨챗 (보조 서비스)

---

### 1. 🥇 숨다이어리 (my-app) 서비스 - **메인 프로덕트**

숨다이어리는 사용자가 일기를 작성하고 AI가 감정을 분석해주는 핵심 서비스입니다. 다음 컴포넌트들을 우선적으로 **디자인 리팩토링**해야 합니다.

> **현재 상태**: 기능 구현 완료 ✅ → 패키지 컴포넌트 활용한 UI/UX 개선 필요 🎨

---

#### 1.1 일기 작성 컴포넌트 (최우선 개발)

##### `DiaryWritePage` (일기 작성 페이지)
- **리팩토링 상태**: 🟡 **패키지 기반 리팩토링**
- **위치**: `apps/my-app/app/diary/write/page.tsx`
- **현재 상태**: 기능 구현 완료, UI 개선 필요
- **리팩토링 방향**:
  - 패키지 `Input`, `Textarea`로 입력 필드 스타일 통일
  - 패키지 `Card`로 레이아웃 구조 개선
  - 패키지 `Badge`로 저장 상태 표시 개선
  - 패키지 `Progress`로 자동 저장 인디케이터 추가
  - 패키지 `Button`으로 액션 버튼 스타일 통일
  - **테마 적용**: Paper Theme (기본) - 종이 질감 배경, 본문은 고운바탕, UI는 프리텐다드
- **예상 변경사항**: 레이아웃 구조, 색상 시스템, 타이포그래피(프리텐다드/고운바탕 적용), 간격 등 전반적인 UI 개선
- **TODO 예시**:
  ```tsx
  // 기존: <input className="custom-input" />
  // 변경: <Input variant="paper" theme="paper" />
  
  // 기존: <textarea className="custom-textarea" />
  // 변경: <Textarea variant="paper" className="font-gowun-batang" />
  
  // 기존: <div className="save-status">저장중...</div>
  // 변경: <Badge variant="info">저장중...</Badge>
  ```

##### `DiaryEditor` (일기 에디터)
- **리팩토링 상태**: 🟡 **패키지 기반 리팩토링**
- **위치**: `apps/my-app/app/components/diary/`
- **현재 상태**: 기능 구현 완료, UI 개선 필요
- **리팩토링 방향**:
  - 패키지 `Textarea`로 에디터 스타일 통일
  - 자동 저장 인디케이터를 패키지 `Badge` 또는 `Progress`로 개선
  - 특별 메시지 감지 시 패키지 `Alert`로 피드백 제공
- **예상 변경사항**: 에디터 영역 디자인, 포커스 상태, 플레이스홀더 스타일 등 개선

#### 1.2 감정 분석 결과 컴포넌트 (최우선 개발)

##### `EmotionAnalysis` (감정 분석 결과)
- **리팩토링 상태**: 🟡 **패키지 기반 리팩토링**
- **위치**: `apps/my-app/app/components/diary/emotion-analysis.tsx`
- **현재 상태**: 기능 구현 완료, 시각화 UI 대폭 개선 필요
- **리팩토링 방향**:
  - 패키지 `EmotionAnalysis` 컴포넌트를 참고하여 레이아웃 재구성
  - 패키지 `Card`로 각 섹션을 일관된 스타일로 통일
  - 패키지 `Badge`로 감정 태그 스타일 개선
  - 패키지 `Icon`으로 섹션 아이콘 통일
  - 감정 흐름 타임라인을 패키지 컴포넌트로 재구현
  - **테마 적용**: Paper Theme (기본) - 본문(AI 해석문, 감정 흐름)은 고운바탕, 제목/UI 요소는 프리텐다드
- **예상 변경사항**: 전체 레이아웃, 색상 시스템, 카드 디자인, 타이포그래피(본문은 고운바탕 적용) 등 대대적 개선
- **TODO 예시**:
  ```tsx
  // 기존: <div className="emotion-card">...</div>
  // 변경: <Card variant="paper" theme="paper">...</Card>
  
  // 기존: <span className="emotion-tag">{emotion}</span>
  // 변경: <Badge variant="emotion">{emotion}</Badge>
  
  // 기존: <p className="interpretation">{text}</p>
  // 변경: <p className="font-gowun-batang">{text}</p>
  ```

##### `EmotionAnalysisDisplay` (분석 결과 디스플레이)
- **리팩토링 상태**: 🟡 **패키지 기반 리팩토링**
- **위치**: `apps/my-app/app/diary/analysis/page.tsx`
- **현재 상태**: 기능 구현 완료, 페이지 레이아웃 전면 개편 필요
- **리팩토링 방향**:
  - 패키지 `Container`로 페이지 너비 및 여백 통일
  - 패키지 `Grid`로 카드 레이아웃 재구성
  - 패키지 `Card`로 모든 섹션 스타일 통일
  - 패키지 `Button`으로 액션 버튼 그룹 스타일 개선
  - 반응형 레이아웃을 패키지 컴포넌트로 개선
- **예상 변경사항**: 전체 페이지 구조, 카드 배치, 간격, 색상 등 전면적 UI 개선

##### `MetricsModal` (메트릭 설명 모달)
- **리팩토링 상태**: 🟡 **패키지 기반 리팩토링**
- **위치**: `apps/my-app/app/components/hua-analysis/MetricsModal.tsx`
- **현재 상태**: 기능 구현 완료, 모달 UI 전면 개선 필요
- **리팩토링 방향**:
  - 패키지 `Modal`로 모달 컨테이너 스타일 통일
  - 패키지 `Card`로 각 메트릭 설명 섹션 스타일 통일
  - 패키지 `Accordion`으로 접기/펼치기 인터랙션 개선
  - 패키지 `Icon`으로 아이콘 스타일 통일
- **예상 변경사항**: 모달 크기, 레이아웃, 색상, 타이포그래피, 인터랙션 등 전면적 개선

##### `DominantEmotionSection` (주요 감정 섹션)
- **상태**: 🟡 **패키지 활용 + 커스터마이징**
- **위치**: `apps/my-app/app/components/hua-analysis/DominantEmotionSection.tsx`
- **역할**: 주요 감정 시각화
- **필수 기능**:
  - 주요 감정 표시
  - 감정 비율 차트
  - 감정 강도 표시
- **참고**: 패키지의 `EmotionMeter`, `Card`, `Progress`, `Badge` 컴포넌트 활용 가능

##### `MetricCard` (메트릭 카드)
- **리팩토링 상태**: 🟢 **패키지로 교체 가능**
- **위치**: `apps/my-app/app/components/hua-analysis/MetricCard.tsx`
- **현재 상태**: 기능 구현 완료, 패키지 컴포넌트로 직접 교체 가능
- **리팩토링 방향**:
  - 패키지 `MetricCard` 컴포넌트로 직접 교체
  - 기존 커스텀 스타일을 패키지 컴포넌트 props로 마이그레이션
- **예상 변경사항**: 카드 디자인, 색상, 타이포그래피가 패키지 스타일로 통일
- **TODO 예시**:
  ```tsx
  // 기존: <CustomMetricCard title={title} value={value} />
  // 변경: <MetricCard title={title} value={value} variant="paper" />
  ```

##### `SentimentScoreCard` (감정 점수 카드)
- **상태**: 🟡 **패키지 활용 + 커스터마이징**
- **위치**: `apps/my-app/app/components/hua-analysis/SentimentScoreCard.tsx`
- **역할**: 감정 점수 시각화
- **필수 기능**:
  - 점수 표시
  - 점수 해석
  - 시각적 인디케이터
- **참고**: 패키지의 `Card`, `Progress`, `Badge` 컴포넌트 활용 가능

##### `ReasoningSection` (추론 섹션)
- **상태**: 🟡 **패키지 활용 + 커스터마이징**
- **위치**: `apps/my-app/app/components/hua-analysis/ReasoningSection.tsx`
- **역할**: AI 추론 과정 표시
- **필수 기능**:
  - 추론 과정 텍스트
  - 단계별 표시
- **참고**: 패키지의 `Card`, `Accordion`, `Icon` 컴포넌트 활용 가능

#### 1.3 일기 목록 및 관리 컴포넌트 (우선 개발)

##### `DiaryList` (일기 목록)
- **리팩토링 상태**: 🟡 **패키지 기반 리팩토링**
- **위치**: `apps/my-app/app/components/diary/diary-list.tsx`
- **현재 상태**: 기능 구현 완료, 리스트 UI 전면 개선 필요
- **리팩토링 방향**:
  - 패키지 `Grid`로 카드 그리드 레이아웃 재구성
  - 패키지 `Card`로 일기 카드 디자인 통일
  - 패키지 `Select`로 필터/정렬 UI 개선
  - 패키지 `Pagination`으로 페이지네이션 스타일 통일
  - 패키지 `EmptyState`로 빈 상태 디자인 개선
- **예상 변경사항**: 카드 디자인, 그리드 레이아웃, 필터 UI, 빈 상태 등 대폭 개선
- **TODO 예시**:
  ```tsx
  // 기존: <div className="diary-grid">...</div>
  // 변경: <Grid cols={3} gap={4} theme="paper">...</Grid>
  
  // 기존: <div className="diary-card">...</div>
  // 변경: <Card variant="paper" theme="paper">...</Card>
  
  // 기존: <select>...</select>
  // 변경: <Select variant="paper">...</Select>
  ```

##### `DiaryCalendar` (일기 캘린더)
- **리팩토링 상태**: 🔴 **리팩토링 필요**
- **위치**: `apps/my-app/app/components/diary/diary-calendar.tsx`
- **현재 상태**: 기능 구현 완료, 캘린더 UI 전면 재설계 필요
- **리팩토링 방향**:
  - 패키지 `Card`로 캘린더 컨테이너 스타일 통일
  - 패키지 `Button`으로 날짜 셀 디자인 개선
  - 패키지 `Badge`로 감정 인디케이터 스타일 통일
  - 패키지 컴포넌트 스타일 가이드에 맞춰 전체 디자인 재구성
- **예상 변경사항**: 캘린더 그리드 레이아웃, 날짜 셀 디자인, 색상 시스템, 인터랙션 등 전면적 재설계

##### `CalendarGrid` (캘린더 그리드)
- **상태**: 🔴 **새로 만들기**
- **위치**: `apps/my-app/app/components/calendar/CalendarGrid.tsx`
- **역할**: 캘린더 그리드 렌더링
- **필수 기능**:
  - 월별 날짜 그리드
  - 일기 작성일 하이라이트
  - 날짜 클릭 처리
- **참고**: 패키지의 `Grid` 컴포넌트를 활용할 수 있으나, 캘린더 특화 로직이 필요

##### `CalendarDayCell` (캘린더 날짜 셀)
- **상태**: 🔴 **새로 만들기**
- **위치**: `apps/my-app/app/components/calendar/CalendarDayCell.tsx`
- **역할**: 개별 날짜 셀
- **필수 기능**:
  - 날짜 표시
  - 일기 존재 여부 표시
  - 감정 색상 표시
- **참고**: 패키지의 `Button`, `Badge` 컴포넌트 활용 가능

##### `CalendarSelectedDayList` (선택된 날짜 리스트)
- **상태**: 🟡 **패키지 활용 + 커스터마이징**
- **위치**: `apps/my-app/app/components/calendar/CalendarSelectedDayList.tsx`
- **역할**: 선택된 날짜의 일기 목록
- **필수 기능**:
  - 선택된 날짜의 일기 표시
  - 일기 카드 렌더링
- **참고**: 패키지의 `Card`, `Grid` 컴포넌트 활용 가능

#### 1.4 대시보드 컴포넌트 (우선 개발)

##### `Dashboard` (대시보드)
- **리팩토링 상태**: 🟡 **패키지 기반 리팩토링**
- **위치**: `apps/my-app/app/components/diary/Dashboard.tsx`
- **현재 상태**: 기능 구현 완료, 대시보드 레이아웃 전면 개편 필요
- **리팩토링 방향**:
  - 패키지 `DashboardGrid`로 레이아웃 구조 재구성
  - 패키지 `StatCard`로 통계 카드 디자인 통일
  - 패키지 `QuickActionCard`로 빠른 액션 버튼 스타일 개선
  - 패키지 컴포넌트로 전체적인 정보 아키텍처 개선
  - **테마 적용**: Minimal Theme 권장 - 정보 밀도 높음, 모든 텍스트 프리텐다드
- **예상 변경사항**: 그리드 레이아웃, 카드 디자인, 간격, 색상 시스템 등 대대적 개선
- **TODO 예시**:
  ```tsx
  // 기존: <div className="dashboard-grid">...</div>
  // 변경: <DashboardGrid theme="minimal">...</DashboardGrid>
  
  // 기존: <CustomStatCard /> 
  // 변경: <StatCard theme="minimal" {...props} />
  ```

##### `StatsCards` (통계 카드)
- **리팩토링 상태**: 🟢 **패키지로 교체 가능**
- **위치**: `apps/my-app/app/components/dashboard/StatsCards.tsx`
- **현재 상태**: 기능 구현 완료, 패키지 컴포넌트로 직접 교체 가능
- **리팩토링 방향**:
  - 패키지 `StatCard`로 각 통계 카드 교체
  - 패키지 `DashboardGrid`로 그리드 레이아웃 교체
  - 기존 데이터 구조를 패키지 컴포넌트 props에 맞춰 마이그레이션
- **예상 변경사항**: 카드 디자인, 그리드 레이아웃, 색상 시스템 등 패키지 스타일로 통일

##### `RecentDiaries` (최근 일기)
- **상태**: 🟡 **패키지 활용 + 커스터마이징**
- **위치**: `apps/my-app/app/components/dashboard/RecentDiaries.tsx`
- **역할**: 최근 작성한 일기 목록
- **필수 기능**:
  - 최근 일기 목록 로드
  - 일기 미리보기
  - 상세 페이지 링크
- **참고**: 패키지의 `Card`, `Grid`, `Link` 컴포넌트 활용 가능

##### `QuickActions` (빠른 액션)
- **상태**: 🟢 **패키지에서 가져오기**
- **위치**: `apps/my-app/app/components/dashboard/QuickActions.tsx`
- **역할**: 빠른 액션 버튼들
- **필수 기능**:
  - 새 일기 작성
  - 일기 목록 보기
  - 캘린더 보기
- **참고**: 패키지의 `QuickActionCard` 컴포넌트를 직접 사용 가능

#### 1.5 분석 카드 컴포넌트 (우선 개발)

##### `AnalysisCard` (분석 카드)
- **상태**: 🟡 **패키지 활용 + 커스터마이징**
- **위치**: `apps/my-app/app/components/diary-list/AnalysisCard.tsx`
- **역할**: 일기 분석 결과 카드
- **특징**:
  - 감정 요약
  - 주요 감정 표시
  - 메트릭 미리보기
- **필수 기능**:
  - 분석 데이터 표시
  - 상세 페이지 링크
- **참고**: 패키지의 `Card`, `Badge`, `EmotionMeter` 컴포넌트 활용 가능

##### `QuestionCard` (질문 카드)
- **상태**: 🟡 **패키지 활용 + 커스터마이징**
- **위치**: `apps/my-app/app/components/diary-list/QuestionCard.tsx`
- **역할**: 자기성찰 질문 카드
- **필수 기능**:
  - 질문 표시
  - 질문별 일기 링크
- **참고**: 패키지의 `Card`, `Link`, `Icon` 컴포넌트 활용 가능

---

---

## 🔧 공통 서비스 컴포넌트 (숨다이어리 우선)

> **참고**: 아래 컴포넌트들은 주로 숨다이어리에서 사용되며, 숨다이어리 개발과 함께 구현됩니다.

### 3.1 레이아웃 컴포넌트 (숨다이어리 필수)

##### `Header` (헤더)
- **리팩토링 상태**: 🟡 **패키지 기반 리팩토링**
- **위치**: `apps/my-app/app/components/layout/Header.tsx`
- **현재 상태**: 기능 구현 완료, 헤더 디자인 전면 개선 필요
- **리팩토링 방향**:
  - 패키지 `Navigation`으로 네비게이션 구조 재구성
  - 패키지 `Avatar`로 프로필 이미지 스타일 통일
  - 패키지 `Badge`로 알림 카운트 디자인 개선
  - 패키지 `Dropdown`으로 프로필 메뉴 스타일 통일
  - 패키지 `Button`으로 모든 버튼 스타일 통일
- **예상 변경사항**: 헤더 높이, 네비게이션 스타일, 아이콘 배치, 반응형 동작 등 전면적 개선
- **TODO 예시**:
  ```tsx
  // 기존: <nav className="header-nav">...</nav>
  // 변경: <Navigation theme="paper">...</Navigation>
  
  // 기존: <img className="avatar" />
  // 변경: <Avatar src={src} alt={alt} />
  
  // 기존: <span className="notification-count">{count}</span>
  // 변경: <Badge variant="notification">{count}</Badge>
  ```

##### `BottomNavigation` (하단 네비게이션)
- **리팩토링 상태**: 🔴 **리팩토링 필요**
- **위치**: `apps/my-app/app/components/layout/BottomNavigation.tsx`
- **현재 상태**: 기능 구현 완료, 모바일 네비게이션 UI 전면 재설계 필요
- **리팩토링 방향**:
  - 패키지 `Button`으로 네비게이션 아이템 스타일 통일
  - 패키지 `Icon`으로 아이콘 스타일 통일
  - 활성 상태 표시를 패키지 스타일 가이드에 맞춰 개선
  - 패키지 컴포넌트로 전체적인 모바일 네비게이션 디자인 재구성
- **예상 변경사항**: 네비게이션 바 높이, 아이템 배치, 활성 상태 디자인, 애니메이션 등 전면적 재설계

##### `Footer` (푸터)
- **상태**: 🟡 **패키지 활용 + 커스터마이징**
- **위치**: `apps/my-app/app/components/layout/Footer.tsx`
- **역할**: 공통 푸터
- **필수 기능**:
  - 링크 목록
  - 저작권 정보
- **참고**: 패키지의 `Container`, `Link`, `Divider` 컴포넌트 활용 가능

### 3.2 모달 컴포넌트 (숨다이어리 필수)

##### `GuestLimitModal` (게스트 제한 모달)
- **상태**: 🟡 **패키지 활용 + 커스터마이징**
- **위치**: `apps/my-app/app/components/modal/GuestLimitModal.tsx`
- **역할**: 게스트 사용자 제한 안내
- **필수 기능**:
  - 제한 안내 메시지
  - 로그인 유도
- **참고**: 패키지의 `Modal`, `Alert`, `Button` 컴포넌트 활용 가능

##### `SearchModal` (검색 모달)
- **상태**: 🟡 **패키지 활용 + 커스터마이징**
- **위치**: `apps/my-app/app/components/modal/SearchModal.tsx`
- **역할**: 일기 검색 모달
- **필수 기능**:
  - 검색 입력
  - 검색 결과 표시
  - 하이라이트
- **참고**: 패키지의 `Modal`, `Input`, `Command` 컴포넌트 활용 가능

##### `TermsModal` (약관 모달)
- **상태**: 🟡 **패키지 활용 + 커스터마이징**
- **위치**: `apps/my-app/app/components/modal/TermsModal.tsx`
- **역할**: 약관 표시 모달
- **필수 기능**:
  - 약관 내용 표시
  - 스크롤 가능한 콘텐츠
- **참고**: 패키지의 `Modal`, `ScrollArea` 컴포넌트 활용 가능

##### `ProviderSettingsModal` (프로바이더 설정 모달)
- **리팩토링 상태**: 🟡 **패키지 기반 리팩토링**
- **위치**: `apps/my-app/app/components/modal/ProviderSettingsModal.tsx`
- **현재 상태**: 기능 구현 완료, 설정 UI 개선 필요
- **리팩토링 방향**:
  - 패키지 `Modal`, `Select`, `Input`, `Form`, `Button` 컴포넌트 활용
  - **테마 적용**: Minimal Theme 권장 - 기능 중심, 모든 텍스트 프리텐다드
- **예상 변경사항**: 모달 레이아웃, 폼 스타일, 색상 시스템 등 개선

### 3.3 프로필 컴포넌트 (숨다이어리 선택)

##### `ProfileHeader` (프로필 헤더)
- **상태**: 🟡 **패키지 활용 + 커스터마이징**
- **위치**: `apps/my-app/app/components/profile/ProfileHeader.tsx`
- **역할**: 프로필 페이지 헤더
- **필수 기능**:
  - 사용자 정보 표시
  - 프로필 이미지
  - 편집 버튼
- **참고**: 패키지의 `Avatar`, `Button`, `Card` 컴포넌트 활용 가능

##### `ProfileInfoSection` (프로필 정보 섹션)
- **상태**: 🟡 **패키지 활용 + 커스터마이징**
- **위치**: `apps/my-app/app/components/profile/ProfileInfoSection.tsx`
- **역할**: 프로필 정보 표시
- **필수 기능**:
  - 사용자 정보 표시
  - 편집 폼
- **참고**: 패키지의 `Form`, `Input`, `Card` 컴포넌트 활용 가능

##### `ProfileStatsSection` (프로필 통계 섹션)
- **상태**: 🟡 **패키지 활용 + 커스터마이징**
- **위치**: `apps/my-app/app/components/profile/ProfileStatsSection.tsx`
- **역할**: 사용자 통계 표시
- **필수 기능**:
  - 통계 데이터 표시
  - 차트/그래프
- **참고**: 패키지의 `StatCard`, `Progress`, `Card` 컴포넌트 활용 가능

### 3.4 공통 유틸리티 컴포넌트 (숨다이어리 필수)

##### `EmptyState` (빈 상태)
- **리팩토링 상태**: 🟢 **패키지로 교체 가능**
- **위치**: `apps/my-app/app/components/common/EmptyState.tsx`
- **현재 상태**: 기능 구현 완료, 패키지 컴포넌트로 직접 교체 가능
- **리팩토링 방향**:
  - 패키지 `DashboardEmptyState` 또는 범용 `EmptyState`로 교체
  - 기존 메시지와 액션을 패키지 컴포넌트 props로 마이그레이션
- **예상 변경사항**: 레이아웃, 아이콘 스타일, 메시지 스타일, 버튼 디자인 등 패키지 스타일로 통일

##### `LoadingState` (로딩 상태)
- **리팩토링 상태**: 🟢 **패키지로 교체 가능**
- **위치**: `apps/my-app/app/components/common/LoadingState.tsx`
- **현재 상태**: 기능 구현 완료, 패키지 컴포넌트로 직접 교체 가능
- **리팩토링 방향**:
  - 패키지 `LoadingSpinner`로 스피너 교체
  - 패키지 `Skeleton`으로 스켈레톤 로딩 교체
  - 로딩 메시지는 패키지 컴포넌트 스타일로 통일
- **예상 변경사항**: 스피너 디자인, 스켈레톤 스타일, 애니메이션 등 패키지 스타일로 통일

##### `ErrorMessage` (에러 메시지)
- **리팩토링 상태**: 🟢 **패키지로 교체 가능**
- **위치**: `apps/my-app/app/components/common/ErrorMessage.tsx`
- **현재 상태**: 기능 구현 완료, 패키지 컴포넌트로 직접 교체 가능
- **리팩토링 방향**:
  - 패키지 `Alert`, `AlertError`로 에러 메시지 교체
  - 재시도 버튼은 패키지 `Button`으로 통일
- **예상 변경사항**: 에러 메시지 디자인, 색상, 아이콘, 버튼 스타일 등 패키지 스타일로 통일

##### `NotificationCard` (알림 카드)
- **상태**: 🟢 **패키지에서 가져오기**
- **위치**: `apps/my-app/app/components/common/NotificationCard.tsx`
- **역할**: 알림 카드
- **필수 기능**:
  - 알림 내용 표시
  - 읽음/삭제 처리
- **참고**: 패키지의 `NotificationCard` 컴포넌트를 직접 사용 가능

##### `JailbreakNotice` (Jailbreak 알림)
- **상태**: 🟡 **패키지 활용 + 커스터마이징**
- **위치**: `apps/my-app/app/components/common/JailbreakNotice.tsx`
- **역할**: 윤리 정책 위반 알림
- **필수 기능**:
  - 위반 안내
  - 조치 안내
- **참고**: 패키지의 `Alert`, `AlertWarning` 컴포넌트 활용 가능

### 3.5 서비스 특화 컴포넌트 (숨다이어리 선택)

##### `PWAInstallPrompt` (PWA 설치 프롬프트)
- **상태**: 🔴 **새로 만들기**
- **위치**: `apps/my-app/app/components/service/PWAInstallPrompt.tsx`
- **역할**: PWA 설치 유도
- **필수 기능**:
  - 설치 가능 여부 감지
  - 설치 프롬프트 표시
- **참고**: PWA 설치 감지 로직은 서비스 특화이므로 새로 구현 필요. 패키지의 `Modal`, `Button` 컴포넌트 활용 가능

##### `ServiceWorkerRegistration` (서비스 워커 등록)
- **상태**: 🔴 **새로 만들기**
- **위치**: `apps/my-app/app/components/service/ServiceWorkerRegistration.tsx`
- **역할**: 서비스 워커 등록 및 관리
- **필수 기능**:
  - 서비스 워커 등록
  - 업데이트 감지
- **참고**: 서비스 워커 등록 로직은 서비스 특화이므로 새로 구현 필요

##### `NetworkStatus` (네트워크 상태)
- **상태**: 🔴 **새로 만들기**
- **위치**: `apps/my-app/app/components/service/NetworkStatus.tsx`
- **역할**: 네트워크 상태 표시
- **필수 기능**:
  - 온라인/오프라인 감지
  - 상태 표시
- **참고**: 네트워크 상태 감지 로직은 서비스 특화이므로 새로 구현 필요. 패키지의 `Alert`, `Badge` 컴포넌트 활용 가능

---

### 2. 🥈 숨챗 (my-chat) 서비스 - 보조 서비스

> **⚠️ 참고**: 숨챗은 숨다이어리 개발이 완료된 후 개발을 진행합니다.

#### 2.1 채팅 인터페이스 컴포넌트

##### `ChatUI` (메인 채팅 인터페이스)
- **상태**: 🔴 **새로 만들기**
- **위치**: `apps/my-chat/src/components/ChatUI.tsx`
- **역할**: 전체 채팅 UI를 관리하는 메인 컴포넌트
- **특징**:
  - 세션 관리 (생성, 선택, 삭제)
  - 감응값(tone/mode/tier) 프리셋 적용
  - 자동 스크롤 및 메시지 애니메이션
  - 게스트 사용자 제한 처리
- **필수 기능**:
  - 실시간 메시지 송수신
  - 감응값 자동 분석 및 표시
  - 세션별 상태 관리
  - 로그인 유도 모달 연동
- **참고**: 서비스 특화 비즈니스 로직이 많아 새로 구현 필요. 패키지의 `Container`, `Card` 등 레이아웃 컴포넌트 활용 가능

##### `MessageBubble` (메시지 버블)
- **상태**: 🟡 **패키지 활용 + 커스터마이징**
- **위치**: `apps/my-chat/src/components/MessageBubble.tsx`
- **역할**: 개별 메시지를 표시하는 버블 컴포넌트
- **특징**:
  - 사용자/AI 메시지 구분
  - Markdown 렌더링 지원
  - 감응값(tone/mode/tier) 뱃지 표시
  - 코드 블록 하이라이팅
- **필수 기능**:
  - 메시지 타입별 스타일링
  - 타임스탬프 표시
  - 감응 메타데이터 시각화
- **참고**: 패키지의 `ChatMessage` 컴포넌트를 참고하되, 숨챗 특화 기능(감응값 뱃지, Markdown 파싱 등) 추가 필요

##### `ChatInputZone` (채팅 입력 영역)
- **상태**: 🟡 **패키지 활용 + 커스터마이징**
- **위치**: `apps/my-chat/src/components/chat/ChatInputZone.tsx`
- **역할**: 메시지 입력 및 전송 영역
- **특징**:
  - 실시간 입력 처리
  - 스크롤 다운 버튼
  - 게스트 제한 안내
  - Slip 상태 표시
- **필수 기능**:
  - 입력 제한 처리
  - 전송 버튼 상태 관리
  - 플레이스홀더 텍스트 동적 변경
- **참고**: 패키지의 `Textarea`, `Button`, `ScrollToTop` 컴포넌트 활용 가능

##### `ChatMessageList` (메시지 리스트)
- **상태**: 🟡 **패키지 활용 + 커스터마이징**
- **위치**: `apps/my-chat/src/components/chat/ChatMessageList.tsx`
- **역할**: 메시지 목록을 날짜별로 그룹화하여 표시
- **특징**:
  - 날짜 구분선 표시
  - 메시지 그룹화
  - 애니메이션 효과
- **필수 기능**:
  - 날짜별 메시지 필터링
  - 스크롤 최적화
- **참고**: 패키지의 `ScrollArea`, `Divider` 컴포넌트 활용 가능

#### 2.2 세션 관리 컴포넌트

##### `SessionSidebar` (세션 사이드바)
- **상태**: 🟡 **패키지 활용 + 커스터마이징**
- **위치**: `apps/my-chat/src/components/SessionSidebar.tsx`
- **역할**: 세션 목록을 표시하고 관리하는 사이드바
- **특징**:
  - 세션 목록 표시 (제목, 메시지 수, 시간)
  - 세션 편집/삭제 기능
  - 모바일/데스크톱 반응형
  - 세션 제한 처리 (최대 10개)
- **필수 기능**:
  - 세션 생성/선택/삭제
  - 인라인 편집
  - 세션 정렬 (최신순)
  - 빈 상태 처리
- **참고**: 패키지의 `Drawer`, `Button`, `Badge`, `EmptyState` 컴포넌트 활용 가능

##### `SessionHeader` (세션 헤더)
- **상태**: 🟡 **패키지 활용 + 커스터마이징**
- **위치**: `apps/my-chat/src/components/SessionHeader.tsx`
- **역할**: 현재 세션의 헤더 정보 표시
- **특징**:
  - 세션 제목 표시
  - 감응값(tone/mode) 선택 드롭다운
  - 설정 버튼
- **필수 기능**:
  - 감응값 변경 처리
  - 세션 제목 표시
- **참고**: 패키지의 `Select`, `Button`, `Badge` 컴포넌트 활용 가능

##### `SessionList` (세션 리스트)
- **상태**: 🟡 **패키지 활용 + 커스터마이징**
- **위치**: `apps/my-chat/src/components/SessionList.tsx`
- **역할**: 세션 목록을 리스트 형태로 표시
- **특징**:
  - 세션 카드 형태
  - 호버 효과
  - 활성 세션 하이라이트
- **필수 기능**:
  - 세션 선택
  - 세션 정보 표시
- **참고**: 패키지의 `Card`, `Button` 컴포넌트 활용 가능

#### 2.3 감응값 관리 컴포넌트

##### `SettingsModal` (설정 모달)
- **상태**: 🟡 **패키지 활용 + 커스터마이징**
- **위치**: `apps/my-chat/src/components/SettingsModal.tsx`
- **역할**: 감응값 프리셋 및 시스템 설정 관리
- **특징**:
  - Tone/Mode/Tier 선택
  - 테마 설정
  - 사용자 프로필 관리
- **필수 기능**:
  - 프리셋 저장/로드
  - 설정 영구 저장
- **참고**: 패키지의 `Modal`, `Select`, `Switch`, `ThemeToggle` 컴포넌트 활용 가능

#### 2.4 인증 및 제한 컴포넌트

##### `LoginModal` (로그인 모달)
- **상태**: 🟡 **패키지 활용 + 커스터마이징**
- **위치**: `apps/my-chat/src/components/LoginModal.tsx`
- **역할**: 게스트 사용자 로그인 유도
- **특징**:
  - 게스트 제한 안내
  - 소셜 로그인 연동
  - 모달 오버레이
- **필수 기능**:
  - 로그인 플로우 시작
  - 제한 안내 메시지
- **참고**: 패키지의 `Modal`, `Button`, `Alert` 컴포넌트 활용 가능

##### `GuestHome` (게스트 홈)
- **상태**: 🟡 **패키지 활용 + 커스터마이징**
- **위치**: `apps/my-chat/src/components/GuestHome.tsx`
- **역할**: 게스트 사용자 홈 화면
- **특징**:
  - 서비스 소개
  - 체험 버튼
  - 로그인 유도
- **필수 기능**:
  - 게스트 세션 시작
  - 로그인 유도
- **참고**: 패키지의 `HeroSection`, `Button`, `Card`, `FeatureCard` 컴포넌트 활용 가능

---

## 📦 패키지 컴포넌트 활용 가이드

### 🟢 패키지에서 직접 사용 가능한 컴포넌트

다음 컴포넌트들은 `@hua-labs/ui` 패키지에서 바로 import하여 사용할 수 있습니다:

```typescript
import {
  // 기본 UI
  Button, Input, Textarea, Select, Switch, Checkbox, Radio, Slider,
  Card, Badge, Avatar, Alert, Toast, LoadingSpinner, Skeleton,
  
  // 레이아웃
  Container, Grid, Stack, Divider,
  
  // 오버레이
  Modal, Drawer, BottomSheet, Popover, Dropdown, Tooltip,
  
  // 네비게이션
  Navigation, Breadcrumb, Pagination,
  
  // 데이터 표시
  Table, Progress, Tabs, Accordion,
  
  // 감정 관련
  EmotionAnalysis, EmotionButton, EmotionMeter, EmotionSelector,
  
  // 대시보드
  StatCard, MetricCard, NotificationCard, DashboardEmptyState,
  
  // 스크롤
  ScrollArea, ScrollToTop, ScrollProgress, ScrollIndicator,
  
  // 테마
  ThemeProvider, ThemeToggle,
  
  // 채팅
  ChatMessage,
} from '@hua-labs/ui';
```

### 🟡 패키지 컴포넌트 기반 커스터마이징

다음 컴포넌트들은 패키지 컴포넌트를 기반으로 하되, 서비스 특화 기능을 추가해야 합니다:

1. **MessageBubble**: `ChatMessage` 기반 + 감응값 뱃지, Markdown 파싱
2. **ChatInputZone**: `Textarea` + `Button` + `ScrollToTop` 조합
3. **SessionSidebar**: `Drawer` + 세션 관리 로직
4. **DiaryWritePage**: `Input` + `Textarea` + 자동 저장 로직
5. **EmotionAnalysis**: 패키지 `EmotionAnalysis` + 숨다이어리 특화 데이터 구조
6. **모달 컴포넌트들**: `Modal` + 서비스 특화 콘텐츠

### 🔴 새로 구현해야 하는 컴포넌트

다음 컴포넌트들은 서비스 특화 비즈니스 로직이 많아 처음부터 구현이 필요합니다:

1. **ChatUI**: 전체 채팅 인터페이스 오케스트레이션
2. **DiaryCalendar**: 일기 캘린더 뷰 (날짜별 일기 표시)
3. **CalendarGrid**: 캘린더 그리드 렌더링
4. **CalendarDayCell**: 개별 날짜 셀
5. **PWAInstallPrompt**: PWA 설치 감지 및 프롬프트
6. **ServiceWorkerRegistration**: 서비스 워커 등록 로직
7. **NetworkStatus**: 네트워크 상태 감지

---

## 📊 숨다이어리 컴포넌트 리팩토링 우선순위

> **⚠️ 중요**: 숨다이어리는 메인 프로덕트이므로 다음 순서로 **디자인 리팩토링**을 진행합니다.
> 
> **현재 상황**: 기능은 이미 구현되어 있으므로, 패키지 컴포넌트를 활용하여 UI/UX를 개선합니다.

### 🥇 Phase 1: 핵심 화면 리팩토링 - 최우선

**목표**: 사용자가 가장 자주 사용하는 핵심 화면의 UI/UX 개선

1. **일기 작성 화면**
   - `DiaryWritePage` - 패키지 `Input`, `Textarea`, `Button`, `Card`로 UI 개선
   - `DiaryEditor` - 패키지 `Textarea` 기반으로 스타일 통일

2. **감정 분석 결과 화면**
   - `EmotionAnalysisDisplay` - 패키지 `Card`, `Grid`, `Container`로 레이아웃 개선
   - `EmotionAnalysis` - 패키지 `EmotionAnalysis` 컴포넌트 활용
   - `MetricCard` - 패키지 `MetricCard`로 직접 교체

3. **기본 레이아웃**
   - `Header` - 패키지 `Navigation`, `Avatar`, `Badge`로 개선
   - `BottomNavigation` - 패키지 `Button`, `Icon` 활용하여 재구현
   - `Footer` - 패키지 `Container`, `Link`로 스타일 통일

4. **공통 컴포넌트 교체**
   - `EmptyState` - 패키지 `DashboardEmptyState`로 교체
   - `LoadingState` - 패키지 `LoadingSpinner`, `Skeleton`로 교체
   - `ErrorMessage` - 패키지 `Alert`, `AlertError`로 교체

### 🥈 Phase 2: 일기 관리 화면 리팩토링 - 우선

**목표**: 일기 목록 및 대시보드 화면의 UI/UX 개선

1. **일기 목록 화면**
   - `DiaryList` - 패키지 `Card`, `Grid`, `Pagination`로 개선
   - `AnalysisCard` - 패키지 `Card`, `Badge`, `EmotionMeter` 활용
   - `QuestionCard` - 패키지 `Card`, `Link`, `Icon`으로 스타일 통일

2. **대시보드 화면**
   - `Dashboard` - 패키지 `DashboardGrid`, `StatCard` 활용
   - `StatsCards` - 패키지 `StatCard`, `DashboardGrid`로 직접 교체
   - `RecentDiaries` - 패키지 `Card`, `Grid`로 개선
   - `QuickActions` - 패키지 `QuickActionCard`로 직접 교체

3. **모달 개선**
   - `GuestLimitModal` - 패키지 `Modal`, `Alert`, `Button`로 개선
   - `SearchModal` - 패키지 `Modal`, `Input`, `Command` 활용

### 🥉 Phase 3: 고급 화면 리팩토링 - 중간 우선순위

**목표**: 캘린더 뷰 및 분석 고도화 화면의 UI/UX 개선

1. **캘린더 뷰 개선**
   - `DiaryCalendar` - 패키지 `Card`, `Button` 활용하여 재구현
   - `CalendarGrid` - 패키지 `Grid` 기반으로 개선
   - `CalendarDayCell` - 패키지 `Button`, `Badge` 활용
   - `CalendarSelectedDayList` - 패키지 `Card`, `Grid`로 개선

2. **분석 고도화 화면**
   - `MetricsModal` - 패키지 `Modal`, `Card`, `Accordion`로 개선
   - `DominantEmotionSection` - 패키지 `EmotionMeter`, `Card`, `Progress` 활용
   - `SentimentScoreCard` - 패키지 `Card`, `Progress`, `Badge`로 개선
   - `ReasoningSection` - 패키지 `Card`, `Accordion`, `Icon` 활용

3. **프로필 화면**
   - `ProfileHeader` - 패키지 `Avatar`, `Button`, `Card`로 개선
   - `ProfileInfoSection` - 패키지 `Form`, `Input`, `Card` 활용
   - `ProfileStatsSection` - 패키지 `StatCard`, `Progress`로 개선

### 🔧 Phase 4: 부가 화면 리팩토링 - 낮은 우선순위

**목표**: PWA, 설정 등 부가 화면의 UI/UX 개선

1. **PWA 및 오프라인**
   - `PWAInstallPrompt` - PWA 설치 프롬프트
   - `ServiceWorkerRegistration` - 서비스 워커 등록
   - `NetworkStatus` - 네트워크 상태

2. **설정**
   - `ProviderSettingsModal` - AI 프로바이더 설정
   - `TermsModal` - 약관 모달

3. **기타**
   - `JailbreakNotice` - 윤리 정책 위반 알림
   - `NotificationCard` - 알림 카드 (패키지에서 가져오기)

---

## 📊 숨챗 컴포넌트 개발 우선순위

> **참고**: 숨챗은 숨다이어리 개발 완료 후 진행합니다.

### 높은 우선순위 (핵심 기능)
- `ChatUI` - 메인 채팅 인터페이스
- `MessageBubble` - 메시지 표시
- `SessionSidebar` - 세션 관리
- `ChatInputZone` - 메시지 입력

### 중간 우선순위 (향상된 UX)
- `SettingsModal` - 설정 관리
- `LoginModal` - 로그인 유도
- `SessionHeader` - 세션 헤더

### 낮은 우선순위 (부가 기능)
- `GuestHome` - 게스트 홈
- 애니메이션 컴포넌트

---

## 🎨 디자인 가이드라인

### 테마 구조

숨다이어리는 감성 기반 일기 서비스이지만, 기능적 화면에서는 미니멀한 UI가 더 좋은 사용성을 제공합니다. 이를 위해 **Paper Theme**와 **Minimal Theme** 두 가지 디자인 스타일을 제공합니다.

#### 테마 구성

테마는 크게 두 종류로 나뉘며, 각각 라이트/다크 모드를 포함합니다.

```
Theme:
  paper    (기본)
  minimal  (선택)

Mode:
  light
  dark

실제 조합:
- paper.light
- paper.dark
- minimal.light
- minimal.dark
```

#### Paper Theme (기본)

**특징**:
- 종이 질감 배경
- 부드러운 크림톤 라이트, 미묘한 그레인 다크
- 본문: 고운바탕 (Gowun Batang)
- UI: 프리텐다드 (Pretendard)
- 감성, 몰입, 서사 중심 화면에 최적

**적용되는 화면**:
- 일기 작성/열람 (`DiaryWritePage`, `DiaryEditor`)
- 감응 분석 (`EmotionAnalysis`, `EmotionAnalysisDisplay`)
- 타임라인 (일기 목록, 캘린더)
- 유저 개인화 영역 (프로필, 일기 상세)

#### Minimal Theme (선택)

**특징**:
- 완전 민무늬 배경 (#ffffff / #000000)
- 정보 밀도 높음
- 모든 텍스트 프리텐다드 중심
- 그래프, 표, 설정 화면에 최적

**적용되는 화면**:
- 설정 / 계정 관리 (`ProviderSettingsModal`, 프로필 설정)
- 알림 / 보안 / 권한
- AI 템플릿 관리
- 통계 / 대시보드 (`Dashboard`, `StatsCards`)

#### 테마 비교표

| 항목 | Paper Theme | Minimal Theme |
|------|-------------|---------------|
| 주요 목적 | 감성·몰입 | 기능·효율 |
| 배경 | 종이 질감 | 무지 (Solid) |
| 본문 폰트 | 고운바탕 | 프리텐다드 |
| UI 폰트 | 프리텐다드 | 프리텐다드 |
| 대비감 | 낮음·부드러움 | 높음·선명함 |
| 가독성(긴 글) | 매우 좋음 | 준수 |
| 대시보드 | 불필요하게 감성적 | 최적 |

#### 추천 사용 흐름

```
Paper (Default)
│
├─ 일기/감정/분석 페이지 → Paper 유지
└─ 기능적 화면 접근 시 → Minimal 옵션 선택 가능
```

#### ThemeProvider 구조

```tsx
<ThemeProvider theme={userTheme} mode={systemOrUserMode}>
  {children}
</ThemeProvider>
```

**theme 값**: `"paper" | "minimal"`  
**mode 값**: `"light" | "dark" | "system"`

---

### 타이포그래피 (폰트 방침)

#### Paper Theme 폰트

**기본 UI 폰트**:
- **프리텐다드 (Pretendard)**: 모든 UI 요소에 적용
  - 헤더, 푸터, 버튼, 입력 필드, 카드 제목, 네비게이션 등
  - **설치 방법**: npm 패키지로 설치 가능
    ```bash
    pnpm add pretendard
    # 또는
    npm install pretendard
    ```
  - **npm 패키지**: [pretendard](https://www.npmjs.com/package/pretendard)

**본문 폰트**:
- **고운바탕 (Gowun Batang)**: 줄글 컨텐츠에 적용
  - 일기 본문 (`DiaryWritePage`, `DiaryEditor`)
  - AI 해석문 (`EmotionAnalysis`, `EmotionAnalysisDisplay`)
  - 감정 흐름 설명
  - 자기성찰 질문
  - 기타 긴 텍스트 컨텐츠
  - **설치 방법**: npm 패키지로 제공되지 않음. GitHub에서 폰트 파일 직접 다운로드 필요
  - **GitHub 저장소**: [yangheeryu/Gowun-Batang](https://github.com/yangheeryu/Gowun-Batang)
  - **폰트 파일 위치**: `fonts/ttf/` 디렉토리에서 TTF 파일 다운로드

#### Minimal Theme 폰트

**모든 텍스트**:
- **프리텐다드 (Pretendard)**: 모든 텍스트에 통일 적용
  - 본문, UI 요소, 제목 등 모든 텍스트
  - 정보 밀도가 높은 화면에서 일관된 가독성 제공

#### 폰트 설치 가이드

##### 프리텐다드 설치
```bash
# pnpm 사용 (프로젝트 기본 패키지 매니저)
pnpm add pretendard

# 또는 npm 사용
npm install pretendard
```

##### 고운바탕 설치
1. [GitHub 저장소](https://github.com/yangheeryu/Gowun-Batang)에서 폰트 파일 다운로드
2. `fonts/ttf/` 디렉토리에서 필요한 폰트 파일 복사
   - `GowunBatang-Regular.ttf` (일반)
   - `GowunBatang-Bold.ttf` (굵게)
3. 프로젝트의 `public/fonts/` 또는 `app/fonts/` 디렉토리에 배치
4. CSS에서 `@font-face`로 로드

#### 적용 예시

##### CSS 적용 (Paper Theme)
```css
/* 기본 UI 요소 - 프리텐다드 */
.header, .button, .input, .card-title {
  font-family: 'Pretendard', sans-serif;
}

/* 본문 컨텐츠 - 고운바탕 (Paper Theme만) */
.diary-content, .ai-interpretation, .emotion-flow {
  font-family: '고운바탕', 'Gowun Batang', serif;
}
```

##### CSS 적용 (Minimal Theme)
```css
/* 모든 텍스트 - 프리텐다드 */
* {
  font-family: 'Pretendard', sans-serif;
}
```

##### Next.js에서 폰트 적용 예시
```typescript
// app/layout.tsx 또는 globals.css
import { Pretendard } from 'pretendard';

// 고운바탕은 @font-face로 직접 로드
@font-face {
  font-family: 'Gowun Batang';
  src: url('/fonts/GowunBatang-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
}

@font-face {
  font-family: 'Gowun Batang';
  src: url('/fonts/GowunBatang-Bold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
}
```

### 공통 스타일
- **테마 시스템**: Paper Theme (기본) / Minimal Theme (선택)
  - Paper: 감성 중심 화면 (일기, 분석 등)
  - Minimal: 기능 중심 화면 (설정, 통계 등)
- **색상**: 서비스별 브랜드 컬러 사용
  - 숨챗: Prism 테마 (핑크/퍼플)
  - 숨다이어리: Rhythm Room 테마 (핑크/퍼플 그라데이션)
- **애니메이션**: `hua-motion` SDK 사용 (메모리: 4135366)
- **반응형**: 모바일 퍼스트 디자인

### 테마별 적용 가이드

#### Paper Theme 적용 컴포넌트
- `DiaryWritePage` - 일기 작성
- `DiaryEditor` - 일기 에디터
- `EmotionAnalysis` - 감정 분석 결과
- `EmotionAnalysisDisplay` - 분석 결과 페이지
- `DiaryList` - 일기 목록
- `DiaryCalendar` - 일기 캘린더
- `AnalysisCard` - 분석 카드
- `QuestionCard` - 질문 카드

#### Minimal Theme 적용 컴포넌트
- `Dashboard` - 대시보드
- `StatsCards` - 통계 카드
- `ProviderSettingsModal` - 프로바이더 설정
- `SearchModal` - 검색 모달
- `ProfileInfoSection` - 프로필 정보
- `ProfileStatsSection` - 프로필 통계

### 컴포넌트 구조
```
apps/{service-name}/
├── app/
│   └── components/
│       ├── {feature}/          # 기능별 컴포넌트
│       ├── common/             # 공통 컴포넌트
│       ├── layout/             # 레이아웃 컴포넌트
│       └── modal/              # 모달 컴포넌트
```

---

## 🔗 관련 문서

- [숨다이어리 개발 플랜](./SUMDIARY_DEVELOPMENT_PLAN.md)
- [숨챗 서비스 기능 요약](../apps/my-chat/docs/SERVICE-FEATURES-SUMMARY.txt)
- [HUA UI 라이브러리](./HUA_UI_LIBRARY.md)

---

## 📝 참고사항

1. **범용 컴포넌트와의 구분**:
   - 범용 컴포넌트는 `packages/hua-ui`에 포함
   - 서비스 특화 컴포넌트는 각 앱 내부에 구현

2. **재사용성 고려**:
   - 서비스 간 공통 패턴이 발견되면 범용 컴포넌트로 추출 검토
   - 단, 비즈니스 로직이 포함된 경우 서비스 내부에 유지

3. **테스트 전략**:
   - 각 컴포넌트별 단위 테스트 작성
   - 통합 테스트는 페이지 단위로 수행

---

---

## 📈 숨다이어리 컴포넌트 리팩토링 상태 요약

### 통계 (숨다이어리 기준)
- 🟢 **패키지로 교체 가능**: 7개
  - `MetricCard`, `StatsCards`, `EmptyState`, `LoadingState`, `ErrorMessage`, `NotificationCard`, `QuickActions`
  - → 기존 컴포넌트를 패키지 컴포넌트로 직접 교체하여 빠르게 UI 개선
- 🟡 **패키지 기반 리팩토링**: 28개
  - 대부분의 컴포넌트가 이 카테고리에 해당
  - → 패키지 컴포넌트를 활용하여 기존 UI를 대폭 개선
- 🔴 **리팩토링 필요**: 6개
  - `DiaryCalendar`, `CalendarGrid`, `CalendarDayCell`, `BottomNavigation`, `PWAInstallPrompt`, `ServiceWorkerRegistration`, `NetworkStatus`
  - → 패키지 스타일 가이드에 맞춰 전면적으로 재설계 필요

### 리팩토링 예상 범위
> **⚠️ 중요**: 현재 UI는 기능 구현에 중점을 두었기 때문에, 리팩토링 시 **대대적인 UI 변경**이 예상됩니다.
> 
> - 레이아웃 구조 전면 개편
> - 색상 시스템 통일
> - 타이포그래피 개선 (프리텐다드 기본, 고운바탕 본문)
> - 간격 및 여백 통일
> - 인터랙션 및 애니메이션 개선
> - 반응형 디자인 개선

### 권장 리팩토링 순서 (숨다이어리 우선)

#### Phase별 예상 소요 시간 및 난이도

| Phase | 범위 | 난이도 | 예상 기간 | 주요 작업 |
|-------|------|--------|-----------|----------|
| **Phase 1** | 핵심 화면 리팩토링 | 🔥 **중~상** | **1-2주** | 일기 작성, 분석 결과, 기본 레이아웃 |
| **Phase 2** | 일기 관리 화면 | 🟡 **중간** | **1-2주** | 일기 목록, 대시보드, 모달 |
| **Phase 3** | 고급/캘린더 | 🔴 **상** | **2-3주** | 캘린더 뷰, 분석 고도화, 프로필 |
| **Phase 4** | PWA/설정 | 🟢 **낮음** | **1주** | PWA 관련, 설정 화면 |

#### Phase 1: 핵심 화면 리팩토링 (1-2주)

**난이도**: 🔥 중~상 | **예상 기간**: 1-2주

1. **패키지 컴포넌트로 직접 교체**
   - 🟢 표시된 컴포넌트들을 패키지 컴포넌트로 교체
   - `MetricCard`, `StatsCards`, `EmptyState`, `LoadingState`, `ErrorMessage`, `QuickActions` 등

2. **핵심 화면 UI 개선**
   - `DiaryWritePage` - 패키지 컴포넌트로 스타일 통일
   - `EmotionAnalysisDisplay` - 레이아웃 및 카드 디자인 개선
   - 기본 레이아웃 (`Header`, `BottomNavigation`, `Footer`) - 패키지 컴포넌트 활용

#### Phase 2: 일기 관리 화면 리팩토링 (1-2주)

**난이도**: 🟡 중간 | **예상 기간**: 1-2주

3. **패키지 기반 리팩토링**
   - 🟡 표시된 컴포넌트들을 패키지 컴포넌트를 활용하여 개선
   - `DiaryList`, `Dashboard`, `AnalysisCard` 등 UI/UX 개선

#### Phase 3: 고급 화면 리팩토링 (2-3주)

**난이도**: 🔴 상 | **예상 기간**: 2-3주

4. **서비스 특화 컴포넌트 재구현**
   - 🔴 표시된 컴포넌트들을 패키지 스타일로 재구현
   - `DiaryCalendar`, `CalendarGrid` 등 캘린더 기능 UI 개선
   - 분석 고도화 컴포넌트들 디자인 통일

#### Phase 4: 부가 화면 리팩토링 (1주)

**난이도**: 🟢 낮음 | **예상 기간**: 1주

5. **부가 화면 및 최적화**
   - PWA 관련 컴포넌트 UI 개선
   - 프로필 화면 디자인 통일
   - 설정 모달들 패키지 스타일 적용

---

**문서 버전**: 1.1  
**최종 업데이트**: 2025-12-05

