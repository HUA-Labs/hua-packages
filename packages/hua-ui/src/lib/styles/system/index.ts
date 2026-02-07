/**
 * HUA UI 통합 스타일 시스템
 * 디자인 토큰, 테마, 컴포넌트 스타일 통합 export
 */

// 디자인 토큰
export type {
  DesignTokens,
  ColorScale,
} from "./tokens";
export {
  defaultTokens,
  getThemeTokenValue,
  getColorToken,
} from "./tokens";

// 테마 시스템
export type { Theme, ThemeTokens } from "./theme";
export {
  themeTokens,
  getThemeTokens,
  getThemeColorClass,
  withTheme,
  getThemeColorClassWithDark,
} from "./theme";

// 컴포넌트 스타일 팩토리 — CVA로 마이그레이션 완료, 레거시 유지
// @deprecated Button.variants.ts, Card.tsx의 cardVariants 사용
export type {
  ButtonVariant,
  ButtonSize,
  ButtonRounded,
  ButtonShadow,
  ButtonHover,
  ButtonStyleOptions,
  ButtonStyles,
  CardVariant,
  CardStyleOptions,
  CardStyles,
  BrandingColors,
} from "./components";
/** @deprecated Use buttonVariants from Button.variants.ts instead */
export { createButtonStyles } from "./components";
/** @deprecated Use cardVariants from Card.tsx instead */
export { createCardStyles } from "./components";
