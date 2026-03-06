"use client"

import React from 'react'
import { mergeStyles, resolveDot } from '../../../hooks/useDotMap'
import { useBlogEditor } from './BlogEditorContext'

/**
 * BlogEditorContent Props
 */
export interface BlogEditorContentProps {
  /** dot 유틸리티 스타일 */
  dot?: string
  /** 인라인 스타일 */
  style?: React.CSSProperties
  /** textarea ref 콜백 / textarea ref callback */
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>
}

/**
 * BlogEditorContent 컴포넌트
 * 제목, 요약, 본문 입력 필드
 */
const BlogEditorContent = React.forwardRef<HTMLDivElement, BlogEditorContentProps>(
  ({ dot, style, textareaRef }, ref) => {
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
      slugManuallyEdited,
    } = useBlogEditor()

    const isPrimaryLanguage = languages.find((l) => l.isPrimary)?.key === activeLanguage
    const currentLang = languages.find((l) => l.key === activeLanguage)

    const inputStyle = resolveDot(
      'w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-1 focus:ring-ring focus:border-transparent transition-colors'
    )

    const labelStyle = resolveDot('block text-sm font-medium text-foreground mb-1')

    const handleTitleChange = (value: string) => {
      updateMultilingualField('title', activeLanguage, value)

      // 영어 탭에서 타이틀 입력 시 슬러그 자동 생성
      // (한국어/일본어보다 영어 슬러그가 URL에 적합)
      if (activeLanguage === 'en' && !isEditMode && !slugManuallyEdited) {
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
      <div
        ref={ref}
        style={mergeStyles(resolveDot('p-6 space-y-4'), resolveDot(dot), style)}
      >
        {/* 제목 */}
        <div>
          <label style={labelStyle}>{getLangLabel(labels.titleLabel)}</label>
          <input
            type="text"
            value={formData.title[activeLanguage] || ''}
            onChange={(e) => handleTitleChange(e.target.value)}
            style={inputStyle}
            placeholder={labels.titlePlaceholder}
          />
        </div>

        {/* 요약 */}
        {features.enableExcerpt && (
          <div>
            <label style={labelStyle}>{getLangLabel(labels.excerpt)}</label>
            <textarea
              value={formData.excerpt[activeLanguage] || ''}
              onChange={(e) => updateMultilingualField('excerpt', activeLanguage, e.target.value)}
              rows={2}
              style={mergeStyles(inputStyle, { resize: 'none' })}
              placeholder={labels.excerptPlaceholder}
            />
          </div>
        )}

        {/* 본문 */}
        <div>
          <label style={labelStyle}>
            {getLangLabel(labels.contentLabel)} (마크다운)
          </label>
          <textarea
            ref={textareaRef}
            value={formData.content[activeLanguage] || ''}
            onChange={(e) => updateMultilingualField('content', activeLanguage, e.target.value)}
            rows={15}
            style={mergeStyles(inputStyle, { fontFamily: 'monospace', fontSize: '0.875rem', resize: 'vertical', minHeight: '300px' })}
            placeholder={labels.contentPlaceholder}
          />
        </div>
      </div>
    )
  }
)

BlogEditorContent.displayName = 'BlogEditorContent'

export { BlogEditorContent }
