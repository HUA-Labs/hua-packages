/**
 * Icon Config Types
 *
 * Icon 시스템의 설정 타입 정의
 * 상태관리는 서비스 레벨에서 관리 (Zustand 등)
 */

export type IconSet = 'lucide' | 'phosphor' | 'iconsax'

export type PhosphorWeight = 'thin' | 'light' | 'regular' | 'bold' | 'duotone' | 'fill'

export type IconsaxVariant = 'line' | 'bold'

export interface IconConfig {
  set: IconSet
  weight: PhosphorWeight
  size: number
  color: string
  strokeWidth?: number // Lucide용
  iconsaxVariant?: IconsaxVariant // Iconsax용 (line | bold)
}

export const defaultIconConfig: IconConfig = {
  set: 'phosphor',
  weight: 'regular',
  size: 20,
  color: 'currentColor',
  strokeWidth: 1.25,
  iconsaxVariant: 'line',
}

/**
 * 세트별 기본 strokeWidth
 */
export const getDefaultStrokeWidth = (set: IconSet): number => {
  switch (set) {
    case 'lucide':
      return 1.25
    case 'phosphor':
      return 1.25 // Phosphor는 weight 사용
    case 'iconsax':
      return 1.5
    default:
      return 1.25
  }
}
