import { useRef, useEffect, useState } from 'react'

interface SimpleSlideUpOptions {
  delay?: number
  duration?: number
  distance?: number
  threshold?: number
}

export function useSimpleSlideUp(options: SimpleSlideUpOptions = {}) {
  const { delay = 0, duration = 700, distance = 8, threshold = 0.1 } = options
  const elementRef = useRef<HTMLElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!elementRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
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
  }, [delay, threshold])

  const style = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : `translateY(${distance}px)`,
    transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`
  }

  return {
    ref: elementRef,
    isVisible,
    style
  }
} 