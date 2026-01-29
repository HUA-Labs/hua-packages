"use client"

import React from 'react'
import { merge } from '../../../lib/utils'
import { Icon } from '../../Icon'
import { useBlogEditor } from './BlogEditorContext'

/**
 * BlogEditorActions Props
 */
export interface BlogEditorActionsProps {
  /** 취소 링크 컴포넌트 / Cancel link component */
  cancelLink?: React.ReactNode
  /** 추가 CSS 클래스 / Additional CSS classes */
  className?: string
}

/**
 * BlogEditorActions 컴포넌트
 * 저장/발행/취소 버튼
 */
const BlogEditorActions = React.forwardRef<HTMLDivElement, BlogEditorActionsProps>(
  ({ cancelLink, className }, ref) => {
    const { labels, submitting, handleSave, handleCancel, isEditMode, autoSaveStatus, features } = useBlogEditor()

    return (
      <div
        ref={ref}
        className={merge('flex items-center justify-end gap-3', className)}
      >
        {/* 자동저장 상태 */}
        {features.enableAutoSave && autoSaveStatus !== 'idle' && (
          <span className="text-sm text-gray-400 dark:text-gray-500 flex items-center gap-1">
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
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {labels.cancel}
          </button>
        )}

        {/* 임시저장 */}
        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={submitting}
          className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {labels.saveDraft}
        </button>

        {/* 발행/수정 */}
        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={submitting}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 transition-colors"
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
