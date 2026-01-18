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

// Iconsax 아이콘 컴포넌트 타입
export type IconsaxIconComponent = React.ComponentType<SVGProps<SVGSVGElement>>

// Iconsax 아이콘 캐시 (성능 최적화)
const iconsaxIconCache = new Map<string, IconsaxIconComponent>()

// 로딩 중인 아이콘 Promise 캐시 (중복 요청 방지)
const loadingPromises = new Map<string, Promise<IconsaxIconComponent | null>>()

/**
 * Iconsax 아이콘을 동적으로 로드합니다.
 * 캐시를 사용하여 같은 아이콘을 여러 번 로드하지 않도록 최적화합니다.
 *
 * Dynamically loads Iconsax icons.
 * Uses cache to avoid loading the same icon multiple times.
 *
 * @param iconName - Iconsax 아이콘 이름 (PascalCase, 예: "Add", "Home2")
 * @returns 아이콘 컴포넌트 또는 null
 */
export async function loadIconsaxIcon(
  iconName: string
): Promise<IconsaxIconComponent | null> {
  const normalizedName = normalizeIconsaxIconName(iconName)

  // 캐시 확인
  if (iconsaxIconCache.has(normalizedName)) {
    return iconsaxIconCache.get(normalizedName)!
  }

  // 이미 로딩 중인 경우 기존 Promise 반환
  if (loadingPromises.has(normalizedName)) {
    return loadingPromises.get(normalizedName)!
  }

  // 새로운 로딩 시작
  const loadPromise = (async () => {
    try {
      // 동적 import (tree-shaking 지원)
      const iconModule = await import(`../components/icons/${normalizedName}`)
      const IconComponent = iconModule.default as IconsaxIconComponent

      if (IconComponent) {
        // 캐시에 저장
        iconsaxIconCache.set(normalizedName, IconComponent)
        return IconComponent
      }
    } catch (error) {
      // 개발 환경에서만 경고 출력
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Iconsax icon "${normalizedName}" not found`, error)
      }
    } finally {
      // 로딩 완료 후 Promise 캐시에서 제거
      loadingPromises.delete(normalizedName)
    }
    return null
  })()

  loadingPromises.set(normalizedName, loadPromise)
  return loadPromise
}

/**
 * Iconsax 아이콘을 동기적으로 가져옵니다 (캐시에서만).
 * 캐시에 없는 경우 null을 반환합니다.
 *
 * Synchronously gets Iconsax icon from cache only.
 * Returns null if not in cache.
 *
 * @param iconName - Iconsax 아이콘 이름
 * @returns 아이콘 컴포넌트 또는 null
 */
export function getIconsaxIconSync(
  iconName: string
): IconsaxIconComponent | null {
  const normalizedName = normalizeIconsaxIconName(iconName)
  return iconsaxIconCache.get(normalizedName) || null
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
  const normalizedName = normalizeIconsaxIconName(iconName)
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
 * Iconsax 아이콘 이름을 표준화합니다.
 * kebab-case나 camelCase를 PascalCase로 변환합니다.
 *
 * Normalizes Iconsax icon name.
 * Converts kebab-case or camelCase to PascalCase.
 *
 * @param name - 아이콘 이름
 * @returns PascalCase 아이콘 이름
 */
export function normalizeIconsaxIconName(name: string): string {
  // 이미 PascalCase인 경우
  if (/^[A-Z]/.test(name)) {
    return name
  }

  // kebab-case 또는 snake_case를 PascalCase로 변환
  return name
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
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
  const normalizedName = normalizeIconsaxIconName(iconName)
  return React.lazy(() =>
    import(`../components/icons/${normalizedName}`).then(module => ({
      default: module.default
    }))
  )
}
