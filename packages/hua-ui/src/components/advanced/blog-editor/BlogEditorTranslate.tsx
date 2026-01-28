"use client"

import React from 'react'
import { merge } from '../../../lib/utils'
import { Icon } from '../../Icon'
import { useBlogEditor } from './BlogEditorContext'

/**
 * BlogEditorTranslate Props
 */
export interface BlogEditorTranslateProps {
  /** 힌트 메시지 오버라이드 / Hint message override */
  hint?: string
  /** 추가 CSS 클래스 / Additional CSS classes */
  className?: string
}

/**
 * BlogEditorTranslate 컴포넌트
 * AI 번역 버튼
 */
const BlogEditorTranslate = React.forwardRef<HTMLDivElement, BlogEditorTranslateProps>(
  ({ hint, className }, ref) => {
    const {
      labels,
      translating,
      translateSuccess,
      handleTranslate,
      formData,
      languages,
      features,
    } = useBlogEditor()

    if (!features.enableTranslation) {
      return null
    }

    const primaryLanguage = languages.find((l) => l.isPrimary)?.key || languages[0]?.key
    const primaryTitle = formData.title[primaryLanguage] || ''
    const primaryContent = formData.content[primaryLanguage] || ''
    const canTranslate = primaryTitle && primaryContent

    return (
      <div
        ref={ref}
        className={merge(
          'px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between',
          className
        )}
      >
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Icon name="sparkles" size={16} />
          <span>{hint || labels.translateHint}</span>
        </div>
        <button
          type="button"
          onClick={handleTranslate}
          disabled={translating || !canTranslate}
          className={merge(
            'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            translateSuccess
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {translating ? (
            <>
              <Icon name="loader" size={16} spin />
              {labels.translating}
            </>
          ) : translateSuccess ? (
            <>
              <Icon name="check" size={16} />
              {labels.translateSuccess}
            </>
          ) : (
            <>
              <Icon name="sparkles" size={16} />
              {labels.translateButton}
            </>
          )}
        </button>
      </div>
    )
  }
)

BlogEditorTranslate.displayName = 'BlogEditorTranslate'

export { BlogEditorTranslate }
