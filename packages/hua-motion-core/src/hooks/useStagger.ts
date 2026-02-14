import { useRef, useState, useEffect, useMemo, type CSSProperties, type RefObject } from 'react'
import type { ScrollRevealMotionType } from '../types'

export interface UseStaggerOptions {
  /** 자식 아이템 개수 */
  count: number
  /** 아이템 간 딜레이 (ms) @default 100 */
  staggerDelay?: number
  /** 전체 시작 딜레이 (ms) @default 0 */
  baseDelay?: number
  /** 애니메이션 지속시간 (ms) @default 700 */
  duration?: number
  /** 모션 타입 @default 'fadeIn' */
  motionType?: ScrollRevealMotionType
  /** IntersectionObserver 임계값 @default 0.1 */
  threshold?: number
  /** 이징 함수 @default 'ease-out' */
  easing?: string
}

export interface UseStaggerReturn {
  /** 부모 컨테이너 ref — IntersectionObserver 연결 */
  containerRef: RefObject<HTMLDivElement | null>
  /** 자식 아이템별 style 배열 */
  styles: CSSProperties[]
  /** 전체 visible 여부 */
  isVisible: boolean
}

function getInitialTransform(motionType: ScrollRevealMotionType): string {
  switch (motionType) {
    case 'slideUp':
      return 'translateY(32px)'
    case 'slideLeft':
      return 'translateX(-32px)'
    case 'slideRight':
      return 'translateX(32px)'
    case 'scaleIn':
      return 'scale(0.95)'
    case 'bounceIn':
      return 'scale(0.75)'
    case 'fadeIn':
    default:
      return 'none'
  }
}

/**
 * useStagger — 리스트 아이템에 순차 딜레이를 적용하는 훅
 *
 * 단일 IntersectionObserver로 컨테이너를 관찰하고,
 * 자식 아이템별로 CSS transition-delay를 자동 계산합니다.
 *
 * @example
 * const stagger = useStagger({ count: items.length, staggerDelay: 100 });
 * <div ref={stagger.containerRef}>
 *   {items.map((item, i) => (
 *     <div style={stagger.styles[i]} key={i}>{item}</div>
 *   ))}
 * </div>
 */
export function useStagger(options: UseStaggerOptions): UseStaggerReturn {
  const {
    count,
    staggerDelay = 100,
    baseDelay = 0,
    duration = 700,
    motionType = 'fadeIn',
    threshold = 0.1,
    easing = 'ease-out',
  } = options

  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.disconnect()
          }
        })
      },
      { threshold }
    )

    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
    }
  }, [threshold])

  const initialTransform = useMemo(() => getInitialTransform(motionType), [motionType])

  const styles = useMemo<CSSProperties[]>(() => {
    return Array.from({ length: count }, (_, i) => {
      const itemDelay = baseDelay + i * staggerDelay

      if (!isVisible) {
        return {
          opacity: 0,
          transform: initialTransform,
          transition: `opacity ${duration}ms ${easing} ${itemDelay}ms, transform ${duration}ms ${easing} ${itemDelay}ms`,
        }
      }

      return {
        opacity: 1,
        transform: 'none',
        transition: `opacity ${duration}ms ${easing} ${itemDelay}ms, transform ${duration}ms ${easing} ${itemDelay}ms`,
      }
    })
  }, [count, isVisible, staggerDelay, baseDelay, duration, motionType, easing, initialTransform])

  return {
    containerRef,
    styles,
    isVisible,
  }
}
