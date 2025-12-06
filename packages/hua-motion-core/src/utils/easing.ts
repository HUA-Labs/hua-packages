// 고급 이징 함수들 - Framer Motion과 유사한 기능 제공

export type EasingFunction = (t: number) => number

// 기본 이징 함수들
export const linear: EasingFunction = (t) => t

export const easeIn: EasingFunction = (t) => t * t
export const easeOut: EasingFunction = (t) => 1 - (1 - t) * (1 - t)
export const easeInOut: EasingFunction = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2

// 고급 이징 함수들
export const easeInQuad: EasingFunction = (t) => t * t
export const easeOutQuad: EasingFunction = (t) => 1 - (1 - t) * (1 - t)
export const easeInOutQuad: EasingFunction = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2

export const easeInCubic: EasingFunction = (t) => t * t * t
export const easeOutCubic: EasingFunction = (t) => 1 - Math.pow(1 - t, 3)
export const easeInOutCubic: EasingFunction = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

export const easeInQuart: EasingFunction = (t) => t * t * t * t
export const easeOutQuart: EasingFunction = (t) => 1 - Math.pow(1 - t, 4)
export const easeInOutQuart: EasingFunction = (t) => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2

export const easeInQuint: EasingFunction = (t) => t * t * t * t * t
export const easeOutQuint: EasingFunction = (t) => 1 - Math.pow(1 - t, 5)
export const easeInOutQuint: EasingFunction = (t) => t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2

export const easeInSine: EasingFunction = (t) => 1 - Math.cos((t * Math.PI) / 2)
export const easeOutSine: EasingFunction = (t) => Math.sin((t * Math.PI) / 2)
export const easeInOutSine: EasingFunction = (t) => -(Math.cos(Math.PI * t) - 1) / 2

export const easeInExpo: EasingFunction = (t) => t === 0 ? 0 : Math.pow(2, 10 * t - 10)
export const easeOutExpo: EasingFunction = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
export const easeInOutExpo: EasingFunction = (t) => {
  if (t === 0) return 0
  if (t === 1) return 1
  if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2
  return (2 - Math.pow(2, -20 * t + 10)) / 2
}

export const easeInCirc: EasingFunction = (t) => 1 - Math.sqrt(1 - Math.pow(t, 2))
export const easeOutCirc: EasingFunction = (t) => Math.sqrt(1 - Math.pow(t - 1, 2))
export const easeInOutCirc: EasingFunction = (t) => {
  if (t < 0.5) return (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
  return (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2
}

export const easeInBounce: EasingFunction = (t) => 1 - easeOutBounce(1 - t)
export const easeOutBounce: EasingFunction = (t) => {
  const n1 = 7.5625
  const d1 = 2.75

  if (t < 1 / d1) {
    return n1 * t * t
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375
  }
}
export const easeInOutBounce: EasingFunction = (t) => {
  if (t < 0.5) return (1 - easeOutBounce(1 - 2 * t)) / 2
  return (1 + easeOutBounce(2 * t - 1)) / 2
}

export const easeInBack: EasingFunction = (t) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return c3 * t * t * t - c1 * t * t
}
export const easeOutBack: EasingFunction = (t) => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}
export const easeInOutBack: EasingFunction = (t) => {
  const c1 = 1.70158
  const c2 = c1 * 1.525
  if (t < 0.5) {
    return (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
  } else {
    return (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2
  }
}

export const easeInElastic: EasingFunction = (t) => {
  const c4 = (2 * Math.PI) / 3
  if (t === 0) return 0
  if (t === 1) return 1
  return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 0.75) * c4)
}
export const easeOutElastic: EasingFunction = (t) => {
  const c4 = (2 * Math.PI) / 3
  if (t === 0) return 0
  if (t === 1) return 1
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
}
export const easeInOutElastic: EasingFunction = (t) => {
  const c5 = (2 * Math.PI) / 4.5
  if (t === 0) return 0
  if (t === 1) return 1
  if (t < 0.5) {
    return -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
  } else {
    return (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1
  }
}

// 특수 효과 이징 함수들
export const pulse: EasingFunction = (t) => Math.sin(t * Math.PI) * 0.5 + 0.5
export const pulseSmooth: EasingFunction = (t) => Math.sin(t * Math.PI * 2) * 0.3 + 0.7
export const skeletonWave: EasingFunction = (t) => Math.sin((t - 0.5) * Math.PI * 2) * 0.5 + 0.5
export const blink: EasingFunction = (t) => t < 0.5 ? 1 : 0

// 이징 타입 정의
export type EasingType = 
  | 'linear'
  | 'easeIn' | 'easeOut' | 'easeInOut'
  | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad'
  | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic'
  | 'easeInQuart' | 'easeOutQuart' | 'easeInOutQuart'
  | 'easeInQuint' | 'easeOutQuint' | 'easeInOutQuint'
  | 'easeInSine' | 'easeOutSine' | 'easeInOutSine'
  | 'easeInExpo' | 'easeOutExpo' | 'easeInOutExpo'
  | 'easeInCirc' | 'easeOutCirc' | 'easeInOutCirc'
  | 'easeInBounce' | 'easeOutBounce' | 'easeInOutBounce'
  | 'easeInBack' | 'easeOutBack' | 'easeInOutBack'
  | 'easeInElastic' | 'easeOutElastic' | 'easeInOutElastic'
  | 'pulse' | 'pulseSmooth' | 'skeletonWave' | 'blink'

// 이징 함수 객체 (기존 호환성을 위해)
export const easing = {
  linear,
  easeIn,
  easeOut,
  easeInOut,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeInQuart,
  easeOutQuart,
  easeInOutQuart,
  easeInQuint,
  easeOutQuint,
  easeInOutQuint,
  easeInSine,
  easeOutSine,
  easeInOutSine,
  easeInExpo,
  easeOutExpo,
  easeInOutExpo,
  easeInCirc,
  easeOutCirc,
  easeInOutCirc,
  easeInBounce,
  easeOutBounce,
  easeInOutBounce,
  easeInBack,
  easeOutBack,
  easeInOutBack,
  easeInElastic,
  easeOutElastic,
  easeInOutElastic,
  pulse,
  pulseSmooth,
  skeletonWave,
  blink
} as const

// 이징 함수 확인 함수
export function isValidEasing(easingName: string): boolean {
  return easingName in easing
}

// 이징 함수 가져오기 함수
export function getEasing(easingName: unknown): EasingFunction {
  if (typeof easingName === 'function') {
    // 타입이 Function이지만 EasingFunction 시그니처와 일치하는지 확인
    return (easingName as EasingFunction)
  }

  if (typeof easingName === 'string') {
    if (easingName in easing) {
      return easing[easingName as keyof typeof easing]
    }

    const fallbackMap: Record<string, keyof typeof easing> = {
      bounce: 'easeOutBounce',
      easeInOut: 'easeInOutCubic',
      easeIn: 'easeInQuad',
      easeOut: 'easeOutQuad'
    }

    const fallback = fallbackMap[easingName]
    if (fallback && fallback in easing) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[HUA Motion] Unknown easing "${easingName}", using fallback "${fallback}".`)
      }
      return easing[fallback]
    }

    if (process.env.NODE_ENV === 'development') {
      console.warn(`[HUA Motion] Unknown easing "${easingName}", using default "easeOut".`)
    }
  }

  return easeOut
}

// 이징 적용 함수
export function applyEasing(t: number, easingName: string | EasingFunction): number {
  const easingFn = getEasing(easingName)
  return easingFn(t)
}

// 안전한 이징 적용 함수 (에러 방지)
export function safeApplyEasing(t: number, easingName: unknown): number {
  try {
    const easingFn = getEasing(easingName)
    return easingFn(t)
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[HUA Motion] Failed to apply easing "${easingName}":`, err)
    }
    return easeOut(t)
  }
}

// 사용 가능한 이징 함수 목록
export function getAvailableEasings(): string[] {
  return Object.keys(easing)
}

// 이징 함수 유효성 검사
export function isEasingFunction(value: any): value is EasingFunction {
  return typeof value === 'function'
}

// 이징 프리셋
export const easingPresets = {
  default: 'easeOut',
  smooth: 'easeInOutCubic',
  fast: 'easeOutQuad',
  slow: 'easeInOutSine',
  bouncy: 'easeOutBounce',
  elastic: 'easeOutElastic',
  fade: 'easeInOut',
  scale: 'easeOutBack'
} as const

// 프리셋에서 이징 함수 가져오기
export function getPresetEasing(preset: keyof typeof easingPresets): EasingFunction {
  const easingName = easingPresets[preset]
  return getEasing(easingName)
} 