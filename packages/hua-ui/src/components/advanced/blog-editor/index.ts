// BlogEditor - 다국어 블로그 에디터 컴포넌트
// Multilingual blog editor component

// Main component
export { BlogEditor } from './BlogEditor'

// Sub-components
export {
  BlogEditorHeader,
  BlogEditorMetadata,
  BlogEditorLanguageTabs,
  BlogEditorContent,
  BlogEditorToolbar,
  BlogEditorPreview,
  BlogEditorActions,
  BlogEditorTranslate,
} from './BlogEditor'

// Context
export { BlogEditorProvider, useBlogEditor } from './BlogEditorContext'

// Utils
export { parseMarkdown, stripMarkdown, getMarkdownPreview, insertMarkdown } from './utils/markdown'
export { generateSlug, isValidSlug, normalizeSlug } from './utils/slug'

// Types
export type {
  BlogEditorProps,
  BlogEditorData,
  BlogEditorLabels,
  BlogEditorFeatures,
  BlogEditorCallbacks,
  BlogEditorContextValue,
  LanguageConfig,
  MultilingualField,
  TranslateParams,
  ToolbarItem,
} from './types'

export type {
  BlogEditorHeaderProps,
  BlogEditorMetadataProps,
  BlogEditorLanguageTabsProps,
  BlogEditorContentProps,
  BlogEditorToolbarProps,
  BlogEditorPreviewProps,
  BlogEditorActionsProps,
  BlogEditorTranslateProps,
} from './BlogEditor'
