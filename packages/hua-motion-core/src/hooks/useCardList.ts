import { useRef, useState, useEffect, useCallback } from 'react'
import { BaseMotionOptions, BaseMotionReturn, MotionElement } from '../types'

export interface CardListOptions extends BaseMotionOptions {
  staggerDelay?: number
  cardScale?: number
  cardOpacity?: number
  cardRotate?: number
  cardTranslateY?: number
  cardTranslateX?: number
  initialScale?: number
  initialOpacity?: number
  initialRotate?: number
  initialTranslateY?: number
  initialTranslateX?: number
  gridColumns?: number
  gridGap?: number
}

export function useCardList<T extends MotionElement = HTMLDivElement>(
  options: CardListOptions = {}
): BaseMotionReturn<T> & {
  cardStyles: React.CSSProperties[]
  staggerDelay: number
  gridColumns: number
  gridGap: number
} {
  const {
    duration = 500,
    easing = 'ease-out',
    staggerDelay = 100,
    cardScale = 1,
    cardOpacity = 1,
    cardRotate = 0,
    cardTranslateY = 0,
    cardTranslateX = 0,
    initialScale = 0.8,
    initialOpacity = 0,
    initialRotate = 0,
    initialTranslateY = 30,
    initialTranslateX = 0,
    gridColumns = 3,
    gridGap = 20,
    onComplete, onStart, onStop, onReset
  } = options

  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [cardCount, setCardCount] = useState(0)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // 카드 개수 계산
  useEffect(() => {
    if (ref.current) {
      const cards = ref.current.querySelectorAll('[data-card]')
      setCardCount(cards.length)
    }
  }, [])

  // 카드 스타일 배열 생성
  const cardStyles = Array.from({ length: cardCount }, (_, index) => {
    const delay = isVisible ? index * staggerDelay : 0
    const isCardVisible = isVisible && delay <= progress * (cardCount * staggerDelay)

    return {
      transform: `
        scale(${isCardVisible ? cardScale : initialScale})
        rotate(${isCardVisible ? cardRotate : initialRotate}deg)
        translate(${isCardVisible ? cardTranslateX : initialTranslateX}px, ${isCardVisible ? cardTranslateY : initialTranslateY}px)
      `,
      opacity: isCardVisible ? cardOpacity : initialOpacity,
      transition: `all ${duration}ms ${easing} ${delay}ms`,
      willChange: 'transform, opacity'
    }
  })

  // 모션 시작 함수
  const start = useCallback(() => {
    if (isAnimating) return

    setIsAnimating(true)
    setProgress(0)
    onStart?.()

    // 카드들이 순차적으로 나타나도록
    const totalDuration = cardCount * staggerDelay + duration
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 0.1
        if (newProgress >= 1) {
          setIsVisible(true)
          setIsAnimating(false)
          onComplete?.()
          clearInterval(interval)
          return 1
        }
        return newProgress
      })
    }, totalDuration / 10)
  }, [isAnimating, cardCount, staggerDelay, duration, onStart, onComplete])

  // 모션 중단 함수
  const stop = useCallback(() => {
    setIsAnimating(false)
    onStop?.()
  }, [onStop])

  // 모션 리셋 함수
  const reset = useCallback(() => {
    setIsVisible(false)
    setIsAnimating(false)
    setProgress(0)
    onReset?.()
  }, [onReset])

  // 모션 일시정지 함수
  const pause = useCallback(() => {
    setIsAnimating(false)
  }, [])

  // 모션 재개 함수
  const resume = useCallback(() => {
    if (!isVisible && !isAnimating) {
      start()
    }
  }, [isVisible, isAnimating, start])

  // Intersection Observer 설정
  useEffect(() => {
    if (!ref.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            start()
          }
        })
      },
      { threshold: 0.1 }
    )

    observerRef.current.observe(ref.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [start])

  // 그리드 스타일
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
    gap: `${gridGap}px`,
    width: '100%'
  }

  return {
    ref,
    isVisible,
    isAnimating,
    style: gridStyle,
    progress,
    start,
    stop,
    reset,
    pause,
    resume,
    cardStyles,
    staggerDelay,
    gridColumns,
    gridGap
  }
}
