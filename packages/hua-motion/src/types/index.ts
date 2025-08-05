// ========================================
// HUA Animation SDK - Type Definitions
// ========================================

// ========================================
// 1단계: useSimplePageAnimation (프리셋 기반)
// ========================================

export type PageType = 'home' | 'dashboard' | 'product' | 'blog'

// ========================================
// 2단계: usePageAnimations (페이지 레벨)
// ========================================

export type AnimationType = 'hero' | 'title' | 'button' | 'card' | 'text' | 'image'
export type EntranceType = 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'bounceIn'

export interface AnimationElement {
  type: AnimationType
  entrance?: EntranceType
  hover?: boolean
  click?: boolean
  delay?: number
  duration?: number
  threshold?: number
}

export interface PageAnimationsConfig {
  [elementId: string]: AnimationElement
}

export interface AnimationState {
  // 상태 관리 분리 (먼팀장님 제안)
  internalVisibility: boolean    // 내부 로직 (초기화, 리셋 등)
  triggeredVisibility: boolean   // 외부 트리거 (Intersection Observer)
  finalVisibility: boolean       // 최종 계산된 상태
  
  // 애니메이션 값
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

export interface AnimationRef {
  ref: React.RefObject<HTMLDivElement>
  style: React.CSSProperties
  isVisible: boolean
  isHovered: boolean
  isClicked: boolean
}

// ========================================
// 3단계: useSmartAnimation (개별 요소)
// ========================================

export interface SmartAnimationOptions {
  type?: AnimationType
  entrance?: EntranceType
  hover?: boolean
  click?: boolean
  delay?: number
  duration?: number
  threshold?: number
}

export interface SmartAnimationReturn {
  ref: React.RefObject<HTMLDivElement>
  style: React.CSSProperties
  isVisible: boolean
  isHovered: boolean
  isClicked: boolean
}

// ========================================
// 공통 프리셋 시스템
// ========================================

export interface AnimationPreset {
  entrance: EntranceType
  delay: number
  duration: number
  hover: boolean
  click: boolean
}

export interface PresetConfig {
  [key: string]: AnimationPreset
}

// ========================================
// 고급 애니메이션 타입
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