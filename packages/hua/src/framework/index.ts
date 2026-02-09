/**
 * @hua-labs/hua/framework
 *
 * Framework layer for hua — client entry point.
 */

'use client';

// Shared (backward-compatible re-export)
export * from './shared';

// Components
export { HuaProvider } from './components/HuaProvider';
export { HuaPage } from './components/HuaPage';
export { UnifiedProviders } from './components/Providers';
export { BrandedButton } from './components/BrandedButton';
export { BrandedCard } from './components/BrandedCard';
export { WelcomePage } from './components/WelcomePage';
export type { WelcomePageProps } from './components/WelcomePage';
export { ErrorBoundary } from './components/ErrorBoundary';
export type { ErrorBoundaryProps } from './components/ErrorBoundary';

// Configuration (Client-safe only)
export { defineConfig, getConfig, setConfig, resetConfig } from './config';

// Data Fetching
export { useData, fetchData } from './utils/data-fetching';
export type { DataFetchResult } from './utils/data-fetching';

// License System (runtime)
export {
  initLicense,
  getLicense,
  checkLicense,
  hasLicense,
  requireLicense,
} from './license';

// Plugin System (runtime)
export {
  pluginRegistry,
  registerPlugin,
  getPlugin,
  getAllPlugins,
} from './plugins';

// Branding (interactive)
export { BrandingProvider, useBranding, useBrandingColor } from './branding/context';

// Accessibility (a11y)
export {
  useFocusManagement,
  useFocusTrap,
  SkipToContent,
  LiveRegion,
  useLiveRegion,
} from './a11y';
export type {
  FocusManagementOptions,
  FocusTrapOptions,
  SkipToContentProps,
  LiveRegionProps,
} from './a11y';

// Loading
export {
  useDelayedLoading,
  useLoadingState,
  Skeleton,
  SkeletonGroup,
  SuspenseWrapper,
  withSuspense,
} from './loading';
export type {
  DelayedLoadingOptions,
  SkeletonGroupProps,
  SuspenseWrapperProps,
} from './loading';

// Motion Hooks (Core)
export { useMotion, useMotion as useUnifiedMotion } from './hooks/useMotion';
export type { MotionType, UseMotionOptions } from './hooks/useMotion';

// Core Motion Hooks (from motion-core)
export {
  useFadeIn,
  useSlideUp,
  useSlideLeft,
  useSlideRight,
  useScaleIn,
  useBounceIn,
  usePulse,
  useSpringMotion,
  useGradient,
  useHoverMotion,
  useClickToggle,
  useFocusToggle,
  useScrollReveal,
  useScrollProgress,
  useMotionState,
  useRepeat,
  useToggleMotion,
  useGesture,
  useGestureMotion,
} from '@hua-labs/motion-core';
