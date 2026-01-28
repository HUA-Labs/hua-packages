"use client"

import React from 'react'
import { merge } from '../../../lib/utils'
import { useBlogEditor } from './BlogEditorContext'
import { parseMarkdown } from './utils/markdown'

/**
 * BlogEditorPreview Props
 */
export interface BlogEditorPreviewProps {
  /** 커스텀 마크다운 렌더러 / Custom markdown renderer */
  renderMarkdown?: (content: string) => React.ReactNode
  /** 추가 CSS 클래스 / Additional CSS classes */
  className?: string
}

/**
 * BlogEditorPreview 컴포넌트
 * 마크다운 미리보기
 */
const BlogEditorPreview = React.forwardRef<HTMLDivElement, BlogEditorPreviewProps>(
  ({ renderMarkdown, className }, ref) => {
    const { formData, activeLanguage, languages, labels } = useBlogEditor()

    const primaryLanguage = languages.find((l) => l.isPrimary)?.key || languages[0]?.key

    // 현재 언어의 콘텐츠, 없으면 기본 언어 콘텐츠
    const title = formData.title[activeLanguage] || formData.title[primaryLanguage] || labels.noTitle
    const content = formData.content[activeLanguage] || formData.content[primaryLanguage] || ''

    // 마크다운 렌더링
    const renderedContent = React.useMemo(() => {
      if (renderMarkdown) {
        return renderMarkdown(content)
      }
      // 기본 마크다운 파서 사용
      return (
        <div
          dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
        />
      )
    }, [content, renderMarkdown])

    return (
      <div ref={ref} className={merge('p-6', className)}>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
        <div className="prose dark:prose-invert max-w-none">
          {renderedContent}
        </div>
      </div>
    )
  }
)

BlogEditorPreview.displayName = 'BlogEditorPreview'

export { BlogEditorPreview }
