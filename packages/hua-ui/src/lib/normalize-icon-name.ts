/**
 * Icon Name Normalization System
 *
 * 아이콘 이름 정규화를 위한 통합 시스템입니다.
 *
 * Features:
 * - kebab-case → camelCase conversion
 * - snake_case → camelCase conversion
 * - PascalCase → camelCase conversion
 * - Alias resolution
 * - Provider-specific name mapping
 */

import { ICON_ALIASES } from './icon-aliases'
import { toCamelCase, toPascalCase } from './case-utils'

// Re-export case utils for backward compatibility
export { toCamelCase, toPascalCase } from './case-utils'

// IconProvider type (avoid circular dependency with icon-providers.ts)
export type IconProviderType = 'lucide' | 'phosphor' | 'iconsax'

/**
 * 정규화 결과 인터페이스
 */
export interface NormalizeResult {
  /** 정규화된 아이콘 이름 (camelCase) */
  normalized: string
  /** 원본 이름이 alias였는지 여부 */
  wasAlias: boolean
  /** 원본 alias 이름 (alias였던 경우) */
  originalAlias?: string
}

/**
 * 아이콘 이름을 정규화합니다.
 *
 * @example
 * normalizeIconName('arrow-left')  // { normalized: 'arrowLeft', wasAlias: false }
 * normalizeIconName('back')        // { normalized: 'arrowLeft', wasAlias: true, originalAlias: 'back' }
 * normalizeIconName('ArrowLeft')   // { normalized: 'arrowLeft', wasAlias: false }
 */
export function normalizeIconName(iconName: string): NormalizeResult {
  if (!iconName || typeof iconName !== 'string') {
    return { normalized: iconName || '', wasAlias: false }
  }

  const camelCased = toCamelCase(iconName)
  const aliasTarget = ICON_ALIASES[iconName] || ICON_ALIASES[camelCased]

  if (aliasTarget) {
    return {
      normalized: aliasTarget,
      wasAlias: true,
      originalAlias: iconName
    }
  }

  return {
    normalized: camelCased,
    wasAlias: false
  }
}

/**
 * 프로바이더별 아이콘 이름을 반환합니다.
 *
 * @example
 * getProviderIconName('arrowLeft', 'lucide') // 'ArrowLeft'
 * getProviderIconName('heart', 'iconsax')    // 'Heart'
 */
export function getProviderIconName(
  normalizedName: string,
  provider: IconProviderType
): string {
  switch (provider) {
    case 'lucide':
    case 'phosphor':
    case 'iconsax':
      return toPascalCase(normalizedName)
    default:
      return normalizedName
  }
}
