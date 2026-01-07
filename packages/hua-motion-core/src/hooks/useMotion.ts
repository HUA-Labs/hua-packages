import { useRef, useState, useEffect, useCallback } from 'react'
import { BaseMotionOptions, BaseMotionReturn, MotionElement } from '../types'

export interface MotionOptions extends BaseMotionOptions {
  // 기본 변환 옵션
  scale?: number | { from: number; to: number }
  opacity?: number | { from: number; to: number }
  rotate?: number | { from: number; to: number }
  translateX?: number | { from: number; to: number }
  translateY?: number | { from: number; to: number }
  
  // 추가 변환 옵션
  skewX?: number | { from: number; to: number }
  skewY?: number | { from: number; to: number }
  
  // 색상 옵션
  backgroundColor?: string | { from: string; to: string }
  color?: string | { from: string; to: string }
  borderColor?: string | { from: string; to: string }
  
  // 크기 옵션
  width?: number | string | { from: number | string; to: number | string }
  height?: number | string | { from: number | string; to: number | string }
  
  // 테두리 옵션
  borderRadius?: number | string | { from: number | string; to: number | string }
  borderWidth?: number | { from: number; to: number }
  
  // 그림자 옵션
  boxShadow?: string | { from: string; to: string }
  
  // 필터 옵션
  blur?: number | { from: number; to: number }
  brightness?: number | { from: number; to: number }
  contrast?: number | { from: number; to: number }
  grayscale?: number | { from: number; to: number }
  hueRotate?: number | { from: number; to: number }
  saturate?: number | { from: number; to: number }
  sepia?: number | { from: number; to: number }
  
  // 애니메이션 제어
  playOnMount?: boolean
  loop?: boolean
  yoyo?: boolean
  stagger?: number
  onUpdate?: (progress: number) => void
}

export function useMotion<T extends MotionElement = HTMLDivElement>(
  options: MotionOptions = {}
): BaseMotionReturn<T> & {
  play: () => void
  reverse: () => void
  seek: (progress: number) => void
  getValue: (property: string) => any
} {
  const {
    duration = 1000,
    easing = 'ease-out',
    delay = 0,
    threshold = 0.1,
    triggerOnce = true,
    autoStart = false,
    playOnMount = false,
    loop = false,
    yoyo = false,
    stagger = 0,
    scale = { from: 1, to: 1 },
    opacity = { from: 1, to: 1 },
    rotate = { from: 0, to: 0 },
    translateX = { from: 0, to: 0 },
    translateY = { from: 0, to: 0 },
    skewX = { from: 0, to: 0 },
    skewY = { from: 0, to: 0 },
    backgroundColor,
    color,
    borderColor,
    width,
    height,
    borderRadius,
    borderWidth,
    boxShadow,
    blur = { from: 0, to: 0 },
    brightness = { from: 100, to: 100 },
    contrast = { from: 100, to: 100 },
    grayscale = { from: 0, to: 0 },
    hueRotate = { from: 0, to: 0 },
    saturate = { from: 100, to: 100 },
    sepia = { from: 0, to: 0 },
    onComplete, onStart, onStop, onReset, onUpdate
  } = options

  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isReversed, setIsReversed] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const animationRef = useRef<number | null>(null)

  // 값 정규화 함수
  const normalizeValue = (value: any): { from: any; to: any } => {
    if (typeof value === 'object' && 'from' in value && 'to' in value) {
      return value
    }
    return { from: value, to: value }
  }

  // 정규화된 값들
  const normalizedScale = normalizeValue(scale)
  const normalizedOpacity = normalizeValue(opacity)
  const normalizedRotate = normalizeValue(rotate)
  const normalizedTranslateX = normalizeValue(translateX)
  const normalizedTranslateY = normalizeValue(translateY)
  const normalizedSkewX = normalizeValue(skewX)
  const normalizedSkewY = normalizeValue(skewY)
  const normalizedBlur = normalizeValue(blur)
  const normalizedBrightness = normalizeValue(brightness)
  const normalizedContrast = normalizeValue(contrast)
  const normalizedGrayscale = normalizeValue(grayscale)
  const normalizedHueRotate = normalizeValue(hueRotate)
  const normalizedSaturate = normalizeValue(saturate)
  const normalizedSepia = normalizeValue(sepia)

  // 보간 함수
  const interpolate = (from: number, to: number, progress: number): number => {
    return from + (to - from) * progress
  }

  // 애니메이션 실행 함수
  const runAnimation = useCallback((startTime: number, isReverse: boolean = false) => {
    if (!isAnimating) return

    const animate = (currentTime: number) => {
      if (!isAnimating) return

      const elapsed = currentTime - startTime
      const currentProgress = Math.min(elapsed / duration, 1)
      
      // 진행률 계산 (정방향/역방향)
      let finalProgress = isReverse ? 1 - currentProgress : currentProgress
      
      // 이징 적용
      const easedProgress = finalProgress
      setProgress(easedProgress)
      
      // 업데이트 콜백 호출
      onUpdate?.(easedProgress)

      if (currentProgress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // 애니메이션 완료
        setIsAnimating(false)
        
        // 루프 또는 요요 처리
        if (loop || yoyo) {
          if (yoyo) {
            setIsReversed(!isReversed)
            setTimeout(() => {
              if (isAnimating) return
              setIsAnimating(true)
              runAnimation(Date.now(), !isReversed)
            }, stagger)
          } else {
            setTimeout(() => {
              if (isAnimating) return
              setIsAnimating(true)
              runAnimation(Date.now(), isReverse)
            }, stagger)
          }
        } else {
          onComplete?.()
        }
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [isAnimating, duration, loop, yoyo, stagger, onComplete, onUpdate])

  // 모션 시작 함수
  const start = useCallback(() => {
    if (!isVisible) {
      setIsVisible(true)
      setIsAnimating(true)
      setProgress(0)
      onStart?.()
      runAnimation(Date.now(), isReversed)
    }
  }, [isVisible, onStart, runAnimation, isReversed])

  // 재생 함수
  const play = useCallback(() => {
    if (!isAnimating) {
      setIsAnimating(true)
      onStart?.()
      runAnimation(Date.now(), isReversed)
    }
  }, [isAnimating, onStart, runAnimation, isReversed])

  // 역방향 재생 함수
  const reverse = useCallback(() => {
    setIsReversed(!isReversed)
    if (!isAnimating) {
      setIsAnimating(true)
      onStart?.()
      runAnimation(Date.now(), !isReversed)
    }
  }, [isReversed, isAnimating, onStart, runAnimation])

  // 진행률 이동 함수
  const seek = useCallback((targetProgress: number) => {
    const clampedProgress = Math.max(0, Math.min(1, targetProgress))
    setProgress(clampedProgress)
    onUpdate?.(clampedProgress)
  }, [onUpdate])

  // 특정 속성의 현재 값 가져오기
  const getValue = useCallback((property: string): any => {
    const currentProgress = progress
    
    switch (property) {
      case 'scale':
        return interpolate(normalizedScale.from, normalizedScale.to, currentProgress)
      case 'opacity':
        return interpolate(normalizedOpacity.from, normalizedOpacity.to, currentProgress)
      case 'rotate':
        return interpolate(normalizedRotate.from, normalizedRotate.to, currentProgress)
      case 'translateX':
        return interpolate(normalizedTranslateX.from, normalizedTranslateX.to, currentProgress)
      case 'translateY':
        return interpolate(normalizedTranslateY.from, normalizedTranslateY.to, currentProgress)
      case 'skewX':
        return interpolate(normalizedSkewX.from, normalizedSkewX.to, currentProgress)
      case 'skewY':
        return interpolate(normalizedSkewY.from, normalizedSkewY.to, currentProgress)
      case 'blur':
        return interpolate(normalizedBlur.from, normalizedBlur.to, currentProgress)
      case 'brightness':
        return interpolate(normalizedBrightness.from, normalizedBrightness.to, currentProgress)
      case 'contrast':
        return interpolate(normalizedContrast.from, normalizedContrast.to, currentProgress)
      case 'grayscale':
        return interpolate(normalizedGrayscale.from, normalizedGrayscale.to, currentProgress)
      case 'hueRotate':
        return interpolate(normalizedHueRotate.from, normalizedHueRotate.to, currentProgress)
      case 'saturate':
        return interpolate(normalizedSaturate.from, normalizedSaturate.to, currentProgress)
      case 'sepia':
        return interpolate(normalizedSepia.from, normalizedSepia.to, currentProgress)
      default:
        return null
    }
  }, [progress, normalizedScale, normalizedOpacity, normalizedRotate, normalizedTranslateX, 
      normalizedTranslateY, normalizedSkewX, normalizedSkewY, normalizedBlur, normalizedBrightness,
      normalizedContrast, normalizedGrayscale, normalizedHueRotate, normalizedSaturate, normalizedSepia])

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
    setIsReversed(false)
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
      runAnimation(Date.now(), isReversed)
    }
  }, [isVisible, isAnimating, runAnimation, isReversed])

  // Intersection Observer 설정
  useEffect(() => {
    if (!ref.current || !autoStart) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            start()
            if (triggerOnce) {
              observerRef.current?.disconnect()
            }
          }
        })
      },
      { threshold }
    )

    observerRef.current.observe(ref.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [autoStart, threshold, triggerOnce, start])

  // 마운트 시 자동 시작
  useEffect(() => {
    if (playOnMount) {
      start()
    }
  }, [playOnMount, start])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // 현재 진행률에 따른 스타일 계산
  const style: React.CSSProperties = {
    transform: `
      scale(${getValue('scale')})
      rotate(${getValue('rotate')}deg)
      translate(${getValue('translateX')}px, ${getValue('translateY')}px)
      skew(${getValue('skewX')}deg, ${getValue('skewY')}deg)
    `,
    opacity: getValue('opacity'),
    filter: `
      blur(${getValue('blur')}px)
      brightness(${getValue('brightness')}%)
      contrast(${getValue('contrast')}%)
      grayscale(${getValue('grayscale')}%)
      hue-rotate(${getValue('hueRotate')}deg)
      saturate(${getValue('saturate')}%)
      sepia(${getValue('sepia')}%)
    `,
    transition: `all ${duration}ms ${easing}`,
    willChange: 'transform, opacity, filter'
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
    play,
    reverse,
    seek,
    getValue
  }
}
