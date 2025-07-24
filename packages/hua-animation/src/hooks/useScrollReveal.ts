import { useRef, useEffect, useCallback, useState } from 'react'

export function useScrollReveal(
  animationHook: () => any,
  options: {
    threshold?: number
    rootMargin?: string
    triggerOnce?: boolean
  } = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true
  } = options

  const elementRef = useRef<HTMLElement | null>(null)
  const [hasTriggered, setHasTriggered] = useState(false)
  const animation = animationHook()

  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && (!triggerOnce || !hasTriggered)) {
        animation.start()
        setHasTriggered(true)
      }
    })
  }, [animation, triggerOnce, hasTriggered])

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

  const setRef = useCallback((element: HTMLElement | null) => {
    elementRef.current = element
    if (animation.ref) {
      animation.ref(element)
    }
  }, [animation])

  return {
    ...animation,
    ref: setRef
  }
} 