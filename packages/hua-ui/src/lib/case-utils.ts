/**
 * Case Conversion Utilities
 *
 * 문자열 케이스 변환 유틸리티 함수들입니다.
 * Utility functions for string case conversion.
 */

/**
 * 문자열을 camelCase로 변환합니다.
 * Converts a string to camelCase.
 *
 * @param str - 변환할 문자열 / String to convert
 * @returns camelCase 문자열 / camelCase string
 *
 * @example
 * toCamelCase('arrow-left')     // 'arrowLeft'
 * toCamelCase('arrow_left')     // 'arrowLeft'
 * toCamelCase('ArrowLeft')      // 'arrowLeft'
 * toCamelCase('arrowLeft')      // 'arrowLeft'
 * toCamelCase('HEART')          // 'heart'
 */
export function toCamelCase(str: string): string {
  if (!str) return str

  // 이미 camelCase인지 확인 (kebab/snake가 아니고 첫 글자가 소문자)
  if (!/[-_]/.test(str) && /^[a-z]/.test(str)) {
    return str
  }

  // 전체가 대문자인 경우 (HEART, USER 등) → 전체 소문자로
  if (/^[A-Z]+$/.test(str)) {
    return str.toLowerCase()
  }

  // PascalCase를 camelCase로 변환 (ArrowLeft → arrowLeft)
  if (/^[A-Z]/.test(str) && !/[-_]/.test(str)) {
    return str.charAt(0).toLowerCase() + str.slice(1)
  }

  // kebab-case 또는 snake_case를 camelCase로 변환
  return str
    .split(/[-_]/)
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase()
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join('')
}

/**
 * 문자열을 PascalCase로 변환합니다.
 * Converts a string to PascalCase.
 *
 * @param str - 변환할 문자열 / String to convert
 * @returns PascalCase 문자열 / PascalCase string
 *
 * @example
 * toPascalCase('arrow-left')    // 'ArrowLeft'
 * toPascalCase('arrow_left')    // 'ArrowLeft'
 * toPascalCase('arrowLeft')     // 'ArrowLeft'
 * toPascalCase('ArrowLeft')     // 'ArrowLeft'
 */
export function toPascalCase(str: string): string {
  if (!str) return str

  // 이미 PascalCase인지 확인
  if (/^[A-Z]/.test(str) && !/[-_]/.test(str)) {
    return str
  }

  // kebab-case 또는 snake_case가 포함된 경우
  if (/[-_]/.test(str)) {
    return str
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('')
  }

  // camelCase를 PascalCase로 변환
  return str.charAt(0).toUpperCase() + str.slice(1)
}
