import { useState, useEffect, useRef, useCallback } from 'react'

interface AutoPlayOptions {
  interval?: number // 재생 간격 (ms)
  delay?: number // 시작 지연 시간 (ms)
  repeat?: number | 'infinite' // 반복 횟수
  autoStart?: boolean // 자동 시작 여부
  pauseOnHover?: boolean // 호버 시 일시정지 여부
  pauseOnBlur?: boolean // 페이지 블러 시 일시정지 여부
  showOnMount?: boolean
}

export function useAutoPlay(options: AutoPlayOptions = {}) {
  const { 
    interval = 3000,
    delay = 0,
    repeat = 'infinite',
    autoStart = true,
    pauseOnHover = false,
    pauseOnBlur = true,
    showOnMount = false 
  } = options
  
  const [isPlaying, setIsPlaying] = useState(showOnMount ? autoStart : false)
  const [currentStep, setCurrentStep] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  
  const intervalRef = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const repeatCountRef = useRef(0)

  // 하이드레이션 이슈 해결을 위한 mounted 상태 관리
  useEffect(() => {
    setMounted(true)
  }, [])

  // 자동 재생 시작
  const start = useCallback(() => {
    if (!mounted) return
    
    setIsPlaying(true)
    setIsPaused(false)
    setCurrentStep(0)
    repeatCountRef.current = 0

    // 초기 지연
    if (delay > 0) {
      timeoutRef.current = window.setTimeout(() => {
        startInterval()
      }, delay)
    } else {
      startInterval()
    }
  }, [mounted, delay, interval, repeat])

  // 자동 재생 정지
  const stop = useCallback(() => {
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentStep(0)
    repeatCountRef.current = 0
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  // 일시정지
  const pause = useCallback(() => {
    if (!isPlaying) return
    
    setIsPaused(true)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [isPlaying])

  // 재개
  const resume = useCallback(() => {
    if (!isPlaying || !isPaused) return
    
    setIsPaused(false)
    startInterval()
  }, [isPlaying, isPaused, interval, repeat])

  // 다음 단계로 진행
  const next = useCallback(() => {
    setCurrentStep(prev => {
      const nextStep = prev + 1
      
      // 반복 횟수 체크
      if (repeat !== 'infinite') {
        repeatCountRef.current += 1
        if (repeatCountRef.current >= repeat) {
          stop()
          return prev
        }
      }
      
      return nextStep
    })
  }, [repeat, stop])

  // 이전 단계로 이동
  const previous = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1))
  }, [])

  // 특정 단계로 이동
  const goTo = useCallback((step: number) => {
    setCurrentStep(Math.max(0, step))
  }, [])

  // 인터벌 시작
  const startInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    intervalRef.current = window.setInterval(() => {
      next()
    }, interval)
  }, [interval, next])

  // 자동 시작
  useEffect(() => {
    if (mounted && autoStart) {
      start()
    }
  }, [mounted, autoStart, start])

  // 호버 이벤트 처리
  useEffect(() => {
    if (!pauseOnHover) return

    const handleMouseEnter = () => {
      if (isPlaying && !isPaused) {
        pause()
      }
    }

    const handleMouseLeave = () => {
      if (isPlaying && isPaused) {
        resume()
      }
    }

    document.addEventListener('mouseenter', handleMouseEnter)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [pauseOnHover, isPlaying, isPaused, pause, resume])

  // 페이지 블러 이벤트 처리
  useEffect(() => {
    if (!pauseOnBlur) return

    const handleBlur = () => {
      if (isPlaying && !isPaused) {
        pause()
      }
    }

    const handleFocus = () => {
      if (isPlaying && isPaused) {
        resume()
      }
    }

    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [pauseOnBlur, isPlaying, isPaused, pause, resume])

  // 클린업
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    isPlaying,
    isPaused,
    currentStep,
    mounted,
    start,
    stop,
    pause,
    resume,
    next,
    previous,
    goTo
  }
}
