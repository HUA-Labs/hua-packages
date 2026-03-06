"use client"

import React from 'react'
import { mergeStyles, resolveDot } from '../../../hooks/useDotMap'
import { Icon } from '../../Icon'
import { useBlogEditor } from './BlogEditorContext'

/**
 * BlogEditorTranslate Props
 */
export interface BlogEditorTranslateProps {
  /** 힌트 메시지 오버라이드 / Hint message override */
  hint?: string
  /** dot 유틸리티 스타일 */
  dot?: string
  /** 인라인 스타일 */
  style?: React.CSSProperties
}

/**
 * BlogEditorTranslate 컴포넌트
 * AI 번역 버튼
 */
const BlogEditorTranslate = React.forwardRef<HTMLDivElement, BlogEditorTranslateProps>(
  ({ hint, dot, style }, ref) => {
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
        style={mergeStyles(
          resolveDot('px-6 py-3 bg-muted border-b border-border flex items-center justify-between'),
          resolveDot(dot),
          style
        )}
      >
        <div style={resolveDot('flex items-center gap-2 text-sm text-muted-foreground')}>
          <Icon name="sparkles" size={16} />
          <span>{hint || labels.translateHint}</span>
        </div>
        <button
          type="button"
          onClick={handleTranslate}
          disabled={translating || !canTranslate}
          style={mergeStyles(
            resolveDot('inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors'),
            translateSuccess
              ? resolveDot('bg-green-100 text-green-700')
              : resolveDot('bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed')
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
