"use client";

import { useRef, useState, useEffect, useCallback } from "react";

/**
 * useInView 훅의 옵션 / useInView hook options
 * @property {number} [threshold=0] - 뷰포트 진입 임계값 (0-1) / Viewport entry threshold
 * @property {string} [rootMargin="0px"] - 루트 마진 / Root margin
 * @property {boolean} [triggerOnce=false] - 한 번만 트리거 / Trigger only once
 * @property {(entry: IntersectionObserverEntry) => void} [onChange] - 상태 변경 콜백 / State change callback
 */
export interface UseInViewOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
  onChange?: (entry: IntersectionObserverEntry) => void;
}

/**
 * useInView 훅의 반환값 / useInView hook return value
 */
export interface UseInViewReturn<T extends HTMLElement = HTMLElement> {
  ref: React.RefObject<T | null>;
  inView: boolean;
  entry: IntersectionObserverEntry | null;
}

/**
 * useInView 훅 / useInView hook
 *
 * 요소가 뷰포트에 진입했는지 감지하는 훅입니다.
 * 애니메이션 트리거, 레이지 로딩, 무한 스크롤 등에 사용합니다.
 *
 * Hook that detects when an element enters the viewport.
 * Used for animation triggers, lazy loading, infinite scroll, etc.
 *
 * @example
 * // 기본 사용 / Basic usage
 * const { ref, inView } = useInView();
 *
 * return (
 *   <div ref={ref} className={inView ? "animate-in" : "opacity-0"}>
 *     Content
 *   </div>
 * );
 *
 * @example
 * // 한 번만 트리거 / Trigger once
 * const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });
 */
export function useInView<T extends HTMLElement = HTMLElement>(
  options: UseInViewOptions = {}
): UseInViewReturn<T> {
  const {
    threshold = 0,
    rootMargin = "0px",
    triggerOnce = false,
    onChange,
  } = options;

  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const frozenRef = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Skip if already triggered once
    if (triggerOnce && frozenRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isInView = entry.isIntersecting;

        // Handle triggerOnce
        if (triggerOnce && isInView) {
          frozenRef.current = true;
        }

        setInView(isInView);
        setEntry(entry);
        onChange?.(entry);
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, onChange]);

  return { ref, inView, entry };
}

export default useInView;
