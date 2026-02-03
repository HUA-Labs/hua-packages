"use client"

import React from 'react'
import { merge } from '../../../lib/utils'
import { Icon } from '../../Icon'
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
 * 언어 탭 네비게이션 + 미리보기 토글 (sticky)
 */
const BlogEditorLanguageTabs = React.forwardRef<HTMLDivElement, BlogEditorLanguageTabsProps>(
  ({ className }, ref) => {
    const { languages, activeLanguage, setActiveLanguage, showPreview, setShowPreview, features, labels } = useBlogEditor()

    return (
      <div
        ref={ref}
        className={merge(
          'flex items-center border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 bg-white dark:bg-gray-800',
          className
        )}
        role="tablist"
        aria-label="언어 선택"
      >
        <div className="flex flex-1">
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
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
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

        {features.enablePreview && (
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-1.5 px-3 py-2 mx-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
          >
            <Icon name={showPreview ? 'pencil' : 'eye'} size={14} />
            {showPreview ? labels.editMode : labels.preview}
          </button>
        )}
      </div>
    )
  }
)

BlogEditorLanguageTabs.displayName = 'BlogEditorLanguageTabs'

export { BlogEditorLanguageTabs }
