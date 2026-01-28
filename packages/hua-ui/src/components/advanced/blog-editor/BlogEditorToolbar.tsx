"use client"

import React, { useCallback } from 'react'
import { merge } from '../../../lib/utils'
import { Icon } from '../../Icon'
import { useBlogEditor } from './BlogEditorContext'
import { insertMarkdown } from './utils/markdown'
import type { ToolbarItem } from './types'

/**
 * BlogEditorToolbar Props
 */
export interface BlogEditorToolbarProps {
  /** textarea ref / textarea reference */
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  /** 추가 CSS 클래스 / Additional CSS classes */
  className?: string
}

/**
 * 툴바 아이템 정의 / Toolbar item definitions
 */
const TOOLBAR_ITEMS: ToolbarItem[] = [
  {
    icon: 'bold',
    label: 'bold',
    markdown: { before: '**', after: '**' },
    shortcut: 'Ctrl+B',
  },
  {
    icon: 'italic',
    label: 'italic',
    markdown: { before: '*', after: '*' },
    shortcut: 'Ctrl+I',
  },
  {
    icon: 'strikethrough',
    label: 'strikethrough',
    markdown: { before: '~~', after: '~~' },
  },
  {
    icon: 'heading',
    label: 'heading',
    markdown: { before: '## ', after: '' },
  },
  {
    icon: 'link',
    label: 'link',
    markdown: { before: '[', after: '](url)' },
    shortcut: 'Ctrl+K',
  },
  {
    icon: 'image',
    label: 'image',
    markdown: { before: '![alt](', after: ')' },
  },
  {
    icon: 'code',
    label: 'code',
    markdown: { before: '`', after: '`' },
  },
  {
    icon: 'fileCode',
    label: 'codeBlock',
    markdown: { before: '```\n', after: '\n```' },
  },
  {
    icon: 'quote',
    label: 'quote',
    markdown: { before: '> ', after: '' },
  },
  {
    icon: 'list',
    label: 'list',
    markdown: { before: '- ', after: '' },
  },
  {
    icon: 'listOrdered',
    label: 'orderedList',
    markdown: { before: '1. ', after: '' },
  },
  {
    icon: 'minus',
    label: 'horizontalRule',
    markdown: { before: '\n---\n', after: '' },
  },
]

/**
 * BlogEditorToolbar 컴포넌트
 * 마크다운 포맷팅 툴바
 */
const BlogEditorToolbar = React.forwardRef<HTMLDivElement, BlogEditorToolbarProps>(
  ({ textareaRef, className }, ref) => {
    const { labels, activeLanguage, updateMultilingualField, formData, features } = useBlogEditor()

    const handleInsert = useCallback(
      (item: ToolbarItem) => {
        const textarea = textareaRef.current
        if (!textarea) return

        const { selectionStart, selectionEnd } = textarea
        const currentContent = formData.content[activeLanguage] || ''

        const { text: newText, cursorPosition } = insertMarkdown(
          currentContent,
          selectionStart,
          selectionEnd,
          item.markdown.before,
          item.markdown.after
        )

        updateMultilingualField('content', activeLanguage, newText)

        // 커서 위치 복원
        requestAnimationFrame(() => {
          textarea.focus()
          textarea.setSelectionRange(cursorPosition, cursorPosition)
        })
      },
      [textareaRef, formData, activeLanguage, updateMultilingualField]
    )

    if (!features.enableMarkdownToolbar) {
      return null
    }

    return (
      <div
        ref={ref}
        className={merge(
          'flex flex-wrap gap-1 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50',
          className
        )}
        role="toolbar"
        aria-label="마크다운 서식"
      >
        {TOOLBAR_ITEMS.map((item) => (
          <button
            key={item.icon}
            type="button"
            onClick={() => handleInsert(item)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title={`${labels[item.label as keyof typeof labels] || item.label}${item.shortcut ? ` (${item.shortcut})` : ''}`}
            aria-label={labels[item.label as keyof typeof labels] || item.label}
          >
            <Icon name={item.icon as Parameters<typeof Icon>[0]['name']} size={16} />
          </button>
        ))}
      </div>
    )
  }
)

BlogEditorToolbar.displayName = 'BlogEditorToolbar'

export { BlogEditorToolbar }
