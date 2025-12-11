// ========================================
// HUA Motion SDK - 공통 타입 정의 (React 19 호환)
// ========================================

import { RefObject, CSSProperties } from 'react'

// ========================================
// React 19 호환 타입 정의
// ========================================

// React 19에서 더 구체적인 요소 타입 사용 (HTMLElement 제거)
export type MotionElement = HTMLDivElement | HTMLSpanElement | HTMLButtonElement | HTMLHeadingElement | HTMLParagraphElement | HTMLImageElement

// React 19 호환 Ref 타입 (null을 허용하도록 수정)
export type MotionRef<T extends MotionElement = HTMLDivElement> = RefObject<T | null>

// React 19 호환 스타일 타입
export type MotionStyle = CSSProperties & {
  // React 19의 새로운 CSS 속성들 지원
  '--motion-delay'?: string
  '--motion-duration'?: string
  '--motion-easing'?: string
  '--motion-progress'?: string
}

// ========================================
// 기본 모션 옵션 인터페이스
// ========================================

export interface BaseMotionOptions {
  /** 모션 시작 지연 시간 (ms) */
  delay?: number
  /** 모션 지속 시간 (ms) */
  duration?: number
  /** Intersection Observer 임계값 (0-1) */
  threshold?: number
  /** 한 번만 트리거할지 여부 */
  triggerOnce?: boolean
  /** 이징 함수명 */
  easing?: string
  /** 자동 시작 여부 */
  autoStart?: boolean
  /** 모션 완료 시 콜백 */
  onComplete?: () => void
  /** 모션 시작 시 콜백 */
  onStart?: () => void
  /** 모션 중단 시 콜백 */
  onStop?: () => void
  /** 모션 리셋 시 콜백 */
  onReset?: () => void
}

// ========================================
// 기본 모션 반환값 인터페이스 (React 19 호환)
// ========================================

export interface BaseMotionReturn<T extends MotionElement = HTMLDivElement> {
  /** DOM 요소 참조 (React 19 호환) */
  ref: React.RefObject<T | null>
  /** 요소가 화면에 보이는지 여부 */
  isVisible: boolean
  /** 모션이 진행 중인지 여부 */
  isAnimating: boolean
  /** 적용할 CSS 스타일 (React 19 호환) - useFadeIn 등에서는 항상 반환됨 */
  style: MotionStyle
  /** 적용할 CSS 클래스명 */
  className?: string
  /** 모션 진행률 (0-1) - useFadeIn 등에서는 항상 반환됨 */
  progress: number
  /** 모션 시작 함수 - useFadeIn 등에서는 항상 반환됨 */
  start: () => void
  /** 모션 리셋 함수 - useFadeIn 등에서는 항상 반환됨 */
  reset: () => void
  /** 모션 중단 함수 - useFadeIn 등에서는 항상 반환됨 */
  stop: () => void
  /** 모션 일시정지 함수 - 일부 훅에서만 제공 */
  pause?: () => void
  /** 모션 재개 함수 - 일부 훅에서만 제공 */
  resume?: () => void
}

// ========================================
// 훅별 확장 옵션 인터페이스들
// ========================================

export interface FadeInOptions extends BaseMotionOptions {
  /** 초기 투명도 */
  initialOpacity?: number
  /** 목표 투명도 */
  targetOpacity?: number
}

export interface SlideOptions extends BaseMotionOptions {
  /** 슬라이드 방향 */
  direction?: 'up' | 'down' | 'left' | 'right'
  /** 슬라이드 거리 (px) */
  distance?: number
}

export interface ScaleOptions extends BaseMotionOptions {
  /** 초기 스케일 */
  initialScale?: number
  /** 목표 스케일 */
  targetScale?: number
}

export interface BounceOptions extends BaseMotionOptions {
  /** 바운스 강도 */
  intensity?: number
  /** 바운스 횟수 */
  bounces?: number
}

export interface PulseOptions extends BaseMotionOptions {
  /** 펄스 강도 */
  intensity?: number
  /** 반복 횟수 (-1 = 무한) */
  repeatCount?: number
  /** 반복 간격 (ms) */
  repeatDelay?: number
}

export interface SpringOptions extends BaseMotionOptions {
  /** 스프링 질량 */
  mass?: number
  /** 스프링 강성 */
  stiffness?: number
  /** 스프링 감쇠 */
  damping?: number
  /** 정지 임계값 */
  restDelta?: number
  /** 정지 속도 */
  restSpeed?: number
}

export interface GestureOptions extends BaseMotionOptions {
  /** 호버 제스처 활성화 */
  hover?: boolean
  /** 드래그 제스처 활성화 */
  drag?: boolean
  /** 핀치 제스처 활성화 */
  pinch?: boolean
  /** 스와이프 제스처 활성화 */
  swipe?: boolean
  /** 틸트 제스처 활성화 */
  tilt?: boolean
}

export interface OrchestrationOptions extends BaseMotionOptions {
  /** 모션 시퀀스 타입 */
  sequence?: 'sequential' | 'parallel' | 'stagger'
  /** 스태거 지연 시간 */
  staggerDelay?: number
  /** 스태거 지속 시간 */
  staggerDuration?: number
}

// ========================================
// 유틸리티 타입들
// ========================================

export type MotionDirection = 'up' | 'down' | 'left' | 'right'
export type MotionEasing = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce' | 'elastic'
export type MotionSequence = 'sequential' | 'parallel' | 'stagger'
export type MotionTrigger = 'scroll' | 'click' | 'hover' | 'focus' | 'auto'

// ========================================
// 이벤트 콜백 타입들 (React 19 호환)
// ========================================

export type MotionCallback = () => void
export type MotionProgressCallback = (progress: number) => void
export type MotionStateCallback<T extends MotionElement = HTMLDivElement> = (state: BaseMotionReturn<T>) => void

// ========================================
// 성능 관련 타입들
// ========================================

export interface PerformanceMetrics {
  /** 모션 시작 시간 */
  startTime: number
  /** 모션 종료 시간 */
  endTime?: number
  /** 총 지속 시간 */
  duration: number
  /** FPS */
  fps: number
  /** 메모리 사용량 */
  memoryUsage?: number
}

export interface MotionConfig {
  /** 성능 모니터링 활성화 */
  enablePerformanceMonitoring?: boolean
  /** 디버그 모드 활성화 */
  debug?: boolean
  /** 로그 레벨 */
  logLevel?: 'none' | 'error' | 'warn' | 'info' | 'debug'
}
