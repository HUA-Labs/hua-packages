/**
 * HUA-UI 마이크로 모션 시스템 타입
 *
 * "스륵 부드럽고 쫀득" - HUA-UI의 고유 모션 아이덴티티
 */

export type MicroMotionPreset =
  | 'subtle'     // 아주 미세한 반응
  | 'soft'       // 부드러운 반응
  | 'springy'    // 쫀득한 스프링
  | 'bouncy'     // 통통 튀는
  | 'snappy'     // 빠르고 날카로운

export type MicroMotionTrigger =
  | 'hover'
  | 'press'
  | 'focus'
  | 'enter'
  | 'exit'

export interface MicroMotionConfig {
  /** 모션 프리셋 */
  preset?: MicroMotionPreset
  /** 지속 시간 (ms) */
  duration?: number
  /** 딜레이 (ms) */
  delay?: number
  /** 스케일 변화량 (1.0 기준) */
  scale?: number
  /** Y축 이동량 (px) */
  translateY?: number
  /** X축 이동량 (px) */
  translateX?: number
  /** 회전량 (deg) */
  rotate?: number
  /** 비활성화 */
  disabled?: boolean
}

export interface MicroMotionState {
  isHovered: boolean
  isPressed: boolean
  isFocused: boolean
  isAnimating: boolean
}

export interface MicroMotionStyle {
  transform: string
  transition: string
  willChange: string
}

/** 스프링 물리 파라미터 */
export interface SpringConfig {
  /** 강성 (stiffness) - 높을수록 빠름 */
  stiffness: number
  /** 감쇠 (damping) - 높을수록 덜 튐 */
  damping: number
  /** 질량 (mass) - 높을수록 느림 */
  mass: number
}
