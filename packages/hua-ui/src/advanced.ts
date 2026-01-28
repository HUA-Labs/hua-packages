// Advanced Entrypoint
// Aggregates all advanced modules; prefer importing from specific sub-entries when possible.

// Dashboard widgets & data components
export * from './advanced/dashboard';

// Motion components
export * from './advanced/motion';

// Logo component (HUA Labs official branding)
export { Logo } from './advanced/Logo';
export type { LogoProps, LogoVariant, LogoSize } from './advanced/Logo';

// Advanced Specialized components
export { Bookmark } from './components/Bookmark';
export { ChatMessage } from './components/ChatMessage';
export { ComponentLayout } from './components/ComponentLayout';
export { EmotionAnalysis } from './components/EmotionAnalysis';
export { EmotionButton } from './components/EmotionButton';
export { EmotionMeter } from './components/EmotionMeter';
export { EmotionSelector } from './components/EmotionSelector';
export { LanguageToggle } from './components/LanguageToggle';
export { ScrollIndicator } from './components/ScrollIndicator';
export { ScrollProgress } from './components/ScrollProgress';
export { Scrollbar } from './components/scrollbar/scrollbar';
export { FeatureCard } from './components/FeatureCard';
export { HeroSection } from './components/HeroSection';
export { InfoCard } from './components/InfoCard';
export { Timeline } from './components/Timeline';
export type { TimelineProps, TimelineItem, TimelineStatus } from './components/Timeline';

// BlogEditor - 다국어 블로그 에디터
export {
  BlogEditor,
  BlogEditorHeader,
  BlogEditorMetadata,
  BlogEditorLanguageTabs,
  BlogEditorContent,
  BlogEditorToolbar,
  BlogEditorPreview,
  BlogEditorActions,
  BlogEditorTranslate,
  BlogEditorProvider,
  useBlogEditor,
  parseMarkdown,
  stripMarkdown,
  getMarkdownPreview,
  generateSlug,
  isValidSlug,
  normalizeSlug,
} from './components/advanced/blog-editor';
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
  BlogEditorHeaderProps,
  BlogEditorMetadataProps,
  BlogEditorLanguageTabsProps,
  BlogEditorContentProps,
  BlogEditorToolbarProps,
  BlogEditorPreviewProps,
  BlogEditorActionsProps,
  BlogEditorTranslateProps,
} from './components/advanced/blog-editor';
