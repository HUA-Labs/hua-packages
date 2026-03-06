"use client"

import React, { useState, useCallback, useRef, KeyboardEvent, ChangeEvent } from 'react'
import { mergeStyles, resolveDot } from '../../../hooks/useDotMap'
import { Icon } from '../../Icon'
import { useBlogEditor } from './BlogEditorContext'
import { normalizeSlug } from './utils/slug'

/**
 * BlogEditorMetadata Props
 */
export interface BlogEditorMetadataProps {
  /** dot 유틸리티 스타일 */
  dot?: string
  /** 인라인 스타일 */
  style?: React.CSSProperties
}

/**
 * BlogEditorMetadata 컴포넌트
 * 메타데이터 필드 (슬러그, 태그, 커버 이미지, 발행일)
 */
const BlogEditorMetadata = React.forwardRef<HTMLDivElement, BlogEditorMetadataProps>(
  ({ dot, style }, ref) => {
    const { formData, updateField, features, labels, variant, handleUploadImage, uploading, setSlugManuallyEdited } = useBlogEditor()
    const [tagInput, setTagInput] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    // variant별 컨테이너 스타일
    const containerVariantStyle: React.CSSProperties =
      variant === 'glass'
        ? {
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.2)',
          }
        : variant === 'minimal'
          ? { background: 'transparent' }
          : {}

    const containerStyle = mergeStyles(
      resolveDot('rounded-xl p-6 space-y-4'),
      variant !== 'glass' && variant !== 'minimal' ? resolveDot('bg-background') : undefined,
      containerVariantStyle,
      resolveDot(dot),
      style
    )

    const inputStyle = resolveDot(
      'w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-1 focus:ring-ring focus:border-transparent transition-colors'
    )

    const labelStyle = resolveDot('block text-sm font-medium text-foreground mb-1')

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
      <div ref={ref} style={containerStyle}>
        <h2 style={resolveDot('font-semibold text-foreground')}>{labels.basicInfo}</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, minmax(0, 1fr))', gap: '1rem' }}>
          {/* 슬러그 */}
          {features.enableSlug && (
            <div>
              <label style={labelStyle}>
                {labels.slug} *
              </label>
              <div style={resolveDot('flex items-center')}>
                <span style={resolveDot('text-muted-foreground mr-1 text-sm')}>
                  {labels.slugPrefix}
                </span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => {
                    updateField('slug', normalizeSlug(e.target.value))
                    setSlugManuallyEdited(true)
                  }}
                  style={mergeStyles(inputStyle, { flex: 1 })}
                  placeholder="my-post-slug"
                />
              </div>
            </div>
          )}

          {/* 태그 */}
          {features.enableTags && (
            <div>
              <label style={labelStyle}>{labels.tags}</label>
              <div style={mergeStyles(
                resolveDot('flex flex-wrap items-center gap-2 min-h-[42px] px-3 py-2 border border-border rounded-lg bg-background transition-colors'),
              )}>
                {/* 태그 칩들 */}
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    style={resolveDot('inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-sm rounded-md')}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      style={resolveDot('transition-colors')}
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
                  style={mergeStyles(resolveDot('bg-transparent text-foreground text-sm'), { flex: 1, minWidth: '100px', outline: 'none' })}
                  placeholder={formData.tags.length === 0 ? labels.tagsPlaceholder : '태그 추가...'}
                />
              </div>
              <p style={resolveDot('mt-1 text-xs text-muted-foreground')}>
                쉼표(,) 또는 Enter로 태그 추가
              </p>
            </div>
          )}
        </div>

        {/* 커버 이미지 */}
        {features.enableCoverImage && (
          <div>
            <label style={labelStyle}>{labels.coverImage}</label>
            <div style={resolveDot('space-y-3')}>
              {/* 이미지 미리보기 */}
              {formData.coverImage && (
                <div style={{ position: 'relative', width: '100%', height: '10rem', borderRadius: '0.5rem', overflow: 'hidden', background: 'var(--muted)' }}>
                  <img
                    src={formData.coverImage}
                    alt="커버 이미지 미리보기"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={() => updateField('coverImage', '')}
                    style={mergeStyles(
                      resolveDot('p-1.5 text-white rounded-full transition-colors'),
                      { position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgb(239,68,68)' }
                    )}
                    aria-label="이미지 삭제"
                  >
                    <Icon name="x" size={14} />
                  </button>
                </div>
              )}

              {/* URL 입력 + 파일 업로드 */}
              <div style={resolveDot('flex gap-2')}>
                <input
                  type="text"
                  value={formData.coverImage}
                  onChange={(e) => updateField('coverImage', e.target.value)}
                  style={mergeStyles(inputStyle, { flex: 1 })}
                  placeholder={labels.coverImagePlaceholder}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
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
                  style={resolveDot('px-3 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors')}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, minmax(0, 1fr))', gap: '1rem' }}>
          {features.enablePublishDate && (
            <div>
              <label style={labelStyle}>{labels.publishDate}</label>
              <input
                type="datetime-local"
                value={formData.publishedAt ?? ''}
                onChange={(e) => updateField('publishedAt', e.target.value || null)}
                style={inputStyle}
              />
              <p style={resolveDot('mt-1 text-sm text-muted-foreground')}>
                {labels.publishDateHint}
              </p>
            </div>
          )}

          {features.enableExpiresAt && (
            <div>
              <label style={labelStyle}>{labels.expiresAt}</label>
              <input
                type="datetime-local"
                value={formData.expiresAt ?? ''}
                onChange={(e) => updateField('expiresAt', e.target.value || null)}
                style={inputStyle}
              />
              <p style={resolveDot('mt-1 text-sm text-muted-foreground')}>
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
