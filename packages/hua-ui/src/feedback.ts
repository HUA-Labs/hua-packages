/**
 * Feedback Components Entrypoint
 * 
 * 피드백 관련 컴포넌트들을 모아서 export하는 엔트리 포인트입니다.
 * 글로벌 상태 관리가 필요한 Toast 컴포넌트만 포함합니다.
 * 
 * Entry point that aggregates feedback-related components.
 * Includes Toast component that requires global state management.
 * 
 * @example
 * // Toast 컴포넌트만 import / Import only Toast components
 * import { ToastProvider, useToast } from '@hua-labs/ui/feedback';
 * import '@hua-labs/ui/styles/toast.css';
 * 
 * @example
 * // Core에서도 여전히 사용 가능 (하위 호환성) / Still available from core (backward compatibility)
 * import { ToastProvider, useToast } from '@hua-labs/ui';
 */

// Toast components
export { ToastProvider, useToast } from './components/Toast';
export type { Toast } from './components/Toast';

// Note: Alert, LoadingSpinner, Tooltip remain in Core
// as they are frequently used and don't require global state management.

