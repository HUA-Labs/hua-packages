import { useRef, useEffect, useState, useCallback } from 'react'

interface AnimationStep {
  id: string
  animation: () => void
  delay?: number
  duration?: number
  onComplete?: () => void
}

interface AnimationOrchestraOptions {
  mode?: 'sequential' | 'parallel' | 'stagger'
  staggerDelay?: number
  autoStart?: boolean
  loop?: boolean
  onComplete?: () => void
}

interface OrchestraState {
  isPlaying: boolean
  currentStep: number
  completedSteps: Set<string>
}

export function useAnimationOrchestra(options: AnimationOrchestraOptions = {}) {
  const {
    mode = 'sequential',
    staggerDelay = 100,
    autoStart = false,
    loop = false,
    onComplete
  } = options

  const [orchestraState, setOrchestraState] = useState<OrchestraState>({
    isPlaying: false,
    currentStep: 0,
    completedSteps: new Set()
  })

  const animationsRef = useRef<AnimationStep[]>([])
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  // 애니메이션 추가
  const addAnimation = useCallback((step: AnimationStep) => {
    animationsRef.current.push(step)
  }, [])

  // 애니메이션 제거
  const removeAnimation = useCallback((id: string) => {
    animationsRef.current = animationsRef.current.filter(step => step.id !== id)
  }, [])

  // 모든 타임아웃 정리
  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    timeoutsRef.current = []
  }, [])

  // 순차 실행
  const playSequential = useCallback(() => {
    if (animationsRef.current.length === 0) return

    const playStep = (index: number) => {
      if (index >= animationsRef.current.length) {
        // 모든 애니메이션 완료
        setOrchestraState(prev => ({ ...prev, isPlaying: false, currentStep: 0 }))
        onComplete?.()
        
        if (loop) {
          // 루프 모드: 다시 시작
          setTimeout(() => {
            setOrchestraState(prev => ({ ...prev, isPlaying: true, completedSteps: new Set() }))
            playSequential()
          }, 1000)
        }
        return
      }

      const step = animationsRef.current[index]
      setOrchestraState(prev => ({ 
        ...prev, 
        currentStep: index,
        completedSteps: new Set([...prev.completedSteps, step.id])
      }))

      // 애니메이션 실행
      step.animation()
      
      // 완료 콜백
      if (step.onComplete) {
        step.onComplete()
      }

      // 다음 단계로
      const timeout = setTimeout(() => {
        playStep(index + 1)
      }, step.delay || 0)
      
      timeoutsRef.current.push(timeout)
    }

    playStep(0)
  }, [loop, onComplete])

  // 병렬 실행
  const playParallel = useCallback(() => {
    if (animationsRef.current.length === 0) return

    const completedSteps = new Set<string>()
    
    animationsRef.current.forEach((step, index) => {
      const timeout = setTimeout(() => {
        step.animation()
        completedSteps.add(step.id)
        
        if (step.onComplete) {
          step.onComplete()
        }

        // 모든 애니메이션 완료 확인
        if (completedSteps.size === animationsRef.current.length) {
          setOrchestraState(prev => ({ ...prev, isPlaying: false, currentStep: 0 }))
          onComplete?.()
          
          if (loop) {
            setTimeout(() => {
              setOrchestraState(prev => ({ ...prev, isPlaying: true }))
              playParallel()
            }, 1000)
          }
        }
      }, step.delay || 0)
      
      timeoutsRef.current.push(timeout)
    })

    setOrchestraState(prev => ({ 
      ...prev, 
      completedSteps: new Set(completedSteps)
    }))
  }, [loop, onComplete])

  // 스태거 실행
  const playStagger = useCallback(() => {
    if (animationsRef.current.length === 0) return

    const completedSteps = new Set<string>()
    
    animationsRef.current.forEach((step, index) => {
      const timeout = setTimeout(() => {
        step.animation()
        completedSteps.add(step.id)
        
        if (step.onComplete) {
          step.onComplete()
        }

        setOrchestraState(prev => ({ 
          ...prev, 
          currentStep: index,
          completedSteps: new Set([...prev.completedSteps, step.id])
        }))

        // 모든 애니메이션 완료 확인
        if (completedSteps.size === animationsRef.current.length) {
          setOrchestraState(prev => ({ ...prev, isPlaying: false, currentStep: 0 }))
          onComplete?.()
          
          if (loop) {
            setTimeout(() => {
              setOrchestraState(prev => ({ ...prev, isPlaying: true, completedSteps: new Set() }))
              playStagger()
            }, 1000)
          }
        }
      }, (step.delay || 0) + (index * staggerDelay))
      
      timeoutsRef.current.push(timeout)
    })
  }, [staggerDelay, loop, onComplete])

  // 재생 시작
  const play = useCallback(() => {
    clearTimeouts()
    setOrchestraState(prev => ({ ...prev, isPlaying: true, currentStep: 0, completedSteps: new Set() }))

    switch (mode) {
      case 'sequential':
        playSequential()
        break
      case 'parallel':
        playParallel()
        break
      case 'stagger':
        playStagger()
        break
    }
  }, [mode, clearTimeouts, playSequential, playParallel, playStagger])

  // 정지
  const stop = useCallback(() => {
    clearTimeouts()
    setOrchestraState(prev => ({ ...prev, isPlaying: false, currentStep: 0 }))
  }, [clearTimeouts])

  // 일시정지
  const pause = useCallback(() => {
    setOrchestraState(prev => ({ ...prev, isPlaying: false }))
  }, [])

  // 재개
  const resume = useCallback(() => {
    if (orchestraState.currentStep < animationsRef.current.length) {
      setOrchestraState(prev => ({ ...prev, isPlaying: true }))
      
      switch (mode) {
        case 'sequential':
          playSequential()
          break
        case 'parallel':
          playParallel()
          break
        case 'stagger':
          playStagger()
          break
      }
    }
  }, [mode, orchestraState.currentStep, playSequential, playParallel, playStagger])

  // 자동 시작
  useEffect(() => {
    if (autoStart && animationsRef.current.length > 0) {
      play()
    }
  }, [autoStart, play])

  // 정리
  useEffect(() => {
    return () => {
      clearTimeouts()
    }
  }, [clearTimeouts])

  return {
    addAnimation,
    removeAnimation,
    play,
    stop,
    pause,
    resume,
    isPlaying: orchestraState.isPlaying,
    currentStep: orchestraState.currentStep,
    completedSteps: orchestraState.completedSteps,
    totalSteps: animationsRef.current.length
  }
} 