/**
 * CVA 공통 상수 — 전 컴포넌트에서 재사용
 *
 * 모든 CVA variant 정의에서 import하여 사용합니다.
 * @example
 * import { SHARED_DISABLED, SHARED_FOCUS } from '../lib/styles/cva-base'
 */

/** 비활성 상태 공통 스타일 */
export const SHARED_DISABLED =
  'disabled:pointer-events-none disabled:opacity-50' as const

/** 포커스 링 공통 스타일 */
export const SHARED_FOCUS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2' as const

/** 트랜지션 공통 스타일 */
export const SHARED_TRANSITION =
  'transition-colors duration-150' as const

/** 글래스모피즘 공통 스타일 */
export const SHARED_GLASS =
  'backdrop-blur-md border-white/20 bg-white/10 dark:bg-white/5' as const

/**
 * 폼 상태 스타일 (error / success)
 * Input, Select, Textarea, Switch 등 전체 폼 컴포넌트에서 사용
 */
export const FORM_STATE = {
  error: 'border-destructive focus-visible:ring-destructive',
  success: 'border-green-500 focus-visible:ring-green-500',
} as const

/**
 * HUA 시그니처 스프링 이징
 * cubic-bezier(0.34, 1.56, 0.64, 1) — "쫀득한" 느낌
 */
export const HUA_SPRING_EASING =
  'cubic-bezier(0.34, 1.56, 0.64, 1)' as const

/** 마이크로 모션 기본 트랜지션 */
export const SHARED_MICRO_MOTION =
  'transition-all duration-[180ms]' as const
