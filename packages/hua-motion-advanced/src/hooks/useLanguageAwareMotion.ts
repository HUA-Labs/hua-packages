import { useRef, useEffect, useState, useCallback } from 'react'

export interface LanguageConfig {
  motionType: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'bounceIn'
  duration?: number
  delay?: number
  threshold?: number
  pauseOnLanguageChange?: boolean
  restartOnLanguageChange?: boolean
  currentLanguage?: string // 외부에서 언어 정보를 받음
}

export function useLanguageAwareMotion(options: LanguageConfig) {
  const {
    motionType,
    duration = 700,
    delay = 0,
    threshold = 0.1,
    pauseOnLanguageChange = true,
    restartOnLanguageChange = false,
    currentLanguage: externalLanguage
  } = options

  const elementRef = useRef<HTMLElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [internalLanguage, setInternalLanguage] = useState<string>('')

  // 언어 변경 감지
  useEffect(() => {
    if (externalLanguage && internalLanguage !== externalLanguage) {
      setInternalLanguage(externalLanguage)

      if (pauseOnLanguageChange && isVisible) {
        // 언어 변경 시 모션 일시정지
        setIsPaused(true)
        
        // 텍스트 변경 완료 후 모션 재개
        setTimeout(() => {
          setIsPaused(false)
        }, 200) // 텍스트 변경 대기 시간
      }

      if (restartOnLanguageChange && isVisible) {
        // 언어 변경 시 모션 재시작
        setIsVisible(false)
        setTimeout(() => {
          setIsVisible(true)
        }, 100)
      }
    }
  }, [externalLanguage, internalLanguage, isVisible, pauseOnLanguageChange, restartOnLanguageChange])

  // Intersection Observer로 가시성 감지
  useEffect(() => {
    if (!elementRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible && !isPaused) {
            setTimeout(() => {
              setIsVisible(true)
            }, delay)
          }
        })
      },
      { threshold }
    )

    observer.observe(elementRef.current)

    return () => {
      observer.disconnect()
    }
  }, [isVisible, isPaused, delay, threshold])

  // 모션 스타일 생성
  const getMotionStyle = useCallback(() => {
    const baseTransition = `all ${duration}ms ease-out`
    
    if (isPaused) {
      // 일시정지 상태: 현재 상태 유지
      return {
        opacity: 1,
        transform: 'none',
        transition: baseTransition
      }
    }
    
    if (!isVisible) {
      // 초기 상태
      switch (motionType) {
        case 'fadeIn':
          return {
            opacity: 0,
            transition: baseTransition
          }
        case 'slideUp':
          return {
            opacity: 0,
            transform: 'translateY(32px)',
            transition: baseTransition
          }
        case 'slideLeft':
          return {
            opacity: 0,
            transform: 'translateX(-32px)',
            transition: baseTransition
          }
        case 'slideRight':
          return {
            opacity: 0,
            transform: 'translateX(32px)',
            transition: baseTransition
          }
        case 'scaleIn':
          return {
            opacity: 0,
            transform: 'scale(0.95)',
            transition: baseTransition
          }
        case 'bounceIn':
          return {
            opacity: 0,
            transform: 'scale(0.75)',
            transition: baseTransition
          }
        default:
          return {
            opacity: 0,
            transition: baseTransition
          }
      }
    }
    
    // 보이는 상태
    return {
      opacity: 1,
      transform: 'none',
      transition: baseTransition
    }
  }, [isVisible, isPaused, motionType, duration])

  // 모션 제어 함수들
  const pauseMotion = useCallback(() => {
    setIsPaused(true)
  }, [])

  const resumeMotion = useCallback(() => {
    setIsPaused(false)
  }, [])

  const restartMotion = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => {
      setIsVisible(true)
    }, 100)
  }, [])

  return {
    ref: elementRef,
    isVisible,
    isPaused,
    style: getMotionStyle(),
    pauseMotion,
    resumeMotion,
    restartMotion,
    currentLanguage: internalLanguage
  }
}
