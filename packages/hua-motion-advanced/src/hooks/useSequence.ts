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
  const motionsRef = useRef<any[]>([])
  const timeoutsRef = useRef<number[]>([])

  // 컴포넌트 레벨에서 모션 훅들을 미리 생성
  const motions = sequence.map(item => item.hook())

  const start = useCallback(() => {
    if (isPlaying) return

    setIsPlaying(true)
    setCurrentIndex(0)
    
    // 모션 참조 설정
    motionsRef.current = motions
    
    // 첫 번째 모션 시작
    if (motionsRef.current[0]) {
      motionsRef.current[0].start()
    }

    // 순차적으로 다음 모션들 시작
    sequence.forEach((item, index) => {
      if (index === 0) return // 첫 번째는 이미 시작됨

      const timeout = window.setTimeout(() => {
            if (motionsRef.current[index]) {
      motionsRef.current[index].start()
          setCurrentIndex(index)
        }
      }, item.delay || 0)

      timeoutsRef.current.push(timeout)
    })

    // 마지막 모션 완료 후 처리
    const totalDuration = sequence.reduce((total, item, _index) => {
      return total + (item.delay || 0)
    }, 0)

    const finalTimeout = window.setTimeout(() => {
      setIsPlaying(false)
      if (loop) {
        start() // 루프 모드면 다시 시작
      }
            }, totalDuration + 1000) // 마지막 모션 완료 대기

    timeoutsRef.current.push(finalTimeout)
  }, [sequence, isPlaying, loop, motions])

  const stop = useCallback(() => {
    setIsPlaying(false)
    setCurrentIndex(0)
    
    // 모든 타임아웃 정리
    timeoutsRef.current.forEach(timeout => window.clearTimeout(timeout))
    timeoutsRef.current = []
    
    // 모든 모션 정지
    motionsRef.current.forEach(motion => {
      if (motion && motion.stop) {
        motion.stop()
      }
    })
  }, [])

  const reset = useCallback(() => {
    stop()
    setCurrentIndex(0)
    
    // 모든 모션 리셋
    motionsRef.current.forEach(motion => {
      if (motion && motion.reset) {
        motion.reset()
      }
    })
  }, [stop])

  const pause = useCallback(() => {
    setIsPlaying(false)
    
    // 현재 실행 중인 모션 일시정지
    if (motionsRef.current[currentIndex] && motionsRef.current[currentIndex].pause) {
      motionsRef.current[currentIndex].pause()
    }
  }, [currentIndex])

  const resume = useCallback(() => {
    setIsPlaying(true)
    
    // 현재 모션 재개
    if (motionsRef.current[currentIndex] && motionsRef.current[currentIndex].resume) {
      motionsRef.current[currentIndex].resume()
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
          totalMotions: sequence.length,
      ref: motions[0]?.ref || (() => {}) // 첫 번째 모션의 ref 반환
  }
} 