/**
 * Icon Config Types
 * 
 * Icon 시스템의 설정 타입 정의
 * 상태관리는 서비스 레벨에서 관리 (Zustand 등)
 */

export type IconSet = 'lucide' | 'phosphor' | 'untitled' | 'iconsax'

export type PhosphorWeight = 'thin' | 'light' | 'regular' | 'bold' | 'duotone' | 'fill'

export interface IconConfig {
  set: IconSet
  weight: PhosphorWeight
  size: number
  color: string
  strokeWidth?: number // Lucide/Untitled용
}

export const defaultIconConfig: IconConfig = {
  set: 'phosphor',
  weight: 'regular',
  size: 20,
  color: 'currentColor',
  strokeWidth: 1.25,
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
    case 'untitled':
      return 1.5
    case 'iconsax':
      return 1.5 // Iconsax는 stroke-width 1.5가 기본
    default:
      return 1.25
  }
}
