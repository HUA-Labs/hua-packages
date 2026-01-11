# HUA UI 아키텍처 문서

**작성일**: 2026-01-11
**버전**: 1.1.0

---

## 목차

1. [개요](#개요)
2. [패키지 구조](#패키지-구조)
3. [엔트리 포인트 시스템](#엔트리-포인트-시스템)
4. [컴포넌트 아키텍처](#컴포넌트-아키텍처)
5. [스타일 시스템](#스타일-시스템)
6. [아이콘 시스템](#아이콘-시스템)
7. [빌드 시스템](#빌드-시스템)
8. [의존성 관리](#의존성-관리)
9. [개발 가이드](#개발-가이드)

---

## 개요

### 설계 원칙

HUA UI는 다음 원칙에 따라 설계되었습니다:

1. **DX 우선 (Developer Experience First)**
   - Core에서 대부분의 일반적인 앱 개발이 가능해야 함
   - 직관적인 API와 명확한 타입 정의

2. **번들 크기 최적화**
   - Tree-shaking 지원
   - 모듈러 엔트리 포인트로 선택적 import
   - Core 90% / Subpackages 10% 구도

3. **접근성 (A11y)**
   - ARIA 속성 지원
   - 키보드 네비게이션
   - 스크린 리더 호환

4. **타입 안정성**
   - 완전한 TypeScript 지원
   - 엄격한 타입 체크

5. **확장성**
   - 컴포넌트 조합 가능
   - 커스터마이징 용이
   - 테마 시스템 지원

---

## 패키지 구조

```
packages/hua-ui/
├── src/
│   ├── index.ts              # Core 엔트리 포인트
│   ├── form.ts                # Form 서브패키지
│   ├── navigation.ts          # Navigation 서브패키지
│   ├── feedback.ts            # Feedback 서브패키지
│   ├── advanced.ts            # Advanced 엔트리 포인트
│   ├── advanced/
│   │   ├── dashboard.ts      # Dashboard 서브패키지
│   │   └── motion.ts         # Motion 서브패키지
│   ├── components/           # 컴포넌트 소스
│   │   ├── dashboard/       # Dashboard 컴포넌트
│   │   ├── advanced/        # Advanced 컴포넌트
│   │   └── Icon/            # Icon 시스템
│   ├── lib/                  # 유틸리티 및 헬퍼
│   │   ├── utils.ts         # 공용 유틸리티
│   │   ├── icons.ts         # 아이콘 정의
│   │   ├── icon-providers.ts # 아이콘 프로바이더
│   │   └── styles/          # 스타일 유틸리티
│   ├── hooks/                # 커스텀 훅
│   └── styles/              # CSS 파일
├── dist/                     # 빌드 출력
├── docs/                     # 문서
├── scripts/                  # 빌드 스크립트
├── package.json
├── tsup.config.ts           # 빌드 설정
└── tsconfig.json            # TypeScript 설정
```

---

## 엔트리 포인트 시스템

### Core (`@hua-labs/ui`)

**목적**: 대부분의 일반적인 앱 개발에 필요한 컴포넌트

**포함 내용**:
- UI 핵심 요소 (Button, Input, Select, Link, Icon, Avatar)
- 레이아웃 (Container, Grid, Stack, Divider, Card, Panel)
- 데이터 표시 (Table, Badge, Progress, Skeleton)
- 피드백 (Alert, Tooltip, LoadingSpinner)
- 오버레이 (Modal, Popover, Dropdown, Drawer, BottomSheet)
- 인터랙티브 (Tabs, Accordion, Menu, Command, ContextMenu)
- 네비게이션 (Breadcrumb, Pagination, Navigation)
- 스크롤 (ScrollArea, ScrollToTop, ScrollIndicator, ScrollProgress)
- 테마 (ThemeProvider, ThemeToggle)
- 유틸리티 (merge, formatRelativeTime 등)

**특징**:
- 가장 자주 사용되는 컴포넌트 포함
- 하위 호환성 유지 (서브패키지 컴포넌트도 포함)

---

### Form (`@hua-labs/ui/form`)

**목적**: 폼 관련 컴포넌트만 필요한 경우 번들 크기 최적화

**포함 내용**:
- Form 구조 (Form, FormField, FormGroup)
- 기본 입력 (Input, Textarea, Label)
- 선택 입력 (Select, Checkbox, Radio, Switch, Slider)
- 고급 입력 (DatePicker, Upload, Autocomplete)

**특징**:
- 폼 컴포넌트만 포함하여 번들 크기 최적화
- Core에서도 여전히 사용 가능 (하위 호환성)

---

### Navigation (`@hua-labs/ui/navigation`)

**목적**: 대규모 앱 구조에 필요한 네비게이션 컴포넌트

**포함 내용**:
- PageNavigation
- PageTransition

**특징**:
- 대규모 앱에서만 필요
- 사용 빈도가 낮아 분리

---

### Feedback (`@hua-labs/ui/feedback`)

**목적**: 글로벌 상태 관리가 필요한 Toast 컴포넌트

**포함 내용**:
- ToastProvider
- useToast
- Toast 타입

**특징**:
- Provider 패턴이므로 분리해도 무방
- CSS 파일은 별도 import 필요 (`@hua-labs/ui/styles/toast.css`)

---

### Advanced (`@hua-labs/ui/advanced`)

**목적**: 고급 기능 및 특수 도메인 컴포넌트

**서브패키지**:

#### Dashboard (`@hua-labs/ui/advanced/dashboard`)
- StatCard, MetricCard, SummaryCard
- TransactionsTable, TrendChart, BarChart
- DashboardSidebar, DashboardToolbar
- ActivityFeed, NotificationCard
- 기타 Dashboard 위젯

#### Motion (`@hua-labs/ui/advanced/motion`)
- AdvancedPageTransition
- usePageTransition
- usePageTransitionManager

**특징**:
- 특수 도메인에 특화된 컴포넌트
- 일반적인 앱에서는 필요 없을 수 있음

---

## 컴포넌트 아키텍처

### 컴포넌트 분류

#### 1. 기본 UI 컴포넌트
- **Button**: 다양한 variant와 size 지원
- **Input**: 폼 입력 필드
- **Link**: 네비게이션 링크
- **Icon**: 다중 아이콘 라이브러리 지원
- **Avatar**: 사용자 아바타

#### 2. 레이아웃 컴포넌트
- **Container**: 컨테이너 래퍼
- **Grid**: 그리드 레이아웃
- **Stack**: 스택 레이아웃
- **Card**: 카드 컨테이너
- **Panel**: 고급 패널 컴포넌트

#### 3. 폼 컴포넌트
- **Form**: 폼 구조 관리
- **Input, Select, Checkbox, Radio, Switch**: 기본 입력
- **DatePicker, Upload, Autocomplete**: 고급 입력

#### 4. 데이터 표시 컴포넌트
- **Table**: 테이블
- **Badge**: 배지
- **Progress**: 진행률 표시
- **Skeleton**: 로딩 스켈레톤

#### 5. 피드백 컴포넌트
- **Alert**: 알림 메시지
- **Toast**: 글로벌 토스트 메시지
- **Tooltip**: 툴팁
- **LoadingSpinner**: 로딩 스피너

#### 6. 오버레이 컴포넌트
- **Modal**: 모달 다이얼로그
- **Drawer**: 사이드 패널
- **BottomSheet**: 하단 시트
- **Popover**: 팝오버
- **Dropdown**: 드롭다운 메뉴

#### 7. 인터랙티브 컴포넌트
- **Tabs**: 탭 네비게이션
- **Accordion**: 아코디언
- **Menu**: 메뉴
- **Command**: 명령 팔레트
- **ContextMenu**: 컨텍스트 메뉴

---

### 컴포넌트 설계 패턴

#### 1. Compound Components
여러 하위 컴포넌트로 구성되는 패턴:

```tsx
// Card 예시
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

#### 2. Controlled/Uncontrolled
상태 제어 방식 선택 가능:

```tsx
// Controlled
<Input value={value} onChange={setValue} />

// Uncontrolled
<Input defaultValue="initial" />
```

#### 3. Polymorphic Components
다양한 HTML 요소로 렌더링 가능:

```tsx
<Button as="a" href="/link">Link Button</Button>
```

#### 4. Provider Pattern
글로벌 상태 관리:

```tsx
<ToastProvider>
  <App />
</ToastProvider>
```

---

## 스타일 시스템

### Tailwind CSS 기반

모든 컴포넌트는 Tailwind CSS를 사용하여 스타일링됩니다.

### 유틸리티 함수

#### `merge`
클래스 병합 유틸리티 (clsx + tailwind-merge):

```tsx
import { merge } from '@hua-labs/ui';

const className = merge("px-2 py-1", "px-4"); // "py-1 px-4"
```

#### `mergeIf`
조건부 클래스 병합:

```tsx
import { mergeIf } from '@hua-labs/ui';

const className = mergeIf(isActive, "bg-blue-500", "bg-gray-200");
```

#### `mergeMap`
객체 기반 클래스 병합:

```tsx
import { mergeMap } from '@hua-labs/ui';

const className = mergeMap({
  "bg-blue-500": isPrimary,
  "text-white": true,
  "opacity-50": isDisabled
});
```

### 다크 모드 지원

모든 컴포넌트는 `dark:` 접두사를 사용하여 다크 모드를 지원합니다.

```tsx
className="bg-white dark:bg-gray-800"
```

### 테마 시스템

`ThemeProvider`를 통해 테마를 관리합니다:

```tsx
<ThemeProvider defaultTheme="system" enableSystem>
  <App />
</ThemeProvider>
```

---

## 아이콘 시스템

### 지원 라이브러리

1. **Lucide React** (기본, 포함됨)
2. **Phosphor Icons** (선택사항, `@phosphor-icons/react` 필요)

### Icon 컴포넌트

```tsx
import { Icon } from '@hua-labs/ui';

// Lucide 아이콘 (기본)
<Icon name="heart" />

// Phosphor 아이콘
<Icon name="heart" provider="phosphor" />
```

### IconProvider

글로벌 아이콘 설정:

```tsx
<IconProvider defaultProvider="lucide">
  <App />
</IconProvider>
```

### 아이콘 타입

- **EmotionIcon**: 감정 아이콘
- **StatusIcon**: 상태 아이콘
- **LoadingIcon**: 로딩 아이콘
- **SuccessIcon**: 성공 아이콘
- **ErrorIcon**: 에러 아이콘

---

## 빌드 시스템

### tsup

빌드 도구로 `tsup`을 사용합니다.

**특징**:
- ESM + CJS 이중 빌드
- Tree-shaking 지원
- TypeScript 타입 정의 자동 생성
- 코드 스플리팅 (ESM)

### 빌드 설정

```typescript
// tsup.config.ts
const entry = {
  index: 'src/index.ts',
  form: 'src/form.ts',
  navigation: 'src/navigation.ts',
  feedback: 'src/feedback.ts',
  advanced: 'src/advanced.ts',
  'advanced-dashboard': 'src/advanced/dashboard.ts',
  'advanced-motion': 'src/advanced/motion.ts',
};
```

### 빌드 명령어

```bash
# 빌드
pnpm build

# 개발 모드 (watch)
pnpm dev

# 번들 분석
pnpm build:analyze
```

---

## 의존성 관리

### 필수 의존성

- `react` (>=19.0.0)
- `react-dom` (>=19.0.0)

### 선택적 의존성

- `@phosphor-icons/react` - Phosphor 아이콘 지원

### 내부 의존성

- `@hua-labs/motion` - 모션 애니메이션 (Advanced 컴포넌트)
- `clsx` - 클래스 병합
- `tailwind-merge` - Tailwind 클래스 병합
- `lucide-react` - 기본 아이콘 라이브러리

### 의존성 규칙

1. **Core → 서브패키지**: 불가능 (순환 의존성 방지)
2. **서브패키지 → Core**: 가능
3. **서브패키지 간**: 불가능 (순환 의존성 방지)

---

## 개발 가이드

### 컴포넌트 추가

1. `src/components/`에 컴포넌트 파일 생성
2. 적절한 엔트리 포인트에 export 추가
3. TypeScript 타입 정의
4. JSDoc 문서 작성 (한영 병기)
5. 접근성 속성 추가

### 스타일 가이드

1. Tailwind CSS 클래스 사용
2. `merge` 유틸리티로 클래스 병합
3. 다크 모드 지원 (`dark:` 접두사)
4. 반응형 디자인 고려

### 접근성 가이드

1. 적절한 ARIA 속성 추가
2. 키보드 네비게이션 지원
3. 스크린 리더 호환
4. 시맨틱 HTML 사용

### 테스트

```bash
# 테스트 실행
pnpm test

# 테스트 UI
pnpm test:ui

# 커버리지
pnpm test:coverage
```

---

## 참고 문서

- [서브패키지 분석](./SUBPACKAGE_ANALYSIS.md)
- [아이콘 시스템](./ICON_SYSTEM.md)
- [개선 사항](./IMPROVEMENTS_2025-12-06.md)

---

**작성자**: Auto (AI Assistant)  
**최종 업데이트**: 2026-01-11

