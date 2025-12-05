/**
 * Icon Names - 자동완성 지원
 * 
 * 이 파일은 TypeScript 자동완성을 위한 아이콘 이름 목록입니다.
 * 실제 아이콘은 icons.ts와 PROJECT_ICONS에서 관리됩니다.
 */

import type { IconName } from './icons'
import { PROJECT_ICONS } from './icon-providers'

/**
 * PROJECT_ICONS에 정의된 모든 아이콘 이름
 */
export type ProjectIconName = keyof typeof PROJECT_ICONS

/**
 * 사용 가능한 모든 아이콘 이름 (icons.ts + PROJECT_ICONS)
 */
export type AllIconName = IconName | ProjectIconName

/**
 * 아이콘 이름 목록 (자동완성용)
 */
export const iconNames = [
  // Navigation
  'home', 'menu', 'close', 'search', 'settings', 'user', 'bell',
  'arrowLeft', 'arrowRight', 'arrowUp', 'arrowDown',
  'chevronLeft', 'chevronRight', 'chevronUp', 'chevronDown',
  
  // Actions
  'add', 'edit', 'delete', 'remove', 'check', 'share', 'download', 'upload',
  'save', 'copy', 'refresh', 'search',
  
  // Status & Feedback
  'loader', 'success', 'error', 'warning', 'info', 'alertCircle',
  'heart', 'star', 'bookmark',
  
  // User & Auth
  'logIn', 'logOut', 'shield', 'key', 'lock', 'unlock',
  'eye', 'eyeOff', 'users', 'userPlus',
  
  // Data & Analytics
  'chart', 'barChart', 'pieChart', 'trendingUp', 'trendingDown',
  'activity', 'database', 'zap', 'circle',
  
  // Files & Content
  'fileText', 'file', 'folder', 'book', 'bookOpen',
  'image', 'video', 'camera',
  
  // Communication
  'message', 'messageSquare', 'phone', 'mail', 'send',
  
  // Media
  'play', 'pause', 'mic', 'headphones',
  
  // Emotions
  'smile', 'frown', 'meh', 'laugh', 'angry',
  'thumbsUp', 'thumbsDown',
  
  // Time & Date
  'clock', 'timer', 'calendar', 'calendarDays',
  
  // UI & Theme
  'monitor', 'sun', 'moon', 'sparkles', 'lightbulb', 'brain',
  
  // Navigation Extended
  'externalLink', 'link', 'moreHorizontal', 'moreVertical',
] as const

/**
 * 프로바이더별 아이콘 이름 매핑 (참고용)
 * 
 * @example
 * // Lucide 아이콘 사용
 * <Icon name="home" provider="lucide" />  // Lucide: Home
 * 
 * // Phosphor 아이콘 사용
 * <Icon name="home" provider="phosphor" />  // Phosphor: House
 * 
 * // Untitled 아이콘 사용
 * <Icon name="home" provider="untitled" />  // Untitled: home
 */
export const iconProviderMapping: Record<string, {
  lucide: string
  phosphor: string
  untitled: string
}> = PROJECT_ICONS

/**
 * 아이콘 이름이 유효한지 확인
 */
export function isValidIconName(name: string): name is AllIconName {
  return name in PROJECT_ICONS || iconNames.includes(name as any)
}

/**
 * 프로바이더별 아이콘 이름 가져오기
 */
export function getIconNameForProvider(
  iconName: string,
  provider: 'lucide' | 'phosphor' | 'untitled'
): string | null {
  const mapping = PROJECT_ICONS[iconName as keyof typeof PROJECT_ICONS]
  if (!mapping) return null
  
  return mapping[provider] || null
}


