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
    const { labels, isEditMode, formData } = useBlogEditor()

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
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="뒤로가기"
              >
                <Icon name="chevronLeft" size={24} />
              </button>
            )
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEditMode ? labels.editTitle : labels.pageTitle}
            </h1>
            {isEditMode && formData.slug && (
              <p className="text-sm text-muted-foreground">
                {labels.slugPrefix}{formData.slug}
              </p>
            )}
          </div>
        </div>
      </header>
    )
  }
)

BlogEditorHeader.displayName = 'BlogEditorHeader'

export { BlogEditorHeader }
