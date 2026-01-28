"use client"

import React from 'react'
import { merge } from '../../../lib/utils'
import { Icon } from '../../Icon'
import { useBlogEditor } from './BlogEditorContext'

/**
 * BlogEditorHeader Props
 */
export interface BlogEditorHeaderProps {
  /** 뒤로가기 콜백 / Back navigation callback */
  onBack?: () => void
  /** 뒤로가기 링크 컴포넌트 / Back link component */
  backLink?: React.ReactNode
  /** 추가 CSS 클래스 / Additional CSS classes */
  className?: string
}

/**
 * BlogEditorHeader 컴포넌트
 * 에디터 헤더 (제목 + 미리보기 토글)
 */
const BlogEditorHeader = React.forwardRef<HTMLElement, BlogEditorHeaderProps>(
  ({ onBack, backLink, className }, ref) => {
    const { labels, showPreview, setShowPreview, features, isEditMode, formData } = useBlogEditor()

    return (
      <header
        ref={ref}
        className={merge('flex items-center justify-between mb-8', className)}
      >
        <div className="flex items-center gap-4">
          {backLink || (
            onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                aria-label="뒤로가기"
              >
                <Icon name="chevronLeft" size={24} />
              </button>
            )
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? labels.editTitle : labels.pageTitle}
            </h1>
            {isEditMode && formData.slug && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {labels.slugPrefix}{formData.slug}
              </p>
            )}
          </div>
        </div>

        {features.enablePreview && (
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Icon name={showPreview ? 'pencil' : 'eye'} size={16} />
            {showPreview ? labels.editMode : labels.preview}
          </button>
        )}
      </header>
    )
  }
)

BlogEditorHeader.displayName = 'BlogEditorHeader'

export { BlogEditorHeader }
