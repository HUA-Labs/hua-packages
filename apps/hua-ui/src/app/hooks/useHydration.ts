'use client'

import { useEffect, useState } from 'react'

export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // 하이드레이션 완료 후 상태 업데이트
    const handleHydrationComplete = () => {
      setIsHydrated(true)
      document.documentElement.classList.add('hydrated')
    }

    // 이미 하이드레이션이 완료된 경우
    if (document.readyState === 'complete') {
      handleHydrationComplete()
    } else {
      window.addEventListener('load', handleHydrationComplete)
      return () => window.removeEventListener('load', handleHydrationComplete)
    }
  }, [])

  return { isHydrated, isClient }
}

export function useClientOnly() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
} 