import { useRef, useState, useEffect, useCallback } from 'react'

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
  const [state, setState] = useState<MotionState>({
    transform: '',
    opacity: fromValues.opacity ?? 1,
    backgroundColor: fromValues.backgroundColor,
    isAnimating: false
  })

  // 간단한 이징 함수
  const easingFunction = (t: number) => {
    switch (easing) {
      case 'ease-in': return t * t
      case 'ease-out': return 1 - (1 - t) * (1 - t)
      case 'ease-in-out': return t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t)
      default: return t
    }
  }

  // 값 보간
  const interpolate = useCallback((from: number, to: number, progress: number): number => {
    return from + (to - from) * progress
  }, [])

  // 모션 업데이트
  const updateMotion = useCallback((progress: number) => {
    const easedProgress = easingFunction(progress)
    
    const newState: MotionState = {
      transform: '',
      opacity: 1,
      backgroundColor: state.backgroundColor,
      isAnimating: true
    }

    // opacity 보간
    if (fromValues.opacity !== undefined && toValues.opacity !== undefined) {
      newState.opacity = interpolate(fromValues.opacity, toValues.opacity, easedProgress)
    }

    // transform 보간
    const transforms: string[] = []
    
    if (fromValues.translateX !== undefined && toValues.translateX !== undefined) {
      const translateX = interpolate(fromValues.translateX, toValues.translateX, easedProgress)
      transforms.push(`translateX(${translateX}px)`)
    }
    
    if (fromValues.translateY !== undefined && toValues.translateY !== undefined) {
      const translateY = interpolate(fromValues.translateY, toValues.translateY, easedProgress)
      transforms.push(`translateY(${translateY}px)`)
    }
    
    if (fromValues.scale !== undefined && toValues.scale !== undefined) {
      const scale = interpolate(fromValues.scale, toValues.scale, easedProgress)
      transforms.push(`scale(${scale})`)
    }
    
    if (fromValues.rotate !== undefined && toValues.rotate !== undefined) {
      const rotate = interpolate(fromValues.rotate, toValues.rotate, easedProgress)
      transforms.push(`rotate(${rotate}deg)`)
    }

    if (transforms.length > 0) {
      newState.transform = transforms.join(' ')
    }

    // backgroundColor 보간
    if (fromValues.backgroundColor && toValues.backgroundColor) {
      newState.backgroundColor = easedProgress > 0.5 ? toValues.backgroundColor : fromValues.backgroundColor
    }

    setState(newState)
  }, [fromValues, toValues, easingFunction, interpolate, state.backgroundColor])

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
    setState({
      transform: '',
      opacity: fromValues.opacity ?? 1,
      backgroundColor: fromValues.backgroundColor,
      isAnimating: false
    })
  }, [fromValues])

  const stop = useCallback(() => {
    setState(prev => ({ ...prev, isAnimating: false }))
  }, [])

  useEffect(() => {
    if (autoStart) {
      start()
    }
  }, [autoStart, start])

  const setRef = (element: HTMLDivElement | null) => {
    if (ref.current !== element) {
      (ref as any).current = element
    }
  }

  return {
    ref: setRef,
    transform: state.transform,
    opacity: state.opacity,
    backgroundColor: state.backgroundColor,
    isAnimating: state.isAnimating,
    start,
    stop,
    reset
  }
} 