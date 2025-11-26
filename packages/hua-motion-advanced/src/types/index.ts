// ========================================
// HUA Motion SDK - Type Definitions
// ========================================

// 공통 타입들 import
import { BaseMotionOptions, BaseMotionReturn } from './common'
export * from './common'

// ========================================
// 1단계: useSimplePageMotion (프리셋 기반)
// ========================================

export type PageType = 'home' | 'dashboard' | 'product' | 'blog'

// ========================================
// 2단계: usePageMotions (페이지 레벨)
// ========================================

export type MotionType = 'hero' | 'title' | 'button' | 'card' | 'text' | 'image'
export type EntranceType = 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'bounceIn'

export interface PageMotionElement {
  type: MotionType
  entrance?: EntranceType
  hover?: boolean
  click?: boolean
  delay?: number
  duration?: number
  threshold?: number
}

export interface PageMotionsConfig {
  [elementId: string]: PageMotionElement
}

export interface MotionState {
  // 상태 관리 분리 (먼팀장님 제안)
  internalVisibility: boolean    // 내부 로직 (초기화, 리셋 등)
  triggeredVisibility: boolean   // 외부 트리거 (Intersection Observer)
  finalVisibility: boolean       // 최종 계산된 상태
  
  // 모션 값
  opacity: number
  translateY: number
  translateX: number
  scale: number
  rotation: number
  
  // 인터랙션 상태
  isHovered: boolean
  isClicked: boolean
  isAnimating: boolean
}

export interface MotionRef<T extends HTMLElement = HTMLElement> {
  ref: React.RefObject<T | null>
  style: React.CSSProperties
  isVisible: boolean
  isHovered: boolean
  isClicked: boolean
}

// ========================================
// 3단계: useSmartMotion (개별 요소)
// ========================================

export interface SmartMotionOptions<_T extends HTMLElement = HTMLElement> extends BaseMotionOptions {
  type?: MotionType
  entrance?: EntranceType
  hover?: boolean
  click?: boolean
}

export interface SmartMotionReturn<_T extends HTMLElement = HTMLElement> extends BaseMotionReturn {
  isHovered: boolean
  isClicked: boolean
}

// ========================================
// 공통 프리셋 시스템
// ========================================

export interface MotionPreset {
  entrance: EntranceType
  delay: number
  duration: number
  hover: boolean
  click: boolean
}

export interface PresetConfig {
  [key: string]: MotionPreset
}

// ========================================
// 고급 모션 타입
// ========================================

export interface SpringConfig {
  mass?: number
  stiffness?: number
  damping?: number
  restDelta?: number
  restSpeed?: number
}

export interface GestureConfig {
  hover?: boolean
  drag?: boolean
  pinch?: boolean
  swipe?: boolean
  tilt?: boolean
}

export interface OrchestrationConfig {
  sequence?: 'sequential' | 'parallel' | 'stagger'
  staggerDelay?: number
  staggerDuration?: number
} 