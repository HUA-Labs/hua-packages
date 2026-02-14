import { useState, useEffect, useRef, useCallback } from 'react'

export interface TypewriterOptions {
  /** 타이핑할 텍스트 */
  text: string
  /** 글자당 딜레이 (ms) @default 50 */
  speed?: number
  /** 시작 딜레이 (ms) @default 0 */
  delay?: number
  /** 활성화 여부 @default true */
  enabled?: boolean
  /** 완료 콜백 */
  onComplete?: () => void
}

export interface TypewriterReturn {
  /** 현재 표시 중인 텍스트 */
  displayText: string
  /** 타이핑 진행 중 여부 */
  isTyping: boolean
  /** 진행률 (0-1) */
  progress: number
  /** 타이핑 재시작 */
  restart: () => void
}

/**
 * useTypewriter - 타이핑 효과 훅
 *
 * @example
 * ```tsx
 * const { displayText, isTyping } = useTypewriter({ text: 'Hello, world!' })
 * return <h1>{displayText}<span className="animate-pulse">|</span></h1>
 * ```
 */
export function useTypewriter(options: TypewriterOptions): TypewriterReturn {
  const { text, speed = 50, delay = 0, enabled = true, onComplete } = options

  const [index, setIndex] = useState(0)
  const [started, setStarted] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const restart = useCallback(() => {
    setIndex(0)
    setStarted(false)
  }, [])

  // Delay before starting
  useEffect(() => {
    if (!enabled) return

    const id = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(id)
  }, [enabled, delay])

  // Typing animation
  useEffect(() => {
    if (!started || !enabled) return
    if (index >= text.length) {
      onComplete?.()
      return
    }

    timerRef.current = setTimeout(() => {
      setIndex(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [started, enabled, index, text.length, speed, onComplete])

  // Reset when text changes
  useEffect(() => {
    setIndex(0)
    setStarted(false)
  }, [text])

  return {
    displayText: text.slice(0, index),
    isTyping: started && index < text.length,
    progress: text.length > 0 ? index / text.length : 0,
    restart,
  }
}
