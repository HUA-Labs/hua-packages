import { useState, useEffect, useRef, useCallback } from 'react'

export interface AutoFadeConfig {
  initialOpacity?: number // 초기 투명도 (0-1)
  targetOpacity?: number // 목표 투명도 (0-1)
  duration?: number // 모션 지속 시간 (ms)
  delay?: number // 시작 지연 시간 (ms)
  repeat?: boolean // 반복 여부
  repeatDelay?: number // 반복 간 지연 시간 (ms)
  repeatCount?: number // 반복 횟수 (-1 = 무한)
  ease?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' // 이징 함수
  autoStart?: boolean // 자동 시작 여부
  onComplete?: () => void // 완료 콜백
  onRepeat?: (count: number) => void // 반복 콜백
  showOnMount?: boolean
}

interface AutoFadeReturn {
  opacity: number
  isAnimating: boolean
  isVisible: boolean
  mounted: boolean
  start: () => void
  stop: () => void
  reset: () => void
  fadeIn: () => void
  fadeOut: () => void
  toggle: () => void
}

export function useAutoFade(options: AutoFadeConfig = {}): AutoFadeReturn {
  const {
    initialOpacity = 0,
    targetOpacity = 1,
    duration = 1000,
    delay = 0,
    repeat = false,
    repeatDelay = 1000,
    repeatCount = -1,
    ease = 'ease-in-out',
    autoStart = true,
    onComplete,
    onRepeat,
    showOnMount = false
  } = options

  const [opacity, setOpacity] = useState(showOnMount ? initialOpacity : 0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(showOnMount ? initialOpacity > 0 : false)
  const [mounted, setMounted] = useState(false)
  const motionRef = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const repeatCountRef = useRef(0)
  const isFadingInRef = useRef(true)

  // 하이드레이션 이슈 해결을 위한 mounted 상태 관리
  useEffect(() => {
    setMounted(true)
  }, [])

  // 이징 함수
  const getEasing = useCallback((t: number): number => {
    switch (ease) {
      case 'linear':
        return t
      case 'ease-in':
        return t * t
      case 'ease-out':
        return 1 - (1 - t) * (1 - t)
      case 'ease-in-out':
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
      default:
        return t
    }
  }, [ease])

  // 모션 실행 함수
  const animate = useCallback((from: number, to: number, onFinish?: () => void) => {
    if (!mounted) return

    setIsAnimating(true)
    const startTime = performance.now()
    const startOpacity = from

    const updateOpacity = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = getEasing(progress)
      
      const currentOpacity = startOpacity + (to - startOpacity) * easedProgress
      setOpacity(currentOpacity)
      setIsVisible(currentOpacity > 0)

      if (progress < 1) {
        motionRef.current = requestAnimationFrame(updateOpacity)
      } else {
        setIsAnimating(false)
        onFinish?.()
      }
    }

    motionRef.current = requestAnimationFrame(updateOpacity)
  }, [mounted, duration, getEasing])

  // 페이드 인
  const fadeIn = useCallback(() => {
    if (!mounted || isAnimating) return

    animate(initialOpacity, targetOpacity, () => {
      onComplete?.()
      
      if (repeat && (repeatCount === -1 || repeatCountRef.current < repeatCount)) {
        repeatCountRef.current++
        onRepeat?.(repeatCountRef.current)
        
        timeoutRef.current = window.setTimeout(() => {
          fadeOut()
        }, repeatDelay)
      }
    })
  }, [mounted, isAnimating, animate, initialOpacity, targetOpacity, onComplete, repeat, repeatCount, repeatDelay, onRepeat])

  // 페이드 아웃
  const fadeOut = useCallback(() => {
    if (!mounted || isAnimating) return

    animate(targetOpacity, initialOpacity, () => {
      onComplete?.()
      
      if (repeat && (repeatCount === -1 || repeatCountRef.current < repeatCount)) {
        repeatCountRef.current++
        onRepeat?.(repeatCountRef.current)
        
        timeoutRef.current = window.setTimeout(() => {
          fadeIn()
        }, repeatDelay)
      }
    })
  }, [mounted, isAnimating, animate, targetOpacity, initialOpacity, onComplete, repeat, repeatCount, repeatDelay, onRepeat])

  // 시작
  const start = useCallback(() => {
    if (!mounted || isAnimating) return

    if (delay > 0) {
      timeoutRef.current = window.setTimeout(() => {
        fadeIn()
      }, delay)
    } else {
      fadeIn()
    }
  }, [mounted, isAnimating, delay, fadeIn])

  // 정지
  const stop = useCallback(() => {
    if (motionRef.current !== null) {
      cancelAnimationFrame(motionRef.current)
      motionRef.current = null
    }
    
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    setIsAnimating(false)
  }, [])

  // 리셋
  const reset = useCallback(() => {
    stop()
    setOpacity(initialOpacity)
    setIsVisible(initialOpacity > 0)
    repeatCountRef.current = 0
    isFadingInRef.current = true
  }, [stop, initialOpacity])

  // 토글
  const toggle = useCallback(() => {
    if (isFadingInRef.current) {
      fadeOut()
      isFadingInRef.current = false
    } else {
      fadeIn()
      isFadingInRef.current = true
    }
  }, [fadeIn, fadeOut])

  // 자동 시작
  useEffect(() => {
    if (mounted && autoStart) {
      start()
    }
  }, [mounted, autoStart, start])

  // 클린업
  useEffect(() => {
    return () => {
      if (motionRef.current !== null) {
        cancelAnimationFrame(motionRef.current)
      }
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    opacity,
    isAnimating,
    isVisible,
    mounted,
    start,
    stop,
    reset,
    fadeIn,
    fadeOut,
    toggle
  }
}
