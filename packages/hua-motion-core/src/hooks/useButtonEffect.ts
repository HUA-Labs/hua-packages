import { useRef, useState, useEffect, useCallback } from 'react'
import { BaseMotionOptions, BaseMotionReturn, MotionElement } from '../types'

export interface ButtonEffectOptions extends BaseMotionOptions {
  // 버튼 타입
  type?: 'scale' | 'ripple' | 'glow' | 'shake' | 'bounce' | 'slide' | 'custom'
  
  // 스케일 효과 (scale 타입일 때)
  scaleAmount?: number
  
  // 리플 효과 (ripple 타입일 때)
  rippleColor?: string
  rippleSize?: number
  rippleDuration?: number
  
  // 글로우 효과 (glow 타입일 때)
  glowColor?: string
  glowSize?: number
  glowIntensity?: number
  
  // 흔들림 효과 (shake 타입일 때)
  shakeAmount?: number
  shakeFrequency?: number
  
  // 바운스 효과 (bounce 타입일 때)
  bounceHeight?: number
  bounceStiffness?: number
  
  // 슬라이드 효과 (slide 타입일 때)
  slideDistance?: number
  slideDirection?: 'left' | 'right' | 'up' | 'down'
  
  // 호버 효과
  hoverScale?: number
  hoverRotate?: number
  hoverTranslateY?: number
  hoverTranslateX?: number
  
  // 활성 효과
  activeScale?: number
  activeRotate?: number
  activeTranslateY?: number
  activeTranslateX?: number
  
  // 포커스 효과
  focusScale?: number
  focusGlow?: boolean
  
  // 비활성화 상태
  disabled?: boolean
  disabledOpacity?: number
  
  // 자동 시작
  autoStart?: boolean
}

export function useButtonEffect<T extends MotionElement = HTMLButtonElement>(
  options: ButtonEffectOptions = {}
): BaseMotionReturn<T> & {
  buttonType: string
  isPressed: boolean
  isHovered: boolean
  isFocused: boolean
  ripplePosition: { x: number; y: number }
  currentGlowIntensity: number
  shakeOffset: number
  bounceOffset: number
  slideOffset: number
  pressButton: () => void
  releaseButton: () => void
  setButtonState: (state: 'idle' | 'hover' | 'active' | 'focus' | 'disabled') => void
} {
  const {
    duration = 200,
    easing = 'ease-out',
    type = 'scale',
    scaleAmount = 0.95,
    rippleColor = 'rgba(255, 255, 255, 0.6)',
    rippleSize = 100,
    rippleDuration = 600,
    glowColor = '#3b82f6',
    glowSize = 20,
    glowIntensity = 0.8,
    shakeAmount = 5,
    shakeFrequency = 10,
    bounceHeight = 10,
    bounceStiffness = 0.3,
    slideDistance = 5,
    slideDirection = 'down',
    hoverScale = 1.05,
    hoverRotate = 0,
    hoverTranslateY = -2,
    hoverTranslateX = 0,
    activeScale = 0.95,
    activeRotate = 0,
    activeTranslateY = 2,
    activeTranslateX = 0,
    focusScale = 1.02,
    focusGlow = true,
    disabled = false,
    disabledOpacity = 0.5,
    autoStart = false,
    onComplete, onStart, onStop, onReset
  } = options

  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [buttonType] = useState(type)
  const [isPressed, setIsPressed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0 })
  const [currentGlowIntensity, setGlowIntensity] = useState(0)
  const [shakeOffset, setShakeOffset] = useState(0)
  const [bounceOffset, setBounceOffset] = useState(0)
  const [slideOffset, setSlideOffset] = useState(0)
  
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)

  // 리플 효과 함수
  const createRipple = useCallback((event: React.MouseEvent) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    setRipplePosition({ x, y })
    setIsAnimating(true)
    setProgress(0)
    startTimeRef.current = Date.now()
    onStart?.()

    const animateRipple = () => {
      const elapsed = Date.now() - startTimeRef.current
      const currentProgress = Math.min(elapsed / rippleDuration, 1)
      
      setProgress(currentProgress)

      if (currentProgress < 1) {
        animationRef.current = requestAnimationFrame(animateRipple)
      } else {
        setIsAnimating(false)
        onComplete?.()
      }
    }

    animationRef.current = requestAnimationFrame(animateRipple)
  }, [rippleDuration, onStart, onComplete])

  // 흔들림 효과 함수
  const shakeButton = useCallback(() => {
    setIsAnimating(true)
    setProgress(0)
    startTimeRef.current = Date.now()
    onStart?.()

    const animateShake = () => {
      const elapsed = Date.now() - startTimeRef.current
      const currentProgress = Math.min(elapsed / duration, 1)
      
      setProgress(currentProgress)
      const shake = shakeAmount * Math.sin(currentProgress * Math.PI * 2 * shakeFrequency) * (1 - currentProgress)
      setShakeOffset(shake)

      if (currentProgress < 1) {
        animationRef.current = requestAnimationFrame(animateShake)
      } else {
        setIsAnimating(false)
        setShakeOffset(0)
        onComplete?.()
      }
    }

    animationRef.current = requestAnimationFrame(animateShake)
  }, [duration, shakeAmount, shakeFrequency, onStart, onComplete])

  // 바운스 효과 함수
  const bounceButton = useCallback(() => {
    setIsAnimating(true)
    setProgress(0)
    startTimeRef.current = Date.now()
    onStart?.()

    const animateBounce = () => {
      const elapsed = Date.now() - startTimeRef.current
      const currentProgress = Math.min(elapsed / duration, 1)
      
      setProgress(currentProgress)
      const bounce = bounceHeight * Math.sin(currentProgress * Math.PI * bounceStiffness) * Math.exp(-currentProgress * 3)
      setBounceOffset(bounce)

      if (currentProgress < 1) {
        animationRef.current = requestAnimationFrame(animateBounce)
      } else {
        setIsAnimating(false)
        setBounceOffset(0)
        onComplete?.()
      }
    }

    animationRef.current = requestAnimationFrame(animateBounce)
  }, [duration, bounceHeight, bounceStiffness, onStart, onComplete])

  // 슬라이드 효과 함수
  const slideButton = useCallback(() => {
    setIsAnimating(true)
    setProgress(0)
    startTimeRef.current = Date.now()
    onStart?.()

    const animateSlide = () => {
      const elapsed = Date.now() - startTimeRef.current
      const currentProgress = Math.min(elapsed / duration, 1)
      
      setProgress(currentProgress)
      const slide = slideDistance * currentProgress
      setSlideOffset(slide)

      if (currentProgress < 1) {
        animationRef.current = requestAnimationFrame(animateSlide)
      } else {
        setIsAnimating(false)
        onComplete?.()
      }
    }

    animationRef.current = requestAnimationFrame(animateSlide)
  }, [duration, slideDistance, onStart, onComplete])

  // 버튼 누르기 함수
  const pressButton = useCallback(() => {
    if (disabled) return

    setIsPressed(true)
    
    switch (type) {
      case 'ripple':
        // 리플은 마우스 이벤트로 처리
        break
      case 'shake':
        shakeButton()
        break
      case 'bounce':
        bounceButton()
        break
      case 'slide':
        slideButton()
        break
      default:
        // 기본 스케일 효과
        break
    }
  }, [disabled, type, shakeButton, bounceButton, slideButton])

  // 버튼 놓기 함수
  const releaseButton = useCallback(() => {
    setIsPressed(false)
  }, [])

  // 버튼 상태 설정 함수
  const setButtonState = useCallback((state: 'idle' | 'hover' | 'active' | 'focus' | 'disabled') => {
    switch (state) {
      case 'hover':
        setIsHovered(true)
        break
      case 'active':
        setIsPressed(true)
        break
      case 'focus':
        setIsFocused(true)
        break
      case 'disabled':
        setIsHovered(false)
        setIsPressed(false)
        setIsFocused(false)
        break
      default:
        setIsHovered(false)
        setIsPressed(false)
        setIsFocused(false)
        break
    }
  }, [])

  // 모션 시작 함수
  const start = useCallback(() => {
    if (!isVisible) {
      setIsVisible(true)
    }
  }, [isVisible])

  // 모션 중단 함수
  const stop = useCallback(() => {
    setIsAnimating(false)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    onStop?.()
  }, [onStop])

  // 모션 리셋 함수
  const reset = useCallback(() => {
    setIsVisible(false)
    setIsAnimating(false)
    setProgress(0)
    setIsPressed(false)
    setIsHovered(false)
    setIsFocused(false)
    setRipplePosition({ x: 0, y: 0 })
    setGlowIntensity(0)
    setShakeOffset(0)
    setBounceOffset(0)
    setSlideOffset(0)
    startTimeRef.current = 0
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    onReset?.()
  }, [onReset])

  // 모션 일시정지 함수
  const pause = useCallback(() => {
    setIsAnimating(false)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }, [])

  // 모션 재개 함수
  const resume = useCallback(() => {
    if (isVisible && !isAnimating) {
      setIsAnimating(true)
    }
  }, [isVisible, isAnimating])

  // 자동 시작
  useEffect(() => {
    if (autoStart) {
      start()
    }
  }, [autoStart, start])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // 버튼 스타일 계산
  const getButtonStyle = (): React.CSSProperties => {
    let scale = 1
    let rotate = 0
    let translateY = 0
    let translateX = 0
    let boxShadow = 'none'

    // 상태별 효과 적용
    if (isPressed) {
      scale = activeScale
      rotate = activeRotate
      translateY = activeTranslateY
      translateX = activeTranslateX
    } else if (isHovered) {
      scale = hoverScale
      rotate = hoverRotate
      translateY = hoverTranslateY
      translateX = hoverTranslateX
    }

    if (isFocused && focusGlow) {
      boxShadow = `0 0 ${glowSize}px ${glowColor}`
    }

    // 타입별 추가 효과
    switch (type) {
      case 'shake':
        translateX += shakeOffset
        break
      case 'bounce':
        translateY += bounceOffset
        break
      case 'slide':
        if (slideDirection === 'left') translateX -= slideOffset
        else if (slideDirection === 'right') translateX += slideOffset
        else if (slideDirection === 'up') translateY -= slideOffset
        else if (slideDirection === 'down') translateY += slideOffset
        break
    }

    const baseStyle: React.CSSProperties = {
      transform: `
        scale(${scale})
        rotate(${rotate}deg)
        translate(${translateX}px, ${translateY}px)
      `,
      boxShadow,
      opacity: disabled ? disabledOpacity : 1,
      transition: `all ${duration}ms ${easing}`,
      willChange: 'transform, box-shadow, opacity',
      cursor: disabled ? 'not-allowed' : 'pointer',
      position: 'relative',
      overflow: 'hidden'
    }

    return baseStyle
  }

  const style = getButtonStyle()

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
    buttonType: type,
    isPressed,
    isHovered,
    isFocused,
    ripplePosition,
    currentGlowIntensity,
    shakeOffset,
    bounceOffset,
    slideOffset,
    pressButton,
    releaseButton,
    setButtonState
  }
}
