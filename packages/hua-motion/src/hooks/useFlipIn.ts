import { useRef, useEffect, useState, useCallback } from 'react'
import { BaseMotionOptions, BaseMotionReturn } from '../types'

export interface FlipInOptions extends BaseMotionOptions {
  axis?: 'X' | 'Y' | 'Z'
  perspective?: number
  backfaceVisibility?: boolean
}

export function useFlipIn(options: FlipInOptions = {}): BaseMotionReturn {
  const {
    delay = 0,
    duration = 600,
    easing = 'easeInOutCubic',
    axis = 'Y',
    perspective = 1000,
    backfaceVisibility = true,
    threshold = 0.1,
    triggerOnce = true,
    onStart,
    onComplete
  } = options

  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'starting' | 'animating' | 'complete'>('idle')

  // CSS 변수 설정
  useEffect(() => {
    if (!ref.current) return

    const element = ref.current
    element.style.perspective = `${perspective}px`
    element.style.transformStyle = 'preserve-3d'
    
    if (backfaceVisibility) {
      element.style.backfaceVisibility = 'hidden'
    }
  }, [perspective, backfaceVisibility])

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
        // 충분한 지연 후 flip 상태 변경하여 transition 효과 보장
        setTimeout(() => {
          setIsFlipped(!isFlipped)
        }, 16) // 1프레임(16ms) 대기
      }, delay)
    } else {
      // 먼저 transition 활성화
      setAnimationPhase('animating')
      // 충분한 지연 후 flip 상태 변경하여 transition 효과 보장
      setTimeout(() => {
        setIsFlipped(!isFlipped)
      }, 16) // 1프레임(16ms) 대기
    }
    
    // 애니메이션 완료 후 상태 정리
    setTimeout(() => {
      setAnimationPhase('complete')
      setIsAnimating(false)
      onComplete?.()
    }, delay + duration + 16) // 추가 지연 시간 포함
  }, [axis, duration, delay, isAnimating, isFlipped, onStart, onComplete])

  const reset = useCallback(() => {
    // DOM 직접 조작 제거, React state만 사용
    // reset 시에는 즉시 초기 상태로, transition 없이
    setIsFlipped(false)
    setIsAnimating(false)
    setAnimationPhase('idle')
  }, [])

  const stop = useCallback(() => {
    setIsAnimating(false)
    setAnimationPhase('idle')
  }, [])

  const pause = useCallback(() => {
    if (ref.current) {
      ref.current.style.transition = 'none'
    }
  }, [])

  const resume = useCallback(() => {
    if (ref.current) {
      ref.current.style.transition = `transform ${duration}ms ${easing}`
    }
  }, [duration, easing])

  // 현재 상태에 따른 스타일 반환 - CSS transition + React state 조합
  const style = {
    transform: `rotate${axis}(${isFlipped ? 180 : 0}deg)`,
    transition: animationPhase === 'animating' ? `transform ${duration}ms ${easing}` : 'none',
    perspective: `${perspective}px`,
    transformStyle: 'preserve-3d' as const,
    backfaceVisibility: backfaceVisibility ? 'hidden' as const : 'visible' as const,
    '--motion-delay': `${delay}ms`,
    '--motion-duration': `${duration}ms`,
    '--motion-easing': easing,
    '--motion-phase': animationPhase
  }

  return {
    ref,
    style,
    isVisible,
    isAnimating,
    start,
    reset,
    stop,
    pause,
    resume
  }
}
