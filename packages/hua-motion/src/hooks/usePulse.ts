import { useRef, useEffect, useCallback, useState } from 'react'
import { getEasing } from '../utils/easing'

// 💫 진짜 간단한 펄스 훅!
export function usePulse(config: {
  duration?: number
  intensity?: number
  repeat?: number
  yoyo?: boolean
  autoStart?: boolean
} = {}) {
  const elementRef = useRef<HTMLElement | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const animationRef = useRef<number | null>(null)

  const {
    duration = 3000,
    intensity = 1,
    repeat = Infinity,
    yoyo = true
  } = config

  // 🚀 애니메이션 시작
  const start = useCallback(() => {
    if (!elementRef.current) return

    const element = elementRef.current
    let repeatCount = 0

    setIsAnimating(true)

    const animate = (startTime: number) => {
      const updateAnimation = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easedProgress = getEasing('easeInOut')(progress)

        // Yoyo 효과
        const finalProgress = yoyo && repeatCount % 2 === 1 ? 1 - easedProgress : easedProgress

        // 펄스 효과 (투명도 변화)
        const opacity = 0.3 + (0.7 * finalProgress * intensity)
        element.style.opacity = opacity.toString()

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(updateAnimation)
        } else {
          repeatCount++
          if (repeat === Infinity || repeatCount < repeat) {
            // 다음 반복 시작
            animationRef.current = requestAnimationFrame(() => animate(performance.now()))
          } else {
            setIsAnimating(false)
          }
        }
      }

      animationRef.current = requestAnimationFrame(updateAnimation)
    }

    animate(performance.now())
  }, [duration, intensity, repeat, yoyo])

  // 🛑 애니메이션 정지
  const stop = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    setIsAnimating(false)
  }, [])

  // 🔄 애니메이션 리셋
  const reset = useCallback(() => {
    // 애니메이션 중단
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    
    // 상태 초기화
    setIsAnimating(false)
    
    // DOM 요소 초기 상태로 복원
    if (elementRef.current) {
      const element = elementRef.current
      // opacity를 1로 설정하고 transition 제거하여 즉시 적용
      element.style.transition = 'none'
      element.style.opacity = '1'
      
      // 다음 프레임에서 transition 복원
      requestAnimationFrame(() => {
        element.style.transition = ''
      })
    }
  }, [])

  // 🔗 ref 설정
  const setRef = useCallback((element: HTMLElement | null) => {
    elementRef.current = element
  }, [])

  // 🎯 자동 시작 (autoStart가 true일 때만)
  useEffect(() => {
    if (elementRef.current && config.autoStart !== false) {
      start()
    }
  }, [start, config.autoStart])

  // 🧹 정리
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return {
    ref: setRef,
    start,
    stop,
    reset,
    isAnimating
  }
} 