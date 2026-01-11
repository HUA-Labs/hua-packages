/**
 * HUA UI 공통 Variant 시스템
 * 컴포넌트 variant 스타일 생성 유틸리티
 */

import type { ExtendedVariant, Size } from "../types/common";
import type { ColorStyles } from "./colors";
import { merge } from "../utils";

/**
 * Variant 스타일 생성 함수
 * 
 * @param variant - Variant 타입
 * @param colorStyles - 색상 스타일 객체
 * @returns 생성된 variant 클래스 문자열
 * 
 * @example
 * ```tsx
 * const colorStyles = useColorStyles("blue");
 * const variantClass = createVariantStyles("elevated", colorStyles);
 * ```
 */
export function createVariantStyles(
  variant: ExtendedVariant,
  colorStyles: ColorStyles
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
      return merge(baseClasses, colorStyles.elevated);
    
    default:
      return baseClasses;
  }
}

/**
 * Size 스타일 설정 인터페이스
 */
export interface SizeStyles {
  container: string;
  icon: string;
  iconContainer: string;
  text: string;
  title: string;
  description: string;
}

/**
 * Size 스타일 생성 함수
 * 
 * @param size - 크기 타입
 * @returns 생성된 size 스타일 객체
 * 
 * @example
 * ```tsx
 * const sizeStyles = createSizeStyles("md");
 * // sizeStyles.container, sizeStyles.icon 등 사용 가능
 * ```
 */
export function createSizeStyles(size: Size = "md"): SizeStyles {
  const sizeMap: Record<Size, SizeStyles> = {
    sm: {
      container: "p-4",
      icon: "h-4 w-4",
      iconContainer: "w-8 h-8",
      text: "text-xs",
      title: "text-xs",
      description: "text-xs",
    },
    md: {
      container: "p-6",
      icon: "h-6 w-6",
      iconContainer: "w-12 h-12",
      text: "text-base",
      title: "text-sm",
      description: "text-sm",
    },
    lg: {
      container: "p-8",
      icon: "h-8 w-8",
      iconContainer: "w-16 h-16",
      text: "text-lg",
      title: "text-base",
      description: "text-base",
    },
    xl: {
      container: "p-10",
      icon: "h-10 w-10",
      iconContainer: "w-20 h-20",
      text: "text-xl",
      title: "text-lg",
      description: "text-lg",
    },
  };
  
  return sizeMap[size];
}

/**
 * Rounded 스타일 타입
 */
export type Rounded = "sm" | "md" | "lg" | "xl" | "full" | "none";

/**
 * Rounded 스타일 생성 함수
 * 
 * @param rounded - Rounded 타입
 * @returns 생성된 rounded 클래스 문자열
 */
export function createRoundedStyles(rounded: Rounded = "md"): string {
  const roundedMap: Record<Rounded, string> = {
    sm: "rounded",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
    none: "rounded-none",
  };
  
  return roundedMap[rounded];
}

/**
 * Shadow 스타일 타입
 */
export type Shadow = "none" | "sm" | "md" | "lg" | "xl" | "2xl";

/**
 * Shadow 스타일 생성 함수
 * 
 * @param shadow - Shadow 타입
 * @returns 생성된 shadow 클래스 문자열
 */
export function createShadowStyles(shadow: Shadow = "md"): string {
  if (shadow === "none") return "";
  
  return `shadow-${shadow}`;
}

/**
 * Hover 효과 타입
 */
export type HoverEffect = "scale" | "glow" | "slide" | "springy" | "none";

/**
 * HUA-UI 스프링 이징
 * 공 튕기듯 아주 미세한 반동 - cubic-bezier(0.34, 1.56, 0.64, 1)
 */
export const HUA_SPRING_EASING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

/**
 * Hover 효과 스타일 생성 함수
 *
 * @param hover - Hover 효과 타입
 * @param reducedMotion - 애니메이션 축소 설정 여부
 * @returns 생성된 hover 클래스 문자열
 *
 * @description
 * HUA-UI 시그니처: "스륵 부드럽고 아주 미세하게 쫀득"
 * - 스프링 이징으로 미세한 반동 효과
 * - 1.5% 스케일 변화로 자연스러운 피드백
 */
export function createHoverStyles(
  hover: HoverEffect = "springy",
  reducedMotion: boolean = false
): string {
  if (reducedMotion || hover === "none") return "";

  // 스프링 이징 스타일 (Tailwind arbitrary value)
  const springTransition = "[transition:transform_180ms_cubic-bezier(0.34,1.56,0.64,1)]";

  const hoverMap: Record<HoverEffect, string> = {
    // HUA-UI 시그니처 스프링 효과 (기본값) - 아주아주 미세하게
    springy: `hover:scale-[1.008] active:scale-[0.992] ${springTransition} transform-gpu`,
    // 기존 scale (스프링 없음)
    scale: "hover:scale-[1.008] active:scale-[0.992] transition-transform duration-200 transform-gpu",
    // 글로우 효과
    glow: "hover:shadow-lg hover:shadow-primary/15 transition-shadow duration-300",
    // 슬라이드 효과 (미세하게)
    slide: `hover:-translate-y-[0.5px] ${springTransition} transform-gpu`,
    none: "",
  };

  return hoverMap[hover];
}

