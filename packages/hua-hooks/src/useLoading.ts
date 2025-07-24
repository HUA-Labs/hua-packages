import { useState, useCallback } from 'react'

export interface UseLoadingOptions {
  initialLoading?: boolean
  delay?: number
}

export interface UseLoadingReturn {
  isLoading: boolean
  loadingMessage: string
  startLoading: (message?: string) => void
  stopLoading: () => void
  withLoading: <T>(asyncFn: () => Promise<T>, message?: string) => Promise<T>
}

/**
 * 로딩 상태를 관리하는 훅
 */
export function useLoading(options: UseLoadingOptions = {}): UseLoadingReturn {
  const { initialLoading = false, delay = 0 } = options
  const [isLoading, setIsLoading] = useState(initialLoading)
  const [loadingMessage, setLoadingMessage] = useState<string>('')

  const startLoading = useCallback((message?: string) => {
    if (delay > 0) {
      setTimeout(() => {
        setIsLoading(true)
        if (message) setLoadingMessage(message)
      }, delay)
    } else {
      setIsLoading(true)
      if (message) setLoadingMessage(message)
    }
  }, [delay])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
    setLoadingMessage('')
  }, [])

  const withLoading = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    message?: string
  ): Promise<T> => {
    try {
      startLoading(message)
      const result = await asyncFn()
      return result
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading])

  return {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading,
    withLoading,
  }
} 