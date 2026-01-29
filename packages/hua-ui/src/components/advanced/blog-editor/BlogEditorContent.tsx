"use client"

import React from 'react'
import { merge } from '../../../lib/utils'
import { useBlogEditor } from './BlogEditorContext'

/**
 * BlogEditorContent Props
 */
export interface BlogEditorContentProps {
  /** 추가 CSS 클래스 / Additional CSS classes */
  className?: string
  /** textarea ref 콜백 / textarea ref callback */
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>
}

/**
 * BlogEditorContent 컴포넌트
 * 제목, 요약, 본문 입력 필드
 */
const BlogEditorContent = React.forwardRef<HTMLDivElement, BlogEditorContentProps>(
  ({ className, textareaRef }, ref) => {
    const {
      formData,
      activeLanguage,
      updateMultilingualField,
      updateField,
      features,
      labels,
      languages,
      generateSlug,
      isEditMode,
    } = useBlogEditor()

    const isPrimaryLanguage = languages.find((l) => l.isPrimary)?.key === activeLanguage
    const currentLang = languages.find((l) => l.key === activeLanguage)

    const inputClasses =
      'w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors'

    const labelClasses = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'

    const handleTitleChange = (value: string) => {
      updateMultilingualField('title', activeLanguage, value)

      // 기본 언어이고 새 글이면 슬러그 자동 생성
      if (isPrimaryLanguage && !isEditMode && !formData.slug) {
        updateField('slug', generateSlug(value))
      }
    }

    // 언어별 레이블 생성
    const getLangLabel = (baseLabel: string) => {
      if (isPrimaryLanguage) {
        return `${baseLabel} *`
      }
      return `${baseLabel} (${currentLang?.label || activeLanguage})`
    }

    return (
      <div ref={ref} className={merge('p-6 space-y-4', className)}>
        {/* 제목 */}
        <div>
          <label className={labelClasses}>{getLangLabel(labels.titleLabel)}</label>
          <input
            type="text"
            value={formData.title[activeLanguage] || ''}
            onChange={(e) => handleTitleChange(e.target.value)}
            className={inputClasses}
            placeholder={labels.titlePlaceholder}
          />
        </div>

        {/* 요약 */}
        {features.enableExcerpt && (
          <div>
            <label className={labelClasses}>{getLangLabel(labels.excerpt)}</label>
            <textarea
              value={formData.excerpt[activeLanguage] || ''}
              onChange={(e) => updateMultilingualField('excerpt', activeLanguage, e.target.value)}
              rows={2}
              className={merge(inputClasses, 'resize-none')}
              placeholder={labels.excerptPlaceholder}
            />
          </div>
        )}

        {/* 본문 */}
        <div>
          <label className={labelClasses}>
            {getLangLabel(labels.contentLabel)} (마크다운)
          </label>
          <textarea
            ref={textareaRef}
            value={formData.content[activeLanguage] || ''}
            onChange={(e) => updateMultilingualField('content', activeLanguage, e.target.value)}
            rows={15}
            className={merge(inputClasses, 'font-mono text-sm resize-y min-h-[300px]')}
            placeholder={labels.contentPlaceholder}
          />
        </div>
      </div>
    )
  }
)

BlogEditorContent.displayName = 'BlogEditorContent'

export { BlogEditorContent }
