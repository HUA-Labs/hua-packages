import { useState, useEffect, useRef, useCallback } from 'react'

export interface AutoScaleConfig {
  initialScale?: number // 초기 스케일 (0-2)
  targetScale?: number // 목표 스케일 (0-2)
  duration?: number // 모션 지속 시간 (ms)
  delay?: number // 시작 지연 시간 (ms)
  repeat?: boolean // 반복 여부
  repeatDelay?: number // 반복 간 지연 시간 (ms)
  repeatCount?: number // 반복 횟수 (-1 = 무한)
  ease?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce' | 'elastic' // 이징 함수
  autoStart?: boolean // 자동 시작 여부
  onComplete?: () => void // 완료 콜백
  onRepeat?: (count: number) => void // 반복 콜백
  showOnMount?: boolean
  centerTransform?: boolean // transform-origin을 center로 설정할지 여부
}

interface AutoScaleReturn {
  scale: number
  isAnimating: boolean
  isVisible: boolean
  mounted: boolean
  start: () => void
  stop: () => void
  reset: () => void
  scaleIn: () => void
  scaleOut: () => void
  toggle: () => void
}

export function useAutoScale(options: AutoScaleConfig = {}): AutoScaleReturn {
  const {
    initialScale = 0,
    targetScale = 1,
    duration = 1000,
    delay = 0,
    repeat = false,
    repeatDelay = 1000,
    repeatCount = -1,
    ease = 'ease-in-out',
    autoStart = true,
    onComplete,
    onRepeat,
    showOnMount = false,
    centerTransform: _centerTransform = true
  } = options

  const [scale, setScale] = useState(showOnMount ? initialScale : 0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(showOnMount ? initialScale > 0 : false)
  const [mounted, setMounted] = useState(false)
  const motionRef = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const repeatCountRef = useRef(0)
  const isScalingInRef = useRef(true)

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
      case 'bounce':
        if (t < 1 / 2.75) {
          return 7.5625 * t * t
        } else if (t < 2 / 2.75) {
          return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
        } else if (t < 2.5 / 2.75) {
          return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
        } else {
          return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
        }
      case 'elastic':
        if (t === 0) return 0
        if (t === 1) return 1
        return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1
      default:
        return t
    }
  }, [ease])

  // 모션 실행 함수
  const animate = useCallback((from: number, to: number, onFinish?: () => void) => {
    if (!mounted) return

    setIsAnimating(true)
    const startTime = performance.now()
    const startScale = from

    const updateScale = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = getEasing(progress)
      
      const currentScale = startScale + (to - startScale) * easedProgress
      setScale(currentScale)
      setIsVisible(currentScale > 0)

      if (progress < 1) {
        motionRef.current = requestAnimationFrame(updateScale)
      } else {
        setIsAnimating(false)
        onFinish?.()
      }
    }

    motionRef.current = requestAnimationFrame(updateScale)
  }, [mounted, duration, getEasing])

  // 스케일 인
  const scaleIn = useCallback(() => {
    if (!mounted || isAnimating) return

    animate(initialScale, targetScale, () => {
      onComplete?.()
      
      if (repeat && (repeatCount === -1 || repeatCountRef.current < repeatCount)) {
        repeatCountRef.current++
        onRepeat?.(repeatCountRef.current)
        
        timeoutRef.current = window.setTimeout(() => {
          scaleOut()
        }, repeatDelay)
      }
    })
  }, [mounted, isAnimating, animate, initialScale, targetScale, onComplete, repeat, repeatCount, repeatDelay, onRepeat])

  // 스케일 아웃
  const scaleOut = useCallback(() => {
    if (!mounted || isAnimating) return

    animate(targetScale, initialScale, () => {
      onComplete?.()
      
      if (repeat && (repeatCount === -1 || repeatCountRef.current < repeatCount)) {
        repeatCountRef.current++
        onRepeat?.(repeatCountRef.current)
        
        timeoutRef.current = window.setTimeout(() => {
          scaleIn()
        }, repeatDelay)
      }
    })
  }, [mounted, isAnimating, animate, targetScale, initialScale, onComplete, repeat, repeatCount, repeatDelay, onRepeat])

  // 시작
  const start = useCallback(() => {
    if (!mounted || isAnimating) return

    if (delay > 0) {
      timeoutRef.current = window.setTimeout(() => {
        scaleIn()
      }, delay)
    } else {
      scaleIn()
    }
  }, [mounted, isAnimating, delay, scaleIn])

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
    setScale(initialScale)
    setIsVisible(initialScale > 0)
    repeatCountRef.current = 0
    isScalingInRef.current = true
  }, [stop, initialScale])

  // 토글
  const toggle = useCallback(() => {
    if (isScalingInRef.current) {
      scaleOut()
      isScalingInRef.current = false
    } else {
      scaleIn()
      isScalingInRef.current = true
    }
  }, [scaleIn, scaleOut])

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
    scale,
    isAnimating,
    isVisible,
    mounted,
    start,
    stop,
    reset,
    scaleIn,
    scaleOut,
    toggle
  }
}
