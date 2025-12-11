import { useState, useEffect, useCallback } from 'react'
import { BaseMotionReturn, MotionElement, MotionRef } from '../types'

export interface GradientOptions {
  colors?: string[]
  duration?: number
  direction?: 'horizontal' | 'vertical' | 'diagonal'
  size?: number
  easing?: 'linear' | 'ease-in-out' | 'ease-in' | 'ease-out'
  autoStart?: boolean
}

const defaultColors = ['#60a5fa', '#34d399', '#fbbf24', '#f87171']

export function useGradient<T extends MotionElement = HTMLDivElement>(
  options: GradientOptions = {}
): BaseMotionReturn<T> & {
  style: React.CSSProperties
} {
  const {
    colors = defaultColors,
    duration = 6000,
    direction = 'diagonal',
    size = 300,
    easing = 'ease-in-out',
    autoStart = false
  } = options

  const [isAnimating, setIsAnimating] = useState(autoStart)
  const [isVisible, setIsVisible] = useState(true)
  const [motionProgress, setMotionProgress] = useState(0)

  const getGradientStyle = useCallback((): React.CSSProperties => {
    const gradientDirection = direction === 'horizontal' ? '90deg' :
                             direction === 'vertical' ? '180deg' : '135deg'
    
    const background = `linear-gradient(${gradientDirection}, ${colors.join(', ')})`
    const backgroundSize = `${size}% ${size}%`
    
    const easingFunction = easing === 'linear' ? 'linear' :
                          easing === 'ease-in' ? 'ease-in' :
                          easing === 'ease-out' ? 'ease-out' : 'ease-in-out'

    return {
      background,
      backgroundSize,
      animation: isAnimating ? `gradientShift ${duration}ms ${easingFunction} infinite` : 'none',
      backgroundPosition: isAnimating ? undefined : `${motionProgress}% 50%`
    }
  }, [colors, direction, size, duration, easing, isAnimating, motionProgress])

  const start = useCallback(() => {
    setIsAnimating(true)
  }, [])

  const pause = useCallback(() => {
    setIsAnimating(false)
  }, [])

  const resume = useCallback(() => {
    setIsAnimating(true)
  }, [])

  const reset = useCallback(() => {
    // 모션 완전 정지
    setIsAnimating(false)
    // 진행률 초기화
    setMotionProgress(0)
  }, [])

  const stop = useCallback(() => {
    setIsAnimating(false)
  }, [])

  useEffect(() => {
    if (!isAnimating) {
      const interval = setInterval(() => {
        setMotionProgress(prev => {
          const newProgress = prev + (100 / (duration / 16)) // 60fps 기준
          return newProgress >= 100 ? 0 : newProgress
        })
      }, 16)

      return () => clearInterval(interval)
    }
  }, [isAnimating, duration])

  // 초기 상태 설정만 하고 이후에는 수동으로 제어
  useEffect(() => {
    setIsAnimating(autoStart)
  }, [autoStart])

  return {
    ref: { current: null } as React.RefObject<T | null>, // useGradient는 ref를 직접 사용하지 않음
    isVisible,
    isAnimating,
    style: getGradientStyle(),
    progress: motionProgress / 100,
    start,
    pause,
    resume,
    reset,
    stop
  }
}

// CSS 키프레임 생성 함수
export const createGradientKeyframes = (name: string = 'gradientShift') => {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes ${name} {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
  `
  
  if (!document.head.querySelector(`style[data-gradient="${name}"]`)) {
    style.setAttribute('data-gradient', name)
    document.head.appendChild(style)
  }
}

// 자동으로 키프레임 생성
if (typeof document !== 'undefined') {
  createGradientKeyframes()
} 