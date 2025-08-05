import { useRef, useEffect, useCallback, useState } from 'react'

type AnimationType = 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'bounceIn'

interface ScrollRevealOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  delay?: number
  animationType?: AnimationType
}

export function useScrollReveal(options: ScrollRevealOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
    delay = 0,
    animationType = 'fadeIn'
  } = options

  const elementRef = useRef<HTMLElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)

  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && (!triggerOnce || !hasTriggered)) {
        setTimeout(() => {
          setIsVisible(true)
          setHasTriggered(true)
        }, delay)
      }
    })
  }, [triggerOnce, hasTriggered, delay])

  useEffect(() => {
    if (!elementRef.current) return

    const observer = new IntersectionObserver(observerCallback, {
      threshold,
      rootMargin
    })

    observer.observe(elementRef.current)

    return () => {
      observer.disconnect()
    }
  }, [observerCallback, threshold, rootMargin])

  // 애니메이션 스타일 생성
  const getAnimationStyle = () => {
    const baseTransition = 'all 700ms ease-out'
    
    if (!isVisible) {
      switch (animationType) {
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
    
    return {
      opacity: 1,
      transform: 'none',
      transition: baseTransition
    }
  }

  return {
    ref: elementRef,
    isVisible,
    style: getAnimationStyle()
  }
} 