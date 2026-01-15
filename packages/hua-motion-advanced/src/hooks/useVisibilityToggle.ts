import { useState, useEffect, useRef } from 'react'

export interface VisibilityToggleConfig {
  threshold?: number // 가시성 변화를 감지할 임계값 (0-1)
  rootMargin?: string // 루트 마진 (CSS 마진 형식)
  trigger?: 'enter' | 'exit' | 'both' // 트리거 조건
  once?: boolean // 한 번만 실행할지 여부
  showOnMount?: boolean
}

export function useVisibilityToggle(options: VisibilityToggleConfig = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    trigger = 'both',
    once = false,
    showOnMount = false
  } = options

  const [isVisible, setIsVisible] = useState(showOnMount)
  const [mounted, setMounted] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  // ref로 상태 추적 (observer callback에서 안정적인 참조 사용)
  const hasTriggeredRef = useRef(false)
  const isVisibleRef = useRef(showOnMount)

  // isVisible 변경 시 ref 동기화
  isVisibleRef.current = isVisible

  // 하이드레이션 이슈 해결을 위한 mounted 상태 관리
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !elementRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isIntersecting = entry.isIntersecting

          // 한 번만 실행하는 경우 체크
          if (once && hasTriggeredRef.current) return

          // 트리거 조건에 따른 가시성 설정
          let shouldBeVisible = isVisibleRef.current

          if (trigger === 'enter' && isIntersecting) {
            shouldBeVisible = true
            if (once) hasTriggeredRef.current = true
          } else if (trigger === 'exit' && !isIntersecting) {
            shouldBeVisible = true
            if (once) hasTriggeredRef.current = true
          } else if (trigger === 'both') {
            shouldBeVisible = isIntersecting
            if (once && isIntersecting) hasTriggeredRef.current = true
          }

          setIsVisible(shouldBeVisible)
        })
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(elementRef.current)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, trigger, once, mounted])

  return {
    ref: elementRef,
    isVisible,
    mounted
  }
}
