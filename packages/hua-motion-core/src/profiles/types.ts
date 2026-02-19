// ========================================
// Motion Profile — 타입 정의
// ========================================

/** 프로필 전체의 기본 모션 디폴트 */
export interface MotionProfileBase {
  /** 기본 duration (ms) */
  duration: number
  /** 기본 easing (CSS 또는 named preset) */
  easing: string
  /** IntersectionObserver 임계값 */
  threshold: number
  /** 한 번만 트리거할지 여부 */
  triggerOnce: boolean
}

/** 입장 애니메이션 디폴트 */
export interface MotionProfileEntrance {
  slide: {
    /** 슬라이드 거리 (px) */
    distance: number
    /** 슬라이드 전용 이징 */
    easing: string
  }
  fade: {
    /** 초기 투명도 */
    initialOpacity: number
  }
  scale: {
    /** 초기 스케일 (useScrollReveal/useStagger용, 0.95 등 미세 변화) */
    from: number
  }
  bounce: {
    /** 바운스 강도 */
    intensity: number
    /** 바운스 전용 이징 */
    easing: string
  }
}

/** 스태거 디폴트 */
export interface MotionProfileStagger {
  /** 아이템 간 딜레이 (ms) */
  perItem: number
  /** 첫 아이템 전 딜레이 (ms) */
  baseDelay: number
}

/** 인터랙션 디폴트 */
export interface MotionProfileInteraction {
  hover: {
    /** 호버 시 스케일 */
    scale: number
    /** 호버 시 Y 오프셋 (px) */
    y: number
    /** 호버 duration (ms) */
    duration: number
    /** 호버 이징 */
    easing: string
  }
}

/** 스프링 물리 디폴트 */
export interface MotionProfileSpring {
  /** 질량 */
  mass: number
  /** 강성 */
  stiffness: number
  /** 감쇠 */
  damping: number
  /** 정지 임계값 */
  restDelta: number
  /** 정지 속도 */
  restSpeed: number
}

/** reduced motion 전략 */
export type ReducedMotionStrategy = 'skip' | 'fade-only' | 'minimal'

/** 전체 Motion Profile */
export interface MotionProfile {
  /** 프로필 이름 */
  name: string
  /** 공통 디폴트 */
  base: MotionProfileBase
  /** 입장 애니메이션 */
  entrance: MotionProfileEntrance
  /** 스태거 */
  stagger: MotionProfileStagger
  /** 인터랙션 */
  interaction: MotionProfileInteraction
  /** 스프링 물리 */
  spring: MotionProfileSpring
  /** reduced motion 전략 */
  reducedMotion: ReducedMotionStrategy
}

/** 내장 프로필 이름 */
export type BuiltInProfileName = 'neutral' | 'hua'

/** DeepPartial 유틸리티 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
