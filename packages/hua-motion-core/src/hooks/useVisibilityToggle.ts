import { useRef, useState, useCallback, useEffect } from 'react'
import { BaseMotionOptions, InteractionReturn, MotionElement } from '../types'

export interface VisibilityToggleOptions extends BaseMotionOptions {
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
}

export function useVisibilityToggle<T extends MotionElement = HTMLDivElement>(
  options: VisibilityToggleOptions = {}
): InteractionReturn<T> {
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
    onComplete, onStart, onStop, onReset
  } = options

  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [progress, setProgress] = useState(0)

  // 가시성 토글 함수
  const toggle = useCallback(() => {
    setIsAnimating(true)
    setProgress(0)
    onStart?.()

    const newVisibility = !isVisible
    setIsVisible(newVisibility)

    // 애니메이션 완료 시
    setTimeout(() => {
      setIsAnimating(false)
      setProgress(1)
      onComplete?.()
    }, duration)
  }, [isVisible, duration, onStart, onComplete])

  // 표시 함수
  const show = useCallback(() => {
    if (!isVisible) {
      setIsAnimating(true)
      setProgress(0)
      onStart?.()
      setIsVisible(true)

      setTimeout(() => {
        setIsAnimating(false)
        setProgress(1)
        onComplete?.()
      }, duration)
    }
  }, [isVisible, duration, onStart, onComplete])

  // 숨김 함수
  const hide = useCallback(() => {
    if (isVisible) {
      setIsAnimating(true)
      setProgress(1)
      onStart?.()
      setIsVisible(false)

      setTimeout(() => {
        setIsAnimating(false)
        setProgress(0)
        onComplete?.()
      }, duration)
    }
  }, [isVisible, duration, onStart, onComplete])

  // 모션 시작 함수 (프로그래매틱 제어용)
  const start = useCallback(() => {
    if (!isVisible) {
      toggle()
    }
  }, [isVisible, toggle])

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
    resume,
    // 추가 메서드
    toggle,
    show,
    hide
  }
}
