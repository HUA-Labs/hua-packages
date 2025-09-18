"use client"

import * as React from "react"
import { cn } from "../lib/utils"

export interface LanguageToggleProps {
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "button" | "icon" | "dropdown"
  showLabel?: boolean
  languages?: Array<{
    code: string
    name: string
    flag?: string
  }>
  currentLanguage?: string
  onLanguageChange?: (language: string) => void
}

const LanguageToggle = React.forwardRef<HTMLDivElement, LanguageToggleProps>(
  ({ 
    className,
    size = "md",
    variant = "button",
    showLabel = false,
    languages = [
      { code: "ko", name: "한국어", flag: "🇰🇷" },
      { code: "en", name: "English", flag: "🇺🇸" },
      { code: "ja", name: "日本語", flag: "🇯🇵" },
      { code: "zh", name: "中文", flag: "🇨🇳" }
    ],
    currentLanguage = "ko",
    onLanguageChange,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const dropdownRef = React.useRef<HTMLDivElement>(null)

    const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0]

    const sizeClasses = {
      sm: "h-10 w-10", // 40px - 더 넉넉한 크기
      md: "h-12 w-12", // 48px - 더 넉넉한 크기
      lg: "h-14 w-14" // 56px - 더 넉넉한 크기
    }

    const iconSizes = {
      sm: 16,
      md: 20,
      lg: 24
    }

    // 외부 클릭 시 드롭다운 닫기
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside)
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }, [isOpen])

    const handleLanguageChange = (languageCode: string) => {
      onLanguageChange?.(languageCode)
      setIsOpen(false)
    }

    const renderIcon = () => (
      <div className="flex items-center justify-center">
        <span className="text-lg">{currentLang.flag}</span>
      </div>
    )

    if (variant === "icon") {
      return (
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "inline-flex items-center justify-center rounded-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2",
              sizeClasses[size],
              className
            )}
            {...props}
          >
            {renderIcon()}
          </button>

          {isOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={cn(
                    "w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center gap-3", // 16px, 12px 패딩, 12px 간격
                    currentLanguage === language.code && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  )}
                >
                  <span className="text-lg">{language.flag}</span>
                  <span className="text-sm font-medium">{language.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (variant === "dropdown") {
      return (
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "inline-flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2", // 12px 간격, 16px, 12px 패딩
              className
            )}
            {...props}
          >
            <span className="text-lg">{currentLang.flag}</span>
            {showLabel && <span>{currentLang.name}</span>}
            <svg
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={cn(
                    "w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center gap-3", // 16px, 12px 패딩, 12px 간격
                    currentLanguage === language.code && "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  )}
                >
                  <span className="text-lg">{language.flag}</span>
                  <span className="text-sm font-medium">{language.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )
    }

    // 기본 버튼 형태
    return (
      <button
        onClick={() => {
          const currentIndex = languages.findIndex(lang => lang.code === currentLanguage)
          const nextIndex = (currentIndex + 1) % languages.length
          onLanguageChange?.(languages[nextIndex].code)
        }}
        className={cn(
          "inline-flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2", // 12px 간격, 16px, 12px 패딩
          className
        )}
        {...props}
      >
        <span className="text-lg">{currentLang.flag}</span>
        {showLabel && <span>{currentLang.name}</span>}
      </button>
    )
  }
)
LanguageToggle.displayName = "LanguageToggle"

export { LanguageToggle } 