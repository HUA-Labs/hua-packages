import { useState, useEffect, useRef, useCallback } from 'react'

type SlideDirection = 'left' | 'right' | 'up' | 'down' | 'left-up' | 'left-down' | 'right-up' | 'right-down'

export interface AutoSlideConfig {
  direction?: SlideDirection // 슬라이드 방향
  distance?: number // 슬라이드 거리 (px)
  initialPosition?: { x: number; y: number } // 초기 위치
  targetPosition?: { x: number; y: number } // 목표 위치
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

interface AutoSlideReturn {
  position: { x: number; y: number }
  isAnimating: boolean
  isVisible: boolean
  mounted: boolean
  start: () => void
  stop: () => void
  reset: () => void
  slideIn: () => void
  slideOut: () => void
  toggle: () => void
}

export function useAutoSlide(options: AutoSlideConfig = {}): AutoSlideReturn {
  const {
    direction = 'left',
    distance = 100,
    initialPosition,
    targetPosition,
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

  // 방향에 따른 기본 위치 계산
  const getDefaultPositions = useCallback(() => {
    const defaultInitial = { x: 0, y: 0 }
    const defaultTarget = { x: 0, y: 0 }

    switch (direction) {
      case 'left':
        defaultInitial.x = distance
        defaultTarget.x = 0
        break
      case 'right':
        defaultInitial.x = -distance
        defaultTarget.x = 0
        break
      case 'up':
        defaultInitial.y = distance
        defaultTarget.y = 0
        break
      case 'down':
        defaultInitial.y = -distance
        defaultTarget.y = 0
        break
      case 'left-up':
        defaultInitial.x = distance
        defaultInitial.y = distance
        defaultTarget.x = 0
        defaultTarget.y = 0
        break
      case 'left-down':
        defaultInitial.x = distance
        defaultInitial.y = -distance
        defaultTarget.x = 0
        defaultTarget.y = 0
        break
      case 'right-up':
        defaultInitial.x = -distance
        defaultInitial.y = distance
        defaultTarget.x = 0
        defaultTarget.y = 0
        break
      case 'right-down':
        defaultInitial.x = -distance
        defaultInitial.y = -distance
        defaultTarget.x = 0
        defaultTarget.y = 0
        break
    }

    return {
      initial: initialPosition || defaultInitial,
      target: targetPosition || defaultTarget
    }
  }, [direction, distance, initialPosition, targetPosition])

  const positions = getDefaultPositions()
  const [position, setPosition] = useState(showOnMount ? positions.initial : positions.target)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(showOnMount ? true : false)
  const [mounted, setMounted] = useState(false)
  const motionRef = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const repeatCountRef = useRef(0)
  const isSlidingInRef = useRef(true)

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
  const animate = useCallback((from: { x: number; y: number }, to: { x: number; y: number }, onFinish?: () => void) => {
    if (!mounted) return

    setIsAnimating(true)
    const startTime = performance.now()
    const startPosition = from

    const updatePosition = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = getEasing(progress)
      
      const currentX = startPosition.x + (to.x - startPosition.x) * easedProgress
      const currentY = startPosition.y + (to.y - startPosition.y) * easedProgress
      
      setPosition({ x: currentX, y: currentY })
      setIsVisible(true)

      if (progress < 1) {
        motionRef.current = requestAnimationFrame(updatePosition)
      } else {
        setIsAnimating(false)
        onFinish?.()
      }
    }

    motionRef.current = requestAnimationFrame(updatePosition)
  }, [mounted, duration, getEasing])

  // 슬라이드 인
  const slideIn = useCallback(() => {
    if (!mounted || isAnimating) return

    animate(positions.initial, positions.target, () => {
      onComplete?.()
      
      if (repeat && (repeatCount === -1 || repeatCountRef.current < repeatCount)) {
        repeatCountRef.current++
        onRepeat?.(repeatCountRef.current)
        
        timeoutRef.current = window.setTimeout(() => {
          slideOut()
        }, repeatDelay)
      }
    })
  }, [mounted, isAnimating, animate, positions.initial, positions.target, onComplete, repeat, repeatCount, repeatDelay, onRepeat])

  // 슬라이드 아웃
  const slideOut = useCallback(() => {
    if (!mounted || isAnimating) return

    animate(positions.target, positions.initial, () => {
      onComplete?.()
      
      if (repeat && (repeatCount === -1 || repeatCountRef.current < repeatCount)) {
        repeatCountRef.current++
        onRepeat?.(repeatCountRef.current)
        
        timeoutRef.current = window.setTimeout(() => {
          slideIn()
        }, repeatDelay)
      }
    })
  }, [mounted, isAnimating, animate, positions.target, positions.initial, onComplete, repeat, repeatCount, repeatDelay, onRepeat])

  // 시작
  const start = useCallback(() => {
    if (!mounted || isAnimating) return

    if (delay > 0) {
      timeoutRef.current = window.setTimeout(() => {
        slideIn()
      }, delay)
    } else {
      slideIn()
    }
  }, [mounted, isAnimating, delay, slideIn])

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
    setPosition(positions.initial)
    setIsVisible(showOnMount ? true : false)
    repeatCountRef.current = 0
    isSlidingInRef.current = true
  }, [stop, positions.initial, showOnMount])

  // 토글
  const toggle = useCallback(() => {
    if (isSlidingInRef.current) {
      slideOut()
      isSlidingInRef.current = false
    } else {
      slideIn()
      isSlidingInRef.current = true
    }
  }, [slideIn, slideOut])

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
    position,
    isAnimating,
    isVisible,
    mounted,
    start,
    stop,
    reset,
    slideIn,
    slideOut,
    toggle
  }
}
