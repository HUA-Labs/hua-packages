# HUA UI 스타일 시스템 API 문서

## 개요

HUA UI는 중앙화된 스타일 시스템을 제공하여 일관된 디자인과 쉬운 유지보수를 지원합니다.

## 공통 타입

### Color

```typescript
type Color = 
  | "blue" 
  | "purple" 
  | "green" 
  | "orange" 
  | "red" 
  | "indigo" 
  | "pink" 
  | "gray";
```

모든 컴포넌트에서 사용하는 표준 색상 팔레트입니다.

### Size

```typescript
type Size = "sm" | "md" | "lg" | "xl";
```

표준 크기 시스템입니다.

### Variant

```typescript
// 기본 Variant
type BaseVariant = "default" | "outline" | "elevated";

// 확장 Variant (그라데이션 포함)
type ExtendedVariant = BaseVariant | "gradient";

// 컴포넌트별 Variant
type ButtonVariant = 
  | "default" 
  | "destructive" 
  | "outline" 
  | "secondary" 
  | "ghost" 
  | "link" 
  | "gradient" 
  | "neon" 
  | "glass";

type BadgeVariant = 
  | "default" 
  | "secondary" 
  | "destructive" 
  | "outline" 
  | "glass";

type CardVariant = ExtendedVariant;
```

## 색상 시스템

### `useColorStyles(color, config?)`

색상 스타일을 생성하는 메모이제이션된 함수입니다.

**파라미터:**
- `color: Color` - 색상 이름
- `config?: Partial<ColorStyleConfig>` - 커스텀 스타일 설정 (선택사항)

**반환값:**
```typescript
interface ColorStyles {
  default: string;
  gradient: string;
  outline: string;
  elevated: string;
  icon: string;
  badge: string;
}
```

**예시:**
```tsx
import { useColorStyles } from '@hua-labs/ui/lib/styles';

const styles = useColorStyles("blue");
// styles.default, styles.gradient 등 사용 가능
```

### `createColorStyles(color, config?)`

색상 스타일을 생성하는 함수입니다. (메모이제이션 없음)

**사용 시나리오:**
- 동적 색상이 필요한 경우
- 캐시가 필요 없는 경우

## Variant 시스템

### `createVariantStyles(variant, colorStyles)`

Variant 스타일을 생성합니다.

**파라미터:**
- `variant: ExtendedVariant` - Variant 타입
- `colorStyles: ColorStyles` - 색상 스타일 객체

**반환값:** `string` - 생성된 클래스 문자열

**예시:**
```tsx
import { createVariantStyles, useColorStyles } from '@hua-labs/ui/lib/styles';

const colorStyles = useColorStyles("purple");
const variantClass = createVariantStyles("elevated", colorStyles);
```

### `createSizeStyles(size?)`

Size 스타일을 생성합니다.

**파라미터:**
- `size?: Size` - 크기 (기본값: "md")

**반환값:**
```typescript
interface SizeStyles {
  container: string;
  icon: string;
  iconContainer: string;
  text: string;
  title: string;
  description: string;
}
```

**예시:**
```tsx
import { createSizeStyles } from '@hua-labs/ui/lib/styles';

const sizeStyles = createSizeStyles("lg");
// sizeStyles.container, sizeStyles.icon 등 사용
```

### `createRoundedStyles(rounded?)`

Rounded 스타일을 생성합니다.

**파라미터:**
- `rounded?: Rounded` - Rounded 타입 (기본값: "md")

**반환값:** `string` - 생성된 클래스 문자열

**예시:**
```tsx
import { createRoundedStyles } from '@hua-labs/ui/lib/styles';

const roundedClass = createRoundedStyles("full");
// "rounded-full"
```

### `createShadowStyles(shadow?)`

Shadow 스타일을 생성합니다.

**파라미터:**
- `shadow?: Shadow` - Shadow 타입 (기본값: "md")

**반환값:** `string` - 생성된 클래스 문자열

**예시:**
```tsx
import { createShadowStyles } from '@hua-labs/ui/lib/styles';

const shadowClass = createShadowStyles("lg");
// "shadow-lg"
```

### `createHoverStyles(hover?, reducedMotion?)`

Hover 효과 스타일을 생성합니다.

**파라미터:**
- `hover?: HoverEffect` - Hover 효과 타입 (기본값: "scale")
- `reducedMotion?: boolean` - 애니메이션 축소 설정 (기본값: false)

**반환값:** `string` - 생성된 클래스 문자열

**예시:**
```tsx
import { createHoverStyles } from '@hua-labs/ui/lib/styles';

const hoverClass = createHoverStyles("glow", false);
```

## 스타일 유틸리티

### `withDarkMode(lightClass, darkClass)`

다크 모드 지원 클래스를 생성합니다.

**파라미터:**
- `lightClass: string` - 라이트 모드 클래스
- `darkClass: string` - 다크 모드 클래스

**반환값:** `string` - 다크 모드 지원 클래스 문자열

**예시:**
```tsx
import { withDarkMode } from '@hua-labs/ui/lib/styles/utils';

const className = withDarkMode("bg-white", "bg-gray-900");
// "bg-white dark:bg-gray-900"
```

### `createGradient(from, to, direction?)`

그라데이션 클래스를 생성합니다.

**파라미터:**
- `from: string` - 시작 색상
- `to: string` - 끝 색상
- `direction?: "to-r" | "to-l" | "to-b" | "to-t" | "to-br" | "to-bl" | "to-tr" | "to-tl"` - 방향 (기본값: "to-r")

**반환값:** `string` - 그라데이션 클래스 문자열

**예시:**
```tsx
import { createGradient } from '@hua-labs/ui/lib/styles/utils';

const gradient = createGradient("blue-500", "purple-600", "to-r");
// "bg-gradient-to-r from-blue-500 to-purple-600"
```

### `withOpacity(color, opacity)`

불투명도가 포함된 색상 클래스를 생성합니다.

**파라미터:**
- `color: string` - 색상 클래스
- `opacity: number` - 불투명도 (0-100)

**반환값:** `string` - 불투명도 포함 색상 클래스

**예시:**
```tsx
import { withOpacity } from '@hua-labs/ui/lib/styles/utils';

const color = withOpacity("blue-500", 50);
// "blue-500/50"
```

### `isTextWhite(variant)`

그라데이션 variant일 때 텍스트가 흰색이어야 하는지 확인합니다.

**파라미터:**
- `variant: string` - Variant 타입

**반환값:** `boolean`

### `isGradientVariant(variant)`

그라데이션 variant인지 확인합니다.

**파라미터:**
- `variant: string` - Variant 타입

**반환값:** `boolean`

### `responsive(base, sm?, md?, lg?, xl?)`

반응형 클래스를 생성합니다.

**파라미터:**
- `base: string` - 기본 클래스
- `sm?: string` - 작은 화면 클래스
- `md?: string` - 중간 화면 클래스
- `lg?: string` - 큰 화면 클래스
- `xl?: string` - 매우 큰 화면 클래스

**반환값:** `string` - 반응형 클래스 문자열

**예시:**
```tsx
import { responsive } from '@hua-labs/ui/lib/styles/utils';

const className = responsive("text-sm", "md:text-base", "lg:text-lg");
```

### `conditionalClass(condition, trueClass, falseClass?)`

조건부 클래스를 적용합니다.

**파라미터:**
- `condition: boolean` - 조건
- `trueClass: string` - 조건이 true일 때 클래스
- `falseClass?: string` - 조건이 false일 때 클래스 (선택사항)

**반환값:** `string` - 조건에 따라 선택된 클래스

## 전체 예시

```tsx
import { 
  useColorStyles, 
  createVariantStyles, 
  createSizeStyles,
  withDarkMode 
} from '@hua-labs/ui/lib/styles';
import type { Color, ExtendedVariant } from '@hua-labs/ui/lib/types';

function CustomCard({ 
  color = "blue", 
  variant = "elevated" 
}: { 
  color?: Color; 
  variant?: ExtendedVariant;
}) {
  const colorStyles = useColorStyles(color);
  const variantClass = createVariantStyles(variant, colorStyles);
  const sizeStyles = createSizeStyles("md");
  
  return (
    <div className={variantClass}>
      <div className={sizeStyles.container}>
        {/* 컨텐츠 */}
      </div>
    </div>
  );
}
```

## 주의사항

1. **메모이제이션**: `useColorStyles`는 메모이제이션되어 있으므로 동일한 색상과 설정에 대해 재사용됩니다.
2. **타입 안전성**: 공통 타입을 사용하여 타입 안전성을 보장합니다.
3. **다크 모드**: 모든 스타일은 자동으로 다크 모드를 지원합니다.

