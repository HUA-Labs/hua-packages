# Icon System Documentation

## 현재 상태

### 아키텍처
- **Provider 패턴**: React Context API 기반
- **상태관리**: 서비스 레벨에서 Zustand 등으로 관리 (패키지 의존성 없음)
- **기본 Provider**: Phosphor (`@phosphor-icons/react`)
- **지원 세트**: Phosphor (기본), Lucide (deprecated, 하위호환), Iconsax (별도 entry)
- **기본 동작**: IconProvider 없이도 사용 가능 (기본값 자동 적용)

### Provider 요약

| Provider | 상태 | 패키지 | 위치 |
|----------|------|--------|------|
| **Phosphor** | 기본 (default) | `@phosphor-icons/react` (dependencies) | icons.ts SSR import |
| **Lucide** | deprecated (하위호환) | `lucide-react` (devDependencies) | lazy load on demand |
| **Iconsax** | 구현 완료 (별도 entry) | `@hua-labs/ui/iconsax` | iconsax.ts entry point |

### 파일 구조
```
hua-ui/src/
├── components/Icon/
│   ├── Icon.tsx             # Main Icon 컴포넌트 (React.memo, forwardRef)
│   ├── IconProvider.tsx     # Context Provider (phosphor/lucide/iconsax)
│   ├── icon-store.ts        # 타입 정의 및 기본값
│   └── index.ts             # 통합 export
├── lib/
│   ├── icons.ts             # Phosphor 아이콘 정적 import (SSR-safe, /dist/ssr)
│   ├── icon-providers.ts    # Provider 시스템 (phosphor/lucide/iconsax)
│   ├── icon-aliases.ts      # 아이콘 이름 alias 매핑
│   ├── icon-names.ts        # 아이콘 이름 타입 (AllIconName = IconName | ProjectIconName)
│   ├── normalize-icon-name.ts # 이름 정규화 (kebab/snake/PascalCase → camelCase + alias 해결)
│   ├── case-utils.ts        # 케이스 변환 유틸리티 (toCamelCase, toPascalCase)
│   └── iconsax-loader.ts    # Iconsax SVG 로딩 (별도 entry에서만 사용)
└── iconsax.ts               # Iconsax entry point (@hua-labs/ui/iconsax)
```

### 주요 기능
- 전역 아이콘 설정 (IconProvider Context)
- 다중 아이콘 세트 지원 (Phosphor, Lucide, Iconsax)
- 세트별 자동 매핑 (PROJECT_ICONS)
- 아이콘 이름 alias 시스템 (300+ alias)
- 이름 정규화 (kebab-case, snake_case, PascalCase 자동 변환)
- SSR 안전 (서버: 빈 span, 클라이언트: 아이콘 교체)
- 애니메이션 지원 (spin, pulse, bounce)
- Variant 지원 (primary, success, error 등)
- 감정/상태 아이콘 매핑
- React.memo 기반 최적화

## 사용법

### 일반적인 사용 방법

**현재 my-app에서 사용 중인 방식 (IconProvider 없이):**

```tsx
import { Icon } from '@hua-labs/ui'

// 1. 기본 사용
<Icon name="arrowLeft" className="h-4 w-4" />

// 2. 버튼 내부
<Button>
  <Icon name="refresh" className="h-4 w-4 mr-2" />
  새로고침
</Button>

// 3. 링크 아이콘
<Link href="/admin">
  <Icon name="arrowLeft" className="h-4 w-4" />
</Link>

// 4. 상태 표시
<Icon name="warning" className="h-6 w-6 text-yellow-600 mr-3" />

// 5. 큰 아이콘
<Icon name="barChart" className="h-12 w-12 text-gray-400" />
```

**특징:**
- IconProvider 없이도 즉시 사용 가능
- 기본값 자동 적용: `phosphor`, `regular`, `size: 20`
- 각 아이콘마다 `size`, `className` 등으로 개별 설정 가능
- 기존 코드 수정 불필요

### 1. 기본 사용 (IconProvider 없이)

**가장 간단한 사용법:**

```tsx
import { Icon } from '@hua-labs/ui'

// 기본값 사용 (phosphor, regular, size: 20)
<Icon name="heart" />
<Icon name="user" size={24} />
<Icon name="settings" variant="primary" />
```

**기본값:**
- `set`: `phosphor`
- `weight`: `regular`
- `size`: `20`
- `color`: `currentColor`

### 2. IconProvider와 함께 사용 (권장)

**전역 설정으로 일관성 유지:**

```tsx
import { Icon, IconProvider } from '@hua-labs/ui'

// layout.tsx에서 전역 설정
<IconProvider set="phosphor" weight="regular" size={20}>
  <App />
</IconProvider>

// 그 후 어디서나
<Icon name="heart" />  // Provider 설정 자동 적용
<Icon name="user" size={24} />  // size만 오버라이드
```

**my-app에 적용 예시:**

```tsx
// app/layout.tsx
import { IconProvider } from '@hua-labs/ui'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          <IconProvider set="phosphor" weight="regular" size={20}>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </IconProvider>
        </Providers>
      </body>
    </html>
  )
}
```

### 3. Zustand와 통합

```tsx
import { create } from 'zustand'
import { IconProvider, type IconConfig } from '@hua-labs/ui'

// 서비스 레벨에서 상태관리
const useAppStore = create((set) => ({
  iconConfig: {
    set: 'phosphor' as const,
    weight: 'regular' as const,
    size: 20,
    color: 'currentColor',
  },
  updateIconConfig: (config: Partial<IconConfig>) =>
    set((state) => ({
      iconConfig: { ...state.iconConfig, ...config }
    }))
}))

// App에서 사용
function App() {
  const iconConfig = useAppStore(state => state.iconConfig)

  return (
    <IconProvider {...iconConfig}>
      <YourApp />
    </IconProvider>
  )
}
```

### 4. 개별 아이콘 오버라이드

```tsx
// Provider 설정을 오버라이드
<Icon
  name="heart"
  provider="iconsax"  // 전역 설정 무시
  size={32}           // 전역 size 무시
  weight="bold"       // Phosphor weight 오버라이드
/>
```

### 5. 애니메이션

```tsx
<Icon name="loader" spin />
<Icon name="heart" pulse />
<Icon name="bell" bounce />
<Icon name="star" animated />
```

### 6. Variant

```tsx
<Icon name="check" variant="success" />
<Icon name="alert" variant="error" />
<Icon name="info" variant="primary" />
```

### 7. 감정/상태 아이콘

```tsx
<Icon emotion="happy" />
<Icon status="loading" spin />
<Icon status="success" variant="success" />
```

#### 감정 아이콘 매핑표

| emotion | 매핑된 아이콘 | 설명 |
|---------|--------------|------|
| `happy` | `smile` (Smiley) | 행복한 표정 |
| `sad` | `frown` (SmileySad) | 슬픈 표정 |
| `neutral` | `meh` (SmileyMeh) | 무표정 |
| `excited` | `smile` (Smiley) | 신나는 표정 |
| `angry` | `frown` (SmileySad) | 화난 표정 |
| `love` | `heart` (Heart) | 하트 아이콘 |
| `like` | `heart` (Heart) | 좋아요 |
| `dislike` | `frown` (SmileySad) | 싫어요 |

#### 상태 아이콘 매핑표

| status | 매핑된 아이콘 | 설명 |
|--------|--------------|------|
| `loading` | `loader` (SpinnerGap) | 로딩 중 |
| `success` | `success` (CheckCircle) | 성공 |
| `error` | `error` (XCircle) | 에러 |
| `warning` | `warning` (WarningCircle) | 경고 |
| `info` | `info` (Info) | 정보 |
| `locked` | `lock` (Lock) | 잠금 |
| `unlocked` | `unlock` (LockOpen) | 잠금 해제 |
| `visible` | `eye` (Eye) | 보임 |
| `hidden` | `eyeOff` (EyeSlash) | 숨김 |

### 8. 특화된 아이콘 컴포넌트

```tsx
import { LoadingIcon, SuccessIcon, ErrorIcon, EmotionIcon, StatusIcon } from '@hua-labs/ui'

<LoadingIcon />
<SuccessIcon />
<ErrorIcon />
<EmotionIcon emotion="happy" />
<StatusIcon status="success" />
```

## 지원하는 아이콘 세트

### Phosphor Icons (기본)
- **패키지**: `@phosphor-icons/react` (dependencies)
- **import**: `@phosphor-icons/react/dist/ssr` (SSR-safe)
- **특징**: weight 기반 (thin, light, regular, bold, duotone, fill)
- **기본값**: weight `"regular"`, size `20`
- **해결 순서**:
  1. `icons.ts` 정적 import에서 찾기 (Phosphor SSR 컴포넌트)
  2. `PROJECT_ICONS` 매핑에서 fallback
  3. `initPhosphorIcons()` 동적 namespace lookup (클라이언트 전용)

### Lucide Icons (deprecated)
- **패키지**: `lucide-react` (devDependencies로 이동됨)
- **상태**: deprecated, 하위호환용으로만 유지
- **로딩**: `initLucideIcons()` 호출 시에만 lazy load (@deprecated 표시됨)
- **향후**: 제거 예정

### Iconsax Icons (별도 entry)
- **entry**: `@hua-labs/ui/iconsax`
- **상태**: 구현 완료 (별도 entry point로 분리)
- **패턴**: lazy resolver (`registerIconsaxResolver()` / `getIconsaxResolver()`)
- **코어 번들**: 포함되지 않음 (iconsax entry import 시에만 로드)
- **변형**: `line` (기본) | `bold` 지원
- **주 사용처**: hua-docs 아이콘 갤러리

**Iconsax 사용법:**
```tsx
// 1. iconsax entry import (resolver 자동 등록)
import '@hua-labs/ui/iconsax'

// 2. Icon 컴포넌트에서 iconsax 사용
<Icon name="home" provider="iconsax" />

// 3. 갤러리 컴포넌트 사용
import { IconsaxGallery } from '@hua-labs/ui/iconsax'
<IconsaxGallery />
```

## API Reference

### IconProvider Props

```tsx
interface IconProviderProps {
  set?: 'phosphor' | 'lucide' | 'iconsax'  // 기본: 'phosphor'
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'duotone' | 'fill'  // 기본: 'regular'
  iconsaxVariant?: 'line' | 'bold'  // Iconsax 변형, 기본: 'line'
  size?: number  // 기본: 20
  color?: string  // 기본: 'currentColor'
  strokeWidth?: number  // Lucide/Iconsax용, 기본: 1.25
  children: React.ReactNode
}
```

### Icon Props

```tsx
interface IconProps {
  name: AllIconName  // 필수 (IconName | ProjectIconName)
  size?: number | string  // Provider 설정 오버라이드
  className?: string
  emotion?: 'happy' | 'sad' | 'neutral' | 'excited' | 'angry' | 'love' | 'like' | 'dislike'
  status?: 'loading' | 'success' | 'error' | 'warning' | 'info' | 'locked' | 'unlocked' | 'visible' | 'hidden'
  provider?: 'phosphor' | 'lucide' | 'iconsax'  // Provider 설정 오버라이드
  weight?: PhosphorWeight  // Phosphor weight 오버라이드
  animated?: boolean
  pulse?: boolean
  spin?: boolean
  bounce?: boolean
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted' | 'inherit'
  'aria-label'?: string  // 스크린 리더용 라벨
  'aria-hidden'?: boolean  // 장식용 아이콘
}
```

## 아이콘 매핑

### PROJECT_ICONS 매핑

아이콘 이름은 `PROJECT_ICONS`에서 프로바이더별로 자동 매핑됩니다:

```tsx
// 예시 (icon-providers.ts)
'home' → { lucide: 'Home', phosphor: 'House', iconsax: 'Home2' }
'settings' → { lucide: 'Settings', phosphor: 'Gear' }
'search' → { lucide: 'Search', phosphor: 'MagnifyingGlass', iconsax: 'SearchNormal' }
```

### Icon Alias 시스템

여러 이름이 같은 아이콘을 가리키도록 하는 alias 시스템을 제공합니다. DX 향상을 위해 직관적인 이름들을 지원합니다.

**사용 예시:**
```tsx
// 모두 같은 아이콘 (arrowLeft)
<Icon name="back" />
<Icon name="prev" />
<Icon name="previous" />
<Icon name="arrowLeft" />
```

**주요 Alias:**
- Navigation: `back`, `prev`, `previous` -> `arrowLeft`
- Actions: `plus`, `new` -> `add` / `remove`, `trash` -> `delete`
- Status: `spinner`, `loading` -> `loader` / `checkmark` -> `success`
- User: `person`, `account`, `profile` -> `user`
- Settings: `gear`, `config`, `preferences`, `prefs` -> `settings`
- kebab-case: `arrow-left` -> `arrowLeft`, `check-circle` -> `checkCircle` (자동 변환)

**Alias 확인:**
```tsx
import { resolveIconAlias, getIconAliases } from '@hua-labs/ui'

// Alias 해결 (역방향 매핑)
resolveIconAlias('back')         // 'arrowLeft'
resolveIconAlias('gear')         // 'settings'
resolveIconAlias('spinner')      // 'loader'
resolveIconAlias('email')        // 'mail'

// 특정 아이콘의 모든 alias 가져오기
getIconAliases('arrowLeft')      // ['back', 'prev', 'previous']
getIconAliases('settings')       // ['gear', 'config', 'preferences', 'prefs']
```

자세한 내용은 [Icon Autocomplete Guide](./ICON_AUTOCOMPLETE.md#icon-alias-시스템)를 참고하세요.

### 아이콘 해결 순서 (Phosphor provider)

Icon 컴포넌트가 아이콘을 찾는 순서:

1. **이름 정규화**: `normalizeIconName()` -- kebab/snake/PascalCase -> camelCase, alias 해결
2. **`icons.ts` 정적 import**: Phosphor SSR 컴포넌트에서 먼저 검색 (가장 빠름)
3. **`PROJECT_ICONS` 매핑**: 프로바이더별 매핑 테이블에서 fallback 조회
4. **동적 namespace lookup**: `initPhosphorIcons()` 로 로드된 전체 Phosphor 모듈에서 검색

```tsx
// icons.ts에 없는 아이콘도 사용 가능 (동적 fallback)
<Icon name="someNewIcon" />  // 3단계/4단계에서 동적으로 해결
```

## SSR (Server-Side Rendering)

### 현재 구현
- 모든 아이콘은 **hydration mismatch 방지**를 위해 `isClient` 가드 사용
- SSR 시 빈 `<span>` 요소가 렌더링되고, 클라이언트에서 실제 아이콘으로 교체
- Phosphor icons: `@phosphor-icons/react/dist/ssr`에서 정적 import하지만, hydration 안전을 위해 클라이언트 가드 유지

### 세트별 SSR 지원

| 세트 | SSR import | 실제 렌더링 |
|------|-----------|------------|
| **Phosphor** | `/dist/ssr` 정적 import | 클라이언트 전용 (isClient 가드) |
| **Lucide** | lazy load (deprecated) | 클라이언트 전용 |
| **Iconsax** | resolver 패턴 | 클라이언트 전용 |

### 권장사항
- Next.js App Router 사용 시 `'use client'` 지시어 필요
- SSR이 중요한 경우, 아이콘 영역에 스켈레톤 UI 추가 고려
- tsup 빌드 시 `"use client"` 배너가 모든 JS 파일에 자동 추가됨

## 빌드 시스템

### tsup 설정
- **`"use client"` 배너**: `addUseClientDirective()` 함수로 모든 JS 파일에 자동 추가 (post-build script 불필요)
- **코어 번들**: ESM + CJS, splitting 지원
- **Iconsax 번들**: 별도 entry (`iconsax.ts`), splitting 없음 (600+ chunks 방지)
- **코어 dist**: ~106 files (기존 3,135에서 대폭 감소)
- **external**: `react`, `react-dom`, `lucide-react`, `@phosphor-icons/react` 등

### entry points

| Entry | 경로 | 설명 |
|-------|------|------|
| `@hua-labs/ui` | `src/index.ts` | 코어 (Icon, IconProvider 포함) |
| `@hua-labs/ui/iconsax` | `src/iconsax.ts` | Iconsax (resolver 자동 등록) |
| `@hua-labs/ui/advanced` | `src/advanced.ts` | 고급 컴포넌트 |
| `@hua-labs/ui/form` | `src/form.ts` | 폼 컴포넌트 |
| `@hua-labs/ui/navigation` | `src/navigation.ts` | 네비게이션 컴포넌트 |
| `@hua-labs/ui/feedback` | `src/feedback.ts` | 피드백 컴포넌트 |

### sideEffects

```json
{
  "sideEffects": [
    "**/*.css",
    "./dist/iconsax.mjs",
    "./dist/iconsax.js"
  ]
}
```

Iconsax entry는 import 시 `registerIconsaxResolver()`를 실행하므로 side effect로 표시됨.

## 주의사항

### Provider 필수 여부
- IconProvider 없이 사용하면 기본값 사용 (`phosphor`, `regular`, `size: 20`)
- 서비스 레벨에서 Zustand 등으로 관리 권장

### 타입 안전성
- `AllIconName` 타입으로 아이콘 이름 제한 (`IconName | ProjectIconName`)
- 존재하지 않는 아이콘 사용 시 콘솔 경고 + `?` placeholder 렌더링

### Variant/Animated와 Tailwind CSS 충돌

**충돌 없음:**
- Icon의 `variant` prop은 **내부 클래스**로 적용 (`text-blue-600` 등)
- Icon의 `animated`, `spin`, `pulse`, `bounce`는 **별도 클래스**로 적용
- Tailwind의 `animate-spin`, `text-success` 등과 **독립적으로 동작**

**사용 예시:**
```tsx
// Icon의 variant와 Tailwind 클래스 함께 사용 가능
<Icon name="check" variant="success" className="ml-2" />

// Icon의 spin과 Tailwind 애니메이션 충돌 없음
<Icon name="loader" spin className="animate-pulse" />
```

### Tree-shaking

| 세트 | Tree-shaking | 설명 |
|------|-------------|------|
| **Phosphor** | 정적 import 최적화 | `icons.ts`에서 필요한 아이콘만 import, 나머지는 동적 fallback |
| **Lucide** | lazy load | `initLucideIcons()` 호출 시에만 전체 모듈 로드 (deprecated) |
| **Iconsax** | 별도 entry 분리 | 코어 번들에 포함되지 않음, import 시에만 로드 |

### Lucide 마이그레이션 참고
- `lucide-react`는 `devDependencies`로 이동됨 (런타임 의존성 아님)
- `initLucideIcons()`는 `@deprecated` 표시
- 기존 `provider="lucide"` 코드는 아직 동작하지만 향후 제거 예정
- 새 코드에서는 반드시 Phosphor 사용

## 타입 자동 생성

### IconName 타입 자동 생성 스크립트

아이콘 이름의 타입 안전성을 보장하기 위해 자동 생성 스크립트를 제공합니다.

**사용법:**
```bash
pnpm generate:icon-types
```

**동작 방식:**
1. `src/lib/icons.ts` 파일을 스캔
2. `icons` 객체의 모든 키를 추출
3. 타입 파일 생성

**주의사항:**
- 생성된 파일은 자동 생성 파일이므로 수동 수정 금지
- 아이콘 추가/삭제 후 스크립트 재실행 필요

## 완료된 개선사항

1. 파일 구조 정리 (Icon 폴더로 통합)
2. Context API 기반 Provider 구현
3. 서비스 레벨 상태관리 지원 (Zustand 등)
4. 타입 정의 정리 (AllIconName, ProjectIconName)
5. Phosphor Icons를 기본 provider로 전환
6. Phosphor SSR-safe import (`/dist/ssr`)
7. Iconsax Icons 구현 (별도 entry point)
8. Iconsax lazy resolver 패턴 (`registerIconsaxResolver` / `getIconsaxResolver`)
9. Lucide를 devDependencies로 이동, deprecated 처리
10. Untitled provider 제거
11. tsup 빌드 최적화 (`"use client"` 배너, 코어/iconsax 분리)
12. 코어 번들 크기 대폭 감소 (~106 files, 기존 3,135)
13. 아이콘 이름 정규화 시스템 (normalize-icon-name.ts)
14. 아이콘 alias 시스템 (icon-aliases.ts)
15. React.memo 기반 Icon 컴포넌트 최적화
16. 접근성 개선 (aria-label, aria-hidden)

## 향후 개선 계획

### 1. 기능 개선
- [ ] 테마별 weight 자동 분기 (라이트/다크)
- [ ] 아이콘 로딩 에러 처리 개선 (Suspense boundary)
- [ ] Lucide provider 완전 제거 (breaking change)

### 2. 성능 최적화
- [ ] 아이콘 프리로딩 옵션 (Phosphor)
- [ ] 불필요한 리렌더링 추가 방지

### 3. 문서화
- [ ] 아이콘 전체 목록 문서화
- [ ] Lucide -> Phosphor 마이그레이션 가이드
- [ ] Storybook 스토리 추가

### 4. 테스트
- [ ] Icon 컴포넌트 테스트
- [ ] IconProvider 테스트
- [ ] 아이콘 매핑 테스트
- [ ] SSR 테스트

## 변경 이력

### v1.1.0-alpha (현재)
- Phosphor Icons를 기본 provider로 전환
- `@phosphor-icons/react/dist/ssr` SSR-safe import
- Iconsax Icons 구현 (별도 entry `@hua-labs/ui/iconsax`)
- Lucide deprecated (devDependencies로 이동)
- Untitled provider 제거
- tsup 번들 최적화 (코어 ~106 files)
- 아이콘 이름 정규화/alias 시스템 추가

### v1.0.0
- IconProvider 패턴 도입
- Context API 기반 전역 설정
- Phosphor Icons 지원
- Zustand 통합 지원
