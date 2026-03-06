"use client"

import React, { useRef } from 'react'
import { mergeStyles, resolveDot } from '../../../hooks/useDotMap'
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
  /** dot 유틸리티 스타일 */
  dot?: string
  /** 인라인 스타일 */
  style?: React.CSSProperties
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
  dot: dotProp,
  style,
  children,
}: BlogEditorRootProps) {
  const { showPreview, error, variant, features } = useBlogEditor()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // variant별 컨테이너 스타일
  const containerVariantStyle: React.CSSProperties =
    variant === 'glass'
      ? {
          background: 'linear-gradient(to bottom right, rgb(243,244,246), rgb(229,231,235))',
        }
      : {}

  const containerStyle = mergeStyles(
    variant === 'glass' ? containerVariantStyle : variant === 'minimal' ? {} : resolveDot('bg-muted'),
    resolveDot(dotProp),
    style
  )

  // variant별 콘텐츠 컨테이너 스타일
  const contentContainerStyle: React.CSSProperties =
    variant === 'glass'
      ? {
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '0.75rem',
          overflow: 'hidden',
        }
      : variant === 'minimal'
        ? mergeStyles(resolveDot('rounded-xl overflow-hidden bg-transparent border border-border'))
        : mergeStyles(resolveDot('rounded-xl overflow-hidden bg-background'))

  const innerStyle = mergeStyles(
    resolveDot('mx-auto px-4 py-8'),
    maxWidth ? resolveDot(maxWidth) : undefined
  )

  // 커스텀 자식 요소가 있으면 그걸 렌더링
  if (children) {
    return (
      <div style={containerStyle}>
        <div style={innerStyle}>
          {children}
        </div>
      </div>
    )
  }

  // 기본 레이아웃
  return (
    <div style={containerStyle}>
      <div style={innerStyle}>
        {/* 헤더 */}
        <BlogEditorHeader onBack={onBack} backLink={backLink} />

        {/* 에러 메시지 */}
        {error && (
          <div style={mergeStyles(
            resolveDot('mb-6 p-4 border rounded-lg'),
            {
              background: 'rgb(254,242,242)',
              borderColor: 'rgb(254,202,202)',
              color: 'rgb(220,38,38)',
            }
          )}>
            {error}
          </div>
        )}

        <div style={resolveDot('space-y-6')}>
          {/* 메타데이터 */}
          <BlogEditorMetadata />

          {/* 콘텐츠 영역 */}
          <div style={contentContainerStyle}>
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
      dot,
      style,
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
            dot={dot}
            style={style}
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
