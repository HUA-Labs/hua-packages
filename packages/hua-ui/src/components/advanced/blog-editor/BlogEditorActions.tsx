"use client"

import React from 'react'
import { mergeStyles, resolveDot } from '../../../hooks/useDotMap'
import { Icon } from '../../Icon'
import { useBlogEditor } from './BlogEditorContext'

/**
 * BlogEditorActions Props
 */
export interface BlogEditorActionsProps {
  /** 취소 링크 컴포넌트 / Cancel link component */
  cancelLink?: React.ReactNode
  /** dot 유틸리티 스타일 */
  dot?: string
  /** 인라인 스타일 */
  style?: React.CSSProperties
}

/**
 * BlogEditorActions 컴포넌트
 * 저장/발행/취소 버튼
 */
const BlogEditorActions = React.forwardRef<HTMLDivElement, BlogEditorActionsProps>(
  ({ cancelLink, dot, style }, ref) => {
    const { labels, submitting, handleSave, handleCancel, isEditMode, autoSaveStatus, features } = useBlogEditor()

    return (
      <div
        ref={ref}
        style={mergeStyles(resolveDot('flex items-center justify-end gap-3'), resolveDot(dot), style)}
      >
        {/* 자동저장 상태 */}
        {features.enableAutoSave && autoSaveStatus !== 'idle' && (
          <span style={resolveDot('text-sm text-muted-foreground flex items-center gap-1')}>
            {autoSaveStatus === 'saving' && (
              <>
                <Icon name="loader" size={14} spin />
                저장 중...
              </>
            )}
            {autoSaveStatus === 'saved' && (
              <>
                <Icon name="check" size={14} />
                자동저장됨
              </>
            )}
          </span>
        )}

        {/* 취소 */}
        {cancelLink || (
          <button
            type="button"
            onClick={handleCancel}
            style={resolveDot('px-4 py-2 text-foreground transition-colors')}
          >
            {labels.cancel}
          </button>
        )}

        {/* 임시저장 */}
        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={submitting}
          style={resolveDot('px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors')}
        >
          {labels.saveDraft}
        </button>

        {/* 발행/수정 */}
        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={submitting}
          style={resolveDot('px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 transition-colors')}
        >
          {submitting ? (
            <>
              <Icon name="loader" size={16} spin />
              {labels.saving}
            </>
          ) : (
            <>
              <Icon name="check" size={16} />
              {isEditMode ? labels.update : labels.publish}
            </>
          )}
        </button>
      </div>
    )
  }
)

BlogEditorActions.displayName = 'BlogEditorActions'

export { BlogEditorActions }
