import { useRef, useEffect, useCallback, useState, useMemo } from 'react'
import { BaseMotionReturn, MotionElement } from '../types'
import { getEasing } from '../utils/easing'

export interface PulseOptions {
  duration?: number
  intensity?: number
  repeat?: number
  yoyo?: boolean
  autoStart?: boolean
}

// 💫 진짜 간단한 펄스 훅!
export function usePulse<T extends MotionElement = HTMLDivElement>(
  options: PulseOptions = {}
): BaseMotionReturn<T> {
  const {
    duration = 3000,
    intensity = 1,
    repeat = Infinity,
    yoyo = true,
    autoStart = false
  } = options

  const ref = useRef<T>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(0)
  const motionRef = useRef<number | null>(null)
  
  // 이징 함수 메모이제이션 (애니메이션 루프 내 반복 호출 방지)
  const easingFn = useMemo(() => getEasing('easeInOut'), [])

  // 🚀 모션 시작
  const start = useCallback(() => {
    if (!ref.current) return

    const element = ref.current
    let repeatCount = 0

    setIsAnimating(true)

    const animate = (startTime: number) => {
      const updateMotion = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easedProgress = easingFn(progress)

        // Yoyo 효과
        const finalProgress = yoyo && repeatCount % 2 === 1 ? 1 - easedProgress : easedProgress

        // 펄스 효과 (투명도 변화)
        const opacity = 0.3 + (0.7 * finalProgress * intensity)
        element.style.opacity = opacity.toString()
        setProgress(progress)

        if (progress < 1) {
          motionRef.current = requestAnimationFrame(updateMotion)
        } else {
          repeatCount++
          if (repeat === Infinity || repeatCount < repeat) {
            // 다음 반복 시작
            motionRef.current = requestAnimationFrame(() => animate(performance.now()))
          } else {
            setIsAnimating(false)
          }
        }
      }

      motionRef.current = requestAnimationFrame(updateMotion)
    }

    animate(performance.now())
  }, [duration, intensity, repeat, yoyo, easingFn])

  // 🛑 모션 정지
  const stop = useCallback(() => {
    if (motionRef.current) {
      cancelAnimationFrame(motionRef.current)
      motionRef.current = null
    }
    setIsAnimating(false)
  }, [])

  // 🔄 모션 리셋
  const reset = useCallback(() => {
    // 모션 중단
    if (motionRef.current) {
      cancelAnimationFrame(motionRef.current)
      motionRef.current = null
    }
    
    // 상태 초기화
    setIsAnimating(false)
    
    // DOM 요소 초기 상태로 복원
    if (ref.current) {
      const element = ref.current
      // opacity를 1로 설정하고 transition 제거하여 즉시 적용
      element.style.transition = 'none'
      element.style.opacity = '1'
      
      // 다음 프레임에서 transition 복원
      requestAnimationFrame(() => {
        element.style.transition = ''
      })
    }
  }, [])

  // 자동 시작
  useEffect(() => {
    if (autoStart) {
      start()
    }
  }, [autoStart, start])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (motionRef.current) {
        cancelAnimationFrame(motionRef.current)
      }
    }
  }, [])

  // 스타일 계산
  const style = useMemo(() => ({
    opacity: isAnimating ? 0.3 + (0.7 * progress * intensity) : 1,
    transition: isAnimating ? 'none' : 'opacity 0.3s ease-in-out'
  }), [isAnimating, progress, intensity])

  return {
    ref,
    isVisible,
    isAnimating,
    style,
    progress,
    start,
    stop,
    reset
  }
} 