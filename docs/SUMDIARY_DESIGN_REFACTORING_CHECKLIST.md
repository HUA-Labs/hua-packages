# 숨다이어리 디자인 리팩토링 체크리스트

> **작성일**: 2025-12-05  
> **목적**: 병렬 작업을 위한 체크리스트 및 작업 그룹 분할 가이드  
> **기반 문서**: [SUMDI_SERVICE_SPECIFIC_COMPONENTS.md](./SUMDI_SERVICE_SPECIFIC_COMPONENTS.md)

---

## 📋 전체 TODO 체크리스트

### Phase 1: 핵심 인프라 구축 (순차 작업 필요)

#### 그룹 A: 기본 인프라 (의존성 최상위)
- [✅ 완료] **A1. Paper / Minimal Theme 구조 확정**
  - ThemeProvider 설정 및 테마 전환 로직 구현
  - 파일: `apps/my-app/app/providers/SumdiThemeProvider.tsx` (이미 구현됨, body 클래스 적용 개선)
  - 의존성: 없음
  - 예상 시간: 2-3시간
  - 완료 내용: SumdiThemeProvider가 paper/minimal 테마를 지원하며, body에도 클래스를 적용하도록 개선

- [✅ 완료] **A2. 프리텐다드 global 적용 + 고운바탕 @font-face 설정**
  - `pnpm add pretendard` 설치 (이미 설치됨)
  - 고운바탕 woff2 파일 다운로드 및 `@font-face` 설정 (이미 설정됨)
  - 파일: `apps/my-app/app/globals.css` 수정 (CSS 변수 추가 및 폰트 적용 로직 개선)
  - 의존성: 없음 (A1과 병렬 가능)
  - 예상 시간: 1-2시간
  - 완료 내용: 프리텐다드와 고운바탕 폰트 @font-face 설정 완료, CSS 변수 추가, Paper Theme에서 본문은 고운바탕, UI는 프리텐다드 적용

#### 그룹 B: 기본 컴포넌트 스타일 통일 (A 그룹 완료 후)
- [✅ 완료] **B1. Input/Textarea/Button/Card 기본 스타일 통일**
  - 패키지 컴포넌트 기본 스타일 확인 및 테마 variant 적용
  - 파일: `apps/my-app/app/components/common/` 또는 전역 스타일
  - 의존성: A1 (Theme 구조), A2 (폰트)
  - 예상 시간: 3-4시간
  - 완료 내용: CSS 변수를 통한 테마별 색상 조정 완료. Paper Theme는 크림톤/그레인 배경에 맞춘 색상, Minimal Theme는 순수 흰색/검정 배경에 맞춘 색상 적용. 패키지 컴포넌트(Input, Textarea, Button, Card)가 CSS 변수를 사용하므로 자동으로 테마에 맞게 스타일 적용됨

---

### Phase 2: 페이지별 리팩토링 (병렬 작업 가능)

#### 그룹 C: 일기 작성 관련 (B 그룹 완료 후)
- [✅ 완료] **C1. DiaryWritePage 리팩토링**
  - Paper Theme 적용, 고운바탕 본문 폰트 적용
  - 파일: `apps/my-app/app/diary/write/page.tsx`
  - 의존성: B1 (기본 컴포넌트 스타일)
  - 예상 시간: 4-5시간
  - 완료 내용: 패키지 컴포넌트(Input, Textarea, Card, Button, Badge, Progress, Icon)로 교체 완료, Paper Theme에서 본문은 고운바탕 폰트 적용, 자동저장 상태 표시 개선

#### 그룹 D: 감정 분석 관련 (B 그룹 완료 후)
- [✅ 완료] **D1. EmotionAnalysisDisplay 레이아웃 개편**
  - 패키지 Card, Grid, Container로 재구성
  - 파일: `apps/my-app/app/diary/analysis/page.tsx`
  - 의존성: B1 (기본 컴포넌트 스타일)
  - 예상 시간: 4-5시간
  - 완료 내용: 패키지 Container, Grid, Card, CardHeader, CardTitle, CardContent, Button, Icon, LoadingSpinner로 전면 리팩토링 완료. Paper Theme 적용, 본문은 고운바탕 폰트, 다크 모드 지원 추가

#### 그룹 E: 공통 컴포넌트 교체 (B 그룹 완료 후, 병렬 가능)
- [✅ 완료] **E1. MetricCard/StatsCards 패키지 컴포넌트로 교체**
  - 🟢 표시된 컴포넌트들을 직접 교체
  - 파일: 
    - `apps/my-app/app/components/hua-analysis/MetricCard.tsx`
    - `apps/my-app/app/components/dashboard/StatsCards.tsx`
  - 의존성: B1 (기본 컴포넌트 스타일)
  - 예상 시간: 2-3시간
  - 완료 내용: 이미 패키지 컴포넌트를 사용 중. MetricCard는 패키지 MetricCard를 사용하고 MetricPopover 래퍼로 기능 확장, StatsCards는 패키지 StatCard와 Grid를 사용하여 구현됨

- [✅ 완료] **E2. Empty/Loading/Error → 패키지 컴포넌트로 통일**
  - EmptyState, LoadingSpinner, Alert 교체
  - 파일:
    - `apps/my-app/app/components/common/EmptyState.tsx`
    - `apps/my-app/app/components/common/LoadingState.tsx`
    - `apps/my-app/app/components/common/ErrorMessage.tsx`
  - 의존성: B1 (기본 컴포넌트 스타일)
  - 예상 시간: 2-3시간
  - 완료 내용: 이미 패키지 컴포넌트를 사용 중. EmptyState는 DashboardEmptyState 래퍼, LoadingState는 LoadingSpinner/Skeleton 래퍼, ErrorMessage는 AlertError 래퍼로 구현되어 있음. 기존 API 호환성 유지하면서 패키지 컴포넌트 활용

#### 그룹 F: 레이아웃 컴포넌트 (B 그룹 완료 후, 병렬 가능)
- [✅ 완료] **F1. Header/BottomNavigation 재구축**
  - 패키지 Navigation, Button, Icon 활용
  - 파일:
    - `apps/my-app/app/components/layout/Header.tsx`
    - `apps/my-app/app/components/layout/BottomNavigation.tsx`
  - 의존성: B1 (기본 컴포넌트 스타일)
  - 예상 시간: 4-5시간
  - 완료 내용: NotificationButton의 알림 카운트를 Badge 컴포넌트로 교체, BottomNavigation의 네비게이션 아이템을 Button 컴포넌트로 교체하여 스타일 통일

#### 그룹 G: 일기 목록 (B 그룹 완료 후, 병렬 가능)
- [✅ 완료] **G1. DiaryList 레이아웃 최소 버전 재정렬**
  - 패키지 Grid, Card, Pagination 적용
  - 파일: `apps/my-app/app/components/diary/diary-list.tsx`
  - 의존성: B1 (기본 컴포넌트 스타일)
  - 예상 시간: 3-4시간
  - 완료 내용: 이미 패키지 컴포넌트(Grid, Card, Pagination) 사용 중. 필터/정렬 UI를 Select 컴포넌트로 추가하여 사용자 경험 개선. 필터(전체/일반 일기/나중 일기), 정렬(최신순/오래된순/제목순) 기능 추가

#### 그룹 H: 캘린더 (선택사항, B 그룹 완료 후)
- [✅ 완료] **H1. Calendar 구조 기반 설계 (UI는 간단 버전)**
  - Phase 1.5로 끌어올려 유지비 감소 (선택사항)
  - 파일: `apps/my-app/app/components/diary/diary-calendar.tsx`
  - 의존성: B1 (기본 컴포넌트 스타일)
  - 예상 시간: 5-6시간
  - 완료 내용: CalendarHeader의 버튼을 패키지 Button과 Icon(chevronLeft, chevronRight, calendar)으로 교체, 연도/월 선택을 Select 컴포넌트로 교체. CalendarSelectedDayList와 diary-calendar에 Paper Theme 클래스 적용. 전체적으로 패키지 컴포넌트 스타일 통일

---

## 🔀 병렬 작업 그룹 분할 전략

### 전략 1: 최대 병렬화 (3-4명 동시 작업)

#### Step 1: 인프라 구축 (1-2명)
- **에이전트 1**: A1 (Theme 구조) + A2 (폰트 설정) - 순차 또는 병렬 가능
- **에이전트 2**: (대기 또는 다른 작업)

#### Step 2: 기본 컴포넌트 (1명)
- **에이전트 1**: B1 (기본 컴포넌트 스타일 통일)
- **의존성**: Step 1 완료 필수

#### Step 3: 페이지 리팩토링 (3-4명 병렬)
- **에이전트 1**: C1 (DiaryWritePage)
- **에이전트 2**: D1 (EmotionAnalysisDisplay)
- **에이전트 3**: E1 (MetricCard/StatsCards) + E2 (Empty/Loading/Error)
- **에이전트 4**: F1 (Header/BottomNavigation)
- **의존성**: Step 2 완료 필수

#### Step 4: 추가 작업 (병렬 가능)
- **에이전트 1**: G1 (DiaryList)
- **에이전트 2**: H1 (Calendar) - 선택사항
- **의존성**: Step 2 완료 필수

---

### 전략 2: 안정적 병렬화 (2명 동시 작업)

#### Step 1: 인프라 구축 (1명)
- **에이전트 1**: A1 (Theme) → A2 (폰트) → B1 (기본 컴포넌트)

#### Step 2: 페이지 리팩토링 (2명 병렬)
- **에이전트 1**: C1 (DiaryWritePage) → G1 (DiaryList)
- **에이전트 2**: D1 (EmotionAnalysisDisplay) → E1 + E2 (공통 컴포넌트)
- **의존성**: Step 1 완료 필수

#### Step 3: 레이아웃 및 선택 작업 (1-2명)
- **에이전트 1**: F1 (Header/BottomNavigation)
- **에이전트 2**: H1 (Calendar) - 선택사항
- **의존성**: Step 1 완료 필수

---

## 📊 작업 우선순위 및 의존성 그래프

```
A1 (Theme 구조)
  │
  ├─→ B1 (기본 컴포넌트 스타일)
  │     │
  │     ├─→ C1 (DiaryWritePage)
  │     ├─→ D1 (EmotionAnalysisDisplay)
  │     ├─→ E1 (MetricCard/StatsCards)
  │     ├─→ E2 (Empty/Loading/Error)
  │     ├─→ F1 (Header/BottomNavigation)
  │     ├─→ G1 (DiaryList)
  │     └─→ H1 (Calendar) [선택]
  │
A2 (폰트 설정) ─┘
```

---

## 🎯 에이전트별 작업 할당 예시

### 에이전트 1: 인프라 & 일기 작성
1. A1: Theme 구조 확정
2. A2: 폰트 설정
3. B1: 기본 컴포넌트 스타일 통일
4. C1: DiaryWritePage 리팩토링
5. G1: DiaryList 레이아웃 재정렬

### 에이전트 2: 감정 분석 & 공통 컴포넌트
1. D1: EmotionAnalysisDisplay 레이아웃 개편
2. E1: MetricCard/StatsCards 교체
3. E2: Empty/Loading/Error 통일

### 에이전트 3: 레이아웃 & 네비게이션
1. F1: Header/BottomNavigation 재구축
2. H1: Calendar 구조 설계 (선택)

---

## ✅ 체크리스트 사용 가이드

1. **작업 시작 전**: 해당 그룹의 의존성이 완료되었는지 확인
2. **작업 중**: 체크리스트 항목을 `in_progress`로 표시
3. **작업 완료**: 체크리스트 항목을 `completed`로 표시
4. **병렬 작업**: 같은 Step 내 그룹은 동시에 진행 가능
5. **충돌 방지**: 같은 파일을 수정하는 경우 사전 조율 필요

---

## 📝 작업별 상세 정보

### A1. Paper / Minimal Theme 구조 확정

**파일 위치**:
- `apps/my-app/app/providers/ThemeProvider.tsx` (신규)
- `apps/my-app/app/layout.tsx` (수정)

**작업 내용**:
- ThemeProvider 컴포넌트 생성
- `paper` / `minimal` 테마 타입 정의
- `light` / `dark` 모드 지원
- 테마 전환 로직 구현
- CSS 변수 설정

**참고 문서**: `SUMDI_SERVICE_SPECIFIC_COMPONENTS.md` 939-1025줄

---

### A2. 프리텐다드 global 적용 + 고운바탕 @font-face 설정

**파일 위치**:
- `apps/my-app/app/globals.css` (수정)
- `apps/my-app/app/layout.tsx` (수정)
- `apps/my-app/public/fonts/` (폰트 파일 배치)

**작업 내용**:
```bash
# 1. 프리텐다드 설치
pnpm add pretendard

# 2. 고운바탕 다운로드
# GitHub: https://github.com/yangheeryu/Gowun-Batang
# fonts/ttf/ 디렉토리에서 TTF 파일 다운로드
```

**CSS 설정**:
- 프리텐다드 global 적용
- 고운바탕 @font-face 설정
- Paper Theme: 본문은 고운바탕, UI는 프리텐다드
- Minimal Theme: 모든 텍스트 프리텐다드

**참고 문서**: `SUMDI_SERVICE_SPECIFIC_COMPONENTS.md` 1028-1122줄

---

### B1. Input/Textarea/Button/Card 기본 스타일 통일

**파일 위치**:
- `apps/my-app/app/components/common/` (신규 또는 수정)
- 또는 전역 스타일 파일

**작업 내용**:
- 패키지 컴포넌트 import 확인
- 테마 variant 적용 (paper/minimal)
- 기본 스타일 오버라이드 (필요시)
- 스타일 가이드 문서화

**패키지 컴포넌트**:
```typescript
import { Input, Textarea, Button, Card } from '@hua-labs/ui';
```

---

### C1. DiaryWritePage 리팩토링

**파일 위치**:
- `apps/my-app/app/diary/write/page.tsx`
- `apps/my-app/app/components/diary/DiaryEditor.tsx` (관련)

**작업 내용**:
- 패키지 `Input`, `Textarea`로 교체
- 패키지 `Card`로 레이아웃 구조 개선
- 패키지 `Badge`로 저장 상태 표시
- 패키지 `Progress`로 자동 저장 인디케이터
- Paper Theme 적용
- 본문은 고운바탕, UI는 프리텐다드

**참고 문서**: `SUMDI_SERVICE_SPECIFIC_COMPONENTS.md` 142-164줄

---

### D1. EmotionAnalysisDisplay 레이아웃 개편

**파일 위치**:
- `apps/my-app/app/diary/analysis/page.tsx`
- `apps/my-app/app/components/diary/emotion-analysis.tsx`

**작업 내용**:
- 패키지 `Container`로 페이지 너비 및 여백 통일
- 패키지 `Grid`로 카드 레이아웃 재구성
- 패키지 `Card`로 모든 섹션 스타일 통일
- 패키지 `Button`으로 액션 버튼 그룹 스타일 개선
- 반응형 레이아웃 개선
- Paper Theme 적용

**참고 문서**: `SUMDI_SERVICE_SPECIFIC_COMPONENTS.md` 202-212줄

---

### E1. MetricCard/StatsCards 패키지 컴포넌트로 교체

**파일 위치**:
- `apps/my-app/app/components/hua-analysis/MetricCard.tsx`
- `apps/my-app/app/components/dashboard/StatsCards.tsx`

**작업 내용**:
- 패키지 `MetricCard`로 직접 교체
- 패키지 `StatCard`로 교체
- 기존 커스텀 스타일을 패키지 컴포넌트 props로 마이그레이션

**참고 문서**: `SUMDI_SERVICE_SPECIFIC_COMPONENTS.md` 235-247줄, 355-363줄

---

### E2. Empty/Loading/Error → 패키지 컴포넌트로 통일

**파일 위치**:
- `apps/my-app/app/components/common/EmptyState.tsx`
- `apps/my-app/app/components/common/LoadingState.tsx`
- `apps/my-app/app/components/common/ErrorMessage.tsx`

**작업 내용**:
- 패키지 `DashboardEmptyState` 또는 범용 `EmptyState`로 교체
- 패키지 `LoadingSpinner`로 스피너 교체
- 패키지 `Skeleton`으로 스켈레톤 로딩 교체
- 패키지 `Alert`, `AlertError`로 에러 메시지 교체

**참고 문서**: `SUMDI_SERVICE_SPECIFIC_COMPONENTS.md` 533-559줄

---

### F1. Header/BottomNavigation 재구축

**파일 위치**:
- `apps/my-app/app/components/layout/Header.tsx`
- `apps/my-app/app/components/layout/BottomNavigation.tsx`

**작업 내용**:
- 패키지 `Navigation`으로 네비게이션 구조 재구성
- 패키지 `Avatar`로 프로필 이미지 스타일 통일
- 패키지 `Badge`로 알림 카운트 디자인 개선
- 패키지 `Dropdown`으로 프로필 메뉴 스타일 통일
- 패키지 `Button`, `Icon`으로 모든 버튼 스타일 통일

**참고 문서**: `SUMDI_SERVICE_SPECIFIC_COMPONENTS.md` 419-451줄

---

### G1. DiaryList 레이아웃 최소 버전 재정렬

**파일 위치**:
- `apps/my-app/app/components/diary/diary-list.tsx`

**작업 내용**:
- 패키지 `Grid`로 카드 그리드 레이아웃 재구성
- 패키지 `Card`로 일기 카드 디자인 통일
- 패키지 `Select`로 필터/정렬 UI 개선
- 패키지 `Pagination`으로 페이지네이션 스타일 통일
- 패키지 `EmptyState`로 빈 상태 디자인 개선

**참고 문서**: `SUMDI_SERVICE_SPECIFIC_COMPONENTS.md` 270-291줄

---

### H1. Calendar 구조 기반 설계 (선택사항)

**파일 위치**:
- `apps/my-app/app/components/diary/diary-calendar.tsx`
- `apps/my-app/app/components/calendar/CalendarGrid.tsx` (신규)
- `apps/my-app/app/components/calendar/CalendarDayCell.tsx` (신규)

**작업 내용**:
- 패키지 `Card`로 캘린더 컨테이너 스타일 통일
- 패키지 `Button`으로 날짜 셀 디자인 개선
- 패키지 `Badge`로 감정 인디케이터 스타일 통일
- UI는 간단 버전으로 구현 (Phase 1.5)

**참고 문서**: `SUMDI_SERVICE_SPECIFIC_COMPONENTS.md` 293-332줄

---

## 🚀 빠른 시작 가이드

### 에이전트 1 (인프라 담당)
```bash
# 1. Theme 구조 작업
cd apps/my-app
# ThemeProvider.tsx 생성 및 설정

# 2. 폰트 설정
pnpm add pretendard
# 고운바탕 TTF 다운로드 및 @font-face 설정

# 3. 기본 컴포넌트 스타일 통일
# Input, Textarea, Button, Card 스타일 확인 및 적용
```

### 에이전트 2 (페이지 리팩토링 담당)
```bash
# B1 완료 대기 후 시작
# C1, D1, E1, E2 중 할당받은 작업 진행
```

### 에이전트 3 (레이아웃 담당)
```bash
# B1 완료 대기 후 시작
# F1, G1, H1 중 할당받은 작업 진행
```

---

## 📌 주의사항

1. **의존성 확인**: 각 작업 시작 전 의존 그룹 완료 여부 확인 필수
2. **파일 충돌**: 같은 파일 수정 시 사전 조율 필요
3. **테스트**: 각 작업 완료 후 해당 페이지/컴포넌트 테스트 필수
4. **커밋**: 작업 단위별로 커밋 (예: "feat: Theme 구조 확정")
5. **문서 업데이트**: 작업 완료 시 관련 문서 업데이트

---

**문서 버전**: 1.0  
**최종 업데이트**: 2025-12-05  
**기반 문서**: [SUMDI_SERVICE_SPECIFIC_COMPONENTS.md](./SUMDI_SERVICE_SPECIFIC_COMPONENTS.md)

