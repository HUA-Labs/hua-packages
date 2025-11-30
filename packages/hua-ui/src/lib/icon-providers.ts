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
  
  // Actions
  'add': { lucide: 'Plus', phosphor: 'Plus', untitled: 'add' },
  'edit': { lucide: 'Edit', phosphor: 'Pencil', untitled: 'edit' },
  'pencil': { lucide: 'Pencil', phosphor: 'Pencil', untitled: 'pencil' },
  'trash': { lucide: 'Trash2', phosphor: 'Trash', untitled: 'trash' },
  'upload': { lucide: 'Upload', phosphor: 'Upload', untitled: 'upload' },
  'x': { lucide: 'X', phosphor: 'X', untitled: 'close' },
  'check': { lucide: 'Check', phosphor: 'Check', untitled: 'check' },
  'search': { lucide: 'Search', phosphor: 'MagnifyingGlass', untitled: 'search' },
  
  // Status & Feedback
  'loader': { lucide: 'Loader2', phosphor: 'Spinner', untitled: 'loader' },
  'loader2': { lucide: 'Loader2', phosphor: 'Spinner', untitled: 'loader' },
  'check-circle': { lucide: 'CheckCircle', phosphor: 'CheckCircle', untitled: 'check-circle' },
  'checkCircle': { lucide: 'CheckCircle', phosphor: 'CheckCircle', untitled: 'check-circle' },
  'refresh': { lucide: 'RefreshCw', phosphor: 'ArrowClockwise', untitled: 'refresh' },
  'refreshCw': { lucide: 'RefreshCw', phosphor: 'ArrowClockwise', untitled: 'refresh' },
  'bell': { lucide: 'Bell', phosphor: 'Bell', untitled: 'bell' },
  
  // User & Auth
  'user': { lucide: 'User', phosphor: 'User', untitled: 'user' },
  'userPlus': { lucide: 'UserPlus', phosphor: 'UserPlus', untitled: 'user-plus' },
  'logOut': { lucide: 'LogOut', phosphor: 'SignOut', untitled: 'log-out' },
  'chrome': { lucide: 'Chrome', phosphor: 'ChromeLogo', untitled: 'chrome' },
  'github': { lucide: 'Github', phosphor: 'GithubLogo', untitled: 'github' },
  'message': { lucide: 'MessageCircle', phosphor: 'ChatCircle', untitled: 'message' },
  
  // Content
  'messageSquare': { lucide: 'MessageSquare', phosphor: 'ChatSquare', untitled: 'message-square' },
  'message-square': { lucide: 'MessageSquare', phosphor: 'ChatSquare', untitled: 'message-square' },
  'inbox': { lucide: 'Inbox', phosphor: 'Inbox', untitled: 'inbox' },
  'star': { lucide: 'Star', phosphor: 'Star', untitled: 'star' },
  'calendar': { lucide: 'Calendar', phosphor: 'Calendar', untitled: 'calendar' },
  'checkSquare': { lucide: 'CheckSquare', phosphor: 'CheckSquare', untitled: 'check-square' },
  'clock': { lucide: 'Clock', phosphor: 'Clock', untitled: 'clock' },
  
  // Theme & UI
  'monitor': { lucide: 'Monitor', phosphor: 'Monitor', untitled: 'monitor' },
  'sun': { lucide: 'Sun', phosphor: 'Sun', untitled: 'sun' },
  'moon': { lucide: 'Moon', phosphor: 'Moon', untitled: 'moon' },
  
  // AI & Features
  'sparkles': { lucide: 'Sparkles', phosphor: 'Sparkle', untitled: 'sparkles' },
  'lightbulb': { lucide: 'Lightbulb', phosphor: 'Lightbulb', untitled: 'lightbulb' },
  
  // Priority
  'arrowUp': { lucide: 'ArrowUp', phosphor: 'ArrowUp', untitled: 'arrow-up' },
  'arrowDown': { lucide: 'ArrowDown', phosphor: 'ArrowDown', untitled: 'arrow-down' },
  'remove': { lucide: 'Minus', phosphor: 'Minus', untitled: 'remove' },
  
  // Eye (password)
  'eye': { lucide: 'Eye', phosphor: 'Eye', untitled: 'eye' },
  'eyeOff': { lucide: 'EyeOff', phosphor: 'EyeSlash', untitled: 'eye-off' },
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
 */
export function getIconFromProvider(
  iconName: string,
  provider: IconProvider = 'lucide'
): LucideIcon | React.ComponentType<any> | null {
  // Check if icon is in project icon list
  const iconMapping = PROJECT_ICONS[iconName as keyof typeof PROJECT_ICONS]
  
  if (!iconMapping) {
    // Fallback to direct lookup for backward compatibility
    return getIconDirect(iconName, provider)
  }
  
  const mappedName = iconMapping[provider]
  
  switch (provider) {
    case 'lucide':
      return (LucideIcons as any)[mappedName] || null
    
    case 'phosphor':
      if (!PhosphorIcons) {
        return null
      }
      return (PhosphorIcons as any)?.[mappedName] || null
    
    case 'untitled':
      // Untitled Icons are SVG-based, handled separately
      return null
    
    default:
      return null
  }
}

/**
 * Direct icon lookup (fallback for icons not in PROJECT_ICONS)
 */
function getIconDirect(
  iconName: string,
  provider: IconProvider
): LucideIcon | React.ComponentType<any> | null {
  switch (provider) {
    case 'lucide':
      const lucideName = iconName.charAt(0).toUpperCase() + iconName.slice(1)
      return (LucideIcons as any)[iconName] || (LucideIcons as any)[lucideName] || null
    
    case 'phosphor':
      if (!PhosphorIcons) {
        return null
      }
      const phosphorName1 = iconName.charAt(0).toUpperCase() + iconName.slice(1)
      const phosphorName2 = iconName
        .split(/(?=[A-Z])/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('')
      return (PhosphorIcons as any)?.[phosphorName1] || 
             (PhosphorIcons as any)?.[phosphorName2] ||
             (PhosphorIcons as any)?.[iconName] ||
             null
    
    case 'untitled':
      return null
    
    default:
      return null
  }
}

/**
 * Get icon name for provider
 */
export function getIconNameForProvider(
  iconName: string,
  provider: IconProvider
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
