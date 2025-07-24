import { useRef, useEffect, useCallback, useState } from 'react'

// 💀 스켈레톤 로딩 애니메이션 훅!
export function useSkeleton(config: {
  duration?: number
  repeat?: number
  gradient?: string
} = {}) {
  const elementRef = useRef<HTMLElement | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const animationRef = useRef<number | null>(null)

  const {
    duration = 2000,
    repeat = Infinity,
    gradient = 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)'
  } = config

  // 🚀 스켈레톤 애니메이션 시작
  const start = useCallback(() => {
    if (!elementRef.current) return

    const element = elementRef.current
    let repeatCount = 0

    setIsAnimating(true)

    const animate = (startTime: number) => {
      const updateAnimation = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        // 그라데이션 위치 계산
        const gradientPosition = progress * 200 - 100 // -100% ~ 100%

        // 스켈레톤 그라데이션 적용
        element.style.background = `${gradient}, #f0f0f0`
        element.style.backgroundSize = '200% 100%'
        element.style.backgroundPosition = `${gradientPosition}% 0`

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
  }, [duration, repeat, gradient])

  // 🛑 애니메이션 정지
  const stop = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    setIsAnimating(false)
  }, [])

  // 🔗 ref 설정
  const setRef = useCallback((element: HTMLElement | null) => {
    elementRef.current = element
  }, [])

  // 🎯 자동 시작
  useEffect(() => {
    if (elementRef.current) {
      start()
    }
  }, [start])

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
    isAnimating
  }
} 