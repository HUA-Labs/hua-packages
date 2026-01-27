# 컴포넌트 재구성 계획

> 최종 업데이트: 2025-11-07

## 현재 상황

### 현재 컴포넌트 구조

#### Layout 컴포넌트 (루트)
- `Header.tsx` - layout.tsx에서 사용
- `Footer.tsx` - layout.tsx에서 사용
- `BottomNavigation.tsx` - layout.tsx에서 사용
- `providers.tsx` - layout.tsx에서 사용
- `theme-provider.tsx` - layout.tsx에서 사용
- `ThemeToggle.tsx` - Header.tsx에서 사용

#### Diary 컴포넌트
- `Dashboard.tsx` - page.tsx (대시보드)에서 사용
- `diary-calendar.tsx` - diary/components/DiaryContent.tsx에서 사용
- `diary-list.tsx` - diary/components/DiaryContent.tsx에서 사용
- `emotion-analysis.tsx` - analysis/page.tsx에서 사용
- `share-button.tsx` - diary/analysis/components/AnalysisContent.tsx에서 사용

#### Modal 컴포넌트
- `GuestLimitModal.tsx` - diary/write/page.tsx에서 사용
- `ProviderSettingsModal.tsx` - diary/write/page.tsx에서 사용
- `TermsModal.tsx` - auth/register/page.tsx에서 사용
- `SearchModal.tsx` - Header.tsx에서 사용

#### Search 컴포넌트
- `search-highlight.tsx` - diary-list.tsx, diary-list/QuestionCard.tsx에서 사용

#### Service/Utility 컴포넌트
- `NetworkStatus.tsx` - diary/write/page.tsx에서 사용
- `PWAInstallPrompt.tsx` - layout.tsx에서 사용
- `ServiceWorkerRegistration.tsx` - layout.tsx에서 사용

### 미정리 컴포넌트

- `floating-action-button.tsx` - 루트에 위치 (정리 필요)

---

## 목표 구조

```
components/
 layout/              # 레이아웃 컴포넌트
    Header.tsx
    Footer.tsx
    BottomNavigation.tsx
    providers.tsx    # Providers 레이아웃 래퍼

 theme/               # 테마 관련
    theme-provider.tsx
    ThemeToggle.tsx

 diary/               # 일기 관련
    Dashboard.tsx   # Dashboard 컴포넌트
    diary-calendar.tsx
    diary-list.tsx
    emotion-analysis.tsx
    share-button.tsx

 modal/               # 모달 컴포넌트
    GuestLimitModal.tsx
    ProviderSettingsModal.tsx
    TermsModal.tsx
    SearchModal.tsx

 search/              # 검색 관련
    search-highlight.tsx

 service/             # 서비스/유틸리티
    NetworkStatus.tsx
    PWAInstallPrompt.tsx
    ServiceWorkerRegistration.tsx

 common/              # 공통 컴포넌트 (기존)
    EmptyState.tsx
    ErrorMessage.tsx
    LoadingState.tsx
    NotificationCard.tsx
    StatsCard.tsx

 dashboard/           # 대시보드 전용 (기존)
    EmptyState.tsx
    QuickActions.tsx
    RecentDiaries.tsx
    StatsCards.tsx

 diary-list/          # 일기 목록 전용 (기존)
    AnalysisCard.tsx
    EmptyState.tsx
    QuestionCard.tsx

 calendar/            # 캘린더 전용 (기존)
     CalendarDayCell.tsx
     CalendarGrid.tsx
     CalendarHeader.tsx
     CalendarSelectedDayList.tsx
```

---

## 재구성 계획

### Phase 1: 컴포넌트 이동

1. **layout/** 폴더 생성 및 이동
   - Header.tsx → layout/Header.tsx
   - Footer.tsx → layout/Footer.tsx
   - BottomNavigation.tsx → layout/BottomNavigation.tsx
   - providers.tsx → layout/providers.tsx

2. **theme/** 폴더 생성 및 이동
   - theme-provider.tsx → theme/theme-provider.tsx
   - ThemeToggle.tsx → theme/ThemeToggle.tsx

3. **diary/** 폴더 정리 (대시보드 관련, Dashboard.tsx 포함)
   - Dashboard.tsx → diary/Dashboard.tsx
   - diary-calendar.tsx → diary/diary-calendar.tsx (diary-list와 분리)
   - diary-list.tsx → diary/diary-list.tsx
   - emotion-analysis.tsx → diary/emotion-analysis.tsx
   - share-button.tsx → diary/share-button.tsx

4. **modal/** 폴더 생성 및 이동
   - GuestLimitModal.tsx → modal/GuestLimitModal.tsx
   - ProviderSettingsModal.tsx → modal/ProviderSettingsModal.tsx
   - TermsModal.tsx → modal/TermsModal.tsx
   - SearchModal.tsx → modal/SearchModal.tsx

5. **search/** 폴더 생성 및 이동
   - search-highlight.tsx → search/search-highlight.tsx

6. **service/** 폴더 생성 및 이동
   - NetworkStatus.tsx → service/NetworkStatus.tsx
   - PWAInstallPrompt.tsx → service/PWAInstallPrompt.tsx
   - ServiceWorkerRegistration.tsx → service/ServiceWorkerRegistration.tsx

### Phase 2: Import 경로 수정

모든 파일에서 import 경로를 업데이트합니다.

---

## 주의사항

### 중복 컴포넌트
- `common/EmptyState.tsx`와 `dashboard/EmptyState.tsx`는 용도가 다르므로 유지
- 각 폴더별로 특화된 EmptyState 컴포넌트 사용

### Import 경로 수정
- 모든 import 경로를 새로운 구조에 맞게 수정
- TypeScript 타입 체크로 누락 확인

---

## 체크리스트

- [ ] layout/ 폴더 생성 및 컴포넌트 이동
- [ ] theme/ 폴더 생성 및 컴포넌트 이동
- [ ] diary/ 폴더 정리 및 컴포넌트 이동
- [ ] modal/ 폴더 생성 및 컴포넌트 이동
- [ ] search/ 폴더 생성 및 컴포넌트 이동
- [ ] service/ 폴더 생성 및 컴포넌트 이동
- [ ] layout.tsx import 경로 수정
- [ ] page.tsx import 경로 수정
- [ ] diary/components/DiaryContent.tsx import 경로 수정
- [ ] analysis/page.tsx import 경로 수정
- [ ] diary/write/page.tsx import 경로 수정
- [ ] auth/register/page.tsx import 경로 수정
- [ ] Header.tsx import 경로 수정
- [ ] floating-action-button.tsx 위치 결정 및 이동
- [ ] TypeScript 타입 체크
- [ ] 빌드 테스트

---

**최종 업데이트**: 2025-11-07
