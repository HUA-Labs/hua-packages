"use client"

import * as React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  enableSystem?: boolean
  enableTransition?: boolean
}

interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "light" | "dark"
  toggleTheme: () => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  resolvedTheme: "light",
  toggleTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "light",  // system에서 light로 변경
  storageKey = "hua-ui-theme",
  enableSystem = true,
  enableTransition = true,
  ...props
}: ThemeProviderProps): React.ReactElement {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    // localStorage에서 테마 가져오기 (클라이언트에서만)
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(storageKey) as Theme
      if (savedTheme) {
        setTheme(savedTheme)
      }
    }
  }, [storageKey])

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system" && enableSystem) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      setResolvedTheme(systemTheme)
    } else {
      root.classList.add(theme)
      setResolvedTheme(theme as "light" | "dark")
    }

    if (enableTransition) {
      root.classList.add("transition-colors", "duration-300")
    }
  }, [theme, enableSystem, enableTransition])

  useEffect(() => {
    if (theme === "system" && enableSystem) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

      const handleChange = () => {
        const systemTheme = mediaQuery.matches ? "dark" : "light"
        setResolvedTheme(systemTheme)
        document.documentElement.classList.remove("light", "dark")
        document.documentElement.classList.add(systemTheme)
      }

      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [theme, enableSystem])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, theme)
      }
      setTheme(theme)
    },
    resolvedTheme,
    toggleTheme: () => {
      const newTheme = theme === "light" ? "dark" : "light"
      setTheme(newTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
} 