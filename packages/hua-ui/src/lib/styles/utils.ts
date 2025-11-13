/**
 * HUA UI 스타일 유틸리티 함수
 * 다크 모드, 그라데이션 등 공통 스타일 유틸리티
 */

import { merge } from "../utils";

/**
 * 다크 모드 지원 클래스 생성
 * 
 * @param lightClass - 라이트 모드 클래스
 * @param darkClass - 다크 모드 클래스
 * @returns 다크 모드 지원 클래스 문자열
 * 
 * @example
 * ```tsx
 * withDarkMode("bg-white", "bg-gray-900")
 * // "bg-white dark:bg-gray-900"
 * ```
 */
export function withDarkMode(lightClass: string, darkClass: string): string {
  return `${lightClass} dark:${darkClass}`;
}

/**
 * 그라데이션 클래스 생성
 * 
 * @param from - 시작 색상
 * @param to - 끝 색상
 * @param direction - 그라데이션 방향 (기본값: "to-r")
 * @returns 그라데이션 클래스 문자열
 * 
 * @example
 * ```tsx
 * createGradient("blue-500", "purple-600")
 * // "bg-gradient-to-r from-blue-500 to-purple-600"
 * ```
 */
export function createGradient(
  from: string,
  to: string,
  direction: "to-r" | "to-l" | "to-b" | "to-t" | "to-br" | "to-bl" | "to-tr" | "to-tl" = "to-r"
): string {
  return merge(`bg-gradient-${direction}`, `from-${from}`, `to-${to}`);
}

/**
 * 불투명도가 포함된 색상 클래스 생성
 * 
 * @param color - 색상 클래스 (예: "blue-500")
 * @param opacity - 불투명도 (0-100)
 * @returns 불투명도가 포함된 색상 클래스
 * 
 * @example
 * ```tsx
 * withOpacity("blue-500", 50)
 * // "blue-500/50"
 * ```
 */
export function withOpacity(color: string, opacity: number): string {
  return `${color}/${opacity}`;
}

/**
 * 텍스트 색상이 그라데이션 variant일 때 흰색으로 변경하는지 확인
 * 
 * @param variant - Variant 타입
 * @returns 텍스트가 흰색이어야 하는지 여부
 */
export function isTextWhite(variant: string): boolean {
  return variant === "gradient" || variant === "solid";
}

/**
 * 그라데이션 variant인지 확인
 * 
 * @param variant - Variant 타입
 * @returns 그라데이션 variant인지 여부
 */
export function isGradientVariant(variant: string): boolean {
  return variant === "gradient";
}

/**
 * 반응형 클래스 생성 헬퍼
 * 
 * @param base - 기본 클래스
 * @param sm - 작은 화면 클래스
 * @param md - 중간 화면 클래스
 * @param lg - 큰 화면 클래스
 * @param xl - 매우 큰 화면 클래스
 * @returns 반응형 클래스 문자열
 * 
 * @example
 * ```tsx
 * responsive("text-sm", "md:text-base", "lg:text-lg")
 * ```
 */
export function responsive(
  base: string,
  sm?: string,
  md?: string,
  lg?: string,
  xl?: string
): string {
  return merge(
    base,
    sm && `sm:${sm}`,
    md && `md:${md}`,
    lg && `lg:${lg}`,
    xl && `xl:${xl}`
  );
}

/**
 * 조건부 클래스 적용
 * 
 * @param condition - 조건
 * @param trueClass - 조건이 true일 때 적용할 클래스
 * @param falseClass - 조건이 false일 때 적용할 클래스 (선택사항)
 * @returns 조건에 따라 선택된 클래스
 */
export function conditionalClass(
  condition: boolean,
  trueClass: string,
  falseClass?: string
): string {
  return condition ? trueClass : (falseClass || "");
}

