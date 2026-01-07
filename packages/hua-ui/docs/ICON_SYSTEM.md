# Icon System Documentation

## 현재 상태

### 아키텍처
- **Provider 패턴**: React Context API 기반
- **상태관리**: 서비스 레벨에서 Zustand 등으로 관리 (패키지 의존성 없음)
- **지원 세트**: Lucide (기본), Phosphor, Iconsax (준비 중)
- **기본 동작**: IconProvider 없이도 사용 가능 (기본값 자동 적용)

### 파일 구조
```
hua-ui/src/components/Icon/
├── Icon.tsx           # Icon 컴포넌트
├── IconProvider.tsx   # Context Provider
├── icon-store.ts      # 타입 정의 및 기본값
└── index.ts           # 통합 export
```

### 주요 기능
- 전역 아이콘 설정 (Provider)
- 다중 아이콘 세트 지원 (Lucide, Phosphor)
- 세트별 자동 매핑 (PROJECT_ICONS)
- Tree-shaking 지원
- SSR 안전 (hydration 방지)
- 애니메이션 지원 (spin, pulse, bounce)
- Variant 지원 (primary, success, error 등)
- 감정/상태 아이콘 매핑

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
    strokeWidth: 1.25,
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
  provider="lucide"  // 전역 설정 무시
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
| `happy` | `smile` | 행복한 표정 |
| `sad` | `frown` | 슬픈 표정 |
| `neutral` | `meh` | 무표정 |
| `excited` | `laugh` | 신나는 표정 |
| `angry` | `angry` | 화난 표정 |
| `love` | `heart` | 하트 아이콘 |
| `like` | `thumbsUp` | 좋아요 |
| `dislike` | `thumbsDown` | 싫어요 |

#### 상태 아이콘 매핑표

| status | 매핑된 아이콘 | 설명 |
|--------|--------------|------|
| `loading` | `loader` | 로딩 중 |
| `success` | `success` (checkCircle) | 성공 |
| `error` | `error` (xCircle) | 에러 |
| `warning` | `warning` (alertCircle) | 경고 |
| `info` | `info` | 정보 |
| `locked` | `lock` | 잠금 |
| `unlocked` | `unlock` | 잠금 해제 |
| `visible` | `eye` | 보임 |
| `hidden` | `eyeOff` | 숨김 |

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

### Lucide Icons (기본)
- **패키지**: `lucide-react` (의존성 포함)
- **특징**: strokeWidth 기반
- **기본값**: strokeWidth 1.25

### Phosphor Icons
- **패키지**: `@phosphor-icons/react` (peerDependency)
- **특징**: weight 기반 (thin, light, regular, bold, duotone, fill)
- **기본값**: weight "regular"
- **설치**: `pnpm add @phosphor-icons/react`

### Iconsax Icons
- **상태**: 준비 중
- **특징**: SVG 기반
- **API 차이점**: 
  - `weight` prop 지원 안 함 (Phosphor 전용)
  - `strokeWidth` 사용 (Lucide와 동일)
  - Provider에서 `weight` 설정 시 무시되고 `strokeWidth` 사용

## API Reference

### IconProvider Props

```tsx
interface IconProviderProps {
  set?: 'lucide' | 'phosphor' | 'iconsax'  // 기본: 'phosphor'
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'duotone' | 'fill'  // 기본: 'regular'
  size?: number  // 기본: 20
  color?: string  // 기본: 'currentColor'
  strokeWidth?: number  // Lucide/Iconsax용, 기본: 1.25
  children: React.ReactNode
}
```

### Icon Props

```tsx
interface IconProps {
  name: IconName  // 필수
  size?: number | string  // Provider 설정 오버라이드
  className?: string
  emotion?: 'happy' | 'sad' | 'neutral' | 'excited' | 'angry' | 'love' | 'like' | 'dislike'
  status?: 'loading' | 'success' | 'error' | 'warning' | 'info' | 'locked' | 'unlocked' | 'visible' | 'hidden'
  provider?: IconSet  // Provider 설정 오버라이드
  weight?: PhosphorWeight  // Phosphor weight 오버라이드
  animated?: boolean
  pulse?: boolean
  spin?: boolean
  bounce?: boolean
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted'
}
```

## 아이콘 매핑

### PROJECT_ICONS 매핑

아이콘 이름은 `PROJECT_ICONS`에서 자동 매핑됩니다:

```tsx
// 예시
'home' → Lucide: 'Home', Phosphor: 'House'
'settings' → Lucide: 'Settings', Phosphor: 'Gear'
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
- Navigation: `back`, `prev`, `previous` → `arrowLeft`
- Actions: `plus`, `new` → `add` / `remove`, `trash` → `delete`
- Status: `spinner`, `loading` → `loader` / `checkmark` → `success`
- User: `person`, `account`, `profile` → `user`
- Settings: `gear`, `config`, `preferences` → `settings`

**Alias 확인:**
```tsx
import { resolveIconAlias, getIconAliases } from '@hua-labs/ui'

// Alias 해결 (역방향 매핑)
const actualName1 = resolveIconAlias('back')         // 'arrowLeft'
const actualName2 = resolveIconAlias('gear')        // 'settings'
const actualName3 = resolveIconAlias('preferences') // 'settings'
const actualName4 = resolveIconAlias('spinner')     // 'loader'
const actualName5 = resolveIconAlias('email')      // 'mail'

// 특정 아이콘의 모든 alias 가져오기
const aliases1 = getIconAliases('arrowLeft')
// ['back', 'prev', 'previous']

const aliases2 = getIconAliases('settings')
// ['gear', 'config', 'preferences', 'prefs']
```

자세한 내용은 [Icon Autocomplete Guide](./ICON_AUTOCOMPLETE.md#icon-alias-시스템)를 참고하세요.

### 매핑되지 않은 아이콘 사용

**매핑되지 않은 아이콘도 사용 가능합니다!**

```tsx
// icons.ts에 없는 아이콘도 동적으로 로드됨
<Icon name="someNewIcon" />  // 동적 로딩
```

**동작 방식:**
1. 먼저 `icons.ts`에서 찾기 (실제 사용되는 아이콘만 포함)
2. 없으면 `PROJECT_ICONS`에서 매핑 확인
3. 없으면 동적으로 Lucide에서 가져오기 (fallback)

**장점:**
- 번들 크기 최적화 (실제 사용되는 아이콘만 포함)
- 새로운 아이콘도 즉시 사용 가능
- 점진적 마이그레이션 가능

## 주의사항

### SSR (Server-Side Rendering)

**현재 구현:**
- 모든 아이콘은 **hydration mismatch 방지**를 위해 클라이언트에서만 렌더링됩니다
- SSR 시 빈 `<span>` 요소가 렌더링되고, 클라이언트에서 실제 아이콘으로 교체됩니다

**세트별 SSR 지원:**
- **Lucide**: SSR-safe (하지만 현재는 클라이언트 전용으로 제한)
- **Phosphor**: Dynamic import 사용 (SSR 시 클라이언트에서만 로드)
- **Iconsax**: SVG 기반이므로 SSR 가능 (구현 시)

**권장사항:**
- Next.js App Router 사용 시 `'use client'` 지시어 필요
- SSR이 중요한 경우, 아이콘 영역에 스켈레톤 UI 추가 고려

### Phosphor 초기화
- Phosphor Icons는 동적 로딩으로 약간의 지연 가능
- 첫 사용 시에만 로드되며, 이후 캐시됨

### Provider 필수
- IconProvider 없이 사용하면 기본값 사용 (`phosphor`, `regular`, `size: 20`)
- 서비스 레벨에서 Zustand 등으로 관리 권장

### 타입 안전성
- `IconName` 타입으로 아이콘 이름 제한
- 존재하지 않는 아이콘 사용 시 콘솔 경고

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

### Tree-shaking 지원

**세트별 Tree-shaking 상태:**

| 세트 | Tree-shaking | 설명 |
|------|-------------|------|
| **Lucide** | 완전 지원 | ESM 기반, 사용하지 않는 아이콘 자동 제거 |
| **Phosphor** | ESM/Dynamic | Dynamic import 사용 시 선택적 로딩 |
| **Iconsax** | 제한적 | SVG 파일 기반이므로 번들러 설정 필요 |

**최적화 팁:**
- Lucide: 자동으로 tree-shaking 됨
- Phosphor: Dynamic import로 필요한 아이콘만 로드
- Iconsax: SVG 파일을 개별 import하여 번들러가 최적화하도록 설정

## 완료된 개선사항

1. 파일 구조 정리 (Icon 폴더로 통합)
2. Context API 기반 Provider 구현
3. 서비스 레벨 상태관리 지원 (Zustand 등)
4. 타입 정의 정리
5. strokeWidth 기본값 함수 추가
6. 통합 export (index.ts)

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
3. `src/lib/icon-names.generated.ts` 파일 생성

**장점:**
- 이름 충돌 방지
- 업데이트 누락 방지
- 오타 방지
- 타입 안전성 향상

**주의사항:**
- 생성된 파일은 자동 생성 파일이므로 수동 수정 금지
- 아이콘 추가/삭제 후 스크립트 재실행 필요

## 향후 개선 계획

### 1. 기능 개선
- [ ] Iconsax Icons 구현
- [ ] 테마별 weight 자동 분기 (라이트/다크)
- [ ] 아이콘 로딩 에러 처리 개선
- [ ] Phosphor 초기화 캐싱

### 2. 성능 최적화
- [ ] 아이콘 컴포넌트 메모이제이션
- [ ] 불필요한 리렌더링 방지
- [ ] 아이콘 프리로딩 옵션

### 3. 문서화
- [x] 감정/상태 아이콘 매핑표 추가
- [x] SSR 주의사항 명확화
- [x] Tree-shaking 체크리스트 추가
- [x] Variant/Tailwind 충돌 설명 추가
- [ ] 아이콘 목록 문서화
- [ ] 마이그레이션 가이드
- [ ] Storybook 스토리 추가

### 4. 테스트
- [ ] Icon 컴포넌트 테스트
- [ ] IconProvider 테스트
- [ ] 아이콘 매핑 테스트
- [ ] SSR 테스트

## 변경 이력

### v1.0.0 (현재)
- IconProvider 패턴 도입
- Context API 기반 전역 설정
- Phosphor Icons 지원
- Zustand 통합 지원
