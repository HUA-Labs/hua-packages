# Icon System

HUA UI 패키지는 여러 아이콘 라이브러리를 지원합니다.

## 지원하는 아이콘 프로바이더

### 1. Lucide Icons (기본값)
- **패키지**: `lucide-react` (이미 포함됨)
- **사용법**: 기본값으로 사용됩니다.

```tsx
import { Icon } from '@hua-labs/ui'

<Icon name="home" />
<Icon name="user" />
```

### 2. Phosphor Icons
- **패키지**: `@phosphor-icons/react` (선택적 설치)
- **설치**: `pnpm add @phosphor-icons/react`
- **사용법**: `provider` prop 사용

```tsx
import { Icon } from '@hua-labs/ui'

<Icon name="house" provider="phosphor" />
<Icon name="user" provider="phosphor" />
```

### 3. Untitled Icons
- **타입**: SVG 기반
- **사용법**: CSS 클래스 또는 커스텀 렌더링
- **참고**: Untitled Icons는 SVG 파일로 제공되므로, 직접 SVG를 사용하거나 별도 컴포넌트로 구현해야 합니다.

## Icon 컴포넌트 사용법

### 기본 사용
```tsx
import { Icon } from '@hua-labs/ui'

<Icon name="home" size={24} />
<Icon name="user" size={32} variant="primary" />
```

### Phosphor Icons 사용
```tsx
<Icon name="house" provider="phosphor" size={24} />
<Icon name="gear" provider="phosphor" variant="primary" />
```

### 애니메이션
```tsx
<Icon name="loader" spin />
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

일부 아이콘은 프로바이더별로 이름이 다를 수 있습니다:

| 일반 이름 | Lucide | Phosphor |
|---------|--------|----------|
| home | `home` | `house` |
| settings | `settings` | `gear` |
| user | `user` | `user` |

자동 매핑이 지원되지만, 필요시 `getIconNameForProvider` 함수를 사용할 수 있습니다.

## Phosphor Icons 설치

Phosphor Icons를 사용하려면 패키지를 설치해야 합니다:

```bash
cd packages/hua-ui
pnpm add @phosphor-icons/react
```

또는 루트에서:

```bash
pnpm add @phosphor-icons/react --filter @hua-labs/ui
```

## 주의사항

1. **Phosphor Icons는 선택적 의존성**입니다. 사용하지 않으면 설치할 필요가 없습니다.
2. **Untitled Icons**는 현재 SVG 기반이므로, 직접 SVG를 사용하거나 별도 컴포넌트로 구현해야 합니다.
3. **서버 사이드 렌더링**: 모든 아이콘은 클라이언트 사이드에서만 렌더링됩니다 (hydration 오류 방지).

