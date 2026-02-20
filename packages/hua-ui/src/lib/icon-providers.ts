/**
 * Icon Provider System
 *
 * 각 프로바이더별 로딩 전략 / Loading strategies per provider:
 *
 * 1. Phosphor Icons (https://phosphoricons.com) - default
 *    - Official package: @phosphor-icons/react (MIT License)
 *    - icons.ts에서 정적 subpath import (SSR-safe /dist/ssr)
 *    - PROJECT_ICONS 매핑으로 통합 이름 지원
 *    - 정적 맵에 없는 아이콘은 "?" fallback UI 표시
 *
 * 2. Iconsax Icons (https://iconsax.io) - separate entry
 *    - '@hua-labs/ui/iconsax'에서 import 시 자동 등록
 *    - 코어 번들에 포함되지 않음 / Not in core bundle
 *    - registerIconsaxResolver()로 lazy 연결
 *
 * Note: Lucide provider는 deprecated → 제거됨.
 * Note: 동적 barrel import (import('@phosphor-icons/react'))는 Turbopack에서
 *       전체 라이브러리(4.6MB)를 번들하므로 사용 금지.
 */

import { toPascalCase } from './case-utils'

// Iconsax resolver - registered lazily when iconsax entry is loaded
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let iconsaxResolver: ((name: string, variant?: string) => any) | null = null

/**
 * Register iconsax resolver (called from iconsax entry point).
 * Allows the core Icon component to resolve iconsax icons
 * without statically importing the iconsax bundle.
 */
export function registerIconsaxResolver(resolver: typeof iconsaxResolver) {
  iconsaxResolver = resolver
}

/**
 * Get registered iconsax resolver
 */
export function getIconsaxResolver() {
  return iconsaxResolver
}

// Icon Provider Type
export type IconProvider = 'lucide' | 'phosphor' | 'iconsax'

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
  'alert-circle': { lucide: 'AlertCircle', phosphor: 'WarningCircle', iconsax: 'Danger' },
  'alertCircle': { lucide: 'AlertCircle', phosphor: 'WarningCircle', iconsax: 'Danger' },
  'columns': { lucide: 'Columns', phosphor: 'Columns' },
  'users': { lucide: 'Users', phosphor: 'Users', iconsax: 'People' },
  'settings': { lucide: 'Settings', phosphor: 'Gear' },
  'menu': { lucide: 'Menu', phosphor: 'List', iconsax: 'Menu' },
  'close': { lucide: 'X', phosphor: 'X', iconsax: 'CloseCircle' },
  'chevronLeft': { lucide: 'ChevronLeft', phosphor: 'CaretLeft', iconsax: 'ArrowLeft2' },
  'chevronRight': { lucide: 'ChevronRight', phosphor: 'CaretRight', iconsax: 'ArrowRight2' },
  'chevronDown': { lucide: 'ChevronDown', phosphor: 'CaretDown', iconsax: 'ArrowDown2' },
  'chevronUp': { lucide: 'ChevronUp', phosphor: 'CaretUp', iconsax: 'ArrowUp2' },
  'arrowLeft': { lucide: 'ArrowLeft', phosphor: 'ArrowLeft', iconsax: 'ArrowLeft' },
  'arrowRight': { lucide: 'ArrowRight', phosphor: 'ArrowRight', iconsax: 'ArrowRight' },
  'arrowUp': { lucide: 'ArrowUp', phosphor: 'ArrowUp', iconsax: 'ArrowUp' },
  'arrowDown': { lucide: 'ArrowDown', phosphor: 'ArrowDown', iconsax: 'ArrowDown' },

  // Actions
  'add': { lucide: 'Plus', phosphor: 'Plus', iconsax: 'Add' },
  'edit': { lucide: 'Edit', phosphor: 'Pencil' },
  'pencil': { lucide: 'Pencil', phosphor: 'Pencil' },
  'delete': { lucide: 'Trash2', phosphor: 'Trash', iconsax: 'Trash' },
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
  'check-circle': { lucide: 'CheckCircle', phosphor: 'CheckCircle', iconsax: 'TickCircle' },
  'checkCircle': { lucide: 'CheckCircle', phosphor: 'CheckCircle', iconsax: 'TickCircle' },
  'success': { lucide: 'CheckCircle', phosphor: 'CheckCircle', iconsax: 'TickCircle' },
  'error': { lucide: 'XCircle', phosphor: 'XCircle', iconsax: 'CloseCircle' },
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
  'userPlus': { lucide: 'UserPlus', phosphor: 'UserPlus', iconsax: 'UserAdd' },
  'logIn': { lucide: 'LogIn', phosphor: 'SignIn', iconsax: 'Login' },
  'logOut': { lucide: 'LogOut', phosphor: 'SignOut', iconsax: 'Logout' },
  'chrome': { lucide: 'Chrome', phosphor: 'ChromeLogo', iconsax: 'Chrome' },
  'github': { lucide: 'Github', phosphor: 'GithubLogo' },
  'message': { lucide: 'MessageCircle', phosphor: 'ChatCircle' },

  // Content
  'messageSquare': { lucide: 'MessageSquare', phosphor: 'ChatSquare' },
  'message-square': { lucide: 'MessageSquare', phosphor: 'ChatSquare' },
  'inbox': { lucide: 'Inbox', phosphor: 'Inbox' },
  'calendar': { lucide: 'Calendar', phosphor: 'Calendar' },
  'calendarPlus': { lucide: 'CalendarPlus', phosphor: 'CalendarPlus' },
  'checkSquare': { lucide: 'CheckSquare', phosphor: 'CheckSquare', iconsax: 'TickSquare' },
  'clock': { lucide: 'Clock', phosphor: 'Clock' },
  'book': { lucide: 'Book', phosphor: 'Book', iconsax: 'Book' },
  'bookOpen': { lucide: 'BookOpen', phosphor: 'BookOpen', iconsax: 'Book' },

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
  'globe': { lucide: 'Globe', phosphor: 'Globe', iconsax: 'Global' },
  'deviceMobile': { lucide: 'Smartphone', phosphor: 'DeviceMobile' },
  'smartphone': { lucide: 'Smartphone', phosphor: 'DeviceMobile' },
  'floppyDisk': { lucide: 'Save', phosphor: 'FloppyDisk' },

  // Data & Analytics
  'chart': { lucide: 'BarChart3', phosphor: 'ChartBar' },
  'barChart': { lucide: 'BarChart', phosphor: 'ChartBar' },
  'trendingUp': { lucide: 'TrendingUp', phosphor: 'TrendUp' },
  'trendingDown': { lucide: 'TrendingDown', phosphor: 'TrendDown' },
  'activity': { lucide: 'Activity', phosphor: 'Pulse' },
  'database': { lucide: 'Database', phosphor: 'Database' },
  'dollarSign': { lucide: 'DollarSign', phosphor: 'CurrencyDollar' },
  'dollar': { lucide: 'DollarSign', phosphor: 'CurrencyDollar' },
  'currency': { lucide: 'DollarSign', phosphor: 'CurrencyDollar' },

  'layers': { lucide: 'Layers', phosphor: 'Stack' },
  'ban': { lucide: 'Ban', phosphor: 'Prohibit' },

  // Security
  'lock': { lucide: 'Lock', phosphor: 'Lock', iconsax: 'Lock' },
  'unlock': { lucide: 'Unlock', phosphor: 'LockOpen', iconsax: 'Unlock' },
  'shield': { lucide: 'Shield', phosphor: 'Shield', iconsax: 'Shield' },
  'key': { lucide: 'Key', phosphor: 'Key' },

  // Media
  'play': { lucide: 'Play', phosphor: 'Play', iconsax: 'Play' },
  'pause': { lucide: 'Pause', phosphor: 'Pause', iconsax: 'Pause' },
  'image': { lucide: 'Image', phosphor: 'Image', iconsax: 'Image' },
  'video': { lucide: 'Video', phosphor: 'Video', iconsax: 'Video' },
  'camera': { lucide: 'Camera', phosphor: 'Camera', iconsax: 'Camera' },

  // Files
  'fileText': { lucide: 'FileText', phosphor: 'FileText' },
  'file': { lucide: 'File', phosphor: 'File' },

  // Navigation
  'externalLink': { lucide: 'ExternalLink', phosphor: 'ArrowSquareOut' },
  'link': { lucide: 'Link', phosphor: 'Link', iconsax: 'Link' },
  'moreHorizontal': { lucide: 'MoreHorizontal', phosphor: 'DotsThreeOutline' },
  'moreVertical': { lucide: 'MoreVertical', phosphor: 'DotsThreeVertical' },

  // Priority
  'remove': { lucide: 'Minus', phosphor: 'Minus', iconsax: 'Minus' },

  // Eye (password)
  'eye': { lucide: 'Eye', phosphor: 'Eye', iconsax: 'Eye' },
  'eyeOff': { lucide: 'EyeOff', phosphor: 'EyeSlash', iconsax: 'EyeSlash' },

  // Emotions
  'smile': { lucide: 'Smile', phosphor: 'Smiley', iconsax: 'EmojiHappy' },
  'frown': { lucide: 'Frown', phosphor: 'SmileySad', iconsax: 'EmojiSad' },
  'meh': { lucide: 'Meh', phosphor: 'SmileyMeh', iconsax: 'EmojiNormal' },

  // Social
  'mail': { lucide: 'Mail', phosphor: 'Envelope' },
  'phone': { lucide: 'Phone', phosphor: 'Phone' },

  // Additional
  'flag': { lucide: 'Flag', phosphor: 'Flag', iconsax: 'Flag' },
  'rocket': { lucide: 'Rocket', phosphor: 'Rocket', iconsax: 'Rocket' },

  // Connectivity & Misc
  'ticket': { lucide: 'Ticket', phosphor: 'Ticket', iconsax: 'Ticket' },
  'clipboard': { lucide: 'ClipboardList', phosphor: 'Clipboard', iconsax: 'Sticker' },
  'wifi': { lucide: 'Wifi', phosphor: 'WifiHigh', iconsax: 'Wifi' },
  'wifiOff': { lucide: 'WifiOff', phosphor: 'WifiSlash' },
  'cpu': { lucide: 'Cpu', phosphor: 'Cpu', iconsax: 'Computing' },
  'mask': { lucide: 'Drama', phosphor: 'MaskHappy', iconsax: 'EmojiHappy' },

  // Text Formatting (Markdown Toolbar)
  'bold': { lucide: 'Bold', phosphor: 'TextB' },
  'italic': { lucide: 'Italic', phosphor: 'TextItalic' },
  'strikethrough': { lucide: 'Strikethrough', phosphor: 'TextStrikethrough' },
  'heading': { lucide: 'Heading', phosphor: 'TextHOne' },
  'code': { lucide: 'Code', phosphor: 'Code', iconsax: 'Code' },
  'fileCode': { lucide: 'FileCode', phosphor: 'FileCode' },
  'quote': { lucide: 'Quote', phosphor: 'Quotes', iconsax: 'QuoteUp' },
  'list': { lucide: 'List', phosphor: 'List' },
  'listOrdered': { lucide: 'ListOrdered', phosphor: 'ListNumbers' },
  'minus': { lucide: 'Minus', phosphor: 'Minus', iconsax: 'Minus' },
} as const

/**
 * Get icon from provider (iconsax only)
 *
 * Phosphor/Lucide는 정적 맵(icons.ts)으로 해결. 이 함수는 iconsax fallback용.
 */
export function getIconFromProvider(
  iconName: string,
  provider: IconProvider = 'phosphor'
): React.ComponentType<Record<string, unknown>> | null {
  if (provider !== 'iconsax' || !iconsaxResolver) return null

  const iconMapping = PROJECT_ICONS[iconName as keyof typeof PROJECT_ICONS]
  const iconsaxName = iconMapping
    ? (iconMapping as Record<string, string | undefined>)['iconsax'] || toPascalCase(iconName)
    : toPascalCase(iconName)

  return iconsaxResolver(iconsaxName) || null
}

/**
 * Get icon name for provider
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
