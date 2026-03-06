"use client"

import React from 'react'
import { mergeStyles, resolveDot } from '../../../hooks/useDotMap'
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
  /** dot 유틸리티 스타일 */
  dot?: string
  /** 인라인 스타일 */
  style?: React.CSSProperties
}

/**
 * BlogEditorHeader 컴포넌트
 * 에디터 헤더 (제목 + 미리보기 토글)
 */
const BlogEditorHeader = React.forwardRef<HTMLElement, BlogEditorHeaderProps>(
  ({ onBack, backLink, dot, style }, ref) => {
    const { labels, isEditMode, formData } = useBlogEditor()

    return (
      <header
        ref={ref}
        style={mergeStyles(resolveDot('flex items-center justify-between mb-8'), resolveDot(dot), style)}
      >
        <div style={resolveDot('flex items-center gap-4')}>
          {backLink || (
            onBack && (
              <button
                type="button"
                onClick={onBack}
                style={resolveDot('p-2 text-muted-foreground transition-colors')}
                aria-label="뒤로가기"
              >
                <Icon name="chevronLeft" size={24} />
              </button>
            )
          )}
          <div>
            <h1 style={resolveDot('text-2xl font-bold text-foreground')}>
              {isEditMode ? labels.editTitle : labels.pageTitle}
            </h1>
            {isEditMode && formData.slug && (
              <p style={resolveDot('text-sm text-muted-foreground')}>
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
