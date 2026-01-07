/**
 * HUA UI 컴포넌트 스타일 팩토리
 * 각 컴포넌트별 스타일 생성 함수
 */

import { merge } from "../../utils";
import type { Theme } from "./theme";
import {
  getThemeColorClassWithDark,
  getThemeTokens,
} from "./theme";
import { createRoundedStyles, createShadowStyles, createHoverStyles } from "../variants";

/**
 * Button Variant 타입
 */
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
 * Button Size 타입
 */
export type ButtonSize = "sm" | "md" | "lg" | "xl" | "icon";

/**
 * Button Rounded 타입
 */
export type ButtonRounded = "sm" | "md" | "lg" | "full";

/**
 * Button Shadow 타입
 */
export type ButtonShadow = "none" | "sm" | "md" | "lg" | "xl";

/**
 * Button Hover 타입
 */
export type ButtonHover = "scale" | "glow" | "slide" | "none";

/**
 * Branding 색상 인터페이스
 */
export interface BrandingColors {
  primary?: string;
  secondary?: string;
  accent?: string;
}

/**
 * Button 스타일 옵션
 */
export interface ButtonStyleOptions {
  variant: ButtonVariant;
  size: ButtonSize;
  rounded?: ButtonRounded;
  shadow?: ButtonShadow;
  hover?: ButtonHover;
  theme: Theme;
  branding?: BrandingColors;
  reducedMotion?: boolean;
}

/**
 * Button 스타일 결과
 */
export interface ButtonStyles {
  base: string;
  variant: string;
  size: string;
  rounded: string;
  shadow: string;
  hover: string;
  focus: string;
}

/**
 * Button Variant 스타일 생성
 * 
 * @param variant - Button variant
 * @param theme - 테마
 * @param branding - Branding 색상 (선택사항)
 * @returns Variant 클래스 문자열
 */
function createButtonVariantStyle(
  variant: ButtonVariant,
  theme: Theme,
  branding?: BrandingColors
): string {
  const tokens = getThemeTokens(theme);

  // Branding이 있으면 CSS 변수 사용
  if (branding) {
    switch (variant) {
      case "default":
        if (branding.primary) {
          return "bg-[var(--color-primary)] text-white border-[var(--color-primary)] hover:opacity-90";
        }
        break;
      case "secondary":
        if (branding.secondary) {
          return "bg-[var(--color-secondary)] text-white border-[var(--color-secondary)] hover:opacity-90";
        }
        break;
      case "outline":
        if (branding.accent) {
          return "border-[var(--color-accent)] text-[var(--color-accent)] bg-transparent hover:bg-[var(--color-accent)]/10";
        }
        break;
    }
  }

  // 기본 스타일 (토큰 기반)
  const primaryBg = getThemeColorClassWithDark("primary", "bg-");
  const primaryHover = primaryBg.replace("bg-", "hover:bg-");
  const destructiveBg = getThemeColorClassWithDark("destructive", "bg-");
  const destructiveHover = destructiveBg.replace("bg-", "hover:bg-");
  const accentBorder = getThemeColorClassWithDark("accent", "border-");
  const accentText = getThemeColorClassWithDark("accent", "text-");
  const accentHover = accentBorder.replace("border-", "hover:bg-");
  const secondaryBg = getThemeColorClassWithDark("secondary", "bg-");
  const secondaryHover = secondaryBg.replace("bg-", "hover:bg-");
  const foregroundText = getThemeColorClassWithDark("foreground", "text-");
  const mutedHover = getThemeColorClassWithDark("muted", "bg-").replace("bg-", "hover:bg-");
  const primaryText = getThemeColorClassWithDark("primary", "text-");
  const primaryTextHover = primaryText.replace("text-", "hover:text-");

  switch (variant) {
    case "default":
      return merge(
        primaryBg,
        "text-white",
        primaryHover
      );

    case "destructive":
      return merge(
        destructiveBg,
        "text-white",
        destructiveHover
      );

    case "outline":
      return merge(
        "border-2",
        accentBorder,
        "bg-transparent",
        accentText,
        accentHover + "/10"
      );

    case "secondary":
      return merge(
        secondaryBg,
        foregroundText,
        secondaryHover
      );

    case "ghost":
      return merge(
        "bg-transparent",
        foregroundText,
        mutedHover
      );

    case "link":
      return merge(
        "bg-transparent",
        primaryText,
        "underline",
        primaryTextHover
      );

    case "gradient":
      return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg";

    case "neon":
      return "bg-gray-900 text-cyan-400 border border-cyan-400/30 shadow-lg shadow-cyan-400/20 hover:shadow-cyan-400/40";

    case "glass":
      return "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20";

    default:
      return "";
  }
}

/**
 * Button Size 스타일 생성
 * 
 * @param size - Button size
 * @returns Size 클래스 문자열
 */
function createButtonSizeStyle(size: ButtonSize): string {
  const sizeMap: Record<ButtonSize, string> = {
    sm: "h-8 px-3 py-1 text-sm",
    md: "h-10 px-4 py-2 text-base",
    lg: "h-12 px-6 py-3 text-lg",
    xl: "h-14 px-8 py-4 text-xl",
    icon: "h-10 w-10 p-0",
  };

  return sizeMap[size];
}

/**
 * Button Focus 스타일 생성
 * 
 * @param variant - Button variant
 * @param theme - 테마
 * @returns Focus 클래스 문자열
 */
function createButtonFocusStyle(
  variant: ButtonVariant,
  theme: Theme
): string {
  const tokens = getThemeTokens(theme);

  switch (variant) {
    case "default":
      return "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-1";

    case "destructive":
      return "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500 focus-visible:ring-offset-1";

    case "outline":
      return "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-300 dark:focus-visible:ring-blue-600 focus-visible:ring-offset-0";

    case "secondary":
      return "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:ring-offset-1";

    case "ghost":
      return "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-600 focus-visible:ring-offset-0";

    case "link":
      return "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 focus-visible:ring-offset-0";

    case "gradient":
      return "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-1";

    case "neon":
      return "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 focus-visible:ring-offset-1";

    case "glass":
      return "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400/50 focus-visible:ring-offset-0";

    default:
      return "";
  }
}

/**
 * Button 스타일 생성 함수
 * 
 * @param options - Button 스타일 옵션
 * @returns Button 스타일 객체
 * 
 * @example
 * ```tsx
 * const styles = createButtonStyles({
 *   variant: 'default',
 *   size: 'md',
 *   theme: 'light',
 *   branding: { primary: '#0066ff' }
 * });
 * 
 * <button className={merge(styles.base, styles.variant, styles.size)}>
 *   Click me
 * </button>
 * ```
 */
export function createButtonStyles(
  options: ButtonStyleOptions
): ButtonStyles {
  const {
    variant,
    size,
    rounded = "md",
    shadow = "md",
    hover = "scale",
    theme,
    branding,
    reducedMotion = false,
  } = options;

  return {
    base: merge(
      "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200",
      "disabled:pointer-events-none disabled:opacity-50 min-w-fit"
    ),
    variant: createButtonVariantStyle(variant, theme, branding),
    size: createButtonSizeStyle(size),
    rounded: createRoundedStyles(rounded),
    shadow: createShadowStyles(shadow),
    hover: createHoverStyles(hover, reducedMotion),
    focus: createButtonFocusStyle(variant, theme),
  };
}

/**
 * Card Variant 타입
 */
export type CardVariant = "default" | "outline" | "elevated";

/**
 * Card 스타일 옵션
 */
export interface CardStyleOptions {
  variant: CardVariant;
  theme: Theme;
  branding?: BrandingColors;
}

/**
 * Card 스타일 결과
 */
export interface CardStyles {
  base: string;
  variant: string;
}

/**
 * Card Variant 스타일 생성
 * 
 * @param variant - Card variant
 * @param theme - 테마
 * @param branding - Branding 색상 (선택사항)
 * @returns Variant 클래스 문자열
 */
function createCardVariantStyle(
  variant: CardVariant,
  theme: Theme,
  branding?: BrandingColors
): string {
  // Branding이 있으면 CSS 변수 사용
  if (branding) {
    switch (variant) {
      case "outline":
        if (branding.accent) {
          return "border-[var(--color-accent)]";
        }
        break;
      case "default":
        if (branding.primary) {
          return "bg-[var(--color-primary)]/5";
        }
        break;
    }
  }

  // 기본 스타일 (토큰 기반)
  switch (variant) {
    case "default":
      return getThemeColorClassWithDark("background", "bg-") + " " +
        getThemeColorClassWithDark("border", "border-") + " border";

    case "outline":
      return "bg-transparent border-2 " + getThemeColorClassWithDark("border", "border-");

    case "elevated":
      return getThemeColorClassWithDark("background", "bg-") + " " +
        getThemeColorClassWithDark("border", "border-") + " border shadow-lg";

    default:
      return "";
  }
}

/**
 * Card 스타일 생성 함수
 * 
 * @param options - Card 스타일 옵션
 * @returns Card 스타일 객체
 */
export function createCardStyles(
  options: CardStyleOptions
): CardStyles {
  const { variant, theme, branding } = options;

  return {
    base: "rounded-lg p-6",
    variant: createCardVariantStyle(variant, theme, branding),
  };
}
