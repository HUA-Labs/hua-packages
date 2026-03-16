/**
 * @hua-labs/hua
 *
 * Ship UX faster: UI + motion + i18n, pre-wired.
 * A framework for React product teams.
 */

// Re-export UI components — Atomic Core
// Note: Button and Card are overridden below with branded versions
// Note: useScrollProgress is excluded to avoid conflict with motion-core's version
export {
  // Core
  Button as UIButton,
  Action,
  Input,
  NumberInput,
  Link,
  Icon,
  EmotionIcon,
  StatusIcon,
  LoadingIcon,
  SuccessIcon,
  ErrorIcon,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Modal,
  // Layout
  Container,
  Grid,
  Stack,
  Divider,
  Card as UICard,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  Panel,
  ActionToolbar,
  ComponentLayout,
  // Atomic Data Display
  Badge,
  Progress,
  ProgressSuccess,
  ProgressWarning,
  ProgressError,
  ProgressInfo,
  ProgressGroup,
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonRectangle,
  SkeletonRounded,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonImage,
  SkeletonUserProfile,
  SkeletonList,
  SkeletonTable,
  // Atomic Feedback
  Alert,
  AlertSuccess,
  AlertWarning,
  AlertError,
  AlertInfo,
  ToastProvider,
  useToast,
  useToastSafe,
  LoadingSpinner,
  Tooltip,
  TooltipLight,
  TooltipDark,
  // Atomic Form Elements
  Label,
  Switch,
  Toggle,
  // Theme & Scroll
  ScrollArea,
  ScrollToTop,
  ThemeProvider,
  ThemeToggle,
  useTheme,
  // Icons
  iconCategories,
  emotionIcons,
  statusIcons,
  iconNames,
  iconProviderMapping,
  isValidIconName,
  getIconNameForProvider,
  ICON_ALIASES,
  resolveIconAlias,
  getIconAliases,
  IconProvider,
  useIconContext,
  defaultIconConfig,
  getDefaultStrokeWidth,
  // Utilities
  merge,
  mergeIf,
  mergeMap,
  cn,
  formatRelativeTime,
  Slot,
  composeRefs,
  mergeProps,
  // Style System
  createColorStyles,
  useColorStyles,
  createVariantStyles,
  createSizeStyles,
  createRoundedStyles,
  createShadowStyles,
  createHoverStyles,
  HUA_SPRING_EASING,
  withDarkMode,
  createGradient,
  withOpacity,
  isTextWhite,
  isGradientVariant,
  responsive,
  conditionalClass,
  // Micro Motion
  useMicroMotion,
  getMicroMotionClasses,
  EASING_FUNCTIONS,
  DURATIONS,
  COMPONENT_MOTION_DEFAULTS,
  CSS_MOTION_VARS,
  // Hooks (except useScrollProgress - use motion-core's version)
  useInView,
  useMouse,
  useReducedMotion,
  useWindowSize,
} from "@hua-labs/ui";

// Re-export composite UI components from category subpaths
export {
  Form,
  FormField,
  FormGroup,
  FormControl,
  useFormValidation,
  Checkbox,
  Radio,
  Select,
  SelectOption,
  Slider,
  Textarea,
  DatePicker,
  Upload,
  Autocomplete,
  ColorPicker,
} from "@hua-labs/ui/form";

export {
  Navigation,
  NavigationList,
  NavigationItem,
  NavigationContent,
  Breadcrumb,
  BreadcrumbItem,
  Pagination,
  PaginationOutlined,
  PaginationMinimal,
  PaginationWithInfo,
  PageNavigation,
  PageTransition,
} from "@hua-labs/ui/navigation";

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Dropdown,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
  DropdownMenu,
  DropdownGroup,
  Drawer,
  DrawerHeader,
  DrawerContent,
  DrawerFooter,
  BottomSheet,
  BottomSheetHeader,
  BottomSheetContent,
  ConfirmModal,
} from "@hua-labs/ui/overlay";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  CodeBlock,
  InlineCode,
} from "@hua-labs/ui/data";

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsPills,
  TabsUnderline,
  TabsCards,
  Menu,
  MenuItem,
  MenuSeparator,
  MenuLabel,
  MenuHorizontal,
  MenuVertical,
  MenuCompact,
  ContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
  ContextMenuGroup,
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandSeparator,
  CommandEmpty,
  CommandDialog,
} from "@hua-labs/ui/interactive";

// Re-export advanced UI components (LanguageToggle, Emotion*, Scrollbar, etc.)
// Note: Using explicit exports to avoid naming conflicts with main exports
// Note: Split into sub-entries to avoid pulling @dnd-kit via Kanban chunk
export {
  // Advanced Specialized components
  Bookmark,
  ChatMessage,
  EmotionAnalysis,
  EmotionButton,
  EmotionMeter,
  EmotionSelector,
  LanguageToggle,
  ScrollIndicator,
  ScrollProgress,
  Scrollbar,
  FeatureCard,
  HeroSection,
  InfoCard,
} from "@hua-labs/ui/advanced";

// Dashboard / data-vis components — from semantic subpaths
export {
  // Data & charts
  BarChart,
  MiniBarChart,
  TrendChart,
  YearlyHeatmap,
  StatCard,
  MetricCard,
  SummaryCard,
  ProgressCard,
  QuickActionCard,
  ActivityFeed,
  NotificationCard,
  ProfileCard,
  MembershipBadge,
  DataTable,
  DetailDrawer,
  BreakdownCard,
  EntityList,
  SettlementTimeline,
  DashboardGrid,
  StatsPanel,
  SectionHeader,
} from "@hua-labs/ui/data";

// Feedback components
export { EmptyState } from "@hua-labs/ui/feedback";

// Navigation: Sidebar
export { Sidebar } from "@hua-labs/ui/navigation";

// Interactive: Toolbar + Kanban
export { Toolbar } from "@hua-labs/ui/interactive";

export {
  KanbanBoard,
  KanbanColumn,
  KanbanCard,
  KanbanProvider,
  useKanban,
} from "@hua-labs/ui/interactive/kanban";

// Motion components — dedicated sub-entry
export {
  AdvancedPageTransition,
  usePageTransitionManager,
} from "@hua-labs/ui/advanced/motion";

// Override Button and Card with branded versions for automatic branding
// When branding is configured, these components automatically use branding colors
// When branding is not configured, they work exactly like the original components
export { BrandedButton as Button, BrandedCard as Card } from "./framework";

// Preset Motion Hook (convenience re-export from framework)
export { usePresetMotion } from "./framework";

// Re-export types — from atomic core
export type { ButtonProps } from "@hua-labs/ui";
export type {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardContentProps,
  CardFooterProps,
} from "@hua-labs/ui";
export type { ActionToolbarProps, ActionButton } from "@hua-labs/ui";
export type { ProjectIconName, AllIconName } from "@hua-labs/ui";
export type { IconName } from "@hua-labs/ui";
export type { NumberInputProps } from "@hua-labs/ui";
export type {
  IconProps,
  IconProviderProps,
  IconSet,
  PhosphorWeight,
  IconConfig,
} from "@hua-labs/ui";
export type { ModalProps } from "@hua-labs/ui";
export type { ThemeProviderProps, ThemeProviderState } from "@hua-labs/ui";
export type { ToggleProps } from "@hua-labs/ui";
export type { Toast } from "@hua-labs/ui";
export type { SlotProps } from "@hua-labs/ui";
export type {
  ColorStyleConfig,
  ColorStyles,
  SizeStyles,
  Rounded,
  Shadow,
  HoverEffect,
} from "@hua-labs/ui";
export type {
  MicroMotionConfig,
  MicroMotionPreset,
  MicroMotionState,
} from "@hua-labs/ui";
export type { Color, Size, BaseVariant, ExtendedVariant } from "@hua-labs/ui";
export type {
  UseInViewOptions,
  UseInViewReturn,
  UseScrollProgressOptions,
  UseScrollProgressReturn,
  UseMouseOptions,
  UseMouseReturn,
  UseWindowSizeOptions,
  UseWindowSizeReturn,
} from "@hua-labs/ui";

// Re-export types — from category subpaths
export type {
  FormControlProps,
  ValidationRule,
  ValidationRules,
  ValidationErrors,
} from "@hua-labs/ui/form";
export type { DatePickerProps } from "@hua-labs/ui/form";
export type { UploadProps, UploadedFile } from "@hua-labs/ui/form";
export type { AutocompleteProps, AutocompleteOption } from "@hua-labs/ui/form";
export type { ColorPickerProps } from "@hua-labs/ui/form";
export type {
  BreadcrumbProps,
  BreadcrumbItemProps,
  BreadcrumbItemData,
} from "@hua-labs/ui/navigation";
export type { CodeBlockProps } from "@hua-labs/ui/data";

// Re-export Motion hooks (named exports to avoid CJS export * warnings with Turbopack)
export {
  // Core engine
  MotionEngine,
  motionEngine,
  TransitionEffects,
  transitionEffects,
  // 3-tier abstraction
  useSimplePageMotion,
  usePageMotions,
  useSmartMotion,
  useUnifiedMotion,
  // Basic motion hooks
  useFadeIn,
  useSlideUp,
  useSlideLeft,
  useSlideRight,
  useSlideDown,
  useScaleIn,
  useBounceIn,
  usePulse,
  useSpringMotion,
  useGradient,
  // Interaction hooks
  useHoverMotion,
  useClickToggle,
  useFocusToggle,
  // Scroll hooks
  useScrollReveal,
  useScrollProgress,
  // Utility hooks
  useMotionState,
  useRepeat,
  useToggleMotion,
  // Note: useInView, useMouse, useReducedMotion, useWindowSize are already exported from @hua-labs/ui
  // Gesture hooks
  useGesture,
  useGestureMotion,
  // Advanced interaction hooks
  useTypewriter,
  useCustomCursor,
  useMagneticCursor,
  useSmoothScroll,
  useElementProgress,
  // Advanced interaction / scroll / layout motion (motion-core)
  useButtonEffect,
  useScrollToggle,
  useCardList,
  useLoadingSpinner,
  useNavigation,
  useSkeleton,
  // Stagger
  useStagger,
  // Presets
  MOTION_PRESETS,
  PAGE_MOTIONS,
  mergeWithPreset,
  getPagePreset,
  getMotionPreset,
  // Easing
  linear,
  easeIn,
  easeOut,
  easeInOut,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  getEasing,
  applyEasing,
  safeApplyEasing,
  isValidEasing,
  getAvailableEasings,
  isEasingFunction,
  easingPresets,
  getPresetEasing,
  // Components
  Motion,
} from "@hua-labs/motion-core";
export type {
  MotionFrame,
  MotionOptions,
  Motion as MotionInstance,
  TransitionType,
  TransitionOptions,
  UseUnifiedMotionOptions,
  MotionEffects,
  TypewriterOptions,
  TypewriterReturn,
  CustomCursorOptions,
  CustomCursorReturn,
  MagneticCursorOptions,
  MagneticCursorReturn,
  SmoothScrollOptions,
  SmoothScrollReturn,
  ElementProgressOptions,
  ElementProgressReturn,
  ButtonEffectOptions,
  ScrollToggleOptions,
  CardListOptions,
  LoadingSpinnerOptions,
  NavigationOptions,
  SkeletonOptions,
  UseStaggerOptions,
  UseStaggerReturn,
  EasingFunction,
  EasingType,
  MotionProps,
  PageType,
  MotionType,
  EntranceType,
  PageMotionElement,
  PageMotionsConfig,
  MotionState,
  PageMotionRef,
  BaseMotionOptions,
  BaseMotionReturn,
  MotionElement,
  MotionPreset,
  PresetConfig,
  SpringConfig,
  GestureConfig,
  OrchestrationConfig,
  FadeInOptions,
  SlideOptions,
  ScaleOptions,
  BounceOptions,
  PulseOptions,
  SpringOptions,
  GestureOptions,
  ScrollRevealOptions,
  ScrollRevealMotionType,
  GradientOptions,
  ToggleMotionOptions,
  RepeatOptions,
  HoverMotionOptions,
  InteractionReturn,
  PerformanceMetrics,
  MotionConfig,
  MotionDirection,
  MotionEasing,
  MotionTrigger,
  MotionCallback,
  MotionProgressCallback,
  MotionStateCallback,
} from "@hua-labs/motion-core";

// Re-export i18n core (named exports)
export {
  createCoreI18n,
  CoreProvider,
  createLanguageProvider,
  createNamespaceProvider,
  createCustomLoaderProvider,
  useTranslation,
  useLanguageChange,
  useI18n,
  I18nProvider,
  Translator,
  ssrTranslate,
  serverTranslate,
} from "@hua-labs/i18n-core";
export type {
  I18nConfig,
  I18nContextType,
  TranslationParams,
  TypedTranslationKeys,
  ResolveStringKey,
  ResolveArrayKey,
  ResolvePluralKey,
  PluralValue,
  PluralCategory,
} from "@hua-labs/i18n-core";

// Re-export i18n Zustand adapter (named exports)
export { createZustandI18n, useZustandI18n } from "@hua-labs/i18n-core-zustand";
export type {
  SupportedLanguage,
  ZustandLanguageStore,
  ZustandI18nAdapter,
  ZustandI18nConfig,
} from "@hua-labs/i18n-core-zustand";

// Re-export state management (named exports)
export {
  createHuaStore,
  isStoreRehydrated,
  onStoreRehydrated,
  markStoreRehydrated,
  createI18nStore,
} from "@hua-labs/state";
export type {
  StoreCreator,
  StoreConfig,
  HuaStore,
  BaseStoreState,
  UseBoundStore,
  StoreApi,
  I18nStoreState,
  I18nStoreConfig,
  UseStoreHook,
} from "@hua-labs/state";
