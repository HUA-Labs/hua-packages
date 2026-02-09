"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

/**
 * ThemeProvider 컴포넌트의 props / ThemeProvider component props
 * @typedef {Object} ThemeProviderProps
 * @property {React.ReactNode} children - 자식 컴포넌트 / Child components
 * @property {"light" | "dark" | "system"} [defaultTheme="light"] - 기본 테마 / Default theme
 * @property {string} [storageKey="hua-ui-theme"] - localStorage 키 / localStorage key
 * @property {boolean} [enableSystem=true] - 시스템 테마 감지 활성화 / Enable system theme detection
 * @property {boolean} [enableTransition=true] - 테마 전환 애니메이션 활성화 / Enable theme transition animation
 */
export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  enableSystem?: boolean
  enableTransition?: boolean
}

/**
 * ThemeProvider의 상태 타입 / ThemeProvider state type
 * @typedef {Object} ThemeProviderState
 * @property {"light" | "dark" | "system"} theme - 현재 테마 / Current theme
 * @property {(theme: "light" | "dark" | "system") => void} setTheme - 테마 설정 함수 / Theme setter function
 * @property {"light" | "dark"} resolvedTheme - 실제 적용된 테마 (system일 경우 시스템 테마) / Actually applied theme (system theme when system is selected)
 * @property {() => void} toggleTheme - 테마 토글 함수 / Theme toggle function
 */
export interface ThemeProviderState {
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

/**
 * ThemeProvider 컴포넌트 / ThemeProvider component
 * 
 * 테마 관리를 위한 Context Provider 컴포넌트입니다.
 * localStorage에 테마를 저장하고, 시스템 테마를 감지할 수 있습니다.
 * useTheme 훅을 통해 테마 상태에 접근할 수 있습니다.
 * 
 * Context Provider component for theme management.
 * Saves theme to localStorage and can detect system theme.
 * Access theme state through useTheme hook.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * 
 * @example
 * // 커스텀 설정 / Custom settings
 * <ThemeProvider
 *   defaultTheme="dark"
 *   storageKey="my-app-theme"
 *   enableSystem={true}
 *   enableTransition={true}
 * >
 *   <App />
 * </ThemeProvider>
 * 
 * @param {ThemeProviderProps} props - ThemeProvider 컴포넌트의 props / ThemeProvider component props
 * @returns {JSX.Element} ThemeProvider 컴포넌트 / ThemeProvider component
 */
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
      const newTheme = resolvedTheme === "light" ? "dark" : "light"
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, newTheme)
      }
      setTheme(newTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

/**
 * useTheme 훅 / useTheme hook
 * 
 * ThemeProvider의 테마 상태에 접근하는 훅입니다.
 * ThemeProvider 내부에서만 사용할 수 있습니다.
 * 
 * Hook to access ThemeProvider's theme state.
 * Can only be used inside ThemeProvider.
 * 
 * @example
 * const { theme, setTheme, resolvedTheme, toggleTheme } = useTheme()
 * 
 * @returns {ThemeProviderState} 테마 상태와 함수들 / Theme state and functions
 * @throws {Error} ThemeProvider 외부에서 사용 시 에러 발생 / Error when used outside ThemeProvider
 */
export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
} 