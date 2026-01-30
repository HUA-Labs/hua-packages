"use client"

import React, { useRef } from 'react'
import { merge } from '../../../lib/utils'
import { BlogEditorProvider, useBlogEditor } from './BlogEditorContext'
import { BlogEditorHeader, type BlogEditorHeaderProps } from './BlogEditorHeader'
import { BlogEditorMetadata, type BlogEditorMetadataProps } from './BlogEditorMetadata'
import { BlogEditorLanguageTabs, type BlogEditorLanguageTabsProps } from './BlogEditorLanguageTabs'
import { BlogEditorContent, type BlogEditorContentProps } from './BlogEditorContent'
import { BlogEditorToolbar, type BlogEditorToolbarProps } from './BlogEditorToolbar'
import { BlogEditorPreview, type BlogEditorPreviewProps } from './BlogEditorPreview'
import { BlogEditorActions, type BlogEditorActionsProps } from './BlogEditorActions'
import { BlogEditorTranslate, type BlogEditorTranslateProps } from './BlogEditorTranslate'
import type { BlogEditorProps } from './types'

/**
 * BlogEditorRoot Props (내부 컴포넌트)
 */
interface BlogEditorRootProps {
  /** 뒤로가기 콜백 / Back navigation callback */
  onBack?: () => void
  /** 뒤로가기 링크 컴포넌트 / Back link component */
  backLink?: React.ReactNode
  /** 취소 링크 컴포넌트 / Cancel link component */
  cancelLink?: React.ReactNode
  /** 커스텀 마크다운 렌더러 / Custom markdown renderer */
  renderMarkdown?: (content: string) => React.ReactNode
  /** AI 번역 힌트 / AI translation hint */
  translateHint?: string
  /** 최대 너비 / Max width */
  maxWidth?: string
  /** 추가 CSS 클래스 / Additional CSS classes */
  className?: string
  /** 자식 요소 / Children */
  children?: React.ReactNode
}

/**
 * BlogEditorRoot 내부 컴포넌트
 * 기본 레이아웃 제공
 */
function BlogEditorRoot({
  onBack,
  backLink,
  cancelLink,
  renderMarkdown,
  translateHint,
  maxWidth = 'max-w-4xl',
  className,
  children,
}: BlogEditorRootProps) {
  const { showPreview, error, variant, features } = useBlogEditor()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const containerClasses = merge(
    variant === 'glass'
      ? 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800'
      : variant === 'minimal'
        ? ''
        : 'bg-gray-50 dark:bg-gray-900'
  )

  const contentContainerClasses = merge(
    'rounded-xl overflow-hidden',
    variant === 'glass'
      ? 'bg-white/10 backdrop-blur-sm border border-white/20 dark:bg-slate-800/20 dark:border-slate-700/50'
      : variant === 'minimal'
        ? 'bg-transparent border border-gray-200 dark:border-gray-700'
        : 'bg-white dark:bg-gray-800'
  )

  // 커스텀 자식 요소가 있으면 그걸 렌더링
  if (children) {
    return (
      <div className={merge(containerClasses, className)}>
        <div className={merge(maxWidth, 'mx-auto px-4 py-8')}>
          {children}
        </div>
      </div>
    )
  }

  // 기본 레이아웃
  return (
    <div className={merge(containerClasses, className)}>
      <div className={merge(maxWidth, 'mx-auto px-4 py-8')}>
        {/* 헤더 */}
        <BlogEditorHeader onBack={onBack} backLink={backLink} />

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* 메타데이터 */}
          <BlogEditorMetadata />

          {/* 콘텐츠 영역 */}
          <div className={contentContainerClasses}>
            {/* AI 번역 */}
            {features.enableTranslation && (
              <BlogEditorTranslate hint={translateHint} />
            )}

            {/* 언어 탭 */}
            <BlogEditorLanguageTabs />

            {/* 툴바 & 콘텐츠 */}
            {showPreview ? (
              <BlogEditorPreview renderMarkdown={renderMarkdown} />
            ) : (
              <>
                {features.enableMarkdownToolbar && (
                  <BlogEditorToolbar textareaRef={textareaRef} />
                )}
                <BlogEditorContent textareaRef={textareaRef} />
              </>
            )}
          </div>

          {/* 액션 버튼 */}
          <BlogEditorActions cancelLink={cancelLink} />
        </div>
      </div>
    </div>
  )
}

/**
 * BlogEditor 컴포넌트
 *
 * 다국어 블로그 에디터 컴포넌트
 * Compound component 패턴으로 유연한 커스터마이징 지원
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <BlogEditor
 *   callbacks={{
 *     onSave: async (data, publish) => { ... },
 *     onCancel: () => router.back(),
 *   }}
 * />
 *
 * // 커스텀 레이아웃
 * <BlogEditor callbacks={...}>
 *   <BlogEditor.Header backLink={<Link href="/admin">Back</Link>} />
 *   <BlogEditor.Metadata />
 *   <BlogEditor.LanguageTabs />
 *   <BlogEditor.Content />
 *   <BlogEditor.Actions />
 * </BlogEditor>
 * ```
 */
const BlogEditor = React.forwardRef<
  HTMLDivElement,
  BlogEditorProps & BlogEditorRootProps
>(
  (
    {
      // BlogEditorProps
      initialData,
      isEditMode,
      languages,
      defaultLanguage,
      labels,
      callbacks,
      features,
      variant,

      // BlogEditorRootProps
      onBack,
      backLink,
      cancelLink,
      renderMarkdown,
      translateHint,
      maxWidth,
      className,
      children,

      // Auto-save
      autoSaveKey,
      autoSaveInterval,
    },
    ref
  ) => {
    return (
      <BlogEditorProvider
        initialData={initialData}
        isEditMode={isEditMode}
        languages={languages}
        defaultLanguage={defaultLanguage}
        labels={labels}
        callbacks={callbacks}
        features={features}
        variant={variant}
        autoSaveKey={autoSaveKey}
        autoSaveInterval={autoSaveInterval}
      >
        <div ref={ref}>
          <BlogEditorRoot
            onBack={onBack}
            backLink={backLink}
            cancelLink={cancelLink}
            renderMarkdown={renderMarkdown}
            translateHint={translateHint}
            maxWidth={maxWidth}
            className={className}
          >
            {children}
          </BlogEditorRoot>
        </div>
      </BlogEditorProvider>
    )
  }
)

BlogEditor.displayName = 'BlogEditor'

// Compound component exports
const BlogEditorCompound = BlogEditor as typeof BlogEditor & {
  Header: typeof BlogEditorHeader
  Metadata: typeof BlogEditorMetadata
  LanguageTabs: typeof BlogEditorLanguageTabs
  Content: typeof BlogEditorContent
  Toolbar: typeof BlogEditorToolbar
  Preview: typeof BlogEditorPreview
  Actions: typeof BlogEditorActions
  Translate: typeof BlogEditorTranslate
}

BlogEditorCompound.Header = BlogEditorHeader
BlogEditorCompound.Metadata = BlogEditorMetadata
BlogEditorCompound.LanguageTabs = BlogEditorLanguageTabs
BlogEditorCompound.Content = BlogEditorContent
BlogEditorCompound.Toolbar = BlogEditorToolbar
BlogEditorCompound.Preview = BlogEditorPreview
BlogEditorCompound.Actions = BlogEditorActions
BlogEditorCompound.Translate = BlogEditorTranslate

export { BlogEditorCompound as BlogEditor }

// 개별 컴포넌트도 export
export {
  BlogEditorHeader,
  BlogEditorMetadata,
  BlogEditorLanguageTabs,
  BlogEditorContent,
  BlogEditorToolbar,
  BlogEditorPreview,
  BlogEditorActions,
  BlogEditorTranslate,
}

// 타입 export
export type {
  BlogEditorHeaderProps,
  BlogEditorMetadataProps,
  BlogEditorLanguageTabsProps,
  BlogEditorContentProps,
  BlogEditorToolbarProps,
  BlogEditorPreviewProps,
  BlogEditorActionsProps,
  BlogEditorTranslateProps,
}
