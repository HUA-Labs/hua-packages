import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { ScaleOptions, BaseMotionReturn, MotionElement } from '../types'

export function useScaleIn<T extends MotionElement = HTMLDivElement>(
  options: ScaleOptions = {}
): BaseMotionReturn<T> {
  const {
    initialScale = 0,
    targetScale = 1,
    duration = 700,
    delay = 0,
    autoStart = true,
    easing = 'ease-out',
    threshold = 0.1,
    triggerOnce = true,
    onComplete,
    onStart,
    onStop,
    onReset
  } = options

  const ref = useRef<T>(null)
  const [scale, setScale] = useState(autoStart ? initialScale : targetScale)
  const [opacity, setOpacity] = useState(autoStart ? 0 : 1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(autoStart ? false : true)
  const [progress, setProgress] = useState(autoStart ? 0 : 1)

  const observerRef = useRef<IntersectionObserver | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const startRef = useRef<() => void>(() => {})

  // 모션 시작 함수
  const start = useCallback(() => {
    if (isAnimating) return

    setIsAnimating(true)
    setScale(initialScale)
    setOpacity(0)
    setProgress(0)
    onStart?.()

    // delay 후 스케일 시작
    timeoutRef.current = window.setTimeout(() => {
      setProgress(1)
      setScale(targetScale)
      setOpacity(1)
      setIsVisible(true)
      setIsAnimating(false)
      onComplete?.()
    }, delay)
  }, [delay, initialScale, targetScale, isAnimating, onStart, onComplete])

  // startRef 업데이트 (IntersectionObserver에서 안정적인 참조 사용)
  startRef.current = start

  // 모션 중단 함수
  const stop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsAnimating(false)
    onStop?.()
  }, [onStop])

  // 모션 리셋 함수
  const reset = useCallback(() => {
    stop()
    setScale(initialScale)
    setOpacity(0)
    setProgress(0)
    setIsVisible(false)

    // DOM 요소가 있다면 즉시 스타일 적용
    if (ref.current) {
      const element = ref.current
      element.style.transition = 'none'
      element.style.opacity = '0'
      element.style.transform = `scale(${initialScale})`

      // 다음 프레임에서 transition 복원
      requestAnimationFrame(() => {
        element.style.transition = ''
      })
    }
    onReset?.()
  }, [stop, initialScale, onReset])

  // IntersectionObserver 설정
  useEffect(() => {
    if (!ref.current || !autoStart) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startRef.current()
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
  }, [autoStart, threshold, triggerOnce])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  // 스타일 계산 - 메모이제이션으로 불필요한 리렌더링 방지
  const style = useMemo(() => ({
    transform: `scale(${scale})`,
    opacity,
    transition: `all ${duration}ms ${easing}`,
    '--motion-delay': `${delay}ms`,
    '--motion-duration': `${duration}ms`,
    '--motion-easing': easing,
    '--motion-progress': `${progress}`
  } as const), [scale, opacity, duration, easing, delay, progress])

  return {
    ref,
    isVisible,
    isAnimating,
    style,
    progress,
    start,
    reset,
    stop
  }
}
