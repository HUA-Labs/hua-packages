import { useRef, useState, useEffect, useCallback } from 'react'
import { BaseMotionOptions, BaseMotionReturn, MotionElement } from '../types'

export interface SlideDownOptions extends BaseMotionOptions {
  // 슬라이드 거리
  distance?: number
  
  // 초기 위치
  initialY?: number
  
  // 최종 위치
  finalY?: number
  
  // 슬라이드 방향
  direction?: 'down' | 'up'
  
  // 오버슈트 효과
  overshoot?: boolean
  overshootAmount?: number
  
  // 바운스 효과
  bounce?: boolean
  bounceStiffness?: number
  
  // 스테거 효과
  stagger?: boolean
  staggerDelay?: number
  
  // 자동 시작
  autoStart?: boolean
}

export function useSlideDown<T extends MotionElement = HTMLDivElement>(
  options: SlideDownOptions = {}
): BaseMotionReturn<T> & {
  slideDistance: number
  currentY: number
  slideDirection: string
  hasOvershoot: boolean
  hasBounce: boolean
  slideDown: () => void
  slideUp: () => void
  slideTo: (targetY: number) => void
} {
  const {
    duration = 800,
    easing = 'ease-out',
    delay = 0,
    threshold = 0.1,
    triggerOnce = true,
    autoStart = false,
    distance = 100,
    initialY = -100,
    finalY = 0,
    direction = 'down',
    overshoot = false,
    overshootAmount = 20,
    bounce = false,
    bounceStiffness = 0.3,
    stagger = false,
    staggerDelay = 100,
    onComplete, onStart, onStop, onReset
  } = options

  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentY, setCurrentY] = useState(initialY)
  const [slideDirection] = useState(direction)
  const [hasOvershoot] = useState(overshoot)
  const [hasBounce] = useState(bounce)
  
  const observerRef = useRef<IntersectionObserver | null>(null)
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)

  // 슬라이드 다운 함수
  const slideDown = useCallback(() => {
    if (isAnimating) return

    setIsAnimating(true)
    setProgress(0)
    startTimeRef.current = Date.now()
    onStart?.()

    const animate = () => {
      if (!isAnimating) return

      const elapsed = Date.now() - startTimeRef.current
      const currentProgress = Math.min(elapsed / duration, 1)
      
      let easedProgress = currentProgress
      
      // 이징 적용
      if (easing === 'ease-out') {
        easedProgress = 1 - Math.pow(1 - currentProgress, 3)
      } else if (easing === 'ease-in') {
        easedProgress = Math.pow(currentProgress, 3)
      } else if (easing === 'ease-in-out') {
        easedProgress = currentProgress < 0.5 
          ? 4 * currentProgress * currentProgress * currentProgress
          : 1 - Math.pow(-2 * currentProgress + 2, 3) / 2
      }

      setProgress(easedProgress)

      // Y 위치 계산
      let targetY = initialY + (finalY - initialY) * easedProgress
      
      // 오버슈트 효과
      if (overshoot && easedProgress > 0.8) {
        const overshootProgress = (easedProgress - 0.8) / 0.2
        const overshootY = overshootAmount * Math.sin(overshootProgress * Math.PI)
        targetY += overshootY
      }
      
      // 바운스 효과
      if (bounce && easedProgress > 0.9) {
        const bounceProgress = (easedProgress - 0.9) / 0.1
        const bounceY = overshootAmount * 0.5 * Math.sin(bounceProgress * Math.PI * 2) * Math.exp(-bounceProgress * bounceStiffness)
        targetY += bounceY
      }

      setCurrentY(targetY)

      if (currentProgress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
        setCurrentY(finalY)
        onComplete?.()
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [isAnimating, duration, easing, initialY, finalY, overshoot, overshootAmount, bounce, bounceStiffness, onStart, onComplete])

  // 슬라이드 업 함수
  const slideUp = useCallback(() => {
    if (isAnimating) return

    setIsAnimating(true)
    setProgress(0)
    startTimeRef.current = Date.now()
    onStart?.()

    const animate = () => {
      if (!isAnimating) return

      const elapsed = Date.now() - startTimeRef.current
      const currentProgress = Math.min(elapsed / duration, 1)
      
      let easedProgress = currentProgress
      
      // 이징 적용
      if (easing === 'ease-out') {
        easedProgress = 1 - Math.pow(1 - currentProgress, 3)
      } else if (easing === 'ease-in') {
        easedProgress = Math.pow(currentProgress, 3)
      } else if (easing === 'ease-in-out') {
        easedProgress = currentProgress < 0.5 
          ? 4 * currentProgress * currentProgress * currentProgress
          : 1 - Math.pow(-2 * currentProgress + 2, 3) / 2
      }

      setProgress(easedProgress)

      // Y 위치 계산 (역방향)
      const targetY = finalY + (initialY - finalY) * easedProgress
      setCurrentY(targetY)

      if (currentProgress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
        setCurrentY(initialY)
        onComplete?.()
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [isAnimating, duration, easing, initialY, finalY, onStart, onComplete])

  // 특정 위치로 슬라이드 함수
  const slideTo = useCallback((targetY: number) => {
    if (isAnimating) return

    setIsAnimating(true)
    setProgress(0)
    startTimeRef.current = Date.now()
    onStart?.()

    const startY = currentY
    const distance = Math.abs(targetY - startY)
    const direction = targetY > startY ? 1 : -1

    const animate = () => {
      if (!isAnimating) return

      const elapsed = Date.now() - startTimeRef.current
      const currentProgress = Math.min(elapsed / duration, 1)
      
      let easedProgress = currentProgress
      
      // 이징 적용
      if (easing === 'ease-out') {
        easedProgress = 1 - Math.pow(1 - currentProgress, 3)
      } else if (easing === 'ease-in') {
        easedProgress = Math.pow(currentProgress, 3)
      } else if (easing === 'ease-in-out') {
        easedProgress = currentProgress < 0.5 
          ? 4 * currentProgress * currentProgress * currentProgress
          : 1 - Math.pow(-2 * currentProgress + 2, 3) / 2
      }

      setProgress(easedProgress)

      // Y 위치 계산
      const targetY = startY + (distance * direction * easedProgress)
      setCurrentY(targetY)

      if (currentProgress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
        setCurrentY(targetY)
        onComplete?.()
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [isAnimating, duration, easing, currentY, onStart, onComplete])

  // 모션 시작 함수
  const start = useCallback(() => {
    if (!isVisible) {
      setIsVisible(true)
      if (direction === 'down') {
        slideDown()
      } else {
        slideUp()
      }
    }
  }, [isVisible, direction, slideDown, slideUp])

  // 모션 중단 함수
  const stop = useCallback(() => {
    setIsAnimating(false)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    onStop?.()
  }, [onStop])

  // 모션 리셋 함수
  const reset = useCallback(() => {
    setIsVisible(false)
    setIsAnimating(false)
    setProgress(0)
    setCurrentY(initialY)
    startTimeRef.current = 0
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    onReset?.()
  }, [initialY, onReset])

  // 모션 일시정지 함수
  const pause = useCallback(() => {
    setIsAnimating(false)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }, [])

  // 모션 재개 함수
  const resume = useCallback(() => {
    if (isVisible && !isAnimating) {
      setIsAnimating(true)
      if (direction === 'down') {
        slideDown()
      } else {
        slideUp()
      }
    }
  }, [isVisible, isAnimating, direction, slideDown, slideUp])

  // Intersection Observer 설정
  useEffect(() => {
    if (!ref.current || !autoStart) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            start()
            if (triggerOnce) {
              observerRef.current?.disconnect()
            }
          }
        })
      },
      { threshold }
    )

    observerRef.current.observe(ref.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [autoStart, threshold, triggerOnce, start])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // 슬라이드 스타일 계산
  const style: React.CSSProperties = {
    transform: `translateY(${currentY}px)`,
    transition: stagger ? `transform ${duration}ms ${easing} ${delay}ms` : `transform ${duration}ms ${easing}`,
    willChange: 'transform'
  }

  return {
    ref,
    isVisible,
    isAnimating,
    style,
    progress,
    start,
    stop,
    reset,
    pause,
    resume,
    slideDistance: distance,
    currentY,
    slideDirection,
    hasOvershoot: overshoot,
    hasBounce: bounce,
    slideDown,
    slideUp,
    slideTo
  }
}
