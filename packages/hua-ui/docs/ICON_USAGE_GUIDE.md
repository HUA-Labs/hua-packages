# Icon 사용 가이드

## 일반적인 사용 방법

### 1. 기본 사용 (IconProvider 없이)

**현재 my-app에서 사용 중인 방식:**

```tsx
import { Icon } from '@hua-labs/ui'

// 기본 사용
<Icon name="arrowLeft" className="h-4 w-4" />
<Icon name="heart" size={24} />
<Icon name="user" variant="primary" />
```

**특징:**
- IconProvider 없이도 동작 (기본값 사용)
- 기본값: `phosphor`, `regular`, `size: 20`
- 각 아이콘마다 `size`, `className` 등으로 개별 설정 가능

### 2. IconProvider와 함께 사용 (권장)

**전역 설정으로 일관성 유지:**

```tsx
import { Icon, IconProvider } from '@hua-labs/ui'

// layout.tsx 또는 root에서
<IconProvider set="phosphor" weight="regular" size={20}>
  <App />
</IconProvider>

// 그 후 어디서나
<Icon name="heart" />  // Provider 설정 자동 적용
<Icon name="user" size={24} />  // size만 오버라이드
```

**장점:**
- 모든 아이콘이 일관된 스타일
- 개별 설정 불필요
- 필요시 개별 오버라이드 가능

### 3. Icon Alias 사용

**직관적인 이름으로 아이콘 사용:**

```tsx
import { Icon } from '@hua-labs/ui'

// 모두 같은 아이콘 (arrowLeft)
<Icon name="back" />
<Icon name="prev" />
<Icon name="previous" />
<Icon name="arrowLeft" />

// 다른 예시
<Icon name="close" />      // x
<Icon name="spinner" />    // loader
<Icon name="email" />      // mail
<Icon name="chat" />       // message
```

**주요 Alias:**
- Navigation: `back`, `prev`, `previous` → `arrowLeft`
- Actions: `plus`, `new` → `add` / `remove`, `trash` → `delete`
- Status: `spinner`, `loading` → `loader`
- User: `person`, `account`, `profile` → `user`
- Settings: `gear`, `config`, `preferences` → `settings`

자세한 alias 목록은 [Icon Autocomplete Guide](./ICON_AUTOCOMPLETE.md#icon-alias-시스템)를 참고하세요.

### 4. Zustand와 통합 (고급)

**서비스 레벨에서 상태관리:**

```tsx
// store/useAppStore.ts
import { create } from 'zustand'
import { type IconConfig } from '@hua-labs/ui'

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

// layout.tsx
import { IconProvider } from '@hua-labs/ui'
import { useAppStore } from '@/app/store/useAppStore'

export default function RootLayout({ children }) {
  const iconConfig = useAppStore(state => state.iconConfig)
  
  return (
    <IconProvider {...iconConfig}>
      {children}
    </IconProvider>
  )
}
```

## 실제 사용 예시 (my-app 기준)

### 현재 사용 중인 패턴

```tsx
// 1. 버튼 내부 아이콘
<Button>
  <Icon name="refresh" className="h-4 w-4 mr-2" />
  새로고침
</Button>

// 2. 링크 아이콘
<Link href="/admin">
  <Icon name="arrowLeft" className="h-4 w-4" />
</Link>

// 3. 상태 표시 아이콘
<Icon name="warning" className="h-6 w-6 text-yellow-600 mr-3" />

// 4. 큰 아이콘
<Icon name="barChart" className="h-12 w-12 text-gray-400 mx-auto mb-3" />
```

### IconProvider 적용 후 개선된 패턴

```tsx
// layout.tsx에 IconProvider 추가
<IconProvider set="phosphor" weight="regular" size={20}>
  <App />
</IconProvider>

// 사용 시 (className으로 크기만 조정)
<Button>
  <Icon name="refresh" className="h-4 w-4 mr-2" />
  새로고침
</Button>

// 또는 size prop 사용
<Button>
  <Icon name="refresh" size={16} className="mr-2" />
  새로고침
</Button>
```

## 마이그레이션 가이드

### 옵션 1: 점진적 적용 (권장)

**1단계: IconProvider 추가 (기본값)**
```tsx
// layout.tsx
<IconProvider>
  {/* 기존 코드 그대로 */}
</IconProvider>
```

**2단계: 필요시 설정 조정**
```tsx
<IconProvider set="phosphor" weight="regular" size={20}>
  {/* 기존 코드 그대로 */}
</IconProvider>
```

**3단계: Zustand 통합 (선택)**
```tsx
// 서비스에서 상태관리 필요시
const iconConfig = useAppStore(state => state.iconConfig)
<IconProvider {...iconConfig}>
```

### 옵션 2: 즉시 적용

**layout.tsx에 IconProvider 추가:**

```tsx
import { IconProvider } from '@hua-labs/ui'

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
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

## 사용 패턴 비교

### Before (IconProvider 없이)

```tsx
// 각 아이콘마다 개별 설정
<Icon name="heart" size={20} />
<Icon name="user" size={20} />
<Icon name="settings" size={20} />
```

### After (IconProvider 사용)

```tsx
// Provider에서 전역 설정
<IconProvider size={20}>
  <Icon name="heart" />  // size 자동 적용
  <Icon name="user" />   // size 자동 적용
  <Icon name="settings" /> // size 자동 적용
</IconProvider>
```

## 설정 우선순위

1. **Icon 컴포넌트의 prop** (최우선)
2. **IconProvider의 설정**
3. **기본값** (IconProvider 없을 때)

```tsx
<IconProvider size={20} weight="regular">
  {/* size={24}가 우선 적용됨 */}
  <Icon name="heart" size={24} />
  
  {/* Provider의 weight="regular" 적용 */}
  <Icon name="user" />
  
  {/* weight="bold"가 우선 적용됨 */}
  <Icon name="settings" weight="bold" />
</IconProvider>
```

## 실전 예시

### 네비게이션 아이콘

```tsx
<nav>
  <Icon name="home" size={20} />
  <Icon name="user" size={20} />
  <Icon name="settings" size={20} />
</nav>
```

### 버튼 아이콘

```tsx
<Button>
  <Icon name="download" className="mr-2" />
  다운로드
</Button>
```

### 상태 표시

```tsx
<Icon name="check" variant="success" />
<Icon name="alert" variant="error" />
<Icon status="loading" spin />
```

### 감정 아이콘

```tsx
<Icon emotion="happy" />
<Icon emotion="sad" />
```

## 권장사항

1. **IconProvider는 layout.tsx에 추가** - 전역 설정으로 일관성 유지
2. **기본값으로 시작** - 필요시 점진적으로 조정
3. **개별 오버라이드 활용** - 특정 아이콘만 다르게 설정 가능
4. **Zustand 통합** - 테마 변경 등 동적 설정 필요시

