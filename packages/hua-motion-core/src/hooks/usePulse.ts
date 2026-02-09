import { useRef, useEffect, useCallback, useState, useMemo } from 'react'
import { PulseOptions, BaseMotionReturn, MotionElement } from '../types'
import { getEasing } from '../utils/easing'

export function usePulse<T extends MotionElement = HTMLDivElement>(
  options: PulseOptions = {}
): BaseMotionReturn<T> {
  const {
    duration = 3000,
    intensity = 1,
    repeatCount = Infinity,
    repeatDelay = 0,
    autoStart = false
  } = options

  const ref = useRef<T>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(0)
  const motionRef = useRef<number | null>(null)

  // 이징 함수 메모이제이션 (애니메이션 루프 내 반복 호출 방지)
  const easingFn = useMemo(() => getEasing('easeInOut'), [])

  // 모션 시작
  const start = useCallback(() => {
    if (!ref.current) return

    const element = ref.current
    let currentRepeat = 0

    setIsAnimating(true)

    const animate = (startTime: number) => {
      const updateMotion = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const rawProgress = Math.min(elapsed / duration, 1)
        const easedProgress = easingFn(rawProgress)

        // Yoyo 효과 (repeatDelay > 0이면 대기 후 역방향)
        const finalProgress = currentRepeat % 2 === 1 ? 1 - easedProgress : easedProgress

        // 펄스 효과 (투명도 변화)
        const opacity = 0.3 + (0.7 * finalProgress * intensity)
        element.style.opacity = opacity.toString()
        setProgress(rawProgress)

        if (rawProgress < 1) {
          motionRef.current = requestAnimationFrame(updateMotion)
        } else {
          currentRepeat++
          if (repeatCount === Infinity || currentRepeat < repeatCount * 2) {
            // repeatDelay 적용
            if (repeatDelay > 0) {
              const delayTimeout = window.setTimeout(() => {
                motionRef.current = requestAnimationFrame(() => animate(performance.now()))
              }, repeatDelay)
              // 타임아웃 ID를 motionRef에 저장하지 않음 (별도 관리 불필요, 언마운트 시 rAF 취소로 충분)
              motionRef.current = delayTimeout as unknown as number
            } else {
              motionRef.current = requestAnimationFrame(() => animate(performance.now()))
            }
          } else {
            setIsAnimating(false)
          }
        }
      }

      motionRef.current = requestAnimationFrame(updateMotion)
    }

    animate(performance.now())
  }, [duration, intensity, repeatCount, repeatDelay, easingFn])

  // 모션 정지
  const stop = useCallback(() => {
    if (motionRef.current) {
      cancelAnimationFrame(motionRef.current)
      clearTimeout(motionRef.current)
      motionRef.current = null
    }
    setIsAnimating(false)
  }, [])

  // 모션 리셋
  const reset = useCallback(() => {
    if (motionRef.current) {
      cancelAnimationFrame(motionRef.current)
      clearTimeout(motionRef.current)
      motionRef.current = null
    }

    setIsAnimating(false)
    setProgress(0)

    if (ref.current) {
      const element = ref.current
      element.style.transition = 'none'
      element.style.opacity = '1'

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
        clearTimeout(motionRef.current)
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
