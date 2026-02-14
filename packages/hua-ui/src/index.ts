// ============================================================
// @hua-labs/ui — Atomic Core Exports
//
// 이 파일은 원자(atomic) 컴포넌트만 export합니다.
// 합성(composite) 컴포넌트는 카테고리별 서브경로에서 import하세요:
//
//   @hua-labs/ui/form        — Form, Select, DatePicker, Autocomplete ...
//   @hua-labs/ui/overlay     — Modal, Popover, Dropdown, Drawer, BottomSheet ...
//   @hua-labs/ui/data        — Table, CodeBlock ...
//   @hua-labs/ui/interactive — Accordion, Tabs, Menu, Command ...
//   @hua-labs/ui/navigation  — Navigation, Breadcrumb, Pagination ...
//   @hua-labs/ui/feedback    — Toast, Alert, LoadingSpinner, Tooltip ...
//   @hua-labs/ui/advanced    — Dashboard, Motion, Emotion ...
//
// ============================================================

// ── Core Components ──────────────────────────────────────────
export { Button } from './components/Button';
export type { ButtonProps } from './components/Button';
export { Action } from './components/Action';
export { Input } from './components/Input';
export { NumberInput } from './components/NumberInput';
export type { NumberInputProps } from './components/NumberInput';
export { Link } from './components/Link';
export { Icon, EmotionIcon, StatusIcon, LoadingIcon, SuccessIcon, ErrorIcon } from './components/Icon';
export type { IconProps } from './components/Icon';
export { Avatar, AvatarImage, AvatarFallback } from './components/Avatar';
export { Modal } from './components/Modal';
export type { ModalProps } from './components/Modal';

// ── Layout ───────────────────────────────────────────────────
export { Container } from './components/Container';
export type { ContainerProps } from './components/Container';
export { Section } from './components/Section';
export type { SectionProps, SectionHeaderConfig } from './components/Section';
export { sectionVariants } from './components/Section';
export { Grid } from './components/Grid';
export { Stack } from './components/Stack';
export { Divider } from './components/Divider';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './components/Card';
export type { CardProps, CardHeaderProps, CardTitleProps, CardDescriptionProps, CardContentProps, CardFooterProps } from './components/Card';
export { Panel } from './components/Panel';
export { ActionToolbar } from './components/ActionToolbar';
export type { ActionToolbarProps, ActionButton } from './components/ActionToolbar';
export { ComponentLayout } from './components/ComponentLayout';

// ── Atomic Data Display ─────────────────────────────────────
// Table, CodeBlock → @hua-labs/ui/data
export { Badge } from './components/Badge';
export { Progress, ProgressSuccess, ProgressWarning, ProgressError, ProgressInfo, ProgressGroup } from './components/Progress';
export { Skeleton, SkeletonText, SkeletonCircle, SkeletonRectangle, SkeletonRounded, SkeletonCard, SkeletonAvatar, SkeletonImage, SkeletonUserProfile, SkeletonList, SkeletonTable } from './components/Skeleton';

// ── Atomic Feedback ─────────────────────────────────────────
// Toast also available from @hua-labs/ui/feedback
export { Alert, AlertSuccess, AlertWarning, AlertError, AlertInfo } from './components/Alert';
export { ToastProvider, useToast, useToastSafe } from './components/Toast';
export type { Toast } from './components/Toast';
export { LoadingSpinner } from './components/LoadingSpinner';
export { Tooltip, TooltipLight, TooltipDark } from './components/Tooltip';

// ── Atomic Form Elements ────────────────────────────────────
// Form, FormControl, Select, DatePicker, etc. → @hua-labs/ui/form
export { Label } from './components/Label';
export { Switch } from './components/Switch';
export { Toggle } from './components/Toggle';
export type { ToggleProps } from './components/Toggle';

// ── Theme & Scroll ──────────────────────────────────────────
export { ScrollArea } from './components/ScrollArea';
export { ScrollToTop } from './components/ScrollToTop';
export { ThemeProvider } from './components/ThemeProvider';
export type { ThemeProviderProps, ThemeProviderState } from './components/ThemeProvider';
export { ThemeToggle } from './components/ThemeToggle';
export { useTheme } from './components/ThemeProvider';

// ── Icons & Types ───────────────────────────────────────────
export { iconCategories, emotionIcons, statusIcons } from './lib/icons';
export type { IconName } from './lib/icons';
export { iconNames, iconProviderMapping, isValidIconName, getIconNameForProvider } from './lib/icon-names';
export type { ProjectIconName, AllIconName } from './lib/icon-names';
export { ICON_ALIASES, resolveIconAlias, getIconAliases } from './lib/icon-aliases';
export { IconProvider, useIconContext } from './components/Icon';
export type { IconProviderProps } from './components/Icon';
export type { IconSet, PhosphorWeight, IconConfig } from './components/Icon';
export { defaultIconConfig, getDefaultStrokeWidth } from './components/Icon';
// Iconsax: import from '@hua-labs/ui/iconsax' instead

// ── Utilities ───────────────────────────────────────────────
export { merge, mergeIf, mergeMap, cn, formatRelativeTime } from './lib/utils';
export { Slot, composeRefs, mergeProps } from './lib/Slot';
export type { SlotProps } from './lib/Slot';

// ── Style System ────────────────────────────────────────────
export {
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
} from './lib/styles';
export type {
  ColorStyleConfig,
  ColorStyles,
  SizeStyles,
  Rounded,
  Shadow,
  HoverEffect,
} from './lib/styles';

// ── Micro Motion System ─────────────────────────────────────
export { useMicroMotion, getMicroMotionClasses } from './lib/motion';
export type { MicroMotionConfig, MicroMotionPreset, MicroMotionState } from './lib/motion';
export { EASING_FUNCTIONS, DURATIONS, COMPONENT_MOTION_DEFAULTS, CSS_MOTION_VARS } from './lib/motion';

// ── Common Types ────────────────────────────────────────────
export type { Color, Size, BaseVariant, ExtendedVariant } from './lib/types/common';

// ── Hooks ───────────────────────────────────────────────────
export {
  useInView,
  useScrollProgress,
  useMouse,
  useReducedMotion,
  useWindowSize,
} from './hooks';
export type {
  UseInViewOptions,
  UseInViewReturn,
  UseScrollProgressOptions,
  UseScrollProgressReturn,
  UseMouseOptions,
  UseMouseReturn,
  UseWindowSizeOptions,
  UseWindowSizeReturn,
} from './hooks';
