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
 * 상대 시간 포맷팅 유틸리티
 * 
 * 날짜를 상대 시간 형식으로 포맷팅합니다 (예: "방금 전", "5분 전", "2시간 전", "3일 전").
 * 7일 이상 경과한 경우 절대 날짜를 반환합니다.
 * 
 * Formats a date as relative time (e.g., "방금 전", "5분 전", "2시간 전", "3일 전").
 * Returns absolute date for dates older than 7 days.
 * 
 * @param timestamp - 포맷팅할 날짜 (Date 객체 또는 ISO 문자열) / Date to format (Date object or ISO string)
 * @param locale - 로케일 (기본값: "ko-KR") / Locale (default: "ko-KR")
 * @returns 포맷팅된 상대 시간 문자열 / Formatted relative time string
 * 
 * @example
 * ```tsx
 * formatRelativeTime(new Date()) // "방금 전"
 * formatRelativeTime(new Date(Date.now() - 5 * 60000)) // "5분 전"
 * formatRelativeTime(new Date(Date.now() - 2 * 3600000)) // "2시간 전"
 * formatRelativeTime(new Date(Date.now() - 3 * 86400000)) // "3일 전"
 * formatRelativeTime(new Date("2024-01-01")) // "2024. 1. 1." (7일 이상 경과)
 * ```
 */
export function formatRelativeTime(timestamp: Date | string, locale = "ko-KR"): string {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return locale === "ko-KR" ? "방금 전" : "just now";
  if (minutes < 60) return locale === "ko-KR" ? `${minutes}분 전` : `${minutes}m ago`;
  if (hours < 24) return locale === "ko-KR" ? `${hours}시간 전` : `${hours}h ago`;
  if (days < 7) return locale === "ko-KR" ? `${days}일 전` : `${days}d ago`;
  return date.toLocaleDateString(locale);
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