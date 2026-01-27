# 프론트엔드 아키텍처

> 작성일: 2025-12-16  
> 최종 업데이트: 2025-12-16  
> 실제 구현 기반 상세 문서

## 개요

숨다이어리 서비스는 **Next.js 16.0.10 App Router**와 **React 19.2.1**을 기반으로 프론트엔드를 구현합니다. 이 문서는 실제 구현 코드를 기반으로 프론트엔드 아키텍처의 상세한 구조를 설명합니다.

**핵심 원칙:**
- 컴포넌트 기반 설계
- 커스텀 훅 패턴
- Zustand 상태 관리
- Server/Client 컴포넌트 분리
- PWA 지원

---

## 1. 프론트엔드 구조

### 1.1 디렉토리 구조

```
app/
├── layout.tsx                    # 루트 레이아웃
├── page.tsx                      # 홈 페이지
├── components/                   # 재사용 가능한 컴포넌트
│   ├── common/                   # 공통 컴포넌트
│   ├── layout/                   # 레이아웃 컴포넌트
│   ├── diary/                    # 일기 관련 컴포넌트
│   ├── calendar/                 # 캘린더 컴포넌트
│   ├── hua-analysis/             # HUA 분석 컴포넌트
│   └── ...
├── hooks/                        # 커스텀 훅
│   ├── auth/                     # 인증 관련 훅
│   ├── diary/                    # 일기 관련 훅
│   ├── header/                   # 헤더 관련 훅
│   └── ...
├── store/                        # Zustand 스토어
│   ├── useAppStore.ts            # 앱 전역 상태
│   └── diary-store.ts            # 일기 상태
├── diary/
│   ├── write/                    # 일기 작성 페이지
│   │   ├── page.tsx
│   │   ├── hooks/                # 일기 작성 관련 훅
│   │   └── components/           # 일기 작성 컴포넌트
│   └── [id]/page.tsx             # 일기 상세 페이지
└── ...
```

### 1.2 구현 위치

**주요 디렉토리:**
- `app/components/`: 재사용 가능한 컴포넌트
- `app/hooks/`: 커스텀 훅
- `app/store/`: Zustand 상태 관리
- `app/diary/`: 일기 관련 페이지 및 컴포넌트

---

## 2. 컴포넌트 구조

### 2.1 컴포넌트 분류

**공통 컴포넌트 (`components/common/`):**
- `EmptyState.tsx`: 빈 상태 표시
- `LoadingState.tsx`: 로딩 상태 표시
- `ErrorMessage.tsx`: 에러 메시지
- `StatsCard.tsx`: 통계 카드
- `NotificationCard.tsx`: 알림 카드
- `JailbreakNotice.tsx`: 탈옥 시도 알림

**레이아웃 컴포넌트 (`components/layout/`):**
- `Header.tsx`: 헤더
- `Footer.tsx`: 푸터
- `BottomNavigation.tsx`: 하단 네비게이션
- `HeaderComponents/`: 헤더 하위 컴포넌트
  - `DesktopNav.tsx`: 데스크톱 네비게이션
  - `MobileMenu.tsx`: 모바일 메뉴
  - `ProfilePopover.tsx`: 프로필 팝오버
  - `NotificationButton.tsx`: 알림 버튼

**일기 컴포넌트 (`components/diary/`):**
- `Dashboard.tsx`: 일기 대시보드
- `diary-calendar.tsx`: 캘린더 뷰
- `diary-list.tsx`: 리스트 뷰
- `emotion-analysis.tsx`: 감정 분석 표시
- `share-button.tsx`: 공유 버튼

**캘린더 컴포넌트 (`components/calendar/`):**
- `CalendarGrid.tsx`: 캘린더 그리드
- `CalendarDayCell.tsx`: 날짜 셀
- `CalendarHeader.tsx`: 캘린더 헤더
- `CalendarSelectedDayList.tsx`: 선택된 날짜 목록

**HUA 분석 컴포넌트 (`components/hua-analysis/`):**
- `MetricsModal.tsx`: 메트릭 모달
- `MetricCard.tsx`: 메트릭 카드
- `SentimentScoreCard.tsx`: 감정 점수 카드
- `DominantEmotionSection.tsx`: 주요 감정 섹션
- `ReasoningSection.tsx`: 분석 근거 섹션

### 2.2 컴포넌트 패턴

**Server Component:**
- 기본적으로 Server Component
- 데이터 페칭
- SEO 최적화

**Client Component:**
- `'use client'` 지시어 사용
- 인터랙티브 기능
- 상태 관리
- 브라우저 API 사용

---

## 3. 커스텀 훅 패턴

### 3.1 훅 분류

**인증 관련 (`hooks/auth/`):**
- `useSocialAuth.ts`: 소셜 로그인
- `useRegisterForm.ts`: 회원가입 폼
- `usePasswordValidation.ts`: 비밀번호 검증

**일기 관련 (`hooks/diary/`):**
- `useDiaryDelete.ts`: 일기 삭제
- `useDiaryFilters.ts`: 일기 필터링
- `useDiaryMenu.ts`: 일기 메뉴

**헤더 관련 (`hooks/header/`):**
- `useHeaderScroll.ts`: 헤더 스크롤 감지
- `useAdminCheck.ts`: 관리자 확인
- `useBackNavigation.ts`: 뒤로가기 네비게이션
- `useKeyboardShortcuts.ts`: 키보드 단축키

**일기 작성 관련 (`diary/write/hooks/`):**
- `useAutoSave.ts`: 자동 저장
- `useNetworkSync.ts`: 네트워크 동기화
- `useDraftManagement.ts`: 임시저장 관리
- `usePostSaveCleanup.ts`: 저장 후 정리

### 3.2 훅 패턴

**데이터 페칭 훅:**
```typescript
export function useDiaryStats(userId: string) {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    fetch(`/api/user/stats?userId=${userId}`)
      .then(res => res.json())
      .then(data => setStats(data));
  }, [userId]);
  
  return stats;
}
```

**상태 관리 훅:**
```typescript
export function useAutoSave(props: UseAutoSaveProps) {
  const { content, diaryDate, isOnline } = props;
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isOnline) {
        saveDraft(content, diaryDate);
      } else {
        offlineStorage.saveDraft({...});
      }
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [content, diaryDate, isOnline]);
}
```

---

## 4. 상태 관리

### 4.1 Zustand 스토어

**구현 위치:** `app/store/`

**주요 스토어:**

**useAppStore:**
- 테마 관리
- 언어 설정
- 토스트 알림
- 로딩 상태
- 스크롤 상태

**useDiaryStore:**
- 일기 목록
- 현재 일기
- 임시저장
- 게스트 사용량
- 뷰 모드 (list/calendar)

### 4.2 상태 관리 패턴

**Zustand with Persist:**
```typescript
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      // ...
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

**특징:**
- LocalStorage 자동 동기화
- 하이드레이션 지원
- 타입 안전성

---

## 5. 페이지 구조

### 5.1 페이지 라우팅

**App Router 기반:**
- 파일 시스템 기반 라우팅
- 동적 라우트: `[id]`
- 중첩 라우트 지원

**주요 페이지:**
- `/`: 홈 (대시보드)
- `/diary`: 일기 목록
- `/diary/write`: 일기 작성
- `/diary/[id]`: 일기 상세
- `/search`: 검색
- `/profile`: 프로필
- `/settings`: 설정

### 5.2 레이아웃 구조

**루트 레이아웃 (`layout.tsx`):**
```typescript
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          <SumdiThemeProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            <BottomNavigation />
          </SumdiThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
```

**Providers:**
- NextAuth SessionProvider
- Zustand 스토어
- 테마 프로바이더
- Icon 프로바이더

---

## 6. 일기 작성 페이지

### 6.1 페이지 구조

**구현 위치:** `app/diary/write/page.tsx`

**주요 기능:**
- 일기 작성
- 자동 저장 (5초마다)
- 오프라인 지원
- 임시저장 관리
- 날짜 선택
- 수정 모드

**커스텀 훅:**
- `useAutoSave`: 자동 저장
- `useNetworkSync`: 네트워크 동기화
- `useDraftManagement`: 임시저장 관리

### 6.2 자동 저장 플로우

```
사용자 입력
    ↓
내용 변경 감지
    ↓
5초 대기 (debounce)
    ↓
네트워크 상태 확인
    ├─ 온라인: DB에 저장
    └─ 오프라인: IndexedDB에 저장
    ↓
저장 상태 업데이트
    ├─ saved: 저장 완료
    ├─ saving: 저장 중
    └─ unsaved: 저장되지 않음
```

---

## 7. 컴포넌트 설계 원칙

### 7.1 컴포넌트 분리

**원칙:**
- 단일 책임 원칙
- 재사용 가능성
- Props 인터페이스 명확화

**예시:**
```typescript
// 공통 컴포넌트
<EmptyState 
  title="일기가 없습니다"
  message="첫 일기를 작성해보세요"
  action={<Button>일기 작성</Button>}
/>

// 일기 컴포넌트
<DiaryCard 
  diary={diary}
  onDelete={handleDelete}
  onEdit={handleEdit}
/>
```

### 7.2 컴포넌트 조합

**패턴:**
- Container/Presentational 분리
- Compound Components
- Render Props (필요 시)

---

## 8. 스타일링

### 8.1 Tailwind CSS

**사용:**
- 유틸리티 기반 스타일링
- 반응형 디자인
- 다크 모드 지원

### 8.2 테마 시스템

**구현 위치:** `app/providers/SumdiThemeProvider.tsx`

**테마 스타일:**
- `paper`: 종이 느낌
- `modern`: 모던 스타일

**테마 모드:**
- `light`: 라이트 모드
- `dark`: 다크 모드
- `system`: 시스템 설정 따름

---

## 9. 구현 상세

### 9.1 주요 컴포넌트

**레이아웃:**
- `Header`: 헤더 컴포넌트
- `Footer`: 푸터 컴포넌트
- `BottomNavigation`: 하단 네비게이션

**일기:**
- `DiaryCard`: 일기 카드
- `DiaryCalendar`: 캘린더 뷰
- `DiaryList`: 리스트 뷰
- `EmotionAnalysis`: 감정 분석 표시

**공통:**
- `EmptyState`: 빈 상태
- `LoadingState`: 로딩 상태
- `ErrorMessage`: 에러 메시지

### 9.2 주요 훅

**인증:**
- `useSocialAuth()`: 소셜 로그인
- `useRegisterForm()`: 회원가입 폼

**일기:**
- `useDiaryDelete()`: 일기 삭제
- `useDiaryFilters()`: 필터링

**일기 작성:**
- `useAutoSave()`: 자동 저장
- `useNetworkSync()`: 네트워크 동기화
- `useDraftManagement()`: 임시저장 관리

---

## 10. 성능 최적화

### 10.1 코드 스플리팅

**전략:**
- 동적 import
- React.lazy
- 페이지별 분리

### 10.2 메모이제이션

**전략:**
- `React.memo`로 컴포넌트 메모이제이션
- `useMemo`로 값 메모이제이션
- `useCallback`로 함수 메모이제이션

### 10.3 이미지 최적화

**전략:**
- Next.js Image 컴포넌트
- 자동 최적화
- Lazy loading

---

## 11. PWA 지원

### 11.1 Service Worker

**구현 위치:** `app/components/service/ServiceWorkerRegistration.tsx`

**기능:**
- 오프라인 지원
- 백그라운드 동기화
- 캐싱

### 11.2 PWA 설치 프롬프트

**구현 위치:** `app/components/service/PWAInstallPrompt.tsx`

**기능:**
- 설치 프롬프트 표시
- 설치 상태 관리

---

## 12. 참고 자료

### 관련 코드 파일
- `app/components/`: 모든 컴포넌트
- `app/hooks/`: 모든 커스텀 훅
- `app/store/`: Zustand 스토어
- `app/diary/write/`: 일기 작성 페이지

### 관련 문서
- [오프라인 및 동기화 시스템](./OFFLINE_SYNC_SYSTEM.md)
- [API 레이어](./API_LAYER.md)

---

## 13. 향후 개선 계획

### 13.1 계획된 개선사항

1. **컴포넌트 라이브러리화**
   - 공통 컴포넌트 패키지화
   - Storybook 문서화

2. **성능 최적화**
   - 가상화 (Virtualization)
   - 이미지 최적화
   - 번들 크기 최적화

3. **접근성 개선**
   - ARIA 속성 추가
   - 키보드 네비게이션
   - 스크린 리더 지원

---

**작성일**: 2025-12-16  
**최종 업데이트**: 2025-12-16
