/**
 * Icon Provider System
 *
 * 각 프로바이더별 로딩 전략 / Loading strategies per provider:
 *
 * 1. Lucide Icons (https://lucide.dev) - default
 *    - Official package: lucide-react (ISC License)
 *    - 정적 import로 번들에 포함 / Statically imported, included in bundle
 *    - PROJECT_ICONS에 매핑된 아이콘만 사용 권장 / Use mapped icons for tree-shaking
 *    - 폴백: 직접 이름으로 동적 조회 가능 / Fallback: direct name lookup available
 *
 * 2. Phosphor Icons (https://phosphoricons.com)
 *    - Official package: @phosphor-icons/react (MIT License)
 *    - 지연 로딩 (lazy load) / Lazy loaded on demand
 *    - initPhosphorIcons() 호출 시에만 로드 / Only loaded when initPhosphorIcons() called
 *    - tree-shaking 지원 / Supports tree-shaking
 *
 * 3. Iconsax Icons (https://iconsax.io)
 *    - SVG 기반 동적 로딩 / SVG-based dynamic loading
 *    - 캐시 시스템으로 성능 최적화 / Cached for performance
 *    - getIconsaxIconSync로 동기 캐시 조회 / Sync cache lookup via getIconsaxIconSync
 *    - Free for personal and commercial use - thanks Iconsax team!
 *
 * 아이콘 조회 방식 / Icon Resolution:
 * - PROJECT_ICONS 매핑: 통일된 이름으로 프로바이더별 아이콘 조회 / Unified name mapping
 * - 폴백 동적 조회: PROJECT_ICONS에 없는 아이콘도 직접 이름으로 사용 가능
 *   Fallback: Icons not in PROJECT_ICONS can be used by direct name
 */

import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getIconsaxIconSync } from './iconsax-loader'
import { toPascalCase } from './case-utils'

// Phosphor Icons - lazy loaded, tree-shakeable
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let PhosphorIcons: any = null

// Icon Provider Type
export type IconProvider = 'lucide' | 'phosphor' | 'iconsax' | 'untitled'

// Icon Provider Configuration
export interface IconProviderConfig {
  provider: IconProvider
  prefix?: string
}

/**
 * Project-specific icon list
 * These are the icons actually used in SumUp project
 * Only these icons will be loaded for optimal bundle size
 */
export const PROJECT_ICONS = {
  // Navigation & Layout
  'home': { lucide: 'Home', phosphor: 'House', iconsax: 'Home2' },
  'layout-dashboard': { lucide: 'LayoutDashboard', phosphor: 'SquaresFour' },
  'folder': { lucide: 'Folder', phosphor: 'Folder', iconsax: 'Folder' },
  'alert-circle': { lucide: 'AlertCircle', phosphor: 'WarningCircle' },
  'alertCircle': { lucide: 'AlertCircle', phosphor: 'WarningCircle' },
  'columns': { lucide: 'Columns', phosphor: 'Columns' },
  'users': { lucide: 'Users', phosphor: 'Users' },
  'settings': { lucide: 'Settings', phosphor: 'Gear' },
  'menu': { lucide: 'Menu', phosphor: 'List', iconsax: 'Menu' },
  'close': { lucide: 'X', phosphor: 'X', iconsax: 'CloseCircle' },
  'chevronLeft': { lucide: 'ChevronLeft', phosphor: 'CaretLeft' },
  'chevronRight': { lucide: 'ChevronRight', phosphor: 'CaretRight' },
  'chevronDown': { lucide: 'ChevronDown', phosphor: 'CaretDown' },
  'chevronUp': { lucide: 'ChevronUp', phosphor: 'CaretUp' },
  'arrowLeft': { lucide: 'ArrowLeft', phosphor: 'ArrowLeft', iconsax: 'ArrowLeft' },
  'arrowRight': { lucide: 'ArrowRight', phosphor: 'ArrowRight', iconsax: 'ArrowRight' },
  'arrowUp': { lucide: 'ArrowUp', phosphor: 'ArrowUp', iconsax: 'ArrowUp' },
  'arrowDown': { lucide: 'ArrowDown', phosphor: 'ArrowDown', iconsax: 'ArrowDown' },

  // Actions
  'add': { lucide: 'Plus', phosphor: 'Plus', iconsax: 'Add' },
  'edit': { lucide: 'Edit', phosphor: 'Pencil' },
  'pencil': { lucide: 'Pencil', phosphor: 'Pencil' },
  'delete': { lucide: 'Trash2', phosphor: 'Trash' },
  'trash': { lucide: 'Trash2', phosphor: 'Trash', iconsax: 'Trash' },
  'upload': { lucide: 'Upload', phosphor: 'Upload', iconsax: 'Upload' },
  'download': { lucide: 'Download', phosphor: 'Download', iconsax: 'Download' },
  'x': { lucide: 'X', phosphor: 'X' },
  'check': { lucide: 'Check', phosphor: 'Check', iconsax: 'Check' },
  'search': { lucide: 'Search', phosphor: 'MagnifyingGlass', iconsax: 'SearchNormal' },
  'share': { lucide: 'Share', phosphor: 'Share' },
  'copy': { lucide: 'Copy', phosphor: 'Copy' },
  'save': { lucide: 'Save', phosphor: 'FloppyDisk' },

  // Status & Feedback
  'loader': { lucide: 'Loader2', phosphor: 'Spinner' },
  'loader2': { lucide: 'Loader2', phosphor: 'Spinner' },
  'check-circle': { lucide: 'CheckCircle', phosphor: 'CheckCircle' },
  'checkCircle': { lucide: 'CheckCircle', phosphor: 'CheckCircle' },
  'success': { lucide: 'CheckCircle', phosphor: 'CheckCircle' },
  'error': { lucide: 'XCircle', phosphor: 'XCircle' },
  'warning': { lucide: 'AlertCircle', phosphor: 'WarningCircle', iconsax: 'Warning2' },
  'info': { lucide: 'Info', phosphor: 'Info', iconsax: 'InfoCircle' },
  'refresh': { lucide: 'RefreshCw', phosphor: 'ArrowClockwise', iconsax: 'Refresh' },
  'refreshCw': { lucide: 'RefreshCw', phosphor: 'ArrowClockwise', iconsax: 'Refresh' },
  'bell': { lucide: 'Bell', phosphor: 'Bell', iconsax: 'Bell' },
  'heart': { lucide: 'Heart', phosphor: 'Heart', iconsax: 'Heart' },
  'star': { lucide: 'Star', phosphor: 'Star', iconsax: 'Star' },
  'bookmark': { lucide: 'Bookmark', phosphor: 'Bookmark' },

  // User & Auth
  'user': { lucide: 'User', phosphor: 'User', iconsax: 'User' },
  'userPlus': { lucide: 'UserPlus', phosphor: 'UserPlus' },
  'logIn': { lucide: 'LogIn', phosphor: 'SignIn', iconsax: 'Login' },
  'logOut': { lucide: 'LogOut', phosphor: 'SignOut', iconsax: 'Logout' },
  'chrome': { lucide: 'Chrome', phosphor: 'ChromeLogo' },
  'github': { lucide: 'Github', phosphor: 'GithubLogo' },
  'message': { lucide: 'MessageCircle', phosphor: 'ChatCircle' },

  // Content
  'messageSquare': { lucide: 'MessageSquare', phosphor: 'ChatSquare' },
  'message-square': { lucide: 'MessageSquare', phosphor: 'ChatSquare' },
  'inbox': { lucide: 'Inbox', phosphor: 'Inbox' },
  'calendar': { lucide: 'Calendar', phosphor: 'Calendar' },
  'calendarPlus': { lucide: 'CalendarPlus', phosphor: 'CalendarPlus' },
  'checkSquare': { lucide: 'CheckSquare', phosphor: 'CheckSquare' },
  'clock': { lucide: 'Clock', phosphor: 'Clock' },
  'book': { lucide: 'Book', phosphor: 'Book', iconsax: 'Book' },
  'bookOpen': { lucide: 'BookOpen', phosphor: 'BookOpen' },

  // Theme & UI
  'monitor': { lucide: 'Monitor', phosphor: 'Monitor', iconsax: 'Monitor' },
  'sun': { lucide: 'Sun', phosphor: 'Sun', iconsax: 'Sun' },
  'moon': { lucide: 'Moon', phosphor: 'Moon', iconsax: 'Moon' },

  // AI & Features
  'sparkle': { lucide: 'Sparkle', phosphor: 'Sparkle' },
  'sparkles': { lucide: 'Sparkles', phosphor: 'Sparkle' },
  'lightbulb': { lucide: 'Lightbulb', phosphor: 'Lightbulb' },
  'brain': { lucide: 'Brain', phosphor: 'Brain' },
  'zap': { lucide: 'Zap', phosphor: 'Lightning' },

  // Device & Platform
  'globe': { lucide: 'Globe', phosphor: 'Globe' },
  'deviceMobile': { lucide: 'Smartphone', phosphor: 'DeviceMobile' },
  'smartphone': { lucide: 'Smartphone', phosphor: 'DeviceMobile' },
  'floppyDisk': { lucide: 'Save', phosphor: 'FloppyDisk' },

  // Data & Analytics
  'chart': { lucide: 'BarChart3', phosphor: 'ChartBar' },
  'barChart': { lucide: 'BarChart', phosphor: 'ChartBar' },
  'trendingUp': { lucide: 'TrendingUp', phosphor: 'TrendUp' },
  'trendingDown': { lucide: 'TrendingDown', phosphor: 'TrendDown' },
  'activity': { lucide: 'Activity', phosphor: 'Activity' },
  'database': { lucide: 'Database', phosphor: 'Database' },
  'dollarSign': { lucide: 'DollarSign', phosphor: 'CurrencyDollar' },
  'dollar': { lucide: 'DollarSign', phosphor: 'CurrencyDollar' },
  'currency': { lucide: 'DollarSign', phosphor: 'CurrencyDollar' },

  // Security
  'lock': { lucide: 'Lock', phosphor: 'Lock', iconsax: 'Lock' },
  'unlock': { lucide: 'Unlock', phosphor: 'LockOpen' },
  'shield': { lucide: 'Shield', phosphor: 'Shield', iconsax: 'Shield' },
  'key': { lucide: 'Key', phosphor: 'Key' },

  // Media
  'play': { lucide: 'Play', phosphor: 'Play' },
  'pause': { lucide: 'Pause', phosphor: 'Pause' },
  'image': { lucide: 'Image', phosphor: 'Image' },
  'video': { lucide: 'Video', phosphor: 'Video' },
  'camera': { lucide: 'Camera', phosphor: 'Camera' },

  // Files
  'fileText': { lucide: 'FileText', phosphor: 'FileText' },
  'file': { lucide: 'File', phosphor: 'File' },

  // Navigation
  'externalLink': { lucide: 'ExternalLink', phosphor: 'ArrowSquareOut' },
  'link': { lucide: 'Link', phosphor: 'Link', iconsax: 'Link' },
  'moreHorizontal': { lucide: 'MoreHorizontal', phosphor: 'DotsThreeOutline' },
  'moreVertical': { lucide: 'MoreVertical', phosphor: 'DotsThreeVertical' },

  // Priority
  'remove': { lucide: 'Minus', phosphor: 'Minus' },

  // Eye (password)
  'eye': { lucide: 'Eye', phosphor: 'Eye', iconsax: 'Eye' },
  'eyeOff': { lucide: 'EyeOff', phosphor: 'EyeSlash', iconsax: 'EyeSlash' },

  // Emotions
  'smile': { lucide: 'Smile', phosphor: 'Smiley' },
  'frown': { lucide: 'Frown', phosphor: 'SmileySad' },
  'meh': { lucide: 'Meh', phosphor: 'SmileyMeh' },

  // Social
  'mail': { lucide: 'Mail', phosphor: 'Envelope' },
  'phone': { lucide: 'Phone', phosphor: 'Phone' },

  // Additional
  'flag': { lucide: 'Flag', phosphor: 'Flag', iconsax: 'Flag' },
  'rocket': { lucide: 'Rocket', phosphor: 'Rocket', iconsax: 'Rocket' },
} as const

/**
 * Initialize Phosphor Icons (lazy load)
 * Only loads when Phosphor provider is used
 * Uses tree-shaking to only include used icons
 */
export async function initPhosphorIcons() {
  if (typeof window === 'undefined') return null

  if (!PhosphorIcons) {
    try {
      // Dynamic import with tree-shaking support
      // Only icons actually used will be included in bundle
      const phosphorModule = await import('@phosphor-icons/react')
      PhosphorIcons = phosphorModule
    } catch {
      console.warn('Phosphor Icons not available. Install @phosphor-icons/react to use.')
      return null
    }
  }
  return PhosphorIcons
}

/**
 * Get icon from provider
 * Only resolves icons that are in PROJECT_ICONS for optimal bundle size
 * 
 * @param iconName - 아이콘 이름 / Icon name
 * @param provider - 아이콘 프로바이더 / Icon provider
 * @returns 아이콘 컴포넌트 또는 null / Icon component or null
 */
export function getIconFromProvider(
  iconName: string,
  provider: IconProvider = 'lucide'
): LucideIcon | React.ComponentType<Record<string, unknown>> | null {
  // Check if icon is in project icon list
  const iconMapping = PROJECT_ICONS[iconName as keyof typeof PROJECT_ICONS]

  if (!iconMapping) {
    // Fallback to direct lookup for backward compatibility
    return getIconDirect(iconName, provider)
  }

  const mappedName = (iconMapping as Record<string, string | undefined>)[provider]

  switch (provider) {
    case 'lucide':
      if (!mappedName) return null
      return (LucideIcons as unknown as Record<string, LucideIcon>)[mappedName] || null

    case 'phosphor':
      if (!mappedName || !PhosphorIcons) {
        return null
      }
      return PhosphorIcons?.[mappedName] || null

    case 'iconsax':
      // Iconsax icons are dynamically loaded
      // Try sync cache first, then async load
      const iconsaxName = mappedName || toPascalCase(iconName)
      return getIconsaxIconSync(iconsaxName) || null

    default:
      return null
  }
}

/**
 * Direct icon lookup (fallback for icons not in PROJECT_ICONS)
 * 
 * 동적으로 Lucide 아이콘을 가져옵니다.
 * icons.ts에 없는 아이콘도 사용 가능하도록 합니다.
 * 
 * Dynamically loads Lucide icons.
 * Allows using icons not in icons.ts.
 * 
 * @param iconName - 아이콘 이름 / Icon name
 * @param provider - 아이콘 프로바이더 / Icon provider
 * @returns 아이콘 컴포넌트 또는 null / Icon component or null
 */
function getIconDirect(
  iconName: string,
  provider: IconProvider
): LucideIcon | React.ComponentType<Record<string, unknown>> | null {
  switch (provider) {
    case 'lucide': {
      // icons.ts에 없는 아이콘을 동적으로 찾기
      // PascalCase 변환 시도
      const lucideName = iconName.charAt(0).toUpperCase() + iconName.slice(1)
      // camelCase도 시도
      const camelCaseName = iconName.replace(/([A-Z])/g, (match) =>
        match === iconName[0] ? match.toLowerCase() : match
      )

      return (LucideIcons as unknown as Record<string, LucideIcon>)[lucideName] ||
        (LucideIcons as unknown as Record<string, LucideIcon>)[iconName] ||
        (LucideIcons as unknown as Record<string, LucideIcon>)[camelCaseName] ||
        null
    }

    case 'phosphor': {
      if (!PhosphorIcons) {
        return null
      }
      const phosphorName1 = iconName.charAt(0).toUpperCase() + iconName.slice(1)
      const phosphorName2 = iconName
        .split(/(?=[A-Z])/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('')
      return PhosphorIcons?.[phosphorName1] ||
        PhosphorIcons?.[phosphorName2] ||
        PhosphorIcons?.[iconName] ||
        null
    }

    case 'iconsax': {
      // Iconsax icons are dynamically loaded
      // Try sync cache first
      const iconsaxName = toPascalCase(iconName)
      return getIconsaxIconSync(iconsaxName) || null
    }

    default:
      return null
  }
}

/**
 * Get icon name for provider
 * 
 * 프로바이더별 아이콘 이름을 가져옵니다.
 * Gets icon name for the specified provider.
 * 
 * @param iconName - 아이콘 이름 / Icon name
 * @param provider - 아이콘 프로바이더 / Icon provider
 * @returns 프로바이더별 아이콘 이름 / Icon name for provider
 */
export function getIconNameForProvider(
  iconName: string,
  provider: IconProvider
): string {
  const iconMapping = PROJECT_ICONS[iconName as keyof typeof PROJECT_ICONS]
  if (iconMapping) {
    const mappedName = (iconMapping as Record<string, string | undefined>)[provider]
    if (mappedName) {
      return mappedName
    }
  }
  return iconName
}

/**
 * Get all project icon names
 */
export function getProjectIconNames(): string[] {
  return Object.keys(PROJECT_ICONS)
}
