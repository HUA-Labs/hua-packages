import { useRef, useState, useEffect, useCallback } from 'react'
import { BaseMotionOptions, BaseMotionReturn, MotionElement } from '../types'

export interface ScrollToggleOptions extends BaseMotionOptions {
  showScale?: number
  showOpacity?: number
  showRotate?: number
  showTranslateY?: number
  showTranslateX?: number
  hideScale?: number
  hideOpacity?: number
  hideRotate?: number
  hideTranslateY?: number
  hideTranslateX?: number
  scrollThreshold?: number
  scrollDirection?: 'up' | 'down' | 'both'
}

export function useScrollToggle<T extends MotionElement = HTMLDivElement>(
  options: ScrollToggleOptions = {}
): BaseMotionReturn<T> {
  const {
    duration = 300,
    easing = 'ease-out',
    showScale = 1,
    showOpacity = 1,
    showRotate = 0,
    showTranslateY = 0,
    showTranslateX = 0,
    hideScale = 0.8,
    hideOpacity = 0,
    hideRotate = 0,
    hideTranslateY = 20,
    hideTranslateX = 0,
    scrollThreshold = 0.1,
    scrollDirection = 'both',
    onComplete, onStart, onStop, onReset
  } = options

  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [lastScrollY, setLastScrollY] = useState(0)

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(() => {
    if (!ref.current) return

    const currentScrollY = window.scrollY
    const rect = ref.current.getBoundingClientRect()
    const threshold = window.innerHeight * scrollThreshold

    // 스크롤 방향 확인
    const isScrollingDown = currentScrollY > lastScrollY
    const isScrollingUp = currentScrollY < lastScrollY

    let shouldToggle = false

    if (scrollDirection === 'both') {
      shouldToggle = rect.top <= threshold
    } else if (scrollDirection === 'down' && isScrollingDown) {
      shouldToggle = rect.top <= threshold
    } else if (scrollDirection === 'up' && isScrollingUp) {
      shouldToggle = rect.top <= threshold
    }

    if (shouldToggle && !isVisible) {
      setIsVisible(true)
      setIsAnimating(true)
      setProgress(0)
      onStart?.()

      setTimeout(() => {
        setIsAnimating(false)
        setProgress(1)
        onComplete?.()
      }, duration)
    } else if (!shouldToggle && isVisible) {
      setIsVisible(false)
      setIsAnimating(true)
      setProgress(1)

      setTimeout(() => {
        setIsAnimating(false)
        setProgress(0)
      }, duration)
    }

    setLastScrollY(currentScrollY)
  }, [isVisible, lastScrollY, scrollDirection, scrollThreshold, duration, onStart, onComplete])

  // 스크롤 이벤트 리스너 설정
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // 초기 상태 확인

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  // 모션 시작 함수 (프로그래매틱 제어용)
  const start = useCallback(() => {
    if (!isVisible) {
      setIsVisible(true)
      setIsAnimating(true)
      setProgress(0)
      onStart?.()

      setTimeout(() => {
        setIsAnimating(false)
        setProgress(1)
        onComplete?.()
      }, duration)
    }
  }, [isVisible, duration, onStart, onComplete])

  // 모션 중단 함수
  const stop = useCallback(() => {
    setIsAnimating(false)
    onStop?.()
  }, [onStop])

  // 모션 리셋 함수
  const reset = useCallback(() => {
    setIsVisible(false)
    setIsAnimating(false)
    setProgress(0)
    onReset?.()
  }, [onReset])

  // 모션 일시정지 함수
  const pause = useCallback(() => {
    setIsAnimating(false)
  }, [])

  // 모션 재개 함수
  const resume = useCallback(() => {
    if (isVisible) {
      setIsAnimating(true)
    }
  }, [isVisible])

  // 스타일 계산
  const style: React.CSSProperties = {
    transform: `
      scale(${isVisible ? showScale : hideScale})
      rotate(${isVisible ? showRotate : hideRotate}deg)
      translate(${isVisible ? showTranslateX : hideTranslateX}px, ${isVisible ? showTranslateY : hideTranslateY}px)
    `,
    opacity: isVisible ? showOpacity : hideOpacity,
    transition: `all ${duration}ms ${easing}`,
    willChange: 'transform, opacity'
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
    resume
  }
}
