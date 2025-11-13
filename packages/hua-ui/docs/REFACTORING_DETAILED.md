# 리팩토링 상세 설계

## 1. 공통 타입 시스템

### 파일: `src/lib/types/common.ts`

```typescript
/**
 * 공통 색상 타입
 * 모든 컴포넌트에서 사용하는 표준 색상 팔레트
 */
export type Color = 
  | "blue" 
  | "purple" 
  | "green" 
  | "orange" 
  | "red" 
  | "indigo" 
  | "pink" 
  | "gray";

/**
 * 공통 크기 타입
 */
export type Size = "sm" | "md" | "lg" | "xl";

/**
 * 공통 Variant 타입 (기본)
 */
export type BaseVariant = "default" | "outline" | "elevated";

/**
 * 확장 Variant 타입 (그라데이션 포함)
 */
export type ExtendedVariant = BaseVariant | "gradient";

/**
 * 컴포넌트별 Variant 확장
 */
export type CardVariant = ExtendedVariant;
export type ButtonVariant = 
  | "default" 
  | "destructive" 
  | "outline" 
  | "secondary" 
  | "ghost" 
  | "link" 
  | "gradient" 
  | "neon" 
  | "glass";

/**
 * 공통 Props 인터페이스
 */
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ColorProps {
  color?: Color;
}

export interface SizeProps {
  size?: Size;
}

export interface VariantProps<T extends string = BaseVariant> {
  variant?: T;
}
```

## 2. 공통 색상 시스템

### 파일: `src/lib/styles/colors.ts`

```typescript
import type { Color } from "../types/common";

/**
 * 색상 팔레트 정의
 * Tailwind CSS 색상 시스템 기반
 */
export const colorPalette = {
  blue: {
    50: "blue-50",
    100: "blue-100",
    200: "blue-200",
    300: "blue-300",
    400: "blue-400",
    500: "blue-500",
    600: "blue-600",
    700: "blue-700",
    800: "blue-800",
    900: "blue-900",
  },
  // ... 다른 색상들
} as const;

/**
 * 컴포넌트별 색상 스타일 생성 함수
 */
export interface ColorStyleConfig {
  default?: {
    border?: string;
    background?: string;
    text?: string;
  };
  gradient?: {
    from?: string;
    to?: string;
    border?: string;
  };
  outline?: {
    border?: string;
    background?: string;
    text?: string;
  };
  elevated?: {
    border?: string;
    background?: string;
    shadow?: string;
  };
  icon?: {
    background?: string;
    text?: string;
  };
  badge?: {
    background?: string;
    text?: string;
  };
}

/**
 * 색상 스타일 생성기
 */
export function createColorStyles(
  color: Color,
  config: ColorStyleConfig
): Record<string, string> {
  const palette = colorPalette[color];
  
  return {
    default: createDefaultStyle(palette, config.default),
    gradient: createGradientStyle(palette, config.gradient),
    outline: createOutlineStyle(palette, config.outline),
    elevated: createElevatedStyle(palette, config.elevated),
    icon: createIconStyle(palette, config.icon),
    badge: createBadgeStyle(palette, config.badge),
  };
}

/**
 * 다크 모드 지원 색상 클래스 생성
 */
export function withDarkMode(
  lightClass: string,
  darkClass: string
): string {
  return `${lightClass} dark:${darkClass}`;
}
```

## 3. 공통 Variant 시스템

### 파일: `src/lib/styles/variants.ts`

```typescript
import type { ExtendedVariant } from "../types/common";
import { merge } from "../utils";

/**
 * Variant 스타일 생성 함수
 */
export function createVariantStyles(
  variant: ExtendedVariant,
  colorStyles: Record<string, string>
): string {
  const baseClasses = "rounded-2xl border transition-all duration-200";
  
  switch (variant) {
    case "default":
      return merge(baseClasses, colorStyles.default);
    case "gradient":
      return merge(baseClasses, "text-white", colorStyles.gradient);
    case "outline":
      return merge(baseClasses, colorStyles.outline);
    case "elevated":
      return merge(baseClasses, "shadow-lg", colorStyles.elevated);
    default:
      return baseClasses;
  }
}

/**
 * Size 스타일 생성 함수
 */
export function createSizeStyles(size: Size): {
  container: string;
  icon: string;
  text: string;
} {
  const sizeMap = {
    sm: {
      container: "p-4",
      icon: "w-8 h-8",
      text: "text-sm",
    },
    md: {
      container: "p-6",
      icon: "w-12 h-12",
      text: "text-base",
    },
    lg: {
      container: "p-8",
      icon: "w-16 h-16",
      text: "text-lg",
    },
  };
  
  return sizeMap[size] || sizeMap.md;
}
```

## 4. 컴포넌트 리팩토링 예시

### Before (StatCard.tsx)

```tsx
const colorClasses = {
  blue: {
    default: "border-blue-200 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10",
    gradient: "bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400 dark:border-blue-500",
    // ... 56줄의 중복 코드
  },
  // ... 8개 색상
};
```

### After (StatCard.tsx)

```tsx
import { useColorStyles } from "../../lib/styles/colors";
import { createVariantStyles } from "../../lib/styles/variants";
import type { Color, CardVariant } from "../../lib/types/common";

export const StatCard = ({ color = "blue", variant = "elevated", ...props }) => {
  const colorStyles = useColorStyles(color, {
    default: { border: "200/700", background: "50/50:900/10" },
    gradient: { from: "500", to: "600", border: "400/500" },
    // ... 간결한 설정
  });
  
  const variantClass = createVariantStyles(variant, colorStyles);
  
  // ... 컴포넌트 로직
};
```

## 5. 사용 예시

### 새로운 API 사용법

```tsx
import { StatCard, QuickActionCard } from '@hua-labs/ui';

// 간단하고 직관적
<StatCard
  title="사용자"
  value={100}
  color="purple"
  variant="elevated"
/>

// 타입 안전성 보장
<QuickActionCard
  title="액션"
  color="blue"  // 자동완성으로 8개 색상만 제안
  variant="gradient"  // 자동완성으로 variant 제안
/>
```

## 6. 마이그레이션 체크리스트

### 개발자용 체크리스트

- [ ] `color` prop이 올바른 타입인지 확인
- [ ] `variant` prop이 컴포넌트에서 지원하는지 확인
- [ ] 다크 모드 스타일이 올바르게 적용되는지 확인
- [ ] 기존 스타일과 동일하게 보이는지 확인

### 자동화 가능한 마이그레이션

```bash
# 마이그레이션 스크립트 실행
npm run migrate:components

# 특정 컴포넌트만 마이그레이션
npm run migrate:components -- --component StatCard
```

## 7. 테스트 전략

### 단위 테스트

```typescript
describe('Color System', () => {
  it('should generate correct color classes', () => {
    const styles = createColorStyles('blue', config);
    expect(styles.default).toContain('blue-200');
  });
  
  it('should support dark mode', () => {
    const styles = withDarkMode('bg-blue-50', 'bg-blue-900');
    expect(styles).toContain('dark:bg-blue-900');
  });
});
```

### 통합 테스트

```typescript
describe('StatCard', () => {
  it('should render with correct color', () => {
    render(<StatCard color="purple" />);
    expect(screen.getByRole('article')).toHaveClass('purple');
  });
});
```

## 8. 성능 고려사항

### 메모이제이션

```typescript
// 색상 스타일 메모이제이션
const colorStylesCache = new Map();

export function useColorStyles(color: Color, config: ColorStyleConfig) {
  const key = `${color}-${JSON.stringify(config)}`;
  
  if (!colorStylesCache.has(key)) {
    colorStylesCache.set(key, createColorStyles(color, config));
  }
  
  return colorStylesCache.get(key);
}
```

### 번들 크기 최적화

- Tree-shaking 지원
- 사용하지 않는 색상 제외
- 동적 import 지원

