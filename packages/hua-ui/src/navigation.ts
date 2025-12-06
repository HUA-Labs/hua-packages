/**
 * Navigation Components Entrypoint
 * 
 * 네비게이션 관련 컴포넌트들을 모아서 export하는 엔트리 포인트입니다.
 * 대규모 앱 구조에 필요한 네비게이션 컴포넌트만 포함합니다.
 * 
 * Entry point that aggregates navigation-related components.
 * Includes navigation components needed for large-scale app structures.
 * 
 * @example
 * // 네비게이션 컴포넌트만 import / Import only navigation components
 * import { PageNavigation, PageTransition } from '@hua-labs/ui/navigation';
 * 
 * @example
 * // Core에서도 여전히 사용 가능 (하위 호환성) / Still available from core (backward compatibility)
 * import { PageNavigation, PageTransition } from '@hua-labs/ui';
 */

// Navigation components
export { PageNavigation } from './components/PageNavigation';
export type { PageNavigationProps } from './components/PageNavigation';

export { PageTransition } from './components/PageTransition';
export type { PageTransitionProps } from './components/PageTransition';

// Note: Breadcrumb, Pagination, Navigation (basic) remain in Core
// as they are frequently used in general applications.

