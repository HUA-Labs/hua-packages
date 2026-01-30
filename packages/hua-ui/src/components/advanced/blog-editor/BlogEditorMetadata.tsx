"use client"

import React, { useState, useCallback, useRef, KeyboardEvent, ChangeEvent } from 'react'
import { merge } from '../../../lib/utils'
import { Icon } from '../../Icon'
import { useBlogEditor } from './BlogEditorContext'
import { normalizeSlug } from './utils/slug'

/**
 * BlogEditorMetadata Props
 */
export interface BlogEditorMetadataProps {
  /** 추가 CSS 클래스 / Additional CSS classes */
  className?: string
}

/**
 * BlogEditorMetadata 컴포넌트
 * 메타데이터 필드 (슬러그, 태그, 커버 이미지, 발행일)
 */
const BlogEditorMetadata = React.forwardRef<HTMLDivElement, BlogEditorMetadataProps>(
  ({ className }, ref) => {
    const { formData, updateField, features, labels, variant, handleUploadImage, uploading, setSlugManuallyEdited } = useBlogEditor()
    const [tagInput, setTagInput] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const containerClasses = merge(
      'rounded-xl p-6 space-y-4',
      variant === 'glass'
        ? 'bg-white/10 backdrop-blur-sm border border-white/20 dark:bg-slate-800/20 dark:border-slate-700/50'
        : variant === 'minimal'
          ? 'bg-transparent'
          : 'bg-white dark:bg-gray-800',
      className
    )

    const inputClasses =
      'w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-ring focus:border-transparent transition-colors'

    const labelClasses = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'

    // 태그 추가
    const addTag = useCallback((tag: string) => {
      const trimmed = tag.trim()
      if (trimmed && !formData.tags.includes(trimmed)) {
        updateField('tags', [...formData.tags, trimmed])
      }
      setTagInput('')
    }, [formData.tags, updateField])

    // 태그 삭제
    const removeTag = useCallback((tagToRemove: string) => {
      updateField('tags', formData.tags.filter((t) => t !== tagToRemove))
    }, [formData.tags, updateField])

    // 태그 입력 핸들러
    const handleTagInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      // 쉼표 입력 시 태그 추가
      if (value.includes(',')) {
        const parts = value.split(',')
        parts.forEach((part, idx) => {
          if (idx < parts.length - 1) {
            // 마지막이 아닌 부분들은 태그로 추가
            addTag(part)
          } else {
            // 마지막 부분은 입력창에 유지
            setTagInput(part)
          }
        })
      } else {
        setTagInput(value)
      }
    }, [addTag])

    // 키보드 이벤트 핸들러
    const handleTagKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        addTag(tagInput)
      } else if (e.key === 'Backspace' && !tagInput && formData.tags.length > 0) {
        // 입력창이 비어있을 때 Backspace 누르면 마지막 태그 삭제
        removeTag(formData.tags[formData.tags.length - 1])
      }
    }, [tagInput, formData.tags, addTag, removeTag])

    return (
      <div ref={ref} className={containerClasses}>
        <h2 className="font-semibold text-gray-900 dark:text-white">{labels.basicInfo}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 슬러그 */}
          {features.enableSlug && (
            <div>
              <label className={labelClasses}>
                {labels.slug} *
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 dark:text-gray-400 mr-1 text-sm">
                  {labels.slugPrefix}
                </span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => {
                    updateField('slug', normalizeSlug(e.target.value))
                    setSlugManuallyEdited(true)
                  }}
                  className={merge(inputClasses, 'flex-1')}
                  placeholder="my-post-slug"
                />
              </div>
            </div>
          )}

          {/* 태그 */}
          {features.enableTags && (
            <div>
              <label className={labelClasses}>{labels.tags}</label>
              <div className={merge(
                'flex flex-wrap items-center gap-2 min-h-[42px] px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus-within:ring-1 focus-within:ring-ring focus-within:border-transparent transition-colors'
              )}>
                {/* 태그 칩들 */}
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-sm rounded-md"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-indigo-900 dark:hover:text-indigo-100 transition-colors"
                      aria-label={`${tag} 태그 삭제`}
                    >
                      <Icon name="x" size={14} />
                    </button>
                  </span>
                ))}
                {/* 입력창 */}
                <input
                  type="text"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagKeyDown}
                  className="flex-1 min-w-[100px] bg-transparent outline-none text-gray-900 dark:text-white text-sm"
                  placeholder={formData.tags.length === 0 ? labels.tagsPlaceholder : '태그 추가...'}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                쉼표(,) 또는 Enter로 태그 추가
              </p>
            </div>
          )}
        </div>

        {/* 커버 이미지 */}
        {features.enableCoverImage && (
          <div>
            <label className={labelClasses}>{labels.coverImage}</label>
            <div className="space-y-3">
              {/* 이미지 미리보기 */}
              {formData.coverImage && (
                <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={formData.coverImage}
                    alt="커버 이미지 미리보기"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => updateField('coverImage', '')}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    aria-label="이미지 삭제"
                  >
                    <Icon name="x" size={14} />
                  </button>
                </div>
              )}

              {/* URL 입력 + 파일 업로드 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.coverImage}
                  onChange={(e) => updateField('coverImage', e.target.value)}
                  className={merge(inputClasses, 'flex-1')}
                  placeholder={labels.coverImagePlaceholder}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const url = await handleUploadImage(file)
                      if (url) {
                        updateField('coverImage', url)
                      }
                    }
                    // 같은 파일 다시 선택할 수 있도록 초기화
                    e.target.value = ''
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="이미지 업로드"
                >
                  {uploading ? (
                    <Icon name="loader" size={20} spin />
                  ) : (
                    <Icon name="upload" size={20} />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 발행일 & 만료일 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.enablePublishDate && (
            <div>
              <label className={labelClasses}>{labels.publishDate}</label>
              <input
                type="datetime-local"
                value={formData.publishedAt ?? ''}
                onChange={(e) => updateField('publishedAt', e.target.value || null)}
                className={inputClasses}
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {labels.publishDateHint}
              </p>
            </div>
          )}

          {features.enableExpiresAt && (
            <div>
              <label className={labelClasses}>{labels.expiresAt}</label>
              <input
                type="datetime-local"
                value={formData.expiresAt ?? ''}
                onChange={(e) => updateField('expiresAt', e.target.value || null)}
                className={inputClasses}
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {labels.expiresAtHint}
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }
)

BlogEditorMetadata.displayName = 'BlogEditorMetadata'

export { BlogEditorMetadata }
