import React, { useRef, useState, useEffect, useCallback } from 'react'

export interface AutoMotionConfig {
  duration?: number
  delay?: number
  autoStart?: boolean
  easing?: string
  type?: 'fade' | 'slide' | 'scale' | 'rotate'
}

export interface MotionConfig {
  duration?: number
  delay?: number
  autoStart?: boolean
  easing?: string
  type?: 'fade' | 'slide' | 'scale' | 'rotate'
}

// 기존 API 호환성을 위한 인터페이스
export interface MotionFromToConfig {
  from: Record<string, any>
  to: Record<string, any>
  duration?: number
  delay?: number
  autoStart?: boolean
  ease?: string
}

export interface MotionState {
  transform: string
  opacity: number
  backgroundColor?: string
  isAnimating: boolean
}

export function useMotion(
  configOrFrom: MotionConfig | Record<string, any> = {},
  to?: Record<string, any>,
  options?: {
    duration?: number
    delay?: number
    autoStart?: boolean
    ease?: string
  }
) {
  // 기존 API 호환성 처리
  let config: MotionConfig
  let fromValues: Record<string, any> = {}
  let toValues: Record<string, any> = {}

  if (to && options) {
    // 기존 API: useMotion(from, to, options)
    fromValues = configOrFrom as Record<string, any>
    toValues = to
    config = {
      duration: options.duration || 1000,
      delay: options.delay || 0,
      autoStart: options.autoStart || false,
      easing: options.ease || 'ease-out'
    }
  } else {
    // 새로운 API: useMotion(config)
    config = configOrFrom as MotionConfig
    const { type = 'fade' } = config
    
    // 타입별 기본값 설정
    switch (type) {
      case 'fade':
        fromValues = { opacity: 0 }
        toValues = { opacity: 1 }
        break
      case 'slide':
        fromValues = { opacity: 0, translateX: 100 }
        toValues = { opacity: 1, translateX: 0 }
        break
      case 'scale':
        fromValues = { opacity: 0, scale: 0 }
        toValues = { opacity: 1, scale: 1 }
        break
      case 'rotate':
        fromValues = { opacity: 0, rotate: 180 }
        toValues = { opacity: 1, rotate: 0 }
        break
      default:
        fromValues = { opacity: 0 }
        toValues = { opacity: 1 }
    }
  }

  const {
    duration = 1000,
    delay = 0,
    autoStart = true,
    easing = 'ease-out'
  } = config

  const ref = useRef<HTMLDivElement>(null)
  const fromValuesRef = useRef(fromValues)
  const toValuesRef = useRef(toValues)
  const initialBgColor = useRef(fromValues.backgroundColor)

  const [state, setState] = useState<MotionState>({
    transform: '',
    opacity: fromValues.opacity ?? 1,
    backgroundColor: fromValues.backgroundColor,
    isAnimating: false
  })

  // 간단한 이징 함수
  const easingFunction = useCallback((t: number) => {
    switch (easing) {
      case 'ease-in': return t * t
      case 'ease-out': return 1 - (1 - t) * (1 - t)
      case 'ease-in-out': return t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t)
      default: return t
    }
  }, [easing])

  // 값 보간
  const interpolate = useCallback((from: number, to: number, progress: number): number => {
    return from + (to - from) * progress
  }, [])

  // 모션 업데이트
  const updateMotion = useCallback((progress: number) => {
    const easedProgress = easingFunction(progress)
    const from = fromValuesRef.current
    const to = toValuesRef.current

    const newState: MotionState = {
      transform: '',
      opacity: 1,
      backgroundColor: initialBgColor.current,
      isAnimating: true
    }

    // opacity 보간
    if (from.opacity !== undefined && to.opacity !== undefined) {
      newState.opacity = interpolate(from.opacity, to.opacity, easedProgress)
    }

    // transform 보간
    const transforms: string[] = []

    if (from.translateX !== undefined && to.translateX !== undefined) {
      const translateX = interpolate(from.translateX, to.translateX, easedProgress)
      transforms.push(`translateX(${translateX}px)`)
    }

    if (from.translateY !== undefined && to.translateY !== undefined) {
      const translateY = interpolate(from.translateY, to.translateY, easedProgress)
      transforms.push(`translateY(${translateY}px)`)
    }

    if (from.scale !== undefined && to.scale !== undefined) {
      const scaleVal = interpolate(from.scale, to.scale, easedProgress)
      transforms.push(`scale(${scaleVal})`)
    }

    if (from.rotate !== undefined && to.rotate !== undefined) {
      const rotate = interpolate(from.rotate, to.rotate, easedProgress)
      transforms.push(`rotate(${rotate}deg)`)
    }

    if (transforms.length > 0) {
      newState.transform = transforms.join(' ')
    }

    // backgroundColor 보간
    if (from.backgroundColor && to.backgroundColor) {
      newState.backgroundColor = easedProgress > 0.5 ? to.backgroundColor : from.backgroundColor
    }

    setState(newState)
  }, [easingFunction, interpolate])

  const start = useCallback(() => {
    setState(prev => ({ ...prev, isAnimating: true }))
    
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      updateMotion(progress)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setState(prev => ({ ...prev, isAnimating: false }))
      }
    }
    
    setTimeout(() => {
      requestAnimationFrame(animate)
    }, delay)
  }, [duration, delay, updateMotion])

  const reset = useCallback(() => {
    const from = fromValuesRef.current
    setState({
      transform: '',
      opacity: from.opacity ?? 1,
      backgroundColor: from.backgroundColor,
      isAnimating: false
    })
  }, [])

  const stop = useCallback(() => {
    setState(prev => ({ ...prev, isAnimating: false }))
  }, [])

  // autoStart는 마운트 시 한 번만 실행 (start 의존성 제거로 무한 루프 방지)
  useEffect(() => {
    if (autoStart) {
      start()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setRef = (element: HTMLDivElement | null) => {
    if (ref.current !== element) {
      (ref as any).current = element
    }
  }

  // style 객체 생성 (편의용)
  const style: React.CSSProperties = {
    opacity: state.opacity,
    ...(state.transform && { transform: state.transform }),
    ...(state.backgroundColor && { backgroundColor: state.backgroundColor }),
  }

  return {
    ref: setRef,
    style,
    transform: state.transform,
    opacity: state.opacity,
    backgroundColor: state.backgroundColor,
    isAnimating: state.isAnimating,
    start,
    stop,
    reset
  }
} 