/**
 * @hua-labs/hua/framework - ErrorBoundary
 *
 * React Error Boundary component for catching and handling errors
 */

'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { createLogger } from '../../utils/logger';

const log = createLogger('hua:error-boundary');

/**
 * Global error reporter interface
 * 
 * 프로덕션 환경에서 에러 리포팅 서비스(Sentry, LogRocket 등)와 통합하기 위한 인터페이스
 * Interface for integrating with error reporting services (Sentry, LogRocket, etc.) in production
 * 
 * @example
 * ```ts
 * // Sentry 통합 예시
 * window.__ERROR_REPORTER__ = (error, errorInfo) => {
 *   Sentry.captureException(error, {
 *     contexts: { react: errorInfo },
 *   });
 * };
 * ```
 */
declare global {
  interface Window {
    __ERROR_REPORTER__?: (error: Error, errorInfo: ErrorInfo) => void;
  }
}

/**
 * Error Boundary Props
 */
export interface ErrorBoundaryProps {
  /**
   * Children to render
   */
  children: ReactNode;

  /**
   * Fallback UI to show when error occurs
   * Can be a ReactNode or a function that receives error and reset callback
   */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);

  /**
   * Callback when error is caught
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;

  /**
   * Custom error filter - return true to catch, false to rethrow
   */
  onReset?: () => void;
}

/**
 * Error Boundary State
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Default fallback UI
 */
function DefaultFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div
      role="alert"
      style={{
        padding: '2rem',
        margin: '2rem auto',
        maxWidth: '600px',
        border: '1px solid #ef4444',
        borderRadius: '0.5rem',
        backgroundColor: '#fef2f2',
        color: '#991b1b',
      }}
    >
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        ⚠️ 오류가 발생했습니다 / An error occurred
      </h2>
      <details style={{ marginBottom: '1rem' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 500 }}>
          에러 상세 정보 / Error details
        </summary>
        <pre
          style={{
            marginTop: '0.5rem',
            padding: '1rem',
            backgroundColor: '#fee2e2',
            borderRadius: '0.25rem',
            overflow: 'auto',
            fontSize: '0.875rem',
          }}
        >
          {error.message}
        </pre>
      </details>
      <button
        onClick={reset}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: '0.25rem',
          cursor: 'pointer',
          fontWeight: 500,
        }}
      >
        🔄 다시 시도 / Try again
      </button>
    </div>
  );
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 *
 * @example
 * ```tsx
 * <ErrorBoundary fallback={<div>Something went wrong</div>}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={(error, reset) => (
 *     <div>
 *       <h1>Error: {error.message}</h1>
 *       <button onClick={reset}>Try again</button>
 *     </div>
 *   )}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 개발 모드: 콘솔에 에러 로그
    // Development mode: Log error to console
    if (process.env.NODE_ENV === 'development') {
      log.error('Caught error', { error: String(error), stack: error.stack });
      log.error('Error info', { componentStack: errorInfo.componentStack });
    }

    // 프로덕션 모드: 에러 리포팅 서비스 통합 (선택적)
    // Production mode: Integrate with error reporting service (optional)
    if (process.env.NODE_ENV === 'production') {
      // 전역 에러 리포터가 설정되어 있으면 사용
      // Use global error reporter if configured
      if (typeof window !== 'undefined' && window.__ERROR_REPORTER__) {
        try {
          window.__ERROR_REPORTER__(error, errorInfo);
        } catch (reportingError) {
          // 에러 리포팅 자체가 실패해도 앱은 계속 동작해야 함
          // App should continue working even if error reporting fails
          log.error('Error reporting failed', { reportingError: String(reportingError) });
        }
      }
    }

    // Call onError callback if provided
    this.props.onError?.(error, errorInfo);
  }

  reset = (): void => {
    // Call onReset callback if provided
    this.props.onReset?.();

    // Reset error state
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Render fallback UI
      const { fallback } = this.props;

      if (typeof fallback === 'function') {
        return fallback(this.state.error, this.reset);
      }

      if (fallback) {
        return fallback;
      }

      // Default fallback
      return <DefaultFallback error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}
