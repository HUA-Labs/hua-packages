/**
 * Icon Provider System
 * 
 * Supports multiple icon libraries:
 * - Lucide Icons (default)
 * - Phosphor Icons
 * - Untitled Icons (SVG-based)
 * 
 * Only imports icons that are actually used in the project for optimal bundle size.
 */

import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Phosphor Icons - lazy loaded, tree-shakeable
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let PhosphorIcons: any = null

// Icon Provider Type
export type IconProvider = 'lucide' | 'phosphor' | 'untitled'

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
  'home': { lucide: 'Home', phosphor: 'House', untitled: 'home' },
  'layout-dashboard': { lucide: 'LayoutDashboard', phosphor: 'SquaresFour', untitled: 'layout-dashboard' },
  'folder': { lucide: 'Folder', phosphor: 'Folder', untitled: 'folder' },
  'alert-circle': { lucide: 'AlertCircle', phosphor: 'WarningCircle', untitled: 'alert-circle' },
  'alertCircle': { lucide: 'AlertCircle', phosphor: 'WarningCircle', untitled: 'alert-circle' },
  'columns': { lucide: 'Columns', phosphor: 'Columns', untitled: 'columns' },
  'users': { lucide: 'Users', phosphor: 'Users', untitled: 'users' },
  'settings': { lucide: 'Settings', phosphor: 'Gear', untitled: 'settings' },
  'menu': { lucide: 'Menu', phosphor: 'List', untitled: 'menu' },
  'close': { lucide: 'X', phosphor: 'X', untitled: 'close' },
  'chevronLeft': { lucide: 'ChevronLeft', phosphor: 'CaretLeft', untitled: 'chevron-left' },
  'chevronRight': { lucide: 'ChevronRight', phosphor: 'CaretRight', untitled: 'chevron-right' },
  'chevronDown': { lucide: 'ChevronDown', phosphor: 'CaretDown', untitled: 'chevron-down' },
  'chevronUp': { lucide: 'ChevronUp', phosphor: 'CaretUp', untitled: 'chevron-up' },
  'arrowLeft': { lucide: 'ArrowLeft', phosphor: 'ArrowLeft', untitled: 'arrow-left' },
  'arrowRight': { lucide: 'ArrowRight', phosphor: 'ArrowRight', untitled: 'arrow-right' },
  'arrowUp': { lucide: 'ArrowUp', phosphor: 'ArrowUp', untitled: 'arrow-up' },
  'arrowDown': { lucide: 'ArrowDown', phosphor: 'ArrowDown', untitled: 'arrow-down' },

  // Actions
  'add': { lucide: 'Plus', phosphor: 'Plus', untitled: 'add' },
  'edit': { lucide: 'Edit', phosphor: 'Pencil', untitled: 'edit' },
  'pencil': { lucide: 'Pencil', phosphor: 'Pencil', untitled: 'pencil' },
  'delete': { lucide: 'Trash2', phosphor: 'Trash', untitled: 'trash' },
  'trash': { lucide: 'Trash2', phosphor: 'Trash', untitled: 'trash' },
  'upload': { lucide: 'Upload', phosphor: 'Upload', untitled: 'upload' },
  'download': { lucide: 'Download', phosphor: 'Download', untitled: 'download' },
  'x': { lucide: 'X', phosphor: 'X', untitled: 'close' },
  'check': { lucide: 'Check', phosphor: 'Check', untitled: 'check' },
  'search': { lucide: 'Search', phosphor: 'MagnifyingGlass', untitled: 'search' },
  'share': { lucide: 'Share', phosphor: 'Share', untitled: 'share' },
  'copy': { lucide: 'Copy', phosphor: 'Copy', untitled: 'copy' },
  'save': { lucide: 'Save', phosphor: 'FloppyDisk', untitled: 'save' },

  // Status & Feedback
  'loader': { lucide: 'Loader2', phosphor: 'Spinner', untitled: 'loader' },
  'loader2': { lucide: 'Loader2', phosphor: 'Spinner', untitled: 'loader' },
  'check-circle': { lucide: 'CheckCircle', phosphor: 'CheckCircle', untitled: 'check-circle' },
  'checkCircle': { lucide: 'CheckCircle', phosphor: 'CheckCircle', untitled: 'check-circle' },
  'success': { lucide: 'CheckCircle', phosphor: 'CheckCircle', untitled: 'check-circle' },
  'error': { lucide: 'XCircle', phosphor: 'XCircle', untitled: 'error' },
  'warning': { lucide: 'AlertCircle', phosphor: 'WarningCircle', untitled: 'warning' },
  'info': { lucide: 'Info', phosphor: 'Info', untitled: 'info' },
  'refresh': { lucide: 'RefreshCw', phosphor: 'ArrowClockwise', untitled: 'refresh' },
  'refreshCw': { lucide: 'RefreshCw', phosphor: 'ArrowClockwise', untitled: 'refresh' },
  'bell': { lucide: 'Bell', phosphor: 'Bell', untitled: 'bell' },
  'heart': { lucide: 'Heart', phosphor: 'Heart', untitled: 'heart' },
  'star': { lucide: 'Star', phosphor: 'Star', untitled: 'star' },
  'bookmark': { lucide: 'Bookmark', phosphor: 'Bookmark', untitled: 'bookmark' },

  // User & Auth
  'user': { lucide: 'User', phosphor: 'User', untitled: 'user' },
  'userPlus': { lucide: 'UserPlus', phosphor: 'UserPlus', untitled: 'user-plus' },
  'logIn': { lucide: 'LogIn', phosphor: 'SignIn', untitled: 'log-in' },
  'logOut': { lucide: 'LogOut', phosphor: 'SignOut', untitled: 'log-out' },
  'chrome': { lucide: 'Chrome', phosphor: 'ChromeLogo', untitled: 'chrome' },
  'github': { lucide: 'Github', phosphor: 'GithubLogo', untitled: 'github' },
  'message': { lucide: 'MessageCircle', phosphor: 'ChatCircle', untitled: 'message' },

  // Content
  'messageSquare': { lucide: 'MessageSquare', phosphor: 'ChatSquare', untitled: 'message-square' },
  'message-square': { lucide: 'MessageSquare', phosphor: 'ChatSquare', untitled: 'message-square' },
  'inbox': { lucide: 'Inbox', phosphor: 'Inbox', untitled: 'inbox' },
  'calendar': { lucide: 'Calendar', phosphor: 'Calendar', untitled: 'calendar' },
  'calendarPlus': { lucide: 'CalendarPlus', phosphor: 'CalendarPlus', untitled: 'calendar-plus' },
  'checkSquare': { lucide: 'CheckSquare', phosphor: 'CheckSquare', untitled: 'check-square' },
  'clock': { lucide: 'Clock', phosphor: 'Clock', untitled: 'clock' },
  'book': { lucide: 'Book', phosphor: 'Book', untitled: 'book' },
  'bookOpen': { lucide: 'BookOpen', phosphor: 'BookOpen', untitled: 'book-open' },

  // Theme & UI
  'monitor': { lucide: 'Monitor', phosphor: 'Monitor', untitled: 'monitor' },
  'sun': { lucide: 'Sun', phosphor: 'Sun', untitled: 'sun' },
  'moon': { lucide: 'Moon', phosphor: 'Moon', untitled: 'moon' },

  // AI & Features
  'sparkles': { lucide: 'Sparkles', phosphor: 'Sparkle', untitled: 'sparkles' },
  'lightbulb': { lucide: 'Lightbulb', phosphor: 'Lightbulb', untitled: 'lightbulb' },
  'brain': { lucide: 'Brain', phosphor: 'Brain', untitled: 'brain' },
  'zap': { lucide: 'Zap', phosphor: 'Lightning', untitled: 'zap' },

  // Data & Analytics
  'chart': { lucide: 'BarChart3', phosphor: 'ChartBar', untitled: 'chart' },
  'barChart': { lucide: 'BarChart', phosphor: 'ChartBar', untitled: 'bar-chart' },
  'trendingUp': { lucide: 'TrendingUp', phosphor: 'TrendUp', untitled: 'trending-up' },
  'trendingDown': { lucide: 'TrendingDown', phosphor: 'TrendDown', untitled: 'trending-down' },
  'activity': { lucide: 'Activity', phosphor: 'Activity', untitled: 'activity' },
  'database': { lucide: 'Database', phosphor: 'Database', untitled: 'database' },
  'dollarSign': { lucide: 'DollarSign', phosphor: 'CurrencyDollar', untitled: 'dollar-sign' },
  'dollar': { lucide: 'DollarSign', phosphor: 'CurrencyDollar', untitled: 'dollar-sign' },
  'currency': { lucide: 'DollarSign', phosphor: 'CurrencyDollar', untitled: 'currency' },

  // Security
  'lock': { lucide: 'Lock', phosphor: 'Lock', untitled: 'lock' },
  'unlock': { lucide: 'Unlock', phosphor: 'LockOpen', untitled: 'unlock' },
  'shield': { lucide: 'Shield', phosphor: 'Shield', untitled: 'shield' },
  'key': { lucide: 'Key', phosphor: 'Key', untitled: 'key' },

  // Media
  'play': { lucide: 'Play', phosphor: 'Play', untitled: 'play' },
  'pause': { lucide: 'Pause', phosphor: 'Pause', untitled: 'pause' },
  'image': { lucide: 'Image', phosphor: 'Image', untitled: 'image' },
  'video': { lucide: 'Video', phosphor: 'Video', untitled: 'video' },
  'camera': { lucide: 'Camera', phosphor: 'Camera', untitled: 'camera' },

  // Files
  'fileText': { lucide: 'FileText', phosphor: 'FileText', untitled: 'file-text' },
  'file': { lucide: 'File', phosphor: 'File', untitled: 'file' },

  // Navigation
  'externalLink': { lucide: 'ExternalLink', phosphor: 'ArrowSquareOut', untitled: 'external-link' },
  'link': { lucide: 'Link', phosphor: 'Link', untitled: 'link' },
  'moreHorizontal': { lucide: 'MoreHorizontal', phosphor: 'DotsThreeOutline', untitled: 'more-horizontal' },
  'moreVertical': { lucide: 'MoreVertical', phosphor: 'DotsThreeVertical', untitled: 'more-vertical' },

  // Priority
  'remove': { lucide: 'Minus', phosphor: 'Minus', untitled: 'remove' },

  // Eye (password)
  'eye': { lucide: 'Eye', phosphor: 'Eye', untitled: 'eye' },
  'eyeOff': { lucide: 'EyeOff', phosphor: 'EyeSlash', untitled: 'eye-off' },

  // Emotions
  'smile': { lucide: 'Smile', phosphor: 'Smiley', untitled: 'smile' },
  'frown': { lucide: 'Frown', phosphor: 'SmileySad', untitled: 'frown' },
  'meh': { lucide: 'Meh', phosphor: 'SmileyMeh', untitled: 'meh' },

  // Social
  'mail': { lucide: 'Mail', phosphor: 'Envelope', untitled: 'mail' },
  'phone': { lucide: 'Phone', phosphor: 'Phone', untitled: 'phone' },

  // Additional
  'flag': { lucide: 'Flag', phosphor: 'Flag', untitled: 'flag' },
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
    } catch (error) {
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
  provider: IconProvider | 'lucide' | 'phosphor' | 'untitled' = 'lucide'
): LucideIcon | React.ComponentType<Record<string, unknown>> | null {
  // Check if icon is in project icon list
  const iconMapping = PROJECT_ICONS[iconName as keyof typeof PROJECT_ICONS]

  if (!iconMapping) {
    // Fallback to direct lookup for backward compatibility
    return getIconDirect(iconName, provider)
  }

  const mappedName = iconMapping[provider]

  switch (provider) {
    case 'lucide':
      return (LucideIcons as unknown as Record<string, LucideIcon>)[mappedName] || null

    case 'phosphor':
      if (!PhosphorIcons) {
        return null
      }
      return PhosphorIcons?.[mappedName] || null

    case 'untitled':
      // Untitled Icons are SVG-based, handled separately
      return null

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
  provider: IconProvider | 'lucide' | 'phosphor' | 'untitled'
): LucideIcon | React.ComponentType<Record<string, unknown>> | null {
  switch (provider) {
    case 'lucide':
      // icons.ts에 없는 아이콘을 동적으로 찾기
      // PascalCase 변환 시도
      const lucideName = iconName.charAt(0).toUpperCase() + iconName.slice(1)
      // camelCase도 시도
      const camelCaseName = iconName.replace(/([A-Z])/g, (match, p1) =>
        match === iconName[0] ? match.toLowerCase() : match
      )

      return (LucideIcons as unknown as Record<string, LucideIcon>)[lucideName] ||
        (LucideIcons as unknown as Record<string, LucideIcon>)[iconName] ||
        (LucideIcons as unknown as Record<string, LucideIcon>)[camelCaseName] ||
        null

    case 'phosphor':
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

    case 'untitled':
      return null

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
  provider: IconProvider | 'lucide' | 'phosphor' | 'untitled'
): string {
  const iconMapping = PROJECT_ICONS[iconName as keyof typeof PROJECT_ICONS]
  if (iconMapping && iconMapping[provider]) {
    return iconMapping[provider]
  }
  return iconName
}

/**
 * Get all project icon names
 */
export function getProjectIconNames(): string[] {
  return Object.keys(PROJECT_ICONS)
}
