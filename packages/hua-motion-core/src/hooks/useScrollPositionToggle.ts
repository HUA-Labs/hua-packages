import { useState, useEffect } from "react";

export interface ScrollPositionToggleConfig {
  threshold?: number;
  showOnMount?: boolean;
  smooth?: boolean;
}

/**
 * window.pageYOffset 기준 스크롤 위치 임계값에 따라 가시성을 토글하는 훅.
 * (구 hua-pro의 useScrollToggle — animation lifecycle 기반의
 * motion-core useScrollToggle과 충돌을 피해 이름을 변경함)
 */
export function useScrollPositionToggle(
  options: ScrollPositionToggleConfig = {},
) {
  const { threshold = 400, showOnMount = false, smooth = true } = options;

  const [isVisible, setIsVisible] = useState(showOnMount);
  const [mounted, setMounted] = useState(false);

  // 하이드레이션 이슈 해결을 위한 mounted 상태 관리
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const toggleVisibility = () => {
      if (typeof window !== "undefined") {
        if (window.pageYOffset > threshold) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }
    };

    // 초기 상태 확인
    toggleVisibility();

    // 이벤트 리스너 등록
    window.addEventListener("scroll", toggleVisibility, { passive: true });
    window.addEventListener("resize", toggleVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
      window.removeEventListener("resize", toggleVisibility);
    };
  }, [threshold, mounted]);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      if (smooth) {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } else {
        window.scrollTo(0, 0);
      }
    }
  };

  return {
    isVisible,
    scrollToTop,
    mounted,
  };
}
