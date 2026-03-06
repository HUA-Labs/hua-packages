"use client"

import React from 'react'
import { mergeStyles, resolveDot } from '../../../hooks/useDotMap'
import { Icon } from '../../Icon'
import { useBlogEditor } from './BlogEditorContext'

/**
 * BlogEditorLanguageTabs Props
 */
export interface BlogEditorLanguageTabsProps {
  /** dot 유틸리티 스타일 */
  dot?: string
  /** 인라인 스타일 */
  style?: React.CSSProperties
}

/**
 * BlogEditorLanguageTabs 컴포넌트
 * 언어 탭 네비게이션 + 미리보기 토글 (sticky)
 */
const BlogEditorLanguageTabs = React.forwardRef<HTMLDivElement, BlogEditorLanguageTabsProps>(
  ({ dot, style }, ref) => {
    const { languages, activeLanguage, setActiveLanguage, showPreview, setShowPreview, features, labels } = useBlogEditor()

    return (
      <div
        ref={ref}
        style={mergeStyles(
          resolveDot('flex items-center border-b border-border bg-background'),
          { position: 'sticky', top: 0, zIndex: 10 },
          resolveDot(dot),
          style
        )}
        role="tablist"
        aria-label="언어 선택"
      >
        <div style={resolveDot('flex flex-1')}>
          {languages.map((lang) => {
            const isActive = activeLanguage === lang.key

            return (
              <button
                key={lang.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${lang.key}`}
                id={`tab-${lang.key}`}
                onClick={() => setActiveLanguage(lang.key)}
                style={mergeStyles(
                  resolveDot('flex-1 px-4 py-3 text-sm font-medium transition-colors'),
                  isActive
                    ? resolveDot('bg-primary/10 text-primary border-b-2 border-primary')
                    : resolveDot('text-muted-foreground hover:bg-muted')
                )}
              >
                {lang.flag && <span style={{ marginRight: '0.375rem' }}>{lang.flag}</span>}
                {lang.label}
                {lang.isPrimary && ' *'}
              </button>
            )
          })}
        </div>

        {features.enablePreview && (
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            style={resolveDot('inline-flex items-center gap-1.5 px-3 py-2 mx-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors shrink-0')}
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
