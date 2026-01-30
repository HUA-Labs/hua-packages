import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { FadeInOptions, BaseMotionReturn, MotionElement } from '../types'

export function useFadeIn<T extends MotionElement = HTMLDivElement>(
  options: FadeInOptions = {}
): BaseMotionReturn<T> {
  const {
    delay = 0,
    duration = 700,
    threshold = 0.1,
    triggerOnce = true,
    easing = 'ease-out',
    autoStart = true,
    initialOpacity = 0,
    targetOpacity = 1,
    onComplete,
    onStart,
    onStop,
    onReset
  } = options

  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [nodeReady, setNodeReady] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const motionRef = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const startRef = useRef<() => void>(() => {})

  // ref가 DOM에 연결되었는지 polling으로 감지
  useEffect(() => {
    if (nodeReady) return
    if (ref.current) {
      setNodeReady(true)
      return
    }
    const id = setInterval(() => {
      if (ref.current) {
        setNodeReady(true)
        clearInterval(id)
      }
    }, 50)
    return () => clearInterval(id)
  }, [nodeReady])

  // 모션 시작 함수
  const start = useCallback(() => {
    if (isAnimating) return

    setIsAnimating(true)
    setProgress(0)
    onStart?.()

    // 지연 시간 적용
    if (delay > 0) {
      timeoutRef.current = window.setTimeout(() => {
        setIsVisible(true)
        setProgress(1)
        setIsAnimating(false)
        onComplete?.()
      }, delay)
    } else {
      setIsVisible(true)
      setProgress(1)
      setIsAnimating(false)
      onComplete?.()
    }
  }, [delay, isAnimating, onStart, onComplete])

  // startRef 업데이트 (IntersectionObserver에서 안정적인 참조 사용)
  startRef.current = start

  // 모션 중단 함수
  const stop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (motionRef.current) {
      cancelAnimationFrame(motionRef.current)
      motionRef.current = null
    }
    setIsAnimating(false)
    onStop?.()
  }, [onStop])

  // 모션 리셋 함수
  const reset = useCallback(() => {
    stop()
    setIsVisible(false)
    setProgress(0)
    onReset?.()
  }, [stop, onReset])

  // Intersection Observer 설정
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
  }, [autoStart, threshold, triggerOnce, nodeReady])

  // 자동 시작이 비활성화된 경우 수동 시작
  useEffect(() => {
    if (!autoStart) {
      start()
    }
  }, [autoStart, start])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  // 스타일 계산 (React 19 호환) - 메모이제이션으로 불필요한 리렌더링 방지
  const style = useMemo(() => ({
    opacity: isVisible ? targetOpacity : initialOpacity,
    transition: `opacity ${duration}ms ${easing}`,
    '--motion-delay': `${delay}ms`,
    '--motion-duration': `${duration}ms`,
    '--motion-easing': easing,
    '--motion-progress': `${progress}`
  } as const), [isVisible, targetOpacity, initialOpacity, duration, easing, delay, progress])

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