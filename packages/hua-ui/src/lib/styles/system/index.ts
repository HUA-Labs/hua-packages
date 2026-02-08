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

// 컴포넌트 스타일 타입 (CVA로 마이그레이션됨, 타입만 유지)
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
