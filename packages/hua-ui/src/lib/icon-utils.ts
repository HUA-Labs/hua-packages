/**
 * Icon Utility Functions
 *
 * 아이콘 이름 정규화 등 공통 유틸리티
 * Common utilities for icon name normalization, etc.
 */

/**
 * 아이콘 이름을 PascalCase로 정규화
 *
 * Normalizes icon name to PascalCase.
 * Handles all common naming conventions:
 * - lowercase: heart → Heart
 * - UPPERCASE: HEART → Heart
 * - camelCase: heartCircle → HeartCircle
 * - PascalCase: HeartCircle → HeartCircle (unchanged)
 * - kebab-case: heart-circle → HeartCircle
 * - snake_case: heart_circle → HeartCircle
 *
 * @param name - 아이콘 이름 / Icon name
 * @returns PascalCase 아이콘 이름 / PascalCase icon name
 */
export function normalizeIconName(name: string): string {
  if (!name) return name

  // 1. kebab-case/snake_case: heart-circle, heart_circle → HeartCircle
  if (/-|_/.test(name)) {
    return name
      .split(/[-_]/)
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('')
  }

  // 2. 전부 대문자: HEART → Heart
  if (name === name.toUpperCase() && name.length > 1) {
    return name.charAt(0) + name.slice(1).toLowerCase()
  }

  // 3. camelCase/PascalCase/lowercase: heartCircle, HeartCircle, heart
  // 소문자+대문자 경계에서 분리 (예: heartCircle → heart Circle)
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

/**
 * Lucide 아이콘 이름 정규화
 * Lucide는 PascalCase 사용 (Heart, ArrowLeft 등)
 */
export function normalizeLucideIconName(name: string): string {
  return normalizeIconName(name)
}

/**
 * Phosphor 아이콘 이름 정규화
 * Phosphor도 PascalCase 사용 (Heart, ArrowLeft 등)
 */
export function normalizePhosphorIconName(name: string): string {
  return normalizeIconName(name)
}

