import { useRef, useState, useEffect, useCallback } from 'react'
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
  const [isVisible, setIsVisible] = useState(autoStart ? false : true)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'starting' | 'animating' | 'complete'>('idle')

  // 모션 시작 함수
  const start = useCallback(() => {
    if (!ref.current || isAnimating) return

    setIsAnimating(true)
    setAnimationPhase('starting')
    onStart?.()

    // 지연 시간 적용
    if (delay > 0) {
      setTimeout(() => {
        // 먼저 transition 활성화
        setAnimationPhase('animating')
        // 충분한 지연 후 opacity 변경하여 transition 효과 보장
        setTimeout(() => {
          setIsVisible(true)
        }, 16) // 1프레임(16ms) 대기
      }, delay)
    } else {
      // 먼저 transition 활성화
      setAnimationPhase('animating')
      // 충분한 지연 후 opacity 변경하여 transition 효과 보장
      setTimeout(() => {
        setIsVisible(true)
      }, 16) // 1프레임(16ms) 대기
    }
    
    // 애니메이션 완료 후 상태 정리
    setTimeout(() => {
      setAnimationPhase('complete')
      setIsAnimating(false)
      onComplete?.()
    }, delay + duration + 16) // 추가 지연 시간 포함
  }, [delay, duration, isAnimating, onStart, onComplete])

  // 모션 중단 함수
  const stop = useCallback(() => {
    setIsAnimating(false)
    setAnimationPhase('idle')
    onStop?.()
  }, [onStop])

  // 모션 리셋 함수
  const reset = useCallback(() => {
    // DOM 직접 조작 제거, React state만 사용
    setIsVisible(false)
    setIsAnimating(false)
    setAnimationPhase('idle')
    onReset?.()
  }, [onReset])

  // Intersection Observer 설정
  useEffect(() => {
    if (!ref.current || !autoStart) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            start()
            if (triggerOnce) {
              observer.disconnect()
            }
          }
        })
      },
      { threshold }
    )

    observer.observe(ref.current)

    return () => {
      observer.disconnect()
    }
  }, [autoStart, threshold, triggerOnce, start])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  // 스타일 계산 - CSS transition + React state 조합
  const style = {
    opacity: isVisible ? targetOpacity : initialOpacity,
    transition: animationPhase === 'animating' ? `opacity ${duration}ms ${easing}` : 'none',
    '--motion-delay': `${delay}ms`,
    '--motion-duration': `${duration}ms`,
    '--motion-easing': easing,
    '--motion-phase': animationPhase
  } as const

  return {
    ref,
    isVisible,
    isAnimating,
    style,
    start,
    stop,
    reset
  }
} 