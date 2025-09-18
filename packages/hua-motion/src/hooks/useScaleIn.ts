import { useRef, useState, useEffect, useCallback } from 'react'
import { BaseMotionReturn, MotionElement } from '../types'

export interface ScaleInOptions {
  scale?: number
  duration?: number
  delay?: number
  autoStart?: boolean
  easing?: string
}

export function useScaleIn<T extends MotionElement = HTMLDivElement>(
  options: ScaleInOptions = {}
): BaseMotionReturn<T> & {
  scale: number
  opacity: number
} {
  const {
    scale: initialScale = 0,
    duration = 1000,
    delay = 0,
    autoStart = true,
    easing = 'ease-out'
  } = options

  const ref = useRef<T>(null)
  const [scale, setScale] = useState(autoStart ? initialScale : 1)
  const [opacity, setOpacity] = useState(autoStart ? 0 : 1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(autoStart ? false : true)
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'starting' | 'animating' | 'complete'>('idle')

  const start = useCallback(() => {
    if (isAnimating) return

    setIsAnimating(true)
    setAnimationPhase('starting')
    
    // 초기 상태로 설정
    setScale(initialScale)
    setOpacity(0)
    setIsVisible(false)

    // 지연 후 애니메이션 시작
    setTimeout(() => {
      setAnimationPhase('animating')
      // 애니메이션 시작
      setScale(1)
      setOpacity(1)
      setIsVisible(true)
      
      // 애니메이션 완료 후 상태 정리
      setTimeout(() => {
        setAnimationPhase('complete')
        setIsAnimating(false)
      }, duration)
    }, delay)
  }, [delay, initialScale, duration])

  const reset = useCallback(() => {
    // 즉시 초기 상태로 복원 (모션 없이)
    setScale(initialScale)
    setOpacity(0)
    setIsVisible(false)
    setIsAnimating(false)
    setAnimationPhase('idle')
    
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
  }, [initialScale])

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

  // autoStart가 true일 때 한 번만 실행
  useEffect(() => {
    if (autoStart && !isAnimating) {
      start()
    }
  }, [autoStart]) // start 제거하여 무한반복 방지

  // 스타일 계산 - CSS transition + React state 조합
  const style = {
    transform: `scale(${scale})`,
    opacity,
    transition: animationPhase === 'animating' ? `all ${duration}ms ${easing}` : 'none',
    '--motion-delay': `${delay}ms`,
    '--motion-duration': `${duration}ms`,
    '--motion-easing': easing,
    '--motion-phase': animationPhase
  } as const

  // DOM 요소에 직접 스타일 적용 (duration 보장)
  useEffect(() => {
    if (ref.current) {
      const element = ref.current
      element.style.transition = `all ${duration}ms ${easing}`
    }
  }, [duration, easing])

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