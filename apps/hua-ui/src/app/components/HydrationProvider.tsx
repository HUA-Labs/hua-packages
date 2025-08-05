'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface HydrationContextType {
  isHydrated: boolean
  isClient: boolean
}

const HydrationContext = createContext<HydrationContextType>({
  isHydrated: false,
  isClient: false,
})

export function useHydrationContext() {
  return useContext(HydrationContext)
}

interface HydrationProviderProps {
  children: React.ReactNode
}

export function HydrationProvider({ children }: HydrationProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // 하이드레이션 완료 감지
    const handleHydrationComplete = () => {
      setIsHydrated(true)
      document.documentElement.classList.add('hydrated')
    }

    // 이미 로드된 경우
    if (document.readyState === 'complete') {
      handleHydrationComplete()
    } else {
      window.addEventListener('load', handleHydrationComplete)
      return () => window.removeEventListener('load', handleHydrationComplete)
    }
  }, [])

  return (
    <HydrationContext.Provider value={{ isHydrated, isClient }}>
      {children}
    </HydrationContext.Provider>
  )
} 