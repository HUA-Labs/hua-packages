import { useRef, useCallback, useState, useEffect } from 'react'

interface SequenceItem {
  hook: () => any
  delay?: number
}

export function useSequence(
  sequence: SequenceItem[],
  options: {
    autoStart?: boolean
    loop?: boolean
  } = {}
) {
  const {
    autoStart = true,
    loop = false
  } = options

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const animationsRef = useRef<any[]>([])
  const timeoutsRef = useRef<number[]>([])

  // 컴포넌트 레벨에서 애니메이션 훅들을 미리 생성
  const animations = sequence.map(item => item.hook())

  const start = useCallback(() => {
    if (isPlaying) return

    setIsPlaying(true)
    setCurrentIndex(0)
    
    // 애니메이션 참조 설정
    animationsRef.current = animations
    
    // 첫 번째 애니메이션 시작
    if (animationsRef.current[0]) {
      animationsRef.current[0].start()
    }

    // 순차적으로 다음 애니메이션들 시작
    sequence.forEach((item, index) => {
      if (index === 0) return // 첫 번째는 이미 시작됨

      const timeout = window.setTimeout(() => {
        if (animationsRef.current[index]) {
          animationsRef.current[index].start()
          setCurrentIndex(index)
        }
      }, item.delay || 0)

      timeoutsRef.current.push(timeout)
    })

    // 마지막 애니메이션 완료 후 처리
    const totalDuration = sequence.reduce((total, item, _index) => {
      return total + (item.delay || 0)
    }, 0)

    const finalTimeout = window.setTimeout(() => {
      setIsPlaying(false)
      if (loop) {
        start() // 루프 모드면 다시 시작
      }
    }, totalDuration + 1000) // 마지막 애니메이션 완료 대기

    timeoutsRef.current.push(finalTimeout)
  }, [sequence, isPlaying, loop, animations])

  const stop = useCallback(() => {
    setIsPlaying(false)
    setCurrentIndex(0)
    
    // 모든 타임아웃 정리
    timeoutsRef.current.forEach(timeout => window.clearTimeout(timeout))
    timeoutsRef.current = []
    
    // 모든 애니메이션 정지
    animationsRef.current.forEach(animation => {
      if (animation && animation.stop) {
        animation.stop()
      }
    })
  }, [])

  const reset = useCallback(() => {
    stop()
    setCurrentIndex(0)
    
    // 모든 애니메이션 리셋
    animationsRef.current.forEach(animation => {
      if (animation && animation.reset) {
        animation.reset()
      }
    })
  }, [stop])

  const pause = useCallback(() => {
    setIsPlaying(false)
    
    // 현재 실행 중인 애니메이션 일시정지
    if (animationsRef.current[currentIndex] && animationsRef.current[currentIndex].pause) {
      animationsRef.current[currentIndex].pause()
    }
  }, [currentIndex])

  const resume = useCallback(() => {
    setIsPlaying(true)
    
    // 현재 애니메이션 재개
    if (animationsRef.current[currentIndex] && animationsRef.current[currentIndex].resume) {
      animationsRef.current[currentIndex].resume()
    }
  }, [currentIndex])

  // 자동 시작
  useEffect(() => {
    if (autoStart && !isPlaying) {
      start()
    }
  }, [autoStart, isPlaying, start])

  return {
    start,
    stop,
    pause,
    resume,
    reset,
    isPlaying,
    currentIndex,
    totalAnimations: sequence.length,
    ref: animations[0]?.ref || (() => {}) // 첫 번째 애니메이션의 ref 반환
  }
} 