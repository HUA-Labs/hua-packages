import { useRef, useState, useEffect, useCallback } from 'react'
import { BaseMotionOptions, BaseMotionReturn, MotionElement } from '../types'

export interface LoadingSpinnerOptions extends BaseMotionOptions {
  // 스피너 타입
  type?: 'rotate' | 'pulse' | 'bounce' | 'wave' | 'dots' | 'bars' | 'custom'
  
  // 회전 속도 (rotate 타입일 때)
  rotationSpeed?: number
  
  // 펄스 속도 (pulse 타입일 때)
  pulseSpeed?: number
  
  // 바운스 높이 (bounce 타입일 때)
  bounceHeight?: number
  
  // 웨이브 개수 (wave 타입일 때)
  waveCount?: number
  
  // 점 개수 (dots 타입일 때)
  dotCount?: number
  
  // 바 개수 (bars 타입일 때)
  barCount?: number
  
  // 색상
  color?: string
  backgroundColor?: string
  
  // 크기
  size?: number
  
  // 두께
  thickness?: number
  
  // 자동 시작
  autoStart?: boolean
  
  // 무한 반복
  infinite?: boolean
}

export function useLoadingSpinner<T extends MotionElement = HTMLDivElement>(
  options: LoadingSpinnerOptions = {}
): BaseMotionReturn<T> & {
  isLoading: boolean
  spinnerType: string
  rotationAngle: number
  pulseScale: number
  bounceOffset: number
  waveProgress: number
  dotProgress: number
  barProgress: number
  startLoading: () => void
  stopLoading: () => void
  setLoadingState: (loading: boolean) => void
} {
  const {
    duration = 1000,
    easing = 'linear',
    type = 'rotate',
    rotationSpeed = 1,
    pulseSpeed = 1,
    bounceHeight = 20,
    waveCount = 3,
    dotCount = 3,
    barCount = 4,
    color = '#3b82f6',
    backgroundColor = 'transparent',
    size = 40,
    thickness = 4,
    autoStart = true,
    infinite = true,
    onComplete, onStart, onStop, onReset
  } = options

  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [rotationAngle, setRotationAngle] = useState(0)
  const [pulseScale, setPulseScale] = useState(1)
  const [bounceOffset, setBounceOffset] = useState(0)
  const [waveProgress, setWaveProgress] = useState(0)
  const [dotProgress, setDotProgress] = useState(0)
  const [barProgress, setBarProgress] = useState(0)
  
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)

  // 애니메이션 루프 함수
  const runAnimation = useCallback(() => {
    if (!isAnimating) return

    const animate = (currentTime: number) => {
      if (!isAnimating) return

      if (!startTimeRef.current) {
        startTimeRef.current = currentTime
      }

      const elapsed = currentTime - startTimeRef.current
      const currentProgress = (elapsed / duration) % 1
      
      setProgress(currentProgress)

      // 타입별 애니메이션 업데이트
      switch (type) {
        case 'rotate':
          setRotationAngle(currentProgress * 360 * rotationSpeed)
          break
        case 'pulse':
          setPulseScale(0.8 + 0.4 * Math.sin(currentProgress * Math.PI * 2 * pulseSpeed))
          break
        case 'bounce':
          setBounceOffset(bounceHeight * Math.sin(currentProgress * Math.PI * 2))
          break
        case 'wave':
          setWaveProgress(currentProgress)
          break
        case 'dots':
          setDotProgress(currentProgress)
          break
        case 'bars':
          setBarProgress(currentProgress)
          break
      }

      if (infinite || currentProgress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
        onComplete?.()
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [isAnimating, duration, type, rotationSpeed, pulseSpeed, bounceHeight, infinite, onComplete])

  // 로딩 시작 함수
  const startLoading = useCallback(() => {
    if (isLoading) return

    setIsLoading(true)
    setIsAnimating(true)
    setProgress(0)
    startTimeRef.current = 0
    onStart?.()
    runAnimation()
  }, [isLoading, onStart, runAnimation])

  // 로딩 중단 함수
  const stopLoading = useCallback(() => {
    setIsLoading(false)
    setIsAnimating(false)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    onStop?.()
  }, [onStop])

  // 로딩 상태 설정 함수
  const setLoadingState = useCallback((loading: boolean) => {
    if (loading) {
      startLoading()
    } else {
      stopLoading()
    }
  }, [startLoading, stopLoading])

  // 모션 시작 함수
  const start = useCallback(() => {
    if (!isVisible) {
      setIsVisible(true)
      startLoading()
    }
  }, [isVisible, startLoading])

  // 모션 중단 함수
  const stop = useCallback(() => {
    stopLoading()
  }, [stopLoading])

  // 모션 리셋 함수
  const reset = useCallback(() => {
    setIsVisible(false)
    setIsAnimating(false)
    setProgress(0)
    setIsLoading(false)
    setRotationAngle(0)
    setPulseScale(1)
    setBounceOffset(0)
    setWaveProgress(0)
    setDotProgress(0)
    setBarProgress(0)
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
      runAnimation()
    }
  }, [isVisible, isAnimating, runAnimation])

  // 자동 시작
  useEffect(() => {
    if (autoStart) {
      startLoading()
    }
  }, [autoStart, startLoading])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // 스피너 스타일 계산
  const getSpinnerStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      width: size,
      height: size,
      backgroundColor: 'transparent',
      position: 'relative',
      display: 'inline-block'
    }

    switch (type) {
      case 'rotate':
        return {
          ...baseStyle,
          border: `${thickness}px solid ${backgroundColor}`,
          borderTop: `${thickness}px solid ${color}`,
          borderRadius: '50%',
          transform: `rotate(${rotationAngle}deg)`,
          transition: `transform ${duration}ms ${easing}`
        }
      
      case 'pulse':
        return {
          ...baseStyle,
          backgroundColor: color,
          borderRadius: '50%',
          transform: `scale(${pulseScale})`,
          transition: `transform ${duration}ms ${easing}`
        }
      
      case 'bounce':
        return {
          ...baseStyle,
          backgroundColor: color,
          borderRadius: '50%',
          transform: `translateY(${bounceOffset}px)`,
          transition: `transform ${duration}ms ${easing}`
        }
      
      case 'wave':
        return {
          ...baseStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }
      
      case 'dots':
        return {
          ...baseStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }
      
      case 'bars':
        return {
          ...baseStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }
      
      default:
        return baseStyle
    }
  }

  // 웨이브 바 스타일 생성
  const getWaveBars = (): React.CSSProperties[] => {
    return Array.from({ length: waveCount }, (_, index) => {
      const delay = index * (duration / waveCount)
      const height = size * (0.3 + 0.7 * Math.sin((waveProgress + index / waveCount) * Math.PI * 2))
      
      return {
        width: thickness,
        height: `${height}px`,
        backgroundColor: color,
        borderRadius: thickness / 2,
        animationDelay: `${delay}ms`,
        transition: `height ${duration}ms ${easing}`
      }
    })
  }

  // 점 스타일 생성
  const getDots = (): React.CSSProperties[] => {
    return Array.from({ length: dotCount }, (_, index) => {
      const delay = index * (duration / dotCount)
      const opacity = 0.3 + 0.7 * Math.sin((dotProgress + index / dotCount) * Math.PI * 2)
      const scale = 0.8 + 0.4 * Math.sin((dotProgress + index / dotCount) * Math.PI * 2)
      
      return {
        width: thickness * 2,
        height: thickness * 2,
        backgroundColor: color,
        borderRadius: '50%',
        opacity,
        transform: `scale(${scale})`,
        animationDelay: `${delay}ms`,
        transition: `all ${duration}ms ${easing}`
      }
    })
  }

  // 바 스타일 생성
  const getBars = (): React.CSSProperties[] => {
    return Array.from({ length: barCount }, (_, index) => {
      const delay = index * (duration / barCount)
      const height = size * (0.2 + 0.8 * Math.sin((barProgress + index / barCount) * Math.PI * 2))
      
      return {
        width: thickness,
        height: `${height}px`,
        backgroundColor: color,
        borderRadius: thickness / 2,
        animationDelay: `${delay}ms`,
        transition: `height ${duration}ms ${easing}`
      }
    })
  }

  const style = getSpinnerStyle()

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
    isLoading,
    spinnerType: type,
    rotationAngle,
    pulseScale,
    bounceOffset,
    waveProgress,
    dotProgress,
    barProgress,
    startLoading,
    stopLoading,
    setLoadingState
  }
}
