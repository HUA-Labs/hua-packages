/**
 * HUA UI 공통 색상 시스템
 * 중앙화된 색상 팔레트와 스타일 생성 유틸리티
 */

import type { Color } from "../types/common";
import { merge } from "../utils";

/**
 * Tailwind CSS 색상 클래스 매핑
 * 각 색상의 50-900 단계를 정의합니다.
 */
const colorShades = {
  50: "50",
  100: "100",
  200: "200",
  300: "300",
  400: "400",
  500: "500",
  600: "600",
  700: "700",
  800: "800",
  900: "900",
} as const;

type ColorShade = keyof typeof colorShades;

/**
 * 색상별 클래스 생성 헬퍼
 */
function colorClass(color: Color, shade: ColorShade, prefix: string = ""): string {
  return `${prefix}${color}-${colorShades[shade]}`;
}

/**
 * 다크 모드 지원 클래스 생성
 */
function withDarkMode(lightClass: string, darkClass: string): string {
  return `${lightClass} dark:${darkClass}`;
}

/**
 * 색상 스타일 설정 인터페이스
 */
export interface ColorStyleConfig {
  /** 기본 variant 스타일 */
  default?: {
    border?: { light: ColorShade; dark?: ColorShade };
    background?: { light: ColorShade; dark?: ColorShade; opacity?: string };
  };
  /** 그라데이션 variant 스타일 */
  gradient?: {
    from?: ColorShade;
    to?: ColorShade;
    border?: { light: ColorShade; dark?: ColorShade };
  };
  /** 아웃라인 variant 스타일 */
  outline?: {
    border?: { light: ColorShade; dark?: ColorShade };
    background?: string;
    text?: { light: ColorShade; dark?: ColorShade };
  };
  /** Elevated variant 스타일 */
  elevated?: {
    border?: { light: ColorShade; dark?: ColorShade };
    background?: { light: string; dark: string };
    shadow?: string;
  };
  /** 아이콘 스타일 */
  icon?: {
    background?: { light: ColorShade; dark?: ColorShade; opacity?: string };
    text?: { light: ColorShade; dark?: ColorShade };
  };
  /** 배지 스타일 */
  badge?: {
    background?: { light: ColorShade; dark?: ColorShade; opacity?: string };
    text?: { light: ColorShade; dark?: ColorShade };
  };
}

/**
 * 생성된 색상 스타일 인터페이스
 */
export interface ColorStyles {
  default: string;
  gradient: string;
  outline: string;
  elevated: string;
  icon: string;
  badge: string;
}

/**
 * 기본 색상 스타일 설정
 * 각 색상에 대한 기본 스타일 템플릿
 */
const defaultColorConfig: Omit<ColorStyleConfig, "gradient"> = {
  default: {
    border: { light: 200, dark: 700 },
    background: { light: 50, dark: 900, opacity: "50" },
  },
  outline: {
    border: { light: 300, dark: 600 },
    background: "transparent",
    text: { light: 600, dark: 400 },
  },
  elevated: {
    border: { light: 200, dark: 700 },
    background: { light: "white", dark: "gray-800" },
    shadow: "lg",
  },
  icon: {
    background: { light: 100, dark: 900, opacity: "30" },
    text: { light: 600, dark: 400 },
  },
  badge: {
    background: { light: 50, dark: 900, opacity: "30" },
    text: { light: 700, dark: 300 },
  },
};

/**
 * 그라데이션 스타일 설정
 */
const gradientConfig: ColorStyleConfig["gradient"] = {
  from: 500,
  to: 600,
  border: { light: 400, dark: 500 },
};

/**
 * 색상 스타일 생성 함수
 * 
 * @param color - 색상 이름
 * @param config - 커스텀 스타일 설정 (선택사항)
 * @returns 생성된 색상 스타일 객체
 * 
 * @example
 * ```tsx
 * const styles = createColorStyles("blue");
 * // styles.default, styles.gradient, styles.outline 등 사용 가능
 * ```
 */
export function createColorStyles(
  color: Color,
  config?: Partial<ColorStyleConfig>
): ColorStyles {
  const finalConfig: ColorStyleConfig = {
    default: config?.default || defaultColorConfig.default,
    gradient: config?.gradient || gradientConfig,
    outline: config?.outline || defaultColorConfig.outline,
    elevated: config?.elevated || defaultColorConfig.elevated,
    icon: config?.icon || defaultColorConfig.icon,
    badge: config?.badge || defaultColorConfig.badge,
  };

  // Default variant
  const defaultBorder = finalConfig.default?.border
    ? withDarkMode(
        `border-${colorClass(color, finalConfig.default.border.light)}`,
        `border-${colorClass(color, finalConfig.default.border.dark || finalConfig.default.border.light)}`
      )
    : "";
  
  const defaultBg = finalConfig.default?.background
    ? withDarkMode(
        `bg-${colorClass(color, finalConfig.default.background.light)}${finalConfig.default.background.opacity ? `/${finalConfig.default.background.opacity}` : ""}`,
        `bg-${colorClass(color, finalConfig.default.background.dark || finalConfig.default.background.light)}${finalConfig.default.background.opacity ? `/${finalConfig.default.background.opacity}` : ""}`
      )
    : "";

  const defaultStyle = merge(defaultBorder, defaultBg);

  // Gradient variant
  const gradientFrom = finalConfig.gradient?.from
    ? `from-${colorClass(color, finalConfig.gradient.from)}`
    : "";
  const gradientTo = finalConfig.gradient?.to
    ? `to-${colorClass(color, finalConfig.gradient.to)}`
    : "";
  const gradientBorder = finalConfig.gradient?.border
    ? withDarkMode(
        `border-${colorClass(color, finalConfig.gradient.border.light)}`,
        `border-${colorClass(color, finalConfig.gradient.border.dark || finalConfig.gradient.border.light)}`
      )
    : "";
  
  const gradientStyle = merge(
    "bg-gradient-to-br",
    gradientFrom,
    gradientTo,
    gradientBorder
  );

  // Outline variant
  const outlineBorder = finalConfig.outline?.border
    ? `border-2 ${withDarkMode(
        `border-${colorClass(color, finalConfig.outline.border.light)}`,
        `border-${colorClass(color, finalConfig.outline.border.dark || finalConfig.outline.border.light)}`
      )}`
    : "";
  const outlineBg = finalConfig.outline?.background || "bg-transparent";
  const outlineText = finalConfig.outline?.text
    ? withDarkMode(
        `text-${colorClass(color, finalConfig.outline.text.light)}`,
        `text-${colorClass(color, finalConfig.outline.text.dark || finalConfig.outline.text.light)}`
      )
    : "";
  
  const outlineStyle = merge(outlineBorder, outlineBg, outlineText);

  // Elevated variant
  const elevatedBorder = finalConfig.elevated?.border
    ? withDarkMode(
        `border-${colorClass(color, finalConfig.elevated.border.light)}`,
        `border-${colorClass(color, finalConfig.elevated.border.dark || finalConfig.elevated.border.light)}`
      )
    : "";
  const elevatedBg = finalConfig.elevated?.background
    ? withDarkMode(
        `bg-${finalConfig.elevated.background.light}`,
        `bg-${finalConfig.elevated.background.dark}`
      )
    : "";
  const elevatedShadow = finalConfig.elevated?.shadow
    ? `shadow-${finalConfig.elevated.shadow}`
    : "";
  
  const elevatedStyle = merge(elevatedBorder, elevatedBg, elevatedShadow);

  // Icon style
  const iconBg = finalConfig.icon?.background
    ? withDarkMode(
        `bg-${colorClass(color, finalConfig.icon.background.light)}${finalConfig.icon.background.opacity ? `/${finalConfig.icon.background.opacity}` : ""}`,
        `bg-${colorClass(color, finalConfig.icon.background.dark || finalConfig.icon.background.light)}${finalConfig.icon.background.opacity ? `/${finalConfig.icon.background.opacity}` : ""}`
      )
    : "";
  const iconText = finalConfig.icon?.text
    ? withDarkMode(
        `text-${colorClass(color, finalConfig.icon.text.light)}`,
        `text-${colorClass(color, finalConfig.icon.text.dark || finalConfig.icon.text.light)}`
      )
    : "";
  
  const iconStyle = merge(iconBg, iconText);

  // Badge style
  const badgeBg = finalConfig.badge?.background
    ? withDarkMode(
        `bg-${colorClass(color, finalConfig.badge.background.light)}${finalConfig.badge.background.opacity ? `/${finalConfig.badge.background.opacity}` : ""}`,
        `bg-${colorClass(color, finalConfig.badge.background.dark || finalConfig.badge.background.light)}${finalConfig.badge.background.opacity ? `/${finalConfig.badge.background.opacity}` : ""}`
      )
    : "";
  const badgeText = finalConfig.badge?.text
    ? withDarkMode(
        `text-${colorClass(color, finalConfig.badge.text.light)}`,
        `text-${colorClass(color, finalConfig.badge.text.dark || finalConfig.badge.text.light)}`
      )
    : "";
  
  const badgeStyle = merge(badgeBg, badgeText);

  return {
    default: defaultStyle,
    gradient: gradientStyle,
    outline: outlineStyle,
    elevated: elevatedStyle,
    icon: iconStyle,
    badge: badgeStyle,
  };
}

/**
 * 색상 스타일 캐시
 * 동일한 색상과 설정에 대해 재사용하여 성능 최적화
 */
const colorStylesCache = new Map<string, ColorStyles>();

/**
 * 메모이제이션된 색상 스타일 생성 함수
 * 
 * @param color - 색상 이름
 * @param config - 커스텀 스타일 설정 (선택사항)
 * @returns 생성된 색상 스타일 객체
 */
export function useColorStyles(
  color: Color,
  config?: Partial<ColorStyleConfig>
): ColorStyles {
  const cacheKey = `${color}-${JSON.stringify(config || {})}`;
  
  if (!colorStylesCache.has(cacheKey)) {
    colorStylesCache.set(cacheKey, createColorStyles(color, config));
  }
  
  return colorStylesCache.get(cacheKey)!;
}

