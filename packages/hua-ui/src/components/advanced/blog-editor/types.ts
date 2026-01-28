/**
 * BlogEditor 컴포넌트 타입 정의
 * BlogEditor component type definitions
 */

/**
 * 다국어 필드 타입 / Multilingual field type
 * 각 언어별로 값을 저장
 */
export interface MultilingualField {
  [languageKey: string]: string
}

/**
 * 언어 설정 / Language configuration
 */
export interface LanguageConfig {
  /** 언어 키 (예: 'ko', 'en', 'ja') / Language key (e.g., 'ko', 'en', 'ja') */
  key: string
  /** 표시 레이블 (예: '한국어', 'English') / Display label (e.g., '한국어', 'English') */
  label: string
  /** 기본 언어 여부 / Whether this is the primary language */
  isPrimary?: boolean
  /** 플래그 이모지 (선택사항) / Flag emoji (optional) */
  flag?: string
}

/**
 * 블로그 에디터 데이터 / Blog editor data
 */
export interface BlogEditorData {
  /** URL 슬러그 / URL slug */
  slug: string
  /** 다국어 제목 / Multilingual title */
  title: MultilingualField
  /** 다국어 요약 / Multilingual excerpt */
  excerpt: MultilingualField
  /** 다국어 본문 / Multilingual content */
  content: MultilingualField
  /** 태그 목록 / Tag list */
  tags: string[]
  /** 커버 이미지 URL / Cover image URL */
  coverImage: string
  /** 발행 일시 / Publish date */
  publishedAt: string | null
  /** 만료 일시 (공지사항용) / Expiry date (for announcements) */
  expiresAt?: string | null
}

/**
 * 블로그 에디터 레이블 (i18n) / Blog editor labels (i18n)
 */
export interface BlogEditorLabels {
  // Header
  pageTitle: string
  editTitle: string
  preview: string
  editMode: string

  // Metadata
  basicInfo: string
  slug: string
  slugPrefix: string
  tags: string
  tagsPlaceholder: string
  coverImage: string
  coverImagePlaceholder: string
  publishDate: string
  publishDateHint: string
  expiresAt: string
  expiresAtHint: string

  // Content
  titleLabel: string
  titlePlaceholder: string
  excerpt: string
  excerptPlaceholder: string
  contentLabel: string
  contentPlaceholder: string

  // Actions
  cancel: string
  saveDraft: string
  publish: string
  update: string
  saving: string

  // Translation
  translateHint: string
  translateButton: string
  translating: string
  translateSuccess: string

  // Errors
  requiredFields: string
  saveError: string
  translateError: string
  noTitle: string

  // Toolbar
  bold: string
  italic: string
  strikethrough: string
  heading: string
  link: string
  image: string
  code: string
  codeBlock: string
  quote: string
  list: string
  orderedList: string
  horizontalRule: string
}

/**
 * 블로그 에디터 기능 토글 / Blog editor feature toggles
 */
export interface BlogEditorFeatures {
  /** 슬러그 입력 활성화 / Enable slug input */
  enableSlug?: boolean
  /** 태그 입력 활성화 / Enable tags input */
  enableTags?: boolean
  /** 커버 이미지 입력 활성화 / Enable cover image input */
  enableCoverImage?: boolean
  /** 발행 일시 입력 활성화 / Enable publish date input */
  enablePublishDate?: boolean
  /** 요약 입력 활성화 / Enable excerpt input */
  enableExcerpt?: boolean
  /** AI 번역 활성화 / Enable AI translation */
  enableTranslation?: boolean
  /** 미리보기 활성화 / Enable preview */
  enablePreview?: boolean
  /** 마크다운 툴바 활성화 / Enable markdown toolbar */
  enableMarkdownToolbar?: boolean
  /** 자동저장 활성화 / Enable auto-save */
  enableAutoSave?: boolean
  /** 만료일 입력 활성화 (공지사항용) / Enable expiry date input (for announcements) */
  enableExpiresAt?: boolean
}

/**
 * 번역 콜백 파라미터 / Translation callback parameters
 */
export interface TranslateParams {
  /** 원본 언어 키 / Source language key */
  sourceLanguage: string
  /** 제목 / Title */
  title: string
  /** 본문 / Content */
  content: string
  /** 요약 (선택사항) / Excerpt (optional) */
  excerpt?: string
}

/**
 * 블로그 에디터 콜백 / Blog editor callbacks
 */
export interface BlogEditorCallbacks {
  /** 저장 콜백 / Save callback */
  onSave: (data: BlogEditorData, publish: boolean) => Promise<void>
  /** 번역 콜백 (선택사항) / Translate callback (optional) */
  onTranslate?: (params: TranslateParams) => Promise<MultilingualField>
  /** 이미지 업로드 콜백 (선택사항) / Image upload callback (optional) */
  onUploadImage?: (file: File) => Promise<string>
  /** 취소 콜백 (선택사항) / Cancel callback (optional) */
  onCancel?: () => void
}

/**
 * 블로그 에디터 Props / Blog editor props
 */
export interface BlogEditorProps {
  // Data
  /** 초기 데이터 / Initial data */
  initialData?: Partial<BlogEditorData>
  /** 수정 모드 여부 / Whether in edit mode */
  isEditMode?: boolean

  // Languages
  /** 지원 언어 목록 / Supported languages */
  languages?: LanguageConfig[]
  /** 기본 언어 키 / Default language key */
  defaultLanguage?: string

  // Labels (i18n)
  /** 레이블 (i18n) / Labels (i18n) */
  labels?: Partial<BlogEditorLabels>

  // Callbacks
  /** 콜백 함수들 / Callback functions */
  callbacks: BlogEditorCallbacks

  // Feature toggles
  /** 기능 토글 / Feature toggles */
  features?: BlogEditorFeatures

  // Styling
  /** 스타일 변형 / Style variant */
  variant?: 'default' | 'glass' | 'minimal'
  /** 추가 CSS 클래스 / Additional CSS classes */
  className?: string

  // Auto-save
  /** 자동저장 키 (localStorage) / Auto-save key for localStorage */
  autoSaveKey?: string
  /** 자동저장 간격 (ms, 기본 3000) / Auto-save interval in ms (default 3000) */
  autoSaveInterval?: number
}

/**
 * 블로그 에디터 컨텍스트 값 / Blog editor context value
 */
export interface BlogEditorContextValue {
  // State
  formData: BlogEditorData
  activeLanguage: string
  showPreview: boolean
  submitting: boolean
  translating: boolean
  error: string | null
  translateSuccess: boolean
  autoSaveStatus: 'idle' | 'saving' | 'saved'

  // Config
  languages: LanguageConfig[]
  features: Required<BlogEditorFeatures>
  labels: BlogEditorLabels
  variant: 'default' | 'glass' | 'minimal'
  isEditMode: boolean

  // Actions
  setActiveLanguage: (lang: string) => void
  setShowPreview: (show: boolean) => void
  updateField: <K extends keyof BlogEditorData>(field: K, value: BlogEditorData[K]) => void
  updateMultilingualField: (field: 'title' | 'excerpt' | 'content', language: string, value: string) => void
  handleSave: (publish: boolean) => Promise<void>
  handleTranslate: () => Promise<void>
  handleUploadImage: (file: File) => Promise<string | null>
  handleCancel: () => void
  setError: (error: string | null) => void
  generateSlug: (title: string) => string
  uploading: boolean
}

/**
 * 마크다운 툴바 아이템 / Markdown toolbar item
 */
export interface ToolbarItem {
  /** 아이콘 이름 / Icon name */
  icon: string
  /** 레이블 / Label */
  label: string
  /** 삽입할 마크다운 / Markdown to insert */
  markdown: {
    before: string
    after: string
  }
  /** 단축키 (선택사항) / Keyboard shortcut (optional) */
  shortcut?: string
}
