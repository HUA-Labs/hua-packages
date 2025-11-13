/**
 * HUA UI 공통 타입 정의
 * 모든 컴포넌트에서 사용하는 표준 타입들을 정의합니다.
 */

import type { ReactNode, HTMLAttributes } from "react";

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
 * 기본 Variant 타입
 * 대부분의 컴포넌트에서 사용하는 기본 variant
 */
export type BaseVariant = "default" | "outline" | "elevated";

/**
 * 확장 Variant 타입
 * 그라데이션을 포함한 확장 variant
 */
export type ExtendedVariant = BaseVariant | "gradient";

/**
 * 카드 컴포넌트용 Variant
 */
export type CardVariant = ExtendedVariant;

/**
 * 버튼 컴포넌트용 Variant
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
 * 배지 컴포넌트용 Variant
 */
export type BadgeVariant = 
  | "default" 
  | "secondary" 
  | "destructive" 
  | "outline" 
  | "glass";

/**
 * 공통 Props 인터페이스
 */
export interface BaseComponentProps extends HTMLAttributes<HTMLElement> {
  className?: string;
  children?: ReactNode;
}

/**
 * 색상 Props 인터페이스
 */
export interface ColorProps {
  color?: Color;
}

/**
 * 크기 Props 인터페이스
 */
export interface SizeProps {
  size?: Size;
}

/**
 * Variant Props 인터페이스
 * @template T - Variant 타입 (기본값: BaseVariant)
 */
export interface VariantProps<T extends string = BaseVariant> {
  variant?: T;
}

/**
 * 색상과 Variant를 모두 포함하는 Props
 */
export interface ColorVariantProps<T extends string = BaseVariant> 
  extends ColorProps, 
          VariantProps<T> {}

/**
 * 로딩 상태 Props
 */
export interface LoadingProps {
  loading?: boolean;
}

/**
 * 아이콘 Props
 */
export interface IconProps {
  icon?: ReactNode;
}

