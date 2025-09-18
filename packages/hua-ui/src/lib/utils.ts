import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * HUA UI의 스마트 클래스 병합 유틸리티
 * clsx와 tailwind-merge를 결합하여 중복 클래스를 자동으로 해결합니다.
 * 
 * @param inputs - 병합할 클래스 값들
 * @returns 병합된 클래스 문자열
 * 
 * @example
 * ```tsx
 * merge("px-2 py-1", "px-4") // "py-1 px-4"
 * merge("text-red-500", "text-blue-500") // "text-blue-500"
 * merge("bg-white", "dark:bg-slate-900") // "bg-white dark:bg-slate-900"
 * ```
 */
export function merge(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 조건부 클래스 병합 유틸리티
 * 조건에 따라 클래스를 선택적으로 병합합니다.
 * 
 * @param condition - 클래스를 적용할 조건
 * @param trueClass - 조건이 true일 때 적용할 클래스
 * @param falseClass - 조건이 false일 때 적용할 클래스 (선택사항)
 * @returns 병합된 클래스 문자열
 * 
 * @example
 * ```tsx
 * mergeIf(isActive, "bg-blue-500", "bg-gray-200")
 * mergeIf(isLoading, "opacity-50 cursor-not-allowed")
 * ```
 */
export function mergeIf(
  condition: boolean,
  trueClass: ClassValue,
  falseClass?: ClassValue
) {
  return merge(condition ? trueClass : falseClass || "")
}

/**
 * 객체 기반 클래스 병합 유틸리티
 * 객체의 키-값 쌍을 기반으로 조건부 클래스를 병합합니다.
 * 
 * @param classMap - 클래스 맵 객체
 * @returns 병합된 클래스 문자열
 * 
 * @example
 * ```tsx
 * mergeMap({
 *   "bg-blue-500": isPrimary,
 *   "bg-gray-500": !isPrimary,
 *   "text-white": true,
 *   "opacity-50": isDisabled
 * })
 * ```
 */
export function mergeMap(classMap: Record<string, boolean | undefined | null>) {
  const classes = Object.entries(classMap)
    .filter(([, condition]) => condition)
    .map(([className]) => className)
  
  return merge(...classes)
}

// 하위 호환성을 위해 cn도 export (점진적 마이그레이션 지원)
export const cn = merge 