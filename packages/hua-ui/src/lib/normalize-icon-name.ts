/**
 * Icon Name Normalization System
 *
 * 아이콘 이름 정규화를 위한 통합 시스템입니다.
 * Unified system for normalizing icon names.
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
export type IconProviderType = 'lucide' | 'phosphor' | 'iconsax' | 'untitled'

/**
 * 정규화 결과 인터페이스
 * Normalization result interface
 */
export interface NormalizeResult {
  /** 정규화된 아이콘 이름 (camelCase) / Normalized icon name (camelCase) */
  normalized: string
  /** 원본 이름이 alias였는지 여부 / Whether the original name was an alias */
  wasAlias: boolean
  /** 원본 alias 이름 (alias였던 경우) / Original alias name (if it was an alias) */
  originalAlias?: string
}

/**
 * 아이콘 이름을 정규화합니다.
 * Normalizes icon name with case conversion and alias resolution.
 *
 * @param iconName - 아이콘 이름 / Icon name
 * @returns 정규화 결과 / Normalization result
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

  // Step 1: kebab-case/snake_case를 camelCase로 변환
  const camelCased = toCamelCase(iconName)

  // Step 2: Alias 확인 (원본과 camelCase 버전 모두 확인)
  const aliasTarget = ICON_ALIASES[iconName] || ICON_ALIASES[camelCased]

  if (aliasTarget) {
    // alias가 있으면 해당 타겟 반환
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
 * 프로바이더별 아이콘 이름을 반환합니다 (기본 케이스 변환만).
 * Returns the provider-specific icon name (basic case conversion only).
 *
 * PROJECT_ICONS 매핑은 icon-providers.ts에서 처리됩니다.
 * PROJECT_ICONS mapping is handled in icon-providers.ts.
 *
 * @param normalizedName - 정규화된 아이콘 이름 (camelCase) / Normalized icon name (camelCase)
 * @param provider - 아이콘 프로바이더 / Icon provider
 * @returns 프로바이더별 아이콘 이름 / Provider-specific icon name
 *
 * @example
 * getProviderIconName('arrowLeft', 'lucide') // 'ArrowLeft'
 * getProviderIconName('heart', 'iconsax')    // 'Heart'
 */
export function getProviderIconName(
  normalizedName: string,
  provider: IconProviderType
): string {
  // provider에 맞게 케이스 변환
  switch (provider) {
    case 'lucide':
    case 'phosphor':
    case 'iconsax':
      // 모두 PascalCase 사용
      return toPascalCase(normalizedName)
    default:
      return normalizedName
  }
}
