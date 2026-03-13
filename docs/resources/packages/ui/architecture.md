# hua-ui Architecture

**작성일**: 2026-03-13
**버전**: 2.2.0

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
│   ├── native.ts             # React Native 프리미티브
│   ├── theme.ts              # 경량 ThemeProvider
│   ├── form.ts               # Form 서브패키지
│   ├── overlay.ts            # Overlay 서브패키지
│   ├── data.ts               # Data 서브패키지
│   ├── navigation.ts         # Navigation 서브패키지
│   ├── feedback.ts           # Feedback 서브패키지
│   ├── interactive.ts        # Interactive 서브패키지
│   ├── sdui.ts               # SDUI 렌더러
│   ├── landing.ts            # 랜딩 섹션 컴포넌트
│   ├── iconsax.ts            # Iconsax 아이콘
│   ├── iconsax-extended.ts   # Iconsax 전체 확장
│   ├── advanced.ts           # Advanced 엔트리 포인트
│   ├── advanced/
│   │   ├── dashboard.ts     # Dashboard (deprecated)
│   │   ├── motion.ts        # Motion 서브패키지
│   │   └── emotion.ts       # 감정 분석 컴포넌트
│   ├── interactive/
│   │   └── kanban.ts        # Kanban 서브패키지
│   ├── components/           # 컴포넌트 소스 (77개 root + advanced + dashboard)
│   │   ├── dashboard/       # Dashboard 컴포넌트 (20+)
│   │   ├── advanced/        # Advanced 컴포넌트 (15+)
│   │   │   ├── emotion/    # EmotionMeter, EmotionTier 등
│   │   │   └── blog-editor/ # 다국어 블로그 에디터
│   │   └── Icon/            # Icon 시스템
│   ├── landing/              # 랜딩 섹션 컴포넌트 (14개)
│   ├── lib/                  # 유틸리티 및 헬퍼
│   ├── hooks/                # 커스텀 훅
│   └── styles/              # CSS 파일
├── dist/                     # 빌드 출력
├── package.json
├── tsup.config.ts
└── tsconfig.json
```

---

## 엔트리 포인트 시스템

### Core (`@hua-labs/ui`)

**목적**: 대부분의 일반적인 앱 개발에 필요한 컴포넌트

**포함 내용**:

- 프리미티브 (Box, Text, Pressable — `dot` prop 기반 크로스플랫폼)
- UI 핵심 요소 (Button, Input, Select, Link, Icon, Avatar)
- 레이아웃 (Container, Grid, Stack, Divider, Card, Panel, Section)
- 확장 컴포넌트 (Action, ActionToolbar, Toggle, NumberInput)
- 데이터 표시 (Badge, Progress, Skeleton)
- 피드백 (Alert, Tooltip, LoadingSpinner, MotionConfigProvider, MicroMotion)
- 스크롤 (ScrollArea, ScrollToTop, ScrollIndicator, ScrollProgress)
- 테마 (ThemeProvider, ThemeToggle)
- 유틸리티 (merge, formatRelativeTime, Slot, composeRefs, mergeProps 등)
- 훅 (useBreakpoint, useDotMap, mergeStyles, resolveDot)

> **참고**: Overlay, Interactive, Navigation, Data 컴포넌트는 각자의 서브패키지로 분리됨. Core에서 일부 재export되지만 직접 서브패키지 import를 권장.

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

#### Emotion (`@hua-labs/ui/advanced/emotion`)

- EmotionMeter, EmotionTier, EmotionBadge 등 감정 분석 컴포넌트

**특징**:

- 특수 도메인에 특화된 컴포넌트
- 일반적인 앱에서는 필요 없을 수 있음

---

### Overlay (`@hua-labs/ui/overlay`)

**목적**: 레이어 위에 렌더링되는 오버레이 컴포넌트

**포함 내용**:

- Modal, ConfirmModal
- Popover, Dropdown
- Drawer, BottomSheet

---

### Data (`@hua-labs/ui/data`)

**목적**: 데이터 시각화 및 테이블 컴포넌트

**포함 내용**:

- Table, CodeBlock
- Dashboard 데이터 컴포넌트 (StatCard, MetricCard, TrendChart, BarChart 등)

---

### Interactive (`@hua-labs/ui/interactive`)

**목적**: 사용자 인터랙션 중심 컴포넌트

**포함 내용**:

- Accordion, Tabs
- Menu, Command, ContextMenu
- Toolbar

---

### Theme (`@hua-labs/ui/theme`)

**목적**: ThemeProvider만 필요한 경우 경량 import

**포함 내용**:

- ThemeProvider (경량)

---

### SDUI (`@hua-labs/ui/sdui`)

**목적**: Server-Driven UI 렌더러

**포함 내용**:

- SDUI 렌더러 및 관련 타입

---

### Landing (`@hua-labs/ui/landing`)

**목적**: 랜딩 페이지 섹션 컴포넌트

**포함 내용**:

- 랜딩 섹션 컴포넌트 14개 (Hero, Feature, Pricing 등)

---

### Native (`@hua-labs/ui/native`)

**목적**: React Native 환경에서 동작하는 크로스플랫폼 프리미티브

**포함 내용**:

- Box (`<View>` 대응)
- Text (RN `<Text>` 대응)
- Pressable (RN `<Pressable>` 대응)

**특징**:

- `dot` prop으로 스타일 지정 (`@hua-labs/dot` 엔진 사용)
- 웹/네이티브 소비자 코드 변경 없이 동일 API

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
<Button as="a" href="/link">
  Link Button
</Button>
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
import { merge } from "@hua-labs/ui";

const className = merge("px-2 py-1", "px-4"); // "py-1 px-4"
```

#### `mergeIf`

조건부 클래스 병합:

```tsx
import { mergeIf } from "@hua-labs/ui";

const className = mergeIf(isActive, "bg-blue-500", "bg-gray-200");
```

#### `mergeMap`

객체 기반 클래스 병합:

```tsx
import { mergeMap } from "@hua-labs/ui";

const className = mergeMap({
  "bg-blue-500": isPrimary,
  "text-white": true,
  "opacity-50": isDisabled,
});
```

### 다크 모드 지원

모든 컴포넌트는 `dark:` 접두사를 사용하여 다크 모드를 지원합니다.

```tsx
className = "bg-white dark:bg-gray-800";
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

1. **Phosphor Icons** (기본, `@phosphor-icons/react` 포함)
2. **Lucide Icons** (deprecated, 하위호환 유지)
3. **Iconsax Icons** (별도 entry `@hua-labs/ui/iconsax`, docs 전용)

### Icon 컴포넌트

```tsx
import { Icon } from '@hua-labs/ui';

// Phosphor 아이콘 (기본)
<Icon name="heart" />

// Lucide 아이콘 (deprecated, 하위호환)
<Icon name="heart" set="lucide" />
```

### IconProvider

글로벌 아이콘 설정:

```tsx
// Phosphor가 기본이므로 별도 설정 불필요
<IconProvider>
  <App />
</IconProvider>

// Lucide를 기본으로 사용해야 하는 경우 (deprecated)
<IconProvider set="lucide">
  <App />
</IconProvider>
```

### Iconsax 엔트리

docs 전용 아이콘 세트. 별도 엔트리 포인트로 분리되어 일반 앱 번들에 영향 없음:

```tsx
import { SomeIcon } from "@hua-labs/ui/iconsax";
```

> Iconsax는 lazy resolver 패턴을 사용하여 필요한 아이콘만 로드됨

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

- ESM 전용 (CJS 제거됨)
- Tree-shaking 지원
- TypeScript 타입 정의 자동 생성
- 코드 스플리팅 (ESM)

> `"use client"` directive는 post-build 스크립트로 각 엔트리 파일 상단에 자동 주입됨

### 빌드 설정

```typescript
// tsup.config.ts
const entry = {
  index: "src/index.ts",
  iconsax: "src/iconsax.ts",
  form: "src/form.ts",
  navigation: "src/navigation.ts",
  feedback: "src/feedback.ts",
  advanced: "src/advanced.ts",
  "advanced-dashboard": "src/advanced/dashboard.ts",
  "advanced-motion": "src/advanced/motion.ts",
};
```

> post-build 스크립트로 `"use client"` directive 자동 주입 (각 엔트리 파일 상단)

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

### 내부 의존성

- `@phosphor-icons/react` - 기본 아이콘 라이브러리
- `@hua-labs/motion-core` - 모션 애니메이션 (Advanced 컴포넌트)
- `@hua-labs/dot` - 크로스플랫폼 스타일 엔진
- `@floating-ui/react` - Popover/Tooltip 포지셔닝
- `sugar-high` - 코드 하이라이팅
- `clsx` - 클래스 병합
- `tailwind-merge` - Tailwind 클래스 병합

### 선택적 의존성 (deprecated)

- `lucide-react` - 레거시 아이콘 라이브러리 (하위호환 유지, 신규 사용 비권장)

> Iconsax 아이콘은 lazy resolver 패턴을 사용하여 별도의 의존성 설치 없이 동작

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
**최종 업데이트**: 2026-03-13
