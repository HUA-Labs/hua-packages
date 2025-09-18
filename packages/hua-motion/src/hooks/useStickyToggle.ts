import { useState, useEffect } from 'react'

interface StickyToggleOptions {
  offset?: number
  behavior?: 'smooth' | 'auto'
  showOnMount?: boolean
}

export function useStickyToggle(options: StickyToggleOptions = {}) {
  const { 
    offset = 0, 
    behavior = 'smooth',
    showOnMount = false 
  } = options
  
  const [isSticky, setIsSticky] = useState(showOnMount)
  const [mounted, setMounted] = useState(false)

  // 하이드레이션 이슈 해결을 위한 mounted 상태 관리
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const toggleSticky = () => {
      if (typeof window !== 'undefined') {
        if (window.pageYOffset > offset) {
          setIsSticky(true)
        } else {
          setIsSticky(false)
        }
      }
    }

    // 초기 상태 확인
    toggleSticky()

    // 이벤트 리스너 등록
    window.addEventListener("scroll", toggleSticky, { passive: true })
    window.addEventListener("resize", toggleSticky, { passive: true })

    return () => {
      window.removeEventListener("scroll", toggleSticky)
      window.removeEventListener("resize", toggleSticky)
    }
  }, [offset, mounted])

  return {
    isSticky,
    mounted
  }
}
