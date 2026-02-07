# Icon System

HUA UI 아이콘 시스템. 여러 프로바이더를 지원하며 Phosphor가 기본값입니다.

## 지원하는 아이콘 프로바이더

### 1. Phosphor Icons (기본값)
- **패키지**: `@phosphor-icons/react` (이미 포함됨, 별도 설치 불필요)
- **사용법**: 기본 프로바이더로 동작

```tsx
import { Icon } from '@hua-labs/ui'

<Icon name="house" />
<Icon name="user" size={32} />
<Icon name="gear" variant="primary" />
```

### 2. Lucide Icons (deprecated)
- **상태**: deprecated - 하위 호환성 유지 중, 향후 제거 예정
- **설치**: `pnpm add lucide-react` (레거시 lucide provider가 필요한 경우만)
- **사용법**: `provider="lucide"` 명시 필요

```tsx
import { Icon } from '@hua-labs/ui'

// lucide를 쓰려면 provider를 명시해야 함
<Icon name="home" provider="lucide" />
```

### 3. Iconsax Icons
- **상태**: 구현 완료
- **진입점**: `@hua-labs/ui/iconsax` (별도 entry, 코어 번들에 미포함)
- **용도**: hua-docs 아이콘 갤러리 등에서 사용

```tsx
import { IconsaxIcon } from '@hua-labs/ui/iconsax'

<IconsaxIcon name="Home2" />
```

## Icon 컴포넌트 사용법

### 기본 사용
```tsx
import { Icon } from '@hua-labs/ui'

<Icon name="house" size={24} />
<Icon name="user" size={32} variant="primary" />
```

### 애니메이션
```tsx
<Icon name="spinner" spin />
<Icon name="heart" pulse />
<Icon name="bell" bounce />
```

### 상태별 아이콘
```tsx
<Icon status="loading" spin />
<Icon status="success" variant="success" />
<Icon emotion="happy" />
```

## 아이콘 이름 매핑

프로바이더별로 아이콘 이름이 다를 수 있습니다:

| 일반 이름 | Phosphor (기본) | Lucide (deprecated) | Iconsax |
|---------|----------------|---------------------|---------|
| home | `House` | `Home` | `Home2` |
| settings | `Gear` | `Settings` | - |
| user | `User` | `User` | `User` |

자동 매핑이 지원되지만, 필요시 `getIconNameForProvider` 함수를 사용할 수 있습니다.

## 설치 안내

- **Phosphor**: 이미 `@hua-labs/ui` 의존성에 포함. 별도 설치 불필요.
- **Lucide**: 레거시 lucide provider가 필요한 경우만 설치

```bash
pnpm add lucide-react --filter <your-app>
```

## 주의사항

1. **Phosphor가 기본 프로바이더**입니다. `provider` prop 없이 사용하면 Phosphor로 렌더링됩니다.
2. **Lucide는 deprecated**입니다. 기존 코드는 동작하지만 신규 코드에서는 Phosphor를 사용하세요.
3. **Iconsax는 별도 entry**(`@hua-labs/ui/iconsax`)로 제공되며 코어 번들 사이즈에 영향을 주지 않습니다.
4. **SSR**: 모든 아이콘은 클라이언트에서만 렌더링됩니다 (`isClient` guard로 hydration 안전성 확보).
