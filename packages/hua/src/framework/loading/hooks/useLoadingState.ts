/**
 * @hua-labs/hua/framework - useLoadingState
 * 
 * 로딩 상태를 관리하는 편의성 hook
 * Convenience hook for managing loading state
 */

'use client';

import { useCallback, useState } from 'react';
import { useDelayedLoading, type DelayedLoadingOptions } from './useDelayedLoading';

/**
 * useLoadingState 반환 타입
 */
export interface UseLoadingStateReturn {
  /**
   * 실제로 로딩 UI를 표시할지 여부 (useDelayedLoading 적용)
   * Whether to actually show loading UI (with useDelayedLoading applied)
   */
  showLoading: boolean;
  
  /**
   * 로딩 시작
   * Start loading
   */
  startLoading: () => void;
  
  /**
   * 로딩 종료
   * Stop loading
   */
  stopLoading: () => void;
  
  /**
   * 로딩 상태 토글
   * Toggle loading state
   */
  toggleLoading: () => void;
  
  /**
   * 현재 로딩 상태 (지연 없이)
   * Current loading state (without delay)
   */
  isLoading: boolean;
}

/**
 * useLoadingState Hook
 * 
 * 로딩 상태를 쉽게 관리할 수 있는 편의성 hook입니다.
 * useDelayedLoading이 자동으로 적용됩니다.
 * 
 * Convenience hook for easily managing loading state.
 * useDelayedLoading is automatically applied.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { showLoading, startLoading, stopLoading } = useLoadingState();
 * 
 *   const fetchData = async () => {
 *     startLoading();
 *     try {
 *       await api.getData();
 *     } finally {
 *       stopLoading();
 *     }
 *   };
 * 
 *   return showLoading && <Spinner />;
 * }
 * ```
 * 
 * @param options - useDelayedLoading 옵션
 * @returns 로딩 상태 제어 함수
 */
export function useLoadingState(
  options: DelayedLoadingOptions = {}
): UseLoadingStateReturn {
  const [isLoading, setIsLoading] = useState(false);
  const showLoading = useDelayedLoading(isLoading, options);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const toggleLoading = useCallback(() => {
    setIsLoading((prev) => !prev);
  }, []);

  return {
    showLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    isLoading,
  };
}
