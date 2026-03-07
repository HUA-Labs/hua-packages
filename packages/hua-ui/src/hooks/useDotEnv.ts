"use client"

import { useState, useEffect, useMemo } from "react"
import { useBreakpoint } from "./useBreakpoint"
import type { DotOptions } from "@hua-labs/dot"

/**
 * Detect dark mode by observing `document.documentElement.classList`.
 * Works with any theme provider (ThemeProvider, next-themes, manual toggle).
 */
function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === 'undefined') return false
    return document.documentElement.classList.contains('dark')
  })

  useEffect(() => {
    const el = document.documentElement
    const sync = () => setIsDark(el.classList.contains('dark'))
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(el, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return isDark
}

/**
 * useDotEnv — dot()에 전달할 환경 옵션 (breakpoint + dark) 반환
 *
 * Box/Text/Pressable 내부에서 사용하여 responsive/dark 자동 적용.
 *
 * @example
 * const env = useDotEnv()
 * const styles = dot('p-4 md:p-8 dark:bg-gray-900', env)
 */
export function useDotEnv(): DotOptions {
  const breakpoint = useBreakpoint()
  const isDark = useIsDark()
  return useMemo(() => ({ dark: isDark, breakpoint }), [isDark, breakpoint])
}
