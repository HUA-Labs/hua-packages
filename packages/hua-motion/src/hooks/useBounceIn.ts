import { useRef, useState, useEffect, useCallback } from 'react'
import { BaseMotionReturn, MotionElement } from '../types'

export interface BounceInOptions {
  duration?: number
  delay?: number
  autoStart?: boolean
  intensity?: number
}

export function useBounceIn<T extends MotionElement = HTMLDivElement>(
  options: BounceInOptions = {}
): BaseMotionReturn<T> & {
  scale: number
  opacity: number
} {
  const {
    duration = 1000,
    delay = 0,
    autoStart = true,
    intensity = 0.3
  } = options

  const ref = useRef<T>(null)
  const [scale, setScale] = useState(autoStart ? 0 : 1)
  const [opacity, setOpacity] = useState(autoStart ? 0 : 1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(autoStart ? false : true)
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'starting' | 'animating' | 'complete'>('idle')

  const start = useCallback(() => {
    if (isAnimating) return

    setIsAnimating(true)
    setAnimationPhase('starting')
    
    // 초기 상태로 설정
    setScale(0)
    setOpacity(0)
    setIsVisible(false)

    // 지연 후 애니메이션 시작
    setTimeout(() => {
      setAnimationPhase('animating')
      
      // 첫 번째 바운스 (과도하게 확대) - 즉시 실행
      setScale(1 + intensity)
      setOpacity(1)
      
      // 두 번째 바운스 (정상 크기로) - 첫 번째 바운스 완료 후
      setTimeout(() => {
        setScale(1)
        setIsVisible(true)
        
        // 애니메이션 완료 후 상태 정리 - 바운스 완료까지 기다림
        setTimeout(() => {
          setAnimationPhase('complete')
          setIsAnimating(false)
        }, duration * 0.4) // 바운스 효과 완료까지 충분한 시간 대기
      }, duration * 0.6) // 바운스 효과 시간을 늘림
    }, delay)
  }, [delay, intensity, duration, isAnimating])

  const reset = useCallback(() => {
    // DOM 직접 조작 제거, React state만 사용
    setScale(0)
    setOpacity(0)
    setIsVisible(false)
    setIsAnimating(false)
    setAnimationPhase('idle')
  }, [])

  const stop = useCallback(() => {
    setIsAnimating(false)
    setAnimationPhase('idle')
  }, [])

  // autoStart가 false일 때 초기 상태를 올바르게 설정
  useEffect(() => {
    if (!autoStart) {
      setScale(1)
      setOpacity(1)
      setIsVisible(true)
      setAnimationPhase('idle')
    }
  }, [autoStart])

  useEffect(() => {
    if (autoStart) {
      start()
    }
  }, [autoStart, start])

  // 스타일 계산 - CSS transition + React state 조합
  const style = {
    transform: `scale(${scale})`,
    opacity,
    transition: animationPhase === 'animating' ? `all ${duration}ms ease-out` : 'none',
    '--motion-delay': `${delay}ms`,
    '--motion-duration': `${duration}ms`,
    '--motion-phase': animationPhase
  } as const

  return {
    ref,
    scale,
    opacity,
    isVisible,
    isAnimating,
    style,
    start,
    reset,
    stop
  }
} 