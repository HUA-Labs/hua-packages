import { useRef, useState, useEffect, useCallback } from 'react'
import { BaseMotionOptions, BaseMotionReturn, MotionElement } from '../types'

export interface SkeletonOptions extends BaseMotionOptions {
  /** 스켈레톤 배경색 */
  backgroundColor?: string
  /** 스켈레톤 하이라이트 색상 */
  highlightColor?: string
  /** 모션 속도 (ms) */
  motionSpeed?: number
  /** 스켈레톤 높이 */
  height?: number
  /** 스켈레톤 너비 */
  width?: number | string
  /** 보더 반지름 */
  borderRadius?: number
  /** 웨이브 모션 활성화 여부 */
  wave?: boolean
  /** 펄스 모션 활성화 여부 */
  pulse?: boolean
}

export function useSkeleton<T extends MotionElement = HTMLDivElement>(
  options: SkeletonOptions = {}
): BaseMotionReturn<T> {
  const {
    delay = 0,
    duration = 1500,
    easing = 'ease-in-out',
    autoStart = true,
    backgroundColor = '#f0f0f0',
    highlightColor = '#e0e0e0',
    motionSpeed = 1500,
    height = 20,
    width = '100%',
    borderRadius = 4,
    wave = true,
    pulse = false,
    onComplete, onStart, onStop, onReset
  } = options

  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(autoStart)
  const [isAnimating, setIsAnimating] = useState(autoStart)
  const [progress, setProgress] = useState(0)
  const motionRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)

  // 스켈레톤 시작 함수
  const start = useCallback(() => {
    if (isAnimating) return

    setIsVisible(true)
    setIsAnimating(true)
    setProgress(0)
    onStart?.()

    // 지연 시간 적용
    setTimeout(() => {
      startTimeRef.current = Date.now()
      
      const animate = () => {
        if (!startTimeRef.current) return
        
        const elapsed = Date.now() - startTimeRef.current
        const newProgress = Math.min(elapsed / duration, 1)
        setProgress(newProgress)

        if (newProgress < 1) {
          motionRef.current = requestAnimationFrame(animate)
        } else {
          setIsAnimating(false)
          onComplete?.()
        }
      }

      motionRef.current = requestAnimationFrame(animate)
    }, delay)
  }, [delay, duration, isAnimating, onStart, onComplete])

  // 스켈레톤 중단 함수
  const stop = useCallback(() => {
    if (motionRef.current) {
      cancelAnimationFrame(motionRef.current)
      motionRef.current = null
    }
    startTimeRef.current = null
    setIsAnimating(false)
    onStop?.()
  }, [onStop])

  // 스켈레톤 리셋 함수
  const reset = useCallback(() => {
    stop()
    setIsVisible(false)
    setProgress(0)
    onReset?.()
  }, [stop, onReset])

  // 스켈레톤 일시정지 함수
  const pause = useCallback(() => {
    if (motionRef.current) {
      cancelAnimationFrame(motionRef.current)
      motionRef.current = null
    }
    setIsAnimating(false)
  }, [])

  // 스켈레톤 재개 함수
  const resume = useCallback(() => {
    if (!isAnimating && isVisible) {
      start()
    }
  }, [isAnimating, isVisible, start])

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

  // 스켈레톤 스타일 계산
  const getSkeletonStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: `${height}px`,
      backgroundColor,
      borderRadius: `${borderRadius}px`,
      position: 'relative',
      overflow: 'hidden',
      opacity: isVisible ? 1 : 0,
      transition: `opacity ${duration}ms ${easing}`
    }

    if (wave && isAnimating) {
      baseStyle.background = `linear-gradient(90deg, ${backgroundColor} 25%, ${highlightColor} 50%, ${backgroundColor} 75%)`
      baseStyle.backgroundSize = '200% 100%'
      baseStyle.animation = `skeleton-wave ${motionSpeed}ms infinite linear`
    } else if (pulse && isAnimating) {
      baseStyle.animation = `skeleton-pulse ${motionSpeed}ms infinite ease-in-out`
    }

    return baseStyle
  }

  const style = getSkeletonStyle()

  // CSS 모션 키프레임을 동적으로 추가
  useEffect(() => {
    const styleSheet = document.styleSheets[0] || document.createElement('style').sheet
    
    if (styleSheet && !document.getElementById('skeleton-animations')) {
      const styleElement = document.createElement('style')
      styleElement.id = 'skeleton-animations'
      styleElement.textContent = `
        @keyframes skeleton-wave {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `
      document.head.appendChild(styleElement)
    }
  }, [])

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
