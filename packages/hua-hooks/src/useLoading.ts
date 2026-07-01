import { useState, useCallback, useEffect, useRef } from "react";

export interface UseLoadingOptions {
  initialLoading?: boolean;
  delay?: number;
}

export interface UseLoadingReturn {
  isLoading: boolean;
  loadingMessage: string;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  withLoading: <T>(asyncFn: () => Promise<T>, message?: string) => Promise<T>;
}

/**
 * 로딩 상태를 관리하는 훅
 */
export function useLoading(options: UseLoadingOptions = {}): UseLoadingReturn {
  const { initialLoading = false, delay = 0 } = options;
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPendingDelay = useCallback(() => {
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
  }, []);

  const startLoading = useCallback(
    (message?: string) => {
      clearPendingDelay();

      if (delay > 0) {
        delayTimerRef.current = setTimeout(() => {
          delayTimerRef.current = null;
          setIsLoading(true);
          if (message) setLoadingMessage(message);
        }, delay);
      } else {
        setIsLoading(true);
        if (message) setLoadingMessage(message);
      }
    },
    [clearPendingDelay, delay],
  );

  const stopLoading = useCallback(() => {
    clearPendingDelay();
    setIsLoading(false);
    setLoadingMessage("");
  }, [clearPendingDelay]);

  useEffect(() => clearPendingDelay, [clearPendingDelay]);

  const withLoading = useCallback(
    async <T>(asyncFn: () => Promise<T>, message?: string): Promise<T> => {
      try {
        startLoading(message);
        const result = await asyncFn();
        return result;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading],
  );

  return {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading,
    withLoading,
  };
}
