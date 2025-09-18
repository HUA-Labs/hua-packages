import { useState, useEffect } from 'react'

interface ScrollToggleOptions {
  threshold?: number
  showOnMount?: boolean
  smooth?: boolean
}

export function useScrollToggle(options: ScrollToggleOptions = {}) {
  const { 
    threshold = 400, 
    showOnMount = false,
    smooth = true 
  } = options
  
  const [isVisible, setIsVisible] = useState(showOnMount)
  const [mounted, setMounted] = useState(false)

  // 하이드레이션 이슈 해결을 위한 mounted 상태 관리
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const toggleVisibility = () => {
      if (typeof window !== 'undefined') {
        if (window.pageYOffset > threshold) {
          setIsVisible(true)
        } else {
          setIsVisible(false)
        }
      }
    }

    // 초기 상태 확인
    toggleVisibility()

    // 이벤트 리스너 등록
    window.addEventListener("scroll", toggleVisibility, { passive: true })
    window.addEventListener("resize", toggleVisibility, { passive: true })

    return () => {
      window.removeEventListener("scroll", toggleVisibility)
      window.removeEventListener("resize", toggleVisibility)
    }
  }, [threshold, mounted])

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      if (smooth) {
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        })
      } else {
        window.scrollTo(0, 0)
      }
    }
  }

  return {
    isVisible,
    scrollToTop,
    mounted
  }
}
