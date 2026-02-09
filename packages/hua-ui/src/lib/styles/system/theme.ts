/**
 * HUA UI 테마 시스템
 * 테마 토큰 관리 및 테마 전환 지원
 */

import type { DesignTokens } from "./tokens";
import { defaultTokens, getColorToken } from "./tokens";

/**
 * 테마 타입
 */
export type Theme = "light" | "dark";

/**
 * 테마 토큰 인터페이스
 * light/dark 테마별 토큰 정의
 */
export interface ThemeTokens {
  light: DesignTokens;
  dark: DesignTokens;
}

/**
 * 기본 테마 토큰
 * 현재는 defaultTokens를 양쪽 테마에 사용
 * 향후 테마별 커스터마이징 가능
 */
export const themeTokens: ThemeTokens = {
  light: defaultTokens,
  dark: defaultTokens,
};

/**
 * 테마별 토큰 가져오기
 * 
 * @param theme - 테마 ('light' | 'dark')
 * @returns 해당 테마의 디자인 토큰
 */
export function getThemeTokens(theme: Theme): DesignTokens {
  return themeTokens[theme];
}

/**
 * 테마별 색상 클래스 생성
 * Tailwind CSS 클래스 형식으로 반환
 * 
 * @param theme - 테마
 * @param colorKey - 색상 키
 * @param prefix - 클래스 접두사 ('bg-', 'text-', 'border-' 등)
 * @returns Tailwind CSS 클래스 문자열
 * 
 * @example
 * ```tsx
 * getThemeColorClass('light', 'primary', 'bg-')
 * // "bg-blue-600"
 * 
 * getThemeColorClass('dark', 'primary', 'bg-')
 * // "bg-blue-500"
 * ```
 */
export function getThemeColorClass(
  theme: Theme,
  colorKey: keyof DesignTokens["colors"],
  prefix: "bg-" | "text-" | "border-" | "" = ""
): string {
  const color = getColorToken(theme, colorKey);
  return prefix ? `${prefix}${color}` : color;
}

/**
 * 다크 모드 지원 클래스 생성
 * light/dark 테마 모두 지원하는 Tailwind 클래스 생성
 * 
 * @param lightClass - 라이트 모드 클래스
 * @param darkClass - 다크 모드 클래스
 * @returns 다크 모드 지원 클래스 문자열
 * 
 * @example
 * ```tsx
 * withTheme('bg-blue-600', 'bg-blue-500')
 * // "bg-blue-600 dark:bg-blue-500"
 * ```
 */
export function withTheme(lightClass: string, darkClass: string): string {
  return `${lightClass} dark:${darkClass}`;
}

/**
 * 테마별 색상 클래스 생성 (다크 모드 지원)
 * 
 * @param colorKey - 색상 키
 * @param prefix - 클래스 접두사
 * @returns 다크 모드 지원 클래스 문자열
 * 
 * @example
 * ```tsx
 * getThemeColorClassWithDark('primary', 'bg-')
 * // "bg-blue-600 dark:bg-blue-500"
 * ```
 */
export function getThemeColorClassWithDark(
  colorKey: keyof DesignTokens["colors"],
  prefix: "bg-" | "text-" | "border-" | "" = ""
): string {
  const lightColor = getColorToken("light", colorKey);
  const darkColor = getColorToken("dark", colorKey);

  // CSS 변수 기반 색상이면 dark: prefix 불필요
  if (lightColor === darkColor) {
    return prefix ? `${prefix}${lightColor}` : lightColor;
  }

  const lightClass = prefix ? `${prefix}${lightColor}` : lightColor;
  const darkClass = prefix ? `${prefix}${darkColor}` : darkColor;

  return withTheme(lightClass, darkClass);
}
