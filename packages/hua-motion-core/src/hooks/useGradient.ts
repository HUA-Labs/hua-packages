import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { GradientOptions, BaseMotionReturn, MotionElement } from '../types'

const defaultColors = ['#60a5fa', '#34d399', '#fbbf24', '#f87171']

// SSR 안전한 키프레임 생성
let keyframesInjected = false
function ensureGradientKeyframes() {
  if (typeof document === 'undefined' || keyframesInjected) return
  const name = 'gradientShift'
  if (!document.head.querySelector(`style[data-gradient="${name}"]`)) {
    const style = document.createElement('style')
    style.setAttribute('data-gradient', name)
    style.textContent = `
      @keyframes ${name} {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
    `
    document.head.appendChild(style)
  }
  keyframesInjected = true
}

export function useGradient<T extends MotionElement = HTMLDivElement>(
  options: GradientOptions = {}
): BaseMotionReturn<T> {
  const {
    colors = defaultColors,
    duration = 6000,
    direction = 'diagonal',
    size = 300,
    easing = 'ease-in-out',
    autoStart = false
  } = options

  const ref = useRef<T>(null)
  const [isAnimating, setIsAnimating] = useState(autoStart)
  const [isVisible, setIsVisible] = useState(true)
  const [motionProgress, setMotionProgress] = useState(0)

  // SSR 가드: 키프레임은 useEffect 내에서만 생성
  useEffect(() => {
    ensureGradientKeyframes()
  }, [])

  const style = useMemo(() => {
    const gradientDirection = direction === 'horizontal' ? '90deg' :
                             direction === 'vertical' ? '180deg' : '135deg'

    const background = `linear-gradient(${gradientDirection}, ${colors.join(', ')})`
    const backgroundSize = `${size}% ${size}%`

    return {
      background,
      backgroundSize,
      animation: isAnimating ? `gradientShift ${duration}ms ${easing} infinite` : 'none',
      backgroundPosition: isAnimating ? undefined : `${motionProgress}% 50%`
    } as React.CSSProperties
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
    setIsAnimating(false)
    setMotionProgress(0)
  }, [])

  const stop = useCallback(() => {
    setIsAnimating(false)
  }, [])

  useEffect(() => {
    if (!isAnimating) {
      const interval = setInterval(() => {
        setMotionProgress(prev => {
          const newProgress = prev + (100 / (duration / 16))
          return newProgress >= 100 ? 0 : newProgress
        })
      }, 16)

      return () => clearInterval(interval)
    }
  }, [isAnimating, duration])

  useEffect(() => {
    setIsAnimating(autoStart)
  }, [autoStart])

  return {
    ref,
    isVisible,
    isAnimating,
    style,
    progress: motionProgress / 100,
    start,
    pause,
    resume,
    reset,
    stop
  }
}
