import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { BounceOptions, EntranceMotionReturn, MotionElement } from "../types";
import { useMotionProfile } from "../profiles/MotionProfileContext";
import { observeElement } from "../utils/sharedIntersectionObserver";

export function useBounceIn<T extends MotionElement = HTMLDivElement>(
  options: BounceOptions = {},
): EntranceMotionReturn<T> {
  const profile = useMotionProfile();
  const {
    duration = 600,
    delay = 0,
    autoStart = true,
    intensity = profile.entrance.bounce.intensity,
    threshold = profile.base.threshold,
    triggerOnce = profile.base.triggerOnce,
    easing = profile.entrance.bounce.easing,
    onComplete,
    onStart,
    onStop,
    onReset,
  } = options;

  const ref = useRef<T>(null);
  const [scale, setScale] = useState(autoStart ? 0 : 1);
  const [opacity, setOpacity] = useState(autoStart ? 0 : 1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(autoStart ? false : true);
  const [progress, setProgress] = useState(autoStart ? 0 : 1);

  const timeoutRef = useRef<number | null>(null);
  const bounceTimeoutRef = useRef<number | null>(null);
  const startRef = useRef<() => void>(() => {});

  // 모션 시작 함수
  const start = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    setScale(0);
    setOpacity(0);
    setProgress(0);
    onStart?.();

    // delay 후 바운스 시작
    timeoutRef.current = window.setTimeout(() => {
      setProgress(0.5);
      setScale(1 + intensity);
      setOpacity(1);

      // 바운스 후 안정화
      bounceTimeoutRef.current = window.setTimeout(() => {
        setProgress(1);
        setScale(1);
        setIsVisible(true);
        setIsAnimating(false);
        onComplete?.();
      }, duration * 0.3); // 바운스 지속시간
    }, delay);
  }, [delay, intensity, duration, isAnimating, onStart, onComplete]);

  // startRef 업데이트 (IntersectionObserver에서 안정적인 참조 사용)
  startRef.current = start;

  // 모션 중단 함수
  const stop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (bounceTimeoutRef.current) {
      clearTimeout(bounceTimeoutRef.current);
      bounceTimeoutRef.current = null;
    }
    setIsAnimating(false);
    onStop?.();
  }, [onStop]);

  // 모션 리셋 함수
  const reset = useCallback(() => {
    stop();
    setScale(0);
    setOpacity(0);
    setProgress(0);
    setIsVisible(false);

    // DOM 요소가 있다면 즉시 스타일 적용
    if (ref.current) {
      const element = ref.current;
      element.style.transition = "none";
      element.style.opacity = "0";
      element.style.transform = "scale(0)";

      // 다음 프레임에서 transition 복원
      requestAnimationFrame(() => {
        element.style.transition = "";
      });
    }
    onReset?.();
  }, [stop, onReset]);

  // 모션 일시정지 함수 (no-op: CSS transition은 JS pause 미지원)
  const pause = useCallback(() => {}, []);

  // 모션 재개 함수 (no-op: CSS transition은 JS resume 미지원)
  const resume = useCallback(() => {}, []);

  // IntersectionObserver 설정 (공유 observer pool 사용)
  useEffect(() => {
    if (!ref.current || !autoStart) return;
    return observeElement(
      ref.current,
      (entry) => {
        if (entry.isIntersecting) startRef.current();
      },
      { threshold },
      triggerOnce,
    );
  }, [autoStart, threshold, triggerOnce]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  // 스타일 계산 - 메모이제이션으로 불필요한 리렌더링 방지
  const style = useMemo(
    () =>
      ({
        transform: `scale(${scale})`,
        opacity,
        transition: `all ${duration}ms ${easing}`,
        "--motion-delay": `${delay}ms`,
        "--motion-duration": `${duration}ms`,
        "--motion-easing": easing,
        "--motion-progress": `${progress}`,
      }) as const,
    [scale, opacity, duration, easing, delay, progress],
  );

  return {
    ref,
    isVisible,
    isAnimating,
    style,
    progress,
    start,
    reset,
    stop,
    pause,
    resume,
  };
}
