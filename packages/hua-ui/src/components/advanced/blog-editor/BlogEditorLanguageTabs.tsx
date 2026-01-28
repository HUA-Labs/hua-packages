"use client"

import React from 'react'
import { merge } from '../../../lib/utils'
import { useBlogEditor } from './BlogEditorContext'

/**
 * BlogEditorLanguageTabs Props
 */
export interface BlogEditorLanguageTabsProps {
  /** 추가 CSS 클래스 / Additional CSS classes */
  className?: string
}

/**
 * BlogEditorLanguageTabs 컴포넌트
 * 언어 탭 네비게이션
 */
const BlogEditorLanguageTabs = React.forwardRef<HTMLDivElement, BlogEditorLanguageTabsProps>(
  ({ className }, ref) => {
    const { languages, activeLanguage, setActiveLanguage } = useBlogEditor()

    return (
      <div
        ref={ref}
        className={merge(
          'flex border-b border-gray-200 dark:border-gray-700',
          className
        )}
        role="tablist"
        aria-label="언어 선택"
      >
        {languages.map((lang) => {
          const isActive = activeLanguage === lang.key
          const isPrimary = lang.isPrimary

          return (
            <button
              key={lang.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${lang.key}`}
              id={`tab-${lang.key}`}
              onClick={() => setActiveLanguage(lang.key)}
              className={merge(
                'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              )}
            >
              {lang.flag && <span className="mr-1.5">{lang.flag}</span>}
              {lang.label}
              {isPrimary && ' *'}
            </button>
          )
        })}
      </div>
    )
  }
)

BlogEditorLanguageTabs.displayName = 'BlogEditorLanguageTabs'

export { BlogEditorLanguageTabs }
