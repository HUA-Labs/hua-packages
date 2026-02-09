/**
 * Iconsax Icons Dynamic Loader
 *
 * Iconsax icon assets from https://iconsax.io
 * Special thanks to Iconsax team for providing high-quality icons
 * with a permissive license (free for personal and commercial use).
 *
 * Iconsax 아이콘을 동적으로 로드하는 시스템입니다.
 * 성능 최적화를 위해 필요한 아이콘만 동적으로 import합니다.
 *
 * Iconsax Icons Dynamic Loader System
 * Dynamically loads only the required icons for optimal performance.
 *
 * Features:
 * - Dynamic import (tree-shaking friendly)
 * - Icon cache (avoid duplicate loading)
 * - Preload support (prevent FOUC)
 * - React.lazy integration
 */

import React from 'react'
import type { SVGProps } from 'react'
import { toPascalCase } from './case-utils'
import { getIconsaxIcon } from '../components/icons'
import { getIconsaxBoldIcon } from '../components/icons-bold'
import type { IconsaxVariant } from '../components/Icon/icon-store'

// Iconsax 아이콘 컴포넌트 타입
export type IconsaxIconComponent = React.ComponentType<SVGProps<SVGSVGElement>>

// Iconsax 아이콘 캐시 (성능 최적화) - 이제 ICONSAX_ICONS 맵 사용
const iconsaxIconCache = new Map<string, IconsaxIconComponent>()

// 로딩 중인 아이콘 Promise 캐시 (중복 요청 방지) - deprecated, 이제 동기적으로 사용
const loadingPromises = new Map<string, Promise<IconsaxIconComponent | null>>()

/**
 * Iconsax 아이콘을 로드합니다.
 * ICONSAX_ICONS 맵에서 직접 조회합니다 (동적 import 대신).
 *
 * Loads Iconsax icons from the static ICONSAX_ICONS map.
 * No longer uses dynamic import for better bundler compatibility.
 *
 * @param iconName - Iconsax 아이콘 이름 (PascalCase, 예: "Add", "Home2")
 * @returns 아이콘 컴포넌트 또는 null
 */
export async function loadIconsaxIcon(
  iconName: string
): Promise<IconsaxIconComponent | null> {
  const normalizedName = toPascalCase(iconName)

  // getIconsaxIcon 함수를 통해 아이콘 조회
  const IconComponent = getIconsaxIcon(normalizedName)

  if (IconComponent) {
    // 캐시에도 저장 (getIconsaxIconSync 호환)
    if (!iconsaxIconCache.has(normalizedName)) {
      iconsaxIconCache.set(normalizedName, IconComponent)
    }
    return IconComponent
  }

  // 개발 환경에서만 경고 출력
  if (process.env.NODE_ENV === 'development') {
    console.warn(`Iconsax icon "${normalizedName}" not found`)
  }

  return null
}

/**
 * Iconsax 아이콘을 동기적으로 가져옵니다.
 * ICONSAX_ICONS 또는 ICONSAX_BOLD_ICONS 맵에서 직접 조회합니다.
 *
 * Synchronously gets Iconsax icon from ICONSAX_ICONS or ICONSAX_BOLD_ICONS map.
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
  // variant에 따라 다른 맵에서 조회
  if (variant === 'bold') {
    return getIconsaxBoldIcon(normalizedName) || null
  }
  // getIconsaxIcon 함수로 조회 (캐시보다 우선)
  return getIconsaxIcon(normalizedName) || iconsaxIconCache.get(normalizedName) || null
}

/**
 * 여러 아이콘을 미리 로드합니다 (FOUC 방지).
 * 앱 초기화 시 자주 사용하는 아이콘을 프리로드하면 좋습니다.
 *
 * Preloads multiple icons to prevent FOUC.
 * Good for preloading frequently used icons at app initialization.
 *
 * @param iconNames - 프리로드할 아이콘 이름 배열
 * @returns 로드된 아이콘 수
 *
 * @example
 * // 앱 시작 시
 * await preloadIconsaxIcons(['Home2', 'User', 'Search', 'Menu'])
 */
export async function preloadIconsaxIcons(iconNames: string[]): Promise<number> {
  const results = await Promise.allSettled(
    iconNames.map(name => loadIconsaxIcon(name))
  )
  return results.filter(r => r.status === 'fulfilled' && r.value !== null).length
}

/**
 * 자주 사용되는 기본 아이콘들을 프리로드합니다.
 *
 * Preloads commonly used default icons.
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
 * 아이콘이 캐시에 있는지 확인합니다.
 *
 * Checks if an icon is in the cache.
 */
export function isIconsaxIconCached(iconName: string): boolean {
  const normalizedName = toPascalCase(iconName)
  return iconsaxIconCache.has(normalizedName)
}

/**
 * 캐시된 아이콘 목록을 반환합니다.
 *
 * Returns the list of cached icon names.
 */
export function getCachedIconsaxIcons(): string[] {
  return Array.from(iconsaxIconCache.keys())
}

/**
 * React.lazy와 함께 사용할 수 있는 아이콘 로더를 생성합니다.
 *
 * Creates an icon loader compatible with React.lazy.
 *
 * @param iconName - 아이콘 이름
 * @returns React.lazy 컴포넌트
 *
 * @example
 * const HomeIcon = createLazyIconsaxIcon('Home2')
 * // 사용:
 * <Suspense fallback={<span>...</span>}>
 *   <HomeIcon />
 * </Suspense>
 */
export function createLazyIconsaxIcon(iconName: string) {
  const normalizedName = toPascalCase(iconName)
  return React.lazy(() =>
    import(`../components/icons/${normalizedName}`).then(module => ({
      default: module.default
    }))
  )
}
