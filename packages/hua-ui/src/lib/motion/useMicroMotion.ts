'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import type {
  MicroMotionConfig,
  MicroMotionState,
  MicroMotionStyle,
  MicroMotionPreset,
} from './types'
import { EASING_FUNCTIONS, DURATIONS, HUA_DEFAULT_MOTION } from './presets'

export interface UseMicroMotionOptions extends MicroMotionConfig {
  /** hover 시 모션 활성화 */
  enableHover?: boolean
  /** press 시 모션 활성화 */
  enablePress?: boolean
  /** focus 시 모션 활성화 */
  enableFocus?: boolean
}

export interface UseMicroMotionReturn {
  /** 모션 상태 */
  state: MicroMotionState
  /** 적용할 스타일 */
  style: MicroMotionStyle
  /** 이벤트 핸들러들 */
  handlers: {
    onMouseEnter: () => void
    onMouseLeave: () => void
    onMouseDown: () => void
    onMouseUp: () => void
    onFocus: () => void
    onBlur: () => void
  }
  /** CSS 클래스 (Tailwind 호환) */
  className: string
}

/**
 * HUA-UI 마이크로 모션 훅
 *
 * "스륵 부드럽고 쫀득" 모션을 적용하는 훅
 *
 * @example
 * ```tsx
 * const { handlers, style, className } = useMicroMotion({ preset: 'springy' })
 *
 * return (
 *   <button
 *     {...handlers}
 *     style={style}
 *     className={className}
 *   >
 *     Click me
 *   </button>
 * )
 * ```
 */
export function useMicroMotion(
  options: UseMicroMotionOptions = {}
): UseMicroMotionReturn {
  const {
    preset = HUA_DEFAULT_MOTION.preset || 'springy',
    duration = DURATIONS[preset as MicroMotionPreset] || 200,
    delay = 0,
    scale = HUA_DEFAULT_MOTION.scale || 0.02,
    translateY = HUA_DEFAULT_MOTION.translateY || 0,
    translateX = 0,
    rotate = 0,
    disabled = false,
    enableHover = true,
    enablePress = true,
    enableFocus = false,
  } = options

  const [state, setState] = useState<MicroMotionState>({
    isHovered: false,
    isPressed: false,
    isFocused: false,
    isAnimating: false,
  })

  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 애니메이션 상태 업데이트
  const setAnimating = useCallback((isAnimating: boolean) => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }

    if (isAnimating) {
      setState(prev => ({ ...prev, isAnimating: true }))
      animationTimeoutRef.current = setTimeout(() => {
        setState(prev => ({ ...prev, isAnimating: false }))
      }, duration + delay)
    } else {
      setState(prev => ({ ...prev, isAnimating: false }))
    }
  }, [duration, delay])

  // 이벤트 핸들러들
  const handlers = useMemo(() => ({
    onMouseEnter: () => {
      if (disabled || !enableHover) return
      setState(prev => ({ ...prev, isHovered: true }))
      setAnimating(true)
    },
    onMouseLeave: () => {
      if (disabled) return
      setState(prev => ({ ...prev, isHovered: false, isPressed: false }))
      setAnimating(true)
    },
    onMouseDown: () => {
      if (disabled || !enablePress) return
      setState(prev => ({ ...prev, isPressed: true }))
      setAnimating(true)
    },
    onMouseUp: () => {
      if (disabled) return
      setState(prev => ({ ...prev, isPressed: false }))
      setAnimating(true)
    },
    onFocus: () => {
      if (disabled || !enableFocus) return
      setState(prev => ({ ...prev, isFocused: true }))
      setAnimating(true)
    },
    onBlur: () => {
      if (disabled) return
      setState(prev => ({ ...prev, isFocused: false }))
      setAnimating(true)
    },
  }), [disabled, enableHover, enablePress, enableFocus, setAnimating])

  // 스타일 계산
  const style = useMemo<MicroMotionStyle>(() => {
    if (disabled) {
      return {
        transform: 'none',
        transition: 'none',
        willChange: 'auto',
      }
    }

    const transforms: string[] = []
    const easing = EASING_FUNCTIONS[preset as MicroMotionPreset] || EASING_FUNCTIONS.springy

    // Hover 상태
    if (state.isHovered && !state.isPressed) {
      if (scale) transforms.push(`scale(${1 + scale})`)
      if (translateY) transforms.push(`translateY(${translateY}px)`)
      if (translateX) transforms.push(`translateX(${translateX}px)`)
      if (rotate) transforms.push(`rotate(${rotate}deg)`)
    }

    // Press 상태 (hover보다 우선)
    if (state.isPressed) {
      // 눌렸을 때는 살짝 작아지고 내려감
      if (scale) transforms.push(`scale(${1 - scale * 0.5})`)
      if (translateY) transforms.push(`translateY(${Math.abs(translateY) * 0.5}px)`)
    }

    // Focus 상태
    if (state.isFocused && !state.isHovered && !state.isPressed) {
      if (scale) transforms.push(`scale(${1 + scale * 0.5})`)
    }

    return {
      transform: transforms.length > 0 ? transforms.join(' ') : 'none',
      transition: `transform ${duration}ms ${easing} ${delay}ms`,
      willChange: state.isAnimating ? 'transform' : 'auto',
    }
  }, [state, disabled, preset, duration, delay, scale, translateY, translateX, rotate])

  // Tailwind 호환 클래스
  const className = useMemo(() => {
    if (disabled) return ''

    const classes: string[] = [
      'transform-gpu', // GPU 가속
    ]

    return classes.join(' ')
  }, [disabled])

  // 클린업
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  return {
    state,
    style,
    handlers,
    className,
  }
}

/**
 * 간단한 CSS-only 마이크로 모션 클래스 생성기
 *
 * motion-core 없이도 "스륵 쫀득" 느낌을 주는 Tailwind 클래스
 */
export function getMicroMotionClasses(
  preset: MicroMotionPreset = 'springy',
  options: {
    enableHover?: boolean
    enableActive?: boolean
    enableFocus?: boolean
  } = {}
): string {
  const { enableHover = true, enableActive = true, enableFocus = false } = options

  const baseClasses = ['transform-gpu', 'transition-transform']

  // 지속시간
  const durationClass = {
    subtle: 'duration-150',
    soft: 'duration-250',
    springy: 'duration-200',
    bouncy: 'duration-300',
    snappy: 'duration-150',
  }[preset]

  baseClasses.push(durationClass)

  // Hover 효과
  if (enableHover) {
    baseClasses.push('hover:scale-[1.02]', 'hover:-translate-y-0.5')
  }

  // Active 효과
  if (enableActive) {
    baseClasses.push('active:scale-[0.98]', 'active:translate-y-0')
  }

  // Focus 효과
  if (enableFocus) {
    baseClasses.push('focus:scale-[1.01]')
  }

  return baseClasses.join(' ')
}
