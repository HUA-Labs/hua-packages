/**
 * @hua-labs/hua/framework - useDelayedLoading
 * 
 * 빠른 API 응답 시 로딩 UI 깜빡임을 방지하는 hook
 * Prevents loading UI flicker for fast API responses
 */

'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Delayed Loading 옵션
 */
export interface DelayedLoadingOptions {
  /**
   * 로딩 UI를 표시하기 전 대기 시간 (밀리초)
   * Delay before showing loading UI (milliseconds)
   * 
   * @default 300
   */
  delay?: number;
  
  /**
   * 최소 표시 시간 (밀리초) - 로딩이 너무 빨리 끝나도 최소한 이 시간은 표시
   * Minimum display time (milliseconds) - show loading for at least this duration
   * 
   * @default 0
   */
  minDisplayTime?: number;
}

/**
 * useDelayedLoading Hook
 * 
 * 빠른 API 응답 시 로딩 UI가 깜빡거리는 것을 방지합니다.
 * 300ms 이하로 끝나면 로딩 UI를 아예 표시하지 않습니다.
 * 
 * Prevents loading UI flicker for fast API responses.
 * If loading completes within 300ms, the loading UI is not shown at all.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [isLoading, setIsLoading] = useState(false);
 *   const showLoading = useDelayedLoading(isLoading);
 * 
 *   const fetchData = async () => {
 *     setIsLoading(true);
 *     await api.getData(); // 빠르게 끝나면 로딩 UI 안보임
 *     setIsLoading(false);
 *   };
 * 
 *   return showLoading ? <Spinner /> : <Content />;
 * }
 * ```
 * 
 * @param isLoading - 현재 로딩 상태
 * @param options - 옵션
 * @returns 실제로 로딩 UI를 표시할지 여부
 */
export function useDelayedLoading(
  isLoading: boolean,
  options: DelayedLoadingOptions = {}
): boolean {
  const { delay = 300, minDisplayTime = 0 } = options;
  const [showLoading, setShowLoading] = useState(false);
  const loadingStartTimeRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 이전 timeout 정리 (race condition 방지)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (isLoading) {
      // 로딩 시작 시간 기록
      const startTime = Date.now();
      loadingStartTimeRef.current = startTime;

      // delay 후에 로딩 UI 표시
      timeoutRef.current = setTimeout(() => {
        // timeout이 여전히 유효한지 확인 (race condition 방지)
        if (timeoutRef.current) {
          setShowLoading(true);
          timeoutRef.current = null;
        }
      }, delay);
    } else {
      // 로딩이 끝났을 때
      if (loadingStartTimeRef.current !== null) {
        const elapsedTime = Date.now() - loadingStartTimeRef.current;
        const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

        if (remainingTime > 0) {
          // 최소 표시 시간이 남아있으면 그 시간만큼 더 표시
          timeoutRef.current = setTimeout(() => {
            // timeout이 여전히 유효한지 확인 (race condition 방지)
            if (timeoutRef.current) {
              setShowLoading(false);
              loadingStartTimeRef.current = null;
              timeoutRef.current = null;
            }
          }, remainingTime);
        } else {
          // 이미 최소 표시 시간을 넘었으면 즉시 숨김
          setShowLoading(false);
          loadingStartTimeRef.current = null;
        }
      } else {
        // 로딩이 시작되지 않았으면 즉시 숨김
        setShowLoading(false);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isLoading, delay, minDisplayTime]);

  return showLoading;
}
