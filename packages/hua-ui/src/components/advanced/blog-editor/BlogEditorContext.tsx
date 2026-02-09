"use client"

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react'
import type {
  BlogEditorContextValue,
  BlogEditorData,
  BlogEditorProps,
  BlogEditorLabels,
  BlogEditorFeatures,
  LanguageConfig,
  MultilingualField,
} from './types'
import { generateSlug as generateSlugUtil } from './utils/slug'

/**
 * 기본 레이블 / Default labels
 */
const DEFAULT_LABELS: BlogEditorLabels = {
  // Header
  pageTitle: '새 글 작성',
  editTitle: '글 수정',
  preview: '미리보기',
  editMode: '편집',

  // Metadata
  basicInfo: '기본 정보',
  slug: '슬러그',
  slugPrefix: '/blog/',
  tags: '태그',
  tagsPlaceholder: '개발, 일상, 업데이트',
  coverImage: '커버 이미지 URL',
  coverImagePlaceholder: 'https://example.com/image.jpg',
  publishDate: '발행 예약일시',
  publishDateHint: '비워두면 즉시 발행됨',
  expiresAt: '만료 일시',
  expiresAtHint: '비워두면 만료되지 않음',

  // Content
  titleLabel: '제목',
  titlePlaceholder: '제목을 입력하세요',
  excerpt: '요약',
  excerptPlaceholder: '카드에 표시될 짧은 요약',
  contentLabel: '본문',
  contentPlaceholder: '마크다운으로 작성하세요...',

  // Actions
  cancel: '취소',
  saveDraft: '임시저장',
  publish: '발행',
  update: '수정 완료',
  saving: '저장 중...',

  // Translation
  translateHint: 'AI 번역 기능',
  translateButton: 'AI 번역',
  translating: '번역 중...',
  translateSuccess: '번역 완료!',

  // Errors
  requiredFields: '필수 필드를 입력해주세요',
  saveError: '저장 중 오류 발생',
  translateError: '번역 중 오류 발생',
  noTitle: '제목 없음',

  // Toolbar
  bold: '굵게',
  italic: '기울임',
  strikethrough: '취소선',
  heading: '제목',
  link: '링크',
  image: '이미지',
  code: '코드',
  codeBlock: '코드블록',
  quote: '인용문',
  list: '목록',
  orderedList: '순서 목록',
  horizontalRule: '수평선',
}

/**
 * 기본 기능 / Default features
 */
const DEFAULT_FEATURES: Required<BlogEditorFeatures> = {
  enableSlug: true,
  enableTags: true,
  enableCoverImage: true,
  enablePublishDate: true,
  enableExcerpt: true,
  enableTranslation: true,
  enablePreview: true,
  enableMarkdownToolbar: true,
  enableAutoSave: true,
  enableExpiresAt: false,
}

/**
 * 기본 언어 / Default languages
 */
const DEFAULT_LANGUAGES: LanguageConfig[] = [
  { key: 'ko', label: '한국어', isPrimary: true, flag: '🇰🇷' },
  { key: 'en', label: 'English', flag: '🇺🇸' },
  { key: 'ja', label: '日本語', flag: '🇯🇵' },
]

/**
 * 빈 다국어 필드 생성 / Create empty multilingual field
 */
function createEmptyMultilingualField(languages: LanguageConfig[]): MultilingualField {
  const field: MultilingualField = {}
  languages.forEach((lang) => {
    field[lang.key] = ''
  })
  return field
}

/**
 * 초기 데이터 생성 / Create initial data
 */
function createInitialData(
  languages: LanguageConfig[],
  initialData?: Partial<BlogEditorData>
): BlogEditorData {
  return {
    slug: initialData?.slug ?? '',
    title: initialData?.title ?? createEmptyMultilingualField(languages),
    excerpt: initialData?.excerpt ?? createEmptyMultilingualField(languages),
    content: initialData?.content ?? createEmptyMultilingualField(languages),
    tags: initialData?.tags ?? [],
    coverImage: initialData?.coverImage ?? '',
    publishedAt: initialData?.publishedAt ?? null,
    expiresAt: initialData?.expiresAt ?? null,
  }
}

/**
 * BlogEditor 컨텍스트 / BlogEditor context
 */
const BlogEditorContext = createContext<BlogEditorContextValue | null>(null)

/**
 * BlogEditor 컨텍스트 훅 / BlogEditor context hook
 */
export function useBlogEditor(): BlogEditorContextValue {
  const context = useContext(BlogEditorContext)
  if (!context) {
    throw new Error('useBlogEditor must be used within a BlogEditorProvider')
  }
  return context
}

/**
 * BlogEditor 프로바이더 Props / BlogEditor provider props
 */
interface BlogEditorProviderProps extends BlogEditorProps {
  children: React.ReactNode
}

/**
 * BlogEditor 프로바이더 / BlogEditor provider
 */
export function BlogEditorProvider({
  children,
  initialData,
  isEditMode = false,
  languages = DEFAULT_LANGUAGES,
  defaultLanguage,
  labels: userLabels,
  callbacks,
  features: userFeatures,
  variant = 'default',
  autoSaveKey,
  autoSaveInterval = 3000,
}: BlogEditorProviderProps) {
  // 언어 설정
  const primaryLanguage = languages.find((l) => l.isPrimary)?.key ?? languages[0]?.key ?? 'ko'
  const initialLanguage = defaultLanguage ?? primaryLanguage

  // 병합된 설정
  const labels = useMemo<BlogEditorLabels>(
    () => ({ ...DEFAULT_LABELS, ...userLabels }),
    [userLabels]
  )
  const features = useMemo<Required<BlogEditorFeatures>>(
    () => ({ ...DEFAULT_FEATURES, ...userFeatures }),
    [userFeatures]
  )

  // 상태
  const [formData, setFormData] = useState<BlogEditorData>(() =>
    createInitialData(languages, initialData)
  )
  const [activeLanguage, setActiveLanguage] = useState(initialLanguage)
  const [showPreview, setShowPreview] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [translateSuccess, setTranslateSuccess] = useState(false)
  // 슬러그가 사용자에 의해 수동 편집되었는지 추적
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditMode || !!initialData?.slug)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isInitialMount = useRef(true)

  // 자동저장 키 생성 / Generate auto-save key
  const storageKey = autoSaveKey || (isEditMode ? null : 'blog-editor-draft')

  // localStorage에서 복원 (새 글 작성 모드만) / Restore from localStorage (create mode only)
  useEffect(() => {
    if (!features.enableAutoSave || !storageKey || isEditMode) return

    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved) as BlogEditorData
        setFormData(parsed)
      }
    } catch {
      // 파싱 실패 시 무시
    }
  }, []) // 마운트 시 한 번만 실행

  // 자동저장 / Auto-save to localStorage
  useEffect(() => {
    if (!features.enableAutoSave || !storageKey) return

    // 초기 마운트 시에는 저장하지 않음
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    // 기존 타이머 취소
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    setAutoSaveStatus('saving')

    // debounce 저장
    autoSaveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(formData))
        setAutoSaveStatus('saved')
        // 3초 후 idle로
        setTimeout(() => setAutoSaveStatus('idle'), 2000)
      } catch {
        setAutoSaveStatus('idle')
      }
    }, autoSaveInterval)

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [formData, features.enableAutoSave, storageKey, autoSaveInterval])

  // 저장 성공 시 localStorage 초기화 / Clear localStorage on successful save
  const clearAutoSave = useCallback(() => {
    if (storageKey) {
      try {
        localStorage.removeItem(storageKey)
      } catch {
        // 무시
      }
    }
  }, [storageKey])

  // 필드 업데이트 / Update field
  const updateField = useCallback(
    <K extends keyof BlogEditorData>(field: K, value: BlogEditorData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  // 다국어 필드 업데이트 / Update multilingual field
  const updateMultilingualField = useCallback(
    (field: 'title' | 'excerpt' | 'content', language: string, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          [language]: value,
        },
      }))
    },
    []
  )

  // 슬러그 생성 / Generate slug
  const generateSlug = useCallback((title: string) => {
    return generateSlugUtil(title)
  }, [])

  // 저장 핸들러 / Save handler
  const handleSave = useCallback(
    async (publish: boolean) => {
      // 유효성 검사
      const primaryTitle = formData.title[primaryLanguage]
      const primaryContent = formData.content[primaryLanguage]

      if (!primaryTitle || !primaryContent) {
        setError(labels.requiredFields)
        return
      }

      if (features.enableSlug && !formData.slug) {
        setError(labels.requiredFields)
        return
      }

      setSubmitting(true)
      setError(null)

      try {
        await callbacks.onSave(formData, publish)
        // 저장 성공 시 자동저장 데이터 삭제
        clearAutoSave()
      } catch (err) {
        setError(labels.saveError)
      } finally {
        setSubmitting(false)
      }
    },
    [formData, primaryLanguage, labels, features, callbacks, clearAutoSave]
  )

  // 번역 핸들러 / Translate handler
  const handleTranslate = useCallback(async () => {
    if (!callbacks.onTranslate) return

    const primaryTitle = formData.title[primaryLanguage]
    const primaryContent = formData.content[primaryLanguage]
    const primaryExcerpt = formData.excerpt[primaryLanguage]

    if (!primaryTitle || !primaryContent) {
      setError(labels.requiredFields)
      return
    }

    setTranslating(true)
    setError(null)
    setTranslateSuccess(false)

    try {
      const translations = await callbacks.onTranslate({
        sourceLanguage: primaryLanguage,
        title: primaryTitle,
        content: primaryContent,
        excerpt: primaryExcerpt || undefined,
      })

      // 번역 결과 적용
      setFormData((prev) => {
        const newTitle = { ...prev.title }
        const newContent = { ...prev.content }
        const newExcerpt = { ...prev.excerpt }

        // translations는 { title: MultilingualField, content: MultilingualField, excerpt: MultilingualField } 형태일 수 있음
        // 또는 단순히 { ko: { title, content, excerpt }, en: { ... }, ja: { ... } } 형태일 수 있음
        // 여기서는 콜백이 언어별 번역을 반환한다고 가정
        Object.keys(translations).forEach((langKey) => {
          if (langKey !== primaryLanguage) {
            const translation = translations[langKey]
            if (typeof translation === 'object' && translation !== null) {
              const trans = translation as { title?: string; content?: string; excerpt?: string }
              if (trans.title) newTitle[langKey] = trans.title
              if (trans.content) newContent[langKey] = trans.content
              if (trans.excerpt) newExcerpt[langKey] = trans.excerpt
            }
          }
        })

        return {
          ...prev,
          title: newTitle,
          content: newContent,
          excerpt: newExcerpt,
        }
      })

      setTranslateSuccess(true)
      setTimeout(() => setTranslateSuccess(false), 3000)
    } catch (err) {
      setError(labels.translateError)
    } finally {
      setTranslating(false)
    }
  }, [formData, primaryLanguage, labels, callbacks])

  // 이미지 업로드 핸들러 / Image upload handler
  const handleUploadImage = useCallback(async (file: File): Promise<string | null> => {
    if (!callbacks.onUploadImage) return null

    setUploading(true)
    setError(null)

    try {
      const url = await callbacks.onUploadImage(file)
      return url
    } catch (err) {
      setError('이미지 업로드 실패')
      return null
    } finally {
      setUploading(false)
    }
  }, [callbacks])

  // 취소 핸들러 / Cancel handler
  const handleCancel = useCallback(() => {
    callbacks.onCancel?.()
  }, [callbacks])

  // 컨텍스트 값
  const value = useMemo<BlogEditorContextValue>(
    () => ({
      // State
      formData,
      activeLanguage,
      showPreview,
      submitting,
      translating,
      uploading,
      error,
      translateSuccess,
      autoSaveStatus,

      // Config
      languages,
      features,
      labels,
      variant,
      isEditMode,

      // Actions
      setActiveLanguage,
      setShowPreview,
      updateField,
      updateMultilingualField,
      handleSave,
      handleTranslate,
      handleUploadImage,
      handleCancel,
      setError,
      generateSlug,
      slugManuallyEdited,
      setSlugManuallyEdited,
    }),
    [
      formData,
      activeLanguage,
      showPreview,
      submitting,
      translating,
      uploading,
      error,
      translateSuccess,
      autoSaveStatus,
      languages,
      features,
      labels,
      variant,
      isEditMode,
      updateField,
      updateMultilingualField,
      handleSave,
      handleTranslate,
      handleUploadImage,
      handleCancel,
      generateSlug,
      slugManuallyEdited,
      setSlugManuallyEdited,
    ]
  )

  return <BlogEditorContext.Provider value={value}>{children}</BlogEditorContext.Provider>
}

export { BlogEditorContext }
