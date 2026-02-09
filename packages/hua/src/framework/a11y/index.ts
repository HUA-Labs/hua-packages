/**
 * @hua-labs/hua/framework - Accessibility (a11y)
 * 
 * WCAG 2.1 준수를 위한 접근성 도구 모음
 * Accessibility tools for WCAG 2.1 compliance
 */

export { useFocusManagement } from './hooks/useFocusManagement';
export { useFocusTrap } from './hooks/useFocusTrap';
export { SkipToContent } from './components/SkipToContent';
export { LiveRegion } from './components/LiveRegion';
export { useLiveRegion } from './hooks/useLiveRegion';

export type { FocusManagementOptions } from './hooks/useFocusManagement';
export type { FocusTrapOptions } from './hooks/useFocusTrap';
export type { SkipToContentProps } from './components/SkipToContent';
export type { LiveRegionProps } from './components/LiveRegion';
