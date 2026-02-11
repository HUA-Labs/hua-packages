/**
 * Iconsax Icons Dynamic Loader
 *
 * Iconsax icon assets from https://iconsax.io
 * Special thanks to Iconsax team for providing high-quality icons
 * with a permissive license (free for personal and commercial use).
 *
 * 에센셜 아이콘(57개)은 동기적으로 즉시 사용 가능.
 * 확장 아이콘은 registerExtendedIcons()로 등록 시 사용 가능.
 *
 * Features:
 * - Essential icons: 동기 조회 (번들에 포함)
 * - Extended icons: registration pattern (iconsax-extended에서 등록)
 * - Icon cache
 * - Preload support
 */

import React from 'react'
import type { SVGProps } from 'react'
import { toPascalCase } from './case-utils'
import { getEssentialIconsaxIcon } from '../components/icons/essential'
import { getEssentialIconsaxBoldIcon } from '../components/icons-bold/essential'
import type { IconsaxVariant } from '../components/Icon/icon-store'

// Iconsax 아이콘 컴포넌트 타입
export type IconsaxIconComponent = React.ComponentType<SVGProps<SVGSVGElement>>

// Extended icons registration (등록된 경우에만 사용)
let extendedLineGetter: ((name: string) => IconsaxIconComponent | null) | null = null
let extendedBoldGetter: ((name: string) => IconsaxIconComponent | null) | null = null

/**
 * 확장 아이콘 세트를 등록합니다.
 * iconsax-extended 엔트리에서 호출됩니다.
 */
export function registerExtendedIcons(
  lineGetter: (name: string) => IconsaxIconComponent | null,
  boldGetter: (name: string) => IconsaxIconComponent | null
) {
  extendedLineGetter = lineGetter
  extendedBoldGetter = boldGetter
}

/**
 * Iconsax 아이콘을 로드합니다.
 * 에센셜 → 확장(등록된 경우) 순서로 조회.
 *
 * @param iconName - Iconsax 아이콘 이름 (PascalCase, 예: "Add", "Home2")
 * @returns 아이콘 컴포넌트 또는 null
 */
export async function loadIconsaxIcon(
  iconName: string
): Promise<IconsaxIconComponent | null> {
  const normalizedName = toPascalCase(iconName)

  // 1. 에센셜 아이콘에서 조회
  const essentialIcon = getEssentialIconsaxIcon(normalizedName)
  if (essentialIcon) return essentialIcon

  // 2. 확장 아이콘에서 조회 (등록된 경우)
  const extendedIcon = extendedLineGetter?.(normalizedName)
  if (extendedIcon) return extendedIcon

  if (process.env.NODE_ENV === 'development') {
    console.warn(`Iconsax icon "${normalizedName}" not found`)
  }

  return null
}

/**
 * Iconsax 아이콘을 동기적으로 가져옵니다.
 * 에센셜 → 확장(등록된 경우) 순서로 조회.
 *
 * @param iconName - Iconsax 아이콘 이름
 * @param variant - Iconsax 아이콘 변형 (line | bold), 기본값 'line'
 * @returns 아이콘 컴포넌트 또는 null
 */
export function getIconsaxIconSync(
  iconName: string,
  variant: IconsaxVariant = 'line'
): IconsaxIconComponent | null {
  const normalizedName = toPascalCase(iconName)

  if (variant === 'bold') {
    return getEssentialIconsaxBoldIcon(normalizedName)
      || extendedBoldGetter?.(normalizedName)
      || null
  }

  return getEssentialIconsaxIcon(normalizedName)
    || extendedLineGetter?.(normalizedName)
    || null
}

/**
 * 여러 아이콘을 미리 로드합니다 (FOUC 방지).
 *
 * @param iconNames - 프리로드할 아이콘 이름 배열
 * @returns 로드된 아이콘 수
 */
export async function preloadIconsaxIcons(iconNames: string[]): Promise<number> {
  const results = await Promise.allSettled(
    iconNames.map(name => loadIconsaxIcon(name))
  )
  return results.filter(r => r.status === 'fulfilled' && r.value !== null).length
}

/**
 * 자주 사용되는 기본 아이콘들을 프리로드합니다.
 */
export async function preloadCommonIconsaxIcons(): Promise<number> {
  const commonIcons = [
    'Home2', 'User', 'Search', 'Menu', 'CloseCircle',
    'Add', 'Trash', 'Edit', 'Check', 'Warning2',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
  ]
  return preloadIconsaxIcons(commonIcons)
}

/**
 * 아이콘이 에센셜에 있는지 확인합니다.
 */
export function isIconsaxIconCached(iconName: string): boolean {
  const normalizedName = toPascalCase(iconName)
  return getEssentialIconsaxIcon(normalizedName) !== null
    || extendedLineGetter?.(normalizedName) !== null
    || false
}

/**
 * React.lazy와 함께 사용할 수 있는 아이콘 로더를 생성합니다.
 *
 * @param iconName - 아이콘 이름
 * @returns React.lazy 컴포넌트
 */
export function createLazyIconsaxIcon(iconName: string) {
  const normalizedName = toPascalCase(iconName)
  return React.lazy(async (): Promise<{ default: React.ComponentType<SVGProps<SVGSVGElement>> }> => {
    const icon = await loadIconsaxIcon(normalizedName)
    if (!icon) {
      const Fallback = (_props: SVGProps<SVGSVGElement>) => null
      return { default: Fallback }
    }
    return { default: icon }
  })
}
