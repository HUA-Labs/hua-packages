# UI 패키지 스타일 시스템 개선 제안

**작성일**: 2026-01-07  
**목적**: UI 패키지의 스타일 관리 일원화, 테마 시스템 통합, 래퍼 복잡도 감소  
**검토 범위**: `packages/hua-ui/src/components` 전체, `packages/hua-ux/src/framework/components` (BrandedButton, BrandedCard)

---

## 📋 현재 문제점 분석

### 1. 버튼 래퍼 복잡도 문제

#### Button 컴포넌트의 복잡성
```tsx
// packages/hua-ui/src/components/Button.tsx
const variantClasses: Record<Variant, string> = {
  default: "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
  destructive: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
  outline: "border-2 border-blue-600 bg-transparent text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20",
  // ... 9개 variant × 다크모드 = 18개 클래스 문자열
};

const sizeClasses: Record<Size, string> = { /* ... */ };
const roundedClasses: Record<Rounded, string> = { /* ... */ };
const shadowClasses: Record<Shadow, string> = { /* ... */ };
const hoverClasses: Record<Hover, string> = { /* ... */ };
const focusClasses: Record<Variant, string> = { /* ... */ };
```

**문제점**:
- 6개의 클래스 맵이 하드코딩되어 있음
- 다크 모드 클래스가 각 variant마다 중복 정의
- 스타일 시스템(`colors.ts`, `variants.ts`)이 있지만 활용 안 됨
- 총 340줄의 코드 중 스타일 정의가 200줄 이상

#### BrandedButton 래퍼의 문제
```tsx
// packages/hua-ux/src/framework/components/BrandedButton.tsx
export const BrandedButton = React.forwardRef((props, ref) => {
  const branding = useBranding();
  let brandingClasses = '';
  
  if (branding?.colors) {
    if (variant === 'default' && branding.colors.primary) {
      brandingClasses = 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] hover:opacity-90';
    }
    // ... 조건부 클래스 생성
  }
  
  return <Button ref={ref} variant={variant} className={merge(brandingClasses, className)} {...restProps} />;
});
```

**문제점**:
- 별도 래퍼 컴포넌트로 복잡도 증가
- Button 자체에 branding 지원이 없어서 래퍼 필요
- CSS 변수 방식은 좋지만 통합이 안 됨

### 2. 스타일 관리 일원화 부재

#### 현재 상태
- ✅ `lib/styles/colors.ts`: 색상 시스템 존재
- ✅ `lib/styles/variants.ts`: Variant 시스템 존재
- ❌ **하지만 컴포넌트에서 사용 안 함**

**예시**:
```tsx
// Button.tsx - 하드코딩
const variantClasses: Record<Variant, string> = {
  default: "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
  // ...
};

// colors.ts - 사용 가능하지만 활용 안 됨
export function createColorStyles(color: Color, config?: Partial<ColorStyleConfig>): ColorStyles {
  // 색상 스타일 생성 로직
}

// variants.ts - 사용 가능하지만 활용 안 됨
export function createVariantStyles(variant: ExtendedVariant, colorStyles: ColorStyles): string {
  // Variant 스타일 생성 로직
}
```

**문제점**:
- 각 컴포넌트마다 `variantClasses`, `sizeClasses`를 개별적으로 정의
- 공통 스타일 시스템이 있지만 활용 안 됨
- 코드 중복이 많음 (약 30개 컴포넌트에서 동일한 패턴 반복)

### 3. 테마 시스템 통합 부족

#### 현재 상태
- ✅ `ThemeProvider` 존재 (light/dark/system)
- ✅ `BrandingProvider` 존재 (CSS 변수 주입)
- ❌ **컴포넌트 스타일과 테마 시스템이 분리됨**

**문제점**:
- 다크 모드 클래스가 각 컴포넌트에 하드코딩 (`dark:bg-blue-500`)
- 테마 변경 시 모든 컴포넌트 수정 필요
- Branding 시스템과 테마 시스템이 통합 안 됨

---

## 🎯 개선 제안

### 제안 1: 통합 스타일 시스템 구축 (우선순위: 높음)

#### 목표
- 모든 컴포넌트가 공통 스타일 시스템 사용
- 테마 시스템과 통합
- Branding 시스템과 통합

#### 구조
```
packages/hua-ui/src/lib/styles/
├── system/
│   ├── theme.ts          # 테마 시스템 (light/dark)
│   ├── tokens.ts         # 디자인 토큰 (색상, 간격, 타이포그래피)
│   ├── variants.ts       # Variant 생성 (기존 개선)
│   └── components.ts    # 컴포넌트별 스타일 팩토리
├── colors.ts             # 색상 시스템 (기존 유지)
├── variants.ts           # Variant 시스템 (기존 개선)
└── utils.ts              # 유틸리티 (기존 유지)
```

#### 구현 예시

**1. 디자인 토큰 시스템**
```tsx
// lib/styles/system/tokens.ts
export interface DesignTokens {
  colors: {
    primary: ColorScale;
    secondary: ColorScale;
    accent: ColorScale;
    // ...
  };
  spacing: {
    sm: string;
    md: string;
    lg: string;
    // ...
  };
  typography: {
    fontFamily: string[];
    fontSize: Record<Size, string>;
    // ...
  };
}

export const defaultTokens: DesignTokens = {
  colors: {
    primary: { light: 'blue-600', dark: 'blue-500' },
    // ...
  },
  // ...
};
```

**2. 테마 통합 Variant 생성**
```tsx
// lib/styles/system/variants.ts
import { defaultTokens } from './tokens';
import { useTheme } from '@hua-labs/ui';

export function createComponentVariant(
  component: 'button' | 'card' | 'input',
  variant: string,
  theme: 'light' | 'dark' = 'light'
): string {
  const tokens = defaultTokens;
  const color = tokens.colors.primary[theme];
  
  switch (component) {
    case 'button':
      return createButtonVariant(variant, color, theme);
    case 'card':
      return createCardVariant(variant, color, theme);
    // ...
  }
}
```

**3. Button 컴포넌트 개선**
```tsx
// components/Button.tsx
import { createButtonStyles } from '../lib/styles/system/components';

const Button = React.forwardRef(({ variant, size, ...props }, ref) => {
  const { resolvedTheme } = useTheme();
  const branding = useBranding();
  
  // 통합 스타일 시스템 사용
  const styles = createButtonStyles({
    variant,
    size,
    theme: resolvedTheme,
    branding: branding?.colors,
  });
  
  return (
    <button
      ref={ref}
      className={merge(styles.base, styles.variant, styles.size, className)}
      {...props}
    />
  );
});
```

### 제안 2: Branding 통합 (우선순위: 높음)

#### 목표
- BrandedButton/Card 래퍼 제거
- Button/Card 자체에 branding 지원

#### 구현 방법

**옵션 1: Button에 branding prop 추가 (권장)**
```tsx
// components/Button.tsx
interface ButtonProps {
  // ... 기존 props
  useBranding?: boolean; // branding 자동 적용 여부
}

const Button = React.forwardRef(({ useBranding = false, variant, ...props }, ref) => {
  const branding = useBranding ? useBranding() : null;
  
  // branding이 있으면 CSS 변수 사용
  const variantStyles = branding?.colors
    ? createBrandedVariantStyles(variant, branding.colors)
    : createDefaultVariantStyles(variant);
  
  // ...
});
```

**옵션 2: Context 기반 자동 적용**
```tsx
// Button이 자동으로 BrandingProvider 감지
const Button = React.forwardRef(({ variant, ...props }, ref) => {
  const branding = useBranding(); // null일 수 있음
  
  // branding이 있으면 자동 적용, 없으면 기본 스타일
  const styles = branding
    ? createBrandedStyles(variant, branding.colors)
    : createDefaultStyles(variant);
  
  // ...
});
```

### 제안 3: 테마 시스템 통합 (우선순위: 중간)

#### 목표
- 다크 모드 클래스 하드코딩 제거
- 테마 변경 시 자동 반영

#### 구현 방법

**테마 토큰 시스템**
```tsx
// lib/styles/system/theme.ts
export interface ThemeTokens {
  light: DesignTokens;
  dark: DesignTokens;
}

export function getThemeTokens(theme: 'light' | 'dark'): DesignTokens {
  return theme === 'light' ? lightTokens : darkTokens;
}

// 컴포넌트에서 사용
const Button = ({ variant, ...props }) => {
  const { resolvedTheme } = useTheme();
  const tokens = getThemeTokens(resolvedTheme);
  
  // 테마 토큰 기반으로 스타일 생성
  const styles = createStyles(variant, tokens);
  // ...
};
```

### 제안 4: 별도 패키지화 검토 (우선순위: 낮음)

#### 고려 사항

**옵션 1: 스타일 시스템만 별도 패키지**
```
@hua-labs/ui-styles
```
- 장점: 다른 프로젝트에서도 재사용 가능
- 단점: 패키지 수 증가, 의존성 관리 복잡

**옵션 2: 테마 시스템만 별도 패키지**
```
@hua-labs/ui-theme
```
- 장점: 테마 로직 분리
- 단점: 현재는 과도할 수 있음

**옵션 3: 통합 유지 (권장)**
- `@hua-labs/ui` 내부에 통합
- `lib/styles/system/` 구조로 정리
- 필요 시 나중에 분리 가능

---

## 📊 개선 효과 예상

### 코드 복잡도 감소
- **Button.tsx**: 340줄 → 150줄 예상 (56% 감소)
- **BrandedButton.tsx**: 제거 가능
- **전체 컴포넌트**: 평균 30% 코드 감소 예상

### 유지보수성 향상
- 스타일 변경 시 한 곳만 수정
- 테마 추가 시 토큰만 추가
- Branding 변경 시 CSS 변수만 수정

### 개발자 경험 개선
- 일관된 API
- 자동 테마 적용
- Branding 자동 적용

---

## 🚀 구현 계획

### Phase 1: 스타일 시스템 구축 (1주)

1. **디자인 토큰 시스템 구축**
   - `lib/styles/system/tokens.ts` 생성
   - 기본 토큰 정의

2. **컴포넌트 스타일 팩토리 생성**
   - `lib/styles/system/components.ts` 생성
   - Button, Card, Input 등 핵심 컴포넌트 스타일 팩토리

3. **Button 컴포넌트 리팩토링**
   - 하드코딩된 클래스 맵 제거
   - 스타일 팩토리 사용

### Phase 2: Branding 통합 (3일)

1. **Button에 branding 지원 추가**
   - `useBranding` prop 또는 자동 감지
   - BrandedButton 래퍼 제거

2. **Card에 branding 지원 추가**
   - BrandedCard 래퍼 제거

### Phase 3: 테마 시스템 통합 (3일)

1. **테마 토큰 시스템 구축**
   - light/dark 토큰 정의
   - 테마 전환 시 자동 반영

2. **컴포넌트 테마 통합**
   - 다크 모드 하드코딩 제거
   - 테마 토큰 기반 스타일 생성

### Phase 4: 전체 컴포넌트 적용 (1주)

1. **나머지 컴포넌트 리팩토링**
   - Input, Select, Card 등
   - 공통 스타일 시스템 적용

2. **테스트 및 검증**
   - 빌드 테스트
   - 시각적 회귀 테스트

---

## 📝 구체적 구현 예시

### Before (현재)
```tsx
// Button.tsx - 340줄
const variantClasses: Record<Variant, string> = {
  default: "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
  destructive: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
  // ... 9개 variant
};

const sizeClasses: Record<Size, string> = { /* ... */ };
const roundedClasses: Record<Rounded, string> = { /* ... */ };
// ... 총 6개 클래스 맵

// BrandedButton.tsx - 별도 래퍼
export const BrandedButton = ({ variant, ...props }) => {
  const branding = useBranding();
  let brandingClasses = '';
  if (branding?.colors) {
    if (variant === 'default') {
      brandingClasses = 'bg-[var(--color-primary)] ...';
    }
  }
  return <Button className={merge(brandingClasses, className)} {...props} />;
};
```

### After (개선 후)
```tsx
// lib/styles/system/components.ts
export function createButtonStyles({
  variant,
  size,
  rounded,
  shadow,
  hover,
  theme,
  branding,
}: ButtonStyleOptions): ButtonStyles {
  const tokens = getThemeTokens(theme);
  const color = branding?.primary || tokens.colors.primary[theme];
  
  return {
    base: 'inline-flex items-center justify-center ...',
    variant: createVariantStyle(variant, color, theme),
    size: createSizeStyle(size),
    rounded: createRoundedStyle(rounded),
    shadow: createShadowStyle(shadow),
    hover: createHoverStyle(hover),
  };
}

// Button.tsx - 150줄
const Button = React.forwardRef(({ variant, size, useBranding, ...props }, ref) => {
  const { resolvedTheme } = useTheme();
  const branding = useBranding ? useBranding() : null;
  
  const styles = createButtonStyles({
    variant,
    size,
    theme: resolvedTheme,
    branding: branding?.colors,
  });
  
  return (
    <button
      ref={ref}
      className={merge(styles.base, styles.variant, styles.size, className)}
      {...props}
    />
  );
});

// BrandedButton.tsx - 제거됨 (Button에 통합)
```

---

## 🏷️ 태그

#ui-package #style-system #theme #branding #refactor #design-tokens #component-improvement

---

## 📚 참고 자료

- [HUA UI 패키지 개선 제안서](../archive/completed-tasks/HUA_UI_PACKAGE_IMPROVEMENT_PROPOSAL.md) - 접근성, 타입 안정성 개선
- [UI 패키지 분리 전략](./packages/hua-ui/UI_PACKAGE_STRATEGY.md) - Core/Pro 분리 전략
- [Design Tokens 표준](https://tr.designtokens.org/format/) - 디자인 토큰 표준 참고

---

**작성일**: 2026-01-07  
**작성자**: AI Assistant  
**상태**: 제안 단계
